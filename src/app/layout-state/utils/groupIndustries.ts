import { Location, Industry } from '@/app/shared/types/models';

interface IndustryGroup {
  locationName: string;
  blocks: {
    [blockName: string]: Industry[];
  };
}

export interface GroupedIndustries {
  [locationId: string]: IndustryGroup;
}

// Interface for the new block-first grouping structure
export interface BlockGroup {
  blockName: string;
  locations: {
    [locationId: string]: {
      locationName: string;
      industries: Industry[];
    };
  };
}

export interface GroupedByBlockAndLocation {
  [blockName: string]: BlockGroup;
}

export function groupIndustriesByLocationAndBlock(
  industries: Industry[],
  locations: Location[]
): GroupedIndustries {
  const locationMap = new Map(locations.map(loc => [loc._id, loc]));
  
  // Start with an empty result object
  const result: GroupedIndustries = {};
  
  // First, make sure every location has an entry
  locations.forEach(location => {
    if (!result[location._id]) {
      result[location._id] = {
        locationName: location.stationName,
        blocks: {}
      };
    }
  });
  
  // Then add all industries to their respective locations and blocks
  industries.forEach(industry => {
    const location = locationMap.get(industry.locationId);
    if (!location) return;

    if (!result[industry.locationId]) {
      result[industry.locationId] = {
        locationName: location.stationName,
        blocks: {}
      };
    }

    const block = location.block;
    if (!result[industry.locationId].blocks[block]) {
      result[industry.locationId].blocks[block] = [];
    }

    result[industry.locationId].blocks[block].push(industry);
  });
  
  return result;
} 

export function groupIndustriesByBlockAndLocation(
  industries: Industry[],
  locations: Location[]
): GroupedByBlockAndLocation {
  const locationMap = new Map(locations.map(loc => [loc._id, loc]));
  
  // Start with an empty result object
  const result: GroupedByBlockAndLocation = {};
  
  // First, make sure every location has an entry
  locations.forEach(location => {
    const blockName = location.block;
    
    // Create block entry if it doesn't exist
    if (!result[blockName]) {
      result[blockName] = {
        blockName,
        locations: {}
      };
    }
    
    // Create location entry if it doesn't exist
    if (!result[blockName].locations[location._id]) {
      result[blockName].locations[location._id] = {
        locationName: location.stationName,
        industries: []
      };
    }
  });
  
  // Then add all industries to their respective locations
  industries.forEach(industry => {
    const location = locationMap.get(industry.locationId);
    if (!location) return;
    
    const blockName = location.block;
    
    // This should already exist from the initialization above,
    // but just in case, create it if it doesn't
    if (!result[blockName]) {
      result[blockName] = {
        blockName,
        locations: {}
      };
    }
    
    if (!result[blockName].locations[location._id]) {
      result[blockName].locations[location._id] = {
        locationName: location.stationName,
        industries: []
      };
    }
    
    // Add the industry to the location
    result[blockName].locations[location._id].industries.push(industry);
  });
  
  return result;
} 