interface LoadingState {
  isLoadingLocations: boolean;
  isLoadingIndustries: boolean;
  isLoadingTrainRoutes: boolean;
  locationError: string;
  industryError: string;
  trainRouteError: string;
}

/**
 * Checks if any data is currently being loaded
 * @param state - The loading state object containing boolean flags for each loading state
 * @returns true if any data is being loaded, false otherwise
 */
export const isLoading = (state: LoadingState): boolean => {
  return state.isLoadingLocations || state.isLoadingIndustries || state.isLoadingTrainRoutes;
};

/**
 * Checks if there are any errors present
 * @param state - The error state object containing error messages for each data type
 * @returns true if any error exists, false otherwise
 */
export const hasError = (state: LoadingState): boolean => {
  return Boolean(state.locationError || state.industryError || state.trainRouteError);
}; 