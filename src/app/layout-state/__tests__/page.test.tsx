import { render, screen } from '@testing-library/react';
import LayoutStatePage from '../page';

jest.mock('../container', () => {
  return function MockLayoutStateContainer() {
    return <div data-testid="layout-state-container">Layout State Container</div>;
  };
});

describe('LayoutStatePage', () => {
  it('renders the LayoutStateContainer', () => {
    render(<LayoutStatePage />);
    expect(screen.getByTestId('layout-state-container')).toBeInTheDocument();
  });
}); 