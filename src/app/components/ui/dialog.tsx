'use client';

import React, { useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from './button';

export interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnClickOutside?: boolean;
  showCloseButton?: boolean;
  className?: string;
  contentClassName?: string;
  headerClassName?: string;
  footerClassName?: string;
  titleClassName?: string;
  descriptionClassName?: string;
}

export function Dialog({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  closeOnClickOutside = true,
  showCloseButton = true,
  className,
  contentClassName,
  headerClassName,
  footerClassName,
  titleClassName,
  descriptionClassName,
}: DialogProps) {
  // Close on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      // Prevent scrolling on body when dialog is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      // Restore scrolling when dialog is closed
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;
  
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-full mx-4',
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
      onClick={closeOnClickOutside ? onClose : undefined}
      role="dialog"
      aria-modal="true"
    >
      <div 
        className={cn(
          'bg-white rounded-lg shadow-xl overflow-hidden w-full transform transition-all', 
          sizeClasses[size],
          className
        )}
        onClick={e => e.stopPropagation()}
      >
        {(title || description) && (
          <div className={cn('px-6 py-4 border-b border-gray-200', headerClassName)}>
            {title && (
              <h3 className={cn('text-lg font-medium leading-6 text-gray-900', titleClassName)}>
                {title}
              </h3>
            )}
            {description && (
              <p className={cn('mt-2 text-sm text-gray-600', descriptionClassName)}>
                {description}
              </p>
            )}
            {showCloseButton && (
              <button
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                onClick={onClose}
                aria-label="Close dialog"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        )}
        
        <div className={cn('px-6 py-4', contentClassName)}>
          {children}
        </div>
        
        {footer && (
          <div className={cn('px-6 py-4 bg-gray-50 border-t border-gray-200', footerClassName)}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export interface ConfirmDialogProps extends Omit<DialogProps, 'footer'> {
  onConfirm: () => void;
  onClose: () => void;
  confirmText?: string;
  cancelText?: string;
  destructive?: boolean;
}

export function ConfirmDialog({
  onConfirm,
  onClose,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  destructive = false,
  ...props
}: ConfirmDialogProps) {
  return (
    <Dialog
      {...props}
      onClose={onClose}
      footer={
        <div className="flex justify-end space-x-3">
          <Button variant="outline" onClick={onClose} size="sm">
            {cancelText}
          </Button>
          <Button
            variant={destructive ? 'danger' : 'primary'}
            onClick={() => {
              onConfirm();
              onClose();
            }}
            size="sm"
          >
            {confirmText}
          </Button>
        </div>
      }
    />
  );
}

Dialog.displayName = 'Dialog';
ConfirmDialog.displayName = 'ConfirmDialog'; 