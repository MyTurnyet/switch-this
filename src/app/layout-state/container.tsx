'use client';

import { useEffect, useState } from 'react';
import { LayoutState } from '@state/layout-state';
import { Location, Industry, RollingStock } from '@shared/types/models';
import CurrentLayoutState from '@components/layout-state/current-layout-state';
import { Box, CircularProgress, Typography, Button, Container } from '@mui/material';

export default function LayoutStateContainer() {
  const [layoutState, setLayoutState] = useState<LayoutState>(new LayoutState());
  const [locations, setLocations] = useState<Location[]>([]);
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [rollingStock, setRollingStock] = useState<Record<string, RollingStock>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchLocations(): Promise<Location[]> {
    const response = await fetch('/api/locations');
    if (!response.ok) throw new Error('Failed to fetch locations');
    return response.json();
  }

  async function fetchIndustries(): Promise<Industry[]> {
    const response = await fetch('/api/industries');
    if (!response.ok) throw new Error('Failed to fetch industries');
    return response.json();
  }

  async function fetchRollingStock(): Promise<RollingStock[]> {
    const response = await fetch('/api/rolling-stock');
    if (!response.ok) throw new Error('Failed to fetch rolling stock');
    return response.json();
  }

  function convertRollingStockArrayToMap(rollingStockArray: RollingStock[]): Record<string, RollingStock> {
    return rollingStockArray.reduce((acc: Record<string, RollingStock>, car: RollingStock) => {
      acc[car._id.$oid] = car;
      return acc;
    }, {});
  }

  function placeRollingStockAtHomeYards(rollingStockMap: Record<string, RollingStock>): LayoutState {
    const newLayoutState = new LayoutState();
    Object.entries(rollingStockMap).forEach(([carId, car]) => {
      if (car.homeYard?.$oid) {
        newLayoutState.setCarPosition(carId, car.homeYard.$oid);
      }
    });
    return newLayoutState;
  }

  async function fetchData() {
    try {
      const [locationsData, industriesData, rollingStockData] = await Promise.all([
        fetchLocations(),
        fetchIndustries(),
        fetchRollingStock()
      ]);

      setLocations(locationsData);
      setIndustries(industriesData);

      const rollingStockMap = convertRollingStockArrayToMap(rollingStockData);
      setRollingStock(rollingStockMap);

      const newLayoutState = placeRollingStockAtHomeYards(rollingStockMap);
      setLayoutState(newLayoutState);

      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setLoading(false);
    }
  }

  function resetState() {
    setLayoutState(new LayoutState());
    setLocations([]);
    setIndustries([]);
    setRollingStock({});
    setLoading(true);
    setError(null);
  }

  const handleResetState = () => {
    resetState();
    fetchData();
  };

  useEffect(() => {
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
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          color="secondary"
          onClick={handleResetState}
        >
          Reset State
        </Button>
      </Box>
      <CurrentLayoutState 
        layoutState={layoutState}
        locations={locations}
        industries={industries}
        rollingStock={rollingStock}
      />
    </Container>
  );
} 