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
      
      const title = container.querySelector('h1');
      expect(title).toBeTruthy();
      expect(title?.textContent).toBe('Model Railroad Locations');
      expect(title?.parentElement?.className).toContain(theme.typography.title.split(' ')[0]);
    });

    it('displays location count with themed badge', async () => {
      root.render(<Dashboard locations={mockLocations} />);
      await waitForContent();
      
      const badge = container.querySelector('[data-testid="location-count"]');
      expect(badge).toBeTruthy();
      expect(badge?.textContent).toBe(`${mockLocations.length} Total Locations`);
    });
  });

  describe('BlockSummary', () => {
    it('displays block summary section with themed typography', async () => {
      root.render(<Dashboard locations={mockLocations} />);
      await waitForContent();
      
      const summary = container.querySelector('h2');
      expect(summary).toBeTruthy();
      expect(summary?.className).toContain(theme.typography.subtitle.split(' ')[0]);
    });

    it('renders block cards with themed styling', async () => {
      root.render(<Dashboard locations={mockLocations} />);
      await waitForContent();
      
      const blockCards = container.querySelectorAll('[data-testid^="block-card-"]');
      expect(blockCards.length).toBeGreaterThan(0);
      blockCards.forEach(card => {
        expect(card?.className).toContain('bg-gradient-to-br');
        expect(card?.className).toContain('from-secondary-50');
      });
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
}); 