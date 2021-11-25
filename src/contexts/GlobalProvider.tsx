import React from 'react';
import GlobalContext, { GlobalState, GlobalActions, initState } from './GlobalContext';

const { Provider } = GlobalContext;

type Props = {
  children: React.ReactNode;
};

export default function GlobalProvider({ children }: Props) {
  const reducer = React.useReducer((state: GlobalState, action: GlobalActions) => {
    switch (action.type) {
      case 'provider':
        return { ...state, injectedProvider: action.payload.injectedProvider };
      default:
        throw new Error('unsupported action type given on GlobalProvider');
    }
  }, initState);
  const [state, dispatch] = reducer;

  return <Provider value={{ state, dispatch }}>{children}</Provider>;
}
