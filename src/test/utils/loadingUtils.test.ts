import { isLoading, hasError } from '@/app/shared/utils/loadingUtils';

describe('loadingUtils', () => {
  describe('isLoading', () => {
    it('returns true if any data is loading', () => {
      expect(isLoading({
        isLoadingLocations: true,
        isLoadingIndustries: false,
        isLoadingTrainRoutes: false,
        locationError: '',
        industryError: '',
        trainRouteError: ''
      })).toBe(true);

      expect(isLoading({
        isLoadingLocations: false,
        isLoadingIndustries: true,
        isLoadingTrainRoutes: false,
        locationError: '',
        industryError: '',
        trainRouteError: ''
      })).toBe(true);

      expect(isLoading({
        isLoadingLocations: false,
        isLoadingIndustries: false,
        isLoadingTrainRoutes: true,
        locationError: '',
        industryError: '',
        trainRouteError: ''
      })).toBe(true);
    });

    it('returns false if no data is loading', () => {
      expect(isLoading({
        isLoadingLocations: false,
        isLoadingIndustries: false,
        isLoadingTrainRoutes: false,
        locationError: '',
        industryError: '',
        trainRouteError: ''
      })).toBe(false);
    });
  });

  describe('hasError', () => {
    it('returns true if any error exists', () => {
      expect(hasError({
        isLoadingLocations: false,
        isLoadingIndustries: false,
        isLoadingTrainRoutes: false,
        locationError: 'Location error',
        industryError: '',
        trainRouteError: ''
      })).toBe(true);

      expect(hasError({
        isLoadingLocations: false,
        isLoadingIndustries: false,
        isLoadingTrainRoutes: false,
        locationError: '',
        industryError: 'Industry error',
        trainRouteError: ''
      })).toBe(true);

      expect(hasError({
        isLoadingLocations: false,
        isLoadingIndustries: false,
        isLoadingTrainRoutes: false,
        locationError: '',
        industryError: '',
        trainRouteError: 'Train route error'
      })).toBe(true);
    });

    it('returns false if no errors exist', () => {
      expect(hasError({
        isLoadingLocations: false,
        isLoadingIndustries: false,
        isLoadingTrainRoutes: false,
        locationError: '',
        industryError: '',
        trainRouteError: ''
      })).toBe(false);
    });
  });
}); 