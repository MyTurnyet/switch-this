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
      queryFn: async () => {
        if (!id) throw new Error('Location ID is required');
        const locations = await locationService.getAll();
        const location = locations.find(loc => loc._id === id);
        if (!location) {
          throw new Error(`Location with id ${id} not found`);
        }
        return location;
      },
      enabled: !!id,
    });
  };

  /**
   * Create a new location
   */
  const useCreateLocation = () => {
    // The LocationService doesn't have an explicit create method,
    // so we'll implement a generic approach
    return useMutation<Location, Error, Omit<Location, '_id'>>({
      mutationFn: async (newLocation) => {
        const response = await fetch('/api/locations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newLocation),
        });
        
        if (!response.ok) {
          throw new Error('Failed to create location');
        }
        
        return response.json();
      },
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
      mutationFn: async ({ id, location }) => {
        const response = await fetch(`/api/locations/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(location),
        });
        
        if (!response.ok) {
          throw new Error(`Failed to update location with id ${id}`);
        }
      },
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
      mutationFn: async (id) => {
        const response = await fetch(`/api/locations/${id}`, {
          method: 'DELETE',
        });
        
        if (!response.ok) {
          throw new Error(`Failed to delete location with id ${id}`);
        }
      },
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