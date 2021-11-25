import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Navigation from './Navigation';
import TotalValueLocked from './TotalValueLocked';
import Footer from './Footer';

export default function Layout() {
  return (
    <>
      <TotalValueLocked />
      <Header />

      <div className="m-auto w-full max-w-6xl">
        <Navigation />
        <Outlet />
      </div>

      <Footer />
    </>
  );
}
