import { NextRequest } from 'next/server';
import { IMongoDbService } from '@/lib/services/mongodb.interface';
import { MongoDbService } from '@/lib/services/mongodb.service';
import { ObjectId } from 'mongodb';
import { Switchlist } from '@/app/shared/types/models';


// Create a MongoDB service to be used throughout this file
const mongoService: IMongoDbService = new MongoDbService();

// GET handler to fetch a specific switchlist
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await mongoService.connect();
    const collection = mongoService.getSwitchlistsCollection();
    
    let id;
    try {
      id = new ObjectId(params.id);
    } catch (error) {
      return new Response(
        JSON.stringify({ error: 'Invalid ID format' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    const switchlist = await collection.findOne({ _id: id });
    
    if (!switchlist) {
      return new Response(
        JSON.stringify({ error: 'Switchlist not found' }),
        { 
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    return new Response(
      JSON.stringify(switchlist),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error(`Error fetching switchlist with id ${params.id}:`, error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch switchlist' }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } finally {
    await mongoService.close();
  }
}

// PUT handler to update a switchlist
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    
    let id;
    try {
      id = new ObjectId(params.id);
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
    const collection = mongoService.getSwitchlistsCollection();
    
    // Ensure the switchlist exists
    const existingSwitchlist = await collection.findOne({ _id: id });
    
    if (!existingSwitchlist) {
      return new Response(
        JSON.stringify({ error: 'Switchlist not found' }),
        { 
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    // If trainRouteId is provided, validate it exists
    if (body.trainRouteId) {
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
      return new Response(
        JSON.stringify({ error: 'Switchlist not found' }),
        { 
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    const updatedSwitchlist = await collection.findOne({ _id: id });
    
    return new Response(
      JSON.stringify(updatedSwitchlist),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error(`Error updating switchlist with id ${params.id}:`, error);
    return new Response(
      JSON.stringify({ error: 'Failed to update switchlist' }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } finally {
    await mongoService.close();
  }
}

// DELETE handler to remove a switchlist
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    let id;
    try {
      id = new ObjectId(params.id);
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
    const collection = mongoService.getSwitchlistsCollection();
    
    // Check if the switchlist exists first
    const switchlist = await collection.findOne({ _id: id });
    
    if (!switchlist) {
      return new Response(
        JSON.stringify({ error: 'Switchlist not found' }),
        { 
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    const result = await collection.deleteOne({ _id: id });
    
    if (result.deletedCount === 0) {
      return new Response(
        JSON.stringify({ error: 'Switchlist not found' }),
        { 
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    return new Response(
      JSON.stringify({ message: 'Switchlist deleted successfully' }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error(`Error deleting switchlist with id ${params.id}:`, error);
    return new Response(
      JSON.stringify({ error: 'Failed to delete switchlist' }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } finally {
    await mongoService.close();
  }
} 