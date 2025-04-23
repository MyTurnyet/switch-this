import { theme } from './theme';

describe('Theme', () => {
  it('has all required color palettes', () => {
    expect(theme.colors.primary).toBeDefined();
    expect(theme.colors.secondary).toBeDefined();
    expect(theme.colors.accent).toBeDefined();
    expect(theme.colors.background).toBeDefined();
    expect(theme.colors.text).toBeDefined();
  });

  it('has valid color values', () => {
    // Test primary colors
    expect(theme.colors.primary.main).toMatch(/^#[0-9A-Fa-f]{6}$/);
    expect(theme.colors.primary.light).toMatch(/^#[0-9A-Fa-f]{6}$/);
    expect(theme.colors.primary.dark).toMatch(/^#[0-9A-Fa-f]{6}$/);
    expect(theme.colors.primary.contrast).toMatch(/^#[0-9A-Fa-f]{6}$/);

    // Test secondary colors
    expect(theme.colors.secondary.main).toMatch(/^#[0-9A-Fa-f]{6}$/);
    expect(theme.colors.secondary.light).toMatch(/^#[0-9A-Fa-f]{6}$/);
    expect(theme.colors.secondary.dark).toMatch(/^#[0-9A-Fa-f]{6}$/);
    expect(theme.colors.secondary.contrast).toMatch(/^#[0-9A-Fa-f]{6}$/);
  });

  it('has valid spacing values', () => {
    expect(theme.spacing.xs).toMatch(/^\d+\.?\d*rem$/);
    expect(theme.spacing.sm).toMatch(/^\d+\.?\d*rem$/);
    expect(theme.spacing.md).toMatch(/^\d+\.?\d*rem$/);
    expect(theme.spacing.lg).toMatch(/^\d+\.?\d*rem$/);
    expect(theme.spacing.xl).toMatch(/^\d+\.?\d*rem$/);
  });

  it('has valid border radius values', () => {
    expect(theme.borderRadius.sm).toMatch(/^\d+\.?\d*rem$/);
    expect(theme.borderRadius.md).toMatch(/^\d+\.?\d*rem$/);
    expect(theme.borderRadius.lg).toMatch(/^\d+\.?\d*rem$/);
  });

  it('has valid shadow values', () => {
    expect(theme.shadows.sm).toMatch(/^0 \d+px \d+px 0 rgba\(\d+, \d+, \d+, \d+\.?\d*\)$/);
    expect(theme.shadows.md).toMatch(/^0 \d+px \d+px -\d+px rgba\(\d+, \d+, \d+, \d+\.?\d*\), 0 \d+px \d+px -\d+px rgba\(\d+, \d+, \d+, \d+\.?\d*\)$/);
    expect(theme.shadows.lg).toMatch(/^0 \d+px \d+px -\d+px rgba\(\d+, \d+, \d+, \d+\.?\d*\), 0 \d+px \d+px -\d+px rgba\(\d+, \d+, \d+, \d+\.?\d*\)$/);
  });
}); 