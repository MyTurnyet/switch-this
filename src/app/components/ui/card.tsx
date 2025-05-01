'use client';

import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface CardProps {
  className?: string;
  children: ReactNode;
  variant?: 'default' | 'outlined' | 'elevated';
  hoverEffect?: boolean;
}

export function Card({ 
  className, 
  children,
  variant = 'default',
  hoverEffect = false
}: CardProps) {
  const variantClasses = {
    default: 'bg-white border border-gray-200 shadow-sm',
    outlined: 'bg-white border border-gray-200',
    elevated: 'bg-white border border-gray-100 shadow-md',
  };

  return (
    <div 
      className={cn(
        'rounded-lg',
        variantClasses[variant],
        hoverEffect && 'transition-all duration-200 hover:shadow-md hover:border-gray-300',
        className
      )}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  className?: string;
  children: ReactNode;
}

export function CardHeader({ className, children }: CardHeaderProps) {
  return (
    <div className={cn('flex flex-col space-y-1.5 p-6 border-b border-gray-100', className)}>
      {children}
    </div>
  );
}

interface CardTitleProps {
  className?: string;
  children: ReactNode;
}

export function CardTitle({ className, children }: CardTitleProps) {
  return (
    <h3 className={cn('text-xl font-semibold leading-none tracking-tight text-gray-900', className)}>
      {children}
    </h3>
  );
}

interface CardDescriptionProps {
  className?: string;
  children: ReactNode;
}

export function CardDescription({ className, children }: CardDescriptionProps) {
  return (
    <p className={cn('text-sm text-gray-500', className)}>
      {children}
    </p>
  );
}

interface CardContentProps {
  className?: string;
  children: ReactNode;
}

export function CardContent({ className, children }: CardContentProps) {
  return (
    <div className={cn('p-6 pt-0', className)}>
      {children}
    </div>
  );
}

interface CardFooterProps {
  className?: string;
  children: ReactNode;
}

export function CardFooter({ className, children }: CardFooterProps) {
  return (
    <div className={cn('flex items-center p-6 pt-0', className)}>
      {children}
    </div>
  );
} 