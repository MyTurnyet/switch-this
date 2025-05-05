import { TrainRoute, Industry, RollingStock, IndustryType } from '@/app/shared/types/models';

export class OperationsService {
  /**
   * Get all cars currently located in the originating yard of a train route
   * @param trainRoute - The train route
   * @param industries - List of all industries
   * @param rollingStock - List of all rolling stock
   * @returns Array of rolling stock located in the originating yard
   */
  getCarsInOriginatingYard(
    trainRoute: TrainRoute,
    industries: Industry[],
    rollingStock: RollingStock[]
  ): RollingStock[] {
    // Find all industries at the originating yard
    const yardIndustries = this.getOriginatingYardIndustries(trainRoute, industries);
    
    // Get IDs of yard industries
    const yardIndustryIds = yardIndustries.map(industry => industry._id);
    
    // Filter rolling stock to only include those in the originating yard
    return rollingStock.filter(car => 
      car.currentLocation && 
      yardIndustryIds.includes(car.currentLocation.industryId)
    );
  }

  /**
   * Get all cars located in a specific track in the originating yard
   * @param trainRoute - The train route
   * @param industries - List of all industries
   * @param rollingStock - List of all rolling stock
   * @param trackId - ID of the track to filter by
   * @returns Array of rolling stock located in the specified track
   */
  getCarsInYardTrack(
    trainRoute: TrainRoute,
    industries: Industry[],
    rollingStock: RollingStock[],
    trackId: string
  ): RollingStock[] {
    // Get all cars in the originating yard
    const carsInYard = this.getCarsInOriginatingYard(trainRoute, industries, rollingStock);
    
    // Filter to only include cars in the specified track
    return carsInYard.filter(car => 
      car.currentLocation && 
      car.currentLocation.trackId === trackId
    );
  }

  /**
   * Get all industries located at the originating yard
   * @param trainRoute - The train route
   * @param industries - List of all industries
   * @returns Array of industries located at the originating yard
   */
  getOriginatingYardIndustries(
    trainRoute: TrainRoute,
    industries: Industry[]
  ): Industry[] {
    // Filter industries to only include those at the originating yard
    return industries.filter(industry => 
      industry.locationId === trainRoute.originatingYardId &&
      industry.industryType === IndustryType.YARD
    );
  }
} 