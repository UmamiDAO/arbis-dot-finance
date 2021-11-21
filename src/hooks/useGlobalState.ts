import React from 'react';
import GlobalContext, { GlobalState } from '../contexts/GlobalContext';
import type { Web3Provider } from '@ethersproject/providers/src.ts/web3-provider';

type GlobalStateHook = [GlobalState, { setInjectedProvider: (provider: Web3Provider) => void }];

export default function useGlobalState(): GlobalStateHook {
  const { state, dispatch } = React.useContext(GlobalContext);

  const setInjectedProvider = (injectedProvider: Web3Provider) =>
    dispatch({ type: 'provider', payload: { injectedProvider } });

  return [state, { setInjectedProvider }];
}
