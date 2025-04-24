'use client';

import React from 'react';
import { Box, Container, Typography } from '@mui/material';
import { FeatureCard } from '@app/shared/components/FeatureCard';
import { Feature } from '@app/shared/types/feature';
import Dashboard from '@app/components/Dashboard';
import locationsData from '@data/locations.json';
import industriesData from '@data/industries.json';
import rollingStockData from '@data/rolling-stock.json';
import { MongoId, Industry } from '@shared/types/models';

const features: Feature[] = [
  {
    id: 'switchlist',
    title: 'Switchlist Management',
    description: 'Create, edit, and organize your switchlists with an intuitive interface.',
    icon: 'list',
    status: 'active' as const
  },
  {
    id: 'rolling-stock',
    title: 'Rolling Stock Tracking',
    description: 'Keep detailed records of your locomotives and cars with ease.',
    icon: 'train',
    status: 'active' as const
  },
  {
    id: 'operations',
    title: 'Operations Planning',
    description: 'Plan and optimize your railroad operations efficiently.',
    icon: 'schedule',
    status: 'active' as const
  }
];

const isValidIndustryType = (type: string): type is 'FREIGHT' | 'YARD' | 'PASSENGER' => {
  return ['FREIGHT', 'YARD', 'PASSENGER'].includes(type);
};

const transformedIndustries = industriesData.map(industry => {
  if (!isValidIndustryType(industry.industryType)) {
    console.warn(`Invalid industry type: ${industry.industryType}`);
    return { 
      ...industry, 
      industryType: 'FREIGHT' as 'FREIGHT' | 'YARD' | 'PASSENGER',
      _id: { $oid: industry._id.$oid } as MongoId,
      locationId: { $oid: industry.locationId.$oid } as MongoId,
      ownerId: { $oid: industry.ownerId.$oid } as MongoId,
      tracks: industry.tracks.map(track => ({
        ...track,
        _id: { $oid: track._id.$oid } as MongoId,
        maxCars: parseInt(track.maxCars.$numberInt),
        placedCars: []
      }))
    } as Industry;
  }
  return {
    ...industry,
    industryType: industry.industryType as 'FREIGHT' | 'YARD' | 'PASSENGER',
    _id: { $oid: industry._id.$oid } as MongoId,
    locationId: { $oid: industry.locationId.$oid } as MongoId,
    ownerId: { $oid: industry.ownerId.$oid } as MongoId,
    tracks: industry.tracks.map(track => ({
      ...track,
      _id: { $oid: track._id.$oid } as MongoId,
      maxCars: parseInt(track.maxCars.$numberInt),
      placedCars: []
    }))
  } as Industry;
});

const transformedRollingStock = rollingStockData.map(car => ({
  ...car,
  _id: { $oid: car._id.$oid } as MongoId,
  roadNumber: car.roadNumber.toString(),
  homeYard: { $oid: car.homeYard.$oid } as MongoId,
  ownerId: { $oid: car.ownerId.$oid } as MongoId
}));

export default function Home() {
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
        <Box
          sx={{
            mb: 8,
            textAlign: 'center',
            px: 4
          }}
        >
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
              mb: 3,
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
            }}
          >
            Model Railroad Switchlist Generator
          </Typography>
          <Typography
            variant="h5"
            color="text.secondary"
            sx={{
              maxWidth: '800px',
              mx: 'auto',
              lineHeight: 1.6
            }}
          >
            Generate and manage switchlists for your model railroad with ease. Keep track of your rolling stock and optimize your operations.
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              md: 'repeat(3, 1fr)'
            },
            gap: 4,
            px: 2,
            mb: 8
          }}
        >
          {features.map((feature, index) => (
            <Box key={index}>
              <FeatureCard
                feature={feature}
              />
            </Box>
          ))}
        </Box>

        <Dashboard 
          locations={locationsData} 
          industries={transformedIndustries}
          rollingStock={transformedRollingStock}
        />
      </Container>
    </Box>
  );
}
