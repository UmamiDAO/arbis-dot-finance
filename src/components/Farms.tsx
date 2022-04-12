import React from 'react'
import { useSearchParams } from 'react-router-dom'
import Selector from './Selector'
import ArbisFarms from './ArbisFarms'
import SushiFarms from './SushiFarms'
import MarinatedUmamiFarms from './MarinatedUmamiFarms'
import StargatorTab from './StargatorTab'

const categories = [
  'arbis',
  'sushi',
  'mumami',
  'stargator',
  /*  'swapr', 'nyan', */ 'legacy',
]

export default function Farms() {
  const [searchParams, setSearchParams] = useSearchParams()
  const category = searchParams.get('category') || ''

  const fallbackParams = React.useCallback(() => {
    if (!categories.includes(category)) {
      setSearchParams({ category: 'arbis' })
    }
  }, [category, setSearchParams])

  const farmsDisplay = React.useMemo(() => {
    switch (category) {
      case 'arbis':
        return <ArbisFarms />
      case 'sushi':
        return <SushiFarms />
      case 'mumami':
        return <MarinatedUmamiFarms />
      case 'stargator':
        return <StargatorTab />
      default:
        return (
          <section className="flex items-center justify-center h-64">
            <h2 className="text-center text-3xl font-extra-bold">
              Coming Soon
            </h2>
          </section>
        )
    }
  }, [category])

  React.useEffect(() => {
    fallbackParams()
  }, [fallbackParams])

  return (
    <main>
      <h1 className="text-3xl md:text-5xl">farms🌾</h1>

      <nav className="mt-4">
        <Selector>
          {categories.map((item) => (
            <Selector.Item
              key={item}
              text={`${item.replace('-', ' ')}`}
              onClick={() => {
                if (item === 'legacy') {
                  window.open(
                    'https://old.arbis.finance/#/legacy-farms',
                    '_blank'
                  )
                } else {
                  setSearchParams({ category: item })
                }
              }}
              selected={item === category}
            />
          ))}
        </Selector>
      </nav>
      {farmsDisplay}
    </main>
  )
}
