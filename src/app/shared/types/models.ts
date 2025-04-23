export interface Track {
  _id: { $oid: string };
  name: string;
  maxCars: { $numberInt: string };
  placedCars: unknown[];
}

export interface Industry {
  _id: { $oid: string };
  name: string;
  industryType: string;
  tracks: Track[];
  locationId: { $oid: string };
  ownerId: { $oid: string };
}

export interface Location {
  _id: { $oid: string };
  stationName: string;
  block: string;
  ownerId: { $oid: string };
} 