import React from 'react';
import { theme } from '../../styles/theme';
import clsx from 'clsx';

type BadgeVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'error';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
  testId?: string;
}

export const Badge: React.FC<BadgeProps> = ({ 
  children, 
  variant = 'primary',
  className,
  testId
}) => {
  const variantStyles = {
    primary: 'bg-primary-100 text-primary-700',
    secondary: 'bg-secondary-100 text-secondary-700',
    success: 'bg-success-100 text-success-600',
    warning: 'bg-warning-100 text-warning-600',
    error: 'bg-error-100 text-error-600',
  };

  return (
    <span
      data-testid={testId}
      className={clsx(
        theme.components.badge,
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}; 