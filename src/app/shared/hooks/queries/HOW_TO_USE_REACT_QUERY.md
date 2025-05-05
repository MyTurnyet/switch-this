# Standardized React Query Implementation

This directory contains standardized hooks for data fetching and state management using [TanStack Query](https://tanstack.com/query) (formerly React Query).

## Key Benefits

1. **Consistent Data Fetching**: All API calls follow the same pattern
2. **Automatic Caching**: Data is cached and reused across components
3. **Automatic Refetching**: Background refetching to keep data fresh
4. **Loading & Error States**: Built-in handling for loading and error states
5. **Optimistic Updates**: Immediate UI updates with automatic rollback on errors
6. **Cache Invalidation**: Coordinated cache updates when data changes

## Core Files

- `useQueries.ts`: Core query keys and invalidation patterns
- `useLocationQueries.ts`: Hooks for location data operations
- `useIndustryQueries.ts`: Hooks for industry data operations
- `useRollingStockQueries.ts`: Hooks for rolling stock data operations
- `useTrainRouteQueries.ts`: Hooks for train route data operations
- `index.ts`: Re-exports all hooks for easy imports

## How to Use

### 1. Fetching Data

```tsx
import { useLocationQueries } from '@/app/shared/hooks/queries';

function LocationsList() {
  const { useLocations } = useLocationQueries();
  const { data, isLoading, error } = useLocations();

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <ul>
      {data?.map(location => (
        <li key={location._id}>{location.stationName}</li>
      ))}
    </ul>
  );
}
```

### 2. Fetching a Single Item

```tsx
import { useLocationQueries } from '@/app/shared/hooks/queries';

function LocationDetail({ id }) {
  const { useLocation } = useLocationQueries();
  const { data, isLoading, error } = useLocation(id);

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div>
      <h1>{data?.stationName}</h1>
      <p>Block: {data?.block}</p>
    </div>
  );
}
```

### 3. Creating Data

```tsx
import { useLocationQueries } from '@/app/shared/hooks/queries';

function AddLocationForm() {
  const { useCreateLocation } = useLocationQueries();
  const createLocation = useCreateLocation();

  const handleSubmit = async (data) => {
    try {
      await createLocation.mutateAsync(data);
      // Success! Show message or redirect
    } catch (error) {
      // Handle error
    }
  };

  return (
    <form onSubmit={handleFormData => handleSubmit(handleFormData)}>
      {/* Form fields */}
    </form>
  );
}
```

### 4. Updating Data

```tsx
import { useLocationQueries } from '@/app/shared/hooks/queries';

function EditLocationForm({ id, location }) {
  const { useUpdateLocation } = useLocationQueries();
  const updateLocation = useUpdateLocation();

  const handleSubmit = async (data) => {
    try {
      await updateLocation.mutateAsync({ 
        id, 
        location: data 
      });
      // Success!
    } catch (error) {
      // Handle error
    }
  };

  return (
    <form onSubmit={handleFormData => handleSubmit(handleFormData)}>
      {/* Form fields */}
    </form>
  );
}
```

### 5. Deleting Data

```tsx
import { useLocationQueries } from '@/app/shared/hooks/queries';

function DeleteLocationButton({ id }) {
  const { useDeleteLocation } = useLocationQueries();
  const deleteLocation = useDeleteLocation();

  const handleDelete = async () => {
    if (confirm('Are you sure?')) {
      try {
        await deleteLocation.mutateAsync(id);
        // Success!
      } catch (error) {
        // Handle error
      }
    }
  };

  return (
    <button 
      onClick={handleDelete}
      disabled={deleteLocation.isPending}
    >
      {deleteLocation.isPending ? 'Deleting...' : 'Delete'}
    </button>
  );
}
```

## Advanced Usage

### 1. Optimistic Updates

For a more responsive UI, you can use optimistic updates to immediately reflect changes:

```tsx
import { useLocationQueries, QUERY_KEYS } from '@/app/shared/hooks/queries';

function EditLocationForm({ id, location }) {
  const queryClient = useQueryClient();
  const { useUpdateLocation } = useLocationQueries();
  
  const updateLocation = useUpdateLocation({
    // When the mutation is triggered, update the location immediately
    onMutate: async ({ id, location }) => {
      // Cancel any outgoing refetches to avoid optimistic update being overwritten
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.LOCATION(id) });
      
      // Snapshot the previous value
      const previousLocation = queryClient.getQueryData(QUERY_KEYS.LOCATION(id));
      
      // Optimistically update to the new value
      queryClient.setQueryData(QUERY_KEYS.LOCATION(id), old => ({
        ...old,
        ...location
      }));
      
      // Return the snapshot
      return { previousLocation };
    },
    // If the mutation fails, roll back to the previous value
    onError: (err, variables, context) => {
      queryClient.setQueryData(
        QUERY_KEYS.LOCATION(variables.id),
        context.previousLocation
      );
    }
  });
  
  // ... rest of component
}
```

## Best Practices

1. **Use the provided hooks**: Don't create custom fetch functions
2. **Follow naming conventions**: Match the naming in the existing hooks
3. **Handle loading and error states**: Always check isLoading and error
4. **Use suspense mode sparingly**: Only in React 18+ with proper fallbacks
5. **Keep mutations separate**: Each mutation should have a single responsibility
6. **Consistent invalidation**: Follow the INVALIDATION_MAP patterns for new mutations

## Debugging

For debugging React Query caches and operations, you can use the built-in DevTools:

```tsx
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// Add this to your root layout or app component
<>
  {/* Your app content */}
  <ReactQueryDevtools initialIsOpen={false} />
</>
``` 