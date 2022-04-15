import React from 'react'
import { Outlet } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'

export default function Layout() {
  return (
    <>
      <Header />
      <div className="max-w-6xl w-full m-auto mt-8 md:mt-0 px-4">
        <Outlet />
      </div>
      <Footer />
    </>
  )
}
