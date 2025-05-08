import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import BlocksSection from '../BlocksSection';
import { BlockService } from '@/app/shared/services/BlockService';

// Mock the BlockService
jest.mock('@/app/shared/services/BlockService', () => {
  return {
    BlockService: jest.fn().mockImplementation(() => {
      return {
        getAllBlocks: jest.fn().mockResolvedValue([
          { _id: 'block1', blockName: 'ECHO', description: 'Echo District', ownerId: 'owner1' },
          { _id: 'block2', blockName: 'YARD', description: 'Main Yard', ownerId: 'owner1' }
        ]),
        createBlock: jest.fn().mockImplementation(async (block) => {
          return { ...block, _id: 'newblock' };
        }),
        updateBlock: jest.fn().mockImplementation(async (id, block) => {
          return { ...block, _id: id };
        }),
        deleteBlock: jest.fn().mockResolvedValue(undefined)
      };
    })
  };
});

// Define types for the mocked components
interface DialogProps {
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  title: string;
}

interface ConfirmDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onClose: () => void;
  title: string;
  description: string;
}

// Mock the Dialog component
jest.mock('@/app/components/ui/dialog', () => {
  return {
    Dialog: ({ children, isOpen, onClose, title }: DialogProps) => {
      if (!isOpen) return null;
      return (
        <div data-testid="dialog" aria-modal={true}>
          <h2>{title}</h2>
          <div>{children}</div>
          <button onClick={onClose}>Close</button>
        </div>
      );
    }
  };
});

const mockToast = jest.fn();
jest.mock('@/app/components/ui', () => {
  const original = jest.requireActual('@/app/components/ui');
  return {
    ...original,
    useToast: () => ({
      toast: mockToast
    }),
    ToastProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    ConfirmDialog: ({ isOpen, onConfirm, onClose, title, description }: ConfirmDialogProps) => {
      if (!isOpen) return null;
      return (
        <div data-testid="confirm-dialog">
          <h2>{title}</h2>
          <p>{description}</p>
          <button onClick={onConfirm} data-testid="confirm-button">Confirm</button>
          <button onClick={onClose}>Cancel</button>
        </div>
      );
    },
    Input: ({ label, name, value, onChange, error, placeholder }: {
      label: string;
      name: string;
      value: string;
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
      error?: string;
      placeholder?: string;
    }) => (
      <div>
        <label htmlFor={name}>{label}</label>
        <input 
          id={name}
          name={name} 
          value={value || ''} 
          onChange={onChange} 
          placeholder={placeholder}
          data-testid={`input-${name}`}
        />
        {error && <div data-testid={`error-${name}`}>{error}</div>}
      </div>
    ),
    Card: ({ children, className }: { children: React.ReactNode, className?: string }) => (
      <div className={className}>{children}</div>
    ),
    CardHeader: ({ children, className }: { children: React.ReactNode, className?: string }) => (
      <div className={className}>{children}</div>
    ),
    CardTitle: ({ children }: { children: React.ReactNode }) => (
      <h3>{children}</h3>
    ),
    CardContent: ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
    ),
    Button: (props: { 
      children: React.ReactNode; 
      onClick?: () => void;
      type?: 'button' | 'submit' | 'reset';
      variant?: string;
      size?: string;
    }) => {
      const { children, onClick, type } = props;
      const testId = typeof children === 'string' 
        ? `button-${children.toLowerCase().replace(/\s+/g, '-')}`
        : 'button';
      return (
        <button 
          onClick={onClick} 
          type={type} 
          data-testid={testId}
        >
          {children}
        </button>
      );
    },
    DataTable: ({ data, columns, keyExtractor, isLoading }: { 
      data: Array<Record<string, unknown>>;
      columns: any[];
      keyExtractor?: (item: any) => string;
      isLoading?: boolean;
    }) => {
      if (isLoading) {
        return <span>Loading...</span>;
      }
      
      // Extract the accessor function from the 'actions' column
      let actionAccessor: Function | undefined;
      if (columns) {
        const actionsColumn = columns.find(col => col.key === 'actions');
        if (actionsColumn && actionsColumn.accessor) {
          actionAccessor = actionsColumn.accessor;
        }
      }

      return (
        <div>
          {data.map((item: any, index: number) => {
            // If we have an action accessor, use it to render the buttons
            const actions = actionAccessor ? actionAccessor(item) : (
              <>
                <button data-testid="button-edit">Edit</button>
                <button data-testid="button-delete">Delete</button>
              </>
            );
            
            return (
              <div key={index} data-testid={`data-row-${index}`}>
                <span>{item.blockName}</span>
                {actions}
              </div>
            );
          })}
        </div>
      );
    }
  };
});

