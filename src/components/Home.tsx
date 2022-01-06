import React from 'react'
import axios from 'axios'
import { formatEther } from '@ethersproject/units'
import UIWrapper from './UIWrapper'
import DashboardCard from './DashboardCard'
import useExternalContractLoader from '../hooks/useExternalContractLoader'
import NyanRewardsContractAbi from '../contracts/NyanRewardsContract.abi'
import { STAKING_POOL_ADDRESSES } from '../config'

export default function Home() {
  const initState: {
    status: string
    arbisPrice: string
    arbisTVL: string
  } = {
    status: 'idle',
    arbisPrice: '0',
    arbisTVL: '0',
  }
  const [state, dispatch] = React.useReducer(
    (
      state: typeof initState,
      action:
        | { type: 'started'; payload?: null }
        | { type: 'error'; payload?: null }
        | { type: 'success'; payload: { arbisPrice: string; arbisTVL: string } }
    ) => {
      switch (action.type) {
        case 'started':
          return { ...state, status: 'pending' }
        case 'error':
          return { ...state, status: 'rejected' }
        case 'success':
          return { ...state, status: 'resolved', ...action.payload }
        default:
          throw new Error('unsupported action type given on Home reducer')
      }
    },
    initState
  )
  const [nyanAPY, setNyanAPY] = React.useState<number | null>(null)
  const nyanContract = useExternalContractLoader(
    STAKING_POOL_ADDRESSES.NYAN,
    NyanRewardsContractAbi
  )

  const getNyanAPY = React.useCallback(async () => {
    if (!nyanContract || nyanAPY !== null) {
      return null
    }

    try {
      const rewardRate = await nyanContract.rewardRate()
      const totalSupply = await nyanContract.totalSupply()
      const SECONDS_PER_YEAR = 365.25 * 24 * 60 * 60
      const apr =
        (100 * parseFloat(formatEther(rewardRate)) * SECONDS_PER_YEAR) /
        parseFloat(formatEther(totalSupply))

      const apy = ((1 + apr / 100 / 12) ** 12 - 1) * 100
      setNyanAPY(apy)
    } catch (err) {
      console.log(err)
    }
  }, [nyanContract, nyanAPY])

  const initialize = React.useCallback(async () => {
    if (state.status === 'idle') {
      try {
        dispatch({ type: 'started' })
        const { data } = await axios('https://horseysauce.xyz/')
        dispatch({
          type: 'success',
          payload: { arbisPrice: data.arbisPrice, arbisTVL: data.tvl },
        })
      } catch (err) {
        console.log(err)
        dispatch({ type: 'error' })
      }
    }
  }, [state])

  React.useEffect(() => {
    if (nyanContract) {
      getNyanAPY()
    }
  }, [nyanContract, getNyanAPY])

  React.useEffect(() => {
    initialize()
  }, [initialize])

  return (
    <UIWrapper>
      <main className="px-4 mt-8">
        <header>
          <h1 className="text-3xl md:leading-tight md:text-5xl">
            Welcome to Arbis.
            <br />
            Home of Arbitrum's Tastiest Yields!
          </h1>
        </header>

        <section className="mt-12">
          <DashboardCard>
            <DashboardCard.Title>$ARBIS</DashboardCard.Title>

            {/* TODO make this dynamic */}
            <DashboardCard.Subtitle>
              38.08% APR in past 7 days💰
            </DashboardCard.Subtitle>

            <DashboardCard.Content>
              <div className="flex w-full justify-between mt-4">
                <strong>Price</strong>
                <div>${state.arbisPrice}</div>
              </div>

              <div className="flex w-full justify-between mt-4">
                <strong>TVL</strong>
                <div>${Number(state.arbisTVL).toLocaleString()}</div>
              </div>

              <div className="flex w-full justify-between mt-4">
                <strong>Market Cap</strong>
                <div>${Number(state.arbisTVL).toLocaleString()}</div>
              </div>
            </DashboardCard.Content>

            <DashboardCard.Footer>
              <div className="flex w-full justify-between">
                <strong className="w-20">Top Yield Farm</strong>
                {nyanAPY !== null ? (
                  <div className="text-right">
                    <div className="text-gray-400">NYAN</div>
                    <div>{Math.floor(nyanAPY).toLocaleString()}%</div>
                  </div>
                ) : null}
              </div>

              <div className="mt-4 flex justify-between">
                <DashboardCard.Action color="white" onClick={() => {}}>
                  buy & stake
                </DashboardCard.Action>

                <DashboardCard.Action color="black" onClick={() => {}}>
                  farm
                </DashboardCard.Action>
              </div>
            </DashboardCard.Footer>

            <DashboardCard.More>
              <div className="w-full text-center">
                <button type="button" className="font-bold text-gray-400">
                  + View all $ARBIS stats
                </button>
              </div>
            </DashboardCard.More>
          </DashboardCard>
        </section>
      </main>
    </UIWrapper>
  )
}
