import { NextRequest } from 'next/server';
import { IMongoDbService } from '@/lib/services/mongodb.interface';
import { MongoDbService } from '@/lib/services/mongodb.service';
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

// Create a MongoDB service that will be used throughout this file
const mongoService: IMongoDbService = new MongoDbService();

/**
 * GET /api/industries
 * Retrieves all industries from the database
 */
export async function GET(): Promise<Response> {
  try {
    // Connect to the database
    await mongoService.connect();
    
    // Get the industries
    const industries = await mongoService.getIndustriesCollection().find({}).toArray();
    
    // Close the connection
    await mongoService.close();
    
    // Return the industries
    return new Response(
      JSON.stringify(industries),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error(`Error retrieving industries:`, error);
    return new Response(
      JSON.stringify({ error: 'Failed to retrieve industries' }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

/**
 * POST /api/industries
 * Creates a new industry
 */
export async function POST(request: NextRequest): Promise<Response> {
  try {
    // Parse the request body
    const data = await request.json();
    
    // Validate required fields
    const validationError = validateRequiredFields(data);
    if (validationError) {
      return validationError;
    }
    
    // Connect to the database
    await mongoService.connect();
    
    // Ensure tracks exist and prepare for insertion
    const industryToCreate = {
      ...data,
      tracks: data.tracks || []
    };
    
    // Remove _id if it exists to let MongoDB generate one
    if ('_id' in industryToCreate) {
      delete industryToCreate._id;
    }
    
    // Insert the industry
    const collection = mongoService.getIndustriesCollection();
    const result = await collection.insertOne(industryToCreate);
    
    const newIndustry = {
      ...industryToCreate,
      _id: result.insertedId
    };
    
    // Close the connection
    await mongoService.close();
    
    // Return the new industry
    return new Response(
      JSON.stringify(newIndustry),
      { 
        status: 201,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error(`Error creating industry:`, error);
    await mongoService.close();
    return new Response(
      JSON.stringify({ error: 'Database error' }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

function validateRequiredFields(data: Partial<Industry>): Response | null {
  if (!data.name) {
    return new Response(
      JSON.stringify({ error: 'Industry name is required' }),
      { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
  
  if (!data.locationId) {
    return new Response(
      JSON.stringify({ error: 'Location ID is required' }),
      { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
  
  if (!data.industryType) {
    return new Response(
      JSON.stringify({ error: 'Industry type is required' }),
      { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  if (!data.blockName) {
    return new Response(
      JSON.stringify({ error: 'Block name is required' }),
      { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
  
  return null;
} 