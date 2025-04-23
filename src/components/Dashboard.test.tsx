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
    it('displays the dashboard title with proper styling', async () => {
      root.render(<Dashboard locations={mockLocations} />);
      await waitForContent();
      
      const header = container.querySelector('.mb-8.bg-gradient-to-r');
      expect(header).toBeTruthy();
      expect(header?.className).toContain('bg-gradient-to-r');
      expect(header?.className).toContain('from-primary-600');
      
      const title = header?.querySelector('h1');
      expect(title).toBeTruthy();
      expect(title?.textContent).toBe('Model Railroad Locations');
      expect(title?.className).toContain('text-3xl');
    });

    it('displays location count with frosted glass effect', async () => {
      root.render(<Dashboard locations={mockLocations} />);
      await waitForContent();
      
      const badge = container.querySelector('.bg-white\\/20');
      expect(badge).toBeTruthy();
      expect(badge?.className).toContain('backdrop-blur-sm');
      expect(badge?.textContent).toBe(`${mockLocations.length} Total Locations`);
    });
  });

  describe('BlockSummary', () => {
    it('displays block summary section with proper typography', async () => {
      root.render(<Dashboard locations={mockLocations} />);
      await waitForContent();
      
      const summary = container.querySelector('h2');
      expect(summary).toBeTruthy();
      expect(summary?.textContent).toBe('Block Summary');
    });

    it('renders block cards with hover effects', async () => {
      root.render(<Dashboard locations={mockLocations} />);
      await waitForContent();
      
      const blockCards = container.querySelectorAll('[data-testid^="block-card-"]');
      expect(blockCards.length).toBeGreaterThan(0);
      blockCards.forEach(card => {
        expect(card?.className).toContain('relative');
        expect(card?.className).toContain('group');
        
        const background = card.querySelector('.bg-gradient-to-r');
        expect(background).toBeTruthy();
        expect(background?.className).toContain('from-accent-400');
      });
    });

    it('displays block information with proper typography', async () => {
      root.render(<Dashboard locations={mockLocations} />);
      await waitForContent();
      
      const blocks = container.querySelectorAll('[data-testid^="block-card-"]');
      blocks.forEach(block => {
        const title = block.querySelector('.font-semibold');
        const count = block.querySelector('.text-sm');
        expect(title).toBeTruthy();
        expect(count).toBeTruthy();
        expect(title?.className).toContain('text-gray-900');
        expect(count?.className).toContain('text-gray-600');
      });
    });
  });
}); 