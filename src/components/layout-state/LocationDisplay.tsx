import { Box, Typography, ListItem } from '@mui/material';
import { Location as LocationType, Industry as IndustryType, RollingStock } from '@shared/types/models';
import { FC } from 'react';
import { IndustryDisplay } from './IndustryDisplay';
import { LayoutState } from '@state/layout-state';

interface LocationDisplayProps {
  location: LocationType;
  industries: IndustryType[];
  rollingStock: Record<string, RollingStock>;
  layoutState: LayoutState;
}

export const LocationDisplay: FC<LocationDisplayProps> = ({ location, industries, rollingStock, layoutState }) => {
  const locationIndustries = industries.filter(industry => industry.locationId.$oid === location._id.$oid);
  const carsAtLocation = layoutState.getCarsAtLocation(location._id.$oid) || [];

  return (
    <ListItem sx={{ display: 'block', p: 0, mb: 3 }}>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6">{location.stationName}</Typography>
      </Box>
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
            carsAtLocation={carsAtLocation}
            layoutState={layoutState}
          />
        ))
      )}
    </ListItem>
  );
}; 