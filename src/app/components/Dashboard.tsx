import React from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { Location } from '../shared/types/models';
import { Industry } from '../shared/types/models';
import { RollingStock } from '../shared/types/models';
import CarTypeBadge from './CarTypeBadge';

interface DashboardProps {
  locations: Location[];
  industries: Industry[];
  rollingStock: RollingStock[];
}

export default function Dashboard({ locations, industries, rollingStock }: DashboardProps) {
  // Calculate location statistics
  const totalLocations = locations.length;
  const locationsByBlock = locations.reduce((acc: Record<string, number>, location) => {
    acc[location.block] = (acc[location.block] || 0) + 1;
    return acc;
  }, {});

  // Calculate industry statistics
  const totalIndustries = industries.length;
  const industriesByType = industries.reduce((acc: Record<string, number>, industry) => {
    acc[industry.industryType] = (acc[industry.industryType] || 0) + 1;
    return acc;
  }, {});

  // Calculate track capacity statistics
  const totalTrackCapacity = industries.reduce((total, industry) => {
    return total + industry.tracks.reduce((trackTotal, track) => {
      return trackTotal + (track.maxCars?.$numberInt ? parseInt(track.maxCars.$numberInt) : 0);
    }, 0);
  }, 0);

  // Calculate rolling stock statistics
  const totalRollingStock = rollingStock.length;
  const rollingStockByType = rollingStock.reduce((acc: Record<string, { count: number; description: string }>, car) => {
    if (!acc[car.aarType]) {
      acc[car.aarType] = { count: 0, description: car.description };
    }
    acc[car.aarType].count += 1;
    return acc;
  }, {});

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        System Overview
      </Typography>
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
        gap: 3
      }}>
        {/* Location Statistics */}
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Location Statistics
          </Typography>
          <Typography>Total Locations: {totalLocations}</Typography>
          <Typography variant="subtitle2" sx={{ mt: 1 }}>
            Locations by Block:
          </Typography>
          {Object.entries(locationsByBlock).map(([block, count]) => (
            <Typography key={block} variant="body2">
              {block}: {count}
            </Typography>
          ))}
        </Paper>

        {/* Industry Statistics */}
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Industry Statistics
          </Typography>
          <Typography>Total Industries: {totalIndustries}</Typography>
          <Typography variant="subtitle2" sx={{ mt: 1 }}>
            Industries by Type:
          </Typography>
          {Object.entries(industriesByType).map(([type, count]) => (
            <Typography key={type} variant="body2">
              {type}: {count}
            </Typography>
          ))}
        </Paper>

        {/* Track Capacity */}
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Track Capacity
          </Typography>
          <Typography>Total Track Capacity: {totalTrackCapacity} cars</Typography>
        </Paper>

        {/* Rolling Stock Statistics */}
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Rolling Stock ({totalRollingStock} total)
          </Typography>
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Car Types
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
              {Object.entries(rollingStockByType).map(([type, data]) => (
                <CarTypeBadge 
                  key={type} 
                  type={type} 
                  count={data.count}
                  description={data.description}
                />
              ))}
            </Box>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
} 