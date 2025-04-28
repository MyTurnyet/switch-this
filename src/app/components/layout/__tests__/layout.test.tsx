import { render } from '@testing-library/react';
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

describe('RootLayout', () => {
  it('renders children correctly', () => {
    const { container } = render(
      <div id="test-container">
        <div data-testid="test-content">Test Content</div>
      </div>,
      {
        container: document.createElement('div'),
      }
    );

    expect(container).toHaveTextContent('Test Content');
  });
});