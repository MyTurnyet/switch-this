import { BaseEntity } from '@/app/shared/types/models';

/**
 * Base class for all entity services. Provides common CRUD operations
 * to reduce duplication across service implementations.
 */
export abstract class BaseEntityService<T extends BaseEntity> {
  constructor(protected endpoint: string, protected entityName: string = 'item') {}

  /**
   * Get all entities from the API
   */
  async getAll(): Promise<T[]> {
    const response = await fetch(this.endpoint);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${this.entityName}s`);
    }
    return response.json();
  }

  /**
   * Get an entity by ID
   */
  async getById(id: string): Promise<T> {
    const response = await fetch(`${this.endpoint}/${id}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${this.entityName} with id ${id}`);
    }
    return response.json();
  }

  /**
   * Create a new entity
   */
  async create(entity: Partial<T>): Promise<T> {
    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(entity),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || `Failed to create ${this.entityName}`);
    }

    return response.json();
  }

  /**
   * Update an entity by ID
   */
  async update(id: string, entity: Partial<T>): Promise<T> {
    const response = await fetch(`${this.endpoint}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(entity),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || `Failed to update ${this.entityName} with id ${id}`);
    }

    return response.json();
  }

  /**
   * Delete an entity by ID
   */
  async delete(id: string): Promise<void> {
    const response = await fetch(`${this.endpoint}/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || `Failed to delete ${this.entityName} with id ${id}`);
    }
  }

  /**
   * Legacy delete implementation for API routes that use POST with X-HTTP-Method-Override
   */
  async legacyDelete(id: string): Promise<void> {
    const response = await fetch(`${this.endpoint}/${id}`, {
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
        throw new Error(errorData.error || `Failed to delete ${this.entityName} with id ${id}`);
      } catch (parseError) {
        const statusText = response.statusText || 'Unknown error';
        throw new Error(`Failed to delete ${this.entityName}: ${statusText} (${response.status})`);
      }
    }
  }
} 