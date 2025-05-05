import { NextResponse } from 'next/server';
import { MongoDbProvider } from '@/lib/services/mongodb.provider';
import { MongoDbService } from '@/lib/services/mongodb.service';


// Create a MongoDB provider and service that will be used throughout this file
const mongoDbProvider = new MongoDbProvider(new MongoDbService());

export async function GET() {
  const mongoService = mongoDbProvider.getService();

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