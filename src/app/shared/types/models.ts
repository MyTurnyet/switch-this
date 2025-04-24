export interface MongoId {
  $oid: string;
}

export interface MongoNumber {
  $numberInt: string;
}

export interface Track {
  _id: string;
  name: string;
  maxCars: number | MongoNumber;
  placedCars: MongoId[];
}

export interface Industry {
  _id: string;
  name: string;
  industryType: 'FREIGHT' | 'YARD' | 'PASSENGER';
  tracks: Track[];
  locationId: string;
  ownerId: string;
}

export interface Location {
  _id: string;
  stationName: string;
  block: string;
  ownerId: string;
}

export interface RollingStock {
  _id: MongoId;
  roadName: string;
  roadNumber: string;
  aarType: string;
  description: string;
  color: string;
  note: string;
  homeYard: MongoId;
  ownerId: string;
} 