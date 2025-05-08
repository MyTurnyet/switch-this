import { Block } from '@/app/shared/types/models';

export class BlockService {
  async getAllBlocks(): Promise<Block[]> {
    const response = await fetch('/api/blocks');
    if (!response.ok) {
      throw new Error('Failed to fetch blocks');
    }
    return response.json();
  }

  async getBlockById(id: string): Promise<Block> {
    const response = await fetch(`/api/blocks/${id}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch block with id ${id}`);
    }
    return response.json();
  }

  async createBlock(block: Partial<Block>): Promise<Block> {
    const response = await fetch('/api/blocks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(block),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create block');
    }

    return response.json();
  }

  async updateBlock(id: string, block: Partial<Block>): Promise<Block> {
    const response = await fetch(`/api/blocks/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(block),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `Failed to update block with id ${id}`);
    }

    return response.json();
  }

  async deleteBlock(id: string): Promise<void> {
    const response = await fetch(`/api/blocks/${id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'X-HTTP-Method-Override': 'DELETE'
      },
      credentials: 'same-origin'
    });

    if (!response.ok) {
      try {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to delete block with id ${id}`);
      } catch (parseError) {
        const statusText = response.statusText || 'Unknown error';
        throw new Error(`Failed to delete block: ${statusText} (${response.status})`);
      }
    }
  }
} 