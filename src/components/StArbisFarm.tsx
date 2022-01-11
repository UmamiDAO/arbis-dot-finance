import React from 'react'
import { formatEther, parseEther } from '@ethersproject/units'
import { Formik, Form, Field } from 'formik'

import DashboardCard from './DashboardCard'
import Selector from './Selector'

import useUserAddress from '../hooks/useUserAddress'
import useUserSigner from '../hooks/useUserSigner'
import useExternalContractLoader from '../hooks/useExternalContractLoader'
import useTransaction from '../hooks/useTransaction'
import useGlobalState from '../hooks/useGlobalState'

import StArbisAddress2 from '../contracts/StArbis2.address'
import StArbisAbi from '../contracts/StArbis.abi'
import ERC20Abi from '../contracts/ERC20.abi'

const wETH = '0x82af49447d8a07e3bd95bd0d56f35241523fbab1'
const Z2O = '0xdb96f8efd6865644993505318cc08ff9c42fb9ac'
const cheems = '0x75a2f30929c539e7d4ee033c9331b89f879c0cf7'
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
    avaiableZ20: null | string | number
    avaiableCheems: null | string | number
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
    avaiableZ20: null,
    avaiableCheems: null,
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
              avaiableZ20: null | string | number
              avaiableCheems: null | string | number
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
        rawAvailableZ20,
        rawAvailableCheems,
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
        farmContract.getAvailableTokenRewards(Z2O),
        farmContract.getAvailableTokenRewards(cheems),
      ])

      const tokenBalance = parseFloat(formatEther(rawTokenBalance)).toFixed(3)
      const totalDeposits = parseFloat(formatEther(rawTotalDeposits)).toFixed(3)
      const shareBalance = parseFloat(formatEther(rawShareBalance)).toFixed(3)
      const availableWETH = formatEther(rawAvailableWETH)
      const availableARBIS = formatEther(rawAvailableARBIS)
      const avaiableZ20 = formatEther(rawAvailableZ20)
      const avaiableCheems = formatEther(rawAvailableCheems)

      const isApproved = BigInt('0') !== approved

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
          avaiableZ20,
          avaiableCheems,
        },
      })
    } catch (err) {
      console.log(err)
      dispatch({ type: 'error' })
    }
  }, [farmContract, tokenContract, userAddress, state])

  const handleDeposit = React.useCallback(
    async ({ depositAmount }, { resetForm }) => {
      if (!state.isApproved || !farmContract || !userSigner) {
        return
      }

      try {
        const data = farmContract.interface.encodeFunctionData('stake', [
          parseEther(String(depositAmount)),
        ])

        await transaction(
          userSigner.sendTransaction({ to: farmAddress, data } as any)
        )
      } finally {
        setTimeout(() => {
          resetForm()
          populateState()
        }, 4000)
      }
    },
    [state.isApproved, farmContract, userSigner, transaction, populateState]
  )

  const handleWithdraw = React.useCallback(
    async ({ withdrawAmount }, { resetForm }) => {
      if (!state.isApproved || !farmContract || !userSigner) {
        return
      }

      try {
        const data = farmContract.interface.encodeFunctionData('withdraw', [
          parseEther(String(withdrawAmount)),
        ])

        await transaction(
          userSigner.sendTransaction({ to: farmAddress, data } as any)
        )
      } finally {
        setTimeout(() => {
          resetForm()
          populateState()
        }, 4000)
      }
    },
    [state.isApproved, farmContract, userSigner, transaction, populateState]
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
      const data = tokenContract.instance.encodeFunctionData('approve', [
        farmAddress,
        state.tokenTotalSupply,
      ])

      transaction(
        userSigner.sendTransaction({ to: state.tokenAddress, data } as any)
      )
    } finally {
      setTimeout(() => {
        populateState()
      }, 4000)
    }
  }, [userSigner, tokenContract, state, transaction, populateState])

  const handleCollect = React.useCallback(() => {
    if (!state.isApproved || !userSigner || !farmContract) {
      return
    }

    const data = farmContract.interface.encodeFunctionData('collectRewards', [])
    transaction(userSigner.sendTransaction({ to: farmAddress, data } as any))
  }, [state.isApproved, userSigner, transaction, farmContract])

  const allRewards = React.useMemo(() => {
    return (
      Number(state.avaiableCheems) +
      Number(state.avaiableZ20) +
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

  React.useEffect(() => {
    setTokenAddress()
  }, [setTokenAddress])

  React.useEffect(() => {
    if (state.status === 'pending') {
      populateState()
    }
  }, [populateState, state.status])

  if (state.status !== 'resolved') {
    return null
  }

  return (
    <DashboardCard>
      <DashboardCard.Title>Arbis Staking</DashboardCard.Title>

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
          className="text-gray-500 font-normal"
        >
          {farmAddress.slice(0, 8)}...
        </a>
      </DashboardCard.Subtitle>

      <DashboardCard.Content>
        <p className="mt-4">
          Stake your ${state.tokenSymbol} for ${state.name} to earn passive ETH
          generated by fees from all around the Arbi's food court automatically!
        </p>

        <div className="mt-8">
          <div className="flex justify-between">
            <strong>TVL:</strong>
            <div className="text-right">
              {Math.round(Number(state.totalDeposits)).toLocaleString()} $
              {state.tokenSymbol}
            </div>
          </div>

          <div className="flex justify-between">
            <strong>1 ${state.symbol}:</strong>
            <div className="text-right">1 ${state.tokenSymbol}</div>
          </div>
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
                          setFieldValue('depositAmount', state.tokenBalance)
                        }
                        className="text-primary"
                      >
                        {state.tokenBalance}
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
                        disabled={!Number(values.depositAmount)}
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
                        setFieldValue('withdrawAmount', state.shareBalance)
                      }
                      className="text-primary"
                    >
                      {state.shareBalance}
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
                      disabled={!Number(values.withdrawAmount)}
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
            disabled={!state.isApproved || !allRewards}
            onClick={() => handleCollect()}
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
            <div>$ARBIS</div>
          </li>
          <li className="flex justify-between">
            <div>{state.availableWETH}</div>
            <div>$WETH</div>
          </li>
          <li className="flex justify-between">
            <div>{state.avaiableCheems}</div>
            <div>$CHEEMS</div>
          </li>
          <li className="flex justify-between">
            <div>{state.avaiableZ20}</div>
            <div>$Z20</div>
          </li>
        </ul>

        <p className="text-sm mt-4">
          There is no rush to collect your rewards, they are reserved for you
          and will be there when you want to collect them. No one else can touch
          them.
        </p>
      </DashboardCard.More>
    </DashboardCard>
  )
}
