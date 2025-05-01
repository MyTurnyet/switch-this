import { Location, Industry, LocationType, CarDestination } from '@/app/shared/types/models';

/**
 * Service for managing routing to off-layout locations via fiddle yards
 */
export class OffLayoutRoutingService {
  private locations: Location[] = [];
  private industries: Industry[] = [];
  private fiddleYards: Location[] = [];
  
  /**
   * Initialize the service with locations and industries data
   * @param locations All available locations
   * @param industries All available industries
   */
  constructor(locations: Location[], industries: Industry[]) {
    this.locations = locations;
    this.industries = industries;
    this.fiddleYards = locations.filter(loc => loc.locationType === LocationType.FIDDLE_YARD);
  }
  
  /**
   * Find the nearest fiddle yard to use as an immediate destination 
   * when routing to an off-layout location
   * @param originLocationId The ID of the origin location (on-layout)
   * @returns The nearest fiddle yard location, or undefined if none found
   */
  public getNearestFiddleYard(originLocationId: string): Location | undefined {
    const originLocation = this.locations.find(loc => loc._id === originLocationId);
    if (!originLocation) {
      return undefined;
    }
    
    // In a real implementation, this would use geography/distances
    // For now, we'll just use the first fiddle yard in the same block
    let nearestFiddleYard = this.fiddleYards.find(yard => yard.block === originLocation.block);
    
    // If no fiddle yard in the same block, just use the first one
    if (!nearestFiddleYard && this.fiddleYards.length > 0) {
      nearestFiddleYard = this.fiddleYards[0];
    }
    
    return nearestFiddleYard;
  }
  
  /**
   * Get a yard industry within a fiddle yard location
   * @param fiddleYardId The ID of the fiddle yard location
   * @returns An industry of type YARD within the fiddle yard, or undefined if none found
   */
  public getYardIndustry(fiddleYardId: string): Industry | undefined {
    return this.industries.find(
      ind => ind.locationId === fiddleYardId && ind.industryType === 'YARD'
    );
  }
  
  /**
   * Create a routing destination for off-layout movements
   * @param originLocationId The ID of the origin location (on-layout)
   * @param finalLocationId The ID of the destination location (off-layout)
   * @param finalIndustryId The ID of the industry at the final destination
   * @param finalTrackId Optional ID of the specific track at the final destination
   * @returns A CarDestination object with immediate and final destinations
   */
  public createOffLayoutDestination(
    originLocationId: string,
    finalLocationId: string,
    finalIndustryId: string,
    finalTrackId?: string
  ): CarDestination | undefined {
    // Get the nearest fiddle yard to the origin
    const fiddleYard = this.getNearestFiddleYard(originLocationId);
    if (!fiddleYard) {
      return undefined;
    }
    
    // Get a yard industry within the fiddle yard
    const yardIndustry = this.getYardIndustry(fiddleYard._id);
    if (!yardIndustry || !yardIndustry.tracks || yardIndustry.tracks.length === 0) {
      return undefined;
    }
    
    // Use the first track in the yard for simplicity
    const trackId = yardIndustry.tracks[0]._id;
    
    return {
      immediateDestination: {
        locationId: fiddleYard._id,
        industryId: yardIndustry._id,
        trackId
      },
      finalDestination: {
        locationId: finalLocationId,
        industryId: finalIndustryId,
        trackId: finalTrackId
      }
    };
  }
  
  /**
   * Check if a location is off-layout
   * @param locationId The ID of the location to check
   * @returns true if the location is off-layout, false otherwise
   */
  public isOffLayoutLocation(locationId: string): boolean {
    const location = this.locations.find(loc => loc._id === locationId);
    return location?.locationType === LocationType.OFF_LAYOUT;
  }
} 