import { getColorClass } from '../RollingStock';

describe('getColorClass', () => {
  it('returns the correct Tailwind color class for known colors', () => {
    expect(getColorClass('red')).toBe('bg-red-600');
    expect(getColorClass('blue')).toBe('bg-blue-600');
    expect(getColorClass('green')).toBe('bg-green-600');
    expect(getColorClass('yellow')).toBe('bg-yellow-400');
    expect(getColorClass('orange')).toBe('bg-orange-500');
    expect(getColorClass('black')).toBe('bg-gray-900');
    expect(getColorClass('brown')).toBe('bg-amber-800');
  });

  it('returns gray as the default for unknown colors', () => {
    expect(getColorClass('pink')).toBe('bg-gray-400');
    expect(getColorClass('teal')).toBe('bg-gray-400');
    expect(getColorClass('cyan')).toBe('bg-gray-400');
    expect(getColorClass('magenta')).toBe('bg-gray-400');
    expect(getColorClass('')).toBe('bg-gray-400');
  });

  it('is case-insensitive', () => {
    expect(getColorClass('RED')).toBe('bg-red-600');
    expect(getColorClass('Blue')).toBe('bg-blue-600');
    expect(getColorClass('gReEn')).toBe('bg-green-600');
    expect(getColorClass('yElLoW')).toBe('bg-yellow-400');
  });
}); 