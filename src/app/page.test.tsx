import React from 'react';
import { createRoot, Root } from 'react-dom/client';
import '@testing-library/jest-dom';
import Home from './page';

// Mock the Dashboard component
jest.mock('../components/Dashboard', () => {
  return function MockDashboard() {
    return <div data-testid="mock-dashboard">Dashboard Component</div>;
  };
});

describe('Home', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    root.unmount();
    document.body.removeChild(container);
  });

  const waitForContent = () => new Promise(resolve => setTimeout(resolve, 100));

  it('uses themed background gradient', async () => {
    root.render(<Home />);
    await waitForContent();
    
    const main = container.querySelector('main');
    expect(main).toBeTruthy();
    expect(main?.className).toContain('bg-gradient-to-br');
    expect(main?.className).toContain('from-background-secondary');
  });

  it('displays title with proper styling', async () => {
    root.render(<Home />);
    await waitForContent();
    
    const title = container.querySelector('h1');
    expect(title).toBeTruthy();
    expect(title?.textContent).toBe('Model Railroad Switchlist Generator');
    expect(title?.className).toContain('text-4xl');
    expect(title?.className).toContain('text-primary-900');
  });

  it('displays description with proper styling', async () => {
    root.render(<Home />);
    await waitForContent();
    
    const description = container.querySelector('p');
    expect(description).toBeTruthy();
    expect(description?.textContent).toContain('Generate and manage switchlists');
    expect(description?.className).toContain('text-primary-700');
  });

  it('uses frosted glass effect for content sections', async () => {
    root.render(<Home />);
    await waitForContent();
    
    const sections = container.querySelectorAll('.backdrop-blur');
    expect(sections.length).toBeGreaterThan(0);
    sections.forEach(section => {
      expect(section.className).toContain('bg-white/80');
      expect(section.className).toContain('border-primary-100');
    });
  });

  it('renders the Dashboard component in a styled container', async () => {
    root.render(<Home />);
    await waitForContent();
    
    const dashboard = container.querySelector('[data-testid="mock-dashboard"]');
    expect(dashboard).toBeTruthy();
    const dashboardContainer = dashboard?.closest('.backdrop-blur');
    expect(dashboardContainer).toBeTruthy();
    expect(dashboardContainer?.className).toContain('shadow-lg');
  });
}); 