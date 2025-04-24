import { isLoading, hasError } from '@/app/shared/utils/loadingUtils';

describe('loadingUtils', () => {
  describe('isLoading', () => {
    it('returns true if any loading state is true', () => {
      expect(isLoading({
        isLoadingLocations: true,
        isLoadingIndustries: false,
        isLoadingTrainRoutes: false
      })).toBe(true);

      expect(isLoading({
        isLoadingLocations: false,
        isLoadingIndustries: true,
        isLoadingTrainRoutes: false
      })).toBe(true);

      expect(isLoading({
        isLoadingLocations: false,
        isLoadingIndustries: false,
        isLoadingTrainRoutes: true
      })).toBe(true);
    });

    it('returns false if all loading states are false', () => {
      expect(isLoading({
        isLoadingLocations: false,
        isLoadingIndustries: false,
        isLoadingTrainRoutes: false
      })).toBe(false);
    });
  });

  describe('hasError', () => {
    it('returns true if any error exists', () => {
      expect(hasError({
        locationError: 'Error',
        industryError: null,
        trainRouteError: null
      })).toBe(true);

      expect(hasError({
        locationError: null,
        industryError: 'Error',
        trainRouteError: null
      })).toBe(true);

      expect(hasError({
        locationError: null,
        industryError: null,
        trainRouteError: 'Error'
      })).toBe(true);
    });

    it('returns false if no errors exist', () => {
      expect(hasError({
        locationError: null,
        industryError: null,
        trainRouteError: null
      })).toBe(false);
    });
  });
}); 