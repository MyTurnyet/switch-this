import { MongoClient } from 'mongodb';
import { readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// We can't directly import TypeScript in JS files, so we'll use a constants object
const DB_COLLECTIONS = {
  ROLLING_STOCK: 'rolling-stock',
  INDUSTRIES: 'industries',
  LOCATIONS: 'locations',
  TRAIN_ROUTES: 'trainRoutes',
  LAYOUT_STATE: 'layoutState',
  BLOCKS: 'blocks'
};

// Simple MongoDB service for JavaScript usage
class MongoDbJsService {
  constructor(uri) {
    this.uri = uri;
    this.client = null;
    this.db = null;
  }

  async connect(dbName) {
    this.client = await MongoClient.connect(this.uri);
    this.db = this.client.db(dbName);
  }

  async close() {
    if (this.client) {
      await this.client.close();
    }
  }

  getCollection(name) {
    return this.db.collection(name);
  }
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const uri = 'mongodb://admin:password@localhost:27017/admin';
const dbName = 'switch-this';

async function seedDatabase() {
  const mongoService = new MongoDbJsService(uri);
  
  try {
    await mongoService.connect(dbName);
    console.log('Connected to MongoDB');

    // Read JSON files
    const locationsData = JSON.parse(readFileSync(join(__dirname, '../src/data/locations.json'), 'utf8'));
    const industriesData = JSON.parse(readFileSync(join(__dirname, '../src/data/industries.json'), 'utf8'));
    const rollingStockData = JSON.parse(readFileSync(join(__dirname, '../src/data/rolling-stock.json'), 'utf8'));

    // Drop existing collections
    await mongoService.getCollection(DB_COLLECTIONS.LOCATIONS).drop().catch(() => console.log('No locations collection to drop'));
    await mongoService.getCollection(DB_COLLECTIONS.INDUSTRIES).drop().catch(() => console.log('No industries collection to drop'));
    await mongoService.getCollection(DB_COLLECTIONS.ROLLING_STOCK).drop().catch(() => console.log('No rolling-stock collection to drop'));

    // Insert data
    await mongoService.getCollection(DB_COLLECTIONS.LOCATIONS).insertMany(locationsData);
    await mongoService.getCollection(DB_COLLECTIONS.INDUSTRIES).insertMany(industriesData);
    await mongoService.getCollection(DB_COLLECTIONS.ROLLING_STOCK).insertMany(rollingStockData);

    console.log('Data seeded successfully!');
    console.log(`Locations: ${locationsData.length} records`);
    console.log(`Industries: ${industriesData.length} records`);
    console.log(`Rolling Stock: ${rollingStockData.length} records`);
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoService.close();
  }
}

seedDatabase(); 