import React from "react";
import { Link } from "react-router-dom";
import {
  PhoneIcon,
  MapPinIcon,
  MailIcon,
  ClockIcon,
  InstagramIcon,
  FacebookIcon,
  TwitterIcon,
  ArrowUpIcon,
} from "lucide-react";
import NiyoLogo from "../../assets/Niyo Logo 02.jpg"; // <-- Update the path if needed

const Footer = () => {
  // Back to top handler
  const handleBackToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="relative bg-gradient-to-br from-[#181818] via-[#232323] to-[#181818] text-gray-300 pt-0 pb-0 overflow-hidden">
      {/* Subtle salon tools pattern overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-10 bg-[url('/pattern-salon.svg')] bg-repeat"
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Branding */}
          <div className="flex flex-col items-center md:items-start">
            <img
              src={NiyoLogo}
              alt="Niyo Salon Logo"
              className="w-20 h-20 rounded-md shadow-lg object-cover mx-auto md:mx-0 border-2 border-[#F7BF24] bg-white"
              loading="lazy"
            />
            <h2 className="mt-4 text-2xl font-inter font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent tracking-wide uppercase drop-shadow-lg">
              Niyo Salon
            </h2>
            <div className="w-16 h-0.5 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-xl my-3 shadow-lg" />
            <p className="text-white text-center md:text-left text-base font-inter">
              <i>Transforming Beauty, Redefining Style.</i>
            </p>
          </div>

          {/* Quick Links - Redesigned as a vertical, icon-enhanced list with animated underline */}
          <div>
            <h3 className="text-lg font-bold mb-4 tracking-widest uppercase bg-gradient-to-r from-[#F7BF24] via-[#F7BF24] to-[#F7BF24] bg-clip-text text-transparent drop-shadow">
              Quick Links
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/"
                  className="flex items-center group font-semibold text-gray-400 hover:text-white transition-colors duration-200"
                  aria-label="Home"
                >
                  <span className="mr-3">
                    <svg
                      width="18"
                      height="18"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="inline-block group-hover:scale-110 transition-transform duration-200"
                    >
                      <path d="M3 9.5L9 4l6 5.5" />
                      <path d="M4 10v6h4v-4h4v4h4v-6" />
                    </svg>
                  </span>
                  HOME
                  <span className="block ml-2 h-0.5 w-0 bg-white group-hover:w-8 transition-all duration-300 rounded"></span>
                </Link>
              </li>
              <li>
                <Link
                  to="/appointments"
                  className="flex items-center group font-semibold  text-gray-400 hover:text-white transition-colors duration-200"
                  aria-label="Book Appointment"
                >
                  <span className="mr-3">
                    <svg
                      width="18"
                      height="18"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="inline-block group-hover:scale-110 transition-transform duration-200"
                    >
                      <rect x="3" y="5" width="12" height="10" rx="2" />
                      <path d="M8 2v2m4-2v2M3 9h12" />
                    </svg>
                  </span>
                  BOOK APPOINTMENT
                  <span className="block ml-2 h-0.5 w-0 bg-white group-hover:w-8 transition-all duration-300 rounded"></span>
                </Link>
              </li>
              <li>
                <Link
                  to="/gallery"
                  className="flex items-center group font-semibold text-gray-400 hover:text-white transition-colors duration-200"
                  aria-label="Gallery"
                >
                  <span className="mr-3">
                    <svg
                      width="18"
                      height="18"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="inline-block group-hover:scale-110 transition-transform duration-200"
                    >
                      <rect x="3" y="3" width="12" height="12" rx="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <path d="M21 15l-5-5-4 4-6-6" />
                    </svg>
                  </span>
                  GALLERY
                  <span className="block ml-2 h-0.5 w-0 bg-white group-hover:w-8 transition-all duration-300 rounded"></span>
                </Link>
              </li>
              <li>
                <Link
                  to="/blog"
                  className="flex items-center group font-semibold text-gray-400 hover:text-white transition-colors duration-200"
                  aria-label="Blog"
                >
                  <span className="mr-3">
                    <svg
                      width="18"
                      height="18"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="inline-block group-hover:scale-110 transition-transform duration-200"
                    >
                      <rect x="4" y="4" width="10" height="10" rx="2" />
                      <path d="M8 2v2m4-2v2M3 9h12" />
                    </svg>
                  </span>
                  OUR BLOG
                  <span className="block ml-2 h-0.5 w-0 bg-white group-hover:w-8 transition-all duration-300 rounded"></span>
                </Link>
              </li>
            </ul>
          </div>  

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-bold mb-4 tracking-widest uppercase bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent drop-shadow">
              Contact Us
            </h3>
            <ul className="space-y-4 text-gray-400">
              <li className="flex items-start group">
                <MapPinIcon
                  size={20}
                  className="mr-3 mt-1 text-[#F7BF24] group-hover:scale-110 group-hover:drop-shadow-glow transition-all duration-200"
                  aria-label="Address"
                />
                <span>123 Style Street, Fashion District, NY 10001</span>
              </li>
              <li className="flex items-center group">
                <PhoneIcon
                  size={20}
                  className="mr-3 text-[#F7BF24] group-hover:scale-110 group-hover:drop-shadow-glow transition-all duration-200"
                  aria-label="Phone"
                />
                <span>(555) 123-4567</span>
              </li>
              <li className="flex items-center group">
                <MailIcon
                  size={20}
                  className="mr-3 text-[#F7BF24] group-hover:scale-110 group-hover:drop-shadow-glow transition-all duration-200"
                  aria-label="Email"
                />
                <span>contact@niyosalon.com</span>
              </li>
              <li className="flex items-start group">
                <ClockIcon
                  size={20}
                  className="mr-3 mt-1 text-[#F7BF24] group-hover:scale-110 group-hover:drop-shadow-glow transition-all duration-200"
                  aria-label="Hours"
                />
                <div className="flex flex-col sm:flex-row gap-x-4">
                  <span>
                    <span className="font-semibold text-white">Mon-Sat:</span>{" "}
                    9:00 AM - 8:00 PM
                  </span>
                  <span>
                    <span className="font-semibold text-white">Sun:</span> 10:00
                    AM - 4:00 PM
                  </span>
                </div>
              </li>
            </ul>
          </div>

          {/* Newsletter & Social */}
          <div className="flex flex-col items-center md:items-end">
            <h3 className="text-lg font-bold mb-4 tracking-widest uppercase bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent drop-shadow">
              Stay Connected
            </h3>
            <form
              className="flex w-full max-w-xs mb-6"
              onSubmit={(e) => {
                e.preventDefault();
                // handle subscribe
              }}
              aria-label="Newsletter Subscription"
            >
              <input
                type="email"
                required
                placeholder="Your email"
                className="flex-1 px-4 py-2 rounded-l-md bg-[#232323] text-white border-t border-b border-l border-[#F7BF24] focus:outline-none focus:ring-2 focus:ring-[#F7BF24] placeholder-gray-400"
                aria-label="Email address"
              />
              <button
                type="submit"
                className="px-5 py-2 rounded-r-3xl bg-gradient-to-r from-yellow-400 to-yellow-600 text-[#181818] font-bold uppercase tracking-widest hover:from-[#F7BF24] hover:to-[#F7BF24] transition-all duration-200"
                aria-label="Subscribe"
              >
                Subscribe
              </button>
            </form>
            <div className="flex space-x-4 mt-2">
              <a
                href="#"
                aria-label="Instagram"
                className="transition-transform duration-200 hover:scale-125"
              >
                <InstagramIcon
                  size={28}
                  className="text-pink-500 hover:text-[#F7BF24] transition-colors duration-200"
                />
              </a>
              <a
                href="#"
                aria-label="Facebook"
                className="transition-transform duration-200 hover:scale-125"
              >
                <FacebookIcon
                  size={28}
                  className="text-blue-500 hover:text-[#F7BF24] transition-colors duration-200"
                />
              </a>
              <a
                href="#"
                aria-label="Twitter"
                className="transition-transform duration-200 hover:scale-125"
              >
                <TwitterIcon
                  size={28}
                  className="text-blue-400 hover:text-[#F7BF24] transition-colors duration-200"
                />
              </a>
            </div>
          </div>
        </div>
        {/* Copyright */}
        <div className="mt-12 border-t border-[#F7BF24]/30 pt-8 text-center text-sm text-gray-400">
          <p>
            &copy; {new Date().getFullYear()}{" "}
            <span className="text-[#F7BF24] font-semibold">Niyo Salon</span>.
            All rights reserved.
          </p>
        </div>
      </div>

      {/* Back to Top Button */}
      <button
        onClick={handleBackToTop}
        aria-label="Back to top"
        className="fixed bottom-6 right-6 z-50 bg-gradient-to-br from-[#F7BF24] via-[#F7BF24] to-[#F7BF24] text-[#181818] shadow-2xl p-3 rounded-full hover:scale-110 hover:shadow-gold transition-all duration-300 border-2 border-white/10"
      >
        <ArrowUpIcon size={28} />
      </button>
    </footer>
  );
};

export default Footer;
