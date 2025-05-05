'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TrainRoute } from '../../types/models';
import { QUERY_KEYS, INVALIDATION_MAP, useServices } from './useQueries';

/**
 * Custom hook for train route-related queries and mutations
 */
export const useTrainRouteQueries = () => {
  const queryClient = useQueryClient();
  const { trainRouteService } = useServices();

  /**
   * Fetch all train routes
   */
  const useTrainRoutes = () => {
    return useQuery<TrainRoute[], Error>({
      queryKey: QUERY_KEYS.TRAIN_ROUTES,
      queryFn: () => trainRouteService.getAll(),
    });
  };

  /**
   * Fetch a train route by ID
   */
  const useTrainRoute = (id: string) => {
    return useQuery<TrainRoute, Error>({
      queryKey: QUERY_KEYS.TRAIN_ROUTE(id),
      queryFn: () => trainRouteService.getById(id),
      enabled: !!id,
    });
  };

  /**
   * Create a new train route
   */
  const useCreateTrainRoute = () => {
    return useMutation<TrainRoute, Error, Omit<TrainRoute, '_id'>>({
      mutationFn: (newRoute) => trainRouteService.create(newRoute),
      onSuccess: () => {
        // Invalidate relevant queries
        queryClient.invalidateQueries({ 
          queryKey: QUERY_KEYS.TRAIN_ROUTES 
        });
      },
    });
  };

  /**
   * Update an existing train route
   */
  const useUpdateTrainRoute = () => {
    return useMutation<
      void, 
      Error, 
      { id: string; trainRoute: Partial<TrainRoute> }
    >({
      mutationFn: ({ id, trainRoute }) => trainRouteService.update(id, trainRoute),
      onSuccess: (_, variables) => {
        // Invalidate both collection and individual queries
        INVALIDATION_MAP['trainRoute:update'].forEach((queryKey) => {
          queryClient.invalidateQueries({ queryKey });
        });
        queryClient.invalidateQueries({ 
          queryKey: QUERY_KEYS.TRAIN_ROUTE(variables.id) 
        });
      },
    });
  };

  /**
   * Delete a train route
   */
  const useDeleteTrainRoute = () => {
    return useMutation<void, Error, string>({
      mutationFn: (id) => trainRouteService.delete(id),
      onSuccess: (_, id) => {
        // Invalidate relevant queries
        queryClient.invalidateQueries({ 
          queryKey: QUERY_KEYS.TRAIN_ROUTES 
        });
        // Remove the specific item from the cache
        queryClient.removeQueries({ 
          queryKey: QUERY_KEYS.TRAIN_ROUTE(id) 
        });
      },
    });
  };

  return {
    useTrainRoutes,
    useTrainRoute,
    useCreateTrainRoute,
    useUpdateTrainRoute,
    useDeleteTrainRoute,
  };
}; 