import { render, screen } from '@testing-library/react';
import RootLayout from '../../../layout';

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

// Mock the metadata since we're testing in a Node environment
jest.mock('next/head', () => {
  return {
    __esModule: true,
    default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  };
});

describe('RootLayout', () => {
  // Extract the body content for testing since we can't render <html> in jsdom
  const LayoutContent = ({ children }: { children: React.ReactNode }) => {
    const layout = RootLayout({ children });
    const bodyContent = layout.props.children[1].props.children;
    return <div className={layout.props.children[1].props.className}>{bodyContent}</div>;
  };

  it('renders header and children correctly', () => {
    render(
      <LayoutContent>
        <div data-testid="test-content">Test Content</div>
      </LayoutContent>
    );

    expect(screen.getByTestId('mock-header')).toBeInTheDocument();
    expect(screen.getByTestId('test-content')).toBeInTheDocument();
  });

  it('maintains proper layout structure', () => {
    render(
      <LayoutContent>
        <div data-testid="test-content">Test Content</div>
      </LayoutContent>
    );

    const header = screen.getByTestId('mock-header');
    const content = screen.getByTestId('test-content');
    
    expect(header).toBeInTheDocument();
    expect(content).toBeInTheDocument();
    expect(content.closest('main')).toHaveClass('container', 'mx-auto', 'px-4', 'py-8');
  });
});