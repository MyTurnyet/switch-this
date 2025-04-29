import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

// GET - retrieves the latest layout state
export async function GET() {
  const uri = process.env.MONGODB_URI || 'mongodb://admin:password@localhost:27017';
  const dbName = process.env.MONGODB_DB || 'switch-this';
  
  try {
    const client = await MongoClient.connect(uri);
    const db = client.db(dbName);
    const collection = db.collection('layoutState');
    
    // Get the latest state (there should only be one document)
    const layoutState = await collection.findOne({}, { sort: { updatedAt: -1 } });
    
    if (!layoutState) {
      // No state found in database
      await client.close();
      return NextResponse.json({ exists: false });
    }
    
    await client.close();
    return NextResponse.json(layoutState);
  } catch (error) {
    console.error('Error fetching layout state:', error);
    return NextResponse.json(
      { error: 'Failed to fetch layout state' },
      { status: 500 }
    );
  }
}

// POST - saves the current layout state
export async function POST(request: Request) {
  const uri = process.env.MONGODB_URI || 'mongodb://admin:password@localhost:27017';
  const dbName = process.env.MONGODB_DB || 'switch-this';
  
  try {
    const data = await request.json();
    
    const client = await MongoClient.connect(uri);
    const db = client.db(dbName);
    const collection = db.collection('layoutState');
    
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
    
    await client.close();
    return NextResponse.json(stateToSave);
  } catch (error) {
    console.error('Error saving layout state:', error);
    return NextResponse.json(
      { error: 'Failed to save layout state' },
      { status: 500 }
    );
  }
} 