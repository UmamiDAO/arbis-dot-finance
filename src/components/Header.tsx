import React from 'react';

export default function Header() {
  return (
    <header>
      <div className="w-full max-w-6xl p-4 m-auto flex items-center">
        <img src="/assets/arbis-finance-logo.png" alt="Arbi's" className="w-24 h-auto object-contain mr-4" />
        <span className="text-primary text-xl">We have the yields!</span>
      </div>
    </header>
  )
}
