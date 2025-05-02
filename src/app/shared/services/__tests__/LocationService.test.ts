import { LocationService } from '../LocationService';

describe('LocationService', () => {
  let service: LocationService;

  beforeEach(() => {
    service = new LocationService();
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should fetch all locations', async () => {
    const mockLocations = [{ _id: '1', stationName: 'Test Station', block: 'A', ownerId: 'owner1' }];
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockLocations
    });

    const result = await service.getAllLocations();
    expect(result).toEqual(mockLocations);
    expect(global.fetch).toHaveBeenCalledWith('/api/locations');
  });

  it('should handle fetch error', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false
    });

    await expect(service.getAllLocations()).rejects.toThrow('Failed to fetch locations');
  });

  it('should handle network error', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Failed to fetch locations'));

    await expect(service.getAllLocations()).rejects.toThrow('Failed to fetch locations');
  });

  // Tests for getLocationById
  describe('getLocationById', () => {
    it('should fetch a location by id', async () => {
      const mockLocation = { _id: '1', stationName: 'Test Station', block: 'A', ownerId: 'owner1' };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockLocation
      });

      const result = await service.getLocationById('1');
      expect(result).toEqual(mockLocation);
      expect(global.fetch).toHaveBeenCalledWith('/api/locations/1');
    });

    it('should handle fetch error when getting location by id', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false
      });

      await expect(service.getLocationById('1')).rejects.toThrow('Failed to fetch location with id 1');
    });

    it('should handle network error when getting location by id', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      await expect(service.getLocationById('1')).rejects.toThrow('Network error');
    });
  });

  // Tests for createLocation
  describe('createLocation', () => {
    it('should create a new location', async () => {
      const newLocation = { stationName: 'New Station', block: 'B', ownerId: 'owner1' };
      const createdLocation = { _id: '2', ...newLocation };
      
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => createdLocation
      });

      const result = await service.createLocation(newLocation);
      
      expect(result).toEqual(createdLocation);
      expect(global.fetch).toHaveBeenCalledWith('/api/locations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newLocation),
      });
    });

    it('should handle error when creating location with error response', async () => {
      const newLocation = { stationName: 'New Station', block: 'B', ownerId: 'owner1' };
      
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Invalid location data' })
      });

      await expect(service.createLocation(newLocation)).rejects.toThrow('Invalid location data');
    });

    it('should handle error when creating location with default error message', async () => {
      const newLocation = { stationName: 'New Station', block: 'B', ownerId: 'owner1' };
      
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({})
      });

      await expect(service.createLocation(newLocation)).rejects.toThrow('Failed to create location');
    });

    it('should handle network error when creating location', async () => {
      const newLocation = { stationName: 'New Station', block: 'B', ownerId: 'owner1' };
      
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      await expect(service.createLocation(newLocation)).rejects.toThrow('Network error');
    });
  });

  // Tests for updateLocation
  describe('updateLocation', () => {
    it('should update a location', async () => {
      const locationId = '1';
      const updateData = { stationName: 'Updated Station' };
      const updatedLocation = { _id: locationId, stationName: 'Updated Station', block: 'A', ownerId: 'owner1' };
      
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => updatedLocation
      });

      const result = await service.updateLocation(locationId, updateData);
      
      expect(result).toEqual(updatedLocation);
      expect(global.fetch).toHaveBeenCalledWith(`/api/locations/${locationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });
    });

    it('should handle error when updating location with error response', async () => {
      const locationId = '1';
      const updateData = { stationName: 'Updated Station' };
      
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Invalid location data' })
      });

      await expect(service.updateLocation(locationId, updateData)).rejects.toThrow('Invalid location data');
    });

    it('should handle error when updating location with default error message', async () => {
      const locationId = '1';
      const updateData = { stationName: 'Updated Station' };
      
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({})
      });

      await expect(service.updateLocation(locationId, updateData)).rejects.toThrow('Failed to update location with id 1');
    });

    it('should handle network error when updating location', async () => {
      const locationId = '1';
      const updateData = { stationName: 'Updated Station' };
      
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      await expect(service.updateLocation(locationId, updateData)).rejects.toThrow('Network error');
    });
  });

  // Tests for deleteLocation
  describe('deleteLocation', () => {
    it('should delete a location', async () => {
      const locationId = '1';
      
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true
      });

      await service.deleteLocation(locationId);
      
      expect(global.fetch).toHaveBeenCalledWith(`/api/locations/${locationId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'X-HTTP-Method-Override': 'DELETE'
        },
        credentials: 'same-origin'
      });
    });

    it('should handle error when deleting location with error response', async () => {
      const locationId = '1';
      
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: async () => { throw new Error('Invalid JSON'); } // Simulate JSON parsing error
      });

      await expect(service.deleteLocation(locationId)).rejects.toThrow('Failed to delete location: Not Found (404)');
    });

    it('should handle error when deleting location with default error message', async () => {
      const locationId = '1';
      
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => { throw new Error('Invalid JSON'); } // Simulate JSON parsing error
      });

      await expect(service.deleteLocation(locationId)).rejects.toThrow('Failed to delete location: Internal Server Error (500)');
    });

    it('should handle network error when deleting location', async () => {
      const locationId = '1';
      
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      await expect(service.deleteLocation(locationId)).rejects.toThrow('Network error');
    });
  });
}); 