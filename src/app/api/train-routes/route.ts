import { NextResponse } from 'next/server';
import { IMongoDbService } from '@/lib/services/mongodb.interface';
import { MongoDbService } from '@/lib/services/mongodb.service';


// Create a MongoDB service to be used throughout this file
const mongoService: IMongoDbService = new MongoDbService();

export async function GET() {
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