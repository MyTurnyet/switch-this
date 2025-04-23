import React from 'react';
import locationsData from '../data/locations.json';
import { Box, Typography, List, ListItem, Paper } from '@mui/material';

interface Location {
  _id: { $oid: string };
  stationName: string;
  block: string;
  ownerId: { $oid: string };
}

export const Locations: React.FC = () => {
  const locationsByBlock = locationsData.reduce((acc: Record<string, Location[]>, location: Location) => {
    if (!acc[location.block]) {
      acc[location.block] = [];
    }
    acc[location.block].push(location);
    return acc;
  }, {});

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Locations
      </Typography>
      {Object.entries(locationsByBlock).map(([block, locations]) => (
        <Paper key={block} sx={{ mb: 3, p: 2 }}>
          <Typography variant="h6" gutterBottom>
            {block}
          </Typography>
          <List>
            {locations.map((location) => (
              <ListItem key={location._id.$oid}>
                {location.stationName}
              </ListItem>
            ))}
          </List>
        </Paper>
      ))}
    </Box>
  );
}; 