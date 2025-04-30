import { CAR_TYPES } from '../RollingStock';

describe('CAR_TYPES', () => {
  it('has the correct number of car types', () => {
    expect(CAR_TYPES.length).toBe(17);
  });

  it('each car type has both aarType and description properties', () => {
    CAR_TYPES.forEach(carType => {
      expect(carType).toHaveProperty('aarType');
      expect(carType).toHaveProperty('description');
      expect(typeof carType.aarType).toBe('string');
      expect(typeof carType.description).toBe('string');
    });
  });

  it('has unique aarType values', () => {
    const aarTypes = CAR_TYPES.map(carType => carType.aarType);
    // Create an array of unique values instead of using Set
    const uniqueAarTypes = aarTypes.filter((value, index, self) => 
      self.indexOf(value) === index
    );
    expect(aarTypes.length).toBe(uniqueAarTypes.length);
  });

  it('has valid flatcar description for FBC type', () => {
    const fbcType = CAR_TYPES.find(carType => carType.aarType === 'FBC');
    expect(fbcType).toBeDefined();
    expect(fbcType?.description).toBe('Flatcar Centerbeam');
  });

  it('has appropriate descriptions for boxcar variants', () => {
    const boxcarTypes = CAR_TYPES.filter(carType => 
      carType.aarType.startsWith('X')
    );
    expect(boxcarTypes.length).toBeGreaterThanOrEqual(4);
    
    const boxcarDescriptions = boxcarTypes.map(carType => carType.description);
    expect(boxcarDescriptions).toContain('Boxcar');
    expect(boxcarDescriptions).toContain('Boxcar - Hi-Cube');
    expect(boxcarDescriptions).toContain('Boxcar - Beer');
    expect(boxcarDescriptions).toContain('Boxcar - Thrall');
  });

  it('has appropriate descriptions for hopper variants', () => {
    const hopperTypes = CAR_TYPES.filter(carType => 
      carType.aarType.startsWith('H') || carType.description.includes('Hopper')
    );
    expect(hopperTypes.length).toBeGreaterThanOrEqual(4);
    
    const hopperDescriptions = hopperTypes.map(carType => carType.description);
    expect(hopperDescriptions).toContain('Hopper');
    expect(hopperDescriptions).toContain('Hopper - 2-Bay');
    expect(hopperDescriptions).toContain('Hopper - Cylndr');
    expect(hopperDescriptions).toContain('Coal Hopper');
  });
}); 