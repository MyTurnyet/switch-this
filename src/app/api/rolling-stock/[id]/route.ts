import { NextRequest } from 'next/server';
import { IMongoDbService } from '@/lib/services/mongodb.interface';
import { MongoDbService } from '@/lib/services/mongodb.service';
import { Collection, ObjectId } from 'mongodb';
import { CarDestination } from '@/app/shared/types/models';

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

// Common headers for all responses
const corsHeaders = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization'
};

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  // Create a MongoDB service instance for this request
  const mongoService: IMongoDbService = new MongoDbService();
  
  try {
    const id = params.id;
    
    // Validate ID format
    if (!ObjectId.isValid(id)) {
      return new Response(
        JSON.stringify({ error: 'Invalid rolling stock ID format' }),
        { 
          status: 400,
          headers: corsHeaders
        }
      );
    }
    
    // Connect to the database
    await mongoService.connect();
    
    // Get the rolling stock collection
    const collection = mongoService.getRollingStockCollection();
    
    // Find the rolling stock by ID
    const rollingStock = await collection.findOne({ _id: new ObjectId(id) });
    
    // Close the connection
    await mongoService.close();
    
    // If no rolling stock found, return 404
    if (!rollingStock) {
      return new Response(
        JSON.stringify({ error: 'Rolling stock not found' }),
        { 
          status: 404,
          headers: corsHeaders
        }
      );
    }
    
    // Return the rolling stock
    return new Response(
      JSON.stringify(rollingStock),
      { 
        status: 200,
        headers: corsHeaders
      }
    );
  } catch (error) {
    console.error('Error fetching rolling stock item:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch rolling stock item' }),
      { 
        status: 500,
        headers: corsHeaders
      }
    );
  } finally {
    // Ensure connection is closed even if an error occurs
    if (mongoService) {
      try {
        await mongoService.close();
      } catch (error) {
        console.error('Error closing MongoDB connection:', error);
      }
    }
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  // Create a MongoDB service instance for this request
  const mongoService: IMongoDbService = new MongoDbService();
  
  try {
    const id = params.id;
    
    // Validate ID format
    if (!ObjectId.isValid(id)) {
      return new Response(
        JSON.stringify({ error: 'Invalid rolling stock ID format' }),
        { 
          status: 400,
          headers: corsHeaders
        }
      );
    }
    
    // Parse the request body
    const data = await request.json();
    
    // Connect to the database
    await mongoService.connect();
    
    // Get the rolling stock collection
    const collection = mongoService.getRollingStockCollection();
    
    // Check if rolling stock exists
    const existingRollingStock = await collection.findOne({ _id: new ObjectId(id) });
    
    if (!existingRollingStock) {
      return new Response(
        JSON.stringify({ error: 'Rolling stock not found' }),
        { 
          status: 404,
          headers: corsHeaders
        }
      );
    }
    
    // Prepare update data
    const updateData = { ...data };
    delete updateData._id; // Remove _id from update data
    
    // Update the rolling stock
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );
    
    // Return the result
    return new Response(
      JSON.stringify({ message: 'Rolling stock updated successfully' }),
      { 
        status: 200,
        headers: corsHeaders
      }
    );
  } catch (error) {
    console.error('Error updating rolling stock:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to update rolling stock' }),
      { 
        status: 500,
        headers: corsHeaders
      }
    );
  } finally {
    // Ensure connection is closed even if an error occurs
    if (mongoService) {
      try {
        await mongoService.close();
      } catch (error) {
        console.error('Error closing MongoDB connection:', error);
      }
    }
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  // Create a MongoDB service instance for this request
  const mongoService: IMongoDbService = new MongoDbService();
  
  try {
    const id = params.id;
    
    // Validate ID format
    if (!ObjectId.isValid(id)) {
      return new Response(
        JSON.stringify({ error: 'Invalid rolling stock ID format' }),
        { 
          status: 400,
          headers: corsHeaders
        }
      );
    }
    
    // Connect to the database
    await mongoService.connect();
    
    // Get the rolling stock collection
    const collection = mongoService.getRollingStockCollection();
    
    // Check if rolling stock exists
    const existingRollingStock = await collection.findOne({ _id: new ObjectId(id) });
    
    if (!existingRollingStock) {
      return new Response(
        JSON.stringify({ error: 'Rolling stock not found' }),
        { 
          status: 404,
          headers: corsHeaders
        }
      );
    }
    
    // Delete the rolling stock
    const result = await collection.deleteOne({ _id: new ObjectId(id) });
    
    // Also remove this rolling stock from any tracks it might be placed on
    const industriesCollection = mongoService.getIndustriesCollection();
    await industriesCollection.updateMany(
      { 'tracks.placedCars': id },
      { $pull: { 'tracks.$.placedCars': id } }
    );
    
    // Return the result
    return new Response(
      JSON.stringify({ message: 'Rolling stock deleted successfully' }),
      { 
        status: 200,
        headers: corsHeaders
      }
    );
  } catch (error) {
    console.error('Error deleting rolling stock:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to delete rolling stock' }),
      { 
        status: 500,
        headers: corsHeaders
      }
    );
  } finally {
    // Ensure connection is closed even if an error occurs
    if (mongoService) {
      try {
        await mongoService.close();
      } catch (error) {
        console.error('Error closing MongoDB connection:', error);
      }
    }
  }
} 