import React from 'react';
import Notify, { API } from 'bnc-notify';
import { ThemeContext } from 'styled-components';
import useUserSigner from './useUserSigner';
import useUserNetwork from './useUserNetwork';
import { BLOCKNATIVE_DAPPID } from '../config';

export default function useTransaction() {
  const userSigner = useUserSigner();
  const userNetwork = useUserNetwork();
  const theme = React.useContext(ThemeContext);
  const [notify, setNotify] = React.useState<API | null>(null);

  const isDarkTheme = React.useMemo(() => {
    return (theme.color as string).includes('light') || false;
  }, [theme]);

  const initialize = React.useCallback(() => {
    if (userNetwork === null) {
      return;
    }

    setNotify(
      Notify({
        dappId: BLOCKNATIVE_DAPPID,
        system: 'ethereum',
        networkId: userNetwork.chainId,
        darkMode: isDarkTheme,
      })
    );
  }, [userNetwork, isDarkTheme]);

  React.useEffect(() => {
    initialize();
  }, [initialize]);

  const transaction = React.useCallback(
    async (tx: Promise<any>) => {
      if (userSigner === null || notify === null) {
        return;
      }
      try {
        const { hash } = await tx;
        notify.notification({
          eventCode: 'txRequest',
          type: 'pending',
          message: `Local Transaction Sent ${hash.slice(0, 6)}...`,
          autoDismiss: 5000,
          onclick: () => window.open(`https://arbiscan.io/tx/${hash}`),
        });
      } catch (err) {
        notify.notification({
          eventCode: 'txError',
          type: 'error',
          message: (err as Error).message || (err as any).toString(),
          autoDismiss: 5000,
        });
      }
    },
    [notify, userSigner]
  );

  return transaction;
}
