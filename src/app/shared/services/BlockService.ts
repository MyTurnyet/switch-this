import { Block } from '@/app/shared/types/models';
import { BaseEntityService } from './BaseEntityService';

export class BlockService extends BaseEntityService<Block> {
  constructor() {
    super('/api/blocks', 'block');
  }

  async getAllBlocks(): Promise<Block[]> {
    return this.getAll();
  }

  async getBlockById(id: string): Promise<Block> {
    return this.getById(id);
  }

  async createBlock(block: Partial<Block>): Promise<Block> {
    return this.create(block);
  }

  async updateBlock(id: string, block: Partial<Block>): Promise<Block> {
    return this.update(id, block);
  }

  async deleteBlock(id: string): Promise<void> {
    return this.legacyDelete(id); // Using legacy delete for backward compatibility
  }
} 