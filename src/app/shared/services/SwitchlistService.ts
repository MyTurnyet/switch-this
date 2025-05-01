import { Switchlist } from '@/app/shared/types/models';
import { BaseService } from './BaseService';

export class SwitchlistService extends BaseService<Switchlist> {
  constructor() {
    super('/api/switchlists');
  }

  async getAllSwitchlists(): Promise<Switchlist[]> {
    return this.getAll();
  }

  async getSwitchlistById(id: string): Promise<Switchlist> {
    return this.getById(id);
  }

  async createSwitchlist(trainRouteId: string, name: string, notes?: string): Promise<Switchlist> {
    const newSwitchlist: Omit<Switchlist, '_id'> = {
      trainRouteId,
      name,
      createdAt: new Date().toISOString(),
      status: 'CREATED',
      notes,
      ownerId: 'current-user', // This would normally be set by the auth system
    };

    return this.create(newSwitchlist);
  }

  async updateSwitchlist(id: string, updates: Partial<Switchlist>): Promise<Switchlist> {
    const response = await fetch(`${this.endpoint}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to update switchlist with id ${id}`);
    }
    
    return response.json();
  }

  async deleteSwitchlist(id: string): Promise<void> {
    return this.delete(id);
  }

  async updateSwitchlistStatus(id: string, status: Switchlist['status']): Promise<Switchlist> {
    return this.updateSwitchlist(id, { status });
  }
} 