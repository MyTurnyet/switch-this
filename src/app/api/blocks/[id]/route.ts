import { NextRequest } from 'next/server';
import { getMongoService } from '@/lib/services/mongodb.client';
import { IMongoDbService } from '@/lib/services/mongodb.interface';

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

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (typeof mongoService.connect === 'function') {
      await mongoService.connect();
    }
    
    const collection = mongoService.getBlocksCollection();
    let blockId;
    
    try {
      blockId = mongoService.toObjectId(params.id);
    } catch (error) {
      return createResponse({ error: 'Invalid block ID format' }, 400);
    }
    
    const block = await collection.findOne({ _id: blockId });
    
    if (!block) {
      return createResponse({ error: 'Block not found' }, 404);
    }
    
    return createResponse(block);
  } catch (error) {
    console.error(`Error fetching block with id ${params.id}:`, error);
    return createResponse(
      { error: 'Failed to fetch block' },
      500
    );
  } finally {
    if (typeof mongoService.close === 'function') {
      await mongoService.close();
    }
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const data = await request.json();
    
    // Validate required fields
    if (!data.blockName) {
      return createResponse({ error: 'Block name is required' }, 400);
    }
    
    if (typeof mongoService.connect === 'function') {
      await mongoService.connect();
    }
    
    const collection = mongoService.getBlocksCollection();
    let blockId;
    
    try {
      blockId = mongoService.toObjectId(params.id);
    } catch (error) {
      return createResponse({ error: 'Invalid block ID format' }, 400);
    }
    
    // Check if a block with the updated name already exists
    if (data.blockName) {
      const existingBlock = await collection.findOne({ 
        blockName: data.blockName,
        _id: { $ne: blockId }
      });
      
      if (existingBlock) {
        return createResponse({ error: 'A block with this name already exists' }, 400);
      }
    }
    
    // Remove _id from incoming data to avoid update errors
    if (data._id) {
      delete data._id;
    }
    
    const result = await collection.updateOne(
      { _id: blockId },
      { $set: data }
    );
    
    if (result.matchedCount === 0) {
      return createResponse({ error: 'Block not found' }, 404);
    }
    
    // Fetch the updated block for the response
    const updatedBlock = await collection.findOne({ _id: blockId });
    
    return createResponse(updatedBlock);
  } catch (error) {
    console.error(`Error updating block with id ${params.id}:`, error);
    return createResponse(
      { error: 'Failed to update block' },
      500
    );
  } finally {
    if (typeof mongoService.close === 'function') {
      await mongoService.close();
    }
  }
}

// Use a POST method with a X-HTTP-Method-Override header for DELETE
// This is a common workaround for environments that don't fully support DELETE
export async function POST(request: Request, { params }: { params: { id: string } }) {
  // Check if this is a DELETE request via POST method override
  const methodOverride = request.headers.get('X-HTTP-Method-Override');
  if (methodOverride !== 'DELETE') {
    return createResponse({ error: 'Method not allowed' }, 405);
  }
  
  try {
    if (typeof mongoService.connect === 'function') {
      await mongoService.connect();
    }
    
    const collection = mongoService.getBlocksCollection();
    let blockId;
    
    try {
      blockId = mongoService.toObjectId(params.id);
    } catch (error) {
      return createResponse({ error: 'Invalid block ID format' }, 400);
    }
    
    // Check if this block is referenced by any locations
    const locationsCollection = mongoService.getLocationsCollection();
    const referencingLocation = await locationsCollection.findOne({ blockId: params.id });
    
    if (referencingLocation) {
      return createResponse(
        { error: 'Cannot delete block: it is being used by one or more locations' },
        400
      );
    }
    
    const result = await collection.deleteOne({ _id: blockId });
    
    if (result.deletedCount === 0) {
      return createResponse({ error: 'Block not found' }, 404);
    }
    
    return createResponse({ message: 'Block deleted successfully' });
  } catch (error) {
    console.error(`Error deleting block with id ${params.id}:`, error);
    return createResponse(
      { error: 'Failed to delete block' },
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