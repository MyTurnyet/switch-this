import { NextResponse } from 'next/server';
import { getMongoDbService } from '@/lib/services/mongodb.provider';
import { Collection } from 'mongodb';
import { LocationType } from '@/app/shared/types/models';
import { MongoDbService } from '@/lib/services/mongodb.service';

// Helper functions
function createNotFoundResponse() {
  return NextResponse.json(
    { error: 'Location not found' },
    { status: 404 }
  );
}

function createInvalidInputResponse(message: string) {
  return NextResponse.json(
    { error: message },
    { status: 400 }
  );
}

function createSuccessResponse() {
  return NextResponse.json({ success: true });
}

async function findLocationById(collection: Collection, id: string, mongoService: MongoDbService) {
  const locationId = mongoService.toObjectId(id);
  return await collection.findOne({ _id: locationId });
}

// GET a specific location by ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const mongoService = getMongoDbService();

  try {
    await mongoService.connect();
    const collection = mongoService.getLocationsCollection();
    
    const location = await findLocationById(collection, params.id, mongoService);
    
    if (!location) {
      return createNotFoundResponse();
    }
    
    return NextResponse.json(location);
  } catch (error) {
    console.error('Error fetching location:', error);
    return NextResponse.json(
      { error: 'Failed to fetch location' },
      { status: 500 }
    );
  } finally {
    await mongoService.close();
  }
}

// PUT to update a location
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const mongoService = getMongoDbService();

  try {
    const data = await request.json();
    
    // Validate required fields
    if (!data.stationName) {
      return createInvalidInputResponse('Station name is required');
    }
    
    if (!data.block) {
      return createInvalidInputResponse('Block is required');
    }
    
    if (!Object.values(LocationType).includes(data.locationType)) {
      return createInvalidInputResponse('Valid location type is required');
    }
    
    // Remove _id from data if present to avoid MongoDB error
    if (data._id) {
      delete data._id;
    }
    
    await mongoService.connect();
    const collection = mongoService.getLocationsCollection();
    const locationId = mongoService.toObjectId(params.id);
    
    const result = await collection.updateOne(
      { _id: locationId },
      { $set: data }
    );
    
    if (result.matchedCount === 0) {
      return createNotFoundResponse();
    }
    
    const updatedLocation = await findLocationById(collection, params.id, mongoService);
    
    return NextResponse.json(updatedLocation);
  } catch (error) {
    console.error('Error updating location:', error);
    return NextResponse.json(
      { error: 'Failed to update location' },
      { status: 500 }
    );
  } finally {
    await mongoService.close();
  }
}

// DELETE a location
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const mongoService = getMongoDbService();

  try {
    await mongoService.connect();
    const collection = mongoService.getLocationsCollection();
    
    const locationId = mongoService.toObjectId(params.id);
    const result = await collection.deleteOne({ _id: locationId });
    
    if (result.deletedCount === 0) {
      return createNotFoundResponse();
    }
    
    return createSuccessResponse();
  } catch (error) {
    console.error('Error deleting location:', error);
    return NextResponse.json(
      { error: 'Failed to delete location' },
      { status: 500 }
    );
  } finally {
    await mongoService.close();
  }
} 