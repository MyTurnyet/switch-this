import React from 'react';
import { render, screen } from '@testing-library/react';
import {
  Form,
  FormGroup,
  FormLabel,
  FormError,
  FormHint,
  FormSection,
  FormActions,
} from '../form';

describe('Form components', () => {
  describe('Form', () => {
    test('renders children', () => {
      render(
        <Form>
          <div>Form Content</div>
        </Form>
      );
      
      expect(screen.getByText('Form Content')).toBeInTheDocument();
    });
    
    test('applies space-y-6 class by default', () => {
      render(
        <Form>
          <div>Form Content</div>
        </Form>
      );
      
      const form = screen.getByText('Form Content').closest('form');
      expect(form).toHaveClass('space-y-6');
    });
    
    test('applies custom className', () => {
      render(
        <Form className="custom-form-class">
          <div>Form Content</div>
        </Form>
      );
      
      const form = screen.getByText('Form Content').closest('form');
      expect(form).toHaveClass('custom-form-class');
    });
  });
  
  describe('FormGroup', () => {
    test('renders children', () => {
      render(
        <FormGroup>
          <div>Group Content</div>
        </FormGroup>
      );
      
      expect(screen.getByText('Group Content')).toBeInTheDocument();
    });
    
    test('applies space-y-1.5 class when not inline', () => {
      const { container } = render(
        <FormGroup>
          <div>Group Content</div>
        </FormGroup>
      );
      
      // Get the outermost div directly from container rather than using closest
      const group = container.firstChild as HTMLElement;
      expect(group).toHaveClass('space-y-1.5');
    });
    
    test('applies flex items-start gap-3 classes when inline', () => {
      const { container } = render(
        <FormGroup inline>
          <div>Group Content</div>
        </FormGroup>
      );
      
      // Get the outermost div directly from container
      const group = container.firstChild as HTMLElement;
      expect(group).toHaveClass('flex');
      expect(group).toHaveClass('items-start');
      expect(group).toHaveClass('gap-3');
    });
    
    test('renders hint when provided', () => {
      render(
        <FormGroup hint="Help text">
          <div>Group Content</div>
        </FormGroup>
      );
      
      expect(screen.getByText('Help text')).toBeInTheDocument();
    });
    
    test('renders error when provided', () => {
      render(
        <FormGroup error="Error message">
          <div>Group Content</div>
        </FormGroup>
      );
      
      expect(screen.getByText('Error message')).toBeInTheDocument();
    });
    
    test('applies custom className', () => {
      const { container } = render(
        <FormGroup className="custom-group-class">
          <div>Group Content</div>
        </FormGroup>
      );
      
      // Get the outermost div directly from container
      const group = container.firstChild as HTMLElement;
      expect(group).toHaveClass('custom-group-class');
    });
  });
  
  describe('FormLabel', () => {
    test('renders children', () => {
      render(<FormLabel htmlFor="test-input">Label Text</FormLabel>);
      
      expect(screen.getByText('Label Text')).toBeInTheDocument();
    });
    
    test('includes * for required fields', () => {
      render(
        <FormLabel htmlFor="test-input" required>
          Label Text
        </FormLabel>
      );
      
      const label = screen.getByText('Label Text').closest('label');
      expect(label).toHaveTextContent('Label Text*');
    });
    
    test('applies custom className', () => {
      render(
        <FormLabel htmlFor="test-input" className="custom-label-class">
          Label Text
        </FormLabel>
      );
      
      const label = screen.getByText('Label Text').closest('label');
      expect(label).toHaveClass('custom-label-class');
    });
  });
  
  describe('FormError', () => {
    test('renders children', () => {
      render(<FormError>Error message</FormError>);
      
      expect(screen.getByText('Error message')).toBeInTheDocument();
    });
    
    test('applies correct styling', () => {
      render(<FormError>Error message</FormError>);
      
      const error = screen.getByText('Error message');
      expect(error).toHaveClass('text-sm', 'font-medium', 'text-red-600');
    });
    
    test('applies custom className', () => {
      render(<FormError className="custom-error-class">Error message</FormError>);
      
      const error = screen.getByText('Error message');
      expect(error).toHaveClass('custom-error-class');
    });
    
    test('adds role="alert" attribute', () => {
      render(<FormError>Error message</FormError>);
      
      const error = screen.getByText('Error message');
      expect(error).toHaveAttribute('role', 'alert');
    });
    
    test('renders nothing when children is falsy', () => {
      const { container } = render(<FormError>{null}</FormError>);
      
      expect(container.firstChild).toBeNull();
    });
  });
  
  describe('FormHint', () => {
    test('renders children', () => {
      render(<FormHint>Help text</FormHint>);
      
      expect(screen.getByText('Help text')).toBeInTheDocument();
    });
    
    test('applies correct styling', () => {
      render(<FormHint>Help text</FormHint>);
      
      const hint = screen.getByText('Help text');
      expect(hint).toHaveClass('text-sm', 'text-gray-500');
    });
    
    test('applies custom className', () => {
      render(<FormHint className="custom-hint-class">Help text</FormHint>);
      
      const hint = screen.getByText('Help text');
      expect(hint).toHaveClass('custom-hint-class');
    });
    
    test('renders nothing when children is falsy', () => {
      const { container } = render(<FormHint>{null}</FormHint>);
      
      expect(container.firstChild).toBeNull();
    });
  });
  
  describe('FormSection', () => {
    test('renders children', () => {
      render(
        <FormSection>
          <div>Section Content</div>
        </FormSection>
      );
      
      expect(screen.getByText('Section Content')).toBeInTheDocument();
    });
    
    test('renders title and description when provided', () => {
      render(
        <FormSection title="Section Title" description="Section description">
          <div>Section Content</div>
        </FormSection>
      );
      
      expect(screen.getByText('Section Title')).toBeInTheDocument();
      expect(screen.getByText('Section description')).toBeInTheDocument();
    });
    
    test('applies custom className', () => {
      const { container } = render(
        <FormSection className="custom-section-class">
          <div>Section Content</div>
        </FormSection>
      );
      
      const section = container.firstChild as HTMLElement;
      expect(section).toHaveClass('space-y-4');
      expect(section).toHaveClass('custom-section-class');
    });
  });
  
  describe('FormActions', () => {
    test('renders children', () => {
      render(
        <FormActions>
          <button>Submit</button>
        </FormActions>
      );
      
      expect(screen.getByText('Submit')).toBeInTheDocument();
    });
    
    test('applies justify-end by default', () => {
      render(
        <FormActions>
          <button>Submit</button>
        </FormActions>
      );
      
      const actions = screen.getByText('Submit').closest('div');
      expect(actions).toHaveClass('justify-end');
    });
    
    test('applies different alignment based on align prop', () => {
      const { rerender } = render(
        <FormActions align="left">
          <button>Submit</button>
        </FormActions>
      );
      
      let actions = screen.getByText('Submit').closest('div');
      expect(actions).toHaveClass('justify-start');
      
      rerender(
        <FormActions align="center">
          <button>Submit</button>
        </FormActions>
      );
      
      expect(actions).toHaveClass('justify-center');
      
      rerender(
        <FormActions align="between">
          <button>Submit</button>
        </FormActions>
      );
      
      expect(actions).toHaveClass('justify-between');
    });
    
    test('applies custom className', () => {
      render(
        <FormActions className="custom-actions-class">
          <button>Submit</button>
        </FormActions>
      );
      
      const actions = screen.getByText('Submit').closest('div');
      expect(actions).toHaveClass('custom-actions-class');
    });
  });
}); 