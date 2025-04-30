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
}

export function Tooltip({
  children,
  content,
  position = 'top',
  delay = 300,
  className,
  contentClassName,
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsVisible(false);
  };

  // Position the tooltip
  useEffect(() => {
    const positionTooltip = () => {
      const triggerElement = tooltipRef.current?.parentElement;
      const tooltipElement = tooltipRef.current?.querySelector('[role="tooltip"]') as HTMLElement;
      
      if (!triggerElement || !tooltipElement || !isVisible) return;
      
      const triggerRect = triggerElement.getBoundingClientRect();
      const tooltipRect = tooltipElement.getBoundingClientRect();
      
      // Calculate positions
      const positions = {
        top: {
          top: -tooltipRect.height - 8,
          left: (triggerRect.width - tooltipRect.width) / 2,
        },
        right: {
          top: (triggerRect.height - tooltipRect.height) / 2,
          left: triggerRect.width + 8,
        },
        bottom: {
          top: triggerRect.height + 8,
          left: (triggerRect.width - tooltipRect.width) / 2,
        },
        left: {
          top: (triggerRect.height - tooltipRect.height) / 2,
          left: -tooltipRect.width - 8,
        },
      };
      
      const pos = positions[position];
      tooltipElement.style.top = `${pos.top}px`;
      tooltipElement.style.left = `${pos.left}px`;
    };

    if (isVisible) {
      // Position on show and on resize
      positionTooltip();
      window.addEventListener('resize', positionTooltip);
      window.addEventListener('scroll', positionTooltip);
    }
    
    return () => {
      window.removeEventListener('resize', positionTooltip);
      window.removeEventListener('scroll', positionTooltip);
    };
  }, [isVisible, position]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const positionClasses = {
    top: 'bottom-full mb-2',
    right: 'left-full ml-2',
    bottom: 'top-full mt-2',
    left: 'right-full mr-2',
  };

  return (
    <div
      ref={tooltipRef}
      className={cn('relative inline-block', className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleMouseEnter}
      onBlur={handleMouseLeave}
    >
      {children}
      
      {isVisible && (
        <div
          role="tooltip"
          className={cn(
            'absolute z-50 px-3 py-2 text-sm font-medium text-white bg-gray-900 rounded-md shadow-sm max-w-xs',
            positionClasses[position],
            contentClassName
          )}
        >
          {content}
          <div
            className={cn(
              'absolute w-2 h-2 bg-gray-900 transform rotate-45',
              position === 'top' && 'bottom-[-4px] left-1/2 -translate-x-1/2',
              position === 'right' && 'left-[-4px] top-1/2 -translate-y-1/2',
              position === 'bottom' && 'top-[-4px] left-1/2 -translate-x-1/2',
              position === 'left' && 'right-[-4px] top-1/2 -translate-y-1/2'
            )}
          />
        </div>
      )}
    </div>
  );
} 