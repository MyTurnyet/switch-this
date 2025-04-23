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

  it('displays the dashboard title', async () => {
    root.render(<Dashboard locations={mockLocations} />);
    await waitForContent();
    expect(container.textContent).toContain('Model Railroad Locations');
  });

  it('displays location count', async () => {
    root.render(<Dashboard locations={mockLocations} />);
    await waitForContent();
    expect(container.textContent).toContain(`Total Locations: ${mockLocations.length}`);
  });

  it('displays block summary', async () => {
    root.render(<Dashboard locations={mockLocations} />);
    await waitForContent();
    expect(container.textContent).toContain('Block Summary');
  });

  it('displays all locations', async () => {
    root.render(<Dashboard locations={mockLocations} />);
    await waitForContent();
    expect(container.textContent).toContain(mockLocations[0].stationName);
  });
}); 