'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    children, 
    variant = 'primary', 
    size = 'md', 
    isLoading = false, 
    disabled, 
    icon,
    ...props 
  }, ref) => {
    const variantClasses = {
      primary: 'bg-primary-600 hover:bg-primary-700 text-white border border-primary-600 focus:ring-primary-500',
      secondary: 'bg-secondary-600 hover:bg-secondary-700 text-white border border-secondary-600 focus:ring-secondary-500',
      outline: 'bg-white hover:bg-gray-50 text-gray-800 border border-gray-300 hover:border-gray-400 focus:ring-gray-400',
      ghost: 'bg-transparent hover:bg-gray-100 text-gray-800 hover:text-gray-900 focus:ring-gray-400',
      danger: 'bg-red-600 hover:bg-red-700 text-white border border-red-600 focus:ring-red-500',
      success: 'bg-green-600 hover:bg-green-700 text-white border border-green-600 focus:ring-green-500',
    };
    
    const sizeClasses = {
      sm: 'py-1 px-3 text-sm',
      md: 'py-2 px-4 text-base',
      lg: 'py-3 px-6 text-lg',
    };
    
    return (
      <button
        className={cn(
          'font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2',
          variantClasses[variant],
          sizeClasses[size],
          isLoading && 'opacity-70 cursor-not-allowed',
          disabled && 'opacity-50 cursor-not-allowed hover:bg-opacity-100',
          className
        )}
        disabled={disabled || isLoading}
        ref={ref}
        {...props}
      >
        <div className="flex items-center justify-center">
          {isLoading && (
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          )}
          {icon && <span className={`${children ? 'mr-2' : ''}`}>{icon}</span>}
          {children}
        </div>
      </button>
    );
  }
);

Button.displayName = 'Button'; 