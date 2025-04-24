'use client';

import { Box, Typography } from '@mui/material';
import { LayoutState } from '@state/layout-state';
import { Location, Industry, RollingStock } from '@shared/types/models';
import { FC, useMemo } from 'react';
import { Block } from './Block';

interface LayoutStatePageProps {
  layoutState: LayoutState;
  locations: Location[];
  industries: Industry[];
  rollingStock?: Record<string, RollingStock>;
}

const CurrentLayoutState: FC<LayoutStatePageProps> = ({ 
  layoutState, 
  locations, 
  industries,
  rollingStock = {} 
}) => {
  // Group locations by block
  const locationsByBlock = useMemo(() => {
    return locations.reduce((acc, location) => {
      if (!acc[location.block]) {
        acc[location.block] = [];
      }
      acc[location.block].push(location);
      return acc;
    }, {} as Record<string, Location[]>);
  }, [locations]);

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
        <Block
          key={block}
          block={block}
          locations={blockLocations}
          industries={industries}
          rollingStock={rollingStock}
          layoutState={layoutState}
        />
      ))}
    </Box>
  );
};

export default CurrentLayoutState; 