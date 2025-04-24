import { Location, Industry, TrainRoute, RollingStock } from '@/shared/types/models';

export class LayoutDataCache {
  private locations: Location[] | null = null;
  private industries: Industry[] | null = null;
  private trainRoutes: TrainRoute[] | null = null;
  private rollingStock: RollingStock[] | null = null;

  getLocations(): Location[] | null {
    return this.locations;
  }

  getIndustries(): Industry[] | null {
    return this.industries;
  }

  getTrainRoutes(): TrainRoute[] | null {
    return this.trainRoutes;
  }

  getRollingStock(): RollingStock[] | null {
    return this.rollingStock;
  }

  setLocations(locations: Location[] | null): void {
    this.locations = locations;
  }

  setIndustries(industries: Industry[] | null): void {
    this.industries = industries;
  }

  setTrainRoutes(trainRoutes: TrainRoute[] | null): void {
    this.trainRoutes = trainRoutes;
  }

  setRollingStock(rollingStock: RollingStock[] | null): void {
    this.rollingStock = rollingStock;
  }

  isDataLoaded(): boolean {
    return this.locations !== null && 
           this.industries !== null && 
           this.trainRoutes !== null &&
           this.rollingStock !== null;
  }

  clear(): void {
    this.locations = null;
    this.industries = null;
    this.trainRoutes = null;
    this.rollingStock = null;
  }
} 