import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import PropertyCard from './PropertyCard';

const mockProperty = {
  id: '1',
  image: 'test-image.jpg',
  price: '£500,000',
  road: 'Test Road',
  city: 'Test City',
  postcode: 'TE1 1ST',
  beds: 3,
  baths: 2,
  reception: 1,
  sqft: 1200,
  propertyType: 'Semi-Detached',
  epcRating: 'B',
};

describe('PropertyCard', () => {
  test('renders property details correctly', () => {
    render(
      <BrowserRouter>
        <PropertyCard {...mockProperty} />
      </BrowserRouter>
    );

    expect(screen.getByText(mockProperty.price)).toBeInTheDocument();
    expect(screen.getByText(mockProperty.road)).toBeInTheDocument();
    expect(screen.getByText(`${mockProperty.beds} Bed`)).toBeInTheDocument();
  });

  test('handles save button click', () => {
    const onToggleSave = jest.fn();
    render(
      <BrowserRouter>
        <PropertyCard {...mockProperty} onToggleSave={onToggleSave} />
      </BrowserRouter>
    );

    // Find the heart icon button by its parent button
    const saveButton = screen.getByRole('button', { name: 'Heart' });
    fireEvent.click(saveButton);
    expect(onToggleSave).toHaveBeenCalledWith(mockProperty.id);
  });
}); 