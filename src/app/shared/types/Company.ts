import { Location } from './Location';
import { Industry } from '@/app/shared/types/models';

export interface Company {
  id: string;
  name: string;
  description: string;
  industry: Industry;
  location: Location;
  employeeCount: number;
  founded: Date;
  website: string;
} 