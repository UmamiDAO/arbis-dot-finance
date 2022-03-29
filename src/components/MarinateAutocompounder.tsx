import React from 'react'
import { parseUnits, formatUnits } from '@ethersproject/units'
import { BigNumber } from 'ethers'
import { Formik, Form, Field } from 'formik'

import DashboardCard from './DashboardCard'
import Selector from './Selector'

import useUserAddress from '../hooks/useUserAddress'
import useUserSigner from '../hooks/useUserSigner'
import useExternalContractLoader from '../hooks/useExternalContractLoader'
import useTransaction, { notify } from '../hooks/useTransaction'

import mUMAMIAutocompounderAddress from '../contracts/mUMAMIAutocompounder.address'
import MarinateV2StrategyABI from '../contracts/MarinateV2Strategy.abi'
import ERC20Abi from '../contracts/ERC20.abi'

// testnet address 0x50B97c26c1F866156Da1E07Bc47b35d850d34EBa

const farmAddress = mUMAMIAutocompounderAddress
const farmAbi = MarinateV2StrategyABI
const farmName = 'Step 1. Autocompound $mUMAMI'

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
  const [action, setAction] = React.useState<'deposit' | 'withdraw'>('deposit')

  const userAddress = useUserAddress()
  const userSigner = useUserSigner()
  const transaction = useTransaction()
  const farmContract = useExternalContractLoader(farmAddress, farmAbi)
  const tokenContract = useExternalContractLoader(tokenAddr, ERC20Abi)

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

  const handleDeposit = React.useCallback(
    async ({ depositAmount }, { resetForm }) => {
      if (!state.isApproved || !farmContract || !userSigner) {
        return
      }

      try {
        const data = await farmContract.interface.encodeFunctionData(
          'deposit',
          [parseUnits(String(depositAmount), 9)]
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
        resetForm()
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
        const amount = parseUnits(String(Number(withdrawAmount)), 9)
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
        resetForm()
      }
    },
    [state.isApproved, farmContract, userSigner, transaction]
  )

  const handleApproval = React.useCallback(async () => {
    if (!userSigner || !tokenContract || !tokenAddr) {
      return
    }

    try {
      const data = await tokenContract.interface.encodeFunctionData('approve', [
        farmAddress,
        parseUnits(String(Number.MAX_SAFE_INTEGER), 9),
      ])

      await transaction(
        userSigner.sendTransaction({ to: tokenAddr, data } as any)
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
  }, [userSigner, tokenContract, transaction, tokenAddr])

  React.useEffect(() => {
    if (tokenAddr === null) {
      handleTokenAddr()
    }
  }, [tokenAddr, handleTokenAddr])

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

  if (!state.isInitialized) {
    return null
  }

  return (
    <DashboardCard>
      <DashboardCard.Title>{farmName}</DashboardCard.Title>

      <DashboardCard.Subtitle>
        <span className="font-extrabold">
          Est. APY: ~50%
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
                      {Number(state.farmUnderlyingTokensAvailable).toFixed(3)}
                      {' '}{state.tokenSymbol}
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
      </DashboardCard.Content>
    </DashboardCard>
  )
}
