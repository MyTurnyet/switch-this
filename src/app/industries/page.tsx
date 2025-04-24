'use client';

import React from 'react';
import { Container, Box, Typography, Paper } from '@mui/material';
import { Industry, Location, MongoNumber } from '@shared/types/models';
import industriesData from '@data/industries.json';
import locationsData from '@data/locations.json';

const isValidIndustryType = (type: string): type is Industry['industryType'] => {
  return ['FREIGHT', 'YARD', 'PASSENGER'].includes(type);
};

const getMaxCarsValue = (maxCars: number | MongoNumber): number => {
  if (typeof maxCars === 'number') {
    return maxCars;
  }
  return parseInt(maxCars.$numberInt);
};

export default function IndustriesPage() {
  const industriesByBlock = React.useMemo(() => {
    const grouped: Record<string, Record<string, Industry[]>> = {};
    
    industriesData.forEach((rawIndustry) => {
      if (!isValidIndustryType(rawIndustry.industryType)) return;
      const industry = rawIndustry as Industry;
      const location = locationsData.find((loc: Location) => loc._id.$oid === industry.locationId.$oid);
      if (!location) return;
      
      if (!grouped[location.block]) {
        grouped[location.block] = {};
      }
      
      if (!grouped[location.block][location.stationName]) {
        grouped[location.block][location.stationName] = [];
      }
      
      grouped[location.block][location.stationName].push(industry);
    });
    
    return grouped;
  }, []);

  return (
    <Box
      component="main"
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #F7FAFC 0%, #EDF2F7 100%)',
        py: 8
      }}
    >
      <Container maxWidth="lg">
        <Typography
          variant="h1"
          component="h1"
          sx={{
            background: 'linear-gradient(135deg, #6B46C1 0%, #4299E1 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            fontSize: { xs: '2.5rem', md: '3rem' },
            fontWeight: 800,
            mb: 6,
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
          }}
        >
          Industries
        </Typography>
        
        {Object.entries(industriesByBlock).map(([block, locations]) => (
          <Box key={block} sx={{ mb: 6 }}>
            <Typography
              variant="h2"
              sx={{
                fontSize: '2rem',
                fontWeight: 700,
                mb: 4,
                color: '#2D3748'
              }}
            >
              {block}
            </Typography>
            
            {Object.entries(locations).map(([location, industries]) => (
              <Box key={location} sx={{ mb: 4 }}>
                <Typography
                  variant="h3"
                  sx={{
                    fontSize: '1.5rem',
                    fontWeight: 600,
                    mb: 3,
                    color: '#4A5568'
                  }}
                >
                  {location}
                </Typography>
                
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                      xs: '1fr',
                      md: 'repeat(2, 1fr)',
                      lg: 'repeat(3, 1fr)'
                    },
                    gap: 3
                  }}
                >
                  {industries.map((industry) => (
                    <Paper
                      key={industry._id.$oid}
                      elevation={2}
                      sx={{
                        p: 3,
                        borderRadius: 2,
                        bgcolor: 'white'
                      }}
                    >
                      <Typography
                        variant="h4"
                        sx={{
                          fontSize: '1.25rem',
                          fontWeight: 600,
                          mb: 2,
                          color: '#2D3748'
                        }}
                      >
                        {industry.name}
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{ color: '#718096', mb: 2 }}
                      >
                        Type: {industry.industryType}
                      </Typography>
                      <Box>
                        <Typography
                          variant="subtitle2"
                          sx={{ fontWeight: 600, mb: 1 }}
                        >
                          Tracks:
                        </Typography>
                        <Box component="ul" sx={{ pl: 2 }}>
                          {industry.tracks.map((track) => (
                            <Typography
                              key={track._id.$oid}
                              component="li"
                              variant="body2"
                              sx={{ color: '#4A5568' }}
                            >
                              {track.name} (Max Cars: {getMaxCarsValue(track.maxCars)})
                            </Typography>
                          ))}
                        </Box>
                      </Box>
                    </Paper>
                  ))}
                </Box>
              </Box>
            ))}
          </Box>
        ))}
      </Container>
    </Box>
  );
} 