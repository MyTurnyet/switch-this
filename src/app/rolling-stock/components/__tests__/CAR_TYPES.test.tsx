import { CAR_TYPES } from '../RollingStockForm';

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
    expect(uniqueAarTypes.length).toBe(aarTypes.length);
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
    
    // Check specific boxcar variants
    const hasRegularBoxcar = boxcarTypes.some(
      carType => carType.aarType === 'XM' && carType.description === 'Boxcar'
    );
    const hasHiCubeBoxcar = boxcarTypes.some(
      carType => carType.aarType === 'XMO' && carType.description.includes('Hi-Cube')
    );
    
    expect(hasRegularBoxcar).toBe(true);
    expect(hasHiCubeBoxcar).toBe(true);
  });

  it('has appropriate descriptions for hopper variants', () => {
    const hopperTypes = CAR_TYPES.filter(carType => 
      carType.aarType.startsWith('H') || carType.description.includes('Hopper')
    );
    expect(hopperTypes.length).toBeGreaterThanOrEqual(4);
    
    // Check for coal hopper
    const hasCoalHopper = hopperTypes.some(
      carType => carType.description.includes('Coal')
    );
    
    expect(hasCoalHopper).toBe(true);
  });
}); 