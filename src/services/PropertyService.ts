import { 
  PropertySummary, 
  PropertyDetail, 
  CreatePropertyRequest, 
  PropertyResponse, 
  PropertyFilters, 
  ErrorResponse 
} from '../types/property';
import { getAuth } from 'firebase/auth';

const PROPERTY_API_URL = import.meta.env.VITE_PROPERTY_API_URL;
const PROPERTY_API_ENDPOINT = import.meta.env.VITE_PROPERTY_API_ENDPOINT;

class PropertyService {
  private async getAuthToken(): Promise<string | null> {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (user) {
        return await user.getIdToken();
      }
      return null;
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  }

  private async getHeaders(requireAuth: boolean = false, includeContentType: boolean = true): Promise<Record<string, string>> {
    const headers: Record<string, string> = {};
    
    if (includeContentType) {
      headers['Content-Type'] = 'application/json';
    }
    
    if (requireAuth) {
      const token = await this.getAuthToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      } else {
        throw new Error('Authentication required but no token available');
      }
    }
    
    return headers;
  }

  private buildUrl(path: string = '', queryParams?: Record<string, any>): string {
    const baseUrl = `${PROPERTY_API_URL}${PROPERTY_API_ENDPOINT}${path}`;
    
    if (!queryParams) return baseUrl;
    
    const params = new URLSearchParams();
    Object.entries(queryParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });
    
    const queryString = params.toString();
    return queryString ? `${baseUrl}?${queryString}` : baseUrl;
  }

  // Public endpoints (no auth required)
  async getProperties(filters?: PropertyFilters): Promise<PropertySummary[]> {
    try {
      const url = this.buildUrl('', filters);
      const response = await fetch(url, {
        headers: await this.getHeaders(false)
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch properties');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching properties:', error);
      throw error;
    }
  }

  async getPropertyById(id: string): Promise<PropertyDetail> {
    try {
      const url = this.buildUrl(`/${id}`);
      const response = await fetch(url, {
        headers: await this.getHeaders(false)
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch property details');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching property details:', error);
      throw error;
    }
  }

  // Private endpoints (auth required)
  async getUserProperties(): Promise<PropertySummary[]> {
    try {
      const url = this.buildUrl('/user');
      const response = await fetch(url, {
        headers: await this.getHeaders(true)
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch user properties');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching user properties:', error);
      throw error;
    }
  }

  async createProperty(property: CreatePropertyRequest): Promise<PropertyResponse> {
    try {
      const url = this.buildUrl();
      const response = await fetch(url, {
        method: 'POST',
        headers: await this.getHeaders(true),
        body: JSON.stringify(property)
      });
      
      if (!response.ok) {
        const errorData: ErrorResponse = await response.json();
        throw new Error(errorData.message || 'Failed to create property');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating property:', error);
      throw error;
    }
  }

  async updateProperty(id: string, property: Partial<CreatePropertyRequest>): Promise<PropertyResponse> {
    try {
      const url = this.buildUrl(`/${id}`);
      const response = await fetch(url, {
        method: 'PUT',
        headers: await this.getHeaders(true),
        body: JSON.stringify(property)
      });
      
      if (!response.ok) {
        const errorData: ErrorResponse = await response.json();
        throw new Error(errorData.message || 'Failed to update property');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating property:', error);
      throw error;
    }
  }

  async deleteProperty(id: string): Promise<void> {
    try {
      const url = this.buildUrl(`/${id}`);
      const response = await fetch(url, {
        method: 'DELETE',
        headers: await this.getHeaders(true)
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete property');
      }
    } catch (error) {
      console.error('Error deleting property:', error);
      throw error;
    }
  }

  async createPropertyWithImages(
    property: CreatePropertyRequest,
    mainImage: File, 
    additionalImages?: File[]
  ): Promise<PropertyResponse> {
    try {
      const url = this.buildUrl();
      const formData = new FormData();
      
      // Create a modified version as a plain object
      const propertyClone = { ...JSON.parse(JSON.stringify(property)) };
      
      // Convert square_footage to a float without forcing decimal places
      propertyClone.specs.square_footage = parseFloat(propertyClone.specs.square_footage.toString());
      
      // Also convert garden_size to a float if it exists
      if (propertyClone.features && propertyClone.features.garden_size !== undefined) {
        propertyClone.features.garden_size = parseFloat(propertyClone.features.garden_size.toString());
      }
      
      // Log what we're sending
      console.log('Modified property data (raw):', propertyClone);
      console.log('Modified property JSON:', JSON.stringify(propertyClone));
      
      // Add the property data as a JSON string under the 'data' key
      formData.append('data', JSON.stringify(propertyClone));
      
      // Add the main image
      formData.append('main_image', mainImage);
      
      // Add any additional images
      if (additionalImages && additionalImages.length > 0) {
        additionalImages.forEach(image => {
          formData.append('additional_images', image);
        });
      }
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          // Don't set Content-Type, let the browser set it with the boundary
          ...(await this.getHeaders(true, false)) // Add auth headers but skip content-type
        },
        body: formData
      });
      
      // Log the raw response for debugging
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = 'Failed to create property with images';
        
        try {
          const errorData = JSON.parse(errorText) as ErrorResponse;
          errorMessage = errorData.message || errorData.error || (errorData.errors?.join(', ')) || errorMessage;
        } catch (e) {
          console.error('Could not parse error response:', errorText);
        }
        
        console.error('API Error Response:', errorText);
        throw new Error(errorMessage);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating property with images:', error);
      throw error;
    }
  }
}

export default new PropertyService(); 