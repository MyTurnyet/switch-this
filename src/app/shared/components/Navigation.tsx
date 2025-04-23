'use client';

import React from 'react';
import Link from 'next/link';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';

export default function Navigation() {
  return (
    <AppBar position="static" sx={{ bgcolor: 'white', boxShadow: 'none' }}>
      <Toolbar>
        <Typography
          variant="h6"
          component={Link}
          href="/"
          sx={{
            flexGrow: 1,
            textDecoration: 'none',
            color: 'primary.main',
            fontWeight: 700
          }}
        >
          Switchlist Generator
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            component={Link}
            href="/rolling-stock"
            sx={{ color: 'text.primary', fontWeight: 500 }}
          >
            Rolling Stock
          </Button>
          <Button
            component={Link}
            href="/industries"
            sx={{ color: 'text.primary', fontWeight: 500 }}
          >
            Industries
          </Button>
          <Button
            component={Link}
            href="/locations"
            sx={{ color: 'text.primary', fontWeight: 500 }}
          >
            Locations
          </Button>
          <Button
            component={Link}
            href="/layout-state"
            sx={{ color: 'text.primary', fontWeight: 500 }}
          >
            Layout State
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
} 