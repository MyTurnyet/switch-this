import React from 'react';
import { theme } from '../../styles/theme';
import clsx from 'clsx';

type ButtonVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'error';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  className?: string;
  testId?: string;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary',
  className,
  testId,
  ...props
}) => {
  return (
    <button
      data-testid={testId}
      className={clsx(
        theme.components.button.base,
        theme.components.button[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}; 