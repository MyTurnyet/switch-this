import { NextResponse } from 'next/server';
import { RollingStock, Industry } from '@/app/shared/types/models';
import { IMongoDbService } from '@/lib/services/mongodb.interface';
import { MongoDbService } from '@/lib/services/mongodb.service';
import { Collection, ObjectId } from 'mongodb';

// Create a MongoDB service to be used throughout this file
const mongoService: IMongoDbService = new MongoDbService();

type Track = {
  _id: string | ObjectId;
  name: string;
  length: number;
  maxCars: number;
  capacity: number;
  placedCars: string[];
  acceptedCarTypes?: string[];
  ownerId?: string;
};

export async function POST() {
  console.log('Reset API endpoint called');
  
  try {
    await mongoService.connect();
    console.log('Connected to MongoDB');
    
    const rollingStockCollection = mongoService.getRollingStockCollection();
    const industriesCollection = mongoService.getIndustriesCollection();

    const { allRollingStock, allIndustries } = await fetchData(rollingStockCollection, industriesCollection);
    console.log(`Found ${allRollingStock.length} rolling stock items and ${allIndustries.length} industries`);

    await clearAllPlacedCars(industriesCollection, allIndustries, mongoService);
    console.log('Cleared placedCars arrays from all tracks');

    const industryTracks = buildIndustryTracksMap(allIndustries);
    
    await assignCarsToHomeTracks(
      allRollingStock, 
      industryTracks, 
      rollingStockCollection, 
      industriesCollection, 
      mongoService
    );

    await mongoService.close();
    console.log('Reset operation completed successfully');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error resetting rolling stock:', error);
    await mongoService.close();
    return NextResponse.json({ error: 'Failed to reset rolling stock' }, { status: 500 });
  }
}

async function fetchData(rollingStockCollection: Collection, industriesCollection: Collection) {
  const allRollingStock = await rollingStockCollection.find({}).toArray() as unknown as RollingStock[];
  const allIndustries = await industriesCollection.find({}).toArray() as unknown as Industry[];
  return { allRollingStock, allIndustries };
}

async function clearAllPlacedCars(industriesCollection: Collection, allIndustries: Industry[], mongoService: IMongoDbService) {
  const updatePromises = allIndustries.map(industry => 
    industriesCollection.updateOne(
      { _id: typeof industry._id === 'string' ? mongoService.toObjectId(industry._id) : industry._id },
      { $set: { "tracks.$[].placedCars": [] } }
    )
  );
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
  return allIndustries.filter(industry => 
    industry.industryType === 'YARD' || industry.industryType === 'FREIGHT'
  );
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
      console.warn(`No industry with ID ${homeIndustryId} found for car ${car.roadName} ${car.roadNumber} (ID: ${car._id})`);
    }
  }
}

function findLeastOccupiedTrack(tracksList: { trackId: string; carCount: number; acceptedCarTypes?: string[] }[], carType: string) {
  // Filter tracks to those that accept this car type (or have no restrictions)
  const eligibleTracks = tracksList.filter(track => 
    !track.acceptedCarTypes || // If undefined, accept all
    track.acceptedCarTypes.length === 0 || // If empty array, accept all
    track.acceptedCarTypes.includes(carType) // Check if car type is accepted
  );

  if (eligibleTracks.length === 0) {
    // If no eligible tracks, fall back to any track
    console.warn(`No tracks found that accept car type ${carType}. Falling back to any track.`);
    return tracksList.reduce((prev, current) => 
      prev.carCount < current.carCount ? prev : current
    );
  }

  // Return the eligible track with the least cars
  return eligibleTracks.reduce((prev, current) => 
    prev.carCount < current.carCount ? prev : current
  );
}

async function updateCarLocation(
  car: RollingStock, 
  industryId: string,
  trackId: string,
  rollingStockCollection: Collection,
  mongoService: IMongoDbService
) {
  await rollingStockCollection.updateOne(
    { _id: typeof car._id === 'string' ? mongoService.toObjectId(car._id) : car._id },
    {
      $set: {
        currentLocation: {
          industryId,
          trackId
        }
      }
    }
  );
}

async function addCarToTrack(
  carId: string | ObjectId,
  industryId: string,
  trackId: string,
  industriesCollection: Collection,
  mongoService: IMongoDbService
) {
  await industriesCollection.updateOne(
    { 
      _id: mongoService.toObjectId(industryId), 
      "tracks._id": trackId 
    },
    { 
      $addToSet: { 
        "tracks.$.placedCars": ensureStringId(carId)
      }
    }
  );
} 