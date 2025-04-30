import { groupIndustriesByLocationAndBlock } from '../groupIndustries';
import { Location, Industry, IndustryType } from '@/app/shared/types/models';

describe('groupIndustriesByLocationAndBlock', () => {
  it('groups industries by location and block', () => {
    const locations: Location[] = [
      { _id: '1', stationName: 'Station A', block: 'Block 1', ownerId: 'owner1' },
      { _id: '2', stationName: 'Station B', block: 'Block 2', ownerId: 'owner1' }
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
          'Block 1': [
            { _id: '1', name: 'Industry 1', locationId: '1', blockName: 'Block 1', industryType: IndustryType.FREIGHT, tracks: [], ownerId: 'owner1', description: '' },
            { _id: '2', name: 'Industry 2', locationId: '1', blockName: 'Block 1', industryType: IndustryType.FREIGHT, tracks: [], ownerId: 'owner1', description: '' }
          ]
        }
      },
      '2': {
        locationName: 'Station B',
        blocks: {
          'Block 2': [
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