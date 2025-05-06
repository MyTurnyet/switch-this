import { NextRequest } from 'next/server';
import { IMongoDbService } from '@/lib/services/mongodb.interface';
import { MongoDbService } from '@/lib/services/mongodb.service';
import { ObjectId } from 'mongodb';

// Create a MongoDB service that will be used throughout this file
const mongoService: IMongoDbService = new MongoDbService();

// GET handler
export async function GET() {
  try {
    await mongoService.connect();
    const collection = mongoService.getSwitchlistsCollection();
    
    const switchlists = await collection.find({}).toArray();
    
    return new Response(
      JSON.stringify(switchlists),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error fetching switchlists:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch switchlists' }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } finally {
    await mongoService.close();
  }
}

// POST handler
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.trainRouteId || !body.name) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: trainRouteId and name are required' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    // Validate trainRouteId exists
    await mongoService.connect();
    
    let trainRouteId;
    try {
      trainRouteId = new ObjectId(body.trainRouteId);
    } catch (error) {
      return new Response(
        JSON.stringify({ error: 'Invalid trainRouteId format' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    const trainRoutesCollection = mongoService.getTrainRoutesCollection();
    const trainRoute = await trainRoutesCollection.findOne({ _id: trainRouteId });
    if (!trainRoute) {
      return new Response(
        JSON.stringify({ error: 'Train route not found' }),
        { 
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    // Create the switchlist
    const switchlistsCollection = mongoService.getSwitchlistsCollection();
    const switchlist = {
      trainRouteId: body.trainRouteId,
      name: body.name,
      createdAt: body.createdAt || new Date().toISOString(),
      status: body.status || 'CREATED',
      notes: body.notes || '',
      ownerId: body.ownerId || 'system',
    };
    
    const result = await switchlistsCollection.insertOne(switchlist);
    
    if (!result.acknowledged) {
      throw new Error('Failed to insert switchlist');
    }
    
    return new Response(
      JSON.stringify({ ...switchlist, _id: result.insertedId.toString() }),
      { 
        status: 201,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error creating switchlist:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to create switchlist' }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } finally {
    await mongoService.close();
  }
} 