import { RollingStock } from '@/shared/types/models';

export class RollingStockService {
  async getAllRollingStock(): Promise<RollingStock[]> {
    const response = await fetch('/api/rolling-stock');
    if (!response.ok) {
      throw new Error('Failed to load rolling stock');
    }
    return response.json();
  }
} 