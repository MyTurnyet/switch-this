const { MongoClient, ObjectId } = require('mongodb');
const fs = require('fs');
const path = require('path');

// MongoDB connection string
const uri = process.env.MONGODB_URI || 'mongodb://admin:password@localhost:27017';
const dbName = process.env.MONGODB_DB || 'switch-this';

async function addTrainRoutes() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db(dbName);
    const trainRoutesCollection = db.collection('trainRoutes');
    
    // Check if there are any train routes already
    const existingCount = await trainRoutesCollection.countDocuments({});
    if (existingCount > 0) {
      console.log(`Found ${existingCount} train routes in database. Skipping import.`);
      return;
    }
    
    console.log('No train routes found in database. Importing from JSON file...');
    
    // Read train routes from JSON file
    const jsonPath = path.join(__dirname, '..', 'src', 'data', 'train-routes.json');
    const trainRoutesData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    
    // Convert string IDs to ObjectIds
    const formattedTrainRoutes = trainRoutesData.map(route => {
      return {
        ...route,
        _id: new ObjectId(route._id.$oid),
        originatingYardId: new ObjectId(route.originatingYardId.$oid),
        terminatingYardId: new ObjectId(route.terminatingYardId.$oid),
        stations: route.stations.map(station => new ObjectId(station.$oid)),
        ownerId: new ObjectId(route.ownerId.$oid)
      };
    });
    
    // Insert train routes into database
    const result = await trainRoutesCollection.insertMany(formattedTrainRoutes);
    console.log(`Successfully imported ${result.insertedCount} train routes`);
    
  } catch (error) {
    console.error('Error importing train routes:', error);
    throw error;
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB');
  }
}

// Run the function if this script is being executed directly
if (require.main === module) {
  addTrainRoutes().catch(console.error);
}

// Export the function for testing
module.exports = addTrainRoutes; 