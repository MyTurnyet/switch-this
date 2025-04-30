import { NextResponse } from 'next/server';
import { getMongoDbService } from '@/lib/services/mongodb.provider';

export async function GET() {
  const mongoService = getMongoDbService();

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