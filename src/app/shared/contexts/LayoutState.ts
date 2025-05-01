import { Industry, RollingStock } from '@/app/shared/types/models';

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

  placeCarAtIndustry(industryId: string, trackId: string, car: RollingStock, skipDuplicateCheck = false): void {
    const industry = this.industries.get(industryId);
    if (!industry) {
      throw new Error('Industry not found');
    }

    const track = industry.tracks.find(t => t._id === trackId);
    if (!track) {
      throw new Error('Track not found');
    }

    // Check if the car is already placed at any industry
    if (!skipDuplicateCheck) {
      const allIndustries = Array.from(this.industries.values());
      for (const ind of allIndustries) {
        for (const t of ind.tracks) {
          if (t.placedCars.includes(car._id)) {
            throw new Error('Car is already placed at another location');
          }
        }
      }
    }

    // Check if the track accepts this car type
    if (track.acceptedCarTypes && track.acceptedCarTypes.length > 0) {
      if (!track.acceptedCarTypes.includes(car.aarType)) {
        throw new Error(`Track ${track.name} does not accept car type ${car.aarType}`);
      }
    }

    // Create a new track object with a new placedCars array
    const updatedTrack = {
      ...track,
      placedCars: [...track.placedCars]
    };

    if (updatedTrack.placedCars.length >= updatedTrack.maxCars) {
      throw new Error('Track is at maximum capacity');
    }

    this.addCar(car);
    updatedTrack.placedCars.push(car._id);

    // Create a new industry object with the updated track
    const updatedIndustry = {
      ...industry,
      tracks: industry.tracks.map(t => t._id === trackId ? updatedTrack : t)
    };
    this.industries.set(industryId, updatedIndustry);
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

  reset(industries: Industry[]): void {
    // Clear all existing state
    this.industries = new Map();
    this.cars = new Map();

    // Add the new industries with empty placedCars arrays
    industries.forEach(industry => {
      const cleanIndustry: Industry = {
        ...industry,
        tracks: industry.tracks.map(track => ({
          ...track,
          placedCars: [] // Ensure placedCars is initialized as an empty array
        }))
      };
      this.addIndustry(cleanIndustry);
    });
  }
} 