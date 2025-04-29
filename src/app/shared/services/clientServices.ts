'use client';

import { Location, Industry, TrainRoute, RollingStock } from '../types/models';
import { BaseService } from './BaseService';

// Service interfaces
export interface LocationService {
  getAllLocations(): Promise<Location[]>;
}

export interface IndustryService {
  getAllIndustries(): Promise<Industry[]>;
}

export interface TrainRouteService {
  getAllTrainRoutes(): Promise<TrainRoute[]>;
}

export interface RollingStockService {
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

class LocationServiceImpl extends BaseService<Location> implements LocationService {
  constructor() {
    super('/api/locations');
  }

  async getAllLocations(): Promise<Location[]> {
    return this.getAll();
  }
}

class IndustryServiceImpl extends BaseService<Industry> implements IndustryService {
  constructor() {
    super('/api/industries');
  }

  async getAllIndustries(): Promise<Industry[]> {
    return this.getAll();
  }
}

class TrainRouteServiceImpl extends BaseService<TrainRoute> implements TrainRouteService {
  constructor() {
    super('/api/train-routes');
  }

  async getAllTrainRoutes(): Promise<TrainRoute[]> {
    return this.getAll();
  }
}

class RollingStockServiceImpl extends BaseService<RollingStock> implements RollingStockService {
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