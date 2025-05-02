import { services } from '../clientServices';
import { TrainRoute, RollingStock } from '@/app/shared/types/models';

describe('Client Services', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    jest.resetAllMocks();
  });

  describe('LocationService', () => {
    it('gets all locations', async () => {
      const mockLocations = [{ _id: '1', stationName: 'Station A' }];
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockLocations
      });

      const result = await services.locationService.getAllLocations();
      
      expect(result).toEqual(mockLocations);
      expect(global.fetch).toHaveBeenCalledWith('/api/locations');
    });
  });

  describe('IndustryService', () => {
    it('gets all industries', async () => {
      const mockIndustries = [{ _id: '1', name: 'Industry A' }];
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockIndustries
      });

      const result = await services.industryService.getAllIndustries();
      
      expect(result).toEqual(mockIndustries);
      expect(global.fetch).toHaveBeenCalledWith('/api/industries');
    });

    it('updates an industry', async () => {
      const industryId = '1';
      const updateData = { name: 'Updated Industry' };
      const updatedIndustry = { _id: industryId, ...updateData };
      
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => updatedIndustry
      });

      const result = await services.industryService.updateIndustry(industryId, updateData);
      
      expect(result).toEqual(updatedIndustry);
      expect(global.fetch).toHaveBeenCalledWith(`/api/industries/${industryId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });
    });

    it('handles errors when updating an industry', async () => {
      const industryId = '1';
      const updateData = { name: 'Updated Industry' };
      
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        statusText: 'Not Found'
      });

      await expect(services.industryService.updateIndustry(industryId, updateData))
        .rejects.toThrow(`Failed to update industry with id ${industryId}`);
    });

    it('creates a new industry', async () => {
      const newIndustry = { name: 'New Industry' };
      const createdIndustry = { _id: '1', ...newIndustry };
      
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => createdIndustry
      });

      const result = await services.industryService.createIndustry(newIndustry);
      
      expect(result).toEqual(createdIndustry);
      expect(global.fetch).toHaveBeenCalledWith('/api/industries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newIndustry),
      });
    });

    it('handles errors when creating an industry', async () => {
      const newIndustry = { name: 'New Industry' };
      
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        statusText: 'Bad Request'
      });

      await expect(services.industryService.createIndustry(newIndustry))
        .rejects.toThrow('Failed to create industry');
    });

    it('deletes an industry', async () => {
      const industryId = '1';
      
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true
      });

      await services.industryService.deleteIndustry(industryId);
      
      expect(global.fetch).toHaveBeenCalledWith(`/api/industries/${industryId}`, {
        method: 'DELETE',
      });
    });

    it('handles errors when deleting an industry', async () => {
      const industryId = '1';
      
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        statusText: 'Not Found'
      });

      await expect(services.industryService.deleteIndustry(industryId))
        .rejects.toThrow(`Failed to delete industry with id ${industryId}`);
    });
  });

  describe('TrainRouteService', () => {
    it('gets all train routes', async () => {
      const mockTrainRoutes = [{ 
        _id: '1', 
        name: 'Route A',
        ownerId: 'owner1',
        routeNumber: 'R1',
        routeType: 'MIXED',
        originatingYardId: 'yard1',
        terminatingYardId: 'yard2',
        stations: []
      }];
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockTrainRoutes
      });

      const result = await services.trainRouteService.getAllTrainRoutes();
      
      expect(result).toEqual(mockTrainRoutes);
      expect(global.fetch).toHaveBeenCalledWith('/api/train-routes');
    });

    it('updates a train route', async () => {
      const routeId = '1';
      const updateData: TrainRoute = { 
        _id: routeId, 
        name: 'Updated Route',
        ownerId: 'owner1',
        routeNumber: 'R1',
        routeType: 'MIXED',
        originatingYardId: 'yard1',
        terminatingYardId: 'yard2',
        stations: []
      };
      
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => updateData
      });

      const result = await services.trainRouteService.updateTrainRoute(routeId, updateData);
      
      expect(result).toEqual(updateData);
      expect(global.fetch).toHaveBeenCalledWith(`/api/train-routes/${routeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });
    });

    it('handles errors when updating a train route', async () => {
      const routeId = '1';
      const updateData: TrainRoute = { 
        _id: routeId, 
        name: 'Updated Route',
        ownerId: 'owner1',
        routeNumber: 'R1',
        routeType: 'MIXED',
        originatingYardId: 'yard1',
        terminatingYardId: 'yard2',
        stations: []
      };
      
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        statusText: 'Not Found'
      });

      await expect(services.trainRouteService.updateTrainRoute(routeId, updateData))
        .rejects.toThrow(`Failed to update train route with id ${routeId}`);
    });
  });

  describe('RollingStockService', () => {
    it('gets all rolling stock', async () => {
      const mockRollingStock = [{ 
        _id: '1', 
        ownerId: 'owner1',
        roadName: 'BNSF', 
        roadNumber: '1234',
        aarType: 'XM',
        description: 'Boxcar',
        color: 'Orange',
        note: '',
        homeYard: 'yard1'
      }];
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockRollingStock
      });

      const result = await services.rollingStockService.getAllRollingStock();
      
      expect(result).toEqual(mockRollingStock);
      expect(global.fetch).toHaveBeenCalledWith('/api/rolling-stock');
    });

    it('updates rolling stock', async () => {
      const stockId = '1';
      const updateData: RollingStock = { 
        _id: stockId, 
        ownerId: 'owner1',
        roadName: 'UP', 
        roadNumber: '5678',
        aarType: 'XM',
        description: 'Boxcar',
        color: 'Yellow',
        note: '',
        homeYard: 'yard1'
      };
      
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => updateData
      });

      await services.rollingStockService.updateRollingStock(stockId, updateData);
      
      expect(global.fetch).toHaveBeenCalledWith(`/api/rolling-stock/${stockId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });
    });

    it('resets rolling stock to home yards', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true
      });

      await services.rollingStockService.resetToHomeYards();
      
      expect(global.fetch).toHaveBeenCalledWith('/api/rolling-stock/reset', {
        method: 'POST',
      });
    });

    it('handles errors when resetting rolling stock to home yards', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        statusText: 'Internal Server Error'
      });

      await expect(services.rollingStockService.resetToHomeYards())
        .rejects.toThrow('Failed to reset rolling stock');
    });
  });

  describe('LayoutStateService', () => {
    it('gets the layout state', async () => {
      const mockLayoutState = { 
        _id: '1', 
        industries: [], 
        rollingStock: [] 
      };
      
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockLayoutState
      });

      const result = await services.layoutStateService.getLayoutState();
      
      expect(result).toEqual(mockLayoutState);
      expect(global.fetch).toHaveBeenCalledWith('/api/layout-state');
    });

    it('returns null when layout state does not exist', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ exists: false })
      });

      const result = await services.layoutStateService.getLayoutState();
      
      expect(result).toBeNull();
    });

    it('handles errors when getting layout state', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        statusText: 'Not Found'
      });

      await expect(services.layoutStateService.getLayoutState())
        .rejects.toThrow('Failed to fetch layout state: Not Found');
    });

    it('saves the layout state', async () => {
      const layoutState = { 
        industries: [], 
        rollingStock: [] 
      };
      
      const savedState = { 
        _id: '1', 
        ...layoutState 
      };
      
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => savedState
      });

      const result = await services.layoutStateService.saveLayoutState(layoutState);
      
      expect(result).toEqual(savedState);
      expect(global.fetch).toHaveBeenCalledWith('/api/layout-state', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(layoutState),
      });
    });

    it('handles errors when saving layout state', async () => {
      const layoutState = { 
        industries: [], 
        rollingStock: [] 
      };
      
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        statusText: 'Bad Request'
      });

      await expect(services.layoutStateService.saveLayoutState(layoutState))
        .rejects.toThrow('Failed to save layout state: Bad Request');
    });
  });
}); 