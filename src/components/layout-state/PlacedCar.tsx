import { Box, Typography } from '@mui/material';
import { RollingStock } from '@shared/types/models';
import { FC } from 'react';

interface PlacedCarProps {
  carId: string;
  car: RollingStock;
  isAtLocation: boolean;
}

export const PlacedCar: FC<PlacedCarProps> = ({ carId, car, isAtLocation }) => {
  return (
    <Box 
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
}; 