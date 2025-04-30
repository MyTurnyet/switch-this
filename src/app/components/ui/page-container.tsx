'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from './button';

export interface PageContainerProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  actions?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
    icon?: React.ReactNode;
  }[];
  isLoading?: boolean;
  loadingText?: string;
  error?: string;
}

export function PageContainer({
  title,
  description,
  children,
  className,
  actions,
  isLoading = false,
  loadingText = 'Loading...',
  error
}: PageContainerProps) {
  return (
    <div className={cn('container mx-auto py-8 px-4', className)}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div className="mb-4 sm:mb-0">
          <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
          {description && (
            <p className="mt-1 text-lg text-gray-500">{description}</p>
          )}
        </div>
        
        {actions && actions.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {actions.map((action, index) => (
              <Button
                key={index}
                onClick={action.onClick}
                variant={action.variant || 'primary'}
                icon={action.icon}
              >
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center min-h-[30vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">{loadingText}</p>
          </div>
        </div>
      ) : (
        children
      )}
    </div>
  );
}

PageContainer.displayName = 'PageContainer'; 