import React from 'react';

type RootProps = {
  children: React.ReactNode;
};

export default function Selector({ children }: RootProps) {
  return (
    <ul className="flex items-center mt-4 flex-wrap md:p-0 md:flex-no-wrap">{children}</ul>
  );
}

type ItemProps = {
  text: string;
  selected: boolean;
  onClick: () => void;
};

function Item({ text, selected, onClick }: ItemProps) {
  return (
    <li className="block">
      <button
        type="button"
        className={`px-4 py-1 uppercase font-display font-extrabold mr-4 last:mr-0 hover:bg-primary hover:text-white ${
          selected ? 'bg-primary text-white' : ''
        }`}
        onClick={onClick}
      >
        {text}
      </button>
    </li>
  );
}

Selector.Item = Item;
