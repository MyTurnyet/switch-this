'use client';

import LayoutState from './LayoutState';
import { services } from '../shared/services/clientServices';

export default function LayoutStatePage() {
  return <LayoutState services={services} />;
} 