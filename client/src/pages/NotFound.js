import React from 'react';
import { Link } from 'react-router-dom';
import { ExclamationTriangleIcon, HomeIcon } from '@heroicons/react/24/outline';

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-6">
        <ExclamationTriangleIcon className="h-24 w-24 text-gray-400 mx-auto" />
        
        <div className="space-y-2">
          <h1 className="text-6xl font-bold text-gray-900">404</h1>
          <h2 className="text-2xl font-semibold text-gray-700">Page Not Found</h2>
          <p className="text-gray-600 max-w-md mx-auto">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="btn-primary flex items-center space-x-2"
          >
            <HomeIcon className="h-4 w-4" />
            <span>Go Home</span>
          </Link>
          
          <Link
            to="/posts"
            className="btn-outline"
          >
            Browse Posts
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
