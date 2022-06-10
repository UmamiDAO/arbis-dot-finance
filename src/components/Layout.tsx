import React from 'react'
import { Link, Outlet } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'

export default function Layout() {
  return (
    <>
      <div className="text-white bg-primary text-center py-2 text-sm">
        Please withdraw from{' '}
        <Link to="/farms?category=arbis" className="underline">
          stARBIS
        </Link>
        <span> and </span>
        <Link to="/exchange" className="underline">
          exchange your ARBIS for UMAMI
        </Link>
        <span> to continue earning rewards </span>
      </div>
      <Header />
      <div className="max-w-6xl w-full m-auto mt-8 md:mt-0 px-4">
        <Outlet />
      </div>
      <Footer />
    </>
  )
}
