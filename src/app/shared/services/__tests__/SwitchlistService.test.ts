import { SwitchlistService } from '../SwitchlistService';

// Mock fetch for tests
global.fetch = jest.fn();

const mockFetch = global.fetch as jest.Mock;

describe('SwitchlistService', () => {
  let service: SwitchlistService;
  const originalFetch = global.fetch;
  
  beforeEach(() => {
    jest.clearAllMocks();
    service = new SwitchlistService();
  });
  
  afterAll(() => {
    global.fetch = originalFetch;
  });
  
  describe('getAllSwitchlists', () => {
    it('should fetch all switchlists', async () => {
      const mockSwitchlists = [
        { _id: '1', name: 'Test Switchlist 1' },
        { _id: '2', name: 'Test Switchlist 2' }
      ];
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockSwitchlists)
      });
      
      const result = await service.getAllSwitchlists();
      
      expect(mockFetch).toHaveBeenCalledWith('/api/switchlists');
      expect(result).toEqual(mockSwitchlists);
    });
  });
  
  describe('createSwitchlist', () => {
    it('should create a new switchlist', async () => {
      const mockResponse = {
        _id: '1',
        trainRouteId: 'tr1',
        name: 'New Switchlist'
      };
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockResponse)
      });
      
      const result = await service.createSwitchlist('tr1', 'New Switchlist');
      
      expect(mockFetch).toHaveBeenCalledWith('/api/switchlists', expect.any(Object));
      expect(result).toEqual(mockResponse);
    });
  });
}); 