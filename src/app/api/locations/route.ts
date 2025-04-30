import { NextResponse } from 'next/server';
import { getMongoDbService } from '@/lib/services/mongodb.provider';

export async function GET() {
  const mongoService = getMongoDbService();

  try {
    await mongoService.connect();
    const collection = mongoService.getLocationsCollection();
    const locations = await collection.find().toArray();
    return NextResponse.json(locations);
  } catch (error) {
    console.error('Error fetching locations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch locations' },
      { status: 500 }
    );
  } finally {
    await mongoService.close();
  }
} 