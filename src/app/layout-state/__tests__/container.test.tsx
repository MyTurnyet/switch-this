import React from 'react';
import { render, screen, waitFor, act, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Location, Industry, RollingStock } from '../../shared/types/models';
import LayoutStateContainer from '../container';

// Fake implementations of the fetch API
class FakeResponse implements Response {
  constructor(public data: unknown, public ok: boolean = true) {}
  async json(): Promise<unknown> { return this.data; }
  
  // Required Response interface properties
  headers = new Headers();
  redirected = false;
  status = 200;
  statusText = "OK";
  type: ResponseType = "basic";
  url = "";
  clone(): Response { return this; }
  body = null;
  bodyUsed = false;
  bytes(): Promise<Uint8Array> { return Promise.resolve(new Uint8Array()); }
  arrayBuffer(): Promise<ArrayBuffer> { throw new Error("Not implemented"); }
  blob(): Promise<Blob> { throw new Error("Not implemented"); }
  formData(): Promise<FormData> { throw new Error("Not implemented"); }
  text(): Promise<string> { throw new Error("Not implemented"); }
}

class FakeFetch {
  private responses: Record<string, FakeResponse> = {};
  private delay: number = 0;

  setResponse(url: string, data: unknown, ok: boolean = true): void {
    this.responses[url] = new FakeResponse(data, ok);
  }

  setDelay(ms: number): void {
    this.delay = ms;
  }

  async fetch(input: URL | RequestInfo): Promise<Response> {
    const url = input.toString();
    const response = this.responses[url];
    if (!response) throw new Error(`No response set for ${url}`);
    if (this.delay > 0) {
      await new Promise(resolve => setTimeout(resolve, this.delay));
    }
    return response;
  }
}

