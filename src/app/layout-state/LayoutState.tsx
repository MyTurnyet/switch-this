'use client';

import { useLayout } from '../shared/contexts/LayoutContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { ScrollArea } from '../components/ui/scroll-area';
import { Industry, Location, RollingStock, Track } from '../shared/types/models';

export default function LayoutState() {
  const { locations, industries, rollingStock } = useLayout();

  // Group locations by block
  const locationsByBlock = locations.reduce((acc: Record<string, Location[]>, location: Location) => {
    const block = location.block || 'Unassigned';
    if (!acc[block]) {
      acc[block] = [];
    }
    acc[block].push(location);
    return acc;
  }, {});

  // Group industries by location
  const industriesByLocation = industries.reduce((acc: Record<string, Industry[]>, industry: Industry) => {
    const locationId = industry.locationId;
    if (!acc[locationId]) {
      acc[locationId] = [];
    }
    acc[locationId].push(industry);
    return acc;
  }, {});

  // Get car details by ID
  const getCarDetails = (carId: string): RollingStock | undefined => {
    return rollingStock.find((car: RollingStock) => car._id === carId);
  };

  if (industries.length === 0) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Layout State</h1>
        <p>No industries found</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Layout State</h1>
      <ScrollArea className="h-[calc(100vh-8rem)]">
        {Object.entries(locationsByBlock).map(([block, blockLocations]) => (
          <div key={block} className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Block {block}</h2>
            <div className="grid gap-4">
              {(blockLocations as Location[]).map((location: Location) => (
                <Card key={location._id}>
                  <CardHeader>
                    <CardTitle>{location.stationName}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {industriesByLocation[location._id]?.map((industry: Industry) => (
                      <div key={industry._id} className="mb-4">
                        <h3 className="font-medium mb-2">{industry.name}</h3>
                        <div className="grid gap-2">
                          {industry.tracks.map((track: Track) => (
                            <div key={track._id} className="border rounded p-2">
                              <div className="font-medium">{track.name}</div>
                              <div className="text-sm text-gray-500">
                                {track.placedCars.length} / {track.maxCars} cars
                              </div>
                              <div className="mt-2">
                                {track.placedCars.map((carId: string) => {
                                  const car = getCarDetails(carId);
                                  return car ? (
                                    <div key={carId} className="text-sm">
                                      {car.roadName} {car.roadNumber}
                                    </div>
                                  ) : null;
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </ScrollArea>
    </div>
  );
} 