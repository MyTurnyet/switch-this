import { NextRequest } from 'next/server';
import { IMongoDbService } from '@/lib/services/mongodb.interface';
import { MongoDbService } from '@/lib/services/mongodb.service';
import { ObjectId } from 'mongodb';

// Create a MongoDB service instance
const mongoService: IMongoDbService = new MongoDbService();

/**
 * GET /api/layout-state
 * Fetches the most recent layout state
 */
export async function GET() {
  try {
    await mongoService.connect();
    const collection = mongoService.getLayoutStateCollection();
    
    // Find the most recent layout state
    const layoutState = await collection.findOne({}, { sort: { updatedAt: -1 } });
    
    if (!layoutState) {
      return new Response(
        JSON.stringify({ exists: false }),
        { 
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    return new Response(
      JSON.stringify(layoutState),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error fetching layout state:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch layout state' }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } finally {
    await mongoService.close();
  }
}

/**
 * POST /api/layout-state
 * Creates or updates the layout state
 */
export async function POST(request: NextRequest) {
  try {
    const requestData = await request.json();
    await mongoService.connect();
    const collection = mongoService.getLayoutStateCollection();
    
    // If _id is provided, we're updating an existing layout state
    if (requestData._id) {
      let objectId;
      try {
        objectId = new ObjectId(requestData._id);
      } catch (error) {
        return new Response(
          JSON.stringify({ error: 'Invalid layout state ID format' }),
          { 
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }
      
      // Add updatedAt timestamp
      const updateData = {
        ...requestData,
        updatedAt: new Date().toISOString()
      };
      
      // Remove _id from the update data (MongoDB doesn't allow _id in $set)
      delete updateData._id;
      
      const result = await collection.updateOne(
        { _id: objectId },
        { $set: updateData }
      );
      
      if (result.matchedCount === 0) {
        return new Response(
          JSON.stringify({ error: 'Layout state not found' }),
          { 
            status: 404,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }
      
      // Return the updated document
      const updatedDocument = await collection.findOne({ _id: objectId });
      
      return new Response(
        JSON.stringify(updatedDocument),
        { 
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    } 
    // If no _id, we're creating a new layout state
    else {
      // Prepare the insert data with timestamp
      const insertData = {
        ...requestData,
        updatedAt: new Date().toISOString()
      };
      
      const result = await collection.insertOne(insertData);
      
      if (!result.acknowledged) {
        throw new Error('Failed to insert layout state');
      }
      
      // Return the new document with its _id
      return new Response(
        JSON.stringify({ ...insertData, _id: result.insertedId }),
        { 
          status: 201,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  } catch (error) {
    console.error('Error saving layout state:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to save layout state' }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } finally {
    await mongoService.close();
  }
}

/**
 * OPTIONS /api/layout-state
 * Handle preflight requests
 */
export function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-HTTP-Method-Override, X-Requested-With',
    },
  });
} 