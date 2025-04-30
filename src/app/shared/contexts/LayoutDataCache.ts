import { Location, Industry, TrainRoute, RollingStock } from '@/app/shared/types/models';

export class LayoutDataCache {
  private locations: Location[] = [];
  private industries: Industry[] = [];
  private trainRoutes: TrainRoute[] = [];
  private rollingStock: RollingStock[] = [];

  getLocations(): Location[] {
    return this.locations;
  }

  getIndustries(): Industry[] {
    return this.industries;
  }

  getTrainRoutes(): TrainRoute[] {
    return this.trainRoutes;
  }

  getRollingStock(): RollingStock[] {
    return this.rollingStock;
  }

  setLocations(locations: Location[]): void {
    this.locations = locations;
  }

  setIndustries(industries: Industry[]): void {
    this.industries = industries;
  }

  setTrainRoutes(trainRoutes: TrainRoute[]): void {
    this.trainRoutes = trainRoutes;
  }

  setRollingStock(rollingStock: RollingStock[]): void {
    this.rollingStock = rollingStock;
  }

  isDataLoaded(): boolean {
    return this.locations.length > 0 && 
           this.industries.length > 0 && 
           this.trainRoutes.length > 0 &&
           this.rollingStock.length > 0;
  }

  clear(): void {
    this.locations = [];
    this.industries = [];
    this.trainRoutes = [];
    this.rollingStock = [];
  }
} 