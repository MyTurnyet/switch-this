import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

export async function GET() {
  const uri = process.env.MONGODB_URI || 'mongodb://admin:password@localhost:27017';
  const dbName = process.env.MONGODB_DB || 'switch-this';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection('rolling-stock');
    const rollingStock = await collection.find().toArray();
    return NextResponse.json(rollingStock);
  } catch (error) {
    console.error('Error fetching rolling stock:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rolling stock' },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
} 