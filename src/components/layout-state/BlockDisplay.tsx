import { Box, Typography, List } from '@mui/material';
import { Location, Industry, RollingStock } from '@shared/types/models';
import { LayoutState } from '@state/layout-state';
import { FC } from 'react';
import { LocationDisplay } from './LocationDisplay';

interface BlockDisplayProps {
  key: string;
  block: string;
  locations: Location[];
  industries: Industry[];
  rollingStock: Record<string, RollingStock>;
  layoutState: LayoutState;
}

export const BlockDisplay: FC<BlockDisplayProps> = ({ block, locations, industries, rollingStock }) => {
  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Block {block}
      </Typography>
      <List>
        {locations.map((location, index) => (
          <Box 
            key={location._id.$oid} 
            component="li" 
            sx={{ 
              display: 'block', 
              py: 2,
              listStyle: 'none',
              borderBottom: index < locations.length - 1 ? '1px solid rgba(0, 0, 0, 0.12)' : 'none'
            }}
          >
            <LocationDisplay
              location={location}
              industries={industries.filter(i => i.locationId.$oid === location._id.$oid)}
              rollingStock={rollingStock}
            />
          </Box>
        ))}
      </List>
    </Box>
  );
}; 