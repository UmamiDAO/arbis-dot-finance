import React from 'react';

export default function TotalValueLocked() {
  // @ts-ignore
  const burgersIterator = [...Array(10).keys()];

  return (
    <div className="w-full text-light text-sm bg-primary flex items-center justify-center text-center">
      <span>$</span>
      <span className="wave">
        {burgersIterator.map((num, i) => (
          // @ts-ignore
          <span key={i} style={{ '--i': i }}>🍔</span>
        ))}
      </span>
    </div>
  )
}
