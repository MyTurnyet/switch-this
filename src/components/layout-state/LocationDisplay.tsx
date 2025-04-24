import { Box, Typography } from '@mui/material';
import { Location as LocationType, Industry as IndustryType, RollingStock } from '@shared/types/models';
import { FC } from 'react';
import { IndustryDisplay } from './IndustryDisplay';

interface LocationDisplayProps {
  location: LocationType;
  industries: IndustryType[];
  rollingStock: Record<string, RollingStock>;
}

export const LocationDisplay: FC<LocationDisplayProps> = ({ location, industries, rollingStock }) => {
  const locationIndustries = industries.filter(industry => industry.locationId.$oid === location._id.$oid);

  return (
    <Box sx={{ display: 'block' }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        {location.stationName}
      </Typography>
      {locationIndustries.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          No industries
        </Typography>
      ) : (
        locationIndustries.map(industry => (
          <IndustryDisplay
            key={industry._id.$oid}
            industry={industry}
            rollingStock={rollingStock}
          />
        ))
      )}
    </Box>
  );
}; 