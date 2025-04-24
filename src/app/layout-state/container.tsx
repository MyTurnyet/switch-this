'use client';

import { Container, Box, Typography, Button, CircularProgress } from '@mui/material';
import CurrentLayoutState from '@components/layout-state/current-layout-state';
import { Location, Industry, RollingStock } from '@shared/types/models';
import { LayoutState } from '@state/layout-state';
import { useEffect, useState, useCallback } from 'react';

export default function ContainerComponent() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [rollingStock, setRollingStock] = useState<RollingStock[]>([]);
  const [layoutState, setLayoutState] = useState<LayoutState>(new LayoutState());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [locationsRes, industriesRes, rollingStockRes] = await Promise.all([
        fetch('/api/locations'),
        fetch('/api/industries'),
        fetch('/api/rolling-stock')
      ]);

      if (!locationsRes.ok || !industriesRes.ok || !rollingStockRes.ok) {
        throw new Error('Failed to fetch data');
      }

      const [locationsData, industriesData, rollingStockData] = await Promise.all([
        locationsRes.json(),
        industriesRes.json(),
        rollingStockRes.json()
      ]);

      setLocations(locationsData);
      setIndustries(industriesData);
      setRollingStock(rollingStockData);

      // Place cars at their home yards
      const newLayoutState = new LayoutState();
      rollingStockData.forEach((car: RollingStock) => {
        if (car.homeYard) {
          newLayoutState.setCarPosition(car._id.$oid, car.homeYard.$oid);
        }
      });
      setLayoutState(newLayoutState);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch data');
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleReset = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" gutterBottom>
          Layout State
        </Typography>
        <Button
          variant="contained"
          color="secondary"
          onClick={handleReset}
          disabled={isLoading}
        >
          Reset State
        </Button>
      </Box>

      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress role="progressbar" />
        </Box>
      )}

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      {!isLoading && !error && (
        <CurrentLayoutState
          layoutState={layoutState}
          locations={locations}
          industries={industries}
          rollingStock={rollingStock.reduce((acc, car) => {
            acc[car._id.$oid] = car;
            return acc;
          }, {} as Record<string, RollingStock>)}
        />
      )}
    </Container>
  );
} 