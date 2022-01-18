import React from 'react'

type RootProps = {
  children: React.ReactNode
}

type ActionProps = {
  children: React.ReactNode
  color: 'black' | 'white'
  onClick: () => void
  disabled?: boolean
}

export default function DashboardCard({ children }: RootProps) {
  return (
    <div className="pr-4 last:pr-0 w-full">
      <div className="border-t-4 border-primary py-4 lg:text-sm">
        {children}
      </div>
    </div>
  )
}

function Title({ children }: RootProps) {
  return (
    <h2 className="font-display font-extrabold uppercase text-2xl md:text-4xl">
      {children}
    </h2>
  )
}

function Subtitle({ children }: RootProps) {
  return <div className="font-bold">{children}</div>
}

function Content({ children }: RootProps) {
  return <div className="mt-4">{children}</div>
}

function Footer({ children }: RootProps) {
  return <div className="mt-4 py-2 border-t-4 border-gray-200">{children}</div>
}

function More({ children }: RootProps) {
  return <div className="my-4">{children}</div>
}

function Action({ children, color, onClick, disabled }: ActionProps) {
  return (
    <button
      className={`bg-${color} text-${
        color === 'white' ? 'black' : 'white'
      } border border-${color === 'white' ? 'black' : color} opacity-${
        disabled ? '50' : '100'
      } cursor-${
        disabled ? 'not-allowed' : 'pointer'
      } uppercase font-display font-extrabold p-4 rounded w-full mr-4 text-lg md:text-base last:mr-0`}
      type="button"
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  )
}

DashboardCard.Title = Title

DashboardCard.Subtitle = Subtitle

DashboardCard.Content = Content

DashboardCard.Footer = Footer

DashboardCard.Action = Action

DashboardCard.More = More
