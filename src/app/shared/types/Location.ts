// This defines a physical location with geographic coordinates
// This is different from the railway location model defined in models.ts
export interface PhysicalLocation {
  id: string;
  name: string;
  address: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

// For backward compatibility
export type Location = PhysicalLocation; 