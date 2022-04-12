import React from 'react'
import axios from 'axios'

import GlobalContext, {
  GlobalState,
  GlobalActions,
  initState,
} from './GlobalContext'

const defaultStats = {
  marinate: {
    marinateTVL: '0',
    distributions: 0,
    wethAnnualized: '0',
    wethAnnualDollarValue: '0',
    totalWeth: '0',
    apr: '0',
    apy: '0',
  },
  cmUmamiBooster: {
    arbisApr: '0',
    arbisApy: '0',
    totalApy: '0',
  },
  strategies: [],
  stArbisEth: {
    apr: '0',
    stakedTotal: '0',
    underlyingTokenPrice: '0',
    totalValueStaked: '0',
    lpTotalValue: '0',
  },
  stArbis: {
    apr: '0',
    totalValueStaked: '0',
  },
  umamiPerDay: 0,
  umamiLPTokenValue: 0,
  arbisPrice: '0',
  tvl: '0',
}

const { Provider } = GlobalContext

type Props = {
  children: React.ReactNode
}

export default function GlobalProvider({ children }: Props) {
  const reducer = React.useReducer(
    (state: GlobalState, action: GlobalActions) => {
      switch (action.type) {
        case 'provider':
          return { ...state, injectedProvider: action.payload.injectedProvider }
        case 'horseysauce':
          return { ...state, horseysauce: action.payload.horseysauce }
        default:
          throw new Error('unsupported action type given on GlobalProvider')
      }
    },
    initState
  )
  const [state, dispatch] = reducer

  const fetchAPIData = React.useCallback(async () => {
    try {
      const [coingecko, horseysauce] = await Promise.all([
        axios('https://api.coingecko.com/api/v3/coins/arbis-finance'),
        axios('https://horseysauce.xyz'),
      ])
      dispatch({
        type: 'horseysauce',
        payload: {
          horseysauce: {
            ...horseysauce.data,
            arbisPrice: coingecko.data.market_data.current_price.usd,
            tvl:
              horseysauce.data.tvl ||
              String(
                Number(coingecko.data.market_data.total_supply) *
                  Number(coingecko.data.market_data.current_price.usd)
              ),
          },
        },
      })
    } catch (err) {
      dispatch({
        type: 'horseysauce',
        payload: { horseysauce: { ...defaultStats } },
      })
      console.log(err)
    }
  }, [dispatch])

  React.useEffect(() => {
    if (!state.horseysauce) {
      fetchAPIData()
    }
  }, [fetchAPIData, state])

  return <Provider value={{ state, dispatch }}>{children}</Provider>
}
