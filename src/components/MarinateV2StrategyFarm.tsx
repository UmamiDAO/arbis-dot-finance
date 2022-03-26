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

import MarinateV2StrategyABI from '../contracts/MarinateV2Strategy.abi'
import MarinateV2StrategyFarmABI from '../contracts/MarinateV2StrategyFarm.abi'

const farmName = 'Marinate Strategy'
const farmAddress = '0xE91205e3FE022B601075adb1CDAe5F2294Bf5240'
const farmAbi = MarinateV2StrategyFarmABI

function Countdown({ unlockTime }: { unlockTime: number }) {
  const [remaining, setRemaining] = React.useState<number | null>(null)

  const handleDates = React.useCallback(() => {
    setInterval(() => {
      const then = new Date(unlockTime * 1000).getTime()
      const curr = new Date().getTime()
      setRemaining(then - curr)
    }, 1000)
  }, [unlockTime])

  const segments = React.useMemo(() => {
    if (!remaining) {
      return null
    }

    return {
      days: Math.floor(remaining / (1000 * 60 * 60 * 24)),
      hours: Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((remaining % (1000 * 60)) / 1000),
    }
  }, [remaining])

  React.useEffect(() => {
    handleDates()
  }, [handleDates])

  return segments ? (
    <div>
      <span>{segments.days} days, </span>
      <span>{segments.hours}h, </span>
      <span>{segments.minutes}m, </span>
      <span>{segments.seconds}s</span>
    </div>
  ) : null
}

