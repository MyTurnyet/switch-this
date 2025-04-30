import { NextResponse } from 'next/server';
import { getMongoDbService } from '@/lib/services/mongodb.provider';

// GET a specific industry by ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const mongoService = getMongoDbService();

  try {
    await mongoService.connect();
    const collection = mongoService.getIndustriesCollection();
    
    const industry = await collection.findOne({ 
      _id: mongoService.toObjectId(params.id) 
    });
    
    if (!industry) {
      return NextResponse.json(
        { error: 'Industry not found' },
        { status: 404 }
      );
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

// PUT to update an industry
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const mongoService = getMongoDbService();

  try {
    const data = await request.json();
    
    // Validate required fields
    if (!data.name) {
      return NextResponse.json(
        { error: 'Industry name is required' },
        { status: 400 }
      );
    }
    
    await mongoService.connect();
    const collection = mongoService.getIndustriesCollection();
    
    // Don't allow changing _id, convert string ID to ObjectId
    const industryId = mongoService.toObjectId(params.id);
    delete data._id;
    
    const result = await collection.updateOne(
      { _id: industryId },
      { $set: data }
    );
    
    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Industry not found' },
        { status: 404 }
      );
    }
    
    const updatedIndustry = await collection.findOne({ _id: industryId });
    
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