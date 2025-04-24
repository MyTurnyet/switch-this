'use client';

import { LayoutProvider } from '../shared/contexts/LayoutContext';
import LayoutState from './LayoutState';
import { Industry, Location, TrainRoute, RollingStock } from '../shared/types/models';

interface LayoutStatePageProps {
  initialState?: {
    locations: Location[];
    industries: Industry[];
    trainRoutes?: TrainRoute[];
    rollingStock: RollingStock[];
  };
}

export default function LayoutStatePage({ initialState }: LayoutStatePageProps) {
  return (
    <LayoutProvider initialState={initialState}>
      <LayoutState />
    </LayoutProvider>
  );
} 