import { NextResponse } from 'next/server';
import { getMongoDbService } from '@/lib/services/mongodb.provider';

// GET - retrieves the latest layout state
export async function GET() {
  const mongoService = getMongoDbService();
  
  try {
    await mongoService.connect();
    const collection = mongoService.getLayoutStateCollection();
    
    // Get the latest state (there should only be one document)
    const layoutState = await collection.findOne({}, { sort: { updatedAt: -1 } });
    
    if (!layoutState) {
      // No state found in database
      await mongoService.close();
      return NextResponse.json({ exists: false });
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

// POST - saves the current layout state
export async function POST(request: Request) {
  const mongoService = getMongoDbService();
  
  try {
    const data = await request.json();
    
    await mongoService.connect();
    const collection = mongoService.getLayoutStateCollection();
    
    // Add timestamp
    const stateToSave = {
      ...data,
      updatedAt: new Date()
    };
    
    // Save as a new document (upsert with the layout state id if it exists)
    if (data._id) {
      await collection.updateOne(
        { _id: data._id }, // Use the _id directly as provided by the test
        { $set: stateToSave },
        { upsert: true }
      );
    } else {
      // Insert new document if no _id
      const result = await collection.insertOne(stateToSave);
      stateToSave._id = result.insertedId;
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