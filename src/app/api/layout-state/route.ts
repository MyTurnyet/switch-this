import { NextResponse } from 'next/server';
import { MongoDbProvider } from '@/lib/services/mongodb.provider';
import { MongoDbService } from '@/lib/services/mongodb.service';
import { Collection } from 'mongodb';


// Create a MongoDB provider and service that will be used throughout this file
const mongoDbProvider = new MongoDbProvider(new MongoDbService());

interface LayoutState {
  _id?: string | any;
  updatedAt: Date;
  [key: string]: any;
}

// GET - retrieves the latest layout state
export async function GET() {
  const mongoService = mongoDbProvider.getService();
  
  try {
    await mongoService.connect();
    const collection = mongoService.getLayoutStateCollection();
    
    const layoutState = await fetchLatestLayoutState(collection);
    
    if (!layoutState) {
      await mongoService.close();
      return handleNoStateFound();
    }
    
    await mongoService.close();
    return NextResponse.json(layoutState);
  } catch (error) {
    console.error('Error fetching layout state:', error);
    await mongoService.close();
    return NextResponse.json(
      { error: 'Failed to fetch layout state' },
      { status: 500 }
    );
  }
}

async function fetchLatestLayoutState(collection: Collection): Promise<LayoutState | null> {
  return await collection.findOne<LayoutState>({}, { sort: { updatedAt: -1 } });
}

function handleNoStateFound() {
  return NextResponse.json({ exists: false });
}

// POST - saves the current layout state
export async function POST(request: Request) {
  const mongoService = mongoDbProvider.getService();
  
  try {
    const data = await request.json();
    
    await mongoService.connect();
    const collection = mongoService.getLayoutStateCollection();
    
    const stateToSave = addTimeStamp(data);
    
    if (data._id) {
      await upsertExistingState(collection, data._id, stateToSave);
    } else {
      await insertNewState(collection, stateToSave);
    }
    
    await mongoService.close();
    return NextResponse.json(stateToSave);
  } catch (error) {
    console.error('Error saving layout state:', error);
    await mongoService.close();
    return NextResponse.json(
      { error: 'Failed to save layout state' },
      { status: 500 }
    );
  }
}

function addTimeStamp(data: Partial<LayoutState>): LayoutState {
  return {
    ...data,
    updatedAt: new Date()
  };
}

async function upsertExistingState(collection: Collection, id: string | any, stateToSave: LayoutState): Promise<void> {
  await collection.updateOne(
    { _id: id },
    { $set: stateToSave },
    { upsert: true }
  );
}

async function insertNewState(collection: Collection, stateToSave: LayoutState): Promise<void> {
  const result = await collection.insertOne(stateToSave);
  stateToSave._id = result.insertedId;
} 