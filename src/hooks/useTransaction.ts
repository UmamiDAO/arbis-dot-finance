import React from 'react'
import Notify, { API } from 'bnc-notify'
import { ThemeContext } from 'styled-components'
import useUserSigner from './useUserSigner'
import useUserNetwork from './useUserNetwork'

interface NotifyAPI extends API {}

const notify: NotifyAPI = Notify({
  darkMode: false,
})

export default function useTransaction() {
  const userSigner = useUserSigner()
  const userNetwork = useUserNetwork()
  const theme = React.useContext(ThemeContext)

  const isDarkTheme = React.useMemo(() => {
    return (theme.color as string).includes('light') || false
  }, [theme])

  const initialize = React.useCallback(() => {
    if (userNetwork === null) {
      return
    }

    notify.config({
      darkMode: isDarkTheme,
    })
  }, [userNetwork, isDarkTheme])

  React.useEffect(() => {
    initialize()
  }, [initialize])

  const transaction = React.useCallback(
    async (tx: Promise<any>) => {
      if (userSigner === null || notify === null) {
        return
      }
      try {
        const { hash } = await tx
        notify.notification({
          eventCode: 'txRequest',
          type: 'pending',
          message: `Local Transaction Sent ${hash.slice(0, 6)}...`,
          autoDismiss: 5000,
          onclick: () => window.open(`https://arbiscan.io/tx/${hash}`),
        })
      } catch (err) {
        notify.notification({
          eventCode: 'txError',
          type: 'error',
          message: (err as Error).message || (err as any).toString(),
          autoDismiss: 5000,
        })
      }
    },
    [userSigner]
  )

  return transaction
}
