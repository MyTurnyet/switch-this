'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Block } from '../../types/models';
import { QUERY_KEYS, INVALIDATION_MAP } from './useQueries';
import { BlockService } from '../../services/BlockService';

/**
 * Custom hook for block-related queries and mutations
 */
export const useBlockQueries = () => {
  const queryClient = useQueryClient();
  const blockService = new BlockService();

  /**
   * Fetch all blocks
   */
  const useBlocks = () => {
    return useQuery<Block[], Error>({
      queryKey: QUERY_KEYS.BLOCKS,
      queryFn: () => blockService.getAllBlocks(),
    });
  };

  /**
   * Fetch a block by ID
   */
  const useBlock = (id: string) => {
    return useQuery<Block, Error>({
      queryKey: QUERY_KEYS.BLOCK(id),
      queryFn: async () => {
        if (!id) throw new Error('Block ID is required');
        return blockService.getBlockById(id);
      },
      enabled: !!id,
    });
  };

  /**
   * Create a new block
   */
  const useCreateBlock = () => {
    return useMutation<Block, Error, Omit<Block, '_id'>>({
      mutationFn: (newBlock) => blockService.createBlock(newBlock),
      onSuccess: () => {
        // Invalidate relevant queries
        INVALIDATION_MAP['block:create'].forEach((queryKey) => {
          queryClient.invalidateQueries({ queryKey });
        });
      },
    });
  };

  /**
   * Update an existing block
   */
  const useUpdateBlock = () => {
    return useMutation<
      Block, 
      Error, 
      { id: string; block: Partial<Block> }
    >({
      mutationFn: ({ id, block }) => blockService.updateBlock(id, block),
      onSuccess: (_, variables) => {
        // Invalidate both collection and individual queries
        INVALIDATION_MAP['block:update'].forEach((queryKey) => {
          queryClient.invalidateQueries({ queryKey });
        });
        queryClient.invalidateQueries({ 
          queryKey: QUERY_KEYS.BLOCK(variables.id) 
        });
      },
    });
  };

  /**
   * Delete a block
   */
  const useDeleteBlock = () => {
    return useMutation<void, Error, string>({
      mutationFn: (id) => blockService.deleteBlock(id),
      onSuccess: (_, id) => {
        // Invalidate relevant queries
        INVALIDATION_MAP['block:delete'].forEach((queryKey) => {
          queryClient.invalidateQueries({ queryKey });
        });
        // Remove the specific item from the cache
        queryClient.removeQueries({ queryKey: QUERY_KEYS.BLOCK(id) });
      },
    });
  };

  return {
    useBlocks,
    useBlock,
    useCreateBlock,
    useUpdateBlock,
    useDeleteBlock,
  };
}; 