import { NextResponse } from 'next/server';
import { RollingStock, Industry } from '@/app/shared/types/models';
import { MongoClient, ObjectId } from 'mongodb';

export async function POST() {
  try {
    const client = await MongoClient.connect(process.env.MONGODB_URI!);
    const db = client.db();
    const rollingStockCollection = db.collection('rollingStock');
    const industriesCollection = db.collection('industries');

    // Get all rolling stock and industries
    const allRollingStock = await rollingStockCollection.find({}).toArray() as unknown as RollingStock[];
    const allIndustries = await industriesCollection.find({}).toArray() as unknown as Industry[];

    // First, clear all placedCars arrays from all tracks
    const updatePromises = allIndustries.map(industry => 
      industriesCollection.updateOne(
        { _id: new ObjectId(industry._id) },
        { $set: { "tracks.$[].placedCars": [] } }
      )
    );
    await Promise.all(updatePromises);

    // Create a map of yard IDs to their tracks
    const yardTracks = new Map<string, { trackId: string; carCount: number }[]>();
    
    // Initialize the map with all yard tracks
    allIndustries
      .filter(industry => industry.industryType === 'YARD')
      .forEach(yard => {
        yardTracks.set(yard._id, yard.tracks.map(track => ({
          trackId: track._id,
          carCount: 0
        })));
      });

    // Update each car to its home yard's least occupied track
    for (const car of allRollingStock) {
      const yardTracksList = yardTracks.get(car.homeYard);
      if (yardTracksList) {
        // Find the track with the fewest cars
        const leastOccupiedTrack = yardTracksList.reduce((prev, current) => 
          prev.carCount < current.carCount ? prev : current
        );

        // Update the car's location
        await rollingStockCollection.updateOne(
          { _id: new ObjectId(car._id) },
          {
            $set: {
              currentLocation: {
                industryId: car.homeYard,
                trackId: leastOccupiedTrack.trackId
              }
            }
          }
        );

        // Add car to the track's placedCars array
        await industriesCollection.updateOne(
          { _id: new ObjectId(car.homeYard), "tracks._id": leastOccupiedTrack.trackId },
          { 
            $addToSet: { 
              "tracks.$.placedCars": car._id 
            }
          }
        );

        // Increment the car count for the track
        leastOccupiedTrack.carCount++;
      }
    }

    await client.close();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error resetting rolling stock:', error);
    return NextResponse.json({ error: 'Failed to reset rolling stock' }, { status: 500 });
  }
} 