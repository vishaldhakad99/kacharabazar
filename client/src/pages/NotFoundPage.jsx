import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Home } from 'lucide-react';

export const NotFoundPage = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <div className="w-16 h-16 rounded-3xl bg-primary-100 dark:bg-primary-950 text-primary-600 flex items-center justify-center mb-4">
        <Compass className="w-8 h-8" />
      </div>
      <h1 className="text-4xl sm:text-5xl font-heading font-black text-ink dark:text-white mb-2">
        404
      </h1>
      <h2 className="text-lg font-bold text-ink dark:text-white mb-1">
        Page Not Found
      </h2>
      <p className="text-xs text-muted max-w-sm mb-6">
        The link you followed may be broken, or the page may have been relocated.
      </p>
      <Link
        to="/"
        className="px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold text-xs shadow-md transition-all active:scale-95 inline-flex items-center gap-1.5"
      >
        <Home className="w-4 h-4" /> Return to Home
      </Link>
    </div>
  );
};

export default NotFoundPage;
