import React from 'react'
import { useNavigate } from 'react-router-dom'

import useGlobalState from '../hooks/useGlobalState'
import DashboardCard from './DashboardCard'

export default function Home() {
  const navigate = useNavigate()
  const [{ horseysauce }] = useGlobalState()

  const { arbisPrice, arbisTVL } = React.useMemo(() => {
    if (!horseysauce) {
      return { arbisPrice: '', arbisTVL: '' }
    }

    return { ...horseysauce, arbisTVL: horseysauce.tvl }
  }, [horseysauce])

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
            <div className="mt-4 flex justify-between">
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
