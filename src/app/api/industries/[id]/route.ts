import { NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';
import { DB_COLLECTIONS } from '@/lib/constants/dbCollections';

// GET a specific industry by ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const uri = process.env.MONGODB_URI || 'mongodb://admin:password@localhost:27017';
  const dbName = process.env.MONGODB_DB || 'switch-this';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection(DB_COLLECTIONS.INDUSTRIES);
    
    const industry = await collection.findOne({ 
      _id: new ObjectId(params.id) 
    });
    
    if (!industry) {
      return NextResponse.json(
        { error: 'Industry not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(industry);
  } catch (error) {
    console.error('Error fetching industry:', error);
    return NextResponse.json(
      { error: 'Failed to fetch industry' },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}

// PUT to update an industry
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const uri = process.env.MONGODB_URI || 'mongodb://admin:password@localhost:27017';
  const dbName = process.env.MONGODB_DB || 'switch-this';
  const client = new MongoClient(uri);

  try {
    const data = await request.json();
    
    // Validate required fields
    if (!data.name) {
      return NextResponse.json(
        { error: 'Industry name is required' },
        { status: 400 }
      );
    }
    
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection(DB_COLLECTIONS.INDUSTRIES);
    
    // Don't allow changing _id, convert string ID to ObjectId
    const industryId = new ObjectId(params.id);
    delete data._id;
    
    const result = await collection.updateOne(
      { _id: industryId },
      { $set: data }
    );
    
    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Industry not found' },
        { status: 404 }
      );
    }
    
    const updatedIndustry = await collection.findOne({ _id: industryId });
    
    return NextResponse.json(updatedIndustry);
  } catch (error) {
    console.error('Error updating industry:', error);
    return NextResponse.json(
      { error: 'Failed to update industry' },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
} 