// Better mock for BlockService
const mockCreateBlock = jest.fn();
const mockDeleteBlock = jest.fn();

jest.mock('@/app/shared/services/BlockService', () => {
  return {
    BlockService: jest.fn().mockImplementation(() => {
      return {
        getAllBlocks: jest.fn().mockResolvedValue([
          { _id: 'block1', blockName: 'ECHO', description: 'Echo District', ownerId: 'owner1' },
          { _id: 'block2', blockName: 'YARD', description: 'Main Yard', ownerId: 'owner1' }
        ]),
        createBlock: mockCreateBlock.mockImplementation((block) => {
          return Promise.resolve({ ...block, _id: 'newblock' });
        }),
        updateBlock: jest.fn().mockImplementation((id, block) => {
          return Promise.resolve({ ...block, _id: id });
        }),
        deleteBlock: mockDeleteBlock.mockResolvedValue(undefined)
      };
    })
  };
});

describe('BlocksSection Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the BlocksSection with block data', async () => {
    render(<BlocksSection />);

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('ECHO')).toBeInTheDocument();
      expect(screen.getByText('YARD')).toBeInTheDocument();
    });
  });

  it('opens the create block modal when add button is clicked', async () => {
    render(<BlocksSection />);

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('ECHO')).toBeInTheDocument();
    });

    // Click the add button
    fireEvent.click(screen.getByTestId('button-add-new-block'));

    // Check that modal is open
    await waitFor(() => {
      expect(screen.getByTestId('dialog')).toBeInTheDocument();
    });
  });

  it('creates a new block when form is submitted', async () => {
    mockCreateBlock.mockResolvedValueOnce({ 
      _id: 'newblock', 
      blockName: 'NEW_BLOCK', 
      description: 'New block description',
      ownerId: 'owner1'
    });

    render(<BlocksSection />);

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('ECHO')).toBeInTheDocument();
    });

    // Click the add button to open the modal
    fireEvent.click(screen.getByTestId('button-add-new-block'));

    // Fill out the form
    await waitFor(() => {
      const blockNameInput = screen.getByTestId('input-blockName');
      fireEvent.change(blockNameInput, { target: { value: 'NEW_BLOCK' } });
      
      const descriptionInput = screen.getByTestId('input-description');
      fireEvent.change(descriptionInput, { target: { value: 'New block description' } });
    });
    
    // Submit the form
    fireEvent.click(screen.getByTestId('button-create'));

    // Check that BlockService.createBlock was called
    await waitFor(() => {
      expect(mockCreateBlock).toHaveBeenCalledWith(
        expect.objectContaining({
          blockName: 'NEW_BLOCK',
          description: 'New block description'
        })
      );
    });
  });

  it('deletes a block when delete is confirmed', async () => {
    mockDeleteBlock.mockResolvedValueOnce(undefined);

    render(<BlocksSection />);

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('ECHO')).toBeInTheDocument();
    });

    // Find and click the first delete button
    const deleteButtons = screen.getAllByTestId('button-delete');
    fireEvent.click(deleteButtons[0]);

    // Confirm deletion dialog should appear
    await waitFor(() => {
      expect(screen.getByTestId('confirm-dialog')).toBeInTheDocument();
    });
    
    // Click confirm button
    fireEvent.click(screen.getByTestId('confirm-button'));
    
    // Verify the delete function was called
    await waitFor(() => {
      expect(mockDeleteBlock).toHaveBeenCalled();
    });
  });
}); 