import React from 'react';
import { JsonRpcSigner } from '@ethersproject/providers';
import { Network } from '@ethersproject/networks';
import useUserSigner from './useUserSigner';

export default function useUserNetwork() {
  const userSigner = useUserSigner();
  const [userNetwork, setUserNetwork] = React.useState<Network | null>(null);

  const getNetwork = React.useCallback(async () => {
    try {
      const network = await (userSigner as JsonRpcSigner).provider.getNetwork();
      setUserNetwork(network);
    } catch (err) {
      console.log(err);
    }
  }, [userSigner]);

  React.useEffect(() => {
    if (userSigner !== null) {
      getNetwork();
    }
  }, [userSigner, getNetwork]);

  return userNetwork;
}
