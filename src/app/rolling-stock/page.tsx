'use client';

import React from 'react';
import RollingStock from './RollingStock';
import { services } from '../shared/services/clientServices';

export default function RollingStockPage() {
  return <RollingStock services={services} />;
} 