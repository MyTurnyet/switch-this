'use client';

import React, { useState, useEffect } from 'react';
import { Block } from '@/app/shared/types/models';
import { BlockService } from '@/app/shared/services/BlockService';
import { 
  DataTable, 
  Button, 
  useToast,
  ConfirmDialog,
  Card,
  CardHeader,
  CardTitle,
  CardContent
} from '@/app/components/ui';
import { Column } from '@/app/components/ui/data-table';
import { SortDirection } from '@/app/components/ui/data-table';
import EditBlockModal from './EditBlockModal';

export default function BlocksSection() {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [selectedBlock, setSelectedBlock] = useState<Block | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [blockToDelete, setBlockToDelete] = useState<Block | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortColumn, setSortColumn] = useState<string | null>('blockName');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const { toast } = useToast();
  
  const blockService = new BlockService();

  // Fetch data on component mount
  useEffect(() => {
    fetchBlocks();
  }, []);

  // Fetch blocks from API
  const fetchBlocks = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await blockService.getAllBlocks();
      setBlocks(data);
    } catch (err) {
      console.error('Failed to fetch blocks:', err);
      setError('Failed to load block data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Edit block
  const handleEdit = (block: Block) => {
    setSelectedBlock(block);
    setIsModalOpen(true);
  };
  
  // Create new block
  const handleCreate = () => {
    setSelectedBlock(null);
    setIsModalOpen(true);
  };

  // Click on delete button
  const handleDeleteClick = (block: Block) => {
    setBlockToDelete(block);
    setIsDeleteDialogOpen(true);
  };

  // Table columns
  const columns: Column<Record<string, unknown>>[] = [
    {
      key: 'blockName',
      header: 'Block Name',
      sortable: true
    },
    {
      key: 'description',
      header: 'Description',
      accessor: (item: Record<string, unknown>) => {
        const block = item as unknown as Block;
        return block.description || '-';
      }
    },
    {
      key: 'actions',
      header: 'Actions',
      accessor: (item: Record<string, unknown>) => {
        const block = item as unknown as Block;
        return (
          <div className="flex space-x-2">
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => handleEdit(block)}
            >
              Edit
            </Button>
            <Button 
              size="sm" 
              variant="danger"
              onClick={() => handleDeleteClick(block)}
            >
              Delete
            </Button>
          </div>
        );
      }
    }
  ];

  // Sort the data
  const sortedBlocks = [...blocks];
  
  if (sortColumn) {
    sortedBlocks.sort((a, b) => {
      const aValue = a[sortColumn as keyof Block];
      const bValue = b[sortColumn as keyof Block];
      
      if (aValue === undefined || bValue === undefined) return 0;
      
      // String comparison
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue) 
          : bValue.localeCompare(aValue);
      }
      
      return 0;
    });
  }

  // Handle sort change
  const handleSort = (columnId: string, direction: SortDirection) => {
    setSortColumn(columnId);
    setSortDirection(direction);
  };

  // Close modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // Save block (create or update)
  const handleSave = async (updatedBlock: Block): Promise<void> => {
    try {
      if (updatedBlock._id) {
        // Update existing block
        await blockService.updateBlock(updatedBlock._id, updatedBlock);
        setBlocks(prev => 
          prev.map(item => item._id === updatedBlock._id ? updatedBlock : item)
        );
      } else {
        // Create new block
        const newBlock = await blockService.createBlock(updatedBlock);
        setBlocks(prev => [...prev, newBlock]);
      }
      setIsModalOpen(false);
      toast({
        title: updatedBlock._id ? 'Block Updated' : 'Block Created',
        description: `Successfully ${updatedBlock._id ? 'updated' : 'created'} block: ${updatedBlock.blockName}`,
        variant: 'success'
      });
    } catch (error) {
      console.error('Failed to save block:', error);
      toast({
        title: 'Error',
        description: `Failed to save block: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: 'error'
      });
    }
  };

  // Confirm delete
  const handleDeleteConfirm = async () => {
    if (!blockToDelete) return;
    
    try {
      await blockService.deleteBlock(blockToDelete._id);
      setBlocks(prev => prev.filter(block => block._id !== blockToDelete._id));
      toast({
        title: 'Block Deleted',
        description: `Successfully deleted block: ${blockToDelete.blockName}`,
        variant: 'success'
      });
    } catch (error) {
      console.error('Failed to delete block:', error);
      toast({
        title: 'Error',
        description: `Failed to delete block: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: 'error'
      });
    } finally {
      setBlockToDelete(null);
      setIsDeleteDialogOpen(false);
    }
  };

  // Cancel delete
  const handleDeleteCancel = () => {
    setBlockToDelete(null);
    setIsDeleteDialogOpen(false);
  };

  return (
    <Card className="mb-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Blocks</CardTitle>
        <Button onClick={handleCreate}>Add New Block</Button>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="error-message p-4 mb-4 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}
        
        <DataTable
          columns={columns}
          data={sortedBlocks as unknown as Record<string, unknown>[]}
          keyExtractor={(item) => (item as unknown as Block)._id}
          isLoading={loading}
          onSort={handleSort}
          sortColumn={sortColumn || undefined}
          sortDirection={sortDirection}
        />
      </CardContent>
      
      <EditBlockModal
        block={selectedBlock}
        isOpen={isModalOpen}
        onSave={handleSave}
        onCancel={handleCloseModal}
      />
      
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        title={`Delete Block: ${blockToDelete?.blockName}`}
        description="Are you sure you want to delete this block? This action cannot be undone. Note: You cannot delete blocks that are used by locations."
        onConfirm={handleDeleteConfirm}
        onClose={handleDeleteCancel}
      />
    </Card>
  );
} 