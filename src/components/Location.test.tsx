import React from 'react';
import { createRoot, Root } from 'react-dom/client';
import Location from './Location';

describe('Location', () => {
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

  const testLocation = {
    _id: { $oid: '123' },
    stationName: 'Test Station',
    block: 'NORTH',
    ownerId: { $oid: '456' }
  };

  const waitForContent = () => new Promise(resolve => setTimeout(resolve, 100));

  it('renders station name', async () => {
    root.render(<Location location={testLocation} />);
    await waitForContent();
    expect(container.textContent).toContain('Test Station');
  });

  it('renders block information', async () => {
    root.render(<Location location={testLocation} />);
    await waitForContent();
    expect(container.textContent).toContain('Block: NORTH');
  });

  it('renders location ID', async () => {
    root.render(<Location location={testLocation} />);
    await waitForContent();
    expect(container.textContent).toContain('ID: 123');
  });
}); 