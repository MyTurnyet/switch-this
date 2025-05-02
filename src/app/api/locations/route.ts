import { NextResponse } from 'next/server';
import { getMongoDbService } from '@/lib/services/mongodb.provider';
import { LocationType } from '@/app/shared/types/models';

export async function GET() {
  const mongoService = getMongoDbService();

  try {
    await mongoService.connect();
    const collection = mongoService.getLocationsCollection();
    const locations = await collection.find().toArray();
    
    // Ensure all locations have a locationType field
    // If none exists, assign a default based on block name
    const enhancedLocations = locations.map(location => {
      if (!location.locationType) {
        // Set default location types
        if (location.stationName.includes('Yard')) {
          location.locationType = LocationType.FIDDLE_YARD;
        } else if (['Chicago', 'Portland', 'Vancouver', 'Edmonton', 'Spokane'].includes(location.stationName.split(',')[0])) {
          location.locationType = LocationType.OFF_LAYOUT;
        } else {
          location.locationType = LocationType.ON_LAYOUT;
        }
      }
      return location;
    });
    
    return NextResponse.json(enhancedLocations);
  } catch (error) {
    console.error('Error fetching locations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch locations' },
      { status: 500 }
    );
  } finally {
    await mongoService.close();
  }
}

export async function POST(request: Request) {
  const mongoService = getMongoDbService();

  try {
    const data = await request.json();
    
    // Validate required fields
    if (!data.stationName) {
      return NextResponse.json(
        { error: 'Station name is required' },
        { status: 400 }
      );
    }
    
    if (!data.block) {
      return NextResponse.json(
        { error: 'Block is required' },
        { status: 400 }
      );
    }
    
    if (!Object.values(LocationType).includes(data.locationType)) {
      return NextResponse.json(
        { error: 'Valid location type is required' },
        { status: 400 }
      );
    }
    
    await mongoService.connect();
    const collection = mongoService.getLocationsCollection();
    
    const result = await collection.insertOne(data);
    const newLocation = await collection.findOne({ _id: result.insertedId });
    
    return NextResponse.json(newLocation, { status: 201 });
  } catch (error) {
    console.error('Error creating location:', error);
    return NextResponse.json(
      { error: 'Failed to create location' },
      { status: 500 }
    );
  } finally {
    await mongoService.close();
  }
} 