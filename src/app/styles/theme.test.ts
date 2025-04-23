import { theme } from './theme';

describe('Theme', () => {
  it('has all required color palettes', () => {
    expect(theme.palette.primary).toBeDefined();
    expect(theme.palette.secondary).toBeDefined();
    expect(theme.palette.background).toBeDefined();
  });

  it('has valid color values', () => {
    // Test primary colors
    expect(theme.palette.primary.main).toMatch(/^#[0-9A-Fa-f]{6}$/);
    
    // Test secondary colors
    expect(theme.palette.secondary.main).toMatch(/^#[0-9A-Fa-f]{6}$/);
    
    // Test background colors
    expect(theme.palette.background.default).toMatch(/^#[0-9A-Fa-f]{6}$/);
  });

  it('has valid typography', () => {
    expect(theme.typography.fontFamily).toBeDefined();
    expect(theme.typography.fontFamily).toContain('Inter');
  });

  it('has valid component overrides', () => {
    const buttonRoot = theme.components?.MuiButton?.styleOverrides?.root;
    expect(buttonRoot).toBeDefined();
    expect(typeof buttonRoot === 'object' && buttonRoot !== null && 'textTransform' in buttonRoot).toBe(true);
  });
}); 