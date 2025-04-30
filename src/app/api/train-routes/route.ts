import { NextResponse } from 'next/server';
import { getMongoDbService } from '@/lib/services/mongodb.provider';

export async function GET() {
  const mongoService = getMongoDbService();

  try {
    await mongoService.connect();
    const collection = mongoService.getTrainRoutesCollection();
    const trainRoutes = await collection.find().toArray();
    return NextResponse.json(trainRoutes);
  } catch (error) {
    console.error('Error fetching train routes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch train routes' },
      { status: 500 }
    );
  } finally {
    await mongoService.close();
  }
} 