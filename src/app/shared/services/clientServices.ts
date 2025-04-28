'use client';

import { Location, Industry, TrainRoute, RollingStock } from '../types/models';

// Default to empty string if not set, will be caught by error handling
const MONGODB_API_URL = process.env.NEXT_PUBLIC_MONGODB_URL || '';

async function fetchWithErrorHandling<T>(endpoint: string): Promise<T[]> {
  if (!MONGODB_API_URL) {
    throw new Error('MongoDB API URL is not configured. Please check your environment variables.');
  }

  try {
    const response = await fetch(`${MONGODB_API_URL}${endpoint}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching from ${endpoint}:`, error);
    throw error;
  }
}

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

export const services: ClientServices = {
  locationService: {
    getAllLocations: async () => {
      const response = await fetch('/api/locations');
      if (!response.ok) throw new Error('Failed to fetch locations');
      return response.json();
    }
  },
  industryService: {
    getAllIndustries: async () => {
      const response = await fetch('/api/industries');
      if (!response.ok) throw new Error('Failed to fetch industries');
      return response.json();
    }
  },
  trainRouteService: {
    getAllTrainRoutes: async () => {
      const response = await fetch('/api/train-routes');
      if (!response.ok) throw new Error('Failed to fetch train routes');
      return response.json();
    }
  },
  rollingStockService: {
    getAllRollingStock: async () => {
      const response = await fetch('/api/rolling-stock');
      if (!response.ok) throw new Error('Failed to fetch rolling stock');
      return response.json();
    },
    updateRollingStock: async (id: string, rollingStock: RollingStock) => {
      const response = await fetch(`/api/rolling-stock/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(rollingStock),
      });
      if (!response.ok) throw new Error('Failed to update rolling stock');
    },
    resetToHomeYards: async () => {
      const response = await fetch('/api/rolling-stock/reset', {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to reset rolling stock');
    }
  }
}; 