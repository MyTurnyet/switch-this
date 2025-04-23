export class LayoutState {
  private carPositions: Record<string, string> = {};
  private locationCars: Record<string, string[]> = {};

  getCarPositions(): Record<string, string> {
    return { ...this.carPositions };
  }

  getCarPosition(carId: string): string | undefined {
    return this.carPositions[carId];
  }

  setCarPosition(carId: string, locationId: string): void {
    const previousLocation = this.carPositions[carId];
    
    // Remove car from previous location if it exists
    if (previousLocation) {
      this.locationCars[previousLocation] = this.locationCars[previousLocation]
        .filter(id => id !== carId);
    }

    // Update car's position
    this.carPositions[carId] = locationId;

    // Add car to new location
    if (!this.locationCars[locationId]) {
      this.locationCars[locationId] = [];
    }
    this.locationCars[locationId].push(carId);
  }

  getCarsAtLocation(locationId: string): string[] {
    return [...(this.locationCars[locationId] || [])];
  }
} 