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
  
  return industries.reduce((grouped, industry) => {
    const location = locationMap.get(industry.locationId);
    if (!location) return grouped;

    if (!grouped[industry.locationId]) {
      grouped[industry.locationId] = {
        locationName: location.stationName,
        blocks: {}
      };
    }

    const block = location.block;
    if (!grouped[industry.locationId].blocks[block]) {
      grouped[industry.locationId].blocks[block] = [];
    }

    grouped[industry.locationId].blocks[block].push(industry);
    return grouped;
  }, {} as GroupedIndustries);
} 

export function groupIndustriesByBlockAndLocation(
  industries: Industry[],
  locations: Location[]
): GroupedByBlockAndLocation {
  const locationMap = new Map(locations.map(loc => [loc._id, loc]));
  
  return industries.reduce((grouped, industry) => {
    const location = locationMap.get(industry.locationId);
    if (!location) return grouped;
    
    const blockName = location.block;
    
    // Create block entry if it doesn't exist
    if (!grouped[blockName]) {
      grouped[blockName] = {
        blockName,
        locations: {}
      };
    }
    
    // Create location entry if it doesn't exist
    if (!grouped[blockName].locations[location._id]) {
      grouped[blockName].locations[location._id] = {
        locationName: location.stationName,
        industries: []
      };
    }
    
    // Add the industry to the location
    grouped[blockName].locations[location._id].industries.push(industry);
    
    return grouped;
  }, {} as GroupedByBlockAndLocation);
} 