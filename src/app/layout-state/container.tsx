'use client';

import { useEffect, useState } from 'react';
import { LayoutState } from '@state/layout-state';
import { Location, Industry, RollingStock } from '@shared/types/models';
import CurrentLayoutState from '@components/layout-state/current-layout-state';
import { Box, CircularProgress, Typography } from '@mui/material';

export default function LayoutStateContainer() {
  const [layoutState] = useState<LayoutState>(new LayoutState());
  const [locations, setLocations] = useState<Location[]>([]);
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [rollingStock, setRollingStock] = useState<Record<string, RollingStock>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch locations
        const locationsResponse = await fetch('/api/locations');
        if (!locationsResponse.ok) throw new Error('Failed to fetch locations');
        const locationsData = await locationsResponse.json();
        setLocations(locationsData);

        // Fetch industries
        const industriesResponse = await fetch('/api/industries');
        if (!industriesResponse.ok) throw new Error('Failed to fetch industries');
        const industriesData = await industriesResponse.json();
        setIndustries(industriesData);

        // Fetch rolling stock
        const rollingStockResponse = await fetch('/api/rolling-stock');
        if (!rollingStockResponse.ok) throw new Error('Failed to fetch rolling stock');
        const rollingStockData = await rollingStockResponse.json();
        
        // Convert rolling stock array to a map for easier lookup
        const rollingStockMap = rollingStockData.reduce((acc: Record<string, RollingStock>, car: RollingStock) => {
          acc[car._id.$oid] = car;
          return acc;
        }, {});
        setRollingStock(rollingStockMap);

        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, color: 'error.main' }}>
        <Typography variant="h6">Error: {error}</Typography>
      </Box>
    );
  }

  return (
    <CurrentLayoutState 
      layoutState={layoutState}
      locations={locations}
      industries={industries}
      rollingStock={rollingStock}
    />
  );
} 