import { Box, Typography } from '@mui/material';
import { Track as TrackType, RollingStock } from '@shared/types/models';
import { FC } from 'react';
import { PlacedCar } from './PlacedCar';

interface TrackProps {
  track: TrackType;
  locationId: string;
  rollingStock: Record<string, RollingStock>;
  carsAtLocation: string[];
}

export const Track: FC<TrackProps> = ({ track, locationId, rollingStock, carsAtLocation }) => {
  const carCount = track.placedCars?.length || 0;
  let maxCars = 0;

  if (track.maxCars) {
    if (typeof track.maxCars === 'object' && '$numberInt' in track.maxCars) {
      const parsed = parseInt(track.maxCars.$numberInt);
      maxCars = isNaN(parsed) ? 0 : parsed;
    } else {
      maxCars = typeof track.maxCars === 'number' ? track.maxCars : 0;
    }
  }

  const capacityPercentage = maxCars > 0 ? (carCount / maxCars) * 100 : 0;

  return (
    <Box 
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
      {track.placedCars?.map(carId => (
        <PlacedCar 
          key={carId}
          carId={carId}
          car={rollingStock[carId]}
          isAtLocation={carsAtLocation.includes(carId)}
        />
      ))}
    </Box>
  );
}; 