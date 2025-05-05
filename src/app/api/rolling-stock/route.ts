import { NextResponse } from 'next/server';
import { IMongoDbService } from '@/lib/services/mongodb.interface';
import { MongoDbService } from '@/lib/services/mongodb.service';

// Create a MongoDB service that will be used throughout this file
const mongoService: IMongoDbService = new MongoDbService();

export async function GET() {
  try {
    await mongoService.connect();
    const collection = mongoService.getRollingStockCollection();
    const rollingStock = await collection.find().toArray();
    return NextResponse.json(rollingStock);
  } catch (error) {
    console.error('Error fetching rolling stock:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rolling stock' },
      { status: 500 }
    );
  } finally {
    await mongoService.close();
  }
} 