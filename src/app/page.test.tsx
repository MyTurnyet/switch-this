import React from 'react';
import { createRoot, Root } from 'react-dom/client';
import '@testing-library/jest-dom';
import Home from './page';
import { theme } from '../styles/theme';

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

  it('uses themed background and spacing', async () => {
    root.render(<Home />);
    await waitForContent();
    
    const main = container.querySelector('main');
    expect(main).toBeTruthy();
    expect(main?.className).toContain('bg-background-secondary');
    
    const containerDiv = main?.querySelector('.container');
    expect(containerDiv).toBeTruthy();
    expect(containerDiv?.className).toContain(theme.spacing.page.x.split(' ')[0]);
    expect(containerDiv?.className).toContain(theme.spacing.page.y.split(' ')[0]);
  });

  it('displays title with themed typography', async () => {
    root.render(<Home />);
    await waitForContent();
    
    const title = container.querySelector('h1');
    expect(title).toBeTruthy();
    expect(title?.textContent).toBe('Model Railroad Switchlist Generator');
    expect(title?.className).toContain(theme.typography.title.split(' ')[0]);
  });

  it('displays description with themed typography', async () => {
    root.render(<Home />);
    await waitForContent();
    
    const description = container.querySelector('p');
    expect(description).toBeTruthy();
    expect(description?.textContent).toContain('Generate and manage switchlists');
    expect(description?.className).toContain(theme.typography.body.split(' ')[0]);
  });

  it('uses themed cards for content sections', async () => {
    root.render(<Home />);
    await waitForContent();
    
    const headerCard = container.querySelector('[data-testid="header-card"]');
    const dashboardCard = container.querySelector('[data-testid="dashboard-card"]');
    
    expect(headerCard).toBeTruthy();
    expect(dashboardCard).toBeTruthy();
    
    [headerCard, dashboardCard].forEach(card => {
      expect(card?.className).toContain(theme.components.card.split(' ')[0]);
    });
  });

  it('renders the Dashboard component', async () => {
    root.render(<Home />);
    await waitForContent();
    
    const dashboard = container.querySelector('[data-testid="dashboard-card"]');
    expect(dashboard).toBeTruthy();
  });
}); 