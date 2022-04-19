import React from 'react'
import { formatEther, parseEther } from '@ethersproject/units'
import { BigNumber } from 'ethers'
import { Formik, Form, Field } from 'formik'

import DashboardCard from './DashboardCard'
import Selector from './Selector'

import useUserAddress from '../hooks/useUserAddress'
import useUserSigner from '../hooks/useUserSigner'
import useExternalContractLoader from '../hooks/useExternalContractLoader'
import useTransaction, { notify } from '../hooks/useTransaction'
import useGlobalState from '../hooks/useGlobalState'

import StArbisAddress2 from '../contracts/StArbis2.address'
import StArbisAbi from '../contracts/StArbis.abi'
import ERC20Abi from '../contracts/ERC20.abi'

const wETH = '0x82af49447d8a07e3bd95bd0d56f35241523fbab1'
// const Z2O = '0xdb96f8efd6865644993505318cc08ff9c42fb9ac'
const cheems = '0x75a2f30929c539e7d4ee033c9331b89f879c0cf7'
const umami = '0x1622bF67e6e5747b81866fE0b85178a93C7F86e3'

const farmAddress = StArbisAddress2

export default function StArbisFarm() {
  const initState: {
    status: string
    tokenAddress: null | string
    tokenBalance: null | string | number
    tokenSymbol: null | string | number
    tokenTotalSupply: null | string | number
    isApproved: boolean
    name: null | string | number
    symbol: null | string | number
    totalDeposits: null | string | number
    shareBalance: null | string | number
    availableWETH: null | string | number
    availableARBIS: null | string | number
    avaiableCheems: null | string | number
    avaiableUmami: null | string | number
  } = {
    status: 'idle',
    tokenAddress: null,
    tokenBalance: null,
    tokenSymbol: null,
    tokenTotalSupply: null,
    isApproved: false,
    name: null,
    symbol: null,
    totalDeposits: null,
    shareBalance: null,
    availableWETH: null,
    availableARBIS: null,
    avaiableCheems: null,
    avaiableUmami: null,
  }
  const [state, dispatch] = React.useReducer(
    (
      state: typeof initState,
      action:
        | { type: 'started'; payload?: null }
        | { type: 'error'; payload?: null }
        | { type: 'tokenAddress'; payload: { tokenAddress: string } }
        | {
            type: 'success'
            payload: {
              tokenAddress: null | string
              tokenBalance: null | string | number
              tokenSymbol: null | string | number
              tokenTotalSupply: null | string | number
              isApproved: boolean
              name: null | string | number
              symbol: null | string | number
              totalDeposits: null | string | number
              shareBalance: null | string | number
              availableWETH: null | string | number
              availableARBIS: null | string | number
              avaiableCheems: null | string | number
              avaiableUmami: null | string | number
            }
          }
    ) => {
      switch (action.type) {
        case 'started':
          return { ...state, status: 'pending' }
        case 'error':
          return { ...state, status: 'rejected' }
        case 'tokenAddress':
          return { ...state, tokenAddress: action.payload.tokenAddress }
        case 'success':
          return { ...state, status: 'resolved', ...action.payload }
        default:
          throw new Error(
            'unsupported action type given on StArbisFarm reducer'
          )
      }
    },
    initState
  )

  const userAddress = useUserAddress()
  const userSigner = useUserSigner()
  const farmContract = useExternalContractLoader(farmAddress, StArbisAbi)
  const tokenContract = useExternalContractLoader(state.tokenAddress, ERC20Abi)
  const transaction = useTransaction()
  const [{ horseysauce }] = useGlobalState()

  const [action, setAction] = React.useState<string>('deposit')

  const setTokenAddress = React.useCallback(async () => {
    if (farmContract === null) {
      return
    }

    try {
      dispatch({ type: 'started' })
      const tokenAddress = await farmContract.arbisToken()
      dispatch({ type: 'tokenAddress', payload: { tokenAddress } })
    } catch (err) {
      console.log(err)
      dispatch({ type: 'error' })
    }
  }, [farmContract])

  const populateState = React.useCallback(async () => {
    if (!farmContract || !tokenContract || !userAddress) {
      return
    }

    try {
      const [
        tokenAddress,
        rawTokenBalance,
        tokenSymbol,
        tokenTotalSupply,
        approved,
        name,
        symbol,
        rawTotalDeposits,
        rawShareBalance,
        rawAvailableWETH,
        rawAvailableARBIS,
        rawAvailableCheems,
        rawAvailableUmami,
      ] = await Promise.all([
        farmContract.arbisToken(),
        tokenContract.balanceOf(userAddress),
        tokenContract.symbol(),
        tokenContract.totalSupply(),
        tokenContract.allowance(userAddress, farmAddress),
        farmContract.name(),
        farmContract.symbol(),
        farmContract.totalSupply(),
        farmContract.balanceOf(userAddress),
        farmContract.getAvailableTokenRewards(wETH),
        farmContract.getAvailableTokenRewards(state.tokenAddress),
        farmContract.getAvailableTokenRewards(cheems),
        farmContract.getAvailableTokenRewards(umami),
      ])

      const tokenBalance = parseFloat(formatEther(rawTokenBalance))
      const totalDeposits = parseFloat(formatEther(rawTotalDeposits))
      const shareBalance = parseFloat(formatEther(rawShareBalance))
      const availableWETH = formatEther(rawAvailableWETH)
      const availableARBIS = formatEther(rawAvailableARBIS)
      const avaiableCheems = formatEther(rawAvailableCheems)
      const avaiableUmami = formatEther(rawAvailableUmami)

      let isApproved = false
      if (approved) {
        if (!BigNumber.from('0').eq(approved)) {
          if (tokenBalance) {
            if (BigNumber.from(rawTokenBalance).lte(approved)) {
              isApproved = true
            }
          }
        }
      }

      dispatch({
        type: 'success',
        payload: {
          tokenAddress,
          tokenBalance,
          tokenSymbol,
          totalDeposits,
          tokenTotalSupply,
          name,
          symbol,
          shareBalance,
          isApproved,
          availableWETH,
          availableARBIS,
          avaiableCheems,
          avaiableUmami,
        },
      })
    } catch (err) {
      console.log({
        err,
        callingFunc: 'populateState',
        callingFarmName: 'Arbis',
      })
      dispatch({ type: 'error' })
    }
  }, [farmContract, tokenContract, userAddress, state])

  const handleDeposit = React.useCallback(
    async ({ depositAmount }, { resetForm }) => {
      if (!state.isApproved || !farmContract || !userSigner) {
        return
      }

      try {
        const amount = parseEther(String(Number(depositAmount)))
        const data = await farmContract.interface.encodeFunctionData('stake', [
          amount,
        ])

        await transaction(
          userSigner.sendTransaction({ to: farmAddress, data } as any)
        )
      } catch (err) {
        notify.notification({
          eventCode: 'txError',
          type: 'error',
          message: (err as any).data.message || (err as any).message,
          autoDismiss: 10000,
        })
      }
    },
    [state.isApproved, farmContract, userSigner, transaction]
  )

  const handleWithdraw = React.useCallback(
    async ({ withdrawAmount }, { resetForm }) => {
      if (!state.isApproved || !farmContract || !userSigner) {
        return
      }

      try {
        const amount = parseEther(String(Number(withdrawAmount)))
        const data = await farmContract.interface.encodeFunctionData(
          'withdraw',
          [amount]
        )

        transaction(
          userSigner.sendTransaction({
            to: farmAddress,
            data,
          } as any)
        )
      } catch (err) {
        notify.notification({
          eventCode: 'txError',
          type: 'error',
          message: (err as Error).message,
          autoDismiss: 10000,
        })
      }
    },
    [state.isApproved, farmContract, userSigner, transaction]
  )

  const handleApproval = React.useCallback(async () => {
    if (
      !userSigner ||
      !tokenContract ||
      !state.tokenTotalSupply ||
      !state.tokenAddress
    ) {
      return
    }

    try {
      const data = await tokenContract.interface.encodeFunctionData('approve', [
        farmAddress,
        parseEther(String(Number(state.tokenBalance) + 1)),
      ])

      await transaction(
        userSigner.sendTransaction({ to: state.tokenAddress, data } as any)
      )
    } catch (err) {
      notify.notification({
        eventCode: 'txError',
        type: 'error',
        message: (err as Error).message,
        autoDismiss: 10000,
      })
    }
  }, [userSigner, tokenContract, state, transaction])

  const handleCollect = React.useCallback(async () => {
    if (!userSigner || !farmContract) {
      return
    }

    try {
      const data = await farmContract.interface.encodeFunctionData(
        'collectRewards',
        []
      )
      await transaction(
        userSigner.sendTransaction({ to: farmAddress, data } as any)
      )
    } catch (err) {
      notify.notification({
        eventCode: 'txError',
        type: 'error',
        message: (err as Error).message,
        autoDismiss: 10000,
      })
    }
  }, [userSigner, transaction, farmContract])

  const allRewards = React.useMemo(() => {
    return (
      Number(state.avaiableUmami) +
      Number(state.avaiableCheems) +
      Number(state.availableARBIS) +
      Number(state.availableWETH)
    )
  }, [state])

  const apr = React.useMemo(() => {
    if (!horseysauce) {
      return null
    }

    return horseysauce.stArbis.apr
  }, [horseysauce])

  const initialize = React.useCallback(() => {
    if (state.status === 'idle') {
      setTokenAddress()
    }
    if (state.status === 'pending') {
      populateState()
    }
  }, [setTokenAddress, populateState, state])

  React.useEffect(() => {
    initialize()
  }, [initialize])

  React.useEffect(() => {
    if (state.status !== 'resolved') {
      return
    }
    const interval = setInterval(populateState, 30000)

    return () => clearInterval(interval)
  }, [state.status, populateState])

  const tvlInDollars = React.useMemo(() => {
    return state.totalDeposits && horseysauce
      ? Math.round(
          Number(state.totalDeposits) * Number(horseysauce.arbisPrice)
        ).toLocaleString()
      : '0'
  }, [state.totalDeposits, horseysauce])

  return (
    <DashboardCard>
      <DashboardCard.Title>Arbis</DashboardCard.Title>

      <DashboardCard.Subtitle>
        {apr ? (
          <>
            <span className="font-extrabold">{apr}% APR</span>
            <span className="text-gray-500 font-light"> | </span>
          </>
        ) : null}
        <a
          href={`https://arbiscan.io/address/${farmAddress}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-500 hover:underline font-normal"
        >
          Contract
        </a>
      </DashboardCard.Subtitle>

      <DashboardCard.Content>
        <p className="mt-4">
          Stake your ${state.tokenSymbol} for $ETH passive income from fees from
          across the Arbis ecosystem!
        </p>

        <div className="mt-8">
          <div className="flex justify-between">
            <strong>TVL:</strong>
            <div className="text-right">${tvlInDollars}</div>
          </div>

          <hr className="mt-2" />

          <div className="flex mt-2 justify-between">
            <strong>1 ${state.symbol}:</strong>
            <div className="text-right">1 ${state.tokenSymbol}</div>
          </div>
        </div>

        <div className="mt-2">
          <ul className="list-disc p-2 text-xs ml-2">
            <li>
              10% early withdrawal fee on any withdrawal amount which decays
              linearly to 0 over 7 days since any last deposit
            </li>
            <li className="mt-2">
              95% of the resulting fee is redistributed to stakers
            </li>
            <li className="mt-2">
              5% of the resulting fee goes to the treasury
            </li>
          </ul>
        </div>

        <div className="mt-4">
          <Selector>
            {['deposit', 'withdraw'].map((option) => (
              <Selector.Item
                key={option}
                text={option}
                onClick={() => setAction(option)}
                selected={option === action}
              />
            ))}
          </Selector>
        </div>

        {action === 'deposit' ? (
          <div className="mt-4">
            <Formik
              initialValues={{ depositAmount: '0' }}
              onSubmit={handleDeposit}
            >
              {({ isSubmitting, handleSubmit, setFieldValue, values }) => (
                <Form method="post">
                  <fieldset disabled={isSubmitting}>
                    <div>
                      <span>MAX: </span>
                      <button
                        type="button"
                        onClick={() =>
                          setFieldValue(
                            'depositAmount',
                            Number(state.tokenBalance)
                          )
                        }
                        className="text-primary"
                      >
                        {Number(state.tokenBalance).toFixed(3)}
                      </button>
                      <span> ${state.tokenSymbol}</span>
                    </div>

                    <Field
                      name="depositAmount"
                      className="border mt-2 border-gray-300 p-4 rounded w-full"
                      disabled={isSubmitting}
                      type="number"
                    />

                    <div className="mt-4">
                      <DashboardCard.Action
                        onClick={
                          state.isApproved ? handleSubmit : handleApproval
                        }
                        color="white"
                        disabled={
                          !Number(values.depositAmount) && state.isApproved
                        }
                      >
                        {state.isApproved ? (
                          <>
                            {isSubmitting ? (
                              <span>staking...</span>
                            ) : (
                              <span>stake</span>
                            )}
                          </>
                        ) : (
                          <span>approve</span>
                        )}
                      </DashboardCard.Action>
                    </div>
                  </fieldset>
                </Form>
              )}
            </Formik>
          </div>
        ) : null}

        {action === 'withdraw' ? (
          <div className="mt-4">
            <Formik
              initialValues={{ withdrawAmount: '0' }}
              onSubmit={handleWithdraw}
            >
              {({ isSubmitting, handleSubmit, setFieldValue, values }) => (
                <Form method="post">
                  <div>
                    <span>MAX: </span>
                    <button
                      type="button"
                      onClick={() =>
                        setFieldValue(
                          'withdrawAmount',
                          Number(state.shareBalance)
                        )
                      }
                      className="text-primary"
                    >
                      {Number(state.shareBalance).toFixed(3)}
                    </button>
                    <span> ${state.tokenSymbol}</span>
                  </div>

                  <Field
                    name="withdrawAmount"
                    className="border mt-2 border-gray-300 p-4 rounded w-full"
                    disabled={isSubmitting}
                    type="number"
                  />

                  <div className="mt-4">
                    <DashboardCard.Action
                      onClick={state.isApproved ? handleSubmit : handleApproval}
                      color="white"
                      disabled={
                        !Number(values.withdrawAmount) && state.isApproved
                      }
                    >
                      {state.isApproved ? (
                        <>
                          {isSubmitting ? (
                            <span>withdrawing...</span>
                          ) : (
                            <span>withdraw</span>
                          )}
                        </>
                      ) : (
                        <span>approve</span>
                      )}
                    </DashboardCard.Action>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        ) : null}

        <div className="mt-4">
          <DashboardCard.Action
            color="black"
            disabled={!allRewards}
            onClick={handleCollect}
          >
            Collect All
          </DashboardCard.Action>
        </div>
      </DashboardCard.Content>

      <DashboardCard.More>
        <strong>Current Reward(s):</strong>

        <ul>
          <li className="flex justify-between">
            <div>{state.availableARBIS}</div>
            <div>ARBIS</div>
          </li>
          <li className="flex justify-between">
            <div>{state.availableWETH}</div>
            <div>WETH</div>
          </li>
          <li className="flex justify-between">
            <div>{state.avaiableCheems}</div>
            <div>CHEEMS</div>
          </li>
          <li className="flex justify-between">
            <div>{state.avaiableUmami}</div>
            <div>UMAMI</div>
          </li>
        </ul>
      </DashboardCard.More>
    </DashboardCard>
  )
}
