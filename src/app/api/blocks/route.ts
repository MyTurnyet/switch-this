import { IMongoDbService } from '@/lib/services/mongodb.interface';
import { getMongoService } from '@/lib/services/mongodb.client';
import { Collection } from 'mongodb';
import { DB_COLLECTIONS } from '@/lib/constants/dbCollections';

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

// Allow for dependency injection of the MongoDB service
export async function GET(request: Request, injectedMongoService?: IMongoDbService) {
  // Use injected service or get default
  const mongoService = injectedMongoService || getMongoService();
  
  console.log('GET /api/blocks - Service type:', mongoService.constructor.name);
  
  try {
    if (typeof mongoService.connect === 'function') {
      await mongoService.connect();
    }
    
    // Check if getBlocksCollection exists, otherwise use getCollection directly
    let collection: Collection;
    if (typeof mongoService.getBlocksCollection === 'function') {
      console.log('Using getBlocksCollection method');
      collection = mongoService.getBlocksCollection();
    } else {
      console.log('getBlocksCollection not found, using getCollection fallback');
      if (typeof mongoService.getCollection !== 'function') {
        throw new Error('MongoDB service does not implement required methods');
      }
      collection = mongoService.getCollection(DB_COLLECTIONS.BLOCKS);
    }
    
    const blocks = await collection.find().toArray();
    
    return createResponse(blocks);
  } catch (error) {
    console.error('Error fetching blocks:', error);
    return createResponse(
      { error: 'Failed to fetch blocks' },
      500
    );
  } finally {
    if (typeof mongoService.close === 'function') {
      await mongoService.close();
    }
  }
}

export async function POST(request: Request, injectedMongoService?: IMongoDbService) {
  // Use injected service or get default
  const mongoService = injectedMongoService || getMongoService();
  
  console.log('POST /api/blocks - Service type:', mongoService.constructor.name);
  
  try {
    const data = await request.json();
    
    // Validate required fields
    if (!data.blockName) {
      return createResponse({ error: 'Block name is required' }, 400);
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
    
    // Check if getBlocksCollection exists, otherwise use getCollection directly
    let collection: Collection;
    if (typeof mongoService.getBlocksCollection === 'function') {
      console.log('Using getBlocksCollection method');
      collection = mongoService.getBlocksCollection();
    } else {
      console.log('getBlocksCollection not found, using getCollection fallback');
      if (typeof mongoService.getCollection !== 'function') {
        throw new Error('MongoDB service does not implement required methods');
      }
      collection = mongoService.getCollection(DB_COLLECTIONS.BLOCKS);
    }
    
    // Check if a block with the same name already exists
    const existingBlock = await collection.findOne({ blockName: data.blockName });
    if (existingBlock) {
      return createResponse({ error: 'A block with this name already exists' }, 400);
    }
    
    const result = await collection.insertOne(data);
    
    // Fetch the newly created block for the response
    const insertedBlock = await collection.findOne({ _id: result.insertedId });
    
    return createResponse(insertedBlock, 201);
  } catch (error) {
    console.error('Error creating block:', error);
    return createResponse(
      { error: error instanceof Error ? error.message : 'Failed to create block' },
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