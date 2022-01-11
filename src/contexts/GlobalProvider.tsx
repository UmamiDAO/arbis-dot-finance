import React from 'react'
import axios from 'axios'

import GlobalContext, {
  GlobalState,
  GlobalActions,
  initState,
} from './GlobalContext'

import usePoller from '../hooks/usePoller'

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
      const { data: horseysauce } = await axios('https://horseysauce.xyz')
      dispatch({ type: 'horseysauce', payload: { horseysauce } })
    } catch (err) {
      console.log(err)
    }
  }, [dispatch])

  usePoller(fetchAPIData, 60000)

  return <Provider value={{ state, dispatch }}>{children}</Provider>
}
