import { IMongoDbService } from '../mongodb.interface';
import { MongoDbService } from '../mongodb.service';
import { FakeMongoDbService } from '@/test/utils/mongodb-test-utils';

describe('MongoDB Direct Service Usage', () => {
  let mongoService: IMongoDbService;
  
  beforeEach(() => {
    // Use the fake service for testing
    mongoService = new FakeMongoDbService();
  });
  
  afterEach(async () => {
    await mongoService.close();
  });
  
  it('should connect successfully', async () => {
    await expect(mongoService.connect()).resolves.not.toThrow();
  });
  
  it('should get collections correctly', async () => {
    await mongoService.connect();
    
    expect(mongoService.getRollingStockCollection()).toBeDefined();
    expect(mongoService.getIndustriesCollection()).toBeDefined();
    expect(mongoService.getLocationsCollection()).toBeDefined();
    expect(mongoService.getTrainRoutesCollection()).toBeDefined();
    expect(mongoService.getLayoutStateCollection()).toBeDefined();
    expect(mongoService.getSwitchlistsCollection()).toBeDefined();
  });
  
  it('should convert string IDs to ObjectIds', () => {
    const validId = '507f1f77bcf86cd799439011';
    const objectId = mongoService.toObjectId(validId);
    
    expect(objectId).toBeDefined();
    expect(objectId.toString()).toBe(validId);
  });
  
  it('should throw an error for invalid ObjectIds', () => {
    const invalidId = 'not-a-valid-id';
    
    expect(() => mongoService.toObjectId(invalidId)).toThrow();
  });
  
  it('should be able to use real service implementation', () => {
    // Just verify we can create the real service
    const realService = new MongoDbService();
    expect(realService).toBeDefined();
    expect(realService).toBeInstanceOf(MongoDbService);
  });
}); 