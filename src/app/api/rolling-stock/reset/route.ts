import { getMongoService } from "@/lib/services/mongodb.client";
import { RollingStock, Industry, Track } from '@/app/shared/types/models';
import { IMongoDbService } from '@/lib/services/mongodb.interface';
import { Collection, Document, Filter, ObjectId, UpdateFilter } from 'mongodb';

// Create a MongoDB service that will be used throughout this file
const mongoService = getMongoService();

/**
 * POST /api/rolling-stock/reset
 * Resets all rolling stock to their home yards by:
 * 1. Removing all rolling stock from tracks
 * 2. Clearing current location and destination data
 * 3. Placing cars back at their home tracks
 */
export async function POST() {
  try {
    if (typeof mongoService.connect === 'function') {
      await mongoService.connect();
    }
    
    // Get the collections we need to work with
    const rollingStockCollection = mongoService.getRollingStockCollection();
    const industriesCollection = mongoService.getIndustriesCollection();
    
    // Fetch all data
    const { allRollingStock, allIndustries } = await fetchData(rollingStockCollection, industriesCollection);
    
    // Clear all placed cars from industries
    await clearAllPlacedCars(industriesCollection, allIndustries, mongoService);
    
    // Clear current location and destination from all rolling stock
    const resetPromises = allRollingStock.map(car => {
      // Safely convert id to string if it's an ObjectId
      const carId = typeof car._id === 'object' && car._id !== null 
        ? car._id
        : new ObjectId(car._id as string);
        
      return rollingStockCollection.updateOne(
        { _id: carId },
        { 
          $unset: { 
            currentLocation: '',
            destination: ''
          } 
        }
      );
    });
    
    await Promise.all(resetPromises);
    
    // Build map of industries and their tracks
    const industryTracks = buildIndustryTracksMap(allIndustries);
    
    // Assign cars to their home tracks
    await assignCarsToHomeTracks(
      allRollingStock, 
      industryTracks, 
      rollingStockCollection, 
      industriesCollection, 
      mongoService
    );
    
    // Close the connection
    if (typeof mongoService.close === 'function') {
      await mongoService.close();
    }
    
    // Return success
    return new Response(
      JSON.stringify({ success: true, message: 'All rolling stock reset to home yards' }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error resetting rolling stock:', error);
    
    // Make sure to close the connection even if there's an error
    if (mongoService) {
      if (typeof mongoService.close === 'function') {
      await mongoService.close();
    }
    }
    
    return new Response(
      JSON.stringify({ error: 'Failed to reset rolling stock' }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Helper function that safely handles ID conversion
function safeObjectId(id: string | ObjectId, mongoService: IMongoDbService): string | ObjectId {
  if (typeof id !== 'string') {
    return id;
  }
  
  // Check if the ID is a valid MongoDB ObjectId format
  if (/^[0-9a-fA-F]{24}$/.test(id)) {
    try {
      return mongoService.toObjectId(id);
    } catch (error) {
      return id;
    }
  }
  
  // Return as is if it's not in ObjectId format (e.g., UUID)
  return id;
}

async function updateCarLocation(
  car: RollingStock,
  industryId: string,
  trackId: string,
  collection: Collection,
  mongoService: IMongoDbService
) {
  // Update the car with new location
  const query = { _id: typeof car._id === 'string' ? safeObjectId(car._id, mongoService) : car._id };
  return await collection.updateOne(
    query as any,
    { 
      $set: { 
        currentLocation: {
          industryId: industryId,
          trackId: trackId
        },
        // Clear any destination
        destination: null
      } 
    }
  );
}

// Existing functions below

async function fetchData(rollingStockCollection: Collection, industriesCollection: Collection) {
  const allRollingStock = await rollingStockCollection.find({}).toArray() as unknown as RollingStock[];
  const allIndustries = await industriesCollection.find({}).toArray() as unknown as Industry[];
  return { allRollingStock, allIndustries };
}

async function clearAllPlacedCars(industriesCollection: Collection, allIndustries: Industry[], mongoService: IMongoDbService) {
  const updatePromises = allIndustries.map(industry => {
    const query = { _id: typeof industry._id === 'string' ? safeObjectId(industry._id, mongoService) : industry._id };
    return industriesCollection.updateOne(
      query as any,
      { $set: { "tracks.$[].placedCars": [] } }
    );
  });
  await Promise.all(updatePromises);
}

function buildIndustryTracksMap(allIndustries: Industry[]) {
  const industryTracks = new Map<string, { trackId: string; carCount: number; acceptedCarTypes?: string[] }[]>();
  
  const homeIndustries = filterHomeIndustries(allIndustries);
  const homeIndustriesCount = homeIndustries.length;
  console.log(`Found ${homeIndustriesCount} industries that can be home yards (YARD or FREIGHT)`);
  
  homeIndustries.forEach(industry => {
    const industryId = ensureStringId(industry._id);
    console.log(`Industry: ${industry.name}, Type: ${industry.industryType}, ID: ${industryId}, Tracks: ${industry.tracks.length}`);
    
    industryTracks.set(industryId, mapIndustryTracks(industry.tracks));
  });
  
  return industryTracks;
}

function filterHomeIndustries(allIndustries: Industry[]) {
  // Include ALL industry types as valid home yards
  return allIndustries;
}

function ensureStringId(id: string | ObjectId): string {
  return String(id);
}

function mapIndustryTracks(tracks: Track[]) {
  return tracks.map(track => ({
    trackId: ensureStringId(track._id),
    carCount: 0,
    acceptedCarTypes: track.acceptedCarTypes
  }));
}

async function assignCarsToHomeTracks(
  allRollingStock: RollingStock[],
  industryTracks: Map<string, { trackId: string; carCount: number; acceptedCarTypes?: string[] }[]>,
  rollingStockCollection: Collection,
  industriesCollection: Collection,
  mongoService: IMongoDbService
) {
  for (const car of allRollingStock) {
    const homeIndustryId = ensureStringId(car.homeYard);
    const industryTracksList = industryTracks.get(homeIndustryId);
    
    if (industryTracksList) {
      const leastOccupiedTrack = findLeastOccupiedTrack(industryTracksList, car.aarType);

      if (leastOccupiedTrack) {
        console.log(`Assigning car ${car.roadName} ${car.roadNumber} (ID: ${car._id}) to industry ID: ${homeIndustryId}, track ID: ${leastOccupiedTrack.trackId}`);

        await updateCarLocation(
          car, 
          homeIndustryId, 
          leastOccupiedTrack.trackId, 
          rollingStockCollection, 
          mongoService
        );

        await addCarToTrack(
          car._id, 
          homeIndustryId, 
          leastOccupiedTrack.trackId, 
          industriesCollection, 
          mongoService
        );

        leastOccupiedTrack.carCount++;
      } else {
        console.warn(`No eligible track found for car ${car.roadName} ${car.roadNumber} (ID: ${car._id}) in industry ${homeIndustryId}`);
      }
    } else {
      console.warn(`No industry with ID ${homeIndustryId} found for car ${car.roadName} ${car.roadNumber} (ID: ${car._id})`);
    }
  }
}

function findLeastOccupiedTrack(tracksList: { trackId: string; carCount: number; acceptedCarTypes?: string[] }[], carType?: string) {
  if (!tracksList || tracksList.length === 0) {
    return null;
  }
  
  // Filter tracks to those that accept this car type (or have no restrictions)
  const eligibleTracks = !carType ? tracksList : tracksList.filter(track => 
    !track.acceptedCarTypes || // If undefined, accept all
    track.acceptedCarTypes.length === 0 || // If empty array, accept all
    track.acceptedCarTypes.includes(carType)
  );
  
  if (eligibleTracks.length === 0) {
    return null;
  }
  
  // Sort tracks by car count and return the least occupied
  return [...eligibleTracks].sort((a, b) => a.carCount - b.carCount)[0];
}

async function addCarToTrack(
  carId: string | ObjectId, 
  industryId: string, 
  trackId: string, 
  industriesCollection: Collection,
  mongoService: IMongoDbService
) {
  // Add car to industry's track's placedCars array
  const query = { 
    _id: typeof industryId === 'string' ? safeObjectId(industryId, mongoService) : industryId,
    "tracks._id": typeof trackId === 'string' ? safeObjectId(trackId, mongoService) : trackId
  };
  
  const update = { 
    $push: { "tracks.$.placedCars": ensureStringId(carId) } 
  };
  
  return await industriesCollection.updateOne(
    query as any,
    update as any
  );
}
