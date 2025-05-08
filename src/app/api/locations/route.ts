import { IMongoDbService } from '@/lib/services/mongodb.interface';
import { getMongoService } from '@/lib/services/mongodb.client';
import { LocationType } from '@/app/shared/types/models';


// Get the MongoDB service instance from the factory
const mongoService: IMongoDbService = getMongoService();

// Helper to create a response with CORS headers
function createResponse(body: unknown, status = 200) {
  return new Response(
    JSON.stringify(body),
    {
      status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-HTTP-Method-Override, X-Requested-With'
      }
    }
  );
}

export async function GET() {
  try {
    if (typeof mongoService.connect === 'function') {
      await mongoService.connect();
    }
    const collection = mongoService.getLocationsCollection();
    const locations = await collection.find().toArray();
    
    // Ensure all locations have a locationType field
    // If none exists, assign a default based on block name
    const enhancedLocations = locations.map(location => {
      if (!location.locationType) {
        // Set default location types
        if (location.stationName.includes('Yard')) {
          location.locationType = LocationType.FIDDLE_YARD;
        } else {
          location.locationType = LocationType.ON_LAYOUT;
        }
      }
      return location;
    });
    
    return createResponse(enhancedLocations);
  } catch (error) {
    console.error('Error fetching locations:', error);
    return createResponse(
      { error: 'Failed to fetch locations' },
      500
    );
  } finally {
    if (typeof mongoService.close === 'function') {
      await mongoService.close();
    }
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Validate required fields
    if (!data.stationName) {
      return createResponse({ error: 'Station name is required' }, 400);
    }
    
    if (!data.blockId) {
      return createResponse({ error: 'Block is required' }, 400);
    }
    
    if (!Object.values(LocationType).includes(data.locationType)) {
      return createResponse({ error: 'Valid location type is required' }, 400);
    }
    
    // Set default ownerId if missing
    if (!data.ownerId) {
      data.ownerId = 'system';
    }
    
    // Remove _id from incoming data to avoid insertion errors
    if (data._id) {
      delete data._id;
    }
    
    if (typeof mongoService.connect === 'function') {
      await mongoService.connect();
    }
    const collection = mongoService.getLocationsCollection();
    
    const result = await collection.insertOne(data);
    
    // Fetch the newly created location for the response
    const insertedLocation = await collection.findOne({ _id: result.insertedId });
    
    return createResponse(insertedLocation);
  } catch (error) {
    console.error('Error creating location:', error);
    return createResponse(
      { error: error instanceof Error ? error.message : 'Failed to create location' },
      500
    );
  } finally {
    if (typeof mongoService.close === 'function') {
      await mongoService.close();
    }
  }
}

// Add OPTIONS method for preflight requests
export function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-HTTP-Method-Override, X-Requested-With',
      'Access-Control-Max-Age': '86400' // 24 hours
    }
  });
} 