import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { Industry, IndustryType } from '@/app/shared/types/models';
import { EnhancedIndustryService } from '../EnhancedIndustryService';
import { EnhancedBaseService } from '../EnhancedBaseService';

// Mock the enhanced base service
jest.mock('../EnhancedBaseService', () => {
  return {
    EnhancedBaseService: jest.fn().mockImplementation(() => {
      return {
        getAll: jest.fn().mockReturnValue([]),
        getById: jest.fn().mockReturnValue({}),
        update: jest.fn().mockReturnValue({}),
        create: jest.fn().mockReturnValue({}),
        delete: jest.fn().mockReturnValue(undefined),
        setRetryOptions: jest.fn()
      };
    })
  };
});

describe('EnhancedIndustryService', () => {
  let service: EnhancedIndustryService;
  
  // Sample data for tests
  const mockIndustry: Industry = {
    _id: '1',
    name: 'Test Industry',
    industryType: IndustryType.FREIGHT,
    tracks: [],
    locationId: 'loc123',
    blockName: 'Block A',
    ownerId: 'owner123',
    description: 'Test description'
  };
  
  beforeEach(() => {
    jest.clearAllMocks();
    service = new EnhancedIndustryService();
  });

  describe('getAllIndustries', () => {
    it('should return mapped industries from the base service', async () => {
      // Setup mock
      (service as any).getAll = jest.fn().mockResolvedValue([mockIndustry]);
      
      // Execute
      const result = await service.getAllIndustries();
      
      // Verify
      expect((service as any).getAll).toHaveBeenCalled();
      expect(result).toEqual([mockIndustry]);
    });
    
    it('should handle errors properly', async () => {
      // Setup mock to throw
      const mockError = new Error('Network error');
      (service as any).getAll = jest.fn().mockRejectedValue(mockError);
      
      // Execute and verify
      await expect(service.getAllIndustries()).rejects.toThrow('Network error');
    });
  });
  
  describe('getIndustryById', () => {
    it('should return mapped industry from the base service', async () => {
      // Setup mock
      (service as any).getById = jest.fn().mockResolvedValue(mockIndustry);
      
      // Execute
      const result = await service.getIndustryById('1');
      
      // Verify
      expect((service as any).getById).toHaveBeenCalledWith('1');
      expect(result).toEqual(mockIndustry);
    });
  });
  
  describe('updateIndustry', () => {
    it('should update industry using the base service', async () => {
      // Setup mock
      (service as any).update = jest.fn().mockResolvedValue(mockIndustry);
      const updateData = { name: 'Updated Industry' };
      
      // Execute
      const result = await service.updateIndustry('1', updateData);
      
      // Verify
      expect((service as any).update).toHaveBeenCalledWith('1', updateData);
      expect(result).toEqual(mockIndustry);
    });
  });
  
  describe('createIndustry', () => {
    it('should create industry using the base service', async () => {
      // Setup mock
      (service as any).create = jest.fn().mockResolvedValue(mockIndustry);
      const newData: Partial<Industry> = { 
        name: 'New Industry',
        industryType: IndustryType.FREIGHT,
        locationId: 'loc123',
        blockName: 'Block A'
      };
      
      // Execute
      const result = await service.createIndustry(newData);
      
      // Verify
      expect((service as any).create).toHaveBeenCalledWith(newData);
      expect(result).toEqual(mockIndustry);
    });
  });
  
  describe('deleteIndustry', () => {
    it('should delete industry using the base service', async () => {
      // Setup mock
      (service as any).delete = jest.fn().mockResolvedValue(undefined);
      
      // Execute
      await service.deleteIndustry('1');
      
      // Verify
      expect((service as any).delete).toHaveBeenCalledWith('1');
    });
  });
}); 