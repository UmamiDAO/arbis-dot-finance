import React from 'react';
import useUserSigner from './useUserSigner';
import { JsonRpcSigner } from '@ethersproject/providers';

export default function useUserAddress() {
  const [userAddress, setUserAddress] = React.useState<string | null>(null);
  const userSigner = useUserSigner();

  const getAddress = React.useCallback(async () => {
    if (userSigner === null) {
      return;
    }

    try {
      const address = await (userSigner as JsonRpcSigner).getAddress();
      setUserAddress(address);
    } catch (err) {
      console.log(err);
    }
  }, [userSigner]);

  React.useEffect(() => {
    if (userAddress === null) {
      getAddress();
    }
  }, [userAddress, getAddress]);

  return userAddress;
}
