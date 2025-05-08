import { IMongoDbService } from '@/lib/services/mongodb.interface';
import { getMongoService } from '@/lib/services/mongodb.client';
import { Collection, Document, MongoClient, ObjectId, InsertOneResult, Filter } from 'mongodb';
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

// Emergency direct MongoDB connection when service methods fail
// This is a last resort fallback
async function getEmergencyCollection<T extends Document = Document>(collectionName: string): Promise<{ 
  collection: Collection<T>, 
  client: MongoClient
}> {
  console.log('Creating emergency direct MongoDB connection');
  const uri = process.env.MONGODB_URI || 'mongodb://admin:password@localhost:27017';
  const dbName = process.env.MONGODB_DB || 'switch-this';
  
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(dbName);
  const collection = db.collection<T>(collectionName);
  
  return { collection, client };
}

// Allow for dependency injection of the MongoDB service
export async function GET(request: Request, injectedMongoService?: IMongoDbService) {
  // Use injected service or get default
  const mongoService = injectedMongoService || getMongoService();
  let client: MongoClient | null = null;
  
  console.log('GET /api/blocks - Service type:', mongoService.constructor.name);
  
  try {
    // Connection handling
    if (typeof mongoService.connect === 'function') {
      await mongoService.connect();
    }
    
    // Strategy 1: Use getBlocksCollection if available
    if (typeof mongoService.getBlocksCollection === 'function') {
      console.log('Using getBlocksCollection method');
      const collection = mongoService.getBlocksCollection();
      const blocks = await collection.find().toArray();
      return createResponse(blocks);
    }
    
    // Strategy 2: Use getCollection if available
    if (typeof mongoService.getCollection === 'function') {
      console.log('Using getCollection fallback');
      const collection = mongoService.getCollection(DB_COLLECTIONS.BLOCKS);
      const blocks = await collection.find().toArray();
      return createResponse(blocks);
    }
    
    // Strategy 3: Direct database access
    console.log('Both getBlocksCollection and getCollection are missing, using direct DB access');
    const { collection, client: dbClient } = await getEmergencyCollection(DB_COLLECTIONS.BLOCKS);
    client = dbClient; // Store for cleanup in finally block
    
    const blocks = await collection.find().toArray();
    return createResponse(blocks);
  } catch (error) {
    console.error('Error fetching blocks:', error);
    return createResponse(
      { error: 'Failed to fetch blocks' },
      500
    );
  } finally {
    // Close MongoDB service connection if available
    if (typeof mongoService.close === 'function') {
      await mongoService.close();
    }
    
    // Close emergency client if it was created
    if (client) {
      await client.close();
    }
  }
}

// Block interface to define document structure
interface Block extends Document {
  blockName: string;
  ownerId?: string;
  _id?: string | ObjectId;
  [key: string]: unknown;
}

export async function POST(request: Request, injectedMongoService?: IMongoDbService) {
  // Use injected service or get default
  const mongoService = injectedMongoService || getMongoService();
  let client: MongoClient | null = null;
  
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
    
    // Connection handling
    if (typeof mongoService.connect === 'function') {
      await mongoService.connect();
    }
    
    let collection: Collection<Block>;
    let existingBlock: Block | null = null;
    let result: InsertOneResult<Block>;
    let insertedBlock: Block | null = null;
    
    // Strategy 1: Use getBlocksCollection if available
    if (typeof mongoService.getBlocksCollection === 'function') {
      console.log('Using getBlocksCollection method');
      collection = mongoService.getBlocksCollection<Block>();
      
      // Check if a block with the same name already exists
      existingBlock = await collection.findOne({ blockName: data.blockName } as Filter<Block>);
      if (existingBlock) {
        return createResponse({ error: 'A block with this name already exists' }, 400);
      }
      
      result = await collection.insertOne(data as Block);
      insertedBlock = await collection.findOne({ _id: result.insertedId } as Filter<Block>);
      
      return createResponse(insertedBlock, 201);
    }
    
    // Strategy 2: Use getCollection if available
    if (typeof mongoService.getCollection === 'function') {
      console.log('Using getCollection fallback');
      collection = mongoService.getCollection<Block>(DB_COLLECTIONS.BLOCKS);
      
      // Check if a block with the same name already exists
      existingBlock = await collection.findOne({ blockName: data.blockName } as Filter<Block>);
      if (existingBlock) {
        return createResponse({ error: 'A block with this name already exists' }, 400);
      }
      
      result = await collection.insertOne(data as Block);
      insertedBlock = await collection.findOne({ _id: result.insertedId } as Filter<Block>);
      
      return createResponse(insertedBlock, 201);
    }
    
    // Strategy 3: Direct database access
    console.log('Both getBlocksCollection and getCollection are missing, using direct DB access');
    const { collection: directCollection, client: dbClient } = await getEmergencyCollection<Block>(DB_COLLECTIONS.BLOCKS);
    client = dbClient; // Store for cleanup in finally block
    
    // Check if a block with the same name already exists
    existingBlock = await directCollection.findOne({ blockName: data.blockName } as Filter<Block>);
    if (existingBlock) {
      return createResponse({ error: 'A block with this name already exists' }, 400);
    }
    
    result = await directCollection.insertOne(data as Block);
    insertedBlock = await directCollection.findOne({ _id: result.insertedId } as Filter<Block>);
    
    return createResponse(insertedBlock, 201);
  } catch (error) {
    console.error('Error creating block:', error);
    return createResponse(
      { error: error instanceof Error ? error.message : 'Failed to create block' },
      500
    );
  } finally {
    // Close MongoDB service connection if available
    if (typeof mongoService.close === 'function') {
      await mongoService.close();
    }
    
    // Close emergency client if it was created
    if (client) {
      await client.close();
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