# Train Routes Page

This page provides a view of all train routes in the system, displaying key information about each route including originating and terminating yards, and the stations along the route.

## Features

- Displays all train routes in a card-based layout
- Shows route name, route number, and route type (MIXED, PASSENGER, FREIGHT)
- Color-codes routes by type for easy identification
- Lists originating and terminating yards for each route
- Provides a numbered list of stations in sequence for each route

## Usage

Navigate to `/train-routes` in the browser to view the page.

## Data Structure

The page uses the following data structure:

```typescript
// Train Route structure
interface TrainRoute {
  _id: string;
  name: string;
  routeNumber: string;
  routeType: 'MIXED' | 'PASSENGER' | 'FREIGHT';
  originatingYardId: string;
  terminatingYardId: string;
  stations: string[]; // Array of location IDs
  ownerId: string;
}

// Location structure
interface Location {
  _id: string;
  stationName: string;
  block: string;
  ownerId: string;
}
```

## Data Flow

1. The page fetches train routes and locations from their respective API endpoints
2. It processes the data to display each train route with its associated locations
3. The page uses the location data to resolve station IDs to their proper names

## Component Structure

- Main container
  - Route cards (for each train route)
    - Route header (name, number, type)
    - Route details (originating yard, terminating yard)
    - Stations list (numbered sequence of stations)

## Styling

- The routes are color-coded based on their type:
  - MIXED: Light green
  - PASSENGER: Light purple
  - FREIGHT: Light blue

## Error Handling

The page handles API errors gracefully, displaying a user-friendly error message when data cannot be fetched.

## Performance Considerations

- Data is fetched only once on component mount
- Multiple API requests are made in parallel using Promise.all for better performance 