import { Location } from './Location';
import { Industry } from './Industry';

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