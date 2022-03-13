import React from 'react'
import axios from 'axios'

import GlobalContext, {
  GlobalState,
  GlobalActions,
  initState,
} from './GlobalContext'

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
      const [coingecko, horsey] = await Promise.all([
        axios('https://api.coingecko.com/api/v3/coins/arbis-finance'),
        axios('https://horseysauce.xyz'),
      ])
      console.log(horsey)
      dispatch({
        type: 'horseysauce',
        payload: {
          horseysauce: {
            arbisPrice: coingecko.data.market_data.current_price.usd,
            ...horsey.data,
          },
        },
      })
    } catch (err) {
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
