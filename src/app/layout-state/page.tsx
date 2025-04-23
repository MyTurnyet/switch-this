'use client';

import { LayoutState } from '../../state/layout-state';
import { Location, Industry, RollingStock } from '../shared/types/models';
import { Box, Typography, Paper, List, ListItem, Divider, Chip } from '@mui/material';
import { useMemo } from 'react';

interface LayoutStatePageProps {
  layoutState: LayoutState;
  locations: Location[];
  industries: Industry[];
  rollingStock?: Record<string, RollingStock>;
}

interface LocationWithIndustries extends Location {
  industries: Industry[];
}

export default function LayoutStatePage({ 
  locations, 
  industries,
  rollingStock = {} 
}: LayoutStatePageProps) {
  // Group locations and industries by block
  const locationsByBlock = useMemo(() => {
    // First, create a map of locations with their industries
    const locationsMap = locations.reduce((acc, location) => {
      acc[location._id.$oid] = {
        ...location,
        industries: industries.filter(i => i.locationId.$oid === location._id.$oid)
      };
      return acc;
    }, {} as Record<string, LocationWithIndustries>);

    // Then group by block
    return locations.reduce((acc, location) => {
      if (!acc[location.block]) {
        acc[location.block] = [];
      }
      acc[location.block].push(locationsMap[location._id.$oid]);
      return acc;
    }, {} as Record<string, LocationWithIndustries[]>);
  }, [locations, industries]);

  const renderTrack = (track: Industry['tracks'][0]) => {
    const carCount = track.placedCars.length;
    const maxCars = parseInt(track.maxCars.$numberInt);
    
    return (
      <Box key={track._id.$oid} sx={{ ml: 2, mb: 1 }}>
        <Box component="div" sx={{ mb: 0.5 }}>
          {track.name} ({carCount}/{maxCars} cars)
        </Box>
        {track.placedCars.map(carId => {
          const car = rollingStock[carId];
          return (
            <Box key={carId} component="div" sx={{ ml: 2, color: 'text.secondary' }}>
              {car ? `${car.roadName} ${car.roadNumber} - ${car.description}` : carId}
            </Box>
          );
        })}
      </Box>
    );
  };

  const renderIndustry = (industry: Industry) => (
    <Box key={industry._id.$oid} sx={{ ml: 2, mb: 2 }}>
      <Box component="div" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Box component="span" sx={{ fontWeight: 'bold' }}>
          {industry.name}
        </Box>
        <Chip 
          label={industry.industryType} 
          size="small" 
          sx={{ ml: 1, fontSize: '0.75rem' }} 
        />
      </Box>
      {industry.tracks.map(track => renderTrack(track))}
    </Box>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Layout State
      </Typography>

      {Object.entries(locationsByBlock).map(([block, blockLocations]) => (
        <Paper key={block} sx={{ mb: 3, p: 2 }}>
          <Typography variant="h6" component="h2" gutterBottom>
            {block} Block
          </Typography>
          <List>
            {blockLocations.map((location) => (
              <Box key={location._id.$oid}>
                <ListItem>
                  <Box sx={{ width: '100%' }}>
                    <Typography variant="subtitle1" sx={{ mb: 1 }}>
                      {location.stationName}
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                      {location.industries.length === 0 ? (
                        <Box sx={{ color: 'text.secondary' }}>
                          No industries
                        </Box>
                      ) : (
                        location.industries.map(industry => renderIndustry(industry))
                      )}
                    </Box>
                  </Box>
                </ListItem>
                <Divider />
              </Box>
            ))}
          </List>
        </Paper>
      ))}
    </Box>
  );
} 