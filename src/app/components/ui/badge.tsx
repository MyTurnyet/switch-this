'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info';
  size?: 'sm' | 'md' | 'lg';
  outlined?: boolean;
}

export function Badge({
  children,
  className,
  variant = 'primary',
  size = 'md',
  outlined = false,
  ...props
}: BadgeProps) {
  const variantClasses = {
    primary: outlined
      ? 'bg-white text-primary-700 border border-primary-300'
      : 'bg-primary-100 text-primary-800',
    secondary: outlined
      ? 'bg-white text-secondary-700 border border-secondary-300'
      : 'bg-secondary-100 text-secondary-800',
    success: outlined
      ? 'bg-white text-green-700 border border-green-300'
      : 'bg-green-100 text-green-800',
    danger: outlined
      ? 'bg-white text-red-700 border border-red-300'
      : 'bg-red-100 text-red-800',
    warning: outlined
      ? 'bg-white text-amber-700 border border-amber-300'
      : 'bg-amber-100 text-amber-800',
    info: outlined
      ? 'bg-white text-blue-700 border border-blue-300'
      : 'bg-blue-100 text-blue-800',
  };

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-0.5',
    lg: 'text-base px-3 py-1',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

Badge.displayName = 'Badge'; 