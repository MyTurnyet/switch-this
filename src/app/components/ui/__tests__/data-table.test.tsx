import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { DataTable, type Column } from '../data-table';

// Mock the Lucide icons
jest.mock('lucide-react', () => ({
  ChevronsUpDown: () => <div data-testid="chevrons-up-down" />,
  ChevronUp: () => <div data-testid="chevron-up" />,
  ChevronDown: () => <div data-testid="chevron-down" />,
}));

describe('DataTable Component', () => {
  // Define mock data and columns for testing
  interface TestItem extends Record<string, unknown> {
    id: string;
    name: string;
    age: number;
    status: string;
  }

  const mockData: TestItem[] = [
    { id: '1', name: 'John', age: 30, status: 'Active' },
    { id: '2', name: 'Jane', age: 25, status: 'Inactive' },
    { id: '3', name: 'Bob', age: 40, status: 'Active' },
  ];

  const mockColumns: Column<TestItem>[] = [
    { key: 'name', header: 'Name' },
    { key: 'age', header: 'Age' },
    { key: 'status', header: 'Status' },
  ];

  const mockSortableColumns: Column<TestItem>[] = [
    { key: 'name', header: 'Name', sortable: true },
    { key: 'age', header: 'Age', sortable: true },
    { key: 'status', header: 'Status', sortable: true },
  ];

  const keyExtractor = (item: TestItem) => item.id;

  it('renders a table with the correct data', () => {
    render(<DataTable columns={mockColumns} data={mockData} keyExtractor={keyExtractor} />);
    
    // Check that column headers are rendered
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Age')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    
    // Check that data rows are rendered
    expect(screen.getByText('John')).toBeInTheDocument();
    expect(screen.getByText('30')).toBeInTheDocument();
    expect(screen.getByText('Jane')).toBeInTheDocument();
    expect(screen.getByText('25')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByText('40')).toBeInTheDocument();
  });

  it('renders a loading spinner when isLoading is true', () => {
    render(
      <DataTable 
        columns={mockColumns} 
        data={mockData} 
        keyExtractor={keyExtractor}
        isLoading={true}
      />
    );
    
    expect(screen.getByText('Loading data...')).toBeInTheDocument();
    expect(screen.queryByText('Name')).not.toBeInTheDocument(); // Table should not be visible
  });

  it('renders an error message when error is provided', () => {
    const errorMessage = 'Failed to load data';
    render(
      <DataTable 
        columns={mockColumns} 
        data={mockData} 
        keyExtractor={keyExtractor}
        error={errorMessage}
      />
    );
    
    expect(screen.getByText('Error loading data')).toBeInTheDocument();
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
    expect(screen.queryByText('Name')).not.toBeInTheDocument(); // Table should not be visible
  });

  it('renders an empty message when data is empty', () => {
    const emptyMessage = 'No data available';
    render(
      <DataTable 
        columns={mockColumns} 
        data={[]} 
        keyExtractor={keyExtractor}
        emptyMessage={emptyMessage}
      />
    );
    
    expect(screen.getByText(emptyMessage)).toBeInTheDocument();
    expect(screen.queryByText('Name')).not.toBeInTheDocument(); // Table should not be visible
  });

  it('renders a custom empty message when provided', () => {
    const customEmptyMessage = 'No results found. Try a different search.';
    render(
      <DataTable 
        columns={mockColumns} 
        data={[]} 
        keyExtractor={keyExtractor}
        emptyMessage={customEmptyMessage}
      />
    );
    
    expect(screen.getByText(customEmptyMessage)).toBeInTheDocument();
  });

  it('calls onRowClick when a row is clicked', () => {
    const handleRowClick = jest.fn();
    render(
      <DataTable 
        columns={mockColumns} 
        data={mockData} 
        keyExtractor={keyExtractor}
        onRowClick={handleRowClick}
      />
    );
    
    // Click on the first row
    fireEvent.click(screen.getByText('John').closest('tr')!);
    expect(handleRowClick).toHaveBeenCalledWith(mockData[0]);
    
    // Click on the second row
    fireEvent.click(screen.getByText('Jane').closest('tr')!);
    expect(handleRowClick).toHaveBeenCalledWith(mockData[1]);
  });

  it('does not attach click handlers when onRowClick is not provided', () => {
    const { container } = render(
      <DataTable 
        columns={mockColumns} 
        data={mockData} 
        keyExtractor={keyExtractor}
      />
    );
    
    // Get all rows
    const rows = container.querySelectorAll('tbody tr');
    
    // Check that rows don't have click handler classes
    rows.forEach(row => {
      expect(row).not.toHaveClass('cursor-pointer');
      expect(row).not.toHaveClass('hover:bg-gray-50');
    });
  });

  it('supports custom cell rendering with accessor function', () => {
    const columnsWithAccessor: Column<TestItem>[] = [
      ...mockColumns,
      { 
        key: 'custom', 
        header: 'Custom', 
        accessor: (item) => <button data-testid={`custom-${item.id}`}>{item.name.toUpperCase()}</button>
      },
    ];
    
    render(
      <DataTable 
        columns={columnsWithAccessor} 
        data={mockData} 
        keyExtractor={keyExtractor}
      />
    );
    
    // Check that custom rendered cells are present
    expect(screen.getByTestId('custom-1')).toHaveTextContent('JOHN');
    expect(screen.getByTestId('custom-2')).toHaveTextContent('JANE');
    expect(screen.getByTestId('custom-3')).toHaveTextContent('BOB');
  });

  it('applies zebra striping when zebra is true', () => {
    const { container } = render(
      <DataTable 
        columns={mockColumns} 
        data={mockData} 
        keyExtractor={keyExtractor}
        zebra={true}
      />
    );
    
    // Get all rows in the table body
    const rows = container.querySelectorAll('tbody tr');
    
    // First row (index 0) should not have zebra striping
    expect(rows[0]).not.toHaveClass('bg-gray-50');
    
    // Second row (index 1) should have zebra striping
    expect(rows[1]).toHaveClass('bg-gray-50');
    
    // Third row (index 2) should not have zebra striping
    expect(rows[2]).not.toHaveClass('bg-gray-50');
  });

  it('does not apply zebra striping when zebra is false', () => {
    const { container } = render(
      <DataTable 
        columns={mockColumns} 
        data={mockData} 
        keyExtractor={keyExtractor}
        zebra={false}
      />
    );
    
    // Get all rows in the table body
    const rows = container.querySelectorAll('tbody tr');
    
    // No rows should have zebra striping
    rows.forEach(row => {
      expect(row).not.toHaveClass('bg-gray-50');
    });
  });

  it('applies border when bordered is true', () => {
    const { container } = render(
      <DataTable 
        columns={mockColumns} 
        data={mockData} 
        keyExtractor={keyExtractor}
        bordered={true}
      />
    );
    
    // Table should have border classes
    const table = container.querySelector('table');
    expect(table).toHaveClass('border');
    expect(table).toHaveClass('border-gray-200');
  });

  it('does not apply border when bordered is false', () => {
    const { container } = render(
      <DataTable 
        columns={mockColumns} 
        data={mockData} 
        keyExtractor={keyExtractor}
        bordered={false}
      />
    );
    
    // Table should not have border classes
    const table = container.querySelector('table');
    expect(table).not.toHaveClass('border');
    expect(table).not.toHaveClass('border-gray-200');
  });

  it('applies hover styles when hover is true', () => {
    const { container } = render(
      <DataTable 
        columns={mockColumns} 
        data={mockData} 
        keyExtractor={keyExtractor}
        hover={true}
        onRowClick={() => {}}
      />
    );
    
    // All rows should have hover classes
    const rows = container.querySelectorAll('tbody tr');
    rows.forEach(row => {
      expect(row).toHaveClass('hover:bg-gray-50');
      expect(row).toHaveClass('cursor-pointer');
    });
  });

  it('does not apply hover styles when hover is false', () => {
    const { container } = render(
      <DataTable 
        columns={mockColumns} 
        data={mockData} 
        keyExtractor={keyExtractor}
        hover={false}
        onRowClick={() => {}}
      />
    );
    
    // Rows should not have hover class
    const rows = container.querySelectorAll('tbody tr');
    rows.forEach(row => {
      expect(row).not.toHaveClass('hover:bg-gray-50');
    });
  });

  it('applies dense sizing when dense is true', () => {
    const { container } = render(
      <DataTable 
        columns={mockColumns} 
        data={mockData} 
        keyExtractor={keyExtractor}
        dense={true}
      />
    );
    
    // Headers should have dense padding
    const headers = container.querySelectorAll('th');
    headers.forEach(header => {
      expect(header).toHaveClass('px-3');
      expect(header).toHaveClass('py-2');
    });
    
    // Cells should have dense padding
    const cells = container.querySelectorAll('td');
    cells.forEach(cell => {
      expect(cell).toHaveClass('px-3');
      expect(cell).toHaveClass('py-2');
    });
  });

  it('applies normal sizing when dense is false', () => {
    const { container } = render(
      <DataTable 
        columns={mockColumns} 
        data={mockData} 
        keyExtractor={keyExtractor}
        dense={false}
      />
    );
    
    // Headers should have normal padding
    const headers = container.querySelectorAll('th');
    headers.forEach(header => {
      expect(header).toHaveClass('px-6');
      expect(header).toHaveClass('py-3');
    });
    
    // Cells should have normal padding
    const cells = container.querySelectorAll('td');
    cells.forEach(cell => {
      expect(cell).toHaveClass('px-6');
      expect(cell).toHaveClass('py-4');
    });
  });

  it('applies sticky header when stickyHeader is true', () => {
    const { container } = render(
      <DataTable 
        columns={mockColumns} 
        data={mockData} 
        keyExtractor={keyExtractor}
        stickyHeader={true}
      />
    );
    
    // The thead should have sticky classes
    const thead = container.querySelector('thead');
    expect(thead).toHaveClass('sticky');
    expect(thead).toHaveClass('top-0');
    expect(thead).toHaveClass('z-10');
  });

  it('does not apply sticky header when stickyHeader is false', () => {
    const { container } = render(
      <DataTable 
        columns={mockColumns} 
        data={mockData} 
        keyExtractor={keyExtractor}
        stickyHeader={false}
      />
    );
    
    // The thead should not have sticky classes
    const thead = container.querySelector('thead');
    expect(thead).not.toHaveClass('sticky');
    expect(thead).not.toHaveClass('top-0');
    expect(thead).not.toHaveClass('z-10');
  });

  it('displays sort icons for sortable columns', () => {
    render(
      <DataTable 
        columns={mockSortableColumns} 
        data={mockData} 
        keyExtractor={keyExtractor}
        onSort={() => {}}
      />
    );
    
    // All column headers should have sort icons
    const sortIcons = screen.getAllByTestId('chevrons-up-down');
    expect(sortIcons).toHaveLength(3);
  });

  it('does not display sort icons when columns are not sortable', () => {
    render(
      <DataTable 
        columns={mockColumns} // Not sortable
        data={mockData} 
        keyExtractor={keyExtractor}
        onSort={() => {}}
      />
    );
    
    // Should not find any sort icons
    const sortIcons = screen.queryAllByTestId('chevrons-up-down');
    expect(sortIcons).toHaveLength(0);
  });

  it('does not add sort functionality when onSort is not provided', () => {
    const handleSort = jest.fn();
    render(
      <DataTable 
        columns={mockSortableColumns} 
        data={mockData} 
        keyExtractor={keyExtractor}
        // No onSort prop
      />
    );
    
    // Click on a sortable column
    fireEvent.click(screen.getByText('Name'));
    
    // Should not call handleSort
    expect(handleSort).not.toHaveBeenCalled();
  });

  it('calls onSort with the correct arguments when clicking a sortable column', () => {
    const handleSort = jest.fn();
    render(
      <DataTable 
        columns={mockSortableColumns} 
        data={mockData} 
        keyExtractor={keyExtractor}
        onSort={handleSort}
      />
    );
    
    // Click on the 'Name' column header
    fireEvent.click(screen.getByText('Name'));
    expect(handleSort).toHaveBeenCalledWith('name', 'asc');
    
    // Click on the 'Age' column header
    fireEvent.click(screen.getByText('Age'));
    expect(handleSort).toHaveBeenCalledWith('age', 'asc');
  });

  it('changes sort direction when clicking the same column multiple times', () => {
    const handleSort = jest.fn();
    const { rerender } = render(
      <DataTable 
        columns={mockSortableColumns} 
        data={mockData} 
        keyExtractor={keyExtractor}
        onSort={handleSort}
      />
    );
    
    // First click - Sort ascending
    fireEvent.click(screen.getByText('Name'));
    expect(handleSort).toHaveBeenCalledWith('name', 'asc');
    
    // Update the component with the new sort state
    rerender(
      <DataTable 
        columns={mockSortableColumns} 
        data={mockData} 
        keyExtractor={keyExtractor}
        onSort={handleSort}
        sortColumn="name"
        sortDirection="asc"
      />
    );
    
    // Second click - Sort descending
    fireEvent.click(screen.getByText('Name'));
    expect(handleSort).toHaveBeenCalledWith('name', 'desc');
    
    // Update the component with the new sort state
    rerender(
      <DataTable 
        columns={mockSortableColumns} 
        data={mockData} 
        keyExtractor={keyExtractor}
        onSort={handleSort}
        sortColumn="name"
        sortDirection="desc"
      />
    );
    
    // Third click - Clear sort
    fireEvent.click(screen.getByText('Name'));
    expect(handleSort).toHaveBeenCalledWith('name', null);
  });

  it('shows the correct sort icon based on sort direction', () => {
    const { rerender } = render(
      <DataTable 
        columns={mockSortableColumns} 
        data={mockData} 
        keyExtractor={keyExtractor}
        onSort={() => {}}
        sortColumn="name"
        sortDirection="asc"
      />
    );
    
    // Should show up arrow for ascending sort
    expect(screen.getByTestId('chevron-up')).toBeInTheDocument();
    
    // Update to descending sort
    rerender(
      <DataTable 
        columns={mockSortableColumns} 
        data={mockData} 
        keyExtractor={keyExtractor}
        onSort={() => {}}
        sortColumn="name"
        sortDirection="desc"
      />
    );
    
    // Should show down arrow for descending sort
    expect(screen.getByTestId('chevron-down')).toBeInTheDocument();
  });

  it('shows default icon when sort is cleared', () => {
    render(
      <DataTable 
        columns={mockSortableColumns} 
        data={mockData} 
        keyExtractor={keyExtractor}
        onSort={() => {}}
        sortColumn="name"
        sortDirection={null}
      />
    );
    
    // Should show default icon for null sort direction
    const icons = screen.queryAllByTestId('chevrons-up-down');
    expect(icons.length).toBeGreaterThan(0);
  });

  it('supports custom row class names via function', () => {
    const rowClassName = (item: TestItem) => 
      item.status === 'Active' ? 'active-row' : 'inactive-row';
    
    const { container } = render(
      <DataTable 
        columns={mockColumns} 
        data={mockData} 
        keyExtractor={keyExtractor}
        rowClassName={rowClassName}
      />
    );
    
    // Get all rows
    const rows = container.querySelectorAll('tbody tr');
    
    // First row is Active
    expect(rows[0]).toHaveClass('active-row');
    
    // Second row is Inactive
    expect(rows[1]).toHaveClass('inactive-row');
    
    // Third row is Active
    expect(rows[2]).toHaveClass('active-row');
  });

  it('supports custom row class names via string', () => {
    const { container } = render(
      <DataTable 
        columns={mockColumns} 
        data={mockData} 
        keyExtractor={keyExtractor}
        rowClassName="custom-row"
      />
    );
    
    // All rows should have the custom class
    const rows = container.querySelectorAll('tbody tr');
    rows.forEach(row => {
      expect(row).toHaveClass('custom-row');
    });
  });

  it('applies custom class to container', () => {
    const { container } = render(
      <DataTable 
        columns={mockColumns} 
        data={mockData} 
        keyExtractor={keyExtractor}
        className="custom-table-container"
      />
    );
    
    // Find the container div
    const tableContainer = container.querySelector('.overflow-x-auto');
    expect(tableContainer).toHaveClass('custom-table-container');
  });

  it('supports custom class names on columns and headers', () => {
    const columnsWithClasses: Column<TestItem>[] = [
      { 
        key: 'name', 
        header: 'Name',
        className: 'name-cell', 
        headerClassName: 'name-header'
      },
      { 
        key: 'age', 
        header: 'Age',
        className: 'age-cell', 
        headerClassName: 'age-header'
      },
    ];
    
    const { container } = render(
      <DataTable 
        columns={columnsWithClasses} 
        data={mockData} 
        keyExtractor={keyExtractor}
      />
    );
    
    // Check header classes
    const headers = container.querySelectorAll('th');
    expect(headers[0]).toHaveClass('name-header');
    expect(headers[1]).toHaveClass('age-header');
    
    // Check cell classes
    const nameCells = container.querySelectorAll('.name-cell');
    const ageCells = container.querySelectorAll('.age-cell');
    expect(nameCells).toHaveLength(3); // One for each row
    expect(ageCells).toHaveLength(3); // One for each row
  });

  it('renders with a custom sort key different from the column key', () => {
    const handleSort = jest.fn();
    const columnsWithSortKey: Column<TestItem>[] = [
      { 
        key: 'displayName', 
        header: 'Name', 
        accessor: (item) => item.name,
        sortable: true,
        sortKey: 'name' // Use a different key for sorting
      },
    ];
    
    render(
      <DataTable 
        columns={columnsWithSortKey} 
        data={mockData} 
        keyExtractor={keyExtractor}
        onSort={handleSort}
      />
    );
    
    // Click on the 'Name' column header
    fireEvent.click(screen.getByText('Name'));
    
    // Should use the sortKey ('name') instead of the column key ('displayName')
    expect(handleSort).toHaveBeenCalledWith('name', 'asc');
  });

  it('handles undefined values in data gracefully', () => {
    const dataWithUndefined: TestItem[] = [
      { id: '1', name: 'John', age: 30, status: 'Active' },
      { id: '2', name: undefined as unknown as string, age: 25, status: 'Inactive' },
      { id: '3', name: 'Bob', age: undefined as unknown as number, status: 'Active' },
    ];
    
    render(
      <DataTable 
        columns={mockColumns} 
        data={dataWithUndefined} 
        keyExtractor={(item) => item.id}
      />
    );
    
    // Should render without crashing
    expect(screen.getByText('John')).toBeInTheDocument();
    expect(screen.getByText('25')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
  });
}); 