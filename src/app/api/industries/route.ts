import { NextResponse } from 'next/server';
import { getMongoDbService } from '@/lib/services/mongodb.provider';
import { Collection } from 'mongodb';

interface Industry {
  _id?: string | any;
  name: string;
  locationId: string;
  industryType: string;
  blockName: string;
  tracks?: any[];
  [key: string]: any;
}

export async function GET() {
  const mongoService = getMongoDbService();

  try {
    await mongoService.connect();
    const collection = mongoService.getIndustriesCollection();
    const industries = await collection.find().toArray();
    return NextResponse.json(industries);
  } catch (error) {
    console.error('Error fetching industries:', error);
    return NextResponse.json(
      { error: 'Failed to fetch industries' },
      { status: 500 }
    );
  } finally {
    await mongoService.close();
  }
}

export async function POST(request: Request) {
  const mongoService = getMongoDbService();

  try {
    const data = await request.json();
    
    const validationError = validateRequiredFields(data);
    if (validationError) {
      return validationError;
    }
    
    await mongoService.connect();
    const collection = mongoService.getIndustriesCollection();
    
    const industryToCreate = ensureTracksExist(data);
    
    const newIndustry = await insertIndustry(collection, industryToCreate);
    
    return NextResponse.json(newIndustry, { status: 201 });
  } catch (error) {
    console.error('Error creating industry:', error);
    return NextResponse.json(
      { error: 'Failed to create industry' },
      { status: 500 }
    );
  } finally {
    await mongoService.close();
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