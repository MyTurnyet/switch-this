'use client';

import React, { useState } from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { Feature } from '../types/feature';

interface FeatureCardProps {
  feature: Feature;
}

export const FeatureCard = ({ feature }: FeatureCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Card
      data-testid="feature-card"
      sx={{
        p: 2,
        borderRadius: 2,
        boxShadow: isHovered ? 8 : 2,
        transform: isHovered ? 'translateY(-8px)' : 'translateY(0)',
        transition: 'all 0.3s ease-in-out',
        position: 'relative',
        overflow: 'hidden',
        background: isHovered 
          ? 'linear-gradient(135deg, #6B46C1 0%, #4299E1 100%)'
          : 'linear-gradient(135deg, #ffffff 0%, #f7fafc 100%)',
        border: '1px solid',
        borderColor: isHovered ? 'primary.main' : 'grey.200',
        height: '100%'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardContent>
        <Box display="flex" alignItems="center" mb={2}>
          <Typography
            variant="h6"
            sx={{
              color: isHovered ? 'common.white' : 'primary.main',
              fontWeight: 700,
              transition: 'color 0.3s ease-in-out'
            }}
          >
            {feature.title}
          </Typography>
        </Box>
        <Typography
          variant="body1"
          sx={{
            color: isHovered ? 'common.white' : 'text.secondary',
            fontSize: '1.125rem',
            lineHeight: 1.6,
            transition: 'color 0.3s ease-in-out'
          }}
        >
          {feature.description}
        </Typography>
        <Typography variant="body2" color="text.secondary" mt={2}>
          Status: {feature.status}
        </Typography>
      </CardContent>
    </Card>
  );
}; 