import React from 'react';
import ConnectWallet from './ConnectWallet'

export default function Header() {
  return (
    <header>
      <div className="w-full max-w-6xl p-4 m-auto flex items-center justify-between">
        <div className="flex items-center">
          <img src="/assets/arbis-finance-logo.png" alt="Arbi's" className="w-16 h-auto object-contain md:mr-4 md:w-24" />
          <span className="text-primary text-sm md:text-xl">We have the yields!</span>
        </div>
        <div>
          <ConnectWallet />
        </div>
      </div>
    </header>
  )
}
