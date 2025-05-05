import { NextRequest, NextResponse } from 'next/server';
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
export async function GET(): Promise<NextResponse> {
  try {
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