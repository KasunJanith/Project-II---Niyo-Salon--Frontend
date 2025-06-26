import { Link, useLocation, useNavigate } from 'react-router-dom';
import { MenuIcon, XIcon } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import logo from '../../assets/Niyo Logo.jpg'; // Ensure the extension matches your file
import axios from 'axios';
import useUserData from '../../hooks/useUserData';

const navLinks = [
  { name: "Home", path: "/" },
  { name: "Services", path: "/services" },
  { name: "Gallery", path: "/gallery" },
  { name: "Blog", path: "/blog" },
  { name: "About Us", path: "/aboutus" },
  { name: "Appointments", path: "/appointments" },
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
    <nav className="bg-[#212121] backdrop-blur-md sticky top-0 z-50 font-inter border-b border-[#F7BF24]/20">
      {/* Subtle Top Accent */}
      <div className="h-px bg-gradient-to-r from-transparent via-[#F7BF24] to-transparent opacity-60"></div>
      
      <div className=" mx-auto px-6 sm:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Minimalist Logo */}
          <Link to="/" className="flex items-center gap-4 group">
            <div className="relative">
              <div className="absolute inset-0 bg-[#F7BF24]/20 rounded-md blur-sm group-hover:bg-[#F7BF24]/30 transition-all duration-300"></div>
              <img 
                src={logo} 
                alt="Niyo Salon" 
                className="relative h-12 w-12 rounded-md object-cover border border-[#F7BF24]/40 group-hover:border-[#F7BF24] transition-all duration-300" 
              />
            </div>
            <div className="hidden sm:flex flex-col">
              <span className="text-2xl text-[#F7BF24] font-inter tracking-[2px] font-bold">NIYO</span>
              <span className="text-xs text-[#F7BF24] font-inter tracking-[1px] uppercase">Salon</span>
            </div>
          </Link>

          {/* Clean Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`
                    relative py-2 px-1 font-inter text-sm tracking-wide transition-all duration-300 group
                    ${isActive 
                      ? "text-[#F7BF24] font-semibold" 
                      : "text-white/80 hover:text-[#F7BF24]"
                    }
                  `}
                >
                  {link.name.toUpperCase()}
                  {/* Elegant Underline */}
                  <div className={`
                    absolute bottom-0 left-0 h-0.5 bg-[#F7BF24] transition-all duration-300
                    ${isActive ? "w-full" : "w-0 group-hover:w-full"}
                  `}></div>
                </Link>
              );
            })}
          </div>

          {/* Simple Auth Section */}
          <div className="flex items-center space-x-4">
            {user.id <= 0 ? (
              <div className="hidden md:flex items-center space-x-3">
                <Link
                  to="/login"
                  className="px-6 py-2 text-sm font-semibold text-white border border-[#F7BF24]/30 rounded-lg hover:border-[#F7BF24] hover:bg-[#F7BF24]/10 transition-all duration-300 tracking-wide"
                >
                  LOGIN
                </Link>
                <Link
                  to="/register"
                  className="px-6 py-2 text-sm font-semibold text-black bg-[#F7BF24] rounded-lg hover:bg-[#F7BF24]/90 transition-all duration-300 tracking-wide shadow-lg shadow-[#F7BF24]/20"
                >
                  SIGN UP
                </Link>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-4">
                <div className="flex items-center gap-3 px-4 py-1 bg-black/30 rounded-full border border-[#F7BF24]/20">
                  <div className="w-8 h-8 bg-gradient-to-br from-[#F7BF24] to-yellow-500 rounded-full flex items-center justify-center text-black font-bold text-sm">
                    {user.username?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-white font-medium text-sm">{user.username}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm font-semibold text-white border border-red-500/50 rounded-lg hover:border-red-500 hover:bg-red-500/10 transition-all duration-300"
                >
                  LOGOUT
                </button>
              </div>
            )}
            
            {/* Sleek Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg bg-[#F7BF24]/10 border border-[#F7BF24]/30 text-[#F7BF24] hover:bg-[#F7BF24]/20 transition-all duration-300"
              aria-label="Menu"
            >
              {isMenuOpen ? <XIcon size={20} /> : <MenuIcon size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Clean Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-[#212121] border-t border-[#F7BF24]/20">
          <div className="px-6 py-4 space-y-3">
            {/* Mobile Navigation */}
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`
                    block px-4 py-3 rounded-lg font-inter text-sm tracking-wide transition-all duration-300
                    ${isActive
                      ? "bg-[#F7BF24]/20 text-[#F7BF24] font-semibold border-l-2 border-[#F7BF24]"
                      : "text-white/80 hover:text-[#F7BF24] hover:bg-white/5"
                    }
                  `}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.name.toUpperCase()}
                </Link>
              );
            })}
            
            {/* Mobile Auth */}
            <div className="pt-4 border-t border-[#F7BF24]/20">
              {user.id <= 0 ? (
                <div className="space-y-3">
                  <Link
                    to="/login"
                    className="block w-full px-4 py-3 text-center text-sm font-semibold text-white border border-[#F7BF24]/30 rounded-lg hover:border-[#F7BF24] hover:bg-[#F7BF24]/10 transition-all duration-300"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    LOGIN
                  </Link>
                  <Link
                    to="/register"
                    className="block w-full px-4 py-3 text-center text-sm font-semibold text-black bg-[#F7BF24] rounded-lg hover:bg-[#F7BF24]/90 transition-all duration-300"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    SIGN UP
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 px-4 py-3 bg-black/30 rounded-lg">
                    <div className="w-8 h-8 bg-gradient-to-br from-[#F7BF24] to-yellow-500 rounded-full flex items-center justify-center text-black font-bold text-sm">
                      {user.username?.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-white font-medium">{user.username}</span>
                  </div>
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      handleLogout();
                    }}
                    className="w-full px-4 py-3 text-center text-sm font-semibold text-white border border-red-500/50 rounded-lg hover:border-red-500 hover:bg-red-500/10 transition-all duration-300"
                  >
                    LOGOUT
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;