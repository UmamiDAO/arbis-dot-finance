import React from 'react'

import useGlobalState from '../hooks/useGlobalState'
import useNetwork from '../hooks/useNetwork'
import ArbisSpinner from './ArbisSpinner'

type Props = {
  children: React.ReactNode
}

export default function UIWrapper({ children }: Props) {
  const [{ injectedProvider }] = useGlobalState()
  const network = useNetwork()

  const isArbitrum = React.useMemo<boolean>(() => {
    if (!network) {
      return false
    }

    return network.chainId === 42161
  }, [network])

  if (injectedProvider === null || !isArbitrum) {
    return (
      <div className="w-full m-auto max-w-3xl p-4 flex flex-col items-center justify-center">
        <ArbisSpinner />
        <p className="mt-4 font-display uppercase font-extrabold">
          Connect your wallet on the Arbitrum Network
        </p>
      </div>
    )
  }

  return <>{children}</>
}
