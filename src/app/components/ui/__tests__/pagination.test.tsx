import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Pagination } from '../pagination';

describe('Pagination Component', () => {
  it('renders pagination with correct number of pages', () => {
    render(<Pagination totalItems={100} itemsPerPage={10} currentPage={1} onPageChange={jest.fn()} />);
    
    // Should have 10 pages (100 items / 10 per page)
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
  });

  it('highlights the current page', () => {
    render(<Pagination totalItems={50} itemsPerPage={10} currentPage={2} onPageChange={jest.fn()} />);
    
    const currentPageButton = screen.getByLabelText('Page 2');
    expect(currentPageButton).toHaveClass('bg-primary');
  });

  it('calls onPageChange when a page is clicked', () => {
    const onPageChangeMock = jest.fn();
    render(<Pagination totalItems={50} itemsPerPage={10} currentPage={1} onPageChange={onPageChangeMock} />);
    
    fireEvent.click(screen.getByText('3'));
    expect(onPageChangeMock).toHaveBeenCalledWith(3);
  });

  it('disables previous button on first page', () => {
    render(<Pagination totalItems={50} itemsPerPage={10} currentPage={1} onPageChange={jest.fn()} />);
    
    const prevButton = screen.getByLabelText('Go to previous page');
    expect(prevButton).toBeDisabled();
  });

  it('disables next button on last page', () => {
    render(<Pagination totalItems={50} itemsPerPage={10} currentPage={5} onPageChange={jest.fn()} />);
    
    const nextButton = screen.getByLabelText('Go to next page');
    expect(nextButton).toBeDisabled();
  });

  it('shows ellipsis for many pages', () => {
    render(<Pagination totalItems={200} itemsPerPage={10} currentPage={10} onPageChange={jest.fn()} />);
    
    const ellipses = screen.getAllByText('...');
    expect(ellipses.length).toBeGreaterThan(0);
  });

  it('renders with custom className', () => {
    render(
      <Pagination 
        totalItems={50} 
        itemsPerPage={10} 
        currentPage={1} 
        onPageChange={jest.fn()} 
        className="custom-class"
      />
    );
    
    const paginationElement = screen.getByRole('navigation');
    expect(paginationElement).toHaveClass('custom-class');
  });
}); 