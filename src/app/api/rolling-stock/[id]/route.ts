import { NextRequest, NextResponse } from 'next/server';
import { getMongoDbService } from '@/lib/services/mongodb.provider';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const mongoService = getMongoDbService();
  
  try {
    await mongoService.connect();
    const collection = mongoService.getRollingStockCollection();
    
    const rollingStock = await collection.findOne({ _id: mongoService.toObjectId(params.id) });
    
    if (!rollingStock) {
      return NextResponse.json(
        { error: 'Rolling stock not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(rollingStock);
  } catch (error) {
    console.error('Error fetching rolling stock item:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rolling stock item' },
      { status: 500 }
    );
  } finally {
    await mongoService.close();
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const mongoService = getMongoDbService();
  
  try {
    const updatedData = await request.json();
    
    // Remove _id from the updated data to avoid MongoDB errors
    if (updatedData._id) {
      delete updatedData._id;
    }
    
    await mongoService.connect();
    const collection = mongoService.getRollingStockCollection();
    
    const result = await collection.updateOne(
      { _id: mongoService.toObjectId(params.id) },
      { $set: updatedData }
    );
    
    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Rolling stock not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ message: 'Rolling stock updated successfully' });
  } catch (error) {
    console.error('Error updating rolling stock:', error);
    return NextResponse.json(
      { error: 'Failed to update rolling stock' },
      { status: 500 }
    );
  } finally {
    await mongoService.close();
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const mongoService = getMongoDbService();
  
  try {
    await mongoService.connect();
    const collection = mongoService.getRollingStockCollection();
    
    const result = await collection.deleteOne({ _id: mongoService.toObjectId(params.id) });
    
    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Rolling stock not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ message: 'Rolling stock deleted successfully' });
  } catch (error) {
    console.error('Error deleting rolling stock:', error);
    return NextResponse.json(
      { error: 'Failed to delete rolling stock' },
      { status: 500 }
    );
  } finally {
    await mongoService.close();
  }
} 