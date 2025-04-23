'use client';

import React from 'react';
import { Box, Container, Typography, Button } from '@mui/material';
import Link from 'next/link';

export default function NotFound() {
  return (
    <Box
      component="main"
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #F7FAFC 0%, #EDF2F7 100%)',
        py: 8,
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center' }}>
          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: '2.5rem', md: '3rem' },
              fontWeight: 800,
              mb: 4,
              color: '#2D3748',
            }}
          >
            404 - Page Not Found
          </Typography>
          <Typography
            variant="body1"
            sx={{ mb: 4, color: '#4A5568' }}
          >
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </Typography>
          <Button
            component={Link}
            href="/"
            variant="contained"
            color="primary"
            sx={{ textTransform: 'none' }}
          >
            Go back home
          </Button>
        </Box>
      </Container>
    </Box>
  );
} 