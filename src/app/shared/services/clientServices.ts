'use client';

import { Location, Industry, TrainRoute, RollingStock } from '../types/models';
import { BaseService } from './BaseService';

// Generic interface for all services
export interface EntityService<T> {
  getAll(): Promise<T[]>;
}

// Service interfaces with specific additional methods
export interface LocationService extends EntityService<Location> {
  getAllLocations(): Promise<Location[]>;
}

export interface IndustryService extends EntityService<Industry> {
  getAllIndustries(): Promise<Industry[]>;
  updateIndustry(id: string, industry: Partial<Industry>): Promise<Industry>;
  createIndustry(industry: Partial<Industry>): Promise<Industry>;
  deleteIndustry(id: string): Promise<void>;
}

export interface TrainRouteService extends EntityService<TrainRoute> {
  getAllTrainRoutes(): Promise<TrainRoute[]>;
  updateTrainRoute(id: string, trainRoute: TrainRoute): Promise<TrainRoute>;
}

export interface RollingStockService extends EntityService<RollingStock> {
  getAllRollingStock(): Promise<RollingStock[]>;
  updateRollingStock(id: string, rollingStock: RollingStock): Promise<void>;
  resetToHomeYards(): Promise<void>;
}

export interface LayoutStateData {
  _id?: string;
  industries: Industry[];
  rollingStock: RollingStock[];
  updatedAt?: Date;
}

export interface LayoutStateService {
  getLayoutState(): Promise<LayoutStateData | null>;
  saveLayoutState(state: LayoutStateData): Promise<LayoutStateData>;
}

export interface ClientServices {
  locationService: LocationService;
  industryService: IndustryService;
  trainRouteService: TrainRouteService;
  rollingStockService: RollingStockService;
  layoutStateService: LayoutStateService;
}

abstract class EntityServiceImpl<T extends { _id: string }> extends BaseService<T> implements EntityService<T> {
  // The BaseService already has getAll implementation
}

class LocationServiceImpl extends EntityServiceImpl<Location> implements LocationService {
  constructor() {
    super('/api/locations');
  }

  async getAllLocations(): Promise<Location[]> {
    return this.getAll();
  }
}

class IndustryServiceImpl extends EntityServiceImpl<Industry> implements IndustryService {
  constructor() {
    super('/api/industries');
  }

  async getAllIndustries(): Promise<Industry[]> {
    return this.getAll();
  }

  async updateIndustry(id: string, industry: Partial<Industry>): Promise<Industry> {
    const response = await fetch(`${this.endpoint}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(industry),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to update industry with id ${id}`);
    }
    
    return response.json();
  }

  async createIndustry(industry: Partial<Industry>): Promise<Industry> {
    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(industry),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to create industry`);
    }
    
    return response.json();
  }

  async deleteIndustry(id: string): Promise<void> {
    const response = await fetch(`${this.endpoint}/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error(`Failed to delete industry with id ${id}`);
    }
  }
}

class TrainRouteServiceImpl extends EntityServiceImpl<TrainRoute> implements TrainRouteService {
  constructor() {
    super('/api/train-routes');
  }

  async getAllTrainRoutes(): Promise<TrainRoute[]> {
    return this.getAll();
  }
  
  async updateTrainRoute(id: string, trainRoute: TrainRoute): Promise<TrainRoute> {
    const response = await fetch(`${this.endpoint}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(trainRoute),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to update train route with id ${id}`);
    }
    
    return response.json();
  }
}

class RollingStockServiceImpl extends EntityServiceImpl<RollingStock> implements RollingStockService {
  constructor() {
    super('/api/rolling-stock');
  }

  async getAllRollingStock(): Promise<RollingStock[]> {
    return this.getAll();
  }

  async updateRollingStock(id: string, rollingStock: RollingStock): Promise<void> {
    return this.update(id, rollingStock);
  }

  async resetToHomeYards(): Promise<void> {
    const response = await fetch(`${this.endpoint}/reset`, {
      method: 'POST',
    });
    if (!response.ok) {
      throw new Error('Failed to reset rolling stock');
    }
  }
}

export class LayoutStateServiceImpl implements LayoutStateService {
  private readonly endpoint = '/api/layout-state';

  async getLayoutState(): Promise<LayoutStateData | null> {
    const response = await fetch(this.endpoint);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch layout state: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (data.exists === false) {
      return null;
    }
    
    return data;
  }
  
  async saveLayoutState(state: LayoutStateData): Promise<LayoutStateData> {
    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(state),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to save layout state: ${response.statusText}`);
    }
    
    return response.json();
  }
}

export const services: ClientServices = {
  locationService: new LocationServiceImpl(),
  industryService: new IndustryServiceImpl(),
  trainRouteService: new TrainRouteServiceImpl(),
  rollingStockService: new RollingStockServiceImpl(),
  layoutStateService: new LayoutStateServiceImpl()
}; 