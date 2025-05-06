'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Industry } from '../../types/models';
import { QUERY_KEYS, INVALIDATION_MAP, useServices } from './useQueries';

/**
 * Custom hook for industry-related queries and mutations
 */
export const useIndustryQueries = () => {
  const queryClient = useQueryClient();
  const { industryService } = useServices();

  /**
   * Fetch all industries
   */
  const useIndustries = () => {
    return useQuery<Industry[], Error>({
      queryKey: QUERY_KEYS.INDUSTRIES,
      queryFn: () => industryService.getAll(),
    });
  };

  /**
   * Fetch an industry by ID
   */
  const useIndustry = (id: string) => {
    return useQuery<Industry, Error>({
      queryKey: QUERY_KEYS.INDUSTRY(id),
      queryFn: async () => {
        const industries = await industryService.getAllIndustries();
        const industry = industries.find(ind => ind._id === id);
        if (!industry) {
          throw new Error(`Industry with id ${id} not found`);
        }
        return industry;
      },
      enabled: !!id,
    });
  };

  /**
   * Create a new industry
   */
  const useCreateIndustry = () => {
    return useMutation<Industry, Error, Omit<Industry, '_id'>>({
      mutationFn: (newIndustry) => industryService.createIndustry(newIndustry as Partial<Industry>),
      onSuccess: () => {
        // Invalidate relevant queries
        INVALIDATION_MAP['industry:create'].forEach((queryKey) => {
          queryClient.invalidateQueries({ queryKey });
        });
      },
    });
  };

  /**
   * Update an existing industry
   */
  const useUpdateIndustry = () => {
    return useMutation<
      Industry, 
      Error, 
      { id: string; industry: Partial<Industry> }
    >({
      mutationFn: ({ id, industry }) => industryService.updateIndustry(id, industry),
      onSuccess: (_, variables) => {
        // Invalidate both collection and individual queries
        INVALIDATION_MAP['industry:update'].forEach((queryKey) => {
          queryClient.invalidateQueries({ queryKey });
        });
        queryClient.invalidateQueries({ 
          queryKey: QUERY_KEYS.INDUSTRY(variables.id) 
        });
      },
    });
  };

  /**
   * Delete an industry
   */
  const useDeleteIndustry = () => {
    return useMutation<void, Error, string>({
      mutationFn: (id) => industryService.deleteIndustry(id),
      onSuccess: (_, id) => {
        // Invalidate relevant queries
        INVALIDATION_MAP['industry:delete'].forEach((queryKey) => {
          queryClient.invalidateQueries({ queryKey });
        });
        // Remove the specific item from the cache
        queryClient.removeQueries({ queryKey: QUERY_KEYS.INDUSTRY(id) });
      },
    });
  };

  return {
    useIndustries,
    useIndustry,
    useCreateIndustry,
    useUpdateIndustry,
    useDeleteIndustry,
  };
}; 