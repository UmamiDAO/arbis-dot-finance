import React from 'react'
import { formatEther } from '@ethersproject/units'
import { useNavigate } from 'react-router-dom'

import useGlobalState from '../hooks/useGlobalState'
import DashboardCard from './DashboardCard'
import useExternalContractLoader from '../hooks/useExternalContractLoader'
import NyanRewardsContractAbi from '../contracts/NyanRewardsContract.abi'

import { STAKING_POOL_ADDRESSES } from '../config'

export default function Home() {
  const navigate = useNavigate()
  const [nyanAPY, setNyanAPY] = React.useState<number | null>(null)
  const [{ horseysauce }] = useGlobalState()

  const { arbisPrice, arbisTVL } = React.useMemo(() => {
    if (!horseysauce) {
      return { arbisPrice: '', arbisTVL: '' }
    }

    return { ...horseysauce, arbisTVL: horseysauce.tvl }
  }, [horseysauce])

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

  React.useEffect(() => {
    if (nyanContract) {
      getNyanAPY()
    }
  }, [nyanContract, getNyanAPY])

  return (
    <main className="px-4 mt-8">
      <header>
        <h1 className="text-3xl md:leading-tight md:text-5xl">
          Welcome to Arbis.
          <br />
          Home of Arbitrum's Tastiest Yields!
        </h1>
      </header>

      <section className="mt-12 lg:w-1/3">
        <DashboardCard>
          <DashboardCard.Title>$ARBIS</DashboardCard.Title>

          {0 ? (
            <>
              {/* TODO make this dynamic */}
              <DashboardCard.Subtitle>
                38.08% APR in past 7 days💰
              </DashboardCard.Subtitle>
            </>
          ) : null}

          <DashboardCard.Content>
            <div className="flex w-full justify-between mt-4">
              <strong>Price</strong>
              <div>${arbisPrice}</div>
            </div>

            <div className="flex w-full justify-between mt-4">
              <strong>TVL</strong>
              <div>${Number(arbisTVL).toLocaleString()}</div>
            </div>

            <div className="flex w-full justify-between mt-4">
              <strong>Market Cap</strong>
              <div>${Number(arbisTVL).toLocaleString()}</div>
            </div>
          </DashboardCard.Content>

          <DashboardCard.Footer>
            {nyanAPY ? (
              <div className="flex w-full justify-between">
                <strong className="w-20">Top Yield Farm</strong>
                {nyanAPY !== null ? (
                  <div className="text-right">
                    <div className="text-gray-400">NYAN</div>
                    <div>{Math.floor(nyanAPY).toLocaleString()}%</div>
                  </div>
                ) : null}
              </div>
            ) : null}

            <div className="mt-4 flex justify-between">
              {0 ? (
                <DashboardCard.Action color="white" onClick={() => {}}>
                  buy & stake
                </DashboardCard.Action>
              ) : null}

              <DashboardCard.Action
                color="black"
                onClick={() =>
                  navigate('/farms', { state: { token: 'arbis' } })
                }
              >
                farm
              </DashboardCard.Action>
            </div>
          </DashboardCard.Footer>

          <DashboardCard.More>
            <div className="w-full text-center">
              <a
                href="https://curlyfries.xyz"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-gray-400"
              >
                + View all $ARBIS stats
              </a>
            </div>
          </DashboardCard.More>
        </DashboardCard>
      </section>
    </main>
  )
}
