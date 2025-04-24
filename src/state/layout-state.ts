export class LayoutState {
  private carPositions: Record<string, string> = {};
  private locationCars: Record<string, string[]> = {};

  getCarPositions(): Record<string, string> {
    return { ...this.carPositions };
  }

  getCarPosition(carId: string): string | undefined {
    return this.carPositions[carId];
  }

  private removeCarFromLocation(carId: string, locationId: string): void {
    if (this.locationCars[locationId]) {
      this.locationCars[locationId] = this.locationCars[locationId]
        .filter(id => id !== carId);
    }
  }

  private addCarToLocation(carId: string, locationId: string): void {
    if (!this.locationCars[locationId]) {
      this.locationCars[locationId] = [];
    }
    this.locationCars[locationId].push(carId);
  }

  setCarPosition(carId: string, locationId: string): void {
    const previousLocation = this.carPositions[carId];
    
    if (previousLocation) {
      this.removeCarFromLocation(carId, previousLocation);
    }

    this.carPositions[carId] = locationId;
    this.addCarToLocation(carId, locationId);
  }

  private clearCarPositions(carIds: string[]): void {
    carIds.forEach(carId => {
      const currentLocation = this.carPositions[carId];
      if (currentLocation) {
        this.removeCarFromLocation(carId, currentLocation);
      }
    });
  }

  setCarPositions(carPositions: Record<string, string>): void {
    const carIds = Object.keys(carPositions);
    this.clearCarPositions(carIds);

    Object.entries(carPositions).forEach(([carId, locationId]) => {
      this.carPositions[carId] = locationId;
      this.addCarToLocation(carId, locationId);
    });
  }

  getCarsAtLocation(locationId: string): string[] {
    return [...(this.locationCars[locationId] || [])];
  }

  getEmptyLocations(locationIds: string[]): string[] {
    return locationIds.filter(locationId => {
      const cars = this.locationCars[locationId];
      return !cars || cars.length === 0;
    });
  }
} 