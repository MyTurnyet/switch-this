import { NextRequest, NextResponse } from 'next/server';
import { MongoDbProvider } from '@/lib/services/mongodb.provider';
import { MongoDbService } from '@/lib/services/mongodb.service';
import { ObjectId } from 'mongodb';


// Create a MongoDB provider and service that will be used throughout this file
const mongoDbProvider = new MongoDbProvider(new MongoDbService());

// GET handler
export async function GET() {
  const mongoService = mongoDbProvider.getService();
  
  try {
    await mongoService.connect();
    const collection = mongoService.getSwitchlistsCollection();
    
    const switchlists = await collection.find({}).toArray();
    
    return NextResponse.json(switchlists);
  } catch (error) {
    console.error('Error fetching switchlists:', error);
    return NextResponse.json(
      { error: 'Failed to fetch switchlists' },
      { status: 500 }
    );
  } finally {
    await mongoService.close();
  }
}

// POST handler
export async function POST(request: NextRequest) {
  const mongoService = mongoDbProvider.getService();
  
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.trainRouteId || !body.name) {
      return NextResponse.json(
        { error: 'Missing required fields: trainRouteId and name are required' },
        { status: 400 }
      );
    }
    
    // Validate trainRouteId exists
    await mongoService.connect();
    
    let trainRouteId;
    try {
      trainRouteId = new ObjectId(body.trainRouteId);
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid trainRouteId format' },
        { status: 400 }
      );
    }
    
    const trainRoutesCollection = mongoService.getTrainRoutesCollection();
    const trainRoute = await trainRoutesCollection.findOne({ _id: trainRouteId });
    if (!trainRoute) {
      return NextResponse.json(
        { error: 'Train route not found' },
        { status: 404 }
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
    
    return NextResponse.json(
      { ...switchlist, _id: result.insertedId.toString() },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating switchlist:', error);
    return NextResponse.json(
      { error: 'Failed to create switchlist' },
      { status: 500 }
    );
  } finally {
    await mongoService.close();
  }
} 