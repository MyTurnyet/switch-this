import { Location, Industry, TrainRoute, RollingStock } from '@/shared/types/models';

interface ServiceMethods {
  locationService: {
    getAllLocations: () => Promise<Location[]>;
  };
  industryService: {
    getAllIndustries: () => Promise<Industry[]>;
  };
  trainRouteService: {
    getAllTrainRoutes: () => Promise<TrainRoute[]>;
  };
  rollingStockService: {
    getAllRollingStock: () => Promise<RollingStock[]>;
  };
}

export const services: ServiceMethods = {
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
    }
  }
}; 