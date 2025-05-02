// Script to inspect database contents for debugging
const { MongoClient } = require('mongodb');

// Connection URI
const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const dbName = process.env.MONGODB_DB || 'railroad';

async function inspectDatabase() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db(dbName);
    
    // Check collections
    console.log('\n--- Collections ---');
    const collections = await db.listCollections().toArray();
    console.log('Available collections:', collections.map(c => c.name).join(', '));
    
    // Check locations
    console.log('\n--- Locations ---');
    const locations = await db.collection('locations').find({}).toArray();
    console.log(`Found ${locations.length} locations`);
    locations.forEach(loc => {
      console.log(`Location: ${loc.stationName}, Block: ${loc.block}, Type: ${loc.locationType}, ID: ${loc._id}`);
    });
    
    // Check industries
    console.log('\n--- Industries ---');
    const industries = await db.collection('industries').find({}).toArray();
    console.log(`Found ${industries.length} industries`);
    industries.forEach(ind => {
      console.log(`Industry: ${ind.name}, Type: ${ind.industryType}, LocationID: ${ind.locationId}, Block: ${ind.blockName}`);
    });
    
    // Check relationships
    console.log('\n--- Location/Industry Relationships ---');
    const locationIds = new Set(locations.map(loc => loc._id.toString()));
    const industriesWithoutLocation = industries.filter(ind => !locationIds.has(ind.locationId));
    
    if (industriesWithoutLocation.length > 0) {
      console.log('⚠️ Industries with missing location references:');
      industriesWithoutLocation.forEach(ind => {
        console.log(`- Industry: ${ind.name}, LocationID: ${ind.locationId}`);
      });
    } else {
      console.log('✅ All industries reference valid locations');
    }
    
    // Check layout state
    console.log('\n--- Layout State ---');
    const layoutState = await db.collection('layoutState').find({}).toArray();
    console.log(`Found ${layoutState.length} layout state documents`);
    if (layoutState.length > 0) {
      const latest = layoutState[layoutState.length - 1];
      console.log(`Latest layout state ID: ${latest._id}`);
      console.log(`Industries in state: ${latest.industries.length}`);
      console.log(`Rolling stock in state: ${latest.rollingStock.length}`);
    }
    
  } catch (error) {
    console.error('Error inspecting database:', error);
  } finally {
    await client.close();
    console.log('Connection closed');
  }
}

// Run the inspection
inspectDatabase().catch(console.error); 