import React from 'react';
import * as ethers from 'ethers';
import { INFURA_ID } from '../config';

export default function useMainnetProvider() {
  const scaffoldEthProvider = React.useMemo(() => {
    return navigator.onLine
      ? new ethers.providers.StaticJsonRpcProvider('https://rpc.scaffoldeth.io:48544')
      : null;
  }, []);

  const poktMainnetProvider = React.useMemo(() => {
    return navigator.onLine
      ? new ethers.providers.StaticJsonRpcProvider(
          'https://eth-mainnet.gateway.pokt.network/v1/lb/613fb8d6cd5fd000335ce59f'
        )
      : null;
  }, []);

  const mainnetInfura = React.useMemo(() => {
    return navigator.onLine
      ? new ethers.providers.StaticJsonRpcProvider('https://mainnet.infura.io/v3/' + INFURA_ID)
      : null;
  }, []);

  const mainnetProvider = React.useMemo(() => {
    if (poktMainnetProvider && poktMainnetProvider._isProvider) {
      return poktMainnetProvider;
    } else if (scaffoldEthProvider && scaffoldEthProvider._network) {
      return scaffoldEthProvider;
    } else {
      return mainnetInfura;
    }
  }, [poktMainnetProvider, scaffoldEthProvider, mainnetInfura]);

  return mainnetProvider;
}
