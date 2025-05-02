import { SwitchlistService } from '../SwitchlistService';
import { Switchlist } from '@/app/shared/types/models';

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
        { _id: '1', name: 'Test Switchlist 1', trainRouteId: 'tr1', createdAt: '2023-01-01', status: 'CREATED', ownerId: 'user1' },
        { _id: '2', name: 'Test Switchlist 2', trainRouteId: 'tr2', createdAt: '2023-01-02', status: 'COMPLETED', ownerId: 'user1' }
      ];
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockSwitchlists)
      });
      
      const result = await service.getAllSwitchlists();
      
      expect(mockFetch).toHaveBeenCalledWith('/api/switchlists');
      expect(result).toEqual(mockSwitchlists);
    });
    
    it('should handle errors when fetching all switchlists', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: 'Internal Server Error'
      });
      
      await expect(service.getAllSwitchlists()).rejects.toThrow();
    });
    
    it('should handle network errors when fetching all switchlists', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));
      
      await expect(service.getAllSwitchlists()).rejects.toThrow('Network error');
    });
  });
  
  describe('getSwitchlistById', () => {
    it('should fetch a switchlist by ID', async () => {
      const mockSwitchlist = { 
        _id: '1', 
        name: 'Test Switchlist 1', 
        trainRouteId: 'tr1', 
        createdAt: '2023-01-01', 
        status: 'CREATED', 
        ownerId: 'user1' 
      };
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockSwitchlist)
      });
      
      const result = await service.getSwitchlistById('1');
      
      expect(mockFetch).toHaveBeenCalledWith('/api/switchlists/1');
      expect(result).toEqual(mockSwitchlist);
    });
    
    it('should handle errors when fetching a switchlist by ID', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: 'Not Found'
      });
      
      await expect(service.getSwitchlistById('1')).rejects.toThrow();
    });
    
    it('should handle network errors when fetching a switchlist by ID', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));
      
      await expect(service.getSwitchlistById('1')).rejects.toThrow('Network error');
    });
  });
  
  describe('createSwitchlist', () => {
    it('should create a new switchlist', async () => {
      const mockResponse = {
        _id: '1',
        trainRouteId: 'tr1',
        name: 'New Switchlist',
        createdAt: '2023-01-01',
        status: 'CREATED',
        ownerId: 'current-user'
      };
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockResponse)
      });
      
      const result = await service.createSwitchlist('tr1', 'New Switchlist');
      
      expect(mockFetch).toHaveBeenCalledWith('/api/switchlists', expect.any(Object));
      expect(result).toEqual(mockResponse);
    });
    
    it('should include notes when provided', async () => {
      const mockResponse = {
        _id: '1',
        trainRouteId: 'tr1',
        name: 'New Switchlist',
        notes: 'Some notes',
        createdAt: '2023-01-01',
        status: 'CREATED',
        ownerId: 'current-user'
      };
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockResponse)
      });
      
      const result = await service.createSwitchlist('tr1', 'New Switchlist', 'Some notes');
      
      expect(mockFetch).toHaveBeenCalledWith('/api/switchlists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: expect.stringContaining('Some notes')
      });
      
      expect(result).toEqual(mockResponse);
    });
    
    it('should handle errors when creating a switchlist', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: 'Bad Request'
      });
      
      await expect(service.createSwitchlist('tr1', 'New Switchlist')).rejects.toThrow();
    });
    
    it('should handle network errors when creating a switchlist', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));
      
      await expect(service.createSwitchlist('tr1', 'New Switchlist')).rejects.toThrow('Network error');
    });
  });
  
  describe('updateSwitchlist', () => {
    it('should update a switchlist', async () => {
      const switchlistId = '1';
      const updates = { 
        name: 'Updated Switchlist',
        notes: 'Updated notes'
      };
      
      const mockResponse = {
        _id: switchlistId,
        trainRouteId: 'tr1',
        name: 'Updated Switchlist',
        notes: 'Updated notes',
        createdAt: '2023-01-01',
        status: 'CREATED',
        ownerId: 'user1'
      };
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockResponse)
      });
      
      const result = await service.updateSwitchlist(switchlistId, updates);
      
      expect(mockFetch).toHaveBeenCalledWith(`/api/switchlists/${switchlistId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates)
      });
      
      expect(result).toEqual(mockResponse);
    });
    
    it('should handle errors when updating a switchlist', async () => {
      const switchlistId = '1';
      const updates = { name: 'Updated Switchlist' };
      
      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: 'Bad Request'
      });
      
      await expect(service.updateSwitchlist(switchlistId, updates)).rejects.toThrow(`Failed to update switchlist with id ${switchlistId}`);
    });
    
    it('should handle network errors when updating a switchlist', async () => {
      const switchlistId = '1';
      const updates = { name: 'Updated Switchlist' };
      
      mockFetch.mockRejectedValueOnce(new Error('Network error'));
      
      await expect(service.updateSwitchlist(switchlistId, updates)).rejects.toThrow('Network error');
    });
  });
  
  describe('deleteSwitchlist', () => {
    it('should delete a switchlist', async () => {
      const switchlistId = '1';
      
      mockFetch.mockResolvedValueOnce({
        ok: true
      });
      
      await service.deleteSwitchlist(switchlistId);
      
      expect(mockFetch).toHaveBeenCalledWith(`/api/switchlists/${switchlistId}`, {
        method: 'DELETE'
      });
    });
    
    it('should handle errors when deleting a switchlist', async () => {
      const switchlistId = '1';
      
      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: 'Not Found'
      });
      
      await expect(service.deleteSwitchlist(switchlistId)).rejects.toThrow();
    });
    
    it('should handle network errors when deleting a switchlist', async () => {
      const switchlistId = '1';
      
      mockFetch.mockRejectedValueOnce(new Error('Network error'));
      
      await expect(service.deleteSwitchlist(switchlistId)).rejects.toThrow('Network error');
    });
  });
  
  describe('updateSwitchlistStatus', () => {
    it('should update a switchlist status', async () => {
      const switchlistId = '1';
      const newStatus: Switchlist['status'] = 'IN_PROGRESS';
      
      const mockResponse = {
        _id: switchlistId,
        trainRouteId: 'tr1',
        name: 'Test Switchlist',
        createdAt: '2023-01-01',
        status: newStatus,
        ownerId: 'user1'
      };
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockResponse)
      });
      
      const result = await service.updateSwitchlistStatus(switchlistId, newStatus);
      
      expect(mockFetch).toHaveBeenCalledWith(`/api/switchlists/${switchlistId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      expect(result).toEqual(mockResponse);
      expect(result.status).toEqual(newStatus);
    });
    
    it('should handle errors when updating a switchlist status', async () => {
      const switchlistId = '1';
      const newStatus: Switchlist['status'] = 'COMPLETED';
      
      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: 'Bad Request'
      });
      
      await expect(service.updateSwitchlistStatus(switchlistId, newStatus)).rejects.toThrow(`Failed to update switchlist with id ${switchlistId}`);
    });
    
    it('should handle network errors when updating a switchlist status', async () => {
      const switchlistId = '1';
      const newStatus: Switchlist['status'] = 'COMPLETED';
      
      mockFetch.mockRejectedValueOnce(new Error('Network error'));
      
      await expect(service.updateSwitchlistStatus(switchlistId, newStatus)).rejects.toThrow('Network error');
    });
  });
}); 