'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  children: React.ReactNode;
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void;
  className?: string;
}

export function Form({ children, onSubmit, className, ...props }: FormProps) {
  return (
    <form
      className={cn('space-y-4', className)}
      onSubmit={onSubmit}
      {...props}
    >
      {children}
    </form>
  );
}

export interface FormGroupProps {
  children: React.ReactNode;
  className?: string;
  error?: string;
  hint?: string;
  inline?: boolean;
}

export function FormGroup({
  children,
  className,
  error,
  hint,
  inline = false,
}: FormGroupProps) {
  return (
    <div className={cn(inline ? 'flex items-start' : 'space-y-2', className)}>
      {children}
      {hint && <p className="text-sm text-gray-500">{hint}</p>}
      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export interface FormLabelProps
  extends React.LabelHTMLAttributes<HTMLLabelElement> {
  children: React.ReactNode;
  htmlFor: string;
  required?: boolean;
  className?: string;
}

export function FormLabel({
  children,
  htmlFor,
  required = false,
  className,
  ...props
}: FormLabelProps) {
  return (
    <label
      htmlFor={htmlFor}
      className={cn('block text-sm font-medium text-gray-700', className)}
      {...props}
    >
      {children}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
  );
}

export interface FormErrorProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
}

export function FormError({ children, className, id }: FormErrorProps) {
  if (!children) return null;
  
  return (
    <p
      id={id}
      className={cn('text-sm text-red-600 mt-1', className)}
      role="alert"
    >
      {children}
    </p>
  );
}

export interface FormHintProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
}

export function FormHint({ children, className, id }: FormHintProps) {
  if (!children) return null;
  
  return (
    <p id={id} className={cn('text-sm text-gray-500 mt-1', className)}>
      {children}
    </p>
  );
}

export interface FormSectionProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  className?: string;
}

export function FormSection({
  children,
  title,
  description,
  className,
}: FormSectionProps) {
  return (
    <div className={cn('space-y-6 py-4', className)}>
      {(title || description) && (
        <div className="space-y-1">
          {title && <h3 className="text-lg font-medium text-gray-900">{title}</h3>}
          {description && <p className="text-sm text-gray-500">{description}</p>}
        </div>
      )}
      <div className="space-y-4">{children}</div>
    </div>
  );
}

export interface FormActionsProps {
  children: React.ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right' | 'between';
}

export function FormActions({
  children,
  className,
  align = 'right',
}: FormActionsProps) {
  const alignClasses = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
    between: 'justify-between',
  };

  return (
    <div
      className={cn(
        'flex items-center pt-4 space-x-3',
        alignClasses[align],
        className
      )}
    >
      {children}
    </div>
  );
} 