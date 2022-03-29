import React from 'react'
import { formatUnits, parseUnits } from '@ethersproject/units'
import { BigNumber } from 'ethers'
import { Formik, Form, Field } from 'formik'

import DashboardCard from './DashboardCard'
import Selector from './Selector'

import useUserAddress from '../hooks/useUserAddress'
import useExternalContractLoader from '../hooks/useExternalContractLoader'
import useTransaction, { notify } from '../hooks/useTransaction'

import mUMAMIAutocompounderFarm from '../contracts/mUMAMIAutocompounderFarm.address'
import MarinateV2StrategyABI from '../contracts/MarinateV2Strategy.abi'
import MarinateV2StrategyFarmABI from '../contracts/MarinateV2StrategyFarm.abi'

// testnet address 0xE91205e3FE022B601075adb1CDAe5F2294Bf5240

const farmName = 'Step 2. Boost with $ARBIS Rewards'
const farmAddress = mUMAMIAutocompounderFarm
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
  ) : (
    <span>Unlock Time</span>
  )
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
        farmerInfo,
        availableTokenRewards,
        totalStaked,
        allowance,
        tokenBalance,
      ] = await Promise.all([
        farmContract.farmerInfo(userAddress),
        farmContract.getAvailableTokenRewards(userAddress, tokenState.address),
        farmContract.totalStaked(),
        tokenContract.allowance(userAddress, farmAddress),
        tokenContract.balanceOf(userAddress),
      ])

      const isApproved = !BigNumber.from('0').eq(allowance)
      const { lastDepositTime, amount, unlockTime } = farmerInfo

      setFarmState({
        lastDepositTime,
        unlockTime,
        stakedBalance: formatUnits(amount, 9),
        availableTokenRewards: formatUnits(availableTokenRewards, 9),
        totalStaked: formatUnits(totalStaked, 9),
        tokenBalance: formatUnits(tokenBalance, 9),
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
      if (!farmState.isApproved || !farmContract) {
        return
      }

      try {
        await transaction(
          farmContract.stake(parseUnits(String(depositAmount), 9))
        )
      } catch (err) {
        notify.notification({
          eventCode: 'txError',
          type: 'error',
          message: (err as Error).message,
          autoDismiss: 2000,
        })
      } finally {
        resetForm()
      }
    },
    [farmState.isApproved, farmContract, transaction]
  )

  const handleWithdraw = React.useCallback(
    async ({ withdrawAmount }, { resetForm }) => {
      if (!farmState.isApproved || !farmContract) {
        return
      }

      try {
        await transaction(farmContract.withdraw())
      } catch (err) {
        notify.notification({
          eventCode: 'txError',
          type: 'error',
          message: (err as Error).message,
          autoDismiss: 2000,
        })
      } finally {
        resetForm()
      }
    },
    [farmState.isApproved, farmContract, transaction]
  )

  const handleApproval = React.useCallback(async () => {
    if (!tokenContract || !tokenState.address) {
      return
    }

    try {
      await transaction(
        tokenContract.approve(
          farmAddress,
          parseUnits(String(Number.MAX_SAFE_INTEGER), 9)
        )
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
  }, [tokenContract, transaction, tokenState.address])

  const handleClaim = React.useCallback(async () => {
    if (!farmState.isApproved || !farmContract) {
      return
    }

    try {
      await transaction(farmContract.claimRewards())
    } catch (err) {
      notify.notification({
        eventCode: 'txError',
        type: 'error',
        message: (err as Error).message,
        autoDismiss: 2000,
      })
    }
  }, [farmContract, farmState.isApproved, transaction])

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
  }, [tokenState, handleFarmState])

  React.useEffect(() => {
    if (!farmState.isInitialized) {
      return
    }

    const interval = setInterval(handleFarmState, 30000)

    return () => clearInterval(interval)
  }, [farmState.isInitialized, handleFarmState])

  if (!farmState.isInitialized) {
    return null
  }

  return (
    <DashboardCard>
      <DashboardCard.Title>{farmName}</DashboardCard.Title>

      <DashboardCard.Subtitle>
        <span className="font-extrabold">
          Est. APY for ${tokenState.symbol} w/ ARBIS Booster: 150%-200%
        </span>
        <span className="text-gray-500 font-light"> | </span>
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
          Don't forget to deposit your ${tokenState.symbol} to our $ARBIS
          Booster to start raking in savory $ARBIS rewards!
          <br />
          <b>
            Deposited cmUMAMI will be timelocked for 30 days from the time of
            deposit. After the 30 days, any withdrawal in the following 8 weeks
            will be subject to a 3% fee.
          </b>
          <br />
          Rewards can be claimed at any time.
        </p>

        <div className="mt-8">
          <div className="flex justify-between">
            <strong>TVL:</strong>
            <div className="text-right">
              {Number(farmState.totalStaked) ? (
                <>
                  {parseFloat(String(farmState.totalStaked)).toLocaleString()}
                  <span> {tokenState.symbol}</span>
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
                      <span> {tokenState.symbol}</span>
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
              initialValues={{
                withdrawAmount: Number(farmState.stakedBalance),
              }}
              onSubmit={handleWithdraw}
            >
              {({ isSubmitting, handleSubmit, setFieldValue, values }) => (
                <Form method="post">
                  <fieldset disabled={isSubmitting}>
                    <div>
                      <span>ALL {tokenState.symbol} IS WITHDRAWN AT ONCE</span>
                    </div>
                    <Field
                      name="withdrawAmount"
                      className="border mt-2 border-gray-300 p-4 rounded w-full"
                      type="number"
                      disabled
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
                  </fieldset>
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
          <div>{Number(farmState.availableTokenRewards).toFixed(6)}</div>
          <div>{tokenState.symbol}</div>
        </div>
      </DashboardCard.More>
    </DashboardCard>
  )
}
