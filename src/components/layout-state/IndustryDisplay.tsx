import { Box, Typography, Chip } from '@mui/material';
import { Industry as IndustryType, RollingStock } from '@shared/types/models';
import { FC } from 'react';
import { TrackDisplay } from './TrackDisplay';

interface IndustryDisplayProps {
  industry: IndustryType;
  rollingStock: Record<string, RollingStock>;
}

export const IndustryDisplay: FC<IndustryDisplayProps> = ({ industry, rollingStock }) => {
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
        />
      ))}
    </Box>
  );
}; 