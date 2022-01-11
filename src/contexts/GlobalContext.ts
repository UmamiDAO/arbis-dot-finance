import React from 'react'
import type { Web3Provider } from '@ethersproject/providers'

export type Strategy = {
  name: string
  tradingAPR?: string
  address: string
  stakedTotal?: string
  underlyingTokenPrice?: string
  totalValueStaked?: string
  apr?: string
  apy?: string
  apyCalcTime?: string
  compoundsInCalcTime?: number
  lastCompound?: number
  totalSupply?: string
  shareUnderlyingRatio?: string
}

export type Horseysauce = {
  strategies: Strategy[]
  stArbisEth: {
    apr: string
    stakedTotal: string
    underlyingTokenPrice: string
    totalValueStaked: string
    lpTotalValue: string
  }
  stArbis: {
    apr: string
    totalValueStaked: string
  }
  umamiPerDay: number
  umamiLPTokenValue: number
  arbisPrice: string
  tvl: string
}

export type GlobalState = {
  injectedProvider: Web3Provider | null
  horseysauce: Horseysauce | null
}

export type GlobalActions =
  | { type: 'provider'; payload: { injectedProvider: Web3Provider | null } }
  | { type: 'horseysauce'; payload: { horseysauce: Horseysauce } }

export const initState: GlobalState = {
  injectedProvider: null,
  horseysauce: null,
}

const defaultDispatch: React.Dispatch<GlobalActions> = () => initState

export default React.createContext({
  state: initState,
  dispatch: defaultDispatch,
})
