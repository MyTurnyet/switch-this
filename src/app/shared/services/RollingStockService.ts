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
    console.log('Starting reset to home yards operation');
    
    try {
      const response = await fetch('/api/rolling-stock/reset', {
        method: 'POST',
      });
      
      if (!response.ok) {
        try {
          const errorData = await response.json();
          console.error('Reset API returned error:', errorData);
          throw new Error('Failed to reset rolling stock');
        } catch (jsonError) {
          // If JSON parsing fails, use a generic error
          throw new Error('Failed to reset rolling stock');
        }
      }
      
      console.log('Reset operation completed successfully');
    } catch (error) {
      console.error('Error during reset operation:', error);
      throw error;
    }
  }
} 