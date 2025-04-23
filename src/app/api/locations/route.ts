import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const client = new MongoClient(uri);

export async function GET(request: Request) {
  try {
    await client.connect();
    const database = client.db('switch-this');
    const locations = database.collection('locations');
    
    const result = await locations.find({}).toArray();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching locations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch locations' },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
} 