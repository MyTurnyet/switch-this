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
  LAYOUT_STATE: 'layoutState'
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const uri = 'mongodb://admin:password@localhost:27017/admin';
const client = new MongoClient(uri);

async function seedDatabase() {
  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db('switch-this');

    // Read JSON files
    const locationsData = JSON.parse(readFileSync(join(__dirname, '../src/data/locations.json'), 'utf8'));
    const industriesData = JSON.parse(readFileSync(join(__dirname, '../src/data/industries.json'), 'utf8'));
    const rollingStockData = JSON.parse(readFileSync(join(__dirname, '../src/data/rolling-stock.json'), 'utf8'));

    // Drop existing collections
    await db.collection(DB_COLLECTIONS.LOCATIONS).drop().catch(() => console.log('No locations collection to drop'));
    await db.collection(DB_COLLECTIONS.INDUSTRIES).drop().catch(() => console.log('No industries collection to drop'));
    await db.collection(DB_COLLECTIONS.ROLLING_STOCK).drop().catch(() => console.log('No rolling-stock collection to drop'));

    // Insert data
    await db.collection(DB_COLLECTIONS.LOCATIONS).insertMany(locationsData);
    await db.collection(DB_COLLECTIONS.INDUSTRIES).insertMany(industriesData);
    await db.collection(DB_COLLECTIONS.ROLLING_STOCK).insertMany(rollingStockData);

    console.log('Data seeded successfully!');
    console.log(`Locations: ${locationsData.length} records`);
    console.log(`Industries: ${industriesData.length} records`);
    console.log(`Rolling Stock: ${rollingStockData.length} records`);
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await client.close();
  }
}

seedDatabase(); 