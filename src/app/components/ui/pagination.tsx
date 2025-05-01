import React from 'react';
import { Button } from './button';
import { cn } from '@/lib/utils';

export interface PaginationProps {
  totalItems: number;
  itemsPerPage: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({
  totalItems,
  itemsPerPage,
  currentPage,
  onPageChange,
  className,
}: PaginationProps) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  // Calculate the range of page numbers to display
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages if there are few pages
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Always show first page
      pageNumbers.push(1);
      
      // Calculate start and end of visible pages around current page
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);
      
      // Adjust if we're near the beginning or end
      if (currentPage <= 3) {
        end = Math.min(totalPages - 1, 4);
      } else if (currentPage >= totalPages - 2) {
        start = Math.max(2, totalPages - 3);
      }
      
      // Add ellipsis after first page if needed
      if (start > 2) {
        pageNumbers.push('...');
      }
      
      // Add middle pages
      for (let i = start; i <= end; i++) {
        pageNumbers.push(i);
      }
      
      // Add ellipsis before last page if needed
      if (end < totalPages - 1) {
        pageNumbers.push('...');
      }
      
      // Always show last page
      if (totalPages > 1) {
        pageNumbers.push(totalPages);
      }
    }
    
    return pageNumbers;
  };
  
  const pageNumbers = getPageNumbers();
  
  return (
    <nav
      role="navigation"
      aria-label="Pagination"
      className={cn("flex items-center justify-center space-x-2", className)}
    >
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Go to previous page"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      </Button>
      
      <div className="flex items-center space-x-1">
        {pageNumbers.map((page, index) => {
          return typeof page === 'number' ? (
            <Button
              key={index}
              variant={page === currentPage ? "primary" : "outline"}
              size="sm"
              className={cn(
                page === currentPage ? "bg-primary" : ""
              )}
              onClick={() => onPageChange(page)}
              aria-current={page === currentPage ? "page" : undefined}
              aria-label={`Page ${page}`}
            >
              {page}
            </Button>
          ) : (
            <span key={index} className="px-2">
              {page}
            </span>
          );
        })}
      </div>
      
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Go to next page"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
        </svg>
      </Button>
    </nav>
  );
} 