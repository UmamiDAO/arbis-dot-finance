import React from 'react'
import { formatEther, parseEther } from '@ethersproject/units'
import { BigNumber } from 'ethers'
import { Formik, Form, Field } from 'formik'

import DashboardCard from './DashboardCard'
import Selector from './Selector'

import useUserAddress from '../hooks/useUserAddress'
import useUserSigner from '../hooks/useUserSigner'
import useExternalContractLoader from '../hooks/useExternalContractLoader'
import useTransaction from '../hooks/useTransaction'
import useGlobalState from '../hooks/useGlobalState'

import CHEEMSETHStrategyAddress from '../contracts/CHEEMSETHStrategy.address'
import NYANEthStrategyABI from '../contracts/NyanETHStrategy.abi'
import ERC20Abi from '../contracts/ERC20.abi'

const farmAddress = CHEEMSETHStrategyAddress

export default function CheemsEthOldFarm() {
  const initState: {
    [k: string]: string | number | boolean | null
  } = {
    tokenBalance: null,
    tokenName: null,
    tokenSymbol: null,
    tokenTotalSupply: null,
    isApproved: false,
    farmName: null,
    farmReward: null,
    farmSymbol: null,
    farmTotalDeposits: null,
    farmTokensPerShare: null,
    farmUnderlyingTokensAvailable: null,
    isInitialized: false,
  }
  const [state, setState] = React.useState(initState)
  const [tokenAddr, setTokenAddr] = React.useState<string | null>(null)
  const [action, setAction] = React.useState<'deposit' | 'withdraw'>('deposit')

  const [{ horseysauce }] = useGlobalState()
  const userAddress = useUserAddress()
  const userSigner = useUserSigner()
  const transaction = useTransaction()
  const farmContract = useExternalContractLoader(
    farmAddress,
    NYANEthStrategyABI
  )
  const tokenContract = useExternalContractLoader(tokenAddr, ERC20Abi)

  const totalValueStaked = React.useMemo(() => {
    if (!horseysauce) {
      return null
    }

    return (
      horseysauce.strategies.find((strat) => strat.address === farmAddress)
        ?.totalValueStaked || null
    )
  }, [horseysauce])

  const handleTokenAddr = React.useCallback(async () => {
    if (!farmContract) {
      return
    }
    try {
      const addr = await farmContract.depositToken()
      setTokenAddr(addr)
    } catch (err) {
      console.log(err)
    }
  }, [farmContract])

  const handleState = React.useCallback(async () => {
    if (!tokenAddr || !farmContract || !tokenContract || !userAddress) {
      return
    }
    try {
      const [
        tokenBalance,
        tokenName,
        tokenSymbol,
        tokenTotalSupply,
        approved,
        farmName,
        farmReward,
        farmSymbol,
        farmTotalDeposits,
        farmTokensPerShare,
        shareBalance,
      ] = await Promise.all([
        tokenContract.balanceOf(userAddress),
        tokenContract.name(),
        tokenContract.symbol(),
        tokenContract.totalSupply(),
        tokenContract.allowance(userAddress, farmAddress),
        farmContract.name(),
        farmContract.checkReward(),
        farmContract.symbol(),
        farmContract.totalDeposits(),
        farmContract.getDepositTokensForShares(BigInt(1000000000000000000)),
        farmContract.balanceOf(userAddress),
      ])

      const farmUnderlyingTokensAvailable =
        await farmContract.getDepositTokensForShares(shareBalance || 0)
      const isApproved = !BigNumber.from('0') === approved

      setState({
        tokenBalance,
        tokenName,
        tokenSymbol,
        tokenTotalSupply,
        isApproved,
        farmName,
        farmReward,
        farmSymbol,
        farmTotalDeposits: formatEther(farmTotalDeposits),
        farmTokensPerShare: formatEther(farmTokensPerShare),
        farmUnderlyingTokensAvailable,
        isInitialized: true,
      })
    } catch (err) {
      console.log(err)
    }
  }, [tokenAddr, farmContract, tokenContract, userAddress])

  const handleDeposit = React.useCallback(
    async ({ depositAmount }, { resetForm }) => {
      if (!state.isApproved || !farmContract || !userSigner) {
        return
      }

      try {
        const amount = parseEther(String(Number(depositAmount).toFixed(6)))
        const data = farmContract.interface.encodeFunctionData('stake', [
          amount,
        ])

        await transaction(
          userSigner.sendTransaction({ to: farmAddress, data } as any)
        )
      } finally {
        setTimeout(() => {
          resetForm()
          handleState()
        }, 4000)
      }
    },
    [state.isApproved, farmContract, userSigner, transaction, handleState]
  )

  const handleWithdraw = React.useCallback(
    async ({ withdrawAmount }, { resetForm }) => {
      if (!state.isApproved || !farmContract || !userSigner) {
        return
      }

      try {
        const amount = parseEther(String(Number(withdrawAmount).toFixed(6)))
        const data = farmContract.interface.encodeFunctionData('withdraw', [
          amount,
        ])

        await transaction(
          userSigner.sendTransaction({ to: farmAddress, data } as any)
        )
      } finally {
        setTimeout(() => {
          resetForm()
          handleState()
        }, 4000)
      }
    },
    [state.isApproved, farmContract, userSigner, transaction, handleState]
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
    } finally {
      setTimeout(() => {
        handleState()
      }, 4000)
    }
  }, [userSigner, tokenContract, state, transaction, handleState, tokenAddr])

  const initialize = React.useCallback(() => {
    handleTokenAddr()
    handleState()
  }, [handleTokenAddr, handleState])

  React.useEffect(() => {
    initialize()
  }, [initialize])

  if (!state.isInitialized) {
    return null
  }

  return (
    <DashboardCard>
      <DashboardCard.Title>Cheems/ETH (OLD)</DashboardCard.Title>

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
          Stake your ${state.tokenSymbol} for ${state.tokenName} to earn passive
          ${state.farmSymbol}
          generated by fees from all around the Arbi's food court automatically!
        </p>

        <div className="mt-8">
          <div className="flex justify-between">
            <strong>TVL:</strong>
            <div className="text-right">
              {Number(state.farmTotalDeposits) ? (
                <>
                  {parseFloat(String(state.farmTotalDeposits)).toLocaleString()}
                  <span> ${state.tokenSymbol}</span>
                </>
              ) : null}
              {Number(totalValueStaked) ? (
                <>
                  <span> === </span>
                  <span>
                    ${Number(totalValueStaked).toLocaleString('en-us')}
                  </span>
                </>
              ) : null}
            </div>
          </div>

          <div className="flex justify-between">
            <strong>1 ${state.farmSymbol}:</strong>
            <div className="text-right">
              {Number(state.farmTokensPerShare).toFixed(3)} ${state.tokenSymbol}
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
                            Number(state.tokenBalance).toFixed(9)
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
                          Number(state.farmUnderlyingTokensAvailable).toFixed(9)
                        )
                      }
                      className="text-primary"
                    >
                      {Number(state.farmUnderlyingTokensAvailable).toFixed(3)}
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
