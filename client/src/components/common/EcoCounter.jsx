import React, { useEffect, useState } from 'react';
import { Sparkles, Coins } from 'lucide-react';

export const EcoCounter = ({ value = 0, size = 'md', showBadge = true }) => {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    let start = displayValue;
    const end = value;
    if (start === end) return;

    const duration = 600;
    const steps = 20;
    const increment = (end - start) / steps;
    let stepCount = 0;

    const timer = setInterval(() => {
      stepCount++;
      start += increment;
      if (stepCount >= steps) {
        setDisplayValue(end);
        clearInterval(timer);
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
    <div className="inline-flex items-center gap-1.5 font-heading text-accent-600 dark:text-accent-400">
      <div className="p-1 rounded-full bg-accent-100 dark:bg-accent-950/60 text-accent-600 dark:text-accent-400 animate-bounce">
        <Coins className={size === 'xl' ? 'w-8 h-8' : size === 'lg' ? 'w-6 h-6' : 'w-4 h-4'} />
      </div>
      <span className={sizeClasses[size]}>{displayValue.toLocaleString()}</span>
      {showBadge && (
        <span className="text-xs uppercase tracking-wider font-semibold text-accent-700 dark:text-accent-300">
          pts
        </span>
      )}
    </div>
  );
};

export default EcoCounter;
