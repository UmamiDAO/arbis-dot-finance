import { useCallback, useEffect, useState } from 'react'
import { Network } from '@ethersproject/networks'
import useGlobalState from './useGlobalState'

export default function useNetwork() {
  const [{ injectedProvider }] = useGlobalState()
  const [network, setNetwork] = useState<Network | null>(null)

  const handleNetwork = useCallback(async () => {
    try {
      if (!injectedProvider) {
        return
      }
      const currentNetwork = await injectedProvider.getNetwork()
      setNetwork(currentNetwork)
    } catch (err) {
      // eslint-disable-next-line
      console.log(err)
      setNetwork(null)
    }
  }, [injectedProvider])

  useEffect(() => {
    handleNetwork()
  }, [handleNetwork])

  return network
}
