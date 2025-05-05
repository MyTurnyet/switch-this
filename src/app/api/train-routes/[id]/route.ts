import { NextRequest, NextResponse } from 'next/server';
import { MongoDbProvider } from '@/lib/services/mongodb.provider';
import { MongoDbService } from '@/lib/services/mongodb.service';
import { ObjectId } from 'mongodb';


// Create a MongoDB provider and service that will be used throughout this file
const mongoDbProvider = new MongoDbProvider(new MongoDbService());

// Helper function to validate train route data
function validateTrainRoute(trainRoute: Record<string, unknown>): boolean {
  return (
    trainRoute &&
    typeof trainRoute.name === 'string' &&
    typeof trainRoute.routeNumber === 'string' &&
    ['MIXED', 'PASSENGER', 'FREIGHT'].includes(trainRoute.routeType as string) &&
    typeof trainRoute.originatingYardId === 'string' &&
    typeof trainRoute.terminatingYardId === 'string' &&
    Array.isArray(trainRoute.stations)
  );
}

// Get a single train route by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const mongoService = mongoDbProvider.getService();
  
  try {
    await mongoService.connect();
    const collection = mongoService.getTrainRoutesCollection();
    
    const trainRoute = await collection.findOne({ _id: new ObjectId(params.id) });
    
    if (!trainRoute) {
      return NextResponse.json(
        { error: 'Train route not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(trainRoute);
  } catch (error) {
    console.error(`Error fetching train route with id ${params.id}:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch train route' },
      { status: 500 }
    );
  } finally {
    await mongoService.close();
  }
}

// Update a train route
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const mongoService = mongoDbProvider.getService();
  
  try {
    const trainRoute = await request.json();
    
    // Validate the train route data
    if (!validateTrainRoute(trainRoute)) {
      return NextResponse.json(
        { error: 'Invalid train route data' },
        { status: 400 }
      );
    }
    
    await mongoService.connect();
    const collection = mongoService.getTrainRoutesCollection();
    
    // Destructure to remove _id and ownerId from the update
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _id, ownerId, ...updatableFields } = trainRoute;
    
    // Convert string IDs to ObjectIds as needed
    if (updatableFields.originatingYardId) {
      updatableFields.originatingYardId = new ObjectId(updatableFields.originatingYardId);
    }
    
    if (updatableFields.terminatingYardId) {
      updatableFields.terminatingYardId = new ObjectId(updatableFields.terminatingYardId);
    }
    
    if (updatableFields.stations && Array.isArray(updatableFields.stations)) {
      updatableFields.stations = updatableFields.stations.map(
        (station: string) => new ObjectId(station)
      );
    }
    
    const result = await collection.updateOne(
      { _id: new ObjectId(params.id) },
      { $set: updatableFields }
    );
    
    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Train route not found' },
        { status: 404 }
      );
    }
    
    const updatedTrainRoute = await collection.findOne({ _id: new ObjectId(params.id) });
    return NextResponse.json(updatedTrainRoute);
  } catch (error) {
    console.error(`Error updating train route with id ${params.id}:`, error);
    return NextResponse.json(
      { error: 'Failed to update train route' },
      { status: 500 }
    );
  } finally {
    await mongoService.close();
  }
}

// Delete a train route
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const mongoService = mongoDbProvider.getService();
  
  try {
    await mongoService.connect();
    const collection = mongoService.getTrainRoutesCollection();
    
    const result = await collection.deleteOne({ _id: new ObjectId(params.id) });
    
    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Train route not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`Error deleting train route with id ${params.id}:`, error);
    return NextResponse.json(
      { error: 'Failed to delete train route' },
      { status: 500 }
    );
  } finally {
    await mongoService.close();
  }
} 