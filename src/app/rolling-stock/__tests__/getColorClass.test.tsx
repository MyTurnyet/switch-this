import { getColorClass } from '../RollingStock';

describe('getColorClass', () => {
  it('returns the correct Tailwind color class for known colors', () => {
    expect(getColorClass('RED')).toBe('bg-red-500');
    expect(getColorClass('BLUE')).toBe('bg-blue-500');
    expect(getColorClass('GREEN')).toBe('bg-green-500');
    expect(getColorClass('YELLOW')).toBe('bg-yellow-500');
    expect(getColorClass('ORANGE')).toBe('bg-orange-500');
    expect(getColorClass('PURPLE')).toBe('bg-purple-500');
    expect(getColorClass('BLACK')).toBe('bg-black');
    expect(getColorClass('WHITE')).toBe('bg-gray-500');
    expect(getColorClass('BROWN')).toBe('bg-stone-700');
    expect(getColorClass('GRAY')).toBe('bg-gray-500');
  });

  it('returns gray as the default for unknown colors', () => {
    expect(getColorClass('PINK')).toBe('bg-gray-500');
    expect(getColorClass('TEAL')).toBe('bg-gray-500');
    expect(getColorClass('CYAN')).toBe('bg-gray-500');
    expect(getColorClass('MAGENTA')).toBe('bg-gray-500');
    expect(getColorClass('')).toBe('bg-gray-500');
  });

  it('is case-insensitive', () => {
    expect(getColorClass('red')).toBe('bg-red-500');
    expect(getColorClass('Blue')).toBe('bg-blue-500');
    expect(getColorClass('gReEn')).toBe('bg-green-500');
    expect(getColorClass('yElLoW')).toBe('bg-yellow-500');
  });
}); 