'use client';

import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

export interface TooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  position?: 'top' | 'right' | 'bottom' | 'left';
  delay?: number;
  className?: string;
  contentClassName?: string;
  variant?: 'dark' | 'light' | 'primary';
}

export function Tooltip({
  children,
  content,
  position = 'top',
  delay = 300,
  className,
  contentClassName,
  variant = 'dark',
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showTip = () => {
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const hideTip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const positionStyles = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
  };

  const arrowPositions = {
    top: 'bottom-[-6px] left-1/2 -translate-x-1/2 border-t-current border-x-transparent border-b-transparent',
    right: 'left-[-6px] top-1/2 -translate-y-1/2 border-r-current border-y-transparent border-l-transparent',
    bottom: 'top-[-6px] left-1/2 -translate-x-1/2 border-b-current border-x-transparent border-t-transparent',
    left: 'right-[-6px] top-1/2 -translate-y-1/2 border-l-current border-y-transparent border-r-transparent',
  };

  const variantStyles = {
    dark: 'text-white bg-gray-900 border-gray-900',
    light: 'text-gray-900 bg-white border-gray-200 shadow-sm',
    primary: 'text-white bg-primary-600 border-primary-600',
  };

  return (
    <div className={cn('relative inline-flex', className)} onMouseEnter={showTip} onMouseLeave={hideTip}>
      {children}
      {isVisible && (
        <div
          ref={tooltipRef}
          className={cn(
            'absolute z-50 px-2 py-1 text-sm rounded border max-w-xs whitespace-normal break-words',
            positionStyles[position],
            variantStyles[variant],
            contentClassName
          )}
          role="tooltip"
        >
          {content}
          <div
            className={cn(
              'absolute border-[6px] border-solid',
              arrowPositions[position],
              variant === 'dark' ? 'border-t-gray-900' : 
              variant === 'light' ? 'border-t-white' : 
              'border-t-primary-600'
            )}
          ></div>
        </div>
      )}
    </div>
  );
}

Tooltip.displayName = 'Tooltip'; 