'use client';

import { QueryKey } from '@tanstack/react-query';
import { services, ClientServices } from '../../services/clientServices';

// Define query keys constants to ensure consistency across queries
export const QUERY_KEYS = {
  LOCATIONS: ['locations'],
  LOCATION: (id: string) => ['location', id],
  INDUSTRIES: ['industries'],
  INDUSTRY: (id: string) => ['industry', id],
  ROLLING_STOCK: ['rollingStock'],
  ROLLING_STOCK_ITEM: (id: string) => ['rollingStock', id],
  TRAIN_ROUTES: ['trainRoutes'],
  TRAIN_ROUTE: (id: string) => ['trainRoute', id],
  LAYOUT_STATE: ['layoutState'],
  SWITCHLISTS: ['switchlists'],
  SWITCHLIST: (id: string) => ['switchlist', id],
  BLOCKS: ['blocks'],
  BLOCK: (id: string) => ['block', id]
};

// Type to define invalidation relationships
interface InvalidationMap {
  [key: string]: QueryKey[];
}

// Map defining which queries to invalidate when certain mutations occur
export const INVALIDATION_MAP: InvalidationMap = {
  'industry:create': [QUERY_KEYS.INDUSTRIES],
  'industry:update': [QUERY_KEYS.INDUSTRIES],
  'industry:delete': [QUERY_KEYS.INDUSTRIES],
  'location:create': [QUERY_KEYS.LOCATIONS],
  'location:update': [QUERY_KEYS.LOCATIONS],
  'location:delete': [QUERY_KEYS.LOCATIONS],
  'rollingStock:update': [QUERY_KEYS.ROLLING_STOCK],
  'rollingStock:reset': [QUERY_KEYS.ROLLING_STOCK],
  'trainRoute:update': [QUERY_KEYS.TRAIN_ROUTES],
  'layoutState:save': [QUERY_KEYS.LAYOUT_STATE],
  'switchlist:create': [QUERY_KEYS.SWITCHLISTS],
  'switchlist:update': [QUERY_KEYS.SWITCHLISTS],
  'switchlist:delete': [QUERY_KEYS.SWITCHLISTS],
  'block:create': [QUERY_KEYS.BLOCKS],
  'block:update': [QUERY_KEYS.BLOCKS],
  'block:delete': [QUERY_KEYS.BLOCKS]
};

// Export services hook for use in other hooks
export const useServices = (): ClientServices => services; 