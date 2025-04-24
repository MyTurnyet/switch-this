import { render, screen } from '@testing-library/react';
import About from '@/shared/components/About';

describe('About', () => {
  it('renders the about page title', () => {
    render(<About />);
    const titleElement = screen.getByRole('heading', { name: /about switch this/i });
    expect(titleElement).toBeInTheDocument();
  });

  it('displays project overview section', () => {
    render(<About />);
    const overviewHeading = screen.getByRole('heading', { name: /overview/i });
    const overviewText = screen.getByText(/switchlist generator is a web-based tool/i);
    
    expect(overviewHeading).toBeInTheDocument();
    expect(overviewText).toBeInTheDocument();
  });

  it('displays key features section', () => {
    render(<About />);
    const featuresHeading = screen.getByRole('heading', { name: /key features/i });
    const featuresList = screen.getByRole('list', { name: /key features list/i });
    
    expect(featuresHeading).toBeInTheDocument();
    expect(featuresList).toBeInTheDocument();
    expect(screen.getByText(/modern ui/i)).toBeInTheDocument();
    expect(screen.getByText(/industry management/i)).toBeInTheDocument();
    expect(screen.getByText(/location tracking/i)).toBeInTheDocument();
  });

  it('displays tech stack section with working links', () => {
    render(<About />);
    const techStackHeading = screen.getByRole('heading', { name: /tech stack/i });
    const techList = screen.getAllByRole('listitem');
    
    expect(techStackHeading).toBeInTheDocument();
    expect(techList.length).toBeGreaterThan(0);
    
    const nextjsLink = screen.getByRole('link', { name: /next\.js/i });
    const typescriptLink = screen.getByRole('link', { name: /typescript/i });
    const muiLink = screen.getByRole('link', { name: /material-ui/i });
    
    expect(nextjsLink).toHaveAttribute('href', 'https://nextjs.org');
    expect(typescriptLink).toHaveAttribute('href', 'https://www.typescriptlang.org');
    expect(muiLink).toHaveAttribute('href', 'https://mui.com');
    expect(nextjsLink).toHaveAttribute('target', '_blank');
    expect(typescriptLink).toHaveAttribute('target', '_blank');
    expect(muiLink).toHaveAttribute('target', '_blank');
  });
}); 