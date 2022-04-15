import React from 'react'
import Navigation from './Navigation'
import ConnectWallet from './ConnectWallet'
import MobileNavigation from './MobileNavigation'

export default function Header() {
  return (
    <header>
      <div className="w-full max-w-6xl p-4 m-auto flex items-center justify-between">
        <div className="flex items-center mr-4">
          <img
            src="/assets/arbis-finance-logo.png"
            alt="Arbi's"
            className="w-16 h-auto object-contain md:mr-4 md:w-24"
          />
        </div>
        <Navigation />
        <div className="hidden px-4 md:block">
          <ConnectWallet />
        </div>
        <MobileNavigation />
      </div>
    </header>
  )
}
