import React from 'react'
import { useSearchParams } from 'react-router-dom'
import Selector from './Selector'
import ArbisFarms from './ArbisFarms'
import SushiFarms from './SushiFarms'

const tokens = ['arbis', 'sushi',/*  'swapr', 'nyan', */ 'legacy']

export default function Farms() {
  const [searchParams, setSearchParams] = useSearchParams()
  const token = searchParams.get('token') || ''

  const fallbackParams = React.useCallback(() => {
    if (!tokens.includes(token)) {
      setSearchParams({ token: 'arbis' })
    }
  }, [token, setSearchParams])

  React.useEffect(() => {
    fallbackParams()
  }, [fallbackParams])



  return (
    <main>
      <h1 className="text-3xl md:text-5xl">farms🌾</h1>

      <nav className="mt-4">
        <Selector>
          {tokens.map((item) => (
            <Selector.Item
              key={item}
              text={`${item} farms`}
              onClick={() => {
                if (item == "legacy") {
                  window.open("https://old.arbis.finance/#/legacy-farms", "_self");
                } else {
                  setSearchParams({ token: item })
                }
              }}
              selected={item === token}
            />
          ))}
        </Selector>
      </nav>
            {token == "arbis" ?
            <ArbisFarms />
            : (token == "sushi" ? 
            <SushiFarms/>
            :  <section className="flex items-center justify-center h-64">
            <h2 className="text-center text-3xl font-extra-bold">Coming Soon</h2>
          </section>)}
     

    </main>
  )
}
