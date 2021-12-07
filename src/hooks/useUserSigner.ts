import React from 'react';
import useGlobalState from './useGlobalState';

export default function useUserSigner() {
  const [{ injectedProvider }] = useGlobalState();

  const userSigner = React.useMemo(() => {
    if (injectedProvider === null) {
      return null;
    }

    return injectedProvider._isProvider ? injectedProvider.getSigner() : injectedProvider;
  }, [injectedProvider]);

  return userSigner;
}
