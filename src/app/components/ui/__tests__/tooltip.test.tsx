import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { Tooltip } from '../tooltip';

// Mock timers for delay testing
jest.useFakeTimers();

describe('Tooltip', () => {
  test('renders children but not tooltip initially', () => {
    render(
      <Tooltip content="Tooltip content">
        <button>Hover me</button>
      </Tooltip>
    );
    
    expect(screen.getByText('Hover me')).toBeInTheDocument();
    expect(screen.queryByText('Tooltip content')).not.toBeInTheDocument();
  });
  
  test('shows tooltip when hovered', () => {
    render(
      <Tooltip content="Tooltip content">
        <button>Hover me</button>
      </Tooltip>
    );
    
    // Simulate mouse enter
    fireEvent.mouseEnter(screen.getByText('Hover me'));
    
    // Fast-forward timer
    act(() => {
      jest.advanceTimersByTime(300); // Default delay
    });
    
    expect(screen.getByText('Tooltip content')).toBeInTheDocument();
  });
  
  test('hides tooltip when mouse leaves', () => {
    render(
      <Tooltip content="Tooltip content">
        <button>Hover me</button>
      </Tooltip>
    );
    
    // Show tooltip
    fireEvent.mouseEnter(screen.getByText('Hover me'));
    act(() => {
      jest.advanceTimersByTime(300);
    });
    expect(screen.getByText('Tooltip content')).toBeInTheDocument();
    
    // Hide tooltip
    fireEvent.mouseLeave(screen.getByText('Hover me'));
    expect(screen.queryByText('Tooltip content')).not.toBeInTheDocument();
  });
  
  test('respects custom delay', () => {
    render(
      <Tooltip content="Tooltip content" delay={500}>
        <button>Hover me</button>
      </Tooltip>
    );
    
    // Simulate mouse enter
    fireEvent.mouseEnter(screen.getByText('Hover me'));
    
    // Check that tooltip is not shown before delay
    act(() => {
      jest.advanceTimersByTime(300);
    });
    expect(screen.queryByText('Tooltip content')).not.toBeInTheDocument();
    
    // Check that tooltip is shown after delay
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
    
    // Show tooltip
    fireEvent.mouseEnter(screen.getByText('Hover me'));
    act(() => {
      jest.advanceTimersByTime(300);
    });
    
    // Check position classes
    let tooltip = screen.getByRole('tooltip');
    expect(tooltip).toHaveClass('bottom-full');
    
    // Test right position
    rerender(
      <Tooltip content="Tooltip content" position="right">
        <button>Hover me</button>
      </Tooltip>
    );
    
    // Show tooltip
    fireEvent.mouseEnter(screen.getByText('Hover me'));
    act(() => {
      jest.advanceTimersByTime(300);
    });
    
    tooltip = screen.getByRole('tooltip');
    expect(tooltip).toHaveClass('left-full');
    
    // Test bottom position
    rerender(
      <Tooltip content="Tooltip content" position="bottom">
        <button>Hover me</button>
      </Tooltip>
    );
    
    // Show tooltip
    fireEvent.mouseEnter(screen.getByText('Hover me'));
    act(() => {
      jest.advanceTimersByTime(300);
    });
    
    tooltip = screen.getByRole('tooltip');
    expect(tooltip).toHaveClass('top-full');
    
    // Test left position
    rerender(
      <Tooltip content="Tooltip content" position="left">
        <button>Hover me</button>
      </Tooltip>
    );
    
    // Show tooltip
    fireEvent.mouseEnter(screen.getByText('Hover me'));
    act(() => {
      jest.advanceTimersByTime(300);
    });
    
    tooltip = screen.getByRole('tooltip');
    expect(tooltip).toHaveClass('right-full');
  });
  
  test('renders tooltip with custom content', () => {
    render(
      <Tooltip content={<div data-testid="custom-content">Custom Content</div>}>
        <button>Hover me</button>
      </Tooltip>
    );
    
    // Show tooltip
    fireEvent.mouseEnter(screen.getByText('Hover me'));
    act(() => {
      jest.advanceTimersByTime(300);
    });
    
    expect(screen.getByTestId('custom-content')).toBeInTheDocument();
  });
  
  test('applies custom classes', () => {
    render(
      <Tooltip 
        content="Tooltip content"
        className="custom-wrapper-class"
        contentClassName="custom-tooltip-class"
      >
        <button>Hover me</button>
      </Tooltip>
    );
    
    // Check wrapper class
    expect(screen.getByText('Hover me').closest('div')).toHaveClass('custom-wrapper-class');
    
    // Show tooltip
    fireEvent.mouseEnter(screen.getByText('Hover me'));
    act(() => {
      jest.advanceTimersByTime(300);
    });
    
    // Check content class
    expect(screen.getByRole('tooltip')).toHaveClass('custom-tooltip-class');
  });
  
  test('shows tooltip on focus and hides on blur', () => {
    render(
      <Tooltip content="Tooltip content">
        <button>Focus me</button>
      </Tooltip>
    );
    
    // Show tooltip
    fireEvent.focus(screen.getByText('Focus me'));
    act(() => {
      jest.advanceTimersByTime(300);
    });
    expect(screen.getByText('Tooltip content')).toBeInTheDocument();
    
    // Hide tooltip
    fireEvent.blur(screen.getByText('Focus me'));
    expect(screen.queryByText('Tooltip content')).not.toBeInTheDocument();
  });
}); 