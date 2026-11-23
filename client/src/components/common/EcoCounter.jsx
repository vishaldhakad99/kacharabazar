import React, { useEffect, useState } from 'react';
import { Coins } from 'lucide-react';

export const EcoCounter = ({ value = 0, size = 'md', showBadge = true }) => {
  const [displayValue, setDisplayValue] = useState(value);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    let start = displayValue;
    const end = value;
    if (start === end) return;

    setAnimating(true);
    const duration = 600;
    const steps = 24;
    const increment = (end - start) / steps;
    let stepCount = 0;

    const timer = setInterval(() => {
      stepCount++;
      start += increment;
      if (stepCount >= steps) {
        setDisplayValue(end);
        clearInterval(timer);
        setTimeout(() => setAnimating(false), 300);
      } else {
        setDisplayValue(Math.round(start));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  const sizeClasses = {
    sm: 'text-base font-semibold',
    md: 'text-xl font-bold',
    lg: 'text-3xl font-extrabold',
    xl: 'text-5xl font-black',
  };

  return (
    <div
      className={`inline-flex items-center gap-1.5 font-heading text-amber-500 dark:text-amber-400 transition-transform duration-300 ${
        animating ? 'scale-105' : 'scale-100'
      }`}
    >
      <div
        className={`p-1 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 transition-all duration-300 ${
          animating ? 'rotate-12 scale-110 shadow-md shadow-amber-500/20' : ''
        }`}
      >
        <Coins className={size === 'xl' ? 'w-8 h-8' : size === 'lg' ? 'w-6 h-6' : 'w-4 h-4'} />
      </div>
      <span className={`${sizeClasses[size]} tracking-tight tabular-nums`}>
        {displayValue.toLocaleString()}
      </span>
      {showBadge && (
        <span className="text-xs uppercase tracking-wider font-semibold text-amber-600 dark:text-amber-300">
          pts
        </span>
      )}
    </div>
  );
};

export default EcoCounter;
