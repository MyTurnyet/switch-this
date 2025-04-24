'use client';

import React from 'react';
import { Container, Box, Typography } from '@mui/material';
import { FeatureCard } from './shared/components/FeatureCard';
import Dashboard from './components/Dashboard';
import locationsData from '@data/locations.json';
import industriesData from '@data/industries.json';
import rollingStockData from '@data/rolling-stock.json';

const features = [
  {
    title: 'Switchlist Management',
    description: 'Create, edit, and organize your switchlists with an intuitive interface.'
  },
  {
    title: 'Rolling Stock Tracking',
    description: 'Keep detailed records of your locomotives and cars with ease.'
  },
  {
    title: 'Operations Planning',
    description: 'Plan and optimize your railroad operations efficiently.'
  }
];

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
                title={feature.title}
                description={feature.description}
              />
            </Box>
          ))}
        </Box>

        <Dashboard 
          locations={locationsData} 
          industries={industriesData} 
          rollingStock={rollingStockData}
        />
      </Container>
    </Box>
  );
}
