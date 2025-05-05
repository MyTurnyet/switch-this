import { NextResponse } from 'next/server';
import { IMongoDbService } from '@/lib/services/mongodb.interface';
import { MongoDbService } from '@/lib/services/mongodb.service';
import { Collection, Document, ObjectId } from 'mongodb';


// Create a MongoDB service that will be used throughout this file
const mongoService: IMongoDbService = new MongoDbService();

interface LayoutState extends Document {
  _id?: ObjectId;
  updatedAt: Date;
  [key: string]: unknown;
}

// GET - retrieves the latest layout state
export async function GET() {
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
  try {
    const data = await request.json();
    
    await mongoService.connect();
    const collection = mongoService.getLayoutStateCollection();
    
    const stateToSave = addTimeStamp(data);
    
    if (data._id) {
      // Convert string ID to ObjectId if necessary
      const objectId = typeof data._id === 'string' ? mongoService.toObjectId(data._id) : data._id;
      await upsertExistingState(collection, objectId, stateToSave);
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
  } as LayoutState;
}

async function upsertExistingState(collection: Collection, id: ObjectId, stateToSave: LayoutState): Promise<void> {
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