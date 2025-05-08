'use client';

import { Location, Industry, TrainRoute, RollingStock, Block } from '@/app/shared/types/models';
import { BaseEntityService } from './BaseEntityService';
import { LocationService as LocationServiceClass } from './LocationService';
import { BlockService as BlockServiceClass } from './BlockService';

// Base entity service interface
export interface EntityService<T> {
  getAll(): Promise<T[]>;
}

// Location service interface
export interface LocationService extends EntityService<Location> {
  getAllLocations(): Promise<Location[]>;
  updateLocation(id: string, location: Partial<Location>): Promise<Location>;
  createLocation(location: Partial<Location>): Promise<Location>;
  deleteLocation(id: string): Promise<void>;
}

// Industry service interface
export interface IndustryService extends EntityService<Industry> {
  getAllIndustries(): Promise<Industry[]>;
  updateIndustry(id: string, industry: Partial<Industry>): Promise<Industry>;
  createIndustry(industry: Partial<Industry>): Promise<Industry>;
  deleteIndustry(id: string): Promise<void>;
}

// Train route service interface
export interface TrainRouteService extends EntityService<TrainRoute> {
  getAllTrainRoutes(): Promise<TrainRoute[]>;
  getTrainRouteById(id: string): Promise<TrainRoute>;
  updateTrainRoute(id: string, trainRoute: Partial<TrainRoute>): Promise<TrainRoute>;
  createTrainRoute(trainRoute: Partial<TrainRoute>): Promise<TrainRoute>;
  deleteTrainRoute(id: string): Promise<void>;
}

// Rolling stock service interface
export interface RollingStockService extends EntityService<RollingStock> {
  getAllRollingStock(): Promise<RollingStock[]>;
  updateRollingStock(id: string, rollingStock: RollingStock): Promise<void>;
  resetToHomeYards(): Promise<void>;
}

// Block service interface
export interface BlockService extends EntityService<Block> {
  getAllBlocks(): Promise<Block[]>;
  getBlockById(id: string): Promise<Block>;
  createBlock(block: Partial<Block>): Promise<Block>;
  updateBlock(id: string, block: Partial<Block>): Promise<Block>;
  deleteBlock(id: string): Promise<void>;
}

// Layout state interface
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

// Industry service implementation
class IndustryServiceImpl extends BaseEntityService<Industry> implements IndustryService {
  constructor() {
    super('/api/industries', 'industry');
  }

  async getAllIndustries(): Promise<Industry[]> {
    return this.getAll();
  }

  async updateIndustry(id: string, industry: Partial<Industry>): Promise<Industry> {
    return this.update(id, industry);
  }

  async createIndustry(industry: Partial<Industry>): Promise<Industry> {
    return this.create(industry);
  }

  async deleteIndustry(id: string): Promise<void> {
    return this.delete(id);
  }
}

// Train route service implementation
class TrainRouteServiceImpl extends BaseEntityService<TrainRoute> implements TrainRouteService {
  constructor() {
    super('/api/train-routes', 'train route');
  }

  async getAllTrainRoutes(): Promise<TrainRoute[]> {
    return this.getAll();
  }
  
  async getTrainRouteById(id: string): Promise<TrainRoute> {
    return this.getById(id);
  }

  async updateTrainRoute(id: string, trainRoute: Partial<TrainRoute>): Promise<TrainRoute> {
    return this.update(id, trainRoute);
  }

  async createTrainRoute(trainRoute: Partial<TrainRoute>): Promise<TrainRoute> {
    return this.create(trainRoute);
  }

  async deleteTrainRoute(id: string): Promise<void> {
    return this.delete(id);
  }
}

// Rolling stock service implementation
class RollingStockServiceImpl extends BaseEntityService<RollingStock> implements RollingStockService {
  constructor() {
    super('/api/rolling-stock', 'rolling stock');
  }

  async getAllRollingStock(): Promise<RollingStock[]> {
    return this.getAll();
  }

  async updateRollingStock(id: string, rollingStock: RollingStock): Promise<void> {
    await this.update(id, rollingStock);
  }

  async resetToHomeYards(): Promise<void> {
    const response = await fetch(`${this.endpoint}/reset`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to reset rolling stock to home yards');
    }
  }
}

// Layout state service implementation
export class LayoutStateServiceImpl implements LayoutStateService {
  private readonly endpoint = '/api/layout-state';

  async getLayoutState(): Promise<LayoutStateData | null> {
    try {
      const response = await fetch(this.endpoint);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch layout state: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // For test compatibility
      if (data.exists === false) {
        return null;
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching layout state:', error);
      throw error;
    }
  }

  async saveLayoutState(state: LayoutStateData): Promise<LayoutStateData> {
    try {
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
    } catch (error) {
      console.error('Error saving layout state:', error);
      throw error;
    }
  }
}

// Singleton client services instance
const clientServices: ClientServices = {
  locationService: new LocationServiceClass(),
  industryService: new IndustryServiceImpl(),
  trainRouteService: new TrainRouteServiceImpl(),
  rollingStockService: new RollingStockServiceImpl(),
  layoutStateService: new LayoutStateServiceImpl(),
  blockService: new BlockServiceClass(),
};

export default clientServices; 