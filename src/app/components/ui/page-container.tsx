'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Button, ButtonProps } from './button';
import { Alert } from './alert';
import { LoadingSpinner } from './loading-spinner';

export interface ActionButton {
  label: string;
  onClick: () => void;
  variant?: ButtonProps['variant'];
  icon?: React.ReactNode;
  size?: ButtonProps['size'];
}

export interface PageContainerProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  actions?: ActionButton[];
  isLoading?: boolean;
  loadingText?: string;
  error?: string;
  containerSize?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

export function PageContainer({
  title,
  description,
  children,
  className,
  actions,
  isLoading = false,
  loadingText = 'Loading...',
  error,
  containerSize = 'lg',
}: PageContainerProps) {
  const containerClasses = {
    sm: 'max-w-3xl',
    md: 'max-w-4xl',
    lg: 'max-w-6xl',
    xl: 'max-w-7xl',
    full: 'max-w-full',
  };

  return (
    <div className={cn(
      'mx-auto py-8 px-4 sm:px-6', 
      containerClasses[containerSize], 
      className
    )}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div className="mb-4 sm:mb-0">
          <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
          {description && (
            <p className="mt-2 text-lg text-gray-600">{description}</p>
          )}
        </div>
        
        {actions && actions.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {actions.map((action, index) => (
              <Button
                key={index}
                onClick={action.onClick}
                variant={action.variant || 'primary'}
                icon={action.icon}
                size={action.size || 'md'}
              >
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </div>

      {error && (
        <div className="mb-6">
          <Alert variant="error" title="Error">
            {error}
          </Alert>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center min-h-[30vh]">
          <LoadingSpinner size="lg" label={loadingText} />
        </div>
      ) : (
        children
      )}
    </div>
  );
}

PageContainer.displayName = 'PageContainer'; 