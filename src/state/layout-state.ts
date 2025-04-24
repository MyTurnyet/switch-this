import { MongoId } from '@shared/types/models';

export class LayoutState {
  private carPositions: Record<string, string> = {};
  private locationCars: Record<string, string[]> = {};

  getCarPositions(): Record<string, string> {
    return { ...this.carPositions };
  }

  getCarPosition(carId: string | MongoId): string | undefined {
    const id = typeof carId === 'string' ? carId : carId.$oid;
    return this.carPositions[id];
  }

  private removeCarFromLocation(carId: string | MongoId, locationId: string | MongoId): void {
    const carIdStr = typeof carId === 'string' ? carId : carId.$oid;
    const locationIdStr = typeof locationId === 'string' ? locationId : locationId.$oid;
    if (this.locationCars[locationIdStr]) {
      this.locationCars[locationIdStr] = this.locationCars[locationIdStr]
        .filter(id => id !== carIdStr);
    }
  }

  private addCarToLocation(carId: string | MongoId, locationId: string | MongoId): void {
    const carIdStr = typeof carId === 'string' ? carId : carId.$oid;
    const locationIdStr = typeof locationId === 'string' ? locationId : locationId.$oid;
    if (!this.locationCars[locationIdStr]) {
      this.locationCars[locationIdStr] = [];
    }
    this.locationCars[locationIdStr].push(carIdStr);
  }

  setCarPosition(carId: string | MongoId, locationId: string | MongoId): void {
    const carIdStr = typeof carId === 'string' ? carId : carId.$oid;
    const locationIdStr = typeof locationId === 'string' ? locationId : locationId.$oid;
    const previousLocation = this.carPositions[carIdStr];
    
    if (previousLocation) {
      this.removeCarFromLocation(carIdStr, previousLocation);
    }

    this.carPositions[carIdStr] = locationIdStr;
    this.addCarToLocation(carIdStr, locationIdStr);
  }

  private clearCarPositions(carIds: (string | MongoId)[]): void {
    carIds.forEach(carId => {
      const carIdStr = typeof carId === 'string' ? carId : carId.$oid;
      const currentLocation = this.carPositions[carIdStr];
      if (currentLocation) {
        this.removeCarFromLocation(carIdStr, currentLocation);
      }
    });
  }

  setCarPositions(carPositions: Record<string, string | MongoId>): void {
    const carIds = Object.keys(carPositions);
    this.clearCarPositions(carIds);

    Object.entries(carPositions).forEach(([carId, locationId]) => {
      const locationIdStr = typeof locationId === 'string' ? locationId : locationId.$oid;
      this.carPositions[carId] = locationIdStr;
      this.addCarToLocation(carId, locationIdStr);
    });
  }

  getCarsAtLocation(locationId: string | MongoId): string[] {
    const locationIdStr = typeof locationId === 'string' ? locationId : locationId.$oid;
    return [...(this.locationCars[locationIdStr] || [])];
  }

  getEmptyLocations(locationIds: (string | MongoId)[]): string[] {
    return locationIds.map(id => typeof id === 'string' ? id : id.$oid)
      .filter(locationId => {
        const cars = this.locationCars[locationId];
        return !cars || cars.length === 0;
      });
  }
} 