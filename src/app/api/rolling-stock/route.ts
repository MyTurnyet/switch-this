import { NextResponse } from 'next/server';
import { IMongoDbService } from '@/lib/services/mongodb.interface';
import { getMongoService } from '@/lib/services/mongodb.client';

// Get the MongoDB service instance from the factory
const mongoService: IMongoDbService = getMongoService();

export async function GET() {
  try {
    if (typeof mongoService.connect === 'function') {
      await mongoService.connect();
    }
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
    if (typeof mongoService.close === 'function') {
      await mongoService.close();
    }
  }
} 