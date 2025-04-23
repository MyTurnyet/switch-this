import { MongoClient } from 'mongodb';
import { readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

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
    await db.collection('locations').drop().catch(() => console.log('No locations collection to drop'));
    await db.collection('industries').drop().catch(() => console.log('No industries collection to drop'));
    await db.collection('rolling-stock').drop().catch(() => console.log('No rolling-stock collection to drop'));

    // Insert data
    await db.collection('locations').insertMany(locationsData);
    await db.collection('industries').insertMany(industriesData);
    await db.collection('rolling-stock').insertMany(rollingStockData);

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