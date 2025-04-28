import { LocationService } from './LocationService';
import { IndustryService } from './IndustryService';
import { TrainRouteService } from './TrainRouteService';
import { RollingStockService } from './RollingStockService';

export const services = {
  locationService: new LocationService(),
  industryService: new IndustryService(),
  trainRouteService: new TrainRouteService(),
  rollingStockService: new RollingStockService()
}; 