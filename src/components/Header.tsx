import React from 'react'
import Navigation from './Navigation'
import ConnectWallet from './ConnectWallet'

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
        <ConnectWallet />
      </div>
    </header>
  )
}
