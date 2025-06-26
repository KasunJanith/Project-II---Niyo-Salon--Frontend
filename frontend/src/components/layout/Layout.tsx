import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import NotificationBar from './NotificationBar';
const Layout = () => {
  return <div className="flex flex-col min-h-screen bg-gray-50">
      <NotificationBar />
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>;
};
export default Layout;