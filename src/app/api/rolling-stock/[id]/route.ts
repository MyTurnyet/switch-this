import { NextRequest, NextResponse } from 'next/server';
import { IMongoDbService } from '@/lib/services/mongodb.interface';
import { MongoDbService } from '@/lib/services/mongodb.service';
import { Collection, ObjectId } from 'mongodb';

// Create a MongoDB service that will be used throughout this file
const mongoService: IMongoDbService = new MongoDbService();

interface RollingStock {
  _id?: string | ObjectId;
  roadName: string;
  roadNumber: string;
  aarType: string;
  description: string;
  homeYard: string;
  currentLocation?: {
    industryId: string;
    trackId: string;
  };
  destination?: {
    immediateDestination: {
      locationId: string;
      industryId: string;
      trackId: string;
    };
    finalDestination?: {
      locationId: string;
      industryId: string;
      trackId?: string;
    };
  };
  [key: string]: unknown;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await mongoService.connect();
    const collection = mongoService.getRollingStockCollection();
    
    const rollingStock = await findRollingStockById(collection, params.id, mongoService);
    
    if (!rollingStock) {
      return createNotFoundResponse();
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

async function findRollingStockById(collection: Collection, id: string, mongoService: IMongoDbService) {
  return await collection.findOne({ 
    _id: mongoService.toObjectId(id) 
  });
}

function createNotFoundResponse() {
  return NextResponse.json(
    { error: 'Rolling stock not found' },
    { status: 404 }
  );
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const updatedData = await request.json();
    
    sanitizeData(updatedData);
    
    await mongoService.connect();
    const collection = mongoService.getRollingStockCollection();
    
    const result = await updateRollingStock(collection, params.id, updatedData, mongoService);
    
    if (result.matchedCount === 0) {
      return createNotFoundResponse();
    }
    
    return createSuccessResponse('Rolling stock updated successfully');
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

function sanitizeData(data: Partial<RollingStock>) {
  if (data._id) {
    delete data._id;
  }
}

async function updateRollingStock(
  collection: Collection, 
  id: string, 
  data: Partial<RollingStock>, 
  mongoService: IMongoDbService
) {
  return await collection.updateOne(
    { _id: mongoService.toObjectId(id) },
    { $set: data }
  );
}

function createSuccessResponse(message: string) {
  return NextResponse.json({ message });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await mongoService.connect();
    const collection = mongoService.getRollingStockCollection();
    
    const result = await deleteRollingStock(collection, params.id, mongoService);
    
    if (result.deletedCount === 0) {
      return createNotFoundResponse();
    }
    
    return createSuccessResponse('Rolling stock deleted successfully');
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

async function deleteRollingStock(collection: Collection, id: string, mongoService: IMongoDbService) {
  return await collection.deleteOne({ 
    _id: mongoService.toObjectId(id) 
  });
} 