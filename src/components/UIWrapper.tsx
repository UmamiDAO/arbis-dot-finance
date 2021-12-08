import React from 'react';
import ArbisSpinner from './ArbisSpinner';
import useGlobalState from '../hooks/useGlobalState';

type Props = {
  children: React.ReactNode;
};

export default function UIWrapper({ children }: Props) {
  const [{ injectedProvider }] = useGlobalState();

  if (injectedProvider === null) {
    return (
      <div className="w-full m-auto max-w-3xl p-4 flex flex-col items-center justify-center">
        <ArbisSpinner />
        <p className="mt-4 font-display uppercase font-extrabold">Connect your wallet on the Arbitrum Network</p>
      </div>
    );
  }

  return <>{children}</>;
}
