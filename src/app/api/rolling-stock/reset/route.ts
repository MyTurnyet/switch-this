import { NextResponse } from 'next/server';
import { RollingStock, Industry } from '@/app/shared/types/models';
import { getMongoDbService } from '@/lib/services/mongodb.provider';

export async function POST() {
  console.log('Reset API endpoint called');
  const mongoService = getMongoDbService();
  
  try {
    await mongoService.connect();
    console.log('Connected to MongoDB');
    
    const rollingStockCollection = mongoService.getRollingStockCollection();
    const industriesCollection = mongoService.getIndustriesCollection();

    // Get all rolling stock and industries
    const allRollingStock = await rollingStockCollection.find({}).toArray() as unknown as RollingStock[];
    const allIndustries = await industriesCollection.find({}).toArray() as unknown as Industry[];
    
    console.log(`Found ${allRollingStock.length} rolling stock items and ${allIndustries.length} industries`);

    // First, clear all placedCars arrays from all tracks
    const updatePromises = allIndustries.map(industry => 
      industriesCollection.updateOne(
        { _id: typeof industry._id === 'string' ? mongoService.toObjectId(industry._id) : industry._id },
        { $set: { "tracks.$[].placedCars": [] } }
      )
    );
    await Promise.all(updatePromises);
    console.log('Cleared placedCars arrays from all tracks');

    // Create a map of industry IDs to their tracks (both YARD and FREIGHT types)
    const industryTracks = new Map<string, { trackId: string; carCount: number }[]>();
    
    // Initialize the map with all industry tracks that can be home yards
    const homeIndustries = allIndustries.filter(industry => 
      industry.industryType === 'YARD' || industry.industryType === 'FREIGHT'
    );
    const homeIndustriesCount = homeIndustries.length;
    console.log(`Found ${homeIndustriesCount} industries that can be home yards (YARD or FREIGHT)`);
    
    homeIndustries.forEach(industry => {
      const industryId = String(industry._id); // Ensure industry ID is a string
      console.log(`Industry: ${industry.name}, Type: ${industry.industryType}, ID: ${industryId}, Tracks: ${industry.tracks.length}`);
      
      industryTracks.set(industryId, industry.tracks.map(track => ({
        trackId: String(track._id), // Ensure track ID is a string
        carCount: 0
      })));
    });

    // Update each car to its home industry's least occupied track
    for (const car of allRollingStock) {
      // Ensure homeYard is a string
      const homeIndustryId = String(car.homeYard);
      const industryTracksList = industryTracks.get(homeIndustryId);
      
      if (industryTracksList) {
        // Find the track with the fewest cars
        const leastOccupiedTrack = industryTracksList.reduce((prev, current) => 
          prev.carCount < current.carCount ? prev : current
        );

        console.log(`Assigning car ${car.roadName} ${car.roadNumber} (ID: ${car._id}) to industry ID: ${homeIndustryId}, track ID: ${leastOccupiedTrack.trackId}`);

        // Update the car's location
        await rollingStockCollection.updateOne(
          { _id: typeof car._id === 'string' ? mongoService.toObjectId(car._id) : car._id },
          {
            $set: {
              currentLocation: {
                industryId: homeIndustryId,
                trackId: leastOccupiedTrack.trackId
              }
            }
          }
        );

        // Add car to the track's placedCars array
        await industriesCollection.updateOne(
          { 
            _id: mongoService.toObjectId(homeIndustryId), 
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
        console.warn(`No industry with ID ${homeIndustryId} found for car ${car.roadName} ${car.roadNumber} (ID: ${car._id})`);
      }
    }

    await mongoService.close();
    console.log('Reset operation completed successfully');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error resetting rolling stock:', error);
    await mongoService.close();
    return NextResponse.json({ error: 'Failed to reset rolling stock' }, { status: 500 });
  }
} 