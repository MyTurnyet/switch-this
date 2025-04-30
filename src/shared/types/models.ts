export interface Location {
  _id: string;
  stationName: string;
  block: string;
  ownerId: string;
}

export interface Track {
  _id: string;
  name: string;
  maxCars: number;
  placedCars: string[];
}

export interface Industry {
  _id: string;
  name: string;
  industryType: 'FREIGHT' | 'YARD' | 'PASSENGER';
  tracks: Track[];
  locationId: string;
  ownerId: string;
  description?: string;
  blockName?: string;
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
}

export interface TrainRoute {
  _id: string;
  name: string;
  routeNumber: string;
  routeType: 'MIXED' | 'PASSENGER' | 'FREIGHT';
  originatingYardId: string;
  terminatingYardId: string;
  stations: Location[];
}
