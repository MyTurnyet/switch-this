import { Industry, RollingStock, Track } from '@/app/shared/types/models';

/**
 * Finds the track with the fewest cars in a list of tracks
 */
export function findLeastOccupiedTrack(tracks: Track[]): Track {
  if (tracks.length === 0) {
    throw new Error('No tracks available');
  }

  return tracks.reduce((leastOccupied, current) => 
    leastOccupied.placedCars.length <= current.placedCars.length 
      ? leastOccupied 
      : current
  );
}

/**
 * Places a car at a specific track in an industry
 * Returns a new industry object with the updated track
 */
export function placeCarAtTrack(
  industry: Industry, 
  trackId: string, 
  car: RollingStock
): Industry {
  const track = industry.tracks.find(t => t._id === trackId);
  if (!track) {
    throw new Error('Track not found');
  }

  if (track.placedCars.length >= track.maxCars) {
    throw new Error('Track is at maximum capacity');
  }

  // Create a new track object with the car added
  const updatedTrack = {
    ...track,
    placedCars: [...track.placedCars, car._id]
  };

  // Create a new industry object with the updated track
  return {
    ...industry,
    tracks: industry.tracks.map(t => t._id === trackId ? updatedTrack : t)
  };
}

/**
 * Updates the car with its new location
 */
export function updateCarLocation(
  car: RollingStock, 
  industryId: string, 
  trackId: string
): RollingStock {
  return {
    ...car,
    currentLocation: {
      industryId,
      trackId
    }
  };
}

/**
 * Initializes the layout state by placing cars at their home yards
 * Returns a new array of industry objects with updated tracks
 */
export function initializeLayoutState(
  industries: Industry[], 
  rollingStock: RollingStock[]
): Industry[] {
  // Create a copy of the industries array
  let updatedIndustries = [...industries];
  
  // Find all yard industries
  const yards = updatedIndustries.filter(industry => industry.industryType === 'YARD');
  
  // Create a map for quick industry lookup
  const industryMap = new Map<string, Industry>();
  updatedIndustries.forEach(industry => {
    industryMap.set(industry._id, { ...industry });
  });
  
  // Process cars that don't have a current location
  for (const car of rollingStock) {
    // Skip if car already has a location
    if (car.currentLocation) {
      continue;
    }
    
    // Find the car's home yard
    const homeYard = yards.find(yard => yard._id === car.homeYard);
    if (!homeYard) {
      console.warn(`Home yard '${car.homeYard}' not found for car ${car.roadName} ${car.roadNumber}`);
      continue;
    }
    
    try {
      // Get the updated yard from the map (in case it's been modified by previous car placements)
      const updatedYard = industryMap.get(homeYard._id);
      if (!updatedYard) {
        throw new Error(`Yard ${homeYard._id} not found in industry map`);
      }
      
      // Find the least occupied track in the home yard
      const leastOccupiedTrack = findLeastOccupiedTrack(updatedYard.tracks);
      
      // Place the car on the track
      const yardWithCarAdded = placeCarAtTrack(updatedYard, leastOccupiedTrack._id, car);
      
      // Update the industry in the map
      industryMap.set(homeYard._id, yardWithCarAdded);
    } catch (error) {
      console.error(`Error placing car ${car.roadName} ${car.roadNumber}:`, error);
    }
  }
  
  // Convert the map back to an array
  return Array.from(industryMap.values());
}

/**
 * Updates all rolling stock objects with their current locations
 * based on the placedCars arrays in the industries
 */
export function syncRollingStockLocations(
  industries: Industry[], 
  rollingStock: RollingStock[]
): RollingStock[] {
  const updatedRollingStock: RollingStock[] = [];
  const carLocations = new Map<string, { industryId: string; trackId: string }>();
  
  // Build a map of car IDs to their locations
  for (const industry of industries) {
    for (const track of industry.tracks) {
      for (const carId of track.placedCars) {
        carLocations.set(carId, {
          industryId: industry._id,
          trackId: track._id
        });
      }
    }
  }
  
  // Update each car with its location
  for (const car of rollingStock) {
    const location = carLocations.get(car._id);
    
    if (location) {
      // Update the car with its location
      updatedRollingStock.push({
        ...car,
        currentLocation: location
      });
    } else {
      // Car is not placed anywhere, create a new object without currentLocation
      const newCar = { ...car };
      if ('currentLocation' in newCar) {
        delete newCar.currentLocation;
      }
      updatedRollingStock.push(newCar);
    }
  }
  
  return updatedRollingStock;
} 