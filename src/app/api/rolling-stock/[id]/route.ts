import { NextRequest, NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';

const uri = process.env.MONGODB_URI || 'mongodb://admin:password@localhost:27017';
const dbName = process.env.MONGODB_DB || 'switch-this';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection('rolling-stock');
    
    const rollingStock = await collection.findOne({ _id: new ObjectId(params.id) });
    
    if (!rollingStock) {
      return NextResponse.json(
        { error: 'Rolling stock not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(rollingStock);
  } catch (error) {
    console.error('Error fetching rolling stock item:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rolling stock item' },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const client = new MongoClient(uri);
  
  try {
    const updatedData = await request.json();
    
    // Remove _id from the updated data to avoid MongoDB errors
    if (updatedData._id) {
      delete updatedData._id;
    }
    
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection('rolling-stock');
    
    const result = await collection.updateOne(
      { _id: new ObjectId(params.id) },
      { $set: updatedData }
    );
    
    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Rolling stock not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ message: 'Rolling stock updated successfully' });
  } catch (error) {
    console.error('Error updating rolling stock:', error);
    return NextResponse.json(
      { error: 'Failed to update rolling stock' },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection('rolling-stock');
    
    const result = await collection.deleteOne({ _id: new ObjectId(params.id) });
    
    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Rolling stock not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ message: 'Rolling stock deleted successfully' });
  } catch (error) {
    console.error('Error deleting rolling stock:', error);
    return NextResponse.json(
      { error: 'Failed to delete rolling stock' },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
} 