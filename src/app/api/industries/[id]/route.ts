import { NextResponse } from 'next/server';
import { getMongoDbService } from '@/lib/services/mongodb.provider';
import { Collection, ObjectId } from 'mongodb';

interface Industry {
  _id?: string | ObjectId;
  name: string;
  locationId: string;
  industryType: string;
  blockName: string;
  tracks?: any[];
  [key: string]: any;
}

// GET a specific industry by ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const mongoService = getMongoDbService();

  try {
    await mongoService.connect();
    const collection = mongoService.getIndustriesCollection();
    
    const industry = await findIndustryById(collection, params.id, mongoService);
    
    if (!industry) {
      return createNotFoundResponse();
    }
    
    return NextResponse.json(industry);
  } catch (error) {
    console.error('Error fetching industry:', error);
    return NextResponse.json(
      { error: 'Failed to fetch industry' },
      { status: 500 }
    );
  } finally {
    await mongoService.close();
  }
}

async function findIndustryById(collection: Collection, id: string, mongoService: any) {
  return await collection.findOne({ 
    _id: mongoService.toObjectId(id) 
  });
}

function createNotFoundResponse() {
  return NextResponse.json(
    { error: 'Industry not found' },
    { status: 404 }
  );
}

// PUT to update an industry
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const mongoService = getMongoDbService();

  try {
    const data = await request.json();
    
    if (!validateRequiredName(data)) {
      return createInvalidNameResponse();
    }
    
    await mongoService.connect();
    const collection = mongoService.getIndustriesCollection();
    
    const industryId = prepareForUpdate(params.id, data, mongoService);
    
    const result = await updateIndustry(collection, industryId, data);
    
    if (result.matchedCount === 0) {
      return createNotFoundResponse();
    }
    
    const updatedIndustry = await findIndustryById(collection, params.id, mongoService);
    
    return NextResponse.json(updatedIndustry);
  } catch (error) {
    console.error('Error updating industry:', error);
    return NextResponse.json(
      { error: 'Failed to update industry' },
      { status: 500 }
    );
  } finally {
    await mongoService.close();
  }
}

function validateRequiredName(data: Partial<Industry>): boolean {
  return !!data.name;
}

function createInvalidNameResponse() {
  return NextResponse.json(
    { error: 'Industry name is required' },
    { status: 400 }
  );
}

function prepareForUpdate(id: string, data: Partial<Industry>, mongoService: any): ObjectId {
  const industryId = mongoService.toObjectId(id);
  delete data._id;
  return industryId;
}

async function updateIndustry(collection: Collection, industryId: ObjectId, data: Partial<Industry>) {
  return await collection.updateOne(
    { _id: industryId },
    { $set: data }
  );
}

// DELETE an industry
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const mongoService = getMongoDbService();

  try {
    await mongoService.connect();
    const collection = mongoService.getIndustriesCollection();
    
    const industryId = mongoService.toObjectId(params.id);
    const result = await deleteIndustry(collection, industryId);
    
    if (result.deletedCount === 0) {
      return createNotFoundResponse();
    }
    
    return createSuccessResponse();
  } catch (error) {
    console.error('Error deleting industry:', error);
    return NextResponse.json(
      { error: 'Failed to delete industry' },
      { status: 500 }
    );
  } finally {
    await mongoService.close();
  }
}

async function deleteIndustry(collection: Collection, industryId: ObjectId) {
  return await collection.deleteOne({ _id: industryId });
}

function createSuccessResponse() {
  return NextResponse.json({ message: 'Industry deleted successfully' });
} 