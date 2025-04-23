import React from 'react';
import { createRoot, Root } from 'react-dom/client';
import Dashboard from './Dashboard';
import { mockLocations } from './__mocks__/mockLocations';

describe('Dashboard', () => {
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

  describe('DashboardHeader', () => {
    it('displays the dashboard title with correct styling', async () => {
      root.render(<Dashboard locations={mockLocations} />);
      await waitForContent();
      
      const header = container.querySelector('[data-testid="dashboard-header"]');
      expect(header).toBeTruthy();
      expect(header?.classList.contains('bg-white')).toBeTruthy();
      expect(header?.classList.contains('rounded-xl')).toBeTruthy();
      
      const title = header?.querySelector('h1');
      expect(title?.textContent).toBe('Model Railroad Locations');
      expect(title?.classList.contains('text-3xl')).toBeTruthy();
    });

    it('displays location count with badge styling', async () => {
      root.render(<Dashboard locations={mockLocations} />);
      await waitForContent();
      
      const badge = container.querySelector('.bg-blue-100.text-blue-800');
      expect(badge).toBeTruthy();
      expect(badge?.textContent).toBe(`${mockLocations.length} Total Locations`);
    });
  });

  describe('BlockSummary', () => {
    it('displays block summary section with correct styling', async () => {
      root.render(<Dashboard locations={mockLocations} />);
      await waitForContent();
      
      const summary = container.querySelector('[data-testid="block-summary"]');
      expect(summary).toBeTruthy();
      expect(summary?.classList.contains('bg-white')).toBeTruthy();
      expect(summary?.classList.contains('rounded-xl')).toBeTruthy();
    });

    it('renders block cards with proper styling', async () => {
      root.render(<Dashboard locations={mockLocations} />);
      await waitForContent();
      
      const northBlock = container.querySelector('[data-testid="block-card-north"]');
      expect(northBlock).toBeTruthy();
      expect(northBlock?.classList.contains('bg-gradient-to-br')).toBeTruthy();
      expect(northBlock?.classList.contains('hover:shadow-md')).toBeTruthy();
    });

    it('displays block information correctly', async () => {
      root.render(<Dashboard locations={mockLocations} />);
      await waitForContent();
      
      const blocks = container.querySelectorAll('[data-testid^="block-card-"]');
      blocks.forEach(block => {
        const title = block.querySelector('.text-lg');
        const count = block.querySelector('.text-sm');
        expect(title).toBeTruthy();
        expect(count).toBeTruthy();
      });
    });
  });

  describe('Dashboard Layout', () => {
    it('has proper container styling', async () => {
      root.render(<Dashboard locations={mockLocations} />);
      await waitForContent();
      
      const container = document.querySelector('.min-h-screen.bg-gray-50');
      expect(container).toBeTruthy();
      
      const innerContainer = container?.querySelector('.container.max-w-7xl');
      expect(innerContainer).toBeTruthy();
    });
  });
}); 