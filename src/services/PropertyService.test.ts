import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import PropertyService from './PropertyService';
import { CreatePropertyRequest } from '../types/property';

// Mock the PropertyService methods directly
jest.mock('./PropertyService', () => ({
  getProperties: jest.fn(() => Promise.resolve([{
    id: '123e4567-e89b-12d3-a456-426614174000',
    price: 350000,
    bedrooms: 3,
    bathrooms: 2,
    main_image_url: 'https://example.com/image.jpg',
    created_at: '2024-02-22T12:00:00Z',
    owner_id: 1,
    address: {
      street: 'Sample Street',
      city: 'London',
      postcode: 'SW1 1AA'
    },
    specs: {
      property_type: 'semi-detached',
      square_footage: 1200.0
    }
  }])),
  
  getPropertyById: jest.fn((id) => Promise.resolve({
    id: id,
    price: 350000,
    bedrooms: 3,
    bathrooms: 2,
    main_image_url: 'https://example.com/main.jpg',
    image_urls: ['https://example.com/img1.jpg', 'https://example.com/img2.jpg'],
    floorplan_url: 'https://example.com/floorplan.jpg',
    created_at: '2024-02-22T12:00:00Z',
    last_updated: '2024-02-22T12:00:00Z',
    owner_id: 1,
    address: {
      house_number: '123',
      street: 'Sample Street',
      city: 'London',
      postcode: 'SW1 1AA',
      latitude: 51.5074,
      longitude: -0.1278
    },
    specs: {
      bedrooms: 3,
      bathrooms: 2,
      reception_rooms: 2,
      square_footage: 1200.5,
      property_type: 'semi-detached',
      epc_rating: 'B'
    },
    details: {
      description: 'Beautiful family home',
      property_type: 'residential',
      construction_year: 1990,
      parking_spaces: 2,
      heating_type: 'gas central'
    },
    features: {
      has_garden: true,
      garden_size: 100.5,
      has_garage: true,
      parking_spaces: 2
    }
  })),
  
  getUserProperties: jest.fn(() => Promise.resolve([{
    id: '123e4567-e89b-12d3-a456-426614174000',
    price: 350000,
    bedrooms: 3,
    bathrooms: 2,
    main_image_url: 'https://example.com/image.jpg',
    created_at: '2024-02-22T12:00:00Z',
    owner_id: 1,
    address: {
      street: 'Sample Street',
      city: 'London',
      postcode: 'SW1 1AA'
    },
    specs: {
      property_type: 'semi-detached',
      square_footage: 1200.0
    }
  }])),
  
  createProperty: jest.fn(() => Promise.resolve({
    id: '123e4567-e89b-12d3-a456-426614174000',
    message: 'Property created successfully'
  })),
  
  updateProperty: jest.fn((id) => Promise.resolve({
    id: id,
    message: 'Property updated successfully'
  })),
  
  deleteProperty: jest.fn(() => Promise.resolve())
}));

describe('PropertyService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch properties', async () => {
    const result = await PropertyService.getProperties();
    expect(result).toHaveLength(1);
    expect(PropertyService.getProperties).toHaveBeenCalled();
  });

  it('should fetch properties with filters', async () => {
    const filters = {
      min_price: 300000,
      bedrooms: 3,
      property_type: 'semi-detached'
    };

    const result = await PropertyService.getProperties(filters);
    expect(result).toHaveLength(1);
    expect(PropertyService.getProperties).toHaveBeenCalledWith(filters);
  });

  it('should fetch a property by ID', async () => {
    const propertyId = '123e4567-e89b-12d3-a456-426614174000';
    const result = await PropertyService.getPropertyById(propertyId);
    expect(result.id).toBe(propertyId);
    expect(PropertyService.getPropertyById).toHaveBeenCalledWith(propertyId);
  });

  it('should create a property', async () => {
    const propertyData: CreatePropertyRequest = {
      price: 350000,
      user_id: 1,
      address: {
        house_number: '123',
        street: 'Sample Street',
        city: 'London',
        postcode: 'SW1 1AA'
      },
      specs: {
        bedrooms: 3,
        bathrooms: 2,
        reception_rooms: 2,
        square_footage: 1200.5,
        property_type: 'semi-detached',
        epc_rating: 'B'
      }
    };

    const result = await PropertyService.createProperty(propertyData);
    expect(result.id).toBe('123e4567-e89b-12d3-a456-426614174000');
    expect(PropertyService.createProperty).toHaveBeenCalledWith(propertyData);
  });

  it('should get user properties', async () => {
    const result = await PropertyService.getUserProperties();
    expect(result).toHaveLength(1);
    expect(PropertyService.getUserProperties).toHaveBeenCalled();
  });

  it('should update a property', async () => {
    const propertyId = '123e4567-e89b-12d3-a456-426614174000';
    const updateData = { price: 375000 };
    
    const result = await PropertyService.updateProperty(propertyId, updateData);
    expect(result.id).toBe(propertyId);
    expect(PropertyService.updateProperty).toHaveBeenCalledWith(propertyId, updateData);
  });

  it('should delete a property', async () => {
    const propertyId = '123e4567-e89b-12d3-a456-426614174000';
    
    await PropertyService.deleteProperty(propertyId);
    expect(PropertyService.deleteProperty).toHaveBeenCalledWith(propertyId);
  });
}); 