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
      className={`p-[1px] bg-gradient-to-b from-umami-pink to-umami-purple duration-100 font-bold max-w rounded-md text-white w-full uppercase hover:cursor-pointer hover:text-umami-yellow hover:translate-y-[2px] disabled:opacity-70 disabled:cursor-not-allowed ${className}`}
      disabled={disabled}
    >
      <div className="bg-black flex items-center justify-center rounded-md py-2">
        {children}
      </div>
    </button>
  )
}
