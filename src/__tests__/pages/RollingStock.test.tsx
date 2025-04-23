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

  it('renders all rolling stock cards with correct information', () => {
    render(<RollingStockPage />);
    
    // First card
    expect(screen.getByText('CP 123456')).toBeInTheDocument();
    expect(screen.getAllByText('FB')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Flatcar')[0]).toBeInTheDocument();
    expect(screen.getByText('RED')).toBeInTheDocument();
    expect(screen.getByText('Test Note')).toBeInTheDocument();

    // Second card
    expect(screen.getByText('CN 789012')).toBeInTheDocument();
    expect(screen.getAllByText('FB')[1]).toBeInTheDocument();
    expect(screen.getAllByText('Flatcar')[1]).toBeInTheDocument();
    expect(screen.getByText('GREEN')).toBeInTheDocument();
  });

  it('renders the correct number of cards', () => {
    render(<RollingStockPage />);
    const cards = screen.getAllByRole('article');
    expect(cards).toHaveLength(2);
  });

  it('only renders note chips when notes exist', () => {
    render(<RollingStockPage />);
    const noteChips = screen.getAllByText(/Test Note|GREEN|RED|FB/);
    // We should have 6 chips: 2 FB chips, 1 RED chip, 1 GREEN chip, and 1 Test Note chip
    expect(noteChips).toHaveLength(5);
  });
}); 