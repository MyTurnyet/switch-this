import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Tabs } from '../tabs';

describe('Tabs', () => {
  const tabItems = [
    { id: 'tab1', label: 'Tab 1', content: <div>Content for Tab 1</div> },
    { id: 'tab2', label: 'Tab 2', content: <div>Content for Tab 2</div> },
    { id: 'tab3', label: 'Tab 3', content: <div>Content for Tab 3</div> },
  ];
  
  test('renders all tab labels', () => {
    render(<Tabs items={tabItems} />);
    
    expect(screen.getByText('Tab 1')).toBeInTheDocument();
    expect(screen.getByText('Tab 2')).toBeInTheDocument();
    expect(screen.getByText('Tab 3')).toBeInTheDocument();
  });
  
  test('renders first tab content by default', () => {
    render(<Tabs items={tabItems} />);
    
    expect(screen.getByText('Content for Tab 1')).toBeInTheDocument();
    expect(screen.queryByText('Content for Tab 2')).not.toBeInTheDocument();
    expect(screen.queryByText('Content for Tab 3')).not.toBeInTheDocument();
  });
  
  test('renders the tab content for the defaultTabId', () => {
    render(<Tabs items={tabItems} defaultTabId="tab2" />);
    
    expect(screen.queryByText('Content for Tab 1')).not.toBeInTheDocument();
    expect(screen.getByText('Content for Tab 2')).toBeInTheDocument();
    expect(screen.queryByText('Content for Tab 3')).not.toBeInTheDocument();
  });
  
  test('switches tab content when a tab is clicked', () => {
    render(<Tabs items={tabItems} />);
    
    // Initially, Tab 1 content should be visible
    expect(screen.getByText('Content for Tab 1')).toBeInTheDocument();
    
    // Click on Tab 2
    fireEvent.click(screen.getByText('Tab 2'));
    
    // Tab 2 content should be visible now
    expect(screen.queryByText('Content for Tab 1')).not.toBeInTheDocument();
    expect(screen.getByText('Content for Tab 2')).toBeInTheDocument();
    expect(screen.queryByText('Content for Tab 3')).not.toBeInTheDocument();
  });
  
  test('calls onChange handler when tab is changed', () => {
    const onChange = jest.fn();
    render(<Tabs items={tabItems} onChange={onChange} />);
    
    // Click on Tab 2
    fireEvent.click(screen.getByText('Tab 2'));
    
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('tab2');
  });
  
  test('disables a tab when disabled is true', () => {
    const disabledTabItems = [
      ...tabItems,
      { id: 'tab4', label: 'Disabled Tab', content: <div>Disabled Content</div>, disabled: true },
    ];
    
    render(<Tabs items={disabledTabItems} />);
    
    const disabledTab = screen.getByText('Disabled Tab').closest('button');
    expect(disabledTab).toBeDisabled();
    expect(disabledTab).toHaveClass('opacity-50');
  });
  
  test('does not switch to disabled tab when clicked', () => {
    const onChange = jest.fn();
    const disabledTabItems = [
      ...tabItems,
      { id: 'tab4', label: 'Disabled Tab', content: <div>Disabled Content</div>, disabled: true },
    ];
    
    render(<Tabs items={disabledTabItems} onChange={onChange} />);
    
    // Click on the disabled tab
    fireEvent.click(screen.getByText('Disabled Tab'));
    
    // Content should not change, and onChange should not be called
    expect(screen.getByText('Content for Tab 1')).toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();
  });
  
  test('applies custom className', () => {
    render(<Tabs items={tabItems} className="custom-tabs-class" />);
    
    const tabsContainer = screen.getByText('Tab 1').closest('.w-full');
    expect(tabsContainer).toHaveClass('custom-tabs-class');
  });
  
  test('applies different variants correctly', () => {
    const { rerender } = render(<Tabs items={tabItems} variant="default" />);
    
    // Default style
    expect(screen.getByText('Tab 1').closest('.flex')).toHaveClass('border-b');
    
    // Pills style
    rerender(<Tabs items={tabItems} variant="pills" />);
    expect(screen.getByText('Tab 1').closest('.flex')).toHaveClass('space-x-2');
    
    // Underline style
    rerender(<Tabs items={tabItems} variant="underline" />);
    expect(screen.getByText('Tab 1').closest('.flex')).toHaveClass('border-b');
  });
  
  test('applies different sizes correctly', () => {
    const { rerender } = render(<Tabs items={tabItems} size="sm" />);
    
    // Small size
    expect(screen.getByText('Tab 1')).toHaveClass('text-xs');
    
    // Medium size
    rerender(<Tabs items={tabItems} size="md" />);
    expect(screen.getByText('Tab 1')).toHaveClass('text-sm');
    
    // Large size
    rerender(<Tabs items={tabItems} size="lg" />);
    expect(screen.getByText('Tab 1')).toHaveClass('text-base');
  });
}); 