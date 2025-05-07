import { IMongoDbService } from '@/lib/services/mongodb.interface';
import { getMongoService } from "@/lib/services/mongodb.client";
import { MongoDbService } from '@/lib/services/mongodb.service';
import { Collection } from 'mongodb';
import { LocationType } from '@/app/shared/types/models';

// Common headers
const corsHeaders = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-HTTP-Method-Override, X-Requested-With'
};

// Helper functions
function createNotFoundResponse() {
  return new Response(
    JSON.stringify({ error: 'Location not found' }),
    { 
      status: 404,
      headers: corsHeaders
    }
  );
}

function createInvalidInputResponse(message: string) {
  return new Response(
    JSON.stringify({ error: message }),
    { 
      status: 400,
      headers: corsHeaders
    }
  );
}

function createSuccessResponse() {
  return new Response(
    JSON.stringify({ success: true }), 
    { 
      status: 200, 
      headers: corsHeaders
    }
  );
}

async function findLocationById(collection: Collection, id: string, mongoService: IMongoDbService) {
  const locationId = mongoService.toObjectId(id);
  return await collection.findOne({ _id: locationId });
}

// GET a specific location by ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const mongoService = getMongoService();
  
  try {
    if (typeof mongoService.connect === 'function') {
      await mongoService.connect();
    }
    const collection = mongoService.getLocationsCollection();
    
    const location = await findLocationById(collection, params.id, mongoService);
    
    if (!location) {
      return createNotFoundResponse();
    }
    
    return new Response(
      JSON.stringify(location),
      {
        status: 200,
        headers: corsHeaders
      }
    );
  } catch (error) {
    console.error('Error fetching location:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch location' }),
      { 
        status: 500,
        headers: corsHeaders
      }
    );
  } finally {
    if (typeof mongoService.close === 'function') {
      await mongoService.close();
    }
  }
}

// PUT to update a location
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const mongoService = getMongoService();
  
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
    
    if (typeof mongoService.connect === 'function') {
      await mongoService.connect();
    }
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
    
    return new Response(
      JSON.stringify(updatedLocation),
      {
        status: 200,
        headers: corsHeaders
      }
    );
  } catch (error) {
    console.error('Error updating location:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to update location' }),
      { 
        status: 500,
        headers: corsHeaders
      }
    );
  } finally {
    if (typeof mongoService.close === 'function') {
      await mongoService.close();
    }
  }
}

// DELETE a location
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const mongoService = getMongoService();
  
  try {
    // Validate the id parameter
    if (!params.id || params.id.trim() === '') {
      return new Response(
        JSON.stringify({ error: 'Invalid location ID' }),
        { 
          status: 400,
          headers: corsHeaders
        }
      );
    }

    // Check for references to this location before deletion
    if (typeof mongoService.connect === 'function') {
      await mongoService.connect();
    }
    
    // First check if the location exists
    const collection = mongoService.getLocationsCollection();
    let locationId;
    
    try {
      locationId = mongoService.toObjectId(params.id);
    } catch (error) {
      console.error('Invalid ObjectId format:', error);
      return new Response(
        JSON.stringify({ error: 'Invalid location ID format' }),
        { 
          status: 400,
          headers: corsHeaders
        }
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
      return new Response(
        JSON.stringify({ 
          error: 'Cannot delete location: it is being used by industries',
          referencedCount: referencedIndustries
        }),
        { 
          status: 409, // Conflict
          headers: corsHeaders
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
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Failed to delete location' }),
      { 
        status: 500,
        headers: corsHeaders
      }
    );
  } finally {
    if (typeof mongoService.close === 'function') {
      await mongoService.close();
    }
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
  return new Response(
    JSON.stringify({ error: 'Method not allowed' }),
    { 
      status: 405,
      headers: corsHeaders
    }
  );
}

// Handle OPTIONS requests for CORS preflight
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders
  });
} 
