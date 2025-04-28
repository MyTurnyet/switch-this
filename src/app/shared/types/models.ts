export type IndustryType = 'FREIGHT' | 'YARD' | 'PASSENGER';

export interface Track {
  _id: string;
  name: string;
  length: number;
  capacity: number;
  maxCars: number;
  placedCars: string[];
}

export interface Location {
  _id: string;
  stationName: string;
  block: string;
  description?: string;
  ownerId: string;
}

export interface Industry {
  _id: string;
  name: string;
  locationId: string;
  blockName: string;
  description?: string;
  industryType: IndustryType;
  tracks: Track[];
  ownerId: string;
}

export interface TrainRoute {
  _id: string;
  name: string;
  description?: string;
  startLocationId: string;
  endLocationId: string;
}

export interface RollingStock {
  _id: string;
  roadName: string;
  roadNumber: string;
  aarType: string;
  description: string;
  color: string;
  note: string;
  homeYard: string;
  ownerId: string;
  currentLocation?: {
    industryId: string;
    trackId: string;
  };
} 