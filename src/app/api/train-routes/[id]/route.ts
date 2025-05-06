import { NextRequest } from 'next/server';
import { IMongoDbService } from '@/lib/services/mongodb.interface';
import { MongoDbService } from '@/lib/services/mongodb.service';
import { ObjectId } from 'mongodb';


// Create a MongoDB service to be used throughout this file
const mongoService: IMongoDbService = new MongoDbService();

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
  try {
    let objectId;
    try {
      objectId = new ObjectId(params.id);
    } catch (error) {
      return new Response(
        JSON.stringify({ error: 'Invalid ID format' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    await mongoService.connect();
    const collection = mongoService.getTrainRoutesCollection();
    
    const trainRoute = await collection.findOne({ _id: objectId });
    
    if (!trainRoute) {
      return new Response(
        JSON.stringify({ error: 'Train route not found' }),
        { 
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    return new Response(
      JSON.stringify(trainRoute),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error(`Error fetching train route with id ${params.id}:`, error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch train route' }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
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
  try {
    const trainRoute = await request.json();
    
    // Validate the train route data
    if (!validateTrainRoute(trainRoute)) {
      return new Response(
        JSON.stringify({ error: 'Invalid train route data' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
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
      return new Response(
        JSON.stringify({ error: 'Train route not found' }),
        { 
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    const updatedTrainRoute = await collection.findOne({ _id: new ObjectId(params.id) });
    return new Response(
      JSON.stringify(updatedTrainRoute),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error(`Error updating train route with id ${params.id}:`, error);
    return new Response(
      JSON.stringify({ error: 'Failed to update train route' }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
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
  try {
    let objectId;
    try {
      objectId = new ObjectId(params.id);
    } catch (error) {
      return new Response(
        JSON.stringify({ error: 'Invalid ID format' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    await mongoService.connect();
    const collection = mongoService.getTrainRoutesCollection();
    
    const result = await collection.deleteOne({ _id: objectId });
    
    if (result.deletedCount === 0) {
      return new Response(
        JSON.stringify({ error: 'Train route not found' }),
        { 
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    return new Response(
      JSON.stringify({ success: true }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error(`Error deleting train route with id ${params.id}:`, error);
    return new Response(
      JSON.stringify({ error: 'Failed to delete train route' }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } finally {
    await mongoService.close();
  }
} 