import { render, screen, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import LayoutStateContainer from '../container';
import { Location, Industry, RollingStock } from '../../shared/types/models';

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

  setResponse(url: string, data: unknown, ok: boolean = true): void {
    this.responses[url] = new FakeResponse(data, ok);
  }

  async fetch(input: URL | RequestInfo): Promise<Response> {
    const url = input.toString();
    const response = this.responses[url];
    if (!response) throw new Error(`No response set for ${url}`);
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

  it('shows loading state initially', () => {
    render(<LayoutStateContainer />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('shows error state when API calls fail', async () => {
    fakeFetch.setResponse('/api/locations', [], false);
    fakeFetch.setResponse('/api/industries', [], false);
    fakeFetch.setResponse('/api/rolling-stock', [], false);

    await act(async () => {
      render(<LayoutStateContainer />);
    });
    
    await waitFor(() => {
      expect(screen.getByText(/Error: Failed to fetch locations/i)).toBeInTheDocument();
    });
  });

  it('transforms rolling stock data into a map', async () => {
    const mockLocations: Location[] = [
      { _id: { $oid: 'loc1' }, stationName: 'Station 1', block: 'A', ownerId: { $oid: 'owner1' } }
    ];

    const mockIndustries: Industry[] = [
      { 
        _id: { $oid: 'ind1' }, 
        name: 'Industry 1', 
        industryType: 'Manufacturing',
        locationId: { $oid: 'loc1' },
        ownerId: { $oid: 'owner1' },
        tracks: []
      }
    ];

    const mockRollingStock: RollingStock[] = [
      { 
        _id: { $oid: 'car1' }, 
        roadName: 'BNSF', 
        roadNumber: 1234, 
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
      render(<LayoutStateContainer />);
    });

    await waitFor(() => {
      expect(screen.getByTestId('layout-state-container')).toBeInTheDocument();
    });
  });

  it('passes correct props to CurrentLayoutState', async () => {
    const mockLocations: Location[] = [
      { _id: { $oid: 'loc1' }, stationName: 'Station 1', block: 'A', ownerId: { $oid: 'owner1' } }
    ];

    const mockIndustries: Industry[] = [
      { 
        _id: { $oid: 'ind1' }, 
        name: 'Industry 1', 
        industryType: 'Manufacturing',
        locationId: { $oid: 'loc1' },
        ownerId: { $oid: 'owner1' },
        tracks: []
      }
    ];

    const mockRollingStock: RollingStock[] = [
      { 
        _id: { $oid: 'car1' }, 
        roadName: 'BNSF', 
        roadNumber: 1234, 
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
      render(<LayoutStateContainer />);
    });

    await waitFor(() => {
      const container = screen.getByTestId('layout-state-container');
      expect(container).toBeInTheDocument();
      expect(container).toHaveAttribute('data-locations', JSON.stringify(mockLocations));
      expect(container).toHaveAttribute('data-industries', JSON.stringify(mockIndustries));
      expect(container).toHaveAttribute('data-rolling-stock', JSON.stringify({ 'car1': mockRollingStock[0] }));
    });
  });
}); 