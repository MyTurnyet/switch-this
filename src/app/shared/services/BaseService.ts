import { fetchWithErrorHandling } from './apiUtils';

export abstract class BaseService<T extends { _id: string }> {
  protected readonly endpoint: string;

  constructor(endpoint: string) {
    this.endpoint = endpoint;
  }

  public async getAll(): Promise<T[]> {
    return fetchWithErrorHandling<T>(this.endpoint);
  }

  public async getById(id: string): Promise<T> {
    const url = `${this.endpoint}/${id}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch ${this.endpoint} with id ${id}: ${response.statusText}`);
    }
    
    return response.json();
  }

  public async update(id: string, data: Partial<T>): Promise<void> {
    const url = `${this.endpoint}/${id}`;
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to update ${this.endpoint} with id ${id}: ${response.statusText}`);
    }
  }

  public async create(data: Omit<T, '_id'>): Promise<T> {
    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to create ${this.endpoint}: ${response.statusText}`);
    }
    
    return response.json();
  }

  public async delete(id: string): Promise<void> {
    const url = `${this.endpoint}/${id}`;
    const response = await fetch(url, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error(`Failed to delete ${this.endpoint} with id ${id}: ${response.statusText}`);
    }
  }
} 