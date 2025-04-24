import { render, screen } from '@testing-library/react';
import RootLayout from '../layout';

// Mock the Header component
jest.mock('@/shared/components/Header', () => {
  return function MockHeader() {
    return <header data-testid="mock-header">Mock Header</header>;
  };
});

// Mock Next.js font
jest.mock('next/font/google', () => ({
  Inter: () => ({
    className: 'mock-inter-font',
  }),
}));

describe('RootLayout', () => {
  it('renders the header', () => {
    render(
      <RootLayout>
        <div>Test Content</div>
      </RootLayout>
    );
    
    const header = screen.getByTestId('mock-header');
    expect(header).toBeInTheDocument();
  });

  it('renders children after the header', () => {
    render(
      <RootLayout>
        <div data-testid="test-content">Test Content</div>
      </RootLayout>
    );
    
    const header = screen.getByTestId('mock-header');
    const content = screen.getByTestId('test-content');
    
    expect(header.compareDocumentPosition(content)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
  });

  it('maintains proper HTML structure', () => {
    const { container } = render(
      <RootLayout>
        <div>Test Content</div>
      </RootLayout>
    );
    
    // Find the html element within the rendered output
    const htmlElement = container.querySelector('[lang="en"]');
    expect(htmlElement).toBeInTheDocument();
  });
}); 