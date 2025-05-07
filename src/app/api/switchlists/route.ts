import { NextRequest } from 'next/server';
import { IMongoDbService } from '@/lib/services/mongodb.interface';
import { getMongoService } from '@/lib/services/mongodb.client';
import { ObjectId } from 'mongodb';

// Get the MongoDB service instance from the factory
const mongoService: IMongoDbService = getMongoService();

// GET handler
export async function GET() {
  try {
    if (typeof mongoService.connect === 'function') {
      await mongoService.connect();
    }
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
    if (typeof mongoService.close === 'function') {
      await mongoService.close();
    }
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
    if (typeof mongoService.connect === 'function') {
      await mongoService.connect();
    }
    
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
    if (typeof mongoService.close === 'function') {
      await mongoService.close();
    }
  }
} 