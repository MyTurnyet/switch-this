import React from 'react';

interface LocationData {
  _id: { $oid: string };
  stationName: string;
  block: string;
  ownerId: { $oid: string };
}

interface LocationProps {
  location: LocationData;
}

const LocationHeader: React.FC<{ stationName: string }> = ({ stationName }) => (
  <h2 className="text-xl font-semibold mb-2">{stationName}</h2>
);

const LocationBlock: React.FC<{ block: string }> = ({ block }) => (
  <p className="text-gray-600">
    <span className="font-medium">Block:</span> {block}
  </p>
);

const LocationId: React.FC<{ id: string }> = ({ id }) => (
  <p className="text-gray-500 text-sm mt-1">
    <span className="font-medium">ID:</span> {id}
  </p>
);

const Location: React.FC<LocationProps> = ({ location }) => {
  return (
    <div className="location-card p-4 border rounded-lg shadow-sm bg-white">
      <LocationHeader stationName={location.stationName} />
      <div className="location-details">
        <LocationBlock block={location.block} />
        <LocationId id={location._id.$oid} />
      </div>
    </div>
  );
};

export default Location; 