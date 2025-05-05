import { NextResponse } from 'next/server';
import { MongoDbProvider } from '@/lib/services/mongodb.provider';
import { MongoDbService } from '@/lib/services/mongodb.service';
import { Collection } from 'mongodb';
import { LocationType } from '@/app/shared/types/models';
import { MongoDbService } from '@/lib/services/mongodb.service';


// Create a MongoDB provider and service that will be used throughout this file
const mongoDbProvider = new MongoDbProvider(new MongoDbService());

// Helper functions
function createNotFoundResponse() {
  return NextResponse.json(
    { error: 'Location not found' },
    { 
      status: 404,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-HTTP-Method-Override, X-Requested-With'
      }
    }
  );
}

function createInvalidInputResponse(message: string) {
  return NextResponse.json(
    { error: message },
    { 
      status: 400,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-HTTP-Method-Override, X-Requested-With'
      }
    }
  );
}

function createSuccessResponse() {
  return NextResponse.json(
    { success: true }, 
    { 
      status: 200, 
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-HTTP-Method-Override, X-Requested-With'
      } 
    }
  );
}

async function findLocationById(collection: Collection, id: string, mongoService: MongoDbService) {
  const locationId = mongoService.toObjectId(id);
  return await collection.findOne({ _id: locationId });
}

// GET a specific location by ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const mongoService = mongoDbProvider.getService();

  try {
    await mongoService.connect();
    const collection = mongoService.getLocationsCollection();
    
    const location = await findLocationById(collection, params.id, mongoService);
    
    if (!location) {
      return createNotFoundResponse();
    }
    
    return NextResponse.json(location, {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-HTTP-Method-Override, X-Requested-With'
      }
    });
  } catch (error) {
    console.error('Error fetching location:', error);
    return NextResponse.json(
      { error: 'Failed to fetch location' },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-HTTP-Method-Override, X-Requested-With'
        }
      }
    );
  } finally {
    await mongoService.close();
  }
}

// PUT to update a location
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const mongoService = mongoDbProvider.getService();

  try {
    const data = await request.json();
    
    // Validate required fields
    if (!data.stationName) {
      return createInvalidInputResponse('Station name is required');
    }
    
    if (!data.block) {
      return createInvalidInputResponse('Block is required');
    }
    
    if (!Object.values(LocationType).includes(data.locationType)) {
      return createInvalidInputResponse('Valid location type is required');
    }
    
    // Remove _id from data if present to avoid MongoDB error
    if (data._id) {
      delete data._id;
    }
    
    await mongoService.connect();
    const collection = mongoService.getLocationsCollection();
    const locationId = mongoService.toObjectId(params.id);
    
    const result = await collection.updateOne(
      { _id: locationId },
      { $set: data }
    );
    
    if (result.matchedCount === 0) {
      return createNotFoundResponse();
    }
    
    const updatedLocation = await findLocationById(collection, params.id, mongoService);
    
    return NextResponse.json(updatedLocation, {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-HTTP-Method-Override, X-Requested-With'
      }
    });
  } catch (error) {
    console.error('Error updating location:', error);
    return NextResponse.json(
      { error: 'Failed to update location' },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-HTTP-Method-Override, X-Requested-With'
        }
      }
    );
  } finally {
    await mongoService.close();
  }
}

// DELETE a location
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const mongoService = mongoDbProvider.getService();

  try {
    // Validate the id parameter
    if (!params.id || params.id.trim() === '') {
      return NextResponse.json(
        { error: 'Invalid location ID' },
        { status: 400 }
      );
    }

    // Check for references to this location before deletion
    await mongoService.connect();
    
    // First check if the location exists
    const collection = mongoService.getLocationsCollection();
    let locationId;
    
    try {
      locationId = mongoService.toObjectId(params.id);
    } catch (error) {
      console.error('Invalid ObjectId format:', error);
      return NextResponse.json(
        { error: 'Invalid location ID format' },
        { status: 400 }
      );
    }
    
    const location = await collection.findOne({ _id: locationId });
    if (!location) {
      return createNotFoundResponse();
    }
    
    // Check if any industries reference this location
    const industriesCollection = mongoService.getIndustriesCollection();
    const referencedIndustries = await industriesCollection.countDocuments({ locationId: params.id });
    
    if (referencedIndustries > 0) {
      return NextResponse.json(
        { 
          error: 'Cannot delete location: it is being used by industries',
          referencedCount: referencedIndustries
        },
        { 
          status: 409, // Conflict
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-HTTP-Method-Override, X-Requested-With'
          }
        }
      );
    }
    
    // If no references found, proceed with deletion
    const result = await collection.deleteOne({ _id: locationId });
    
    if (result.deletedCount === 0) {
      console.error('No document deleted despite existing check passing');
      return createNotFoundResponse();
    }
    
    return createSuccessResponse();
  } catch (error) {
    console.error('Error deleting location:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete location' },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-HTTP-Method-Override, X-Requested-With'
        }
      }
    );
  } finally {
    await mongoService.close();
  }
}

// POST to handle method overrides (for DELETE operations)
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  // Check if this is a method override for DELETE
  const methodOverride = request.headers.get('X-HTTP-Method-Override');
  
  if (methodOverride === 'DELETE') {
    // If this is a DELETE override, call the DELETE handler
    return DELETE(request, { params });
  }
  
  // Otherwise, return method not allowed
  return NextResponse.json(
    { error: 'Method not allowed' },
    { 
      status: 405,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-HTTP-Method-Override, X-Requested-With'
      }
    }
  );
}

// Add an OPTIONS method handler to handle preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-HTTP-Method-Override, X-Requested-With',
      'Access-Control-Max-Age': '86400' // 24 hours
    }
  });
} 