describe('LayoutStateContainer', () => {
  let fakeFetch: FakeFetch;

  beforeEach(() => {
    fakeFetch = new FakeFetch();
    global.fetch = fakeFetch.fetch.bind(fakeFetch);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const setupComponent = async () => {
    let renderResult;
    await act(async () => {
      renderResult = render(<LayoutStateContainer />);
      // Wait for all API calls to complete
      await Promise.resolve();
    });
    return renderResult;
  };

  const waitForLoadingToComplete = async () => {
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
  };

  it('shows loading state initially', async () => {
    // Set up mock responses with a delay
    fakeFetch.setDelay(100);
    fakeFetch.setResponse('/api/locations', []);
    fakeFetch.setResponse('/api/industries', []);
    fakeFetch.setResponse('/api/rolling-stock', []);

    render(<LayoutStateContainer />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('shows error state when API calls fail', async () => {
    fakeFetch.setResponse('/api/locations', [], false);
    fakeFetch.setResponse('/api/industries', [], false);
    fakeFetch.setResponse('/api/rolling-stock', [], false);

    await act(async () => {
      await setupComponent();
    });
    
    await waitFor(() => {
      expect(screen.getByText('Failed to fetch data')).toBeInTheDocument();
    });
  });

  it('transforms rolling stock data into a map', async () => {
    const mockLocations: Location[] = [
      {
        _id: { $oid: 'loc1' },
        stationName: 'Location 1',
        block: 'A',
        ownerId: { $oid: 'owner1' }
      }
    ];

    const mockIndustries: Industry[] = [
      {
        _id: { $oid: 'ind1' },
        name: 'Industry 1',
        industryType: 'FREIGHT',
        tracks: [
          {
            _id: { $oid: 'track1' },
            name: 'Track 1',
            maxCars: { $numberInt: '5' },
            placedCars: []
          }
        ],
        locationId: { $oid: 'loc1' },
        ownerId: { $oid: 'owner1' }
      }
    ];

    const mockRollingStock: RollingStock[] = [
      { 
        _id: { $oid: 'car1' }, 
        roadName: 'BNSF', 
        roadNumber: '1234', 
        aarType: 'BOX',
        description: 'Box Car',
        color: 'Red',
        note: '',
        homeYard: { $oid: 'yard1' },
        ownerId: { $oid: 'owner1' }
      }
    ];

    fakeFetch.setResponse('/api/locations', mockLocations);
    fakeFetch.setResponse('/api/industries', mockIndustries);
    fakeFetch.setResponse('/api/rolling-stock', mockRollingStock);

    await act(async () => {
      await setupComponent();
    });
    await waitForLoadingToComplete();

    await waitFor(() => {
      expect(screen.getByTestId('layout-state-container')).toBeInTheDocument();
    });
  });

  it('passes correct props to CurrentLayoutState', async () => {
    const mockLocations: Location[] = [
      {
        _id: { $oid: 'loc1' },
        stationName: 'Location 1',
        block: 'A',
        ownerId: { $oid: 'owner1' }
      }
    ];

    const mockIndustries: Industry[] = [
      {
        _id: { $oid: 'ind1' },
        name: 'Industry 1',
        industryType: 'FREIGHT',
        tracks: [
          {
            _id: { $oid: 'track1' },
            name: 'Track 1',
            maxCars: { $numberInt: '5' },
            placedCars: []
          }
        ],
        locationId: { $oid: 'loc1' },
        ownerId: { $oid: 'owner1' }
      }
    ];

    const mockRollingStock: RollingStock[] = [
      { 
        _id: { $oid: 'car1' }, 
        roadName: 'BNSF', 
        roadNumber: '1234', 
        aarType: 'BOX',
        description: 'Box Car',
        color: 'Red',
        note: '',
        homeYard: { $oid: 'yard1' },
        ownerId: { $oid: 'owner1' }
      }
    ];

    fakeFetch.setResponse('/api/locations', mockLocations);
    fakeFetch.setResponse('/api/industries', mockIndustries);
    fakeFetch.setResponse('/api/rolling-stock', mockRollingStock);

    await act(async () => {
      await setupComponent();
    });
    await waitForLoadingToComplete();

    await waitFor(() => {
      const container = screen.getByTestId('layout-state-container');
      expect(container).toHaveAttribute('data-locations', JSON.stringify(mockLocations));
      expect(container).toHaveAttribute('data-industries', JSON.stringify(mockIndustries));
      expect(container).toHaveAttribute('data-rolling-stock', JSON.stringify({ 'car1': mockRollingStock[0] }));
    });
  });

  it('renders Reset State button', async () => {
    fakeFetch.setResponse('/api/locations', []);
    fakeFetch.setResponse('/api/industries', []);
    fakeFetch.setResponse('/api/rolling-stock', []);

    await act(async () => {
      await setupComponent();
    });
    await waitForLoadingToComplete();

    const resetButton = screen.getByRole('button', { name: /reset state/i });
    expect(resetButton).toBeInTheDocument();
    expect(resetButton).toHaveClass('MuiButton-contained');
    expect(resetButton).toHaveClass('MuiButton-colorSecondary');
  });

  it('resets layout state when Reset State button is clicked', async () => {
    // Set up initial mock data
    const mockLocations: Location[] = [
      {
        _id: { $oid: 'loc1' },
        stationName: 'Location 1',
        block: 'A',
        ownerId: { $oid: 'owner1' }
      }
    ];

    const mockIndustries: Industry[] = [
      {
        _id: { $oid: 'ind1' },
        name: 'Industry 1',
        industryType: 'FREIGHT',
        tracks: [
          {
            _id: { $oid: 'track1' },
            name: 'Track 1',
            maxCars: { $numberInt: '5' },
            placedCars: []
          }
        ],
        locationId: { $oid: 'loc1' },
        ownerId: { $oid: 'owner1' }
      }
    ];

    const mockRollingStock: RollingStock[] = [
      { 
        _id: { $oid: 'car1' }, 
        roadName: 'BNSF', 
        roadNumber: '1234', 
        aarType: 'BOX',
        description: 'Box Car',
        color: 'Red',
        note: '',
        homeYard: { $oid: 'yard1' },
        ownerId: { $oid: 'owner1' }
      }
    ];

    // Set up mock responses
    fakeFetch.setResponse('/api/locations', mockLocations);
    fakeFetch.setResponse('/api/industries', mockIndustries);
    fakeFetch.setResponse('/api/rolling-stock', mockRollingStock);

    await act(async () => {
      await setupComponent();
    });
    await waitForLoadingToComplete();

    // Verify initial state
    const container = screen.getByTestId('layout-state-container');
    expect(container).toHaveAttribute('data-locations', JSON.stringify(mockLocations));
    expect(container).toHaveAttribute('data-industries', JSON.stringify(mockIndustries));
    expect(container).toHaveAttribute('data-rolling-stock', JSON.stringify({ 'car1': mockRollingStock[0] }));

    // Set up new mock responses for after reset
    const newMockLocations: Location[] = [
      {
        _id: { $oid: 'loc2' },
        stationName: 'Location 2',
        block: 'B',
        ownerId: { $oid: 'owner1' }
      }
    ];

    const newMockIndustries: Industry[] = [
      {
        _id: { $oid: 'ind2' },
        name: 'Industry 2',
        industryType: 'FREIGHT',
        tracks: [
          {
            _id: { $oid: 'track2' },
            name: 'Track 2',
            maxCars: { $numberInt: '5' },
            placedCars: []
          }
        ],
        locationId: { $oid: 'loc2' },
        ownerId: { $oid: 'owner1' }
      }
    ];

    const newMockRollingStock: RollingStock[] = [
      { 
        _id: { $oid: 'car2' }, 
        roadName: 'UP', 
        roadNumber: '5678', 
        aarType: 'TANK',
        description: 'Tank Car',
        color: 'Blue',
        note: '',
        homeYard: { $oid: 'yard2' },
        ownerId: { $oid: 'owner2' }
      }
    ];

    // Update mock responses for the reset fetch
    fakeFetch.setResponse('/api/locations', newMockLocations);
    fakeFetch.setResponse('/api/industries', newMockIndustries);
    fakeFetch.setResponse('/api/rolling-stock', newMockRollingStock);

    // Click reset button
    const resetButton = screen.getByRole('button', { name: /reset state/i });
    await act(async () => {
      fireEvent.click(resetButton);
    });

    // Wait for the new state to be reflected in the UI
    await waitFor(() => {
      const updatedContainer = screen.getByTestId('layout-state-container');
      expect(updatedContainer).toHaveAttribute('data-locations', JSON.stringify(newMockLocations));
      expect(updatedContainer).toHaveAttribute('data-industries', JSON.stringify(newMockIndustries));
      expect(updatedContainer).toHaveAttribute('data-rolling-stock', JSON.stringify({ 'car2': newMockRollingStock[0] }));
    });
  });

  it('handles errors during reset data fetch', async () => {
    // Set up initial mock data
    fakeFetch.setResponse('/api/locations', []);
    fakeFetch.setResponse('/api/industries', []);
    fakeFetch.setResponse('/api/rolling-stock', []);

    await act(async () => {
      await setupComponent();
    });
    await waitForLoadingToComplete();

    // Set up error responses for reset
    fakeFetch.setResponse('/api/locations', [], false);
    fakeFetch.setResponse('/api/industries', [], false);
    fakeFetch.setResponse('/api/rolling-stock', [], false);

    // Click reset button
    const resetButton = screen.getByRole('button', { name: /reset state/i });
    await act(async () => {
      fireEvent.click(resetButton);
    });

    // Verify error state is shown
    await waitFor(() => {
      expect(screen.getByText('Failed to fetch data')).toBeInTheDocument();
    });
  });

  it('resets layout state even when API calls are delayed', async () => {
    // Set up initial mock data with delay
    fakeFetch.setDelay(100);
    fakeFetch.setResponse('/api/locations', []);
    fakeFetch.setResponse('/api/industries', []);
    fakeFetch.setResponse('/api/rolling-stock', []);

    await act(async () => {
      await setupComponent();
    });
    await waitForLoadingToComplete();

    // Set up new mock responses with delay
    fakeFetch.setDelay(100);
    fakeFetch.setResponse('/api/locations', []);
    fakeFetch.setResponse('/api/industries', []);
    fakeFetch.setResponse('/api/rolling-stock', []);

    // Click reset button
    const resetButton = screen.getByRole('button', { name: /reset state/i });
    await act(async () => {
      fireEvent.click(resetButton);
    });

    // Verify loading state is shown
    expect(screen.getByRole('progressbar')).toBeInTheDocument();

    // Wait for loading to complete
    await waitForLoadingToComplete();

    // Verify state is reset
    const container = screen.getByTestId('layout-state-container');
    expect(container).toHaveAttribute('data-locations', '[]');
    expect(container).toHaveAttribute('data-industries', '[]');
    expect(container).toHaveAttribute('data-rolling-stock', '{}');
  });

  it('resets rolling stock to their home locations when Reset State button is clicked', async () => {
    // Set up initial mock data with cars in non-home locations
    const mockLocations: Location[] = [
      {
        _id: { $oid: 'loc1' },
        stationName: 'Location 1',
        block: 'A',
        ownerId: { $oid: 'owner1' }
      },
      {
        _id: { $oid: 'yard1' },
        stationName: 'Home Yard',
        block: 'B',
        ownerId: { $oid: 'owner1' }
      }
    ];

    const mockIndustries: Industry[] = [
      {
        _id: { $oid: 'ind1' },
        name: 'Industry 1',
        industryType: 'FREIGHT',
        tracks: [
          {
            _id: { $oid: 'track1' },
            name: 'Track 1',
            maxCars: { $numberInt: '5' },
            placedCars: []
          }
        ],
        locationId: { $oid: 'loc1' },
        ownerId: { $oid: 'owner1' }
      }
    ];

    const mockRollingStock: RollingStock[] = [
      { 
        _id: { $oid: 'car1' }, 
        roadName: 'BNSF', 
        roadNumber: '1234', 
        aarType: 'BOX',
        description: 'Box Car',
        color: 'Red',
        note: '',
        homeYard: { $oid: 'yard1' },
        ownerId: { $oid: 'owner1' }
      }
    ];

    // Set up mock responses
    fakeFetch.setResponse('/api/locations', mockLocations);
    fakeFetch.setResponse('/api/industries', mockIndustries);
    fakeFetch.setResponse('/api/rolling-stock', mockRollingStock);

    await act(async () => {
      await setupComponent();
    });
    await waitForLoadingToComplete();

    // Verify initial state with car at non-home location
    const container = screen.getByTestId('layout-state-container');
    expect(container).toHaveAttribute('data-locations', JSON.stringify(mockLocations));
    expect(container).toHaveAttribute('data-industries', JSON.stringify(mockIndustries));
    expect(container).toHaveAttribute('data-rolling-stock', JSON.stringify({ 'car1': mockRollingStock[0] }));

    // Click reset button
    const resetButton = screen.getByRole('button', { name: /reset state/i });
    await act(async () => {
      fireEvent.click(resetButton);
    });

    // Wait for the new state to be reflected in the UI
    await waitFor(() => {
      const updatedContainer = screen.getByTestId('layout-state-container');
      const rollingStockData = JSON.parse(updatedContainer.getAttribute('data-rolling-stock') || '{}');
      const car1 = rollingStockData['car1'];
      expect(car1.homeYard.$oid).toBe('yard1');
    });
  });

  it('handles multiple cars with different home yards', async () => {
    const mockLocations: Location[] = [
      {
        _id: { $oid: 'loc1' },
        stationName: 'Location 1',
        block: 'A',
        ownerId: { $oid: 'owner1' }
      },
      {
        _id: { $oid: 'yard1' },
        stationName: 'Home Yard 1',
        block: 'B',
        ownerId: { $oid: 'owner1' }
      },
      {
        _id: { $oid: 'yard2' },
        stationName: 'Home Yard 2',
        block: 'C',
        ownerId: { $oid: 'owner1' }
      }
    ];

    const mockIndustries: Industry[] = [
      {
        _id: { $oid: 'ind1' },
        name: 'Industry 1',
        industryType: 'FREIGHT',
        tracks: [
          {
            _id: { $oid: 'track1' },
            name: 'Track 1',
            maxCars: { $numberInt: '5' },
            placedCars: []
          }
        ],
        locationId: { $oid: 'loc1' },
        ownerId: { $oid: 'owner1' }
      }
    ];

    const mockRollingStock: RollingStock[] = [
      { 
        _id: { $oid: 'car1' }, 
        roadName: 'BNSF', 
        roadNumber: '1234', 
        aarType: 'BOX',
        description: 'Box Car',
        color: 'Red',
        note: '',
        homeYard: { $oid: 'yard1' },
        ownerId: { $oid: 'owner1' }
      },
      { 
        _id: { $oid: 'car2' }, 
        roadName: 'UP', 
        roadNumber: '5678', 
        aarType: 'TANK',
        description: 'Tank Car',
        color: 'Blue',
        note: '',
        homeYard: { $oid: 'yard2' },
        ownerId: { $oid: 'owner1' }
      }
    ];

    fakeFetch.setResponse('/api/locations', mockLocations);
    fakeFetch.setResponse('/api/industries', mockIndustries);
    fakeFetch.setResponse('/api/rolling-stock', mockRollingStock);

    await act(async () => {
      await setupComponent();
    });
    await waitForLoadingToComplete();

    // Click reset button
    const resetButton = screen.getByRole('button', { name: /reset state/i });
    await act(async () => {
      fireEvent.click(resetButton);
    });

    // Wait for the new state to be reflected in the UI
    await waitFor(() => {
      const updatedContainer = screen.getByTestId('layout-state-container');
      const rollingStockData = JSON.parse(updatedContainer.getAttribute('data-rolling-stock') || '{}');
      const car1 = rollingStockData['car1'];
      const car2 = rollingStockData['car2'];
      expect(car1.homeYard.$oid).toBe('yard1');
      expect(car2.homeYard.$oid).toBe('yard2');
    });
  });

  it('handles cars that are not at their home locations', async () => {
    const mockLocations: Location[] = [
      {
        _id: { $oid: 'loc1' },
        stationName: 'Location 1',
        block: 'A',
        ownerId: { $oid: 'owner1' }
      },
      {
        _id: { $oid: 'yard1' },
        stationName: 'Home Yard',
        block: 'B',
        ownerId: { $oid: 'owner1' }
      }
    ];

    const mockIndustries: Industry[] = [
      {
        _id: { $oid: 'ind1' },
        name: 'Industry 1',
        industryType: 'FREIGHT',
        tracks: [
          {
            _id: { $oid: 'track1' },
            name: 'Track 1',
            maxCars: { $numberInt: '5' },
            placedCars: []
          }
        ],
        locationId: { $oid: 'loc1' },
        ownerId: { $oid: 'owner1' }
      }
    ];

    const mockRollingStock: RollingStock[] = [
      { 
        _id: { $oid: 'car1' }, 
        roadName: 'BNSF', 
        roadNumber: '1234', 
        aarType: 'BOX',
        description: 'Box Car',
        color: 'Red',
        note: '',
        homeYard: { $oid: 'yard1' },
        ownerId: { $oid: 'owner1' }
      }
    ];

    fakeFetch.setResponse('/api/locations', mockLocations);
    fakeFetch.setResponse('/api/industries', mockIndustries);
    fakeFetch.setResponse('/api/rolling-stock', mockRollingStock);

    await act(async () => {
      await setupComponent();
    });
    await waitForLoadingToComplete();

    // Click reset button
    const resetButton = screen.getByRole('button', { name: /reset state/i });
    await act(async () => {
      fireEvent.click(resetButton);
    });

    // Wait for the new state to be reflected in the UI
    await waitFor(() => {
      const updatedContainer = screen.getByTestId('layout-state-container');
      const rollingStockData = JSON.parse(updatedContainer.getAttribute('data-rolling-stock') || '{}');
      const car1 = rollingStockData['car1'];
      expect(car1.homeYard.$oid).toBe('yard1');
    });
  });
}); 