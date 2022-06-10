import React from 'react'
import { Field } from 'formik'
import type { ReactNode } from 'react'

type FormCardProps = {
  className?: string;
  children: ReactNode;
};

type ContentProps = {
  children: ReactNode;
};

type HeaderActionProps = {
  text: string;
  onClick?: () => void;
  active?: boolean;
};

type FormFieldProps = {
  name: string;
  type?: string;
  placeholder?: string | number;
  label?: string;
  labelAccent?: ReactNode | string;
  disabled?: boolean;
  onBlur?: () => void;
  value?: string | number | boolean;
};

function Header({ children }: ContentProps) {
  return (
    <div className="flex rounded-md rounded-bl-none rounded-br-none p-4 border-b border-gray-500">
      {children}
    </div>
  )
}

function HeaderAction({ active, onClick, text }: HeaderActionProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`duration-200 flex items-center justify-center font-bold uppercase w-full rounded-md rounded-br-none rounded-bl-none hover:text-umami-yellow ${
        active ? 'text-umami-yellow' : ''
      }`}
    >
      {text}
    </button>
  )
}

function HeaderActionDivider() {
  return <div className="w-1 h-8 bg-gray-500 bg-opacity-80" />
}

function Content({ children }: ContentProps) {
  return (
    <div className="flex h-full rounded w-full">
      <div className="bg-opacity-80 flex-1 p-4 rounded">
        {children}
      </div>
    </div>
  )
}

function FormField({
  name,
  type = 'number',
  placeholder = '',
  label = '',
  labelAccent,
  disabled = false,
  onBlur,
}: FormFieldProps) {
  return (
    <label htmlFor={name}>
      <div className="text-sm font-bold">
        {labelAccent ? (
          <div className="flex justify-between items-center">
            {label}
            {labelAccent}
          </div>
        ) : (
          label
        )}
      </div>
      <Field
        name={name}
        type={type}
        placeholder={placeholder}
        className="rounded border mt-2 px-2 h-10 text-lg font-bold bg-white text-black w-full disabled:opacity-100 disabled:cursor-not-allowed"
        disabled={disabled}
        onBlur={onBlur}
      />
    </label>
  )
}

export default function FormCard({ children, className }: FormCardProps) {
  return (
    <div className="border border-black">{children}</div>
  )
}

FormCard.Header = Header
FormCard.HeaderAction = HeaderAction
FormCard.HeaderActionDivider = HeaderActionDivider
FormCard.Content = Content
FormCard.FormField = FormField
