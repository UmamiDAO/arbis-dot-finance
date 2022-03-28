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

import NYANEthStrategyABI from '../contracts/NyanETHStrategy.abi'
import ERC20Abi from '../contracts/ERC20.abi'

const farmAddress = '0xc5d444bB53DA60574Dd272Ebab609Efa6a483c57'

export default function CheemsEth2Farm() {
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
    farmShareBalance: null,
    isInitialized: false,
  }
  const [state, setState] = React.useState(initState)
  const [tokenAddr, setTokenAddr] = React.useState<string | null>(null)
  const [rewardTokenAddr, setRewardTokenAddr] = React.useState<string | null>(
    null
  )
  const [rewardSymbol, setRewardSymbol] = React.useState<string | null>(null)
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
  const rewardContract = useExternalContractLoader(rewardTokenAddr, ERC20Abi)

  const totalValueStaked = React.useMemo(() => {
    if (!horseysauce) {
      return null
    }

    return (
      horseysauce.strategies.find((strat) => strat.address === farmAddress)
        ?.totalValueStaked || null
    )
  }, [horseysauce])

  const reward = React.useMemo(() => {
    if (!state.farmReward) {
      return '0'
    }
    const fixedNum = Number(state.farmReward).toFixed(6)
    return Number(fixedNum) / 200
  }, [state.farmReward])

  const handleTokenAddr = React.useCallback(async () => {
    if (!farmContract) {
      return
    }
    try {
      const addr = await farmContract.depositToken()
      const rewardAddr = await farmContract.rewardToken()
      setTokenAddr(addr)
      setRewardTokenAddr(rewardAddr)
    } catch (err) {
      console.log({
        err,
        callingFunc: 'handleTokenAddr',
        callingFarmName: 'CheemsEth2',
      })
    }
  }, [farmContract])

  const handleRewardSymbol = React.useCallback(async () => {
    if (!rewardContract) {
      return null
    }
    try {
      const symbol = await rewardContract.symbol()
      setRewardSymbol(symbol)
    } catch (err) {
      console.log({
        err,
        callingFunc: 'handleRewardSymbol',
        callingFarmName: 'CheemsEth2',
      })
    }
  }, [rewardContract])

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
      const isApproved = !BigNumber.from('0').eq(approved)

      setState({
        tokenBalance: formatEther(tokenBalance),
        tokenName,
        tokenSymbol,
        tokenTotalSupply,
        isApproved,
        farmName,
        farmReward: formatEther(farmReward),
        farmSymbol,
        farmTotalDeposits: formatEther(farmTotalDeposits),
        farmTokensPerShare: formatEther(farmTokensPerShare),
        farmUnderlyingTokensAvailable: formatEther(
          farmUnderlyingTokensAvailable
        ),
        farmShareBalance: formatEther(shareBalance),
        isInitialized: true,
      })
    } catch (err) {
      console.log({
        err,
        callingFunc: 'handleState',
        callingFarmName: 'CheemsEth2',
      })
    }
  }, [tokenAddr, farmContract, tokenContract, userAddress])

  const handleDeposit = React.useCallback(
    async ({ depositAmount }, { resetForm }) => {
      if (!state.isApproved || !farmContract || !userSigner) {
        return
      }

      try {
        const amount = parseEther(String(Number(depositAmount).toFixed(8)))
        const data = await farmContract.interface.encodeFunctionData(
          'deposit',
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
        const amount = parseEther(String(Number(withdrawAmount).toFixed(8)))
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

  const handleCompound = React.useCallback(async () => {
    if (!userSigner || !farmContract) {
      return
    }
    try {
      const data = await farmContract.reinvest()
      transaction(userSigner.sendTransaction({ to: farmAddress, data } as any))
    } catch (err) {
      notify.notification({
        eventCode: 'txError',
        type: 'error',
        message: (err as Error).message,
        autoDismiss: 10000,
      })
    }
  }, [userSigner, farmContract, transaction])

  const initialize = React.useCallback(() => {
    handleTokenAddr()
    handleState()
    handleRewardSymbol()
  }, [handleTokenAddr, handleState, handleRewardSymbol])

  React.useEffect(() => {
    initialize()
  }, [initialize])

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
      <DashboardCard.Title>Cheems/ETH</DashboardCard.Title>

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
          <span>
            Stake your ${state.tokenSymbol} for ${state.tokenName} to earn
            passive ${state.farmSymbol}&nbsp;
          </span>

          <span>in Arbis to let them compound automatically!</span>
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
                          Number(state.farmShareBalance).toFixed(9)
                        )
                      }
                      className="text-primary"
                    >
                      {Number(state.farmShareBalance).toFixed(3)}
                    </button>
                    <span> ${state.farmSymbol}</span>
                  </div>

                  <div>
                    <span>GET BACK: </span>
                    <span>
                      {state.farmUnderlyingTokensAvailable} ${state.tokenSymbol}
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
            disabled={!Number(state.farmReward)}
            onClick={() => handleCompound()}
          >
            Compound
          </DashboardCard.Action>
        </div>
      </DashboardCard.Content>

      <DashboardCard.More>
        <strong>Current Reward(s):</strong>

        <div className="flex justify-between">
          <div>{reward}</div>
          <div>{rewardSymbol}</div>
        </div>
      </DashboardCard.More>
    </DashboardCard>
  )
}
