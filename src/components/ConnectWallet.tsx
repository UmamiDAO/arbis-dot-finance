import React from 'react';
import useWeb3Modal from '../hooks/useWeb3Modal';
import useGlobalState from '../hooks/useGlobalState';
import * as ethers from 'ethers';

export default function ConnectWallet() {
  const [{ injectedProvider }, { setInjectedProvider }] = useGlobalState();
  const web3Modal = useWeb3Modal();
  const isConnected = Boolean(web3Modal && web3Modal.cachedProvider);

  const disconnect = React.useCallback(async () => {
    if (web3Modal !== null && injectedProvider !== null) {
      await web3Modal.clearCachedProvider();

      setTimeout(() => {
        window.location.reload();
      }, 1);
    }
  }, [web3Modal, injectedProvider]);

  const connect = React.useCallback(async () => {
    if (web3Modal !== null) {
      const provider = await web3Modal.connect();
      setInjectedProvider(new ethers.providers.Web3Provider(provider));

      provider.on('chainChanged', (chainId: string) => {
        console.log(`chain changed to ${chainId}! updating providers`);
        setInjectedProvider(new ethers.providers.Web3Provider(provider));
      });

      provider.on('accountsChanged', () => {
        console.log(`account changed!`);
        setInjectedProvider(new ethers.providers.Web3Provider(provider));
      });

      provider.on('disconnect', (code: number, reason: string) => {
        console.log(code, reason);
        disconnect();
      });
    }
  }, [web3Modal, setInjectedProvider, disconnect]);

  const reconnect = React.useCallback(async () => {
    if (web3Modal === null) {
      return;
    }

    if (web3Modal.cachedProvider && injectedProvider === null) {
      connect();
    }
  }, [web3Modal, connect, injectedProvider]);

  React.useEffect(() => {
    reconnect();
  }, [reconnect]);

  return (
    <button
      type="button"
      className="rounded-full px-6 py-2 border border-gray-300 transition duration-200 hover:border-blue-500 hover:text-blue-500"
      onClick={() => (isConnected ? disconnect() : connect())}
    >
      {isConnected ? 'logout' : 'connect'}
    </button>
  );
}
