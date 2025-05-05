'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Location } from '../../types/models';
import { QUERY_KEYS, INVALIDATION_MAP, useServices } from './useQueries';

/**
 * Custom hook for location-related queries and mutations
 */
export const useLocationQueries = () => {
  const queryClient = useQueryClient();
  const { locationService } = useServices();

  /**
   * Fetch all locations
   */
  const useLocations = () => {
    return useQuery<Location[], Error>({
      queryKey: QUERY_KEYS.LOCATIONS,
      queryFn: () => locationService.getAll(),
    });
  };

  /**
   * Fetch a location by ID
   */
  const useLocation = (id: string) => {
    return useQuery<Location, Error>({
      queryKey: QUERY_KEYS.LOCATION(id),
      queryFn: () => locationService.getById(id),
      enabled: !!id,
    });
  };

  /**
   * Create a new location
   */
  const useCreateLocation = () => {
    return useMutation<Location, Error, Omit<Location, '_id'>>({
      mutationFn: (newLocation) => locationService.create(newLocation),
      onSuccess: () => {
        // Invalidate relevant queries
        INVALIDATION_MAP['location:create'].forEach((queryKey) => {
          queryClient.invalidateQueries({ queryKey });
        });
      },
    });
  };

  /**
   * Update an existing location
   */
  const useUpdateLocation = () => {
    return useMutation<
      void, 
      Error, 
      { id: string; location: Partial<Location> }
    >({
      mutationFn: ({ id, location }) => locationService.update(id, location),
      onSuccess: (_, variables) => {
        // Invalidate both collection and individual queries
        INVALIDATION_MAP['location:update'].forEach((queryKey) => {
          queryClient.invalidateQueries({ queryKey });
        });
        queryClient.invalidateQueries({ 
          queryKey: QUERY_KEYS.LOCATION(variables.id) 
        });
      },
    });
  };

  /**
   * Delete a location
   */
  const useDeleteLocation = () => {
    return useMutation<void, Error, string>({
      mutationFn: (id) => locationService.delete(id),
      onSuccess: (_, id) => {
        // Invalidate relevant queries
        INVALIDATION_MAP['location:delete'].forEach((queryKey) => {
          queryClient.invalidateQueries({ queryKey });
        });
        // Remove the specific item from the cache
        queryClient.removeQueries({ queryKey: QUERY_KEYS.LOCATION(id) });
      },
    });
  };

  return {
    useLocations,
    useLocation,
    useCreateLocation,
    useUpdateLocation,
    useDeleteLocation,
  };
}; 