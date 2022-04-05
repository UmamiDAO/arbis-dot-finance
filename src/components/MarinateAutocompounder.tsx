import React from 'react'
import { parseUnits, formatUnits } from '@ethersproject/units'
import { BigNumber, Contract } from 'ethers'
import { Formik, Form, Field } from 'formik'

import DashboardCard from './DashboardCard'
import Selector from './Selector'

import useUserAddress from '../hooks/useUserAddress'
import useUserSigner from '../hooks/useUserSigner'
import useExternalContractLoader from '../hooks/useExternalContractLoader'
import useTransaction, { notify } from '../hooks/useTransaction'

import mUMAMIAutocompounderAddress from '../contracts/mUMAMIAutocompounder.address'
import MarinateV2StrategyABI from '../contracts/MarinateV2Strategy.abi'
import ERC20ABI from '../contracts/ERC20.abi'
import MarinateV2ABI from '../contracts/MarinateV2.abi'

// testnet address 0x50B97c26c1F866156Da1E07Bc47b35d850d34EBa

const farmAddress = mUMAMIAutocompounderAddress
const farmAbi = MarinateV2StrategyABI
const farmName = 'Step 1. Autocompound $mUMAMI'

type Reward = { address: string; symbol: string; availableTokenRewards: number }

export default function MarinateAutocompounder() {
  const initState: {
    [k: string]: string | number | boolean | null
  } = {
    tokenBalance: null,
    tokenName: null,
    tokenSymbol: null,
    isApproved: false,
    farmSymbol: null,
    farmTotalDeposits: null,
    farmTokensPerShare: null,
    farmBalance: null,
    farmShareBalance: null,
    totalDeposits: null,
    isInitialized: false,
  }

  const [state, setState] = React.useState(initState)
  const [tokenAddr, setTokenAddr] = React.useState<string | null>(null)
  const [rewardsState, setRewardsState] = React.useState<Reward[]>([])
  const [action, setAction] = React.useState<'deposit' | 'withdraw'>('deposit')

  const userAddress = useUserAddress()
  const userSigner = useUserSigner()
  const transaction = useTransaction()
  const farmContract = useExternalContractLoader(farmAddress, farmAbi)
  const tokenContract = useExternalContractLoader(tokenAddr, MarinateV2ABI)

  const handleTokenAddr = React.useCallback(async () => {
    if (!farmContract) {
      return
    }
    try {
      const addr = await farmContract.depositToken
      setTokenAddr(addr)
    } catch (err) {
      console.log({
        err,
        callingFunc: 'handleTokenAddr',
        callingFarmName: farmName,
        state,
      })
    }
  }, [farmContract, state])

  const handleState = React.useCallback(async () => {
    if (!tokenAddr || !farmContract || !tokenContract || !userAddress) {
      return
    }
    try {
      const [
        tokenBalance,
        tokenName,
        tokenSymbol,
        approved,
        farmSymbol,
        farmTotalDeposits,
        shareBalance,
        farmTokensPerShare,
        totalDeposits,
      ] = await Promise.all([
        tokenContract.balanceOf(userAddress),
        tokenContract.name(),
        tokenContract.symbol(),
        tokenContract.allowance(userAddress, farmAddress),
        farmContract.symbol(),
        farmContract.totalDeposits(),
        farmContract.balanceOf(userAddress),
        farmContract.getDepositTokensForShares(parseUnits('1.0', 9)),
        farmContract.totalDeposits,
      ])

      const farmUnderlyingTokensAvailable =
        await farmContract.getDepositTokensForShares(shareBalance || 0)
      const isApproved = !BigNumber.from('0').eq(approved)

      setState({
        tokenBalance: formatUnits(tokenBalance, 9),
        tokenName,
        tokenSymbol,
        isApproved,
        farmSymbol,
        farmTotalDeposits: formatUnits(farmTotalDeposits, 9),
        farmBalance: formatUnits(shareBalance, 9),
        farmUnderlyingTokensAvailable: formatUnits(
          farmUnderlyingTokensAvailable,
          9
        ),
        farmShareBalance: formatUnits(shareBalance, 9),
        farmTokensPerShare: formatUnits(farmTokensPerShare, 9),
        totalDeposits,
        isInitialized: true,
      })
    } catch (err) {
      console.log({
        err,
        callingFunc: 'handleState',
        callingFarmName: farmName,
      })
    }
  }, [tokenAddr, farmContract, tokenContract, userAddress])

  const handleRewards = React.useCallback(async () => {
    if (!tokenContract || !userSigner) {
      return
    }

    try {
      const tokenIdx = [0, 1]
      const promises = tokenIdx.map((idx) => tokenContract.rewardTokens(idx))
      const [rewardToken1, rewardToken2] = await Promise.all(promises)

      const rewardToken1Contract = new Contract(
        rewardToken1,
        ERC20ABI,
        userSigner
      )
      const rewardToken2Contract = new Contract(
        rewardToken2,
        ERC20ABI,
        userSigner
      )

      const [
        rewardTokenSymbol1,
        rewardTokenSymbol2,
        availableTokenRewards1,
        availableTokenRewards2,
      ] = await Promise.all([
        rewardToken1Contract.symbol(),
        rewardToken2Contract.symbol(),
        tokenContract.getAvailableTokenRewards(farmAddress, rewardToken1),
        tokenContract.getAvailableTokenRewards(farmAddress, rewardToken2),
      ])

      const isUmami = (symbol: string) => symbol === 'UMAMI'

      // eslint-disable-next-line
      const reward1: Reward = {
        address: rewardToken1,
        symbol: rewardTokenSymbol1,
        availableTokenRewards: Number(
          isUmami(rewardTokenSymbol1)
            ? formatUnits(availableTokenRewards1, 9)
            : formatUnits(availableTokenRewards1, 18)
        ),
      }

      const reward2: Reward = {
        address: rewardToken2,
        symbol: rewardTokenSymbol2,
        availableTokenRewards: Number(
          isUmami(rewardTokenSymbol2)
            ? formatUnits(availableTokenRewards2, 9)
            : formatUnits(availableTokenRewards2, 28)
        ),
      }
      setRewardsState([reward2])
    } catch (err) {
      console.log({
        err,
        callingFunc: 'handleRewards',
        callingFarmName: farmName,
      })
    }
  }, [tokenContract, userSigner])

  const handleDeposit = React.useCallback(
    async ({ depositAmount }, { resetForm }) => {
      if (!state.isApproved || !farmContract) {
        return
      }

      try {
        await transaction(
          farmContract.deposit(parseUnits(String(depositAmount), 9))
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
    [state.isApproved, farmContract, transaction]
  )

  const handleWithdraw = React.useCallback(
    async ({ withdrawAmount }, { resetForm }) => {
      if (!state.isApproved || !farmContract) {
        return
      }

      try {
        await transaction(
          farmContract.withdraw(parseUnits(String(Number(withdrawAmount)), 9))
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
    [state.isApproved, farmContract, transaction]
  )

  const handleApproval = React.useCallback(async () => {
    if (!tokenContract || !tokenAddr) {
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
  }, [tokenContract, transaction, tokenAddr])

  const handleCompound = React.useCallback(async () => {
    if (!farmContract) {
      return
    }

    try {
      await transaction(farmContract.reinvest())
    } catch (err) {
      notify.notification({
        eventCode: 'txError',
        type: 'error',
        message: (err as Error).message,
        autoDismiss: 10000,
      })
    }
  }, [farmContract, transaction])

  React.useEffect(() => {
    if (tokenAddr === null) {
      handleTokenAddr()
    }
  }, [tokenAddr, handleTokenAddr])

  React.useEffect(() => {
    if (rewardsState.length === 0) {
      handleRewards()
    }
  }, [rewardsState, handleRewards])

  React.useEffect(() => {
    if (!tokenAddr) {
      return
    }

    handleState()
  }, [tokenAddr, handleState])

  React.useEffect(() => {
    if (!state.isInitialized) {
      return
    }

    const interval = setInterval(handleState, 30000)

    return () => clearInterval(interval)
  }, [state.isInitialized, handleState])

  const disableCompound = React.useMemo(() => {
    if (!rewardsState.length) {
      return true
    }

    const amounts = rewardsState.map(
      ({ availableTokenRewards }) => availableTokenRewards
    )

    return amounts.filter((amt) => amt > 0).length === 0
  }, [rewardsState])

  const rewards = React.useMemo(() => {
    return rewardsState.length ? (
      <DashboardCard.More>
        <strong>Current Reward(s) For Pool:</strong>

        {rewardsState.map((reward) => (
          <div key={reward.address} className="flex justify-between">
            <div>{reward.availableTokenRewards || Number('0').toFixed(1)}</div>
            <div>{reward.symbol}</div>
          </div>
        ))}
      </DashboardCard.More>
    ) : null
  }, [rewardsState])

  return (
    <DashboardCard>
      <DashboardCard.Title>{farmName}</DashboardCard.Title>

      <DashboardCard.Subtitle>
        <span className="font-extrabold">Est. APY: ~50%</span>
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
          Stake your ${state.tokenSymbol} for ${state.farmSymbol} to start
          autocompounding your ${state.tokenSymbol} for higher APY.
        </p>

        <div className="mt-8">
          <div className="flex justify-between">
            <strong>TVL:</strong>
            <div className="text-right">
              {Number(state.farmTotalDeposits) ? (
                <>
                  {parseFloat(String(state.farmTotalDeposits)).toLocaleString()}
                  <span> {state.tokenSymbol}</span>
                </>
              ) : null}
              {Number(state.totalDeposits) ? (
                <>
                  <span> === </span>
                  <span>
                    {Number(state.totalDeposits).toLocaleString('en-us')}
                  </span>
                </>
              ) : null}
            </div>
          </div>

          <div className="flex justify-between">
            <strong>1 {state.farmSymbol}:</strong>
            <div className="text-right">
              {Number(state.farmTokensPerShare).toFixed(3)} {state.tokenSymbol}
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
                            Number(state.tokenBalance)
                          )
                        }
                        className="text-primary"
                      >
                        {Number(state.tokenBalance).toFixed(3)}
                      </button>
                      <span> {state.tokenSymbol}</span>
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
                          !Number(values.depositAmount) &&
                          Boolean(state.isApproved)
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
                          Number(state.farmShareBalance)
                        )
                      }
                      className="text-primary"
                    >
                      {Number(state.farmShareBalance).toFixed(3)}
                    </button>
                    <span> {state.farmSymbol}</span>
                  </div>

                  <div>
                    <span>GET BACK: </span>
                    <span>
                      {Number(state.farmUnderlyingTokensAvailable).toFixed(3)}{' '}
                      {state.tokenSymbol}
                    </span>
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
                        !Number(values.withdrawAmount) &&
                        Boolean(state.isApproved)
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
            disabled={disableCompound}
            onClick={handleCompound}
          >
            Compound
          </DashboardCard.Action>
        </div>
      </DashboardCard.Content>

      {rewards}
    </DashboardCard>
  )
}
