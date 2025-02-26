import { 
  PropertySummary, 
  PropertyDetail, 
  CreatePropertyRequest, 
  PropertyResponse, 
  PropertyFilters 
} from '../../types/property';

// Mock implementation of PropertyService
const mockPropertySummary = {
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
};

const mockPropertyDetail = {
  id: '123e4567-e89b-12d3-a456-426614174000',
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
};

// Create mock functions with proper implementations
const getProperties = jest.fn().mockImplementation(
  (filters?: PropertyFilters): Promise<PropertySummary[]> => {
    return Promise.resolve([mockPropertySummary]);
  }
);

const getPropertyById = jest.fn().mockImplementation(
  (id: string): Promise<PropertyDetail> => {
    return Promise.resolve({
      ...mockPropertyDetail,
      id: id
    });
  }
);

const getUserProperties = jest.fn().mockImplementation(
  (userId: number): Promise<PropertySummary[]> => {
    return Promise.resolve([{
      ...mockPropertySummary,
      owner_id: userId
    }]);
  }
);

const createProperty = jest.fn().mockImplementation(
  (propertyData: CreatePropertyRequest): Promise<PropertyResponse> => {
    return Promise.resolve({
      id: '123e4567-e89b-12d3-a456-426614174000',
      message: 'Property created successfully'
    });
  }
);

const createPropertyWithImages = jest.fn().mockImplementation(
  (propertyData: CreatePropertyRequest, mainImage: File, additionalImages?: File[]): Promise<PropertyResponse> => {
    return Promise.resolve({
      id: '123e4567-e89b-12d3-a456-426614174000',
      message: 'Property created successfully with images'
    });
  }
);

const updateProperty = jest.fn().mockImplementation(
  (id: string, propertyData: Partial<CreatePropertyRequest>): Promise<PropertyResponse> => {
    return Promise.resolve({
      id: id,
      message: 'Property updated successfully'
    });
  }
);

const deleteProperty = jest.fn().mockImplementation(
  (id: string): Promise<{ message: string }> => {
    return Promise.resolve({
      message: 'Property deleted successfully'
    });
  }
);

// Export the mock service
const PropertyService = {
  getProperties,
  getPropertyById,
  getUserProperties,
  createProperty,
  createPropertyWithImages,
  updateProperty,
  deleteProperty
};

export default PropertyService; 