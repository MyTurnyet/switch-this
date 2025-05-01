import { render, screen } from '@testing-library/react';
import SwitchlistsPage from '../page';

describe('SwitchlistsPage', () => {
  it('renders the switchlists page with heading', () => {
    render(<SwitchlistsPage />);
    
    // Verify the heading is displayed
    expect(screen.getByText('Switchlists')).toBeInTheDocument();
    
    // Verify the description is displayed
    expect(screen.getByText('Manage and generate switchlists for your train operations.')).toBeInTheDocument();
    
    // Verify the button is displayed
    expect(screen.getByText('Create New Switchlist')).toBeInTheDocument();
  });
}); 