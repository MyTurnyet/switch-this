import { getColorClass } from '../RollingStock';

describe('getColorClass', () => {
  it('returns the correct Tailwind color class for known colors', () => {
    expect(getColorClass('RED')).toBe('red');
    expect(getColorClass('BLUE')).toBe('blue');
    expect(getColorClass('GREEN')).toBe('green');
    expect(getColorClass('YELLOW')).toBe('yellow');
    expect(getColorClass('ORANGE')).toBe('orange');
    expect(getColorClass('PURPLE')).toBe('purple');
    expect(getColorClass('BLACK')).toBe('black');
    expect(getColorClass('WHITE')).toBe('gray');
    expect(getColorClass('BROWN')).toBe('stone');
    expect(getColorClass('GRAY')).toBe('gray');
  });

  it('returns gray as the default for unknown colors', () => {
    expect(getColorClass('PINK')).toBe('gray');
    expect(getColorClass('TEAL')).toBe('gray');
    expect(getColorClass('CYAN')).toBe('gray');
    expect(getColorClass('MAGENTA')).toBe('gray');
    expect(getColorClass('')).toBe('gray');
  });

  it('is case-insensitive', () => {
    expect(getColorClass('red')).toBe('red');
    expect(getColorClass('Blue')).toBe('blue');
    expect(getColorClass('gReEn')).toBe('green');
    expect(getColorClass('yElLoW')).toBe('yellow');
  });
}); 