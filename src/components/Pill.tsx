import React from 'react'
import type { ReactNode } from 'react'

type Props = {
  className?: string;
  children: ReactNode | string;
};

export default function Pill({ className, children }: Props) {
  return (
    <div
      className={`bg-gradient-to-b from-umami-pink to-umami-purple p-[1px] rounded-full w-auto ${className}`}
    >
      <div className="bg-black py-2 px-4 rounded-full">
        <div className="bg-gradient-to-b from-umami-purple to-umami-pink text-transparent bg-clip-text font-bold">
          {children}
        </div>
      </div>
    </div>
  )
}