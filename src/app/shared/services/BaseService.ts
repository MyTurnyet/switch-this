import { fetchWithErrorHandling } from './apiUtils';

export abstract class BaseService<T> {
  protected endpoint: string;

  constructor(endpoint: string) {
    this.endpoint = endpoint;
  }

  public async getAll(): Promise<T[]> {
    return fetchWithErrorHandling<T>(this.endpoint);
  }

  public async getById(id: string): Promise<T> {
    const response = await fetch(`${this.endpoint}/${id}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${this.endpoint} with id ${id}`);
    }
    return response.json();
  }

  public async update(id: string, data: T): Promise<void> {
    const response = await fetch(`${this.endpoint}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`Failed to update ${this.endpoint} with id ${id}`);
    }
  }

  public async create(data: T): Promise<T> {
    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`Failed to create ${this.endpoint}`);
    }
    return response.json();
  }

  public async delete(id: string): Promise<void> {
    const response = await fetch(`${this.endpoint}/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`Failed to delete ${this.endpoint} with id ${id}`);
    }
  }
} 