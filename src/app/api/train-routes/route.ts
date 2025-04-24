import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

export async function GET() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
  const dbName = process.env.MONGODB_DB || 'switchlist';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection('trainRoutes');
    const trainRoutes = await collection.find().toArray();
    return NextResponse.json(trainRoutes);
  } catch (error) {
    console.error('Error fetching train routes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch train routes' },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
} 