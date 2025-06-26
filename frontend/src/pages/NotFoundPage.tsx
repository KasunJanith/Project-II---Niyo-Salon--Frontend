import React from 'react';
import { Link } from 'react-router-dom';
import { HomeIcon } from 'lucide-react';
const NotFoundPage = () => {
  return <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 py-16">
      <h1 className="text-6xl font-bold text-purple-700 mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-gray-900 mb-4">
        Page Not Found
      </h2>
      <p className="text-gray-600 mb-8 text-center max-w-md">
        The page you are looking for might have been removed, had its name
        changed, or is temporarily unavailable.
      </p>
      <Link to="/" className="inline-flex items-center bg-purple-700 text-white px-6 py-3 rounded-md hover:bg-purple-800">
        <HomeIcon size={18} className="mr-2" />
        Go back home
      </Link>
    </div>;
};
export default NotFoundPage;