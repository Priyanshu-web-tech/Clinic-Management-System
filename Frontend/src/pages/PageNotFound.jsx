import React from 'react';
import { Link } from 'react-router-dom';

const PageNotFound = () => {
  return (
    <div className="flex justify-center items-center h-screen bg-gradient-to-r">
      <div className="text-center">
        <h1 className="text-6xl mb-4 font-bold">404</h1>
        <p className="text-2xl mb-8">Page Not Found</p>
        <p className="text-lg mb-4">Sorry, the page you are looking for does not exist.</p>
        <p className="text-lg mb-8">Please check the URL or go back to the homepage.</p>
        <Link to="/">
        <button className="bg-pale-white border hover:bg-dark text-dark hover:text-pale-white py-2 px-6 rounded-lg shadow-lg  transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-gray-500">
          Go to Homepage
        </button>
        </Link>
        
      </div>
    </div>
  );
};

export default PageNotFound;
