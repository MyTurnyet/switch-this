import { groupIndustriesByLocationAndBlock, groupIndustriesByBlockAndLocation } from '../groupIndustries';
import { Location, Industry, IndustryType, LocationType } from '@/app/shared/types/models';

describe('groupIndustriesByLocationAndBlock', () => {
  it('groups industries by location and block', () => {
    const locations: Location[] = [
      { _id: '1', stationName: 'Station A', block: 'Block 1', ownerId: 'owner1', blockId: 'block1', locationType: LocationType.ON_LAYOUT },
      { _id: '2', stationName: 'Station B', block: 'Block 2', ownerId: 'owner1', blockId: 'block2', locationType: LocationType.ON_LAYOUT }
    ];

    const industries: Industry[] = [
      { _id: '1', name: 'Industry 1', locationId: '1', blockName: 'Block 1', industryType: IndustryType.FREIGHT, tracks: [], ownerId: 'owner1', description: '' },
      { _id: '2', name: 'Industry 2', locationId: '1', blockName: 'Block 1', industryType: IndustryType.FREIGHT, tracks: [], ownerId: 'owner1', description: '' },
      { _id: '3', name: 'Industry 3', locationId: '2', blockName: 'Block 2', industryType: IndustryType.FREIGHT, tracks: [], ownerId: 'owner1', description: '' }
    ];

    const result = groupIndustriesByLocationAndBlock(industries, locations);

    expect(result).toEqual({
      '1': {
        locationName: 'Station A',
        blocks: {
          'block1': [
            { _id: '1', name: 'Industry 1', locationId: '1', blockName: 'Block 1', industryType: IndustryType.FREIGHT, tracks: [], ownerId: 'owner1', description: '' },
            { _id: '2', name: 'Industry 2', locationId: '1', blockName: 'Block 1', industryType: IndustryType.FREIGHT, tracks: [], ownerId: 'owner1', description: '' }
          ]
        }
      },
      '2': {
        locationName: 'Station B',
        blocks: {
          'block2': [
            { _id: '3', name: 'Industry 3', locationId: '2', blockName: 'Block 2', industryType: IndustryType.FREIGHT, tracks: [], ownerId: 'owner1', description: '' }
          ]
        }
      }
    });
  });

  it('handles empty arrays', () => {
    const result = groupIndustriesByLocationAndBlock([], []);
    expect(result).toEqual({});
  });

  it('handles industries with missing locations', () => {
    const industries: Industry[] = [
      { _id: '1', name: 'Industry 1', locationId: '999', blockName: 'Block 1', industryType: IndustryType.FREIGHT, tracks: [], ownerId: 'owner1', description: '' }
    ];
    const locations: Location[] = [];

    const result = groupIndustriesByLocationAndBlock(industries, locations);
    expect(result).toEqual({});
  });
});

describe('groupIndustriesByBlockAndLocation', () => {
  it('groups industries by block and then by location', () => {
    const locations: Location[] = [
      { _id: '1', stationName: 'Station A', block: 'Block 1', ownerId: 'owner1', blockId: 'block1', locationType: LocationType.ON_LAYOUT },
      { _id: '2', stationName: 'Station B', block: 'Block 2', ownerId: 'owner1', blockId: 'block2', locationType: LocationType.ON_LAYOUT },
      { _id: '3', stationName: 'Station C', block: 'Block 1', ownerId: 'owner1', blockId: 'block1', locationType: LocationType.ON_LAYOUT }
    ];

    const industries: Industry[] = [
      { _id: '1', name: 'Industry 1', locationId: '1', blockName: 'Block 1', industryType: IndustryType.FREIGHT, tracks: [], ownerId: 'owner1', description: '' },
      { _id: '2', name: 'Industry 2', locationId: '1', blockName: 'Block 1', industryType: IndustryType.FREIGHT, tracks: [], ownerId: 'owner1', description: '' },
      { _id: '3', name: 'Industry 3', locationId: '2', blockName: 'Block 2', industryType: IndustryType.FREIGHT, tracks: [], ownerId: 'owner1', description: '' },
      { _id: '4', name: 'Industry 4', locationId: '3', blockName: 'Block 1', industryType: IndustryType.FREIGHT, tracks: [], ownerId: 'owner1', description: '' }
    ];

    const result = groupIndustriesByBlockAndLocation(industries, locations);

    expect(result).toEqual({
      'block1': {
        blockName: 'block1',
        locations: {
          '1': {
            locationName: 'Station A',
            industries: [
              { _id: '1', name: 'Industry 1', locationId: '1', blockName: 'Block 1', industryType: IndustryType.FREIGHT, tracks: [], ownerId: 'owner1', description: '' },
              { _id: '2', name: 'Industry 2', locationId: '1', blockName: 'Block 1', industryType: IndustryType.FREIGHT, tracks: [], ownerId: 'owner1', description: '' }
            ]
          },
          '3': {
            locationName: 'Station C',
            industries: [
              { _id: '4', name: 'Industry 4', locationId: '3', blockName: 'Block 1', industryType: IndustryType.FREIGHT, tracks: [], ownerId: 'owner1', description: '' }
            ]
          }
        }
      },
      'block2': {
        blockName: 'block2',
        locations: {
          '2': {
            locationName: 'Station B',
            industries: [
              { _id: '3', name: 'Industry 3', locationId: '2', blockName: 'Block 2', industryType: IndustryType.FREIGHT, tracks: [], ownerId: 'owner1', description: '' }
            ]
          }
        }
      }
    });
  });

  it('handles empty arrays for block grouping', () => {
    const result = groupIndustriesByBlockAndLocation([], []);
    expect(result).toEqual({});
  });

  it('handles industries with missing locations for block grouping', () => {
    const industries: Industry[] = [
      { _id: '1', name: 'Industry 1', locationId: '999', blockName: 'Block 1', industryType: IndustryType.FREIGHT, tracks: [], ownerId: 'owner1', description: '' }
    ];
    const locations: Location[] = [];

    const result = groupIndustriesByBlockAndLocation(industries, locations);
    expect(result).toEqual({});
  });
}); 