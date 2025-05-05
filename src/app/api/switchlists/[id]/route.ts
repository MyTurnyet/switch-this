import { NextRequest, NextResponse } from 'next/server';
import { MongoDbProvider } from '@/lib/services/mongodb.provider';
import { MongoDbService } from '@/lib/services/mongodb.service';
import { ObjectId } from 'mongodb';
import { Switchlist } from '@/app/shared/types/models';


// Create a MongoDB provider and service that will be used throughout this file
const mongoDbProvider = new MongoDbProvider(new MongoDbService());

// GET handler to fetch a specific switchlist
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const mongoService = mongoDbProvider.getService();
  
  try {
    await mongoService.connect();
    const collection = mongoService.getSwitchlistsCollection();
    
    let id;
    try {
      id = new ObjectId(params.id);
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid ID format' },
        { status: 400 }
      );
    }
    
    const switchlist = await collection.findOne({ _id: id });
    
    if (!switchlist) {
      return NextResponse.json(
        { error: 'Switchlist not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(switchlist);
  } catch (error) {
    console.error(`Error fetching switchlist with id ${params.id}:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch switchlist' },
      { status: 500 }
    );
  } finally {
    await mongoService.close();
  }
}

// PUT handler to update a switchlist
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const mongoService = mongoDbProvider.getService();
  
  try {
    const body = await request.json();
    
    let id;
    try {
      id = new ObjectId(params.id);
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid ID format' },
        { status: 400 }
      );
    }
    
    await mongoService.connect();
    const collection = mongoService.getSwitchlistsCollection();
    
    // Ensure the switchlist exists
    const existingSwitchlist = await collection.findOne({ _id: id });
    
    if (!existingSwitchlist) {
      return NextResponse.json(
        { error: 'Switchlist not found' },
        { status: 404 }
      );
    }
    
    // If trainRouteId is provided, validate it exists
    if (body.trainRouteId) {
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
    }
    
    // Create update object with only allowed fields
    const update: Partial<Switchlist> = {};
    
    if (body.name) update.name = body.name;
    if (body.trainRouteId) update.trainRouteId = body.trainRouteId;
    if (body.status && ['CREATED', 'IN_PROGRESS', 'COMPLETED'].includes(body.status)) {
      update.status = body.status as Switchlist['status'];
    }
    if (body.notes !== undefined) update.notes = body.notes;
    
    const result = await collection.updateOne(
      { _id: id },
      { $set: update }
    );
    
    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Switchlist not found' },
        { status: 404 }
      );
    }
    
    const updatedSwitchlist = await collection.findOne({ _id: id });
    
    return NextResponse.json(updatedSwitchlist);
  } catch (error) {
    console.error(`Error updating switchlist with id ${params.id}:`, error);
    return NextResponse.json(
      { error: 'Failed to update switchlist' },
      { status: 500 }
    );
  } finally {
    await mongoService.close();
  }
}

// DELETE handler to remove a switchlist
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const mongoService = mongoDbProvider.getService();
  
  try {
    let id;
    try {
      id = new ObjectId(params.id);
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid ID format' },
        { status: 400 }
      );
    }
    
    await mongoService.connect();
    const collection = mongoService.getSwitchlistsCollection();
    
    // Check if the switchlist exists
    const switchlist = await collection.findOne({ _id: id });
    
    if (!switchlist) {
      return NextResponse.json(
        { error: 'Switchlist not found' },
        { status: 404 }
      );
    }
    
    const result = await collection.deleteOne({ _id: id });
    
    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Failed to delete switchlist' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`Error deleting switchlist with id ${params.id}:`, error);
    return NextResponse.json(
      { error: 'Failed to delete switchlist' },
      { status: 500 }
    );
  } finally {
    await mongoService.close();
  }
} 