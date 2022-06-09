import React from 'react'
import { Link, Outlet } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'

export default function Layout() {
  return (
    <>
    <div style={{backgroundColor: "#d8121b", color: 'white', textAlign: "center"}}>Please withdraw from <Link to="/farms?category=arbis"><u>stARBIS</u></Link> and <Link to="/exchange"><u>exchange your ARBIS for UMAMI</u></Link> to continue earning rewards</div>
      <Header />
      <div className="max-w-6xl w-full m-auto mt-8 md:mt-0 px-4">
        <Outlet />
      </div>
      <Footer />
    </>
  )
}
