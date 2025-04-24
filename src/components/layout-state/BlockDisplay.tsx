import { Box, Typography, Paper, List, Divider } from '@mui/material';
import { Location as LocationType, Industry as IndustryType, RollingStock } from '@shared/types/models';
import { FC } from 'react';
import { LocationDisplay } from './LocationDisplay';
import { LayoutState } from '@state/layout-state';

interface BlockDisplayProps {
  block: string;
  locations: LocationType[];
  industries: IndustryType[];
  rollingStock: Record<string, RollingStock>;
  layoutState: LayoutState;
}

export const BlockDisplay: FC<BlockDisplayProps> = ({ block, locations, industries, rollingStock, layoutState }) => {
  return (
    <Paper 
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
        {locations.map((location, index) => (
          <Box key={location._id.$oid}>
            <LocationDisplay
              location={location}
              industries={industries.filter(i => i.locationId.$oid === location._id.$oid)}
              rollingStock={rollingStock}
              layoutState={layoutState}
            />
            {index < locations.length - 1 && <Divider />}
          </Box>
        ))}
      </List>
    </Paper>
  );
}; 