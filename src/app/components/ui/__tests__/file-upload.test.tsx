import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { FileUpload } from '../file-upload';

// Mock for dataTransfer
const createDragEvent = (type: string) => {
  const event = new Event(type, { bubbles: true });
  Object.defineProperty(event, 'dataTransfer', {
    value: {
      files: [new File(['content'], 'test.txt', { type: 'text/plain' })],
      dropEffect: '',
      setData: jest.fn(),
      getData: jest.fn(),
    },
  });
  Object.defineProperty(event, 'preventDefault', { value: jest.fn() });
  Object.defineProperty(event, 'stopPropagation', { value: jest.fn() });
  return event;
};

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
  
  it('handles drag enter event', () => {
    render(
      <FileUpload 
        onFilesSelected={jest.fn()}
      />
    );
    
    const container = screen.getByTestId('file-upload-container');
    fireEvent.dragEnter(container);
    
    expect(container).toHaveClass('border-primary-600');
  });
  
  it('handles drag leave event', () => {
    render(
      <FileUpload 
        onFilesSelected={jest.fn()}
      />
    );
    
    const container = screen.getByTestId('file-upload-container');
    fireEvent.dragEnter(container);
    expect(container).toHaveClass('border-primary-600');
    
    fireEvent.dragLeave(container);
    expect(container).not.toHaveClass('border-primary-600');
  });
  
  it('handles drag over event', () => {
    render(
      <FileUpload 
        onFilesSelected={jest.fn()}
      />
    );
    
    const container = screen.getByTestId('file-upload-container');
    const dragOverEvent = createDragEvent('dragover');
    container.dispatchEvent(dragOverEvent);
    
    expect(dragOverEvent.preventDefault).toHaveBeenCalled();
    expect(dragOverEvent.stopPropagation).toHaveBeenCalled();
  });
  
  it('handles drop event', () => {
    const mockOnFilesSelected = jest.fn();
    render(
      <FileUpload 
        onFilesSelected={mockOnFilesSelected}
      />
    );
    
    const container = screen.getByTestId('file-upload-container');
    const dropEvent = createDragEvent('drop');
    container.dispatchEvent(dropEvent);
    
    expect(dropEvent.preventDefault).toHaveBeenCalled();
    expect(dropEvent.stopPropagation).toHaveBeenCalled();
    expect(mockOnFilesSelected).toHaveBeenCalled();
  });
  
  it('disabled state prevents drag and drop', () => {
    const mockOnFilesSelected = jest.fn();
    render(
      <FileUpload 
        onFilesSelected={mockOnFilesSelected}
        disabled={true}
      />
    );
    
    const container = screen.getByTestId('file-upload-container');
    const dropEvent = createDragEvent('drop');
    container.dispatchEvent(dropEvent);
    
    expect(mockOnFilesSelected).not.toHaveBeenCalled();
  });
  
  it('shows selected files when showSelectedFiles is true', () => {
    const mockOnFilesSelected = jest.fn();
    const { rerender } = render(
      <FileUpload 
        onFilesSelected={mockOnFilesSelected}
        showSelectedFiles={true}
      />
    );
    
    const input = screen.getByTestId('file-input');
    const file = new File(['content'], 'test.txt', { type: 'text/plain' });
    
    Object.defineProperty(input, 'files', {
      value: [file],
    });
    
    fireEvent.change(input);
    
    // Need to rerender because the files state is updated
    rerender(
      <FileUpload 
        onFilesSelected={mockOnFilesSelected}
        showSelectedFiles={true}
      />
    );
    
    expect(screen.getByText('Selected files:')).toBeInTheDocument();
    expect(screen.getByText('test.txt')).toBeInTheDocument();
  });
  
  it('handles click to trigger file input', () => {
    render(
      <FileUpload 
        onFilesSelected={jest.fn()}
      />
    );
    
    const container = screen.getByTestId('file-upload-container');
    const input = screen.getByTestId('file-input');
    
    // Mock the current ref
    Object.defineProperty(HTMLElement.prototype, 'current', {
      value: input
    });
    
    fireEvent.click(container);
    
    // We can't directly test if the input was clicked due to JSDOM limitations
    // But we can test that the container is clickable
    expect(container).toHaveClass('cursor-pointer');
  });
}); 