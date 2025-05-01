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
      className={cn('space-y-6', className)}
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
    <div className={cn(
      inline ? 'flex items-start gap-3' : 'space-y-1.5',
      className || ''
    )}>
      {children}
      {hint && <FormHint>{hint}</FormHint>}
      {error && <FormError>{error}</FormError>}
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
      className={cn('text-sm font-medium text-red-600 mt-1', className)} 
      id={id}
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
    <p className={cn('text-sm text-gray-500 mt-1', className)} id={id}>
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
    <div className={cn('space-y-4 pb-6', className || '')}>
      {(title || description) && (
        <div className="mb-2 border-b border-gray-200 pb-3">
          {title && <h3 className="text-lg font-medium text-gray-900">{title}</h3>}
          {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
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
        'flex items-center pt-4 border-t border-gray-200 mt-6',
        alignClasses[align],
        className
      )}
    >
      {children}
    </div>
  );
}

Form.displayName = 'Form';
FormGroup.displayName = 'FormGroup';
FormLabel.displayName = 'FormLabel';
FormError.displayName = 'FormError';
FormHint.displayName = 'FormHint';
FormSection.displayName = 'FormSection';
FormActions.displayName = 'FormActions'; 