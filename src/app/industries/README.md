# Industries Page

This page provides a view of all industries in the system, grouped first by block and then by location.

## Features

- Displays all industries organized in a hierarchical structure
- Groups industries by their location
- Further groups industries by block within each location
- Color-codes industries by type (FREIGHT, YARD, PASSENGER)
- Shows the number of tracks for each industry

## Usage

Navigate to `/industries` in the browser to view the page.

## Data Structure

The page uses the following data structure:

```typescript
// Location structure
interface Location {
  _id: string;
  stationName: string;
  block: string;
  ownerId: string;
}

// Industry structure
interface Industry {
  _id: string;
  name: string;
  locationId: string;
  blockName: string;
  industryType: IndustryType; // FREIGHT, YARD, or PASSENGER
  tracks: Track[];
  ownerId: string;
}
```

## Data Flow

1. The page fetches locations and industries from their respective API endpoints
2. It converts the API data to match the required model structures
3. It uses the `groupIndustriesByLocationAndBlock` utility to organize the data
4. The grouped data is then rendered in a hierarchical card-based UI

## Component Structure

- Main container
  - Location section (for each location)
    - Block section (for each block within a location)
      - Industry cards (for each industry within a block)

## Styling

- The industries are color-coded based on their type:
  - FREIGHT: Light blue
  - YARD: Light green
  - PASSENGER: Light purple

## Error Handling

The page handles API errors gracefully, displaying a user-friendly error message when data cannot be fetched.

## Performance Considerations

- Data is fetched only once on component mount
- Grouped data is memoized to prevent unnecessary recalculations 