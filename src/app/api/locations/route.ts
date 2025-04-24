import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

export async function GET() {
  const uri = process.env.MONGODB_URI || 'mongodb://admin:password@localhost:27017';
  const dbName = process.env.MONGODB_DB || 'switch-this';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection('locations');
    const locations = await collection.find().toArray();
    return NextResponse.json(locations);
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