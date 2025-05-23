'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { LoadingSpinner } from './loading-spinner';
import { Alert } from './alert';
import { ChevronsUpDown, ChevronUp, ChevronDown } from 'lucide-react';

export interface Column<T> {
  key: string;
  header: string;
  accessor?: (item: T) => React.ReactNode;
  className?: string;
  headerClassName?: string;
  sortable?: boolean;
  sortKey?: string; // Optional custom key to use for sorting (if different from 'key')
}

export type SortDirection = 'asc' | 'desc' | null;

export interface DataTableProps<T extends Record<string, unknown>> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  onRowClick?: (item: T) => void;
  isLoading?: boolean;
  error?: string;
  className?: string;
  emptyMessage?: string;
  rowClassName?: string | ((item: T, index: number) => string);
  zebra?: boolean;
  bordered?: boolean;
  dense?: boolean;
  hover?: boolean;
  stickyHeader?: boolean;
  onSort?: (sortKey: string, direction: SortDirection) => void;
  sortColumn?: string;
  sortDirection?: SortDirection;
}

export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  keyExtractor,
  onRowClick,
  isLoading = false,
  error,
  className,
  emptyMessage = 'No data available',
  rowClassName,
  zebra = true,
  bordered = true,
  dense = false,
  hover = true,
  stickyHeader = false,
  onSort,
  sortColumn,
  sortDirection,
}: DataTableProps<T>) {
  const handleSort = (column: Column<T>) => {
    if (!column.sortable || !onSort) return;
    
    const key = column.sortKey || column.key;
    let direction: SortDirection = 'asc';
    
    if (sortColumn === key) {
      if (sortDirection === 'asc') {
        direction = 'desc';
      } else if (sortDirection === 'desc') {
        direction = null;
      }
    }
    
    onSort(key, direction);
  };

  const renderSortIcon = (column: Column<T>) => {
    if (!column.sortable) return null;
    
    const key = column.sortKey || column.key;
    
    if (sortColumn !== key) {
      return <ChevronsUpDown className="ml-1 h-4 w-4 inline" />;
    }
    
    if (sortDirection === 'asc') {
      return <ChevronUp className="ml-1 h-4 w-4 inline" />;
    }
    
    if (sortDirection === 'desc') {
      return <ChevronDown className="ml-1 h-4 w-4 inline" />;
    }
    
    return <ChevronsUpDown className="ml-1 h-4 w-4 inline" />;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="md" label="Loading data..." />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="error" title="Error loading data">
        {error}
      </Alert>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-md border border-gray-200">
        {emptyMessage}
      </div>
    );
  }

  const sizeClasses = dense ? 'px-3 py-2' : 'px-6 py-4';

  return (
    <div className={cn('overflow-x-auto', className)}>
      <table className={cn(
        'min-w-full divide-y divide-gray-200',
        bordered && 'border border-gray-200 rounded-lg'
      )}>
        <thead className={cn(
          'bg-gray-50',
          stickyHeader && 'sticky top-0 z-10'
        )}>
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={cn(
                  dense ? 'px-3 py-2' : 'px-6 py-3',
                  'text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
                  column.sortable && 'cursor-pointer hover:bg-gray-100',
                  column.headerClassName
                )}
                onClick={() => column.sortable && handleSort(column)}
              >
                <div className="flex items-center">
                  {column.header}
                  {renderSortIcon(column)}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((item, index) => (
            <tr
              key={keyExtractor(item)}
              onClick={() => onRowClick && onRowClick(item)}
              className={cn(
                onRowClick && hover && 'cursor-pointer hover:bg-gray-50',
                zebra && index % 2 === 1 && 'bg-gray-50',
                typeof rowClassName === 'function' ? rowClassName(item, index) : rowClassName
              )}
            >
              {columns.map((column) => (
                <td
                  key={`${keyExtractor(item)}-${column.key}`}
                  className={cn(
                    sizeClasses, 
                    'whitespace-nowrap text-sm text-gray-700', 
                    column.className
                  )}
                >
                  {column.accessor ? column.accessor(item) : item[column.key] as React.ReactNode}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

DataTable.displayName = 'DataTable'; 