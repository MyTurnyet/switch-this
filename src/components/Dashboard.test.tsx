import React from 'react';
import { createRoot, Root } from 'react-dom/client';
import Dashboard from './Dashboard';
import { mockLocations } from './__mocks__/mockLocations';
import { theme } from '../styles/theme';

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
    it('displays the dashboard title with themed typography', async () => {
      root.render(<Dashboard locations={mockLocations} />);
      await waitForContent();
      
      const header = container.querySelector('[data-testid="dashboard-header"]');
      expect(header).toBeTruthy();
      
      const title = header?.querySelector('h1');
      expect(title?.textContent).toBe('Model Railroad Locations');
      expect(title?.className).toContain(theme.typography.title.split(' ')[0]);
    });

    it('displays location count with themed badge', async () => {
      root.render(<Dashboard locations={mockLocations} />);
      await waitForContent();
      
      const badge = container.querySelector('[data-testid="location-count"]');
      expect(badge).toBeTruthy();
      expect(badge?.className).toContain(theme.components.badge.split(' ')[0]);
      expect(badge?.textContent).toBe(`${mockLocations.length} Total Locations`);
    });
  });

  describe('BlockSummary', () => {
    it('displays block summary section with themed card', async () => {
      root.render(<Dashboard locations={mockLocations} />);
      await waitForContent();
      
      const summary = container.querySelector('[data-testid="block-summary"]');
      expect(summary).toBeTruthy();
      expect(summary?.className).toContain(theme.components.card.split(' ')[0]);
    });

    it('renders block cards with themed styling', async () => {
      root.render(<Dashboard locations={mockLocations} />);
      await waitForContent();
      
      const blockCard = container.querySelector('[data-testid="block-card-north"]');
      expect(blockCard).toBeTruthy();
      expect(blockCard?.className).toContain(theme.components.card.split(' ')[0]);
    });

    it('displays block information with themed typography', async () => {
      root.render(<Dashboard locations={mockLocations} />);
      await waitForContent();
      
      const blocks = container.querySelectorAll('[data-testid^="block-card-"]');
      blocks.forEach(block => {
        const title = block.querySelector('div');
        expect(title?.className).toContain(theme.typography.body.split(' ')[0]);
      });
    });
  });

  describe('Dashboard Layout', () => {
    it('uses themed spacing and background', async () => {
      root.render(<Dashboard locations={mockLocations} />);
      await waitForContent();
      
      const container = document.querySelector('.min-h-screen');
      expect(container).toBeTruthy();
      expect(container?.className).toContain('bg-background-secondary');
      
      const innerContainer = container?.querySelector('.container');
      expect(innerContainer).toBeTruthy();
      expect(innerContainer?.className).toContain(theme.spacing.page.x.split(' ')[0]);
      expect(innerContainer?.className).toContain(theme.spacing.page.y.split(' ')[0]);
    });
  });
}); 