import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
import { DB_COLLECTIONS } from '@/lib/constants/dbCollections';

export async function GET() {
  const uri = process.env.MONGODB_URI || 'mongodb://admin:password@localhost:27017';
  const dbName = process.env.MONGODB_DB || 'switch-this';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection(DB_COLLECTIONS.TRAIN_ROUTES);
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