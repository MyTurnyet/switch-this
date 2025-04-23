'use client';

import { LayoutState } from '../../state/layout-state';
import { Location } from '../shared/types/models';
import { Box, Typography, Paper, List, ListItem, ListItemText, Divider } from '@mui/material';

interface LayoutStatePageProps {
  layoutState: LayoutState;
  locations: Location[];
}

export default function LayoutStatePage({ layoutState, locations }: LayoutStatePageProps) {
  // Group locations by block
  const locationsByBlock = locations.reduce((acc, location) => {
    if (!acc[location.block]) {
      acc[location.block] = [];
    }
    acc[location.block].push(location);
    return acc;
  }, {} as Record<string, Location[]>);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Layout State
      </Typography>

      {Object.entries(locationsByBlock).map(([block, blockLocations]) => (
        <Paper key={block} sx={{ mb: 3, p: 2 }}>
          <Typography variant="h6" component="h2" gutterBottom>
            {block} Block
          </Typography>
          <List>
            {blockLocations.map((location) => {
              const carsAtLocation = layoutState.getCarsAtLocation(location._id.$oid);
              return (
                <Box key={location._id.$oid}>
                  <ListItem>
                    <ListItemText
                      primary={location.stationName}
                      secondary={
                        carsAtLocation.length === 0 ? (
                          'Empty'
                        ) : (
                          <Box component="span">
                            {carsAtLocation.map((carId) => (
                              <Box key={carId} component="span" sx={{ display: 'block' }}>
                                {carId} {/* In a real app, we'd fetch and display car details */}
                              </Box>
                            ))}
                          </Box>
                        )
                      }
                    />
                  </ListItem>
                  <Divider />
                </Box>
              );
            })}
          </List>
        </Paper>
      ))}
    </Box>
  );
} 