import { RollingStock } from '@/app/shared/types/models';

export class RollingStockService {
  async getAllRollingStock(): Promise<RollingStock[]> {
    const response = await fetch('/api/rolling-stock');
    if (!response.ok) {
      throw new Error('Failed to fetch rolling stock');
    }
    return response.json();
  }

  async updateRollingStock(id: string, rollingStock: RollingStock): Promise<void> {
    const response = await fetch(`/api/rolling-stock/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(rollingStock),
    });
    if (!response.ok) {
      throw new Error('Failed to update rolling stock');
    }
  }

  async resetToHomeYards(): Promise<void> {
    const allRollingStock = await this.getAllRollingStock();
    
    for (const car of allRollingStock) {
      const updatedCar: RollingStock = {
        ...car,
        currentLocation: {
          industryId: car.homeYard,
          trackId: car.homeYard
        }
      };
      await this.updateRollingStock(car._id, updatedCar);
    }
  }
} 