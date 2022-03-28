import React from 'react'
import { formatEther, parseEther } from '@ethersproject/units'
import { BigNumber } from 'ethers'
import { Formik, Form, Field } from 'formik'

import DashboardCard from './DashboardCard'
import Selector from './Selector'

import useGlobalState from '../hooks/useGlobalState'
import useUserAddress from '../hooks/useUserAddress'
import useUserSigner from '../hooks/useUserSigner'
import useExternalContractLoader from '../hooks/useExternalContractLoader'
import useTransaction, { notify } from '../hooks/useTransaction'

import StArbisEthLPAddress from '../contracts/stARBISETHLP.address'
import StArbisAbi from '../contracts/StArbis.abi'
import ERC20Abi from '../contracts/ERC20.abi'

const umami = '0x1622bF67e6e5747b81866fE0b85178a93C7F86e3'
const Z2O = '0xdb96f8efd6865644993505318cc08ff9c42fb9ac'

const farmAddress = StArbisEthLPAddress

export default function StArbisEthSushiFarm() {
  const [{ horseysauce }] = useGlobalState()
  const [tokenAddr, setTokenAddr] = React.useState<string | null>(null)

  const userAddress = useUserAddress()
  const userSigner = useUserSigner()
  const transaction = useTransaction()

  const tokenContract = useExternalContractLoader(tokenAddr, ERC20Abi)
  const farmContract = useExternalContractLoader(farmAddress, StArbisAbi)

  const initState: {
    initialized: boolean
    tokenBalance: null | string | number
    tokenSymbol: null | string | number
    tokenTotalSupply: null | string | number
    isApproved: boolean
    name: null | string | number
    symbol: null | string | number
    totalDeposits: null | string | number
    shareBalance: null | string | number
    availableUmami: null | string | number
    availableARBIS: null | string | number
    avaiableZ20: null | string | number
  } = {
    initialized: false,
    tokenBalance: null,
    tokenSymbol: null,
    tokenTotalSupply: null,
    isApproved: false,
    name: null,
    symbol: null,
    totalDeposits: null,
    shareBalance: null,
    availableUmami: null,
    availableARBIS: null,
    avaiableZ20: null,
  }

  const [state, setState] = React.useState(initState)
  const [action, setAction] = React.useState<string>('deposit')

  const handleTokenAddr = React.useCallback(async () => {
    if (!farmContract || tokenAddr) {
      return
    }

    try {
      const addr = await farmContract.arbisToken()
      setTokenAddr(addr)
    } catch (err) {
      console.log(err)
    }
  }, [farmContract, tokenAddr])

  const handleState = React.useCallback(async () => {
    if (!tokenContract || !farmContract || !tokenAddr) {
      return
    }

    try {
      const [
        rawTokenBalance,
        tokenSymbol,
        tokenTotalSupply,
        approved,
        name,
        symbol,
        rawTotalDeposits,
        rawShareBalance,
        rawAvailableUmami,
        rawAvailableARBIS,
        rawAvailableZ20,
      ] = await Promise.all([
        tokenContract.balanceOf(userAddress),
        tokenContract.symbol(),
        tokenContract.totalSupply(),
        tokenContract.allowance(userAddress, farmAddress),
        farmContract.name(),
        farmContract.symbol(),
        farmContract.totalSupply(),
        farmContract.balanceOf(userAddress),
        farmContract.getAvailableTokenRewards(umami),
        farmContract.getAvailableTokenRewards(tokenAddr),
        farmContract.getAvailableTokenRewards(Z2O),
      ])

      const tokenBalance = parseFloat(formatEther(rawTokenBalance))
      const totalDeposits = parseFloat(formatEther(rawTotalDeposits))
      const shareBalance = parseFloat(formatEther(rawShareBalance))
      const availableUmami = formatEther(rawAvailableUmami)
      const availableARBIS = formatEther(rawAvailableARBIS)
      const avaiableZ20 = formatEther(rawAvailableZ20)

      const isApproved = !BigNumber.from('0').eq(approved)

      setState({
        initialized: true,
        tokenBalance,
        tokenSymbol,
        totalDeposits,
        tokenTotalSupply,
        name,
        symbol,
        shareBalance,
        isApproved,
        availableUmami,
        availableARBIS,
        avaiableZ20,
      })
    } catch (err) {
      console.log({
        err,
        callingFunc: 'handleState',
        callingFarmName: 'Arbis/ETH Sushi LP',
      })
    }
  }, [farmContract, tokenAddr, tokenContract, userAddress])

  const handleDeposit = React.useCallback(
    async ({ depositAmount }, { resetForm }) => {
      if (!state.isApproved || !farmContract || !userSigner) {
        return
      }

      try {
        const amount = parseEther(String(Number(depositAmount).toFixed(9)))
        const data = farmContract.interface.encodeFunctionData('stake', [
          amount,
        ])

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
    },
    [state.isApproved, farmContract, userSigner, transaction]
  )

  const handleWithdraw = React.useCallback(
    async ({ withdrawAmount }, { resetForm }) => {
      if (!state.isApproved || !farmContract || !userSigner) {
        return
      }

      try {
        const amount = parseEther(String(Number(withdrawAmount).toFixed(9)))
        const data = farmContract.interface.encodeFunctionData('withdraw', [
          amount,
        ])

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
    },
    [state.isApproved, farmContract, userSigner, transaction]
  )

  const handleApproval = React.useCallback(async () => {
    if (
      !userSigner ||
      !tokenContract ||
      !state.tokenTotalSupply ||
      !tokenAddr
    ) {
      return
    }

    try {
      const data = await tokenContract.interface.encodeFunctionData('approve', [
        farmAddress,
        state.tokenTotalSupply,
      ])

      await transaction(
        userSigner.sendTransaction({ to: tokenAddr, data } as any)
      )
    } catch (err) {
      notify.notification({
        eventCode: 'txError',
        type: 'error',
        message: (err as Error).message,
        autoDismiss: 10000,
      })
    }
  }, [userSigner, tokenContract, state, transaction, tokenAddr])

  const handleCollect = React.useCallback(async () => {
    if (!state.isApproved || !userSigner || !farmContract) {
      return
    }

    try {
      const data = await farmContract.interface.encodeFunctionData(
        'collectRewards',
        []
      )
      transaction(userSigner.sendTransaction({ to: farmAddress, data } as any))
    } catch (err) {
      notify.notification({
        eventCode: 'txError',
        type: 'error',
        message: (err as Error).message,
        autoDismiss: 10000,
      })
    }
  }, [state.isApproved, userSigner, transaction, farmContract])

  const apr = React.useMemo(() => {
    if (!horseysauce) {
      return null
    }

    return horseysauce.stArbisEth.apr
  }, [horseysauce])

  const allRewards = React.useMemo(() => {
    return (
      Number(state.avaiableZ20) +
      Number(state.availableARBIS) +
      Number(state.availableUmami)
    )
  }, [state])

  const initialize = React.useCallback(() => {
    handleTokenAddr()
    handleState()
  }, [handleTokenAddr, handleState])

  React.useEffect(() => {
    initialize()
  }, [initialize])

  React.useEffect(() => {
    if (!state.initialized) {
      return
    }

    const interval = setInterval(handleState, 30000)

    return () => clearInterval(interval)
  }, [state.initialized, handleState])

  if (!state.initialized) {
    return null
  }

  return (
    <DashboardCard>
      <DashboardCard.Title>ARBIS/ETH Sushi LP</DashboardCard.Title>

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
          Stake your ${state.tokenSymbol} for ${state.name} to earn passive $Z20
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

        <div className="mt-2">
          <ul className="list-disc text-xs ml-2 p-2">
            <li>
              If you deposited in the last 7 days a 10% early withdraw fee will
              be charged to the amount you are withdrawing.
            </li>
            <li className="mt-2">
              When you withdraw any pending Tokens will be paid out to your
              address automatically.
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
            <div>ARBIS/ETH LP</div>
          </li>
          <li className="flex justify-between">
            <div>{state.availableUmami}</div>
            <div>UMAMI</div>
          </li>
          <li className="flex justify-between">
            <div>{state.avaiableZ20}</div>
            <div>Z20</div>
          </li>
        </ul>
      </DashboardCard.More>
    </DashboardCard>
  )
}
