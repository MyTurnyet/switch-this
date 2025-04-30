import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

export async function GET() {
  const uri = process.env.MONGODB_URI || 'mongodb://admin:password@localhost:27017';
  const dbName = process.env.MONGODB_DB || 'switch-this';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection('industries');
    const industries = await collection.find().toArray();
    return NextResponse.json(industries);
  } catch (error) {
    console.error('Error fetching industries:', error);
    return NextResponse.json(
      { error: 'Failed to fetch industries' },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}

export async function POST(request: Request) {
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
    
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection('industries');
    
    // Ensure the industry has an empty tracks array if not provided
    if (!data.tracks) {
      data.tracks = [];
    }
    
    const result = await collection.insertOne(data);
    
    const newIndustry = {
      ...data,
      _id: result.insertedId
    };
    
    return NextResponse.json(newIndustry, { status: 201 });
  } catch (error) {
    console.error('Error creating industry:', error);
    return NextResponse.json(
      { error: 'Failed to create industry' },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
} 