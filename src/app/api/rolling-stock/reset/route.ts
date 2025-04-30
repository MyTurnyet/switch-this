import { NextResponse } from 'next/server';
import { RollingStock, Industry } from '@/app/shared/types/models';
import { MongoClient, ObjectId } from 'mongodb';

export async function POST() {
  console.log('Reset API endpoint called');
  try {
    const client = await MongoClient.connect(process.env.MONGODB_URI!);
    console.log('Connected to MongoDB');
    
    const db = client.db();
    const rollingStockCollection = db.collection('rolling-stock');
    const industriesCollection = db.collection('industries');

    // Get all rolling stock and industries
    const allRollingStock = await rollingStockCollection.find({}).toArray() as unknown as RollingStock[];
    const allIndustries = await industriesCollection.find({}).toArray() as unknown as Industry[];
    
    console.log(`Found ${allRollingStock.length} rolling stock items and ${allIndustries.length} industries`);

    // First, clear all placedCars arrays from all tracks
    const updatePromises = allIndustries.map(industry => 
      industriesCollection.updateOne(
        { _id: typeof industry._id === 'string' ? new ObjectId(industry._id) : industry._id },
        { $set: { "tracks.$[].placedCars": [] } }
      )
    );
    await Promise.all(updatePromises);
    console.log('Cleared placedCars arrays from all tracks');

    // Create a map of yard IDs to their tracks
    const yardTracks = new Map<string, { trackId: string; carCount: number }[]>();
    
    // Initialize the map with all yard tracks
    const yards = allIndustries.filter(industry => industry.industryType === 'YARD');
    const yardsCount = yards.length;
    console.log(`Found ${yardsCount} yards`);
    
    yards.forEach(yard => {
      const yardId = String(yard._id); // Ensure yard ID is a string
      console.log(`Yard: ${yard.name}, ID: ${yardId}, Tracks: ${yard.tracks.length}`);
      
      yardTracks.set(yardId, yard.tracks.map(track => ({
        trackId: String(track._id), // Ensure track ID is a string
        carCount: 0
      })));
    });

    // Update each car to its home yard's least occupied track
    for (const car of allRollingStock) {
      // Ensure homeYard is a string
      const homeYardId = String(car.homeYard);
      const yardTracksList = yardTracks.get(homeYardId);
      
      if (yardTracksList) {
        // Find the track with the fewest cars
        const leastOccupiedTrack = yardTracksList.reduce((prev, current) => 
          prev.carCount < current.carCount ? prev : current
        );

        console.log(`Assigning car ${car.roadName} ${car.roadNumber} (ID: ${car._id}) to yard ID: ${homeYardId}, track ID: ${leastOccupiedTrack.trackId}`);

        // Update the car's location
        await rollingStockCollection.updateOne(
          { _id: typeof car._id === 'string' ? new ObjectId(car._id) : car._id },
          {
            $set: {
              currentLocation: {
                industryId: homeYardId,
                trackId: leastOccupiedTrack.trackId
              }
            }
          }
        );

        // Add car to the track's placedCars array
        await industriesCollection.updateOne(
          { 
            _id: new ObjectId(homeYardId), 
            "tracks._id": leastOccupiedTrack.trackId 
          },
          { 
            $addToSet: { 
              "tracks.$.placedCars": String(car._id) // Always use string IDs for placedCars
            }
          }
        );

        // Increment the car count for the track
        leastOccupiedTrack.carCount++;
      } else {
        console.warn(`No yard with ID ${homeYardId} found for car ${car.roadName} ${car.roadNumber} (ID: ${car._id})`);
      }
    }

    await client.close();
    console.log('Reset operation completed successfully');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error resetting rolling stock:', error);
    return NextResponse.json({ error: 'Failed to reset rolling stock' }, { status: 500 });
  }
} 