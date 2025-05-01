import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { Tooltip } from '../tooltip';

describe('Tooltip', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('renders children', () => {
    render(
      <Tooltip content="Tooltip content">
        <button>Hover me</button>
      </Tooltip>
    );
    
    expect(screen.getByText('Hover me')).toBeInTheDocument();
  });
  
  test('shows tooltip on hover and hides on mouse leave', () => {
    render(
      <Tooltip content="Tooltip content">
        <button>Hover me</button>
      </Tooltip>
    );
    
    // Initially tooltip should not be visible
    expect(screen.queryByText('Tooltip content')).not.toBeInTheDocument();
    
    // Mouse enter should trigger tooltip after delay
    fireEvent.mouseEnter(screen.getByText('Hover me'));
    
    // No tooltip yet (waiting for delay)
    expect(screen.queryByText('Tooltip content')).not.toBeInTheDocument();
    
    // Advance timers to trigger tooltip display
    act(() => {
      jest.advanceTimersByTime(300);
    });
    
    // Now tooltip should be visible
    expect(screen.getByText('Tooltip content')).toBeInTheDocument();
    
    // Mouse leave should hide tooltip
    fireEvent.mouseLeave(screen.getByText('Hover me'));
    
    // Tooltip should be hidden immediately
    expect(screen.queryByText('Tooltip content')).not.toBeInTheDocument();
  });
  
  test('uses custom delay', () => {
    render(
      <Tooltip content="Tooltip content" delay={500}>
        <button>Hover me</button>
      </Tooltip>
    );
    
    // Mouse enter should trigger tooltip after delay
    fireEvent.mouseEnter(screen.getByText('Hover me'));
    
    // After 300ms, tooltip should not be visible yet
    act(() => {
      jest.advanceTimersByTime(300);
    });
    expect(screen.queryByText('Tooltip content')).not.toBeInTheDocument();
    
    // After full 500ms delay, tooltip should be visible
    act(() => {
      jest.advanceTimersByTime(200);
    });
    expect(screen.getByText('Tooltip content')).toBeInTheDocument();
  });
  
  test('applies different position classes', () => {
    const { rerender } = render(
      <Tooltip content="Tooltip content" position="top">
        <button>Hover me</button>
      </Tooltip>
    );
    
    fireEvent.mouseEnter(screen.getByText('Hover me'));
    act(() => {
      jest.advanceTimersByTime(300);
    });
    
    let tooltip = screen.getByText('Tooltip content').closest('.absolute');
    expect(tooltip).toHaveClass('bottom-full');
    
    // Test right position
    rerender(
      <Tooltip content="Tooltip content" position="right">
        <button>Hover me</button>
      </Tooltip>
    );
    
    tooltip = screen.getByText('Tooltip content').closest('.absolute');
    expect(tooltip).toHaveClass('left-full');
    
    // Test bottom position
    rerender(
      <Tooltip content="Tooltip content" position="bottom">
        <button>Hover me</button>
      </Tooltip>
    );
    
    tooltip = screen.getByText('Tooltip content').closest('.absolute');
    expect(tooltip).toHaveClass('top-full');
    
    // Test left position
    rerender(
      <Tooltip content="Tooltip content" position="left">
        <button>Hover me</button>
      </Tooltip>
    );
    
    tooltip = screen.getByText('Tooltip content').closest('.absolute');
    expect(tooltip).toHaveClass('right-full');
  });

  test('applies different variant styles', () => {
    const { rerender } = render(
      <Tooltip content="Tooltip content" variant="dark">
        <button>Hover me</button>
      </Tooltip>
    );
    
    fireEvent.mouseEnter(screen.getByText('Hover me'));
    act(() => {
      jest.advanceTimersByTime(300);
    });
    
    let tooltip = screen.getByText('Tooltip content').closest('.absolute');
    expect(tooltip).toHaveClass('bg-gray-900');
    
    // Test light variant
    rerender(
      <Tooltip content="Tooltip content" variant="light">
        <button>Hover me</button>
      </Tooltip>
    );
    
    tooltip = screen.getByText('Tooltip content').closest('.absolute');
    expect(tooltip).toHaveClass('bg-white');
    
    // Test primary variant
    rerender(
      <Tooltip content="Tooltip content" variant="primary">
        <button>Hover me</button>
      </Tooltip>
    );
    
    tooltip = screen.getByText('Tooltip content').closest('.absolute');
    expect(tooltip).toHaveClass('bg-primary-600');
  });
  
  test('applies custom class names', () => {
    render(
      <Tooltip 
        content="Tooltip content" 
        className="custom-class"
        contentClassName="custom-content-class"
      >
        <button>Hover me</button>
      </Tooltip>
    );
    
    fireEvent.mouseEnter(screen.getByText('Hover me'));
    act(() => {
      jest.advanceTimersByTime(300);
    });
    
    const container = screen.getByText('Hover me').closest('.relative');
    expect(container).toHaveClass('custom-class');
    
    const tooltip = screen.getByText('Tooltip content').closest('.absolute');
    expect(tooltip).toHaveClass('custom-content-class');
  });
}); 