import React from 'react';
import { Fetcher, Route, Token, WETH } from '@uniswap/sdk';
import useMainnetProvider from './useMainnetProvider';
import usePoller from './usePoller';
import { NETWORKS } from '../config';

type Network = typeof NETWORKS.arbitrum;

export default function useExchangePrice(targetNetwork: Network = NETWORKS.arbitrum) {
  const [price, setPrice] = React.useState<number>(0);
  const mainnetProvider = useMainnetProvider();

  async function getETHPrice() {
    if (mainnetProvider === null) {
      return;
    }

    try {
      const DAI = new Token(
        mainnetProvider.network ? mainnetProvider.network.chainId : 1,
        '0x6B175474E89094C44Da98b954EedeAC495271d0F',
        18
      );
      const pair = await Fetcher.fetchPairData(DAI, WETH[DAI.chainId], mainnetProvider);
      const route = new Route([pair], WETH[DAI.chainId]);
      setPrice(parseFloat(route.midPrice.toSignificant(6)));
    } catch (err) {
      console.log(err);
    }
  }

  usePoller(getETHPrice);

  return price;
}
