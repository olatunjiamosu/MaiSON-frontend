import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import PropertyCard from '../components/property/PropertyCard';
import { toast } from 'react-hot-toast';

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn()
  }
}));

describe('PropertyCard', () => {
  const mockProperty = {
    id: '1',
    image: 'test-image.jpg',
    price: '£500,000',
    road: 'Test Road',
    city: 'London',
    postcode: 'SW1 1AA',
    beds: 3,
    baths: 2,
    reception: 1,
    sqft: 1200,
    propertyType: 'Terraced',
    epcRating: 'B',
    showSaveButton: true
  };

  const renderCard = (props = {}) => {
    return render(
      <BrowserRouter>
        <PropertyCard {...mockProperty} {...props} />
      </BrowserRouter>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders property details correctly', () => {
    renderCard();
    
    expect(screen.getByText(mockProperty.price)).toBeInTheDocument();
    expect(screen.getByText(mockProperty.road)).toBeInTheDocument();
    expect(screen.getByText(`${mockProperty.city}, ${mockProperty.postcode}`)).toBeInTheDocument();
    expect(screen.getByText(`${mockProperty.beds} Bed`)).toBeInTheDocument();
    expect(screen.getByText(`${mockProperty.baths} Bath`)).toBeInTheDocument();
  });

  it('handles save button click', () => {
    renderCard();
    
    // Find the heart icon button
    const saveButton = screen.getByRole('button', { 
      name: '', // The button has no text, just an icon
      hidden: true 
    });
    fireEvent.click(saveButton);
    
    expect(toast.success).toHaveBeenCalledWith(
      'Property saved successfully!',
      expect.any(Object)
    );
  });

  it('navigates to property details on view button click', () => {
    renderCard();
    
    const viewButton = screen.getByText('View Property');
    fireEvent.click(viewButton);
    
    // Check if we're on the property details page
    expect(window.location.pathname).toBe(`/property/${mockProperty.id}`);
  });

  it('shows schedule viewing button', () => {
    renderCard();
    
    expect(screen.getByText('Schedule Viewing')).toBeInTheDocument();
  });
}); 