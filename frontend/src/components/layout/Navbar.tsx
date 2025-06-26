import { Link, useLocation, useNavigate } from 'react-router-dom';
import { MenuIcon, XIcon } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import logo from '../../assets/Niyo Logo.jpg'; // Ensure the extension matches your file
import axios from 'axios';
import useUserData from '../../hooks/useUserData';

const navLinks = [
  { name: "Home", path: "/" },
  { name: "Services", path: "/services" },
  { name: "Appointments", path: "/appointments" },
  { name: "Gallery", path: "/gallery" },
  { name: "Blog", path: "/blog" },
];

// Simulate getting user info from localStorage (replace with your auth logic)
const getUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const user = useUserData();

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.reload();
    navigate('/login');
  };

  return (
    <nav className="bg-gradient-to-r from-black via-gray-950 to-black shadow-lg sticky top-0 z-50 font-inter">
      <div className=" mx-auto px-4 sm:px-8 flex items-center justify-between h-20">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="Niyo Salon Logo" className="h-12 w-auto rounded shadow-lg" />
          <span className="text-2xl text-[#F7BF24] tracking-wide font-inter hidden sm:block uppercase font-semibold">Niyo Salon</span>
        </Link>
        {/* Desktop Menu */}
        <ul className="hidden md:flex items-center space-x-2">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <li key={link.name}>
                <Link
                  to={link.path}
                  className={
                    isActive
                      ? "border-[#F7BF24] \ border-t border-b rounded-t py-2 px-4 text-[#F7BF24] font-semibold shadow transition"
                      : "bg-transparent py-2 px-4 text-white hover:text-[#F7BF24] transition"
                  }
                >
                  {link.name}
                </Link>
              </li>
            );
          })}
        </ul>
        {/* Auth Buttons / User Info */}
        <div className="flex items-center space-x-4 font-inter">
          {user.id <= 0 ? (
            <>
              <Link
                to="/login"
                className="hidden md:inline-block px-5 py-2 rounded-sm bg-white text-black font-semibold shadow hover:bg-[#F7BF24] hover:text-[black] transition"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="hidden md:inline-block px-5 py-2 rounded-sm bg-[#F7BF24] text-black font-semibold shadow hover:bg-white hover:text-black transition"
              >
                Sign Up
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <span className="text-white font-semibold text-lg">
                Hi, {user.username}
              </span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-full bg-red-500 text-white font-semibold shadow hover:bg-red-700 transition"
              >
                Logout
              </button>
            </div>
          )}
          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-white focus:outline-none"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <XIcon size={28} /> : <MenuIcon size={28} />}
          </button>
        </div>
      </div>
      {/* Mobile Menu */}
      {isMenuOpen && (
        <ul className="md:hidden flex flex-col border-b bg-black/95 px-4 pb-4">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <li key={link.name}>
                <Link
                  to={link.path}
                  className={
                    isActive
                      ? "bg-white border-l border-t border-r rounded-t py-2 px-4 text-blue-700 font-semibold shadow transition block"
                      : "bg-transparent py-2 px-4 text-white hover:text-yellow-400 font-semibold transition block"
                  }
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.name}
                </Link>
              </li>
            );
          })}
          {!user ? (
            <div className="flex flex-col gap-2 mt-4">
              <Link
                to="/login"
                className="px-5 py-2 rounded-full bg-white text-blue-700 font-semibold shadow hover:bg-yellow-400 hover:text-black transition"
                onClick={() => setIsMenuOpen(false)}
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-5 py-2 rounded-full bg-yellow-400 text-black font-semibold shadow hover:bg-white hover:text-blue-700 transition"
                onClick={() => setIsMenuOpen(false)}
              >
                Sign Up
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-2 mt-4">
              <span className="text-white font-semibold text-lg">
                Hi, {user.firstName}
              </span>
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  handleLogout();
                }}
                className="px-4 py-2 rounded-full bg-red-500 text-white font-semibold shadow hover:bg-red-700 transition"
              >
                Logout
              </button>
            </div>
          )}
        </ul>
      )}
    </nav>
  );
};

export default Navbar;