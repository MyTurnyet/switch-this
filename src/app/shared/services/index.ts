import { Location, Industry, TrainRoute, RollingStock } from '@/app/shared/types/models';
import { OperationsService } from './OperationsService';

interface ServiceMethods {
  locationService: {
    getAllLocations: () => Promise<Location[]>;
  };
  industryService: {
    getAllIndustries: () => Promise<Industry[]>;
  };
  trainRouteService: {
    getAllTrainRoutes: () => Promise<TrainRoute[]>;
    updateTrainRoute: (id: string, trainRoute: TrainRoute) => Promise<TrainRoute>;
  };
  rollingStockService: {
    getAllRollingStock: () => Promise<RollingStock[]>;
  };
  operationsService: {
    getCarsInOriginatingYard: (
      trainRoute: TrainRoute,
      industries: Industry[],
      rollingStock: RollingStock[]
    ) => RollingStock[];
    getCarsInYardTrack: (
      trainRoute: TrainRoute,
      industries: Industry[],
      rollingStock: RollingStock[],
      trackId: string
    ) => RollingStock[];
    getOriginatingYardIndustries: (
      trainRoute: TrainRoute,
      industries: Industry[]
    ) => Industry[];
  };
}

// Create an instance of OperationsService
const operationsService = new OperationsService();

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
    },
    updateTrainRoute: async (id: string, trainRoute: TrainRoute) => {
      const response = await fetch(`/api/train-routes/${id}`, {
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
  },
  rollingStockService: {
    getAllRollingStock: async () => {
      const response = await fetch('/api/rolling-stock');
      if (!response.ok) throw new Error('Failed to fetch rolling stock');
      return response.json();
    }
  },
  operationsService: {
    getCarsInOriginatingYard: (trainRoute, industries, rollingStock) => 
      operationsService.getCarsInOriginatingYard(trainRoute, industries, rollingStock),
    getCarsInYardTrack: (trainRoute, industries, rollingStock, trackId) => 
      operationsService.getCarsInYardTrack(trainRoute, industries, rollingStock, trackId),
    getOriginatingYardIndustries: (trainRoute, industries) => 
      operationsService.getOriginatingYardIndustries(trainRoute, industries)
  }
};

// Export the OperationsService class for direct use
export { OperationsService }; 