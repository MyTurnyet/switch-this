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
}

export interface TrainRouteService extends EntityService<TrainRoute> {
  getAllTrainRoutes(): Promise<TrainRoute[]>;
}

export interface RollingStockService extends EntityService<RollingStock> {
  getAllRollingStock(): Promise<RollingStock[]>;
  updateRollingStock(id: string, rollingStock: RollingStock): Promise<void>;
  resetToHomeYards(): Promise<void>;
}

export interface ClientServices {
  locationService: LocationService;
  industryService: IndustryService;
  trainRouteService: TrainRouteService;
  rollingStockService: RollingStockService;
}

abstract class EntityServiceImpl<T> extends BaseService<T> implements EntityService<T> {
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
}

class TrainRouteServiceImpl extends EntityServiceImpl<TrainRoute> implements TrainRouteService {
  constructor() {
    super('/api/train-routes');
  }

  async getAllTrainRoutes(): Promise<TrainRoute[]> {
    return this.getAll();
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

export const services: ClientServices = {
  locationService: new LocationServiceImpl(),
  industryService: new IndustryServiceImpl(),
  trainRouteService: new TrainRouteServiceImpl(),
  rollingStockService: new RollingStockServiceImpl()
}; 