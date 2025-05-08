'use client';

import { Location, Industry, TrainRoute, RollingStock, Block } from '../types/models';
import { BaseService } from './BaseService';

// Generic interface for all services
export interface EntityService<T> {
  getAll(): Promise<T[]>;
}

// Service interfaces with specific additional methods
export interface LocationService extends EntityService<Location> {
  getAllLocations(): Promise<Location[]>;
  updateLocation(id: string, location: Partial<Location>): Promise<Location>;
  createLocation(location: Partial<Location>): Promise<Location>;
  deleteLocation(id: string): Promise<void>;
}

export interface IndustryService extends EntityService<Industry> {
  getAllIndustries(): Promise<Industry[]>;
  updateIndustry(id: string, industry: Partial<Industry>): Promise<Industry>;
  createIndustry(industry: Partial<Industry>): Promise<Industry>;
  deleteIndustry(id: string): Promise<void>;
}

export interface TrainRouteService extends EntityService<TrainRoute> {
  getAllTrainRoutes(): Promise<TrainRoute[]>;
  getTrainRouteById(id: string): Promise<TrainRoute>;
  updateTrainRoute(id: string, trainRoute: Partial<TrainRoute>): Promise<TrainRoute>;
  createTrainRoute(trainRoute: Partial<TrainRoute>): Promise<TrainRoute>;
  deleteTrainRoute(id: string): Promise<void>;
}

export interface RollingStockService extends EntityService<RollingStock> {
  getAllRollingStock(): Promise<RollingStock[]>;
  updateRollingStock(id: string, rollingStock: RollingStock): Promise<void>;
  resetToHomeYards(): Promise<void>;
}

export interface BlockService extends EntityService<Block> {
  getAllBlocks(): Promise<Block[]>;
  getBlockById(id: string): Promise<Block>;
  createBlock(block: Partial<Block>): Promise<Block>;
  updateBlock(id: string, block: Partial<Block>): Promise<Block>;
  deleteBlock(id: string): Promise<void>;
}

export interface LayoutStateData {
  rollingStockState: Record<string, {
    locationId: string;
    industryId?: string;
    trackId?: string;
    status: string;
  }>;
  timestamp: number;
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
  blockService: BlockService;
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

  async updateLocation(id: string, location: Partial<Location>): Promise<Location> {
    const response = await fetch(`${this.endpoint}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(location),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to update location with id ${id}`);
    }
    
    return response.json();
  }

  async createLocation(location: Partial<Location>): Promise<Location> {
    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(location),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to create location`);
    }
    
    return response.json();
  }

  async deleteLocation(id: string): Promise<void> {
    const response = await fetch(`${this.endpoint}/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error(`Failed to delete location with id ${id}`);
    }
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
  
  async getTrainRouteById(id: string): Promise<TrainRoute> {
    const response = await fetch(`${this.endpoint}/${id}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch train route with id ${id}`);
    }
    
    return response.json();
  }

  async updateTrainRoute(id: string, trainRoute: Partial<TrainRoute>): Promise<TrainRoute> {
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

  async createTrainRoute(trainRoute: Partial<TrainRoute>): Promise<TrainRoute> {
    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(trainRoute),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to create train route`);
    }
    
    return response.json();
  }

  async deleteTrainRoute(id: string): Promise<void> {
    const response = await fetch(`${this.endpoint}/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error(`Failed to delete train route with id ${id}`);
    }
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

class BlockServiceImpl extends EntityServiceImpl<Block> implements BlockService {
  constructor() {
    super('/api/blocks');
  }

  async getAllBlocks(): Promise<Block[]> {
    return this.getAll();
  }

  async getBlockById(id: string): Promise<Block> {
    const response = await fetch(`${this.endpoint}/${id}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch block with id ${id}`);
    }
    
    return response.json();
  }

  async updateBlock(id: string, block: Partial<Block>): Promise<Block> {
    const response = await fetch(`${this.endpoint}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(block),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to update block with id ${id}`);
    }
    
    return response.json();
  }

  async createBlock(block: Partial<Block>): Promise<Block> {
    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(block),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to create block`);
    }
    
    return response.json();
  }

  async deleteBlock(id: string): Promise<void> {
    const response = await fetch(`${this.endpoint}/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error(`Failed to delete block with id ${id}`);
    }
  }
}

export const services: ClientServices = {
  locationService: new LocationServiceImpl(),
  industryService: new IndustryServiceImpl(),
  trainRouteService: new TrainRouteServiceImpl(),
  rollingStockService: new RollingStockServiceImpl(),
  layoutStateService: new LayoutStateServiceImpl(),
  blockService: new BlockServiceImpl()
}; 