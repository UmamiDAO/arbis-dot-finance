import React from 'react';

type Props = {
  address: string
}

export default function FarmAddress({ address }: Props) {
  const href = `https://arbiscan.io/address/${address}`;

  return (
    <a
      href={href}
      target="_blank" rel="noopener noreferrer"
      className="text-gray-500 text-sm block mt-4"
    >
      {address.slice(0,8)}...
    </a>
  )
}
