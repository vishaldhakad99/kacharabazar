import React from 'react';
import { PackageOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

export const EmptyState = ({
  icon: Icon = PackageOpen,
  title = 'No records found',
  description = 'There is currently no data matching your criteria.',
  actionLabel,
  actionLink,
  onAction,
}) => {
  return (
    <div className="rounded-3xl p-8 sm:p-12 text-center bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col items-center justify-center my-4">
      <div className="w-14 h-14 rounded-2xl bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 flex items-center justify-center mb-4">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="font-heading font-bold text-lg text-ink dark:text-white mb-1">
        {title}
      </h3>
      <p className="text-sm text-muted max-w-sm mb-6">{description}</p>
      {actionLabel && actionLink && (
        <Link
          to={actionLink}
          className="px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold text-sm shadow-md transition-all active:scale-95"
        >
          {actionLabel}
        </Link>
      )}
      {actionLabel && onAction && !actionLink && (
        <button
          onClick={onAction}
          className="px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold text-sm shadow-md transition-all active:scale-95"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