export default function MarinateV2StrategyFarm() {
  const initFarmState: {
    [k: string]: string | number | boolean | null
  } = {
    lastDepositTime: null,
    unlockTime: null,
    stakedBalance: null,
    availableTokenRewards: null,
    totalStaked: null,
    tokenBalance: null,
    isApproved: false,
    isInitialized: false,
  }

  const initTokenState: {
    [k: string]: string | number | boolean | null
  } = {
    name: null,
    symbol: null,
    address: null,
  }

  const [farmState, setFarmState] = React.useState(initFarmState)
  const [tokenState, setTokenState] = React.useState(initTokenState)
  const [action, setAction] = React.useState<'deposit' | 'withdraw'>('deposit')

  const userAddress = useUserAddress()
  const userSigner = useUserSigner()
  const transaction = useTransaction()

  const farmContract = useExternalContractLoader(farmAddress, farmAbi)

  const tokenContract = useExternalContractLoader(
    tokenState.address as string | null,
    MarinateV2StrategyABI
  )

  const handleTokenAddress = React.useCallback(async () => {
    if (!farmContract) {
      return
    }

    try {
      const address = await farmContract.STOKEN()
      setTokenState({ ...tokenState, address })
    } catch (err) {
      console.log({
        err,
        callingFunc: 'handleTokenAddress',
        callingFarmName: farmName,
      })
    }
  }, [farmContract, tokenState])

  const handleTokenState = React.useCallback(async () => {
    if (
      !tokenState.address ||
      !tokenContract ||
      tokenState.name ||
      tokenState.symbol
    ) {
      return
    }

    try {
      const [name, symbol] = await Promise.all([
        tokenContract.name(),
        tokenContract.symbol(),
      ])
      setTokenState({ ...tokenState, name, symbol })
    } catch (err) {
      console.log({
        err,
        callingFunc: 'handleTokenState',
        callingFarmName: farmName,
      })
    }
  }, [tokenState, tokenContract])

  const handleFarmState = React.useCallback(async () => {
    if (
      !tokenState.address ||
      !farmContract ||
      !tokenContract ||
      !userAddress
    ) {
      return
    }
    try {
      const [
        stakedBalance,
        farmerInfo,
        availableTokenRewards,
        totalStaked,
        allowance,
        tokenBalance,
      ] = await Promise.all([
        farmContract.stakedBalance(userAddress),
        farmContract.farmerInfo(userAddress),
        farmContract.getAvailableTokenRewards(userAddress, tokenState.address),
        farmContract.totalStaked,
        tokenContract.allowance(userAddress, farmAddress),
        tokenContract.balanceOf(userAddress),
      ])

      const isApproved = !BigNumber.from('0').eq(allowance)
      const { lastDepositTime, unlockTime } = farmerInfo

      setFarmState({
        lastDepositTime,
        unlockTime,
        stakedBalance,
        availableTokenRewards,
        totalStaked,
        tokenBalance: formatEther(tokenBalance),
        isApproved,
        isInitialized: true,
      })
    } catch (err) {
      console.log({
        err,
        callingFunc: 'handleFarmState',
        callingFarmName: farmName,
      })
    }
  }, [tokenState.address, farmContract, tokenContract, userAddress])

  const handleDeposit = React.useCallback(
    async ({ depositAmount }, { resetForm }) => {
      if (!farmState.isApproved || !farmContract || !userSigner) {
        return
      }

      try {
        const data = await farmContract.interface.encodeFunctionData('stake', [
          depositAmount,
        ])

        await transaction(
          userSigner.sendTransaction({ to: farmAddress, data } as any)
        )
      } catch (err) {
        notify.notification({
          eventCode: 'txError',
          type: 'error',
          message: (err as Error).message,
          autoDismiss: 2000,
        })
      } finally {
        setTimeout(() => {
          resetForm()
        }, 10000)
      }
    },
    [farmState.isApproved, farmContract, userSigner, transaction]
  )

  const handleWithdraw = React.useCallback(
    async ({ withdrawAmount }, { resetForm }) => {
      if (!farmState.isApproved || !farmContract || !userSigner) {
        return
      }

      try {
        const amount = parseEther(String(Number(withdrawAmount)))
        const data = await farmContract.interface.encodeFunctionData(
          'withdraw',
          [amount]
        )

        await transaction(
          userSigner.sendTransaction({ to: farmAddress, data } as any)
        )
      } catch (err) {
        notify.notification({
          eventCode: 'txError',
          type: 'error',
          message: (err as Error).message,
          autoDismiss: 2000,
        })
      } finally {
        setTimeout(() => {
          resetForm()
        }, 10000)
      }
    },
    [farmState.isApproved, farmContract, userSigner, transaction]
  )

  const handleApproval = React.useCallback(async () => {
    if (!userSigner || !tokenContract || !tokenState.address) {
      return
    }

    try {
      const data = await tokenContract.interface.encodeFunctionData('approve', [
        farmAddress,
        parseEther(String(Number.MAX_SAFE_INTEGER)),
      ])

      await transaction(
        userSigner.sendTransaction({ to: tokenState.address, data } as any)
      )
    } catch (err) {
      notify.notification({
        eventCode: 'txError',
        type: 'error',
        message: (err as Error).message,
        autoDismiss: 2000,
      })
      console.log({
        err,
        callingFunc: 'handleApproval',
        callingFarmName: farmName,
      })
    }
  }, [userSigner, tokenContract, transaction, tokenState.address])

  const handleClaim = React.useCallback(async () => {
    if (!farmState.isApproved || !userSigner || !farmContract) {
      return
    }

    try {
      const data = await farmContract.interface.encodeFunctionData(
        'claimRewards',
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
        autoDismiss: 2000,
      })
    }
  }, [userSigner, farmContract, farmState.isApproved, transaction])

  const reward = React.useMemo(() => {
    if (!farmState.availableTokenRewards) {
      return '0'
    }

    const fixedNum = Number(farmState.availableTokenRewards).toFixed(6)

    return Number(fixedNum) / 200
  }, [farmState.availableTokenRewards])

  React.useEffect(() => {
    if (tokenState.address === null) {
      handleTokenAddress()
    }
  }, [tokenState.address, handleTokenAddress])

  React.useEffect(() => {
    if (tokenContract) {
      handleTokenState()
    }
  }, [tokenContract, handleTokenState])

  React.useEffect(() => {
    if (Object.values(tokenState).includes(null)) {
      return
    }

    handleFarmState()

    const pollFarmState = setInterval(handleFarmState, 30000)

    return () => clearInterval(pollFarmState)
  }, [tokenState, handleFarmState])

  if (!farmState.isInitialized) {
    return null
  }

  return (
    <DashboardCard>
      <DashboardCard.Title>{farmName}</DashboardCard.Title>

      <DashboardCard.Subtitle>
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
          Stake your ${tokenState.symbol} in Arbis to let them compound
          automatically!
        </p>

        <div className="mt-8">
          <div className="flex justify-between">
            <strong>TVL:</strong>
            <div className="text-right">
              {Number(farmState.totalStaked) ? (
                <>
                  {parseFloat(String(farmState.totalStaked)).toLocaleString()}
                  <span> ${tokenState.symbol}</span>
                </>
              ) : null}
            </div>
          </div>
        </div>

        <div className="mt-4">
          <Selector>
            {['deposit', 'withdraw'].map((option) => (
              <Selector.Item
                key={option}
                text={option}
                onClick={() => setAction(option as 'deposit' | 'withdraw')}
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
                            Number(String(farmState.tokenBalance))
                          )
                        }
                        className="text-primary"
                      >
                        {Number(farmState.tokenBalance).toFixed(3)}
                      </button>
                      <span> ${tokenState.symbol}</span>
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
                          farmState.isApproved ? handleSubmit : handleApproval
                        }
                        color="white"
                        disabled={
                          !Number(values.depositAmount) &&
                          Boolean(farmState.isApproved)
                        }
                      >
                        {farmState.isApproved ? (
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
                          Number(farmState.stakedBalance)
                        )
                      }
                      className="text-primary"
                    >
                      {Number(farmState.stakedBalance).toFixed(3)}
                    </button>
                    <span> ${tokenState.symbol}</span>
                  </div>

                  <Field
                    name="withdrawAmount"
                    className="border mt-2 border-gray-300 p-4 rounded w-full"
                    disabled={isSubmitting}
                    type="number"
                  />

                  <div className="mt-4">
                    <DashboardCard.Action
                      onClick={
                        farmState.isApproved ? handleSubmit : handleApproval
                      }
                      color="white"
                      disabled={
                        (!Number(values.withdrawAmount) &&
                          Boolean(farmState.isApproved)) ||
                        farmState.unlockTime !== 0
                      }
                    >
                      {farmState.isApproved ? (
                        <>
                          {isSubmitting ? (
                            <span>withdrawing...</span>
                          ) : (
                            <span>
                              {farmState.unlockTime ? (
                                <Countdown
                                  unlockTime={Number(farmState.unlockTime)}
                                />
                              ) : (
                                'withdraw'
                              )}
                            </span>
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
            disabled={!Number(farmState.availableTokenRewards)}
            onClick={handleClaim}
          >
            Claim Rewards
          </DashboardCard.Action>
        </div>
      </DashboardCard.Content>

      <DashboardCard.More>
        <strong className="mt-8">Current Reward(s):</strong>

        <div className="flex justify-between">
          <div>{reward}</div>
          <div>{tokenState.symbol}</div>
        </div>
      </DashboardCard.More>
    </DashboardCard>
  )
}
