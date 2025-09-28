import React from 'react';
import { Link } from 'react-router-dom';
import { HomeIcon, ArrowLeftIcon } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#212121] to-[#181818] flex flex-col items-center justify-center px-4 py-16 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-[#F7BF24] rounded-full blur-xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-[#F7BF24] rounded-full blur-xl"></div>
      </div>
      
      {/* Main Content */}
      <div className="relative z-10 text-center max-w-2xl mx-auto">
        {/* Decorative Elements */}
        <div className="flex justify-center items-center gap-4 mb-8">
          <div className="w-12 h-px bg-gradient-to-r from-transparent to-[#F7BF24]"></div>
          <div className="w-2 h-2 bg-[#F7BF24] rotate-45"></div>
          <div className="text-[#F7BF24] text-lg">404</div>
          <div className="w-2 h-2 bg-[#F7BF24] rotate-45"></div>
          <div className="w-12 h-px bg-gradient-to-l from-transparent to-[#F7BF24]"></div>
        </div>

        {/* 404 Number */}
        <h1 className="text-8xl md:text-9xl font-bold text-[#F7BF24] mb-4 font-abril tracking-wider">
          404
        </h1>
        
        {/* Title */}
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 font-inter">
          Page Not Found
        </h2>
        
        {/* Description */}
        <p className="text-gray-400 mb-8 text-lg leading-relaxed max-w-md mx-auto">
          Oops! The page you're looking for seems to have wandered off. 
          It might have been moved, renamed, or is taking a little break.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link 
            to="/" 
            className="inline-flex items-center bg-gradient-to-r from-[#F7BF24] to-[#F9D371] text-black px-8 py-4 rounded-full font-inter font-semibold tracking-wide transition-all duration-300 hover:shadow-lg hover:shadow-[#F7BF24]/30 hover:scale-105"
          >
            <HomeIcon size={20} className="mr-2" />
            Back to Home
          </Link>
          
          <button 
            onClick={() => window.history.back()} 
            className="inline-flex items-center border-2 border-[#F7BF24] text-[#F7BF24] bg-transparent px-8 py-4 rounded-full font-inter font-semibold tracking-wide transition-all duration-300 hover:bg-[#F7BF24] hover:text-black"
          >
            <ArrowLeftIcon size={20} className="mr-2" />
            Go Back
          </button>
        </div>

        {/* Additional Info */}
        <div className="mt-12 p-6 bg-[#232323] border border-gray-600 rounded-xl max-w-md mx-auto">
          <h3 className="text-[#F7BF24] font-semibold mb-3">What you can do:</h3>
          <ul className="text-gray-400 text-sm text-left space-y-2">
            <li className="flex items-start">
              <span className="text-[#F7BF24] mr-2">•</span>
              Check the URL for typos
            </li>
            <li className="flex items-start">
              <span className="text-[#F7BF24] mr-2">•</span>
              Use the navigation menu to find what you need
            </li>
            <li className="flex items-start">
              <span className="text-[#F7BF24] mr-2">•</span>
              Contact support if you believe this is an error
            </li>
          </ul>
        </div>
      </div>

      {/* Footer Decoration */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <div className="flex justify-center items-center gap-8">
          <div className="w-16 h-px bg-gradient-to-r from-transparent to-[#F7BF24]"></div>
          <div className="text-[#F7BF24] text-2xl">✦</div>
          <div className="w-16 h-px bg-gradient-to-l from-transparent to-[#F7BF24]"></div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;