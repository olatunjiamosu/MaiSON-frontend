import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import PropertyCard from './PropertyCard';
import { PropertySummary } from '../../types/property';

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
    latitude: 51.5074,
    longitude: -0.1278
  },
  specs: {
    property_type: 'Semi-Detached',
    square_footage: 1200
  }
};

describe('PropertyCard', () => {
  test('renders property details correctly', () => {
    render(
      <BrowserRouter>
        <PropertyCard {...mockProperty} />
      </BrowserRouter>
    );

    // Price should be formatted
    expect(screen.getByText('£500,000')).toBeInTheDocument();
    expect(screen.getByText(mockProperty.address.street)).toBeInTheDocument();
    expect(screen.getByText(`${mockProperty.bedrooms} Bed`)).toBeInTheDocument();
    expect(screen.getByText('1,200 sq ft')).toBeInTheDocument();
  });

  test('handles save button click', () => {
    const onToggleSave = jest.fn();
    render(
      <BrowserRouter>
        <PropertyCard {...mockProperty} onToggleSave={onToggleSave} />
      </BrowserRouter>
    );

    const saveButton = screen.getByRole('button', { name: /heart/i });
    fireEvent.click(saveButton);
    expect(onToggleSave).toHaveBeenCalledWith(mockProperty.id);
  });

  test('handles missing image', () => {
    const propertyWithoutImage: PropertySummary = {
      ...mockProperty,
      main_image_url: undefined,
      address: {
        ...mockProperty.address,
        latitude: 51.5074,
        longitude: -0.1278
      }
    };

    render(
      <BrowserRouter>
        <PropertyCard {...propertyWithoutImage} />
      </BrowserRouter>
    );
    
    const img = screen.getByRole('img');
    expect(img.getAttribute('src')).toBe('/placeholder-property.jpg');
  });
}); 