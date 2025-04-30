import React from 'react';
import { render, screen } from '@testing-library/react';
import { Breadcrumbs, BreadcrumbItem } from '../breadcrumbs';

describe('Breadcrumbs', () => {
  const breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Home', href: '/' },
    { label: 'Products', href: '/products' },
    { label: 'Category', href: '/products/category' },
    { label: 'Item' },
  ];
  
  test('renders nothing when items array is empty', () => {
    const { container } = render(<Breadcrumbs items={[]} />);
    expect(container.firstChild).toBeNull();
  });
  
  test('renders all breadcrumb items', () => {
    render(<Breadcrumbs items={breadcrumbItems} />);
    
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Products')).toBeInTheDocument();
    expect(screen.getByText('Category')).toBeInTheDocument();
    expect(screen.getByText('Item')).toBeInTheDocument();
  });
  
  test('renders links for items with href', () => {
    render(<Breadcrumbs items={breadcrumbItems} />);
    
    const homeLink = screen.getByText('Home').closest('a');
    expect(homeLink).toHaveAttribute('href', '/');
    
    const productsLink = screen.getByText('Products').closest('a');
    expect(productsLink).toHaveAttribute('href', '/products');
    
    const categoryLink = screen.getByText('Category').closest('a');
    expect(categoryLink).toHaveAttribute('href', '/products/category');
  });
  
  test('renders last item without link', () => {
    render(<Breadcrumbs items={breadcrumbItems} />);
    
    const itemText = screen.getByText('Item');
    expect(itemText.closest('a')).toBeNull();
  });
  
  test('renders separators between items', () => {
    render(<Breadcrumbs items={breadcrumbItems} separator="/" />);
    
    // Count the separators - should be one less than the number of items
    const separators = screen.getAllByText('/');
    expect(separators.length).toBe(breadcrumbItems.length - 1);
  });
  
  test('applies custom separator', () => {
    render(<Breadcrumbs items={breadcrumbItems} separator=">" />);
    
    const separators = screen.getAllByText('>');
    expect(separators.length).toBe(breadcrumbItems.length - 1);
  });
  
  test('renders custom JSX separator', () => {
    render(
      <Breadcrumbs 
        items={breadcrumbItems} 
        separator={<span data-testid="custom-separator">•</span>} 
      />
    );
    
    const separators = screen.getAllByTestId('custom-separator');
    expect(separators.length).toBe(breadcrumbItems.length - 1);
  });
  
  test('applies custom classNames', () => {
    render(
      <Breadcrumbs 
        items={breadcrumbItems}
        className="custom-breadcrumbs-class"
        itemClassName="custom-item-class"
        activeItemClassName="custom-active-class"
        linkClassName="custom-link-class"
        separatorClassName="custom-separator-class"
      />
    );
    
    // Check container class
    const nav = screen.getByRole('navigation');
    expect(nav).toHaveClass('custom-breadcrumbs-class');
    
    // Check active item class (last item)
    const lastItem = screen.getByText('Item').closest('li');
    expect(lastItem).toHaveClass('custom-item-class');
    expect(lastItem).toHaveClass('custom-active-class');
    
    // Check link class
    const link = screen.getByText('Home').closest('a');
    expect(link).toHaveClass('custom-link-class');
    
    // Check separator class
    const separator = screen.getAllByText('/')[0];
    expect(separator).toHaveClass('custom-separator-class');
  });
  
  test('renders icons when provided', () => {
    const itemsWithIcons: BreadcrumbItem[] = [
      { 
        label: 'Home', 
        href: '/', 
        icon: <span data-testid="home-icon">🏠</span> 
      },
      { 
        label: 'Products', 
        href: '/products',
        icon: <span data-testid="products-icon">📦</span>
      },
      { label: 'Item' },
    ];
    
    render(<Breadcrumbs items={itemsWithIcons} />);
    
    expect(screen.getByTestId('home-icon')).toBeInTheDocument();
    expect(screen.getByTestId('products-icon')).toBeInTheDocument();
  });
}); 