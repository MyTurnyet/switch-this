import { Box, Paper, Typography } from '@mui/material';
import { Location, Industry, RollingStock, MongoNumber } from '@shared/types/models';
import CarTypeBadge from './CarTypeBadge';

interface DashboardProps {
  locations: Location[];
  industries: Industry[];
  rollingStock: RollingStock[];
}

export default function Dashboard({ locations, industries, rollingStock }: DashboardProps) {
  const totalLocations = locations.length;
  const totalIndustries = industries.length;
  const totalRollingStock = rollingStock.length;

  const getMaxCarsValue = (maxCars: number | MongoNumber): number => {
    if (typeof maxCars === 'number') {
      return maxCars;
    }
    return parseInt(maxCars.$numberInt);
  };

  const totalTrackCapacity = industries.reduce((total, industry) => {
    return total + industry.tracks.reduce((trackTotal, track) => {
      return trackTotal + getMaxCarsValue(track.maxCars);
    }, 0);
  }, 0);

  // Calculate location statistics
  const locationsByBlock = locations.reduce((acc: Record<string, number>, location) => {
    acc[location.block] = (acc[location.block] || 0) + 1;
    return acc;
  }, {});

  // Calculate industry statistics
  const industriesByType = industries.reduce((acc: Record<string, number>, industry) => {
    acc[industry.industryType] = (acc[industry.industryType] || 0) + 1;
    return acc;
  }, {});

  // Calculate rolling stock statistics
  const rollingStockByType = rollingStock.reduce((acc: Record<string, { count: number; description: string }>, car) => {
    if (!acc[car.aarType]) {
      acc[car.aarType] = { count: 0, description: car.description };
    }
    acc[car.aarType].count += 1;
    return acc;
  }, {});

  return (
    <Box component="main" sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Layout Statistics
      </Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 3 }}>
        <Box>
          <Typography variant="h6">Total Locations</Typography>
          <Typography variant="h3" color="text.secondary">{totalLocations}</Typography>
        </Box>
        <Box>
          <Typography variant="h6">Total Industries</Typography>
          <Typography variant="h3" color="text.secondary">{totalIndustries}</Typography>
        </Box>
        <Box>
          <Typography variant="h6">Total Track Capacity</Typography>
          <Typography variant="h3" color="text.secondary">{totalTrackCapacity} cars</Typography>
        </Box>
        <Box>
          <Typography variant="h6">Total Rolling Stock</Typography>
          <Typography variant="h3" color="text.secondary">{totalRollingStock}</Typography>
        </Box>
      </Box>
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
          <Typography variant="subtitle2" sx={{ mt: 1 }}>
            Industries by Type:
          </Typography>
          {Object.entries(industriesByType).map(([type, count]) => (
            <Typography key={type} variant="body2">
              {type}: {count}
            </Typography>
          ))}
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