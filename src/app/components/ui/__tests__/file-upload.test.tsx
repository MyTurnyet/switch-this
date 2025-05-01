import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { FileUpload } from '../file-upload';

describe('FileUpload Component', () => {
  it('renders with default props', () => {
    render(
      <FileUpload 
        onFilesSelected={jest.fn()}
      />
    );
    
    expect(screen.getByText('Drag and drop files here')).toBeInTheDocument();
    expect(screen.getByText('or click to browse')).toBeInTheDocument();
  });

  it('renders with custom label', () => {
    render(
      <FileUpload 
        onFilesSelected={jest.fn()}
        label="Upload Documents"
      />
    );
    
    expect(screen.getByText('Upload Documents')).toBeInTheDocument();
  });

  it('supports file selection via input', () => {
    const mockOnFilesSelected = jest.fn();
    render(
      <FileUpload 
        onFilesSelected={mockOnFilesSelected}
      />
    );
    
    const file = new File(['file content'], 'test.txt', { type: 'text/plain' });
    const input = screen.getByTestId('file-input');
    
    Object.defineProperty(input, 'files', {
      value: [file],
    });
    
    fireEvent.change(input);
    
    expect(mockOnFilesSelected).toHaveBeenCalledWith([file]);
  });

  it('supports custom accept prop', () => {
    render(
      <FileUpload 
        onFilesSelected={jest.fn()}
        accept=".pdf,.doc"
      />
    );
    
    const input = screen.getByTestId('file-input');
    expect(input).toHaveAttribute('accept', '.pdf,.doc');
  });

  it('supports multiple file selection', () => {
    render(
      <FileUpload 
        onFilesSelected={jest.fn()}
        multiple={true}
      />
    );
    
    const input = screen.getByTestId('file-input');
    expect(input).toHaveAttribute('multiple');
  });

  it('displays validation error message', () => {
    render(
      <FileUpload 
        onFilesSelected={jest.fn()}
        error="Invalid file type"
      />
    );
    
    expect(screen.getByText('Invalid file type')).toBeInTheDocument();
    const container = screen.getByTestId('file-upload-container');
    expect(container).toHaveClass('border-red-500');
  });

  it('supports custom class names', () => {
    render(
      <FileUpload 
        onFilesSelected={jest.fn()}
        className="custom-class"
      />
    );
    
    const container = screen.getByTestId('file-upload-container');
    expect(container).toHaveClass('custom-class');
  });

  it('supports disabled state', () => {
    render(
      <FileUpload 
        onFilesSelected={jest.fn()}
        disabled={true}
      />
    );
    
    const input = screen.getByTestId('file-input');
    expect(input).toBeDisabled();
    const container = screen.getByTestId('file-upload-container');
    expect(container).toHaveClass('opacity-50');
  });
}); 