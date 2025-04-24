import { Box, Typography, Chip } from '@mui/material';
import { Industry as IndustryType, RollingStock } from '@shared/types/models';
import { FC } from 'react';
import { Track } from './Track';

interface IndustryProps {
  industry: IndustryType;
  rollingStock: Record<string, RollingStock>;
  carsAtLocation: string[];
}

export const Industry: FC<IndustryProps> = ({ industry, rollingStock, carsAtLocation }) => {
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
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          {industry.name}
        </Typography>
        <Chip 
          label={industry.industryType} 
          size="small" 
          sx={{ 
            fontSize: '0.75rem',
            bgcolor: industry.industryType === 'FREIGHT' ? 'primary.light' :
                    industry.industryType === 'YARD' ? 'secondary.light' :
                    'info.light',
            color: 'white',
            fontWeight: 'medium'
          }} 
        />
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {industry.tracks.map(track => (
          <Track
            key={track._id.$oid}
            track={track}
            locationId={industry.locationId.$oid}
            rollingStock={rollingStock}
            carsAtLocation={carsAtLocation}
          />
        ))}
      </Box>
    </Box>
  );
}; 