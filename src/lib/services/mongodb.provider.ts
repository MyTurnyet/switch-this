import { MongoDbService } from './mongodb.service';
import { IMongoDbService } from './mongodb.interface';

/**
 * Provider for MongoDB service to make it easier to mock in tests
 * This wraps the actual service implementation
 */
export class MongoDbProvider {
  private service: IMongoDbService;

  constructor(service?: IMongoDbService) {
    this.service = service || new MongoDbService();
  }

  /**
   * Get the underlying MongoDB service
   */
  public getService(): IMongoDbService {
    return this.service;
  }
} 