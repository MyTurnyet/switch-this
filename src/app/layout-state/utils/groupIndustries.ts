import { Location, Industry } from '@/shared/types/models';

interface IndustryGroup {
  locationName: string;
  blocks: {
    [blockName: string]: Industry[];
  };
}

export interface GroupedIndustries {
  [locationId: string]: IndustryGroup;
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

    const block = industry.block || 'Unassigned';
    if (!grouped[industry.locationId].blocks[block]) {
      grouped[industry.locationId].blocks[block] = [];
    }

    grouped[industry.locationId].blocks[block].push(industry);
    return grouped;
  }, {} as GroupedIndustries);
} 