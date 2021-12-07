import React from 'react';
import type { Web3Provider } from '@ethersproject/providers';

export type GlobalState = {
  injectedProvider: Web3Provider | null;
};

export type GlobalActions =
  | { type: 'provider'; payload: { injectedProvider: Web3Provider | null } }
  | { type: 'placeholder'; payload?: null };

export const initState: GlobalState = {
  injectedProvider: null,
};

const defaultDispatch: React.Dispatch<GlobalActions> = () => initState;

export default React.createContext({ state: initState, dispatch: defaultDispatch });
