import { NextResponse } from 'next/server';
import { getMongoService } from '@/lib/services/mongodb.client';

export async function GET() {
  const mongoService = getMongoService();
  
  try {
    // Only call connect if the method exists
    if (typeof mongoService.connect === 'function') {
      await mongoService.connect();
    }
    
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
    // Only call close if the method exists
    if (typeof mongoService.close === 'function') {
      await mongoService.close();
    }
  }
} 