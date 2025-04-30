import { NextResponse } from 'next/server';
import { RollingStock, Industry } from '@/app/shared/types/models';
import { getMongoDbService } from '@/lib/services/mongodb.provider';
import { Collection, ObjectId } from 'mongodb';

type MongoService = {
  connect: () => Promise<void>;
  close: () => Promise<void>;
  getRollingStockCollection: () => Collection;
  getIndustriesCollection: () => Collection;
  toObjectId: (id: string) => ObjectId;
};

type Track = {
  _id: string | ObjectId;
  name: string;
  length: number;
  placedCars: string[];
};

export async function POST() {
  console.log('Reset API endpoint called');
  const mongoService = getMongoDbService() as MongoService;
  
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

async function clearAllPlacedCars(industriesCollection: Collection, allIndustries: Industry[], mongoService: MongoService) {
  const updatePromises = allIndustries.map(industry => 
    industriesCollection.updateOne(
      { _id: typeof industry._id === 'string' ? mongoService.toObjectId(industry._id) : industry._id },
      { $set: { "tracks.$[].placedCars": [] } }
    )
  );
  await Promise.all(updatePromises);
}

function buildIndustryTracksMap(allIndustries: Industry[]) {
  const industryTracks = new Map<string, { trackId: string; carCount: number }[]>();
  
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
    carCount: 0
  }));
}

async function assignCarsToHomeTracks(
  allRollingStock: RollingStock[],
  industryTracks: Map<string, { trackId: string; carCount: number }[]>,
  rollingStockCollection: Collection,
  industriesCollection: Collection,
  mongoService: MongoService
) {
  for (const car of allRollingStock) {
    const homeIndustryId = ensureStringId(car.homeYard);
    const industryTracksList = industryTracks.get(homeIndustryId);
    
    if (industryTracksList) {
      const leastOccupiedTrack = findLeastOccupiedTrack(industryTracksList);

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

function findLeastOccupiedTrack(tracksList: { trackId: string; carCount: number }[]) {
  return tracksList.reduce((prev, current) => 
    prev.carCount < current.carCount ? prev : current
  );
}

async function updateCarLocation(
  car: RollingStock, 
  industryId: string,
  trackId: string,
  rollingStockCollection: Collection,
  mongoService: MongoService
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
  mongoService: MongoService
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