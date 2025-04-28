import { render } from '@testing-library/react';
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
  it('renders with correct structure', () => {
    const { container } = render(
      <RootLayout>
        <div data-testid="test-content">Test Content</div>
      </RootLayout>
    );

    const html = container.querySelector('html');
    const body = container.querySelector('body');
    const content = container.querySelector('[data-testid="test-content"]');

    expect(html).toHaveAttribute('lang', 'en');
    expect(body).toHaveClass('mock-inter-font');
    expect(content).toHaveTextContent('Test Content');
  });
}); 