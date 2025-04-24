import { render, screen } from '@testing-library/react';
import About from '../../shared/components/About';

describe('About', () => {
  it('displays the main heading', () => {
    render(<About />);
    const heading = screen.getByRole('heading', { name: /a modern solution for a timeless hobby/i });
    expect(heading).toBeInTheDocument();
  });

  it('displays the project overview section', () => {
    render(<About />);
    const overviewText = screen.getByText(/switch this is a web-based application/i);
    
    expect(overviewText).toBeInTheDocument();
  });

  it('displays the motivation section', () => {
    render(<About />);
    const motivationHeading = screen.getByRole('heading', { name: /why switch this\?/i });
    const motivationText = screen.getByText(/creating and managing switchlists/i);
    
    expect(motivationHeading).toBeInTheDocument();
    expect(motivationText).toBeInTheDocument();
  });

  it('displays the creator section', () => {
    render(<About />);
    const creatorHeading = screen.getByRole('heading', { name: /meet the creator: paige watson/i });
    const creatorText = screen.getByText(/hi, i'm paige watson/i);
    
    expect(creatorHeading).toBeInTheDocument();
    expect(creatorText).toBeInTheDocument();
  });

  it('displays the core principles section', () => {
    render(<About />);
    const principlesHeading = screen.getByRole('heading', { name: /core principles/i });
    const softwareCraftHeading = screen.getByRole('heading', { name: /software as craft/i });
    const userDesignHeading = screen.getByRole('heading', { name: /user-centered design/i });
    
    expect(principlesHeading).toBeInTheDocument();
    expect(softwareCraftHeading).toBeInTheDocument();
    expect(userDesignHeading).toBeInTheDocument();
  });

  it('displays the key features section', () => {
    render(<About />);
    const featuresHeading = screen.getByRole('heading', { name: /key features/i });
    
    expect(featuresHeading).toBeInTheDocument();
  });

  it('displays the community commitment section', () => {
    render(<About />);
    const communityHeading = screen.getByRole('heading', { name: /committed to the community/i });
    
    expect(communityHeading).toBeInTheDocument();
  });
}); 