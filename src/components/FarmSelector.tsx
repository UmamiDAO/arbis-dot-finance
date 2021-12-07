import React from 'react';

type RootProps = {
  children: React.ReactNode;
}

export default function FarmSelector({ children }: RootProps) {
  return (
    <ul className="flex items-center mt-4 p-4 flex-wrap md:p-0 md:justify-center md:flex-no-wrap">
      {children}
    </ul>
  );
}

type ItemProps = {
  text: string;
  selected: boolean;
  onClick: () => void;
};

function Item({ text, selected, onClick }: ItemProps) {
  return (
    <li className="inline-block">
      <button
        type="button"
        className={`px-6 py-1 border rounded ${selected ? 'bg-primary text-white' : ''}`}
        onClick={onClick}
      >
        {text}
      </button>
    </li>
  );
}

FarmSelector.Item = Item;
