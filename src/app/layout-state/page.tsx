'use client';

import { LayoutProvider } from '../shared/contexts/LayoutContext';
import LayoutState from './LayoutState';
import { Industry, Location, RollingStock } from '../../shared/types/models';

interface LayoutStatePageProps {
  initialState?: {
    locations: Location[];
    industries: Industry[];
    rollingStock: RollingStock[];
  };
}

export default function LayoutStatePage({ initialState = { locations: [], industries: [], rollingStock: [] } }: LayoutStatePageProps) {
  return (
    <LayoutProvider initialState={initialState}>
      <LayoutState />
    </LayoutProvider>
  );
} 