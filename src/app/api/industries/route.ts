import { getMongoService } from '@/lib/services/mongodb.client';
import { IndustryType } from '@/app/shared/types/models';
import { ObjectId } from 'mongodb';

interface Industry {
  _id?: string | ObjectId;
  name: string;
  locationId: string;
  industryType: string;
  blockName: string;
  tracks?: Array<unknown>;
  [key: string]: unknown;
}

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

/**
 * GET /api/industries
 * Retrieves all industries from the database
 */
export async function GET() {
  const mongoService = getMongoService();
  
  try {
    if (typeof mongoService.connect === 'function') {
      await mongoService.connect();
    }
    
    const collection = mongoService.getIndustriesCollection();
    const industries = await collection.find().toArray();
    
    return createResponse(industries);
  } catch (error) {
    console.error('Error fetching industries:', error);
    return createResponse({ error: 'Failed to retrieve industries' }, 500);
  } finally {
    if (typeof mongoService.close === 'function') {
      await mongoService.close();
    }
  }
}

/**
 * POST /api/industries
 * Creates a new industry
 */
export async function POST(request: Request) {
  const mongoService = getMongoService();
  
  try {
    const data = await request.json();
    
    // Validate required fields
    if (!data.name) {
      return createResponse({ error: 'Industry name is required' }, 400);
    }
    
    if (!data.locationId) {
      return createResponse({ error: 'Location ID is required' }, 400);
    }
    
    if (!data.industryType || !Object.values(IndustryType).includes(data.industryType)) {
      return createResponse({ error: 'Industry type is required' }, 400);
    }
    
    if (!data.blockName) {
      return createResponse({ error: 'Block name is required' }, 400);
    }
    
    // Connect to MongoDB
    if (typeof mongoService.connect === 'function') {
      await mongoService.connect();
    }
    
    // Remove _id from incoming data to avoid insertion errors
    if (data._id) {
      delete data._id;
    }
    
    const collection = mongoService.getIndustriesCollection();
    
    // Insert the new industry
    const result = await collection.insertOne(data);
    
    // Return the new industry with its ID
    const newIndustry = {
      _id: result.insertedId.toString(),
      ...data
    };
    
    return createResponse(newIndustry, 201);
  } catch (error) {
    console.error('Error creating industry:', error);
    return createResponse({ error: 'Database error' }, 500);
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