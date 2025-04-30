import { Industry, RollingStock } from '@/app/shared/types/models';

export interface LayoutStateData {
  _id?: string;
  industries: Industry[];
  rollingStock: RollingStock[];
  updatedAt?: Date;
}

export class LayoutStateService {
  private endpoint = '/api/layout-state';
  
  /**
   * Get the current layout state from the database
   * Returns null if no state exists
   */
  async getLayoutState(): Promise<LayoutStateData | null> {
    try {
      const response = await fetch(this.endpoint);
      
      if (!response.ok) {
        throw new Error('Failed to fetch layout state');
      }
      
      const data = await response.json();
      
      // If there's no state in the database yet
      if (!data.exists && data.exists === false) {
        return null;
      }
      
      return data as LayoutStateData;
    } catch (error) {
      console.error('Error fetching layout state:', error);
      return null;
    }
  }
  
  /**
   * Save the current layout state to the database
   */
  async saveLayoutState(state: LayoutStateData): Promise<LayoutStateData> {
    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(state),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save layout state');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error saving layout state:', error);
      throw error;
    }
  }
}

// This is just used to make this file a valid test module
// The real tests are in __tests__/LayoutStateService.test.ts
describe('LayoutStateService placeholder', () => {
  it('is a valid test file', () => {
    expect(true).toBe(true);
  });
}); 