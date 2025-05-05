import { IMongoDbService } from '../mongodb.interface';

/**
 * MongoDB Provider class that manages a singleton instance of MongoDbService
 */
export class MongoDbProvider {
  private readonly mongoDbService: IMongoDbService;
  
  /**
   * Constructor that accepts a MongoDB service instance
   * @param mongoDbService MongoDB service instance
   */
  constructor(mongoDbService: IMongoDbService) {
    this.mongoDbService = mongoDbService;
  }
  
  /**
   * Get the MongoDB service instance
   * @returns The MongoDB service instance
   */
  getService(): IMongoDbService {
    return this.mongoDbService;
  }
} 