import React from 'react';
import industriesData from '../data/industries.json';
import locationsData from '../data/locations.json';

interface Track {
  _id: { $oid: string };
  name: string;
  maxCars: { $numberInt: string };
  placedCars: unknown[];
}

interface Industry {
  _id: { $oid: string };
  name: string;
  industryType: string;
  tracks: Track[];
  locationId: { $oid: string };
  ownerId: { $oid: string };
}

interface Location {
  _id: { $oid: string };
  stationName: string;
  block: string;
  ownerId: { $oid: string };
}

const Industries: React.FC = () => {
  const industriesByBlock = React.useMemo(() => {
    const grouped: Record<string, Record<string, Industry[]>> = {};
    
    industriesData.forEach((industry: Industry) => {
      const location = locationsData.find((loc: Location) => loc._id.$oid === industry.locationId.$oid);
      if (!location) return;
      
      if (!grouped[location.block]) {
        grouped[location.block] = {};
      }
      
      if (!grouped[location.block][location.stationName]) {
        grouped[location.block][location.stationName] = [];
      }
      
      grouped[location.block][location.stationName].push(industry);
    });
    
    return grouped;
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Industries</h1>
      
      {Object.entries(industriesByBlock).map(([block, locations]) => (
        <div key={block} className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">{block}</h2>
          
          {Object.entries(locations).map(([location, industries]) => (
            <div key={location} className="mb-6">
              <h3 className="text-xl font-medium mb-3">{location}</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {industries.map((industry) => (
                  <div key={industry._id.$oid} className="bg-white rounded-lg shadow p-4">
                    <h4 className="text-lg font-medium mb-2">{industry.name}</h4>
                    <p className="text-gray-600 mb-2">Type: {industry.industryType}</p>
                    <div className="mt-2">
                      <p className="text-sm font-medium">Tracks:</p>
                      <ul className="list-disc list-inside">
                        {industry.tracks.map((track) => (
                          <li key={track._id.$oid} className="text-sm">
                            {track.name} (Max Cars: {track.maxCars.$numberInt})
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default Industries; 