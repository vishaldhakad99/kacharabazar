import React from 'react';
import { CheckCircle2, Clock, Truck, ShieldCheck, XCircle, AlertCircle } from 'lucide-react';

const steps = [
  { id: 'pending', label: 'Requested', desc: 'Awaiting ward dispatch' },
  { id: 'assigned', label: 'Assigned', desc: 'Worker & vehicle allocated' },
  { id: 'on_the_way', label: 'On The Way', desc: 'Truck within ward sector' },
  { id: 'collected', label: 'Collected', desc: 'Waste loaded into vehicle' },
  { id: 'verified', label: 'Verified', desc: 'Segregation checked & points issued' },
];

export const StatusTimeline = ({ status = 'pending', segregation = null, points = 0 }) => {
  if (status === 'cancelled') {
    return (
      <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900">
        <XCircle className="w-5 h-5 flex-shrink-0" />
        <div>
          <p className="font-semibold text-sm">Pickup Cancelled</p>
          <p className="text-xs text-red-600 dark:text-red-300">This request was cancelled by the citizen.</p>
        </div>
      </div>
    );
  }

  if (status === 'missed') {
    return (
      <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900">
        <AlertCircle className="w-5 h-5 flex-shrink-0" />
        <div>
          <p className="font-semibold text-sm">Pickup Rescheduled / Missed</p>
          <p className="text-xs text-amber-700 dark:text-amber-400">Our vehicle could not access the location. It will be collected in the next shift.</p>
        </div>
      </div>
    );
  }

  const stepOrder = ['pending', 'assigned', 'on_the_way', 'collected', 'verified'];
  const currentIndex = stepOrder.indexOf(status);

  return (
    <div className="py-2">
      <div className="flex items-center justify-between relative">
        {/* Continuous connector line */}
        <div className="absolute top-4 left-4 right-4 h-0.5 bg-gray-200 dark:bg-gray-800 -z-0" />
        <div
          className="absolute top-4 left-4 h-0.5 bg-primary-600 transition-all duration-500 -z-0"
          style={{
            width: `${Math.max(0, (currentIndex / (steps.length - 1)) * 100)}%`,
          }}
        />

        {steps.map((step, idx) => {
          const isDone = idx < currentIndex;
          const isCurrent = idx === currentIndex;

          return (
            <div key={step.id} className="flex flex-col items-center relative z-10">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 ${
                  isDone
                    ? 'bg-primary-600 text-white shadow-md'
                    : isCurrent
                    ? 'bg-accent-500 text-white ring-4 ring-accent-200 dark:ring-accent-950 shadow-md'
                    : 'bg-white dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-700 text-muted'
                }`}
              >
                {isDone ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
              </div>
              <span
                className={`mt-2 text-[11px] sm:text-xs font-medium text-center ${
                  isCurrent
                    ? 'text-accent-600 dark:text-accent-400 font-bold'
                    : isDone
                    ? 'text-primary-700 dark:text-primary-300'
                    : 'text-muted'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

      {status === 'verified' && (
        <div className="mt-4 p-3 rounded-xl bg-primary-50 dark:bg-primary-950/50 border border-primary-200 dark:border-primary-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-primary-600" />
            <span className="text-xs font-semibold text-primary-900 dark:text-primary-200">
              Segregation Verified:{' '}
              <span className="capitalize underline">{segregation || 'Correct'}</span>
            </span>
          </div>
          {points > 0 && (
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-accent-500 text-white">
              +{points} pts credited
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default StatusTimeline;
