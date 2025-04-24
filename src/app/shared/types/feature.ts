export interface Feature {
  id: string;
  title: string;
  description: string;
  icon: string;
  status: 'active' | 'inactive' | 'pending';
} 