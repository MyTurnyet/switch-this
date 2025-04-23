'use client';

import { useEffect, useState } from 'react';
import { LayoutState } from '../../state/layout-state';
import { Location } from '../shared/types/models';
import LayoutStatePage from './page';

export default function LayoutStateContainer() {
  const [layoutState, setLayoutState] = useState<LayoutState>(new LayoutState());
  const [locations, setLocations] = useState<Location[]>([]);
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

        // Fetch rolling stock
        const rollingStockResponse = await fetch('/api/rolling-stock');
        if (!rollingStockResponse.ok) throw new Error('Failed to fetch rolling stock');
        const rollingStockData: any[] = await rollingStockResponse.json();

        // Initialize layout state with current positions
        const newLayoutState = new LayoutState();
        // TODO: Set initial car positions based on fetched data
        setLayoutState(newLayoutState);

        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return <LayoutStatePage layoutState={layoutState} locations={locations} />;
} 