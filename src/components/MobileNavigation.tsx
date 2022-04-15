import React from 'react'
import { createPortal } from 'react-dom'
import styled from 'styled-components'
import { useLocation } from 'react-router-dom'

import NavigationLink from './NavigationLink'
import ConnectWallet from './ConnectWallet'

import { NAVIGATION_LINKS } from '../config'

const NavigationContainer = styled.div`
  animation: 0.1s appear linear;
  background-color: ${(props) => props.theme.backgroundColor};
  color: ${(props) => props.theme.color};

  @keyframes appear {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`

export default function MobileNavigation() {
  const [isOpen, setOpen] = React.useState(false)

  const { pathname } = useLocation()

  const openNav = React.useCallback(() => {
    if (!isOpen) {
      setOpen(true)
    }
  }, [isOpen])

  const closeNav = React.useCallback(() => {
    if (isOpen) {
      setOpen(false)
    }
  }, [isOpen])

  React.useEffect(() => closeNav, [pathname, closeNav])

  const navigationDisplay = React.useMemo(() => {
    return isOpen
      ? createPortal(
          <NavigationContainer className="fixed inset-0">
            <nav>
              <ul className="flex h-screen flex-col w-full items-center justify-center text-2xl">
                {NAVIGATION_LINKS.map((link) => (
                  <li className="mt-8" key={link.href}>
                    <NavigationLink link={link} />
                  </li>
                ))}
                <li className="mt-8">
                  <a
                    href="https://app.umami.finance"
                    className="font-extrabold font-display"
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    UMAMI
                  </a>
                </li>
                <li className="mt-8">
                  <ConnectWallet />
                </li>
                <li className="mt-12">
                  <button
                    type="button"
                    className="font-extrabold font-display"
                    onClick={closeNav}
                  >
                    CLOSE MENU
                  </button>
                </li>
              </ul>
            </nav>
          </NavigationContainer>,
          document.querySelector('body') as Element
        )
      : null
  }, [isOpen, closeNav])

  return (
    <>
      <button
        type="button"
        className="font-extrabold font-display text-xl px-2 flex items-center md:hidden"
        onClick={openNav}
      >
        MENU
      </button>
      {navigationDisplay}
    </>
  )
}
