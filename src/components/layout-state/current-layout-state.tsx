'use client';

import { LayoutState } from '@state/layout-state';
import { Location, Industry, RollingStock } from '@shared/types/models';
import { Box, Typography, Paper, List, ListItem, Divider, Chip } from '@mui/material';
import { useMemo } from 'react';
import { FC } from 'react';

interface LayoutStatePageProps {
  layoutState: LayoutState;
  locations: Location[];
  industries: Industry[];
  rollingStock?: Record<string, RollingStock>;
}

interface LocationWithIndustries extends Location {
  industries: Industry[];
}

const CurrentLayoutState: FC<LayoutStatePageProps> = ({ 
  layoutState, 
  locations, 
  industries,
  rollingStock = {} 
}) => {
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

  const renderTrack = (track: Industry['tracks'][0], locationId: string) => {
    const carCount = track.placedCars?.length || 0;
    
    // Handle MongoDB number format
    let maxCars = 0;
    if (track.maxCars) {
      if (typeof track.maxCars === 'object' && '$numberInt' in track.maxCars) {
        const parsed = parseInt(track.maxCars.$numberInt);
        maxCars = isNaN(parsed) ? 0 : parsed;
      } else {
        maxCars = typeof track.maxCars === 'number' ? track.maxCars : 0;
      }
    }
    
    const carsAtLocation = layoutState.getCarsAtLocation(locationId);
    const capacityPercentage = maxCars > 0 ? (carCount / maxCars) * 100 : 0;
    
    return (
      <Box 
        key={track._id.$oid} 
        sx={{ 
          ml: 2, 
          mb: 2,
          p: 1.5,
          bgcolor: 'background.paper',
          borderRadius: 1,
          border: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 'medium' }}>
            {track.name}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" color="text.secondary">
              {carCount}/{maxCars} cars
            </Typography>
            <Box 
              sx={{ 
                width: 60, 
                height: 6, 
                bgcolor: 'grey.200',
                borderRadius: 3,
                overflow: 'hidden'
              }}
            >
              <Box 
                sx={{ 
                  width: `${capacityPercentage}%`, 
                  height: '100%', 
                  bgcolor: capacityPercentage > 80 ? 'error.main' : 
                          capacityPercentage > 50 ? 'warning.main' : 'success.main'
                }} 
              />
            </Box>
          </Box>
        </Box>
        {track.placedCars?.map(carId => {
          const car = rollingStock[carId];
          const isAtLocation = carsAtLocation.includes(carId);
          return (
            <Box 
              key={carId} 
              sx={{ 
                ml: 2, 
                p: 1,
                bgcolor: isAtLocation ? 'action.hover' : 'transparent',
                borderRadius: 1,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
            >
              <Box 
                sx={{ 
                  width: 8, 
                  height: 8, 
                  borderRadius: '50%',
                  bgcolor: isAtLocation ? 'success.main' : 'grey.400'
                }} 
              />
              <Typography 
                variant="body2"
                sx={{ 
                  color: isAtLocation ? 'text.primary' : 'text.secondary',
                  fontWeight: isAtLocation ? 'medium' : 'normal'
                }}
              >
                {car ? `${car.roadName} ${car.roadNumber} - ${car.description}` : carId}
              </Typography>
            </Box>
          );
        })}
      </Box>
    );
  };

  const renderIndustry = (industry: Industry) => (
    <Box 
      key={industry._id.$oid} 
      sx={{ 
        ml: 2, 
        mb: 3,
        p: 2,
        bgcolor: 'background.paper',
        borderRadius: 2,
        boxShadow: 1
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          {industry.name}
        </Typography>
        <Chip 
          label={industry.industryType} 
          size="small" 
          sx={{ 
            fontSize: '0.75rem',
            bgcolor: industry.industryType === 'FREIGHT' ? 'primary.light' :
                    industry.industryType === 'YARD' ? 'secondary.light' :
                    'info.light',
            color: 'white',
            fontWeight: 'medium'
          }} 
        />
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {industry.tracks.map(track => renderTrack(track, industry.locationId.$oid))}
      </Box>
    </Box>
  );

  return (
    <Box 
      data-testid="layout-state-container"
      data-locations={JSON.stringify(locations)}
      data-industries={JSON.stringify(industries)}
      data-rolling-stock={JSON.stringify(rollingStock)}
      sx={{ p: 3 }}
    >
      <Typography variant="h4" component="h1" gutterBottom>
        Layout State
      </Typography>

      {Object.entries(locationsByBlock).map(([block, blockLocations]) => (
        <Paper 
          key={block} 
          sx={{ 
            mb: 4, 
            p: 3,
            bgcolor: 'background.paper',
            borderRadius: 2,
            boxShadow: 2
          }}
        >
          <Typography 
            variant="h5" 
            component="h2" 
            sx={{ 
              mb: 3,
              color: 'primary.main',
              fontWeight: 'bold'
            }}
          >
            {block} Block
          </Typography>
          <List sx={{ p: 0 }}>
            {blockLocations.map((location) => (
              <Box key={location._id.$oid}>
                <ListItem sx={{ display: 'block', p: 0, mb: 3 }}>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      mb: 2,
                      color: 'text.primary',
                      fontWeight: 'medium'
                    }}
                  >
                    {location.stationName}
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    {location.industries.length === 0 ? (
                      <Box 
                        sx={{ 
                          color: 'text.secondary',
                          fontStyle: 'italic',
                          p: 2,
                          bgcolor: 'grey.50',
                          borderRadius: 1
                        }}
                      >
                        No industries
                      </Box>
                    ) : (
                      location.industries.map(industry => renderIndustry(industry))
                    )}
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
};

export default CurrentLayoutState; 