import React from 'react';

type Props = {
  text: string
}

export default function FarmHeading({ text }: Props) {
  return (
    <div className="bg-gray-900 inline-block p-4 text-light rounded-md text-xl">
      <h1>{text}</h1>
    </div>
  );
}
