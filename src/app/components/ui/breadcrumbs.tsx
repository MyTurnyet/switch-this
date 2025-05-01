'use client';

import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  separator?: React.ReactNode;
  className?: string;
  itemClassName?: string;
  activeItemClassName?: string;
  linkClassName?: string;
  separatorClassName?: string;
}

export function Breadcrumbs({
  items,
  separator = '/',
  className,
  itemClassName,
  activeItemClassName,
  linkClassName,
  separatorClassName,
}: BreadcrumbsProps) {
  if (!items || items.length === 0) return null;

  return (
    <nav className={cn('flex', className)} aria-label="Breadcrumb">
      <ol className="flex items-center space-x-1">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li 
              key={index} 
              className={cn(
                'flex items-center',
                itemClassName,
                isLast && activeItemClassName
              )}
            >
              {index > 0 && (
                <span 
                  className={cn(
                    'mx-1.5 text-gray-400',
                    separatorClassName
                  )}
                  aria-hidden="true"
                >
                  {separator}
                </span>
              )}
              
              {item.href && !isLast ? (
                <Link 
                  href={item.href}
                  className={cn(
                    'text-gray-600 hover:text-primary-600 transition-colors flex items-center',
                    linkClassName
                  )}
                >
                  {item.icon && <span className="mr-1.5">{item.icon}</span>}
                  {item.label}
                </Link>
              ) : (
                <span className={cn(
                  'flex items-center',
                  isLast ? 'font-medium text-gray-900' : 'text-gray-600',
                  isLast && activeItemClassName
                )}>
                  {item.icon && <span className="mr-1.5">{item.icon}</span>}
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

Breadcrumbs.displayName = 'Breadcrumbs'; 