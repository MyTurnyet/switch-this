import { NextRequest, NextResponse } from 'next/server';
import { MongoDbProvider } from '@/lib/services/mongodb.provider';
import { MongoDbService } from '@/lib/services/mongodb.service';
import { Collection, ObjectId } from 'mongodb';

interface Industry {
  _id?: string | ObjectId;
  name: string;
  locationId: string;
  industryType: string;
  blockName: string;
  tracks?: Array<unknown>;
  [key: string]: unknown;
}

// Create a MongoDB provider and service that will be used throughout this file
const mongoDbProvider = new MongoDbProvider(new MongoDbService());

/**
 * GET /api/industries
 * Retrieves all industries from the database
 */
export async function GET(): Promise<NextResponse> {
  try {
    // Get the MongoDB service
    const mongoService = mongoDbProvider.getService();
    
    // Connect to the database
    await mongoService.connect();
    
    // Get the industries
    const industries = await mongoService.getIndustriesCollection().find({}).toArray();
    
    // Close the connection
    await mongoService.close();
    
    // Return the industries
    return NextResponse.json(industries);
  } catch (error) {
    console.error(`Error retrieving industries:`, error);
    return NextResponse.json(
      { error: 'Failed to retrieve industries' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/industries
 * Creates a new industry
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Parse the request body
    const data = await request.json();
    
    // Validate required fields
    const validationError = validateRequiredFields(data);
    if (validationError) {
      return validationError;
    }
    
    // Get the MongoDB service
    const mongoService = mongoDbProvider.getService();
    
    // Connect to the database
    await mongoService.connect();
    
    // Ensure tracks exist
    const industryToCreate = ensureTracksExist(data);
    
    // Insert the industry
    const collection = mongoService.getIndustriesCollection();
    const newIndustry = await insertIndustry(collection, industryToCreate);
    
    // Close the connection
    await mongoService.close();
    
    // Return the new industry
    return NextResponse.json(newIndustry, { status: 201 });
  } catch (error) {
    console.error(`Error creating industry:`, error);
    return NextResponse.json(
      { error: 'Failed to create industry' },
      { status: 500 }
    );
  }
}

function validateRequiredFields(data: Partial<Industry>): NextResponse | null {
  if (!data.name) {
    return NextResponse.json(
      { error: 'Industry name is required' },
      { status: 400 }
    );
  }
  
  if (!data.locationId) {
    return NextResponse.json(
      { error: 'Location ID is required' },
      { status: 400 }
    );
  }
  
  if (!data.industryType) {
    return NextResponse.json(
      { error: 'Industry type is required' },
      { status: 400 }
    );
  }

  if (!data.blockName) {
    return NextResponse.json(
      { error: 'Block name is required' },
      { status: 400 }
    );
  }
  
  return null;
}

function ensureTracksExist(data: Partial<Industry>): Industry {
  return {
    ...data as Industry,
    tracks: data.tracks || []
  };
}

async function insertIndustry(collection: Collection, industryToCreate: Industry): Promise<Industry> {
  const result = await collection.insertOne(industryToCreate);
  
  return {
    ...industryToCreate,
    _id: result.insertedId
  };
} 