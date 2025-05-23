'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'success' | 'danger' | 'gray';
  className?: string;
  labelClassName?: string;
  id?: string;
  labelPosition?: 'left' | 'right';
}

export function Toggle({
  checked,
  onChange,
  disabled = false,
  label,
  size = 'md',
  color = 'primary',
  className,
  labelClassName,
  id,
  labelPosition = 'right',
}: ToggleProps) {
  const toggleId = id || `toggle-${Math.random().toString(36).substr(2, 9)}`;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!disabled) {
      onChange(e.target.checked);
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    if (!disabled && e.target instanceof HTMLElement && e.target.tagName !== 'INPUT') {
      onChange(!checked);
    }
  };

  const sizeConfig = {
    sm: {
      toggle: 'w-8 h-4',
      circle: 'w-3 h-3',
      translateX: 'translate-x-4',
    },
    md: {
      toggle: 'w-11 h-6',
      circle: 'w-5 h-5',
      translateX: 'translate-x-5',
    },
    lg: {
      toggle: 'w-14 h-7',
      circle: 'w-6 h-6',
      translateX: 'translate-x-7',
    },
  };

  const colorConfig = {
    primary: 'bg-primary-600',
    secondary: 'bg-secondary-600',
    success: 'bg-green-600',
    danger: 'bg-red-600',
    gray: 'bg-gray-600',
  };

  return (
    <label
      htmlFor={toggleId}
      className={cn(
        'inline-flex items-center',
        disabled && 'opacity-50 cursor-not-allowed',
        !disabled && 'cursor-pointer',
        className
      )}
    >
      {label && labelPosition === 'left' && (
        <span
          className={cn('mr-3 text-sm font-medium text-gray-700', labelClassName)}
          data-testid="toggle-label"
        >
          {label}
        </span>
      )}
      <div className="relative flex-shrink-0" onClick={handleClick}>
        <input
          id={toggleId}
          type="checkbox"
          className="sr-only"
          checked={checked}
          onChange={handleChange}
          disabled={disabled}
          data-testid="toggle-input"
        />
        <div
          className={cn(
            'block rounded-full transition-colors duration-200 ease-in-out',
            sizeConfig[size].toggle,
            checked ? colorConfig[color] : 'bg-gray-300'
          )}
        />
        <div
          className={cn(
            'absolute top-0.5 left-0.5 bg-white rounded-full shadow-md transition-transform duration-200 ease-in-out transform',
            sizeConfig[size].circle,
            checked && sizeConfig[size].translateX
          )}
        />
      </div>
      {label && labelPosition === 'right' && (
        <span
          className={cn('ml-3 text-sm font-medium text-gray-700', labelClassName)}
          data-testid="toggle-label"
        >
          {label}
        </span>
      )}
    </label>
  );
}

Toggle.displayName = 'Toggle'; 