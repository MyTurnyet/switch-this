import { NextRequest } from 'next/server';
import { IMongoDbService } from '@/lib/services/mongodb.interface';
import { MongoDbService } from '@/lib/services/mongodb.service';
import { Collection, ObjectId } from 'mongodb';
import { Industry } from '@/app/shared/types/models';

// Common CORS headers to use in all responses
const corsHeaders = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization'
};

// GET a specific industry by ID
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  // Create a MongoDB service instance for this request
  const mongoService: IMongoDbService = new MongoDbService();
  
  try {
    const id = params.id;
    
    if (!ObjectId.isValid(id)) {
      return new Response(
        JSON.stringify({ error: 'Invalid industry ID format' }),
        {
          status: 400,
          headers: corsHeaders
        }
      );
    }
    
    await mongoService.connect();
    
    const collection = mongoService.getIndustriesCollection();
    const industry = await collection.findOne({ _id: new ObjectId(id) });
    
    await mongoService.close();
    
    if (!industry) {
      return new Response(
        JSON.stringify({ error: 'Industry not found' }),
        {
          status: 404,
          headers: corsHeaders
        }
      );
    }
    
    return new Response(
      JSON.stringify(industry),
      {
        status: 200,
        headers: corsHeaders
      }
    );
  } catch (error) {
    console.error('Error fetching industry:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch industry' }),
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

// PUT to update an industry
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  // Create a MongoDB service instance for this request
  const mongoService: IMongoDbService = new MongoDbService();
  
  try {
    const id = params.id;
    
    if (!ObjectId.isValid(id)) {
      return new Response(
        JSON.stringify({ error: 'Invalid industry ID format' }),
        {
          status: 400,
          headers: corsHeaders
        }
      );
    }
    
    const data = await request.json();
    
    await mongoService.connect();
    
    const collection = mongoService.getIndustriesCollection();
    
    // Check if the industry exists
    const existingIndustry = await collection.findOne({ _id: new ObjectId(id) });
    
    if (!existingIndustry) {
      return new Response(
        JSON.stringify({ error: 'Industry not found' }),
        {
          status: 404,
          headers: corsHeaders
        }
      );
    }
    
    // Remove the _id field from the update data if it exists
    if (data._id) {
      delete data._id;
    }
    
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: data }
    );
    
    return new Response(
      JSON.stringify({ message: 'Industry updated successfully' }),
      {
        status: 200,
        headers: corsHeaders
      }
    );
  } catch (error) {
    console.error('Error updating industry:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to update industry' }),
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

// DELETE an industry
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  // Create a MongoDB service instance for this request
  const mongoService: IMongoDbService = new MongoDbService();
  
  try {
    const id = params.id;
    
    if (!ObjectId.isValid(id)) {
      return new Response(
        JSON.stringify({ error: 'Invalid industry ID format' }),
        {
          status: 400,
          headers: corsHeaders
        }
      );
    }
    
    await mongoService.connect();
    
    const collection = mongoService.getIndustriesCollection();
    
    // Check if the industry exists first
    const existingIndustry = await collection.findOne({ _id: new ObjectId(id) });
    
    if (!existingIndustry) {
      return new Response(
        JSON.stringify({ error: 'Industry not found' }),
        {
          status: 404,
          headers: corsHeaders
        }
      );
    }
    
    const result = await collection.deleteOne({ _id: new ObjectId(id) });
    
    return new Response(
      JSON.stringify({ message: 'Industry deleted successfully' }),
      {
        status: 200,
        headers: corsHeaders
      }
    );
  } catch (error) {
    console.error('Error deleting industry:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to delete industry' }),
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