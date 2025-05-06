'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { RollingStock } from '../../types/models';
import { QUERY_KEYS, INVALIDATION_MAP, useServices } from './useQueries';

/**
 * Custom hook for rolling stock-related queries and mutations
 */
export const useRollingStockQueries = () => {
  const queryClient = useQueryClient();
  const { rollingStockService } = useServices();

  /**
   * Fetch all rolling stock items
   */
  const useRollingStockList = () => {
    return useQuery<RollingStock[], Error>({
      queryKey: QUERY_KEYS.ROLLING_STOCK,
      queryFn: () => rollingStockService.getAll(),
    });
  };

  /**
   * Fetch a rolling stock item by ID
   */
  const useRollingStockItem = (id: string) => {
    return useQuery<RollingStock, Error>({
      queryKey: QUERY_KEYS.ROLLING_STOCK_ITEM(id),
      queryFn: async () => {
        const allItems = await rollingStockService.getAllRollingStock();
        const item = allItems.find(item => item._id === id);
        if (!item) {
          throw new Error(`Rolling stock with id ${id} not found`);
        }
        return item;
      },
      enabled: !!id,
    });
  };

  /**
   * Create a new rolling stock item
   */
  const useCreateRollingStock = () => {
    return useMutation<RollingStock, Error, Omit<RollingStock, '_id'>>({
      mutationFn: async (newItem) => {
        const response = await fetch('/api/rolling-stock', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newItem),
        });
        
        if (!response.ok) {
          throw new Error('Failed to create rolling stock item');
        }
        
        return response.json();
      },
      onSuccess: () => {
        // Invalidate relevant queries
        queryClient.invalidateQueries({ 
          queryKey: QUERY_KEYS.ROLLING_STOCK 
        });
      },
    });
  };

  /**
   * Update an existing rolling stock item
   */
  const useUpdateRollingStock = () => {
    return useMutation<
      void, 
      Error, 
      { id: string; rollingStock: Partial<RollingStock> }
    >({
      mutationFn: ({ id, rollingStock }) => 
        rollingStockService.updateRollingStock(id, rollingStock as RollingStock),
      onSuccess: (_, variables) => {
        // Invalidate both collection and individual queries
        INVALIDATION_MAP['rollingStock:update'].forEach((queryKey) => {
          queryClient.invalidateQueries({ queryKey });
        });
        queryClient.invalidateQueries({ 
          queryKey: QUERY_KEYS.ROLLING_STOCK_ITEM(variables.id) 
        });
      },
    });
  };

  /**
   * Reset all rolling stock to home yards
   */
  const useResetRollingStock = () => {
    return useMutation<void, Error, void>({
      mutationFn: () => rollingStockService.resetToHomeYards(),
      onSuccess: () => {
        // Invalidate rolling stock queries
        INVALIDATION_MAP['rollingStock:reset'].forEach((queryKey) => {
          queryClient.invalidateQueries({ queryKey });
        });
      },
    });
  };

  return {
    useRollingStockList,
    useRollingStockItem,
    useCreateRollingStock,
    useUpdateRollingStock,
    useResetRollingStock,
  };
}; 