export interface Track {
  _id: string;
  name: string;
  maxCars: number;
  placedCars: string[]; // You can define a more specific type for placedCars if needed
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
  _id: { $oid: string };
  stationName: string;
  block: string;
  ownerId: { $oid: string };
}

export interface RollingStock {
  _id: {
    $oid: string;
  };
  roadName: string;
  roadNumber: number;
  aarType: string;
  description: string;
  color: string;
  note: string;
  homeYard: {
    $oid: string;
  };
  ownerId: {
    $oid: string;
  };
} 