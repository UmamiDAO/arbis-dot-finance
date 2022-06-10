import React from 'react'

type Props = {
  type?: 'button' | 'submit';
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
};

export default function Button({
  type = 'button',
  onClick = () => {
    return
  },
  children,
  className,
  disabled = false,
}: Props) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`bg-black py-2 duration-100 font-bold rounded text-white w-full uppercase border border-transparent hover:border-black hover:cursor-pointer hover:bg-white hover:text-black disabled:opacity-70 disabled:cursor-not-allowed ${className}`}
      disabled={disabled}
    >
      {children}
    </button>
  )
}
