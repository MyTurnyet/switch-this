export interface MongoId {
  $oid: string;
}

export interface MongoNumber {
  $numberInt: string;
}

export interface Track {
  _id: MongoId;
  name: string;
  maxCars: number | MongoNumber;
  placedCars: MongoId[];
}

export interface Industry {
  _id: MongoId;
  name: string;
  industryType: 'FREIGHT' | 'YARD' | 'PASSENGER';
  tracks: Track[];
  locationId: MongoId;
  ownerId: MongoId;
}

export interface Location {
  _id: MongoId;
  stationName: string;
  block: string;
  ownerId: MongoId;
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
  ownerId: MongoId;
} 