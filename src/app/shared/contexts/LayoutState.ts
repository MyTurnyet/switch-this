import { Industry, RollingStock } from '@/shared/types/models';

export class LayoutState {
  private industries: Map<string, Industry> = new Map();
  private cars: Map<string, RollingStock> = new Map();

  getIndustries(): Industry[] {
    return Array.from(this.industries.values());
  }

  addIndustry(industry: Industry): void {
    this.industries.set(industry._id, { ...industry });
  }

  addCar(car: RollingStock): void {
    this.cars.set(car._id, car);
  }

  getCarsAtIndustry(industryId: string): RollingStock[] {
    const industry = this.industries.get(industryId);
    if (!industry) {
      return [];
    }

    const carIds = new Set<string>();
    industry.tracks.forEach(track => {
      track.placedCars.forEach(carId => carIds.add(carId));
    });

    return Array.from(carIds)
      .map(carId => this.cars.get(carId))
      .filter((car): car is RollingStock => car !== undefined);
  }

  placeCarAtIndustry(industryId: string, trackId: string, car: RollingStock): void {
    const industry = this.industries.get(industryId);
    if (!industry) {
      throw new Error('Industry not found');
    }

    const track = industry.tracks.find(t => t._id === trackId);
    if (!track) {
      throw new Error('Track not found');
    }

    if (track.placedCars.length >= track.maxCars) {
      throw new Error('Track is at maximum capacity');
    }

    this.addCar(car);
    track.placedCars.push(car._id);
    this.industries.set(industryId, { ...industry });
  }

  removeCarFromIndustry(industryId: string, trackId: string, carId: string): void {
    const industry = this.industries.get(industryId);
    if (!industry) {
      throw new Error('Industry not found');
    }

    const track = industry.tracks.find(t => t._id === trackId);
    if (!track) {
      throw new Error('Track not found');
    }

    const carIndex = track.placedCars.indexOf(carId);
    if (carIndex === -1) {
      throw new Error('Car not found on track');
    }

    track.placedCars.splice(carIndex, 1);
    this.cars.delete(carId);
    this.industries.set(industryId, { ...industry });
  }
} 