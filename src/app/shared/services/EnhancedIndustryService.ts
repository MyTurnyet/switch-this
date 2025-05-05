import { Industry } from '@/app/shared/types/models';
import { EnhancedBaseService } from './EnhancedBaseService';

/**
 * Enhanced industry service that extends our base service
 * for consistent error handling and API interactions
 */
export class EnhancedIndustryService extends EnhancedBaseService<Industry> {
  constructor() {
    super('/api/industries');
  }

  /**
   * Get all industries
   */
  async getAllIndustries(): Promise<Industry[]> {
    try {
      return await this.getAll();
    } catch (error) {
      console.error('Error fetching industries:', error);
      throw error;
    }
  }

  /**
   * Get industry by ID
   */
  async getIndustryById(id: string): Promise<Industry> {
    try {
      return await this.getById(id);
    } catch (error) {
      console.error(`Error fetching industry with id ${id}:`, error);
      throw error;
    }
  }

  /**
   * Update an industry
   */
  async updateIndustry(id: string, data: Partial<Industry>): Promise<Industry> {
    try {
      return await this.update(id, data);
    } catch (error) {
      console.error(`Error updating industry with id ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Create an industry
   */
  async createIndustry(data: Partial<Industry>): Promise<Industry> {
    try {
      return await this.create(data as Omit<Industry, '_id'>);
    } catch (error) {
      console.error('Error creating industry:', error);
      throw error;
    }
  }

  /**
   * Delete an industry
   */
  async deleteIndustry(id: string): Promise<void> {
    try {
      await this.delete(id);
    } catch (error) {
      console.error(`Error deleting industry with id ${id}:`, error);
      throw error;
    }
  }
} 