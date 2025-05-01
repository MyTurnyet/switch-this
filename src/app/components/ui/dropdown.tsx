'use client';

import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

export interface DropdownItemProps extends React.HTMLAttributes<HTMLButtonElement> {
  disabled?: boolean;
  icon?: React.ReactNode;
}

export const DropdownItem = React.forwardRef<HTMLButtonElement, DropdownItemProps>(
  ({ className, children, disabled, icon, onClick, ...props }, ref) => {
    return (
      <button
        className={cn(
          'w-full flex items-center px-4 py-2 text-sm text-left hover:bg-gray-100 focus:outline-none',
          disabled && 'opacity-50 cursor-not-allowed pointer-events-none',
          className
        )}
        onClick={onClick}
        disabled={disabled}
        ref={ref}
        type="button"
        {...props}
      >
        {icon && <span className="mr-2">{icon}</span>}
        {children}
      </button>
    );
  }
);

DropdownItem.displayName = 'DropdownItem';

export interface DropdownProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  align?: 'left' | 'right';
  className?: string;
}

export function Dropdown({
  trigger,
  children,
  align = 'left',
  className,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = (event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Wrap children with click handler that closes dropdown
  const wrappedChildren = React.Children.map(children, (child) => {
    if (React.isValidElement<DropdownItemProps>(child) && child.type === DropdownItem) {
      return React.cloneElement(child, {
        onClick: (e: React.MouseEvent<HTMLButtonElement>) => {
          if (child.props.onClick) {
            child.props.onClick(e as React.MouseEvent<HTMLButtonElement>);
          }
          if (!child.props.disabled) {
            setIsOpen(false);
          }
        },
      });
    }
    return child;
  });

  return (
    <div className={cn('relative inline-block text-left', className)} ref={dropdownRef}>
      {/* Trigger */}
      <div onClick={() => setIsOpen(!isOpen)}>
        {trigger}
      </div>

      {/* Dropdown Menu */}
      <div
        className={cn(
          'absolute z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none',
          align === 'left' ? 'left-0' : 'right-0',
          !isOpen && 'hidden'
        )}
        role="menu"
        aria-orientation="vertical"
        aria-labelledby="menu-button"
      >
        <div className="py-1" role="none">
          {wrappedChildren}
        </div>
      </div>
    </div>
  );
} 