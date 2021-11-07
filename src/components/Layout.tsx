import React from 'react'
import { Outlet } from 'react-router-dom'

export default function Layout() {

  return (
    <>
      <header>
        Header goes here
      </header>

      <Outlet />

      <footer>
        Footer goes here
      </footer>
    </>
  );
}
