'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface LoadingSpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
  color?: 'primary' | 'secondary' | 'white' | 'gray';
  label?: string;
}

export function LoadingSpinner({ 
  size = 'md', 
  className,
  color = 'primary',
  label
}: LoadingSpinnerProps) {
  const sizeClasses = {
    xs: 'h-3 w-3',
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  const colorClasses = {
    primary: 'text-primary-600',
    secondary: 'text-secondary-600',
    white: 'text-white',
    gray: 'text-gray-400',
  };
  
  return (
    <div className="flex flex-col items-center justify-center">
      <svg 
        className={cn(
          'animate-spin',
          sizeClasses[size],
          colorClasses[color],
          className
        )} 
        xmlns="http://www.w3.org/2000/svg" 
        fill="none" 
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle 
          className="opacity-25" 
          cx="12" 
          cy="12" 
          r="10" 
          stroke="currentColor" 
          strokeWidth="4"
        ></circle>
        <path 
          className="opacity-75" 
          fill="currentColor" 
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
      {label && (
        <span className={cn(
          'mt-2 text-sm font-medium',
          colorClasses[color]
        )}>
          {label}
        </span>
      )}
    </div>
  );
}

LoadingSpinner.displayName = 'LoadingSpinner'; 