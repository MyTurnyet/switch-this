import { Box, Typography, Chip } from '@mui/material';
import { Industry as IndustryType, RollingStock } from '@shared/types/models';
import { FC } from 'react';
import { TrackDisplay } from './TrackDisplay';
import { LayoutState } from '@state/layout-state';

interface IndustryDisplayProps {
  industry: IndustryType;
  rollingStock: Record<string, RollingStock>;
  carsAtLocation: string[];
  layoutState: LayoutState;
}

export const IndustryDisplay: FC<IndustryDisplayProps> = ({ industry, rollingStock, carsAtLocation, layoutState }) => {
  const getIndustryTypeColor = (type: string) => {
    switch (type) {
      case 'FREIGHT':
        return 'primary';
      case 'YARD':
        return 'secondary';
      default:
        return 'default';
    }
  };

  return (
    <Box 
      sx={{ 
        ml: 2, 
        mb: 3,
        p: 2,
        bgcolor: 'background.paper',
        borderRadius: 2,
        boxShadow: 1
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ mr: 2 }}>
          {industry.name}
        </Typography>
        <Chip 
          label={industry.industryType}
          color={getIndustryTypeColor(industry.industryType)}
          size="small"
        />
      </Box>
      {industry.tracks.map(track => (
        <TrackDisplay
          key={track._id.$oid}
          track={track}
          rollingStock={rollingStock}
          carsAtLocation={carsAtLocation}
        />
      ))}
    </Box>
  );
}; 