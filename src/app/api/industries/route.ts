import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
let client: MongoClient | null = null;

async function getClient() {
  if (!client) {
    client = new MongoClient(uri);
    await client.connect();
  }
  return client;
}

export async function GET(request: Request) {
  try {
    const client = await getClient();
    const database = client.db('switch-this');
    const industries = database.collection('industries');
    
    const result = await industries.find({}).toArray();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching industries:', error);
    return NextResponse.json(
      { error: 'Failed to fetch industries' },
      { status: 500 }
    );
  }
} 