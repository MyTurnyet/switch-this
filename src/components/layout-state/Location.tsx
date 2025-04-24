import { Box, Typography, ListItem } from '@mui/material';
import { Location as LocationType, Industry as IndustryType, RollingStock } from '@shared/types/models';
import { FC } from 'react';
import { Industry } from './Industry';

interface LocationProps {
  location: LocationType;
  industries: IndustryType[];
  rollingStock: Record<string, RollingStock>;
  carsAtLocation: string[];
}

export const Location: FC<LocationProps> = ({ location, industries, rollingStock, carsAtLocation }) => {
  return (
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
        {industries.length === 0 ? (
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
          industries.map(industry => (
            <Industry
              key={industry._id.$oid}
              industry={industry}
              rollingStock={rollingStock}
              carsAtLocation={carsAtLocation}
            />
          ))
        )}
      </Box>
    </ListItem>
  );
}; 