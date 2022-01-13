import React from 'react'
import { Outlet } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'

export default function Layout() {
  return (
    <>
      <Header />
      <div className="max-w-6xl w-full m-auto px-4">
        <Outlet />
      </div>
      <Footer />
    </>
  )
}
