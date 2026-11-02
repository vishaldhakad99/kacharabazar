import React from 'react';

export const LoadingSkeleton = ({ count = 3, type = 'card' }) => {
  return (
    <div className="space-y-4 w-full">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="rounded-2xl p-5 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm animate-pulse flex flex-col gap-3"
        >
          <div className="flex items-center justify-between">
            <div className="h-4 w-1/3 bg-gray-200 dark:bg-gray-800 rounded" />
            <div className="h-4 w-16 bg-gray-200 dark:bg-gray-800 rounded-full" />
          </div>
          <div className="h-3 w-3/4 bg-gray-200 dark:bg-gray-800 rounded" />
          <div className="flex items-center gap-3 mt-2">
            <div className="h-8 w-20 bg-gray-200 dark:bg-gray-800 rounded-xl" />
            <div className="h-8 w-24 bg-gray-200 dark:bg-gray-800 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default LoadingSkeleton;
