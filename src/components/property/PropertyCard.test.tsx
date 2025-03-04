// Mock external dependencies
const mockSaveProperty = jest.fn().mockResolvedValue({});
const mockUnsaveProperty = jest.fn().mockResolvedValue({});
const mockUpdateNotes = jest.fn().mockResolvedValue({});

jest.mock('../../services/PropertyService', () => ({
  __esModule: true,
  default: {
    saveProperty: mockSaveProperty,
    unsaveProperty: mockUnsaveProperty,
    updateSavedPropertyNotes: mockUpdateNotes
  }
}));

const mockToastSuccess = jest.fn();
const mockToastError = jest.fn();

jest.mock('react-hot-toast', () => ({
  __esModule: true,
  toast: {
    success: mockToastSuccess,
    error: mockToastError
  },
  success: mockToastSuccess,
  error: mockToastError
}));

// Mock React Router
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  BrowserRouter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}));

// Mock Heart icon
jest.mock('lucide-react', () => ({
  Heart: () => <div data-testid="mock-heart-icon">Heart</div>
}));

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import PropertyCard from './PropertyCard';
import { PropertySummary } from '../../types/property';
import PropertyService from '../../services/PropertyService';

const mockProperty: PropertySummary = {
  id: '1',
  price: 500000,
  bedrooms: 3,
  bathrooms: 2,
  main_image_url: 'test-image.jpg',
  created_at: '2024-03-20T12:00:00Z',
  owner_id: 1,
  address: {
    street: 'Test Road',
    city: 'Test City',
    postcode: 'TE1 1ST',
  },
  specs: {
    property_type: 'Semi-Detached',
    square_footage: 1200
  }
};

// Helper function to render with Router context
const renderWithRouter = (ui: React.ReactElement) => {
  return render(
    <MemoryRouter>
      {ui}
    </MemoryRouter>
  );
};

describe('PropertyCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders property details correctly', () => {
    renderWithRouter(<PropertyCard {...mockProperty} />);

    expect(screen.getByText('£500,000')).toBeInTheDocument();
    expect(screen.getByText(mockProperty.address.street)).toBeInTheDocument();
    expect(screen.getByText(`${mockProperty.bedrooms} Bed`)).toBeInTheDocument();
    expect(screen.getByText('1,200 sq ft')).toBeInTheDocument();
  });

  test('handles save button click with custom handler', async () => {
    const handleToggleSave = jest.fn().mockResolvedValue({});
    
    renderWithRouter(
      <PropertyCard 
        {...mockProperty} 
        onToggleSave={handleToggleSave} 
        isSaved={false} 
      />
    );

    const saveButton = screen.getByRole('button', { name: /save property/i });
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(handleToggleSave).toHaveBeenCalledWith(mockProperty.id);
      expect(mockToastSuccess).toHaveBeenCalled();
    });
  });

  test('uses PropertyService when no custom handler is provided', async () => {
    renderWithRouter(<PropertyCard {...mockProperty} isSaved={false} />);
    
    const saveButton = screen.getByRole('button', { name: /save property/i });
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(mockSaveProperty).toHaveBeenCalledWith(mockProperty.id);
      expect(mockToastSuccess).toHaveBeenCalled();
    });
  });

  test('handles missing image with placeholder', () => {
    renderWithRouter(
      <PropertyCard 
        {...mockProperty} 
        main_image_url={undefined} 
      />
    );
    
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', '/placeholder-property.jpg');
  });

  test('displays correct UI for saved and unsaved states', () => {
    const { rerender } = renderWithRouter(
      <PropertyCard {...mockProperty} isSaved={false} />
    );
    
    expect(screen.getByRole('button', { name: /save property/i }))
      .toHaveAttribute('aria-label', 'Save property');
    
    rerender(
      <MemoryRouter>
        <PropertyCard {...mockProperty} isSaved={true} />
      </MemoryRouter>
    );
    
    expect(screen.getByRole('button', { name: /unsave property/i }))
      .toHaveAttribute('aria-label', 'Unsave property');
  });

  test('navigates to property details page when clicked', () => {
    renderWithRouter(<PropertyCard {...mockProperty} />);
    
    const viewPropertyButton = screen.getByText('View Property');
    fireEvent.click(viewPropertyButton);
    
    expect(mockNavigate).toHaveBeenCalledWith(`/property/${mockProperty.id}`, expect.anything());
  });
}); 