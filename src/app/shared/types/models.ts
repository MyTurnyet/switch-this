// Base entity type with common properties
export interface BaseEntity {
  _id: string;
  ownerId: string;
}

// Enum for industry types to ensure type safety
export enum IndustryType {
  FREIGHT = 'FREIGHT',
  YARD = 'YARD',
  PASSENGER = 'PASSENGER'
}

export interface Track extends BaseEntity {
  name: string;
  length: number;
  capacity: number;
  maxCars: number;
  placedCars: string[];
  acceptedCarTypes: string[]; // Array of AAR car types this track accepts
}

export interface Location extends BaseEntity {
  stationName: string;
  block: string;
  description?: string;
}

export interface Industry extends BaseEntity {
  name: string;
  locationId: string;
  blockName: string;
  description?: string;
  industryType: IndustryType;
  tracks: Track[];
}

export interface TrainRoute extends BaseEntity {
  name: string;
  routeNumber: string;
  routeType: 'MIXED' | 'PASSENGER' | 'FREIGHT';
  originatingYardId: string;
  terminatingYardId: string;
  stations: string[];
  description?: string;
}

export interface RollingStockLocation {
  industryId: string;
  trackId: string;
}

export interface RollingStock extends BaseEntity {
  roadName: string;
  roadNumber: string;
  aarType: string;
  description: string;
  color: string;
  note: string;
  homeYard: string;
  currentLocation?: RollingStockLocation;
}

export interface Switchlist extends BaseEntity {
  trainRouteId: string;
  name: string;
  createdAt: string; // ISO date string
  status: 'CREATED' | 'IN_PROGRESS' | 'COMPLETED';
  notes?: string;
} 