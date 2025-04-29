import { act } from 'react-dom/test-utils';
import { BaseService } from '../BaseService';

interface TestModel {
  id: string;
  name: string;
}

class TestService extends BaseService<TestModel> {
  constructor() {
    super('/api/test');
  }
}

describe('BaseService', () => {
  let service: TestService;
  let mockFetch: jest.Mock;

  beforeEach(() => {
    service = new TestService();
    mockFetch = jest.fn();
    global.fetch = mockFetch;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('should fetch all items', async () => {
      const mockData = [{ id: '1', name: 'Test 1' }, { id: '2', name: 'Test 2' }];
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockData),
      });

      const result = await service.getAll();

      expect(mockFetch).toHaveBeenCalledWith('/api/test');
      expect(result).toEqual(mockData);
    });

    it('should throw error when fetch fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      await expect(service.getAll()).rejects.toThrow('HTTP error! status: 500');
    });
  });

  describe('getById', () => {
    it('should fetch item by id', async () => {
      const mockData = { id: '1', name: 'Test 1' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockData),
      });

      const result = await service.getById('1');

      expect(mockFetch).toHaveBeenCalledWith('/api/test/1');
      expect(result).toEqual(mockData);
    });

    it('should throw error when fetch fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
      });

      await expect(service.getById('1')).rejects.toThrow('Failed to fetch /api/test with id 1');
    });
  });

  describe('update', () => {
    it('should update item', async () => {
      const mockData = { id: '1', name: 'Updated Test' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
      });

      await service.update('1', mockData);

      expect(mockFetch).toHaveBeenCalledWith('/api/test/1', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mockData),
      });
    });

    it('should throw error when update fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
      });

      await expect(service.update('1', { id: '1', name: 'Test' })).rejects.toThrow(
        'Failed to update /api/test with id 1'
      );
    });
  });

  describe('create', () => {
    it('should create item', async () => {
      const mockData = { id: '1', name: 'New Test' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockData),
      });

      const result = await service.create(mockData);

      expect(mockFetch).toHaveBeenCalledWith('/api/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mockData),
      });
      expect(result).toEqual(mockData);
    });

    it('should throw error when creation fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
      });

      await expect(service.create({ id: '1', name: 'Test' })).rejects.toThrow(
        'Failed to create /api/test'
      );
    });
  });

  describe('delete', () => {
    it('should delete item', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
      });

      await service.delete('1');

      expect(mockFetch).toHaveBeenCalledWith('/api/test/1', {
        method: 'DELETE',
      });
    });

    it('should throw error when deletion fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
      });

      await expect(service.delete('1')).rejects.toThrow('Failed to delete /api/test with id 1');
    });
  });
}); 