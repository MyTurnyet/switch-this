import React from 'react';
import { render, screen } from '@testing-library/react';
import RollingStockPage from '../../pages/RollingStock';

// Mock the rolling stock data
jest.mock('../../data/rolling-stock.json', () => [
  {
    _id: { $oid: '1' },
    roadName: 'CP',
    roadNumber: 123456,
    aarType: 'FB',
    description: 'Flatcar',
    color: 'RED',
    note: 'Test Note',
    homeYard: { $oid: 'yard1' },
    ownerId: { $oid: 'owner1' }
  },
  {
    _id: { $oid: '2' },
    roadName: 'CN',
    roadNumber: 789012,
    aarType: 'FB',
    description: 'Flatcar',
    color: 'GREEN',
    note: '',
    homeYard: { $oid: 'yard2' },
    ownerId: { $oid: 'owner1' }
  }
]);

describe('RollingStockPage', () => {
  it('renders the page title and subtitle', () => {
    render(<RollingStockPage />);
    expect(screen.getByText('Rolling Stock Inventory')).toBeInTheDocument();
    expect(screen.getByText('View and manage your rolling stock inventory')).toBeInTheDocument();
  });

  it('renders all table headers', () => {
    render(<RollingStockPage />);
    const headers = ['Road Name', 'Road Number', 'AAR Type', 'Description', 'Color', 'Notes'];
    headers.forEach(header => {
      expect(screen.getByText(header)).toBeInTheDocument();
    });
  });

  it('renders the correct number of rows', () => {
    render(<RollingStockPage />);
    // Add 1 for the header row
    expect(screen.getAllByRole('row')).toHaveLength(3);
  });

  it('renders the correct data in the table', () => {
    render(<RollingStockPage />);
    
    // Check first row data
    const firstRow = screen.getAllByRole('row')[1];
    expect(firstRow).toHaveTextContent('CP');
    expect(firstRow).toHaveTextContent('123456');
    expect(firstRow).toHaveTextContent('FB');
    expect(firstRow).toHaveTextContent('Flatcar');
    expect(firstRow).toHaveTextContent('RED');
    expect(firstRow).toHaveTextContent('Test Note');

    // Check second row data
    const secondRow = screen.getAllByRole('row')[2];
    expect(secondRow).toHaveTextContent('CN');
    expect(secondRow).toHaveTextContent('789012');
    expect(secondRow).toHaveTextContent('FB');
    expect(secondRow).toHaveTextContent('Flatcar');
    expect(secondRow).toHaveTextContent('GREEN');
  });

  it('renders empty notes as empty string', () => {
    render(<RollingStockPage />);
    const emptyNoteCell = screen.getAllByRole('cell').find(cell => cell.textContent === '');
    expect(emptyNoteCell).toBeInTheDocument();
  });
}); 