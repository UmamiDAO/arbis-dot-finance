import React from 'react';
import axios from 'axios';
import usePoller from './usePoller'
import { NETWORKS } from '../config'

export default function useGasPrice(network: typeof NETWORKS.arbitrum = NETWORKS.arbitrum, speed: string = 'fast') {
  const [price, setPrice] = React.useState<number | null>(null);

  const getPrice = React.useCallback(async () => {
    try {
      const { data } = await axios('https://ethgasstation.info/json/ethgasAPI.json');
      setPrice(data[speed] * 100000000);
    } catch (err) {
      console.log(err);
      setPrice(0)
    }
  }, [speed]);

  usePoller(getPrice, 39999);

  return price;
}
