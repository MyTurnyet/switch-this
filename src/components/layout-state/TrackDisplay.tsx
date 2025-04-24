import { Box, Typography, Chip } from '@mui/material';
import { Track as TrackType, RollingStock, MongoNumber } from '@shared/types/models';
import { FC } from 'react';

interface TrackDisplayProps {
  track: TrackType;
  rollingStock: Record<string, RollingStock>;
}

export const TrackDisplay: FC<TrackDisplayProps> = ({ track, rollingStock }) => {
  const placedCars = track.placedCars.map(carId => rollingStock[carId.$oid]).filter(Boolean);
  const maxCars = typeof track.maxCars === 'object' ? parseInt((track.maxCars as MongoNumber).$numberInt) : track.maxCars || 0;
  const currentCars = placedCars.length;
  const capacityPercentage = maxCars > 0 ? (currentCars / maxCars) * 100 : 0;

  const getCapacityColor = (percentage: number) => {
    if (percentage >= 80) return 'error.main';
    if (percentage >= 50) return 'warning.main';
    return 'success.main';
  };

  return (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Typography variant="subtitle1" sx={{ mr: 2 }}>
          {track.name}
        </Typography>
        <Chip 
          label={`${currentCars}/${maxCars} cars`}
          size="small"
          sx={{ 
            bgcolor: getCapacityColor(capacityPercentage),
            color: 'white'
          }}
        />
      </Box>
      {placedCars.length > 0 && (
        <Box sx={{ ml: 2 }}>
          {placedCars.map(car => (
            <Chip
              key={car._id.$oid}
              label={`${car.roadName} ${car.roadNumber} - ${car.aarType}`}
              size="small"
              sx={{ mr: 1, mb: 1 }}
              variant="outlined"
            />
          ))}
        </Box>
      )}
    </Box>
  );
}; 