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

  // Get all properties with optional filters
  async getProperties(filters?: PropertyFilters): Promise<PropertySummary[]> {
    try {
      const url = this.buildUrl('', filters);
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorData: ErrorResponse = await response.json();
        throw new Error(errorData.error || 'Failed to fetch properties');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching properties:', error);
      throw error;
    }
  }

  // Get a specific property by ID
  async getPropertyById(id: string): Promise<PropertyDetail> {
    try {
      const url = this.buildUrl(`/${id}`);
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorData: ErrorResponse = await response.json();
        throw new Error(errorData.error || 'Failed to fetch property');
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error fetching property with ID ${id}:`, error);
      throw error;
    }
  }

  // Get properties for a specific user
  async getUserProperties(userId: number): Promise<PropertySummary[]> {
    try {
      const url = this.buildUrl(`/user/${userId}`);
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorData: ErrorResponse = await response.json();
        throw new Error(errorData.error || 'Failed to fetch user properties');
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error fetching properties for user ${userId}:`, error);
      throw error;
    }
  }

  // Create a new property
  async createProperty(propertyData: CreatePropertyRequest): Promise<PropertyResponse> {
    try {
      const token = await this.getAuthToken();
      const url = this.buildUrl();
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify(propertyData)
      });
      
      if (!response.ok) {
        const errorData: ErrorResponse = await response.json();
        throw new Error(errorData.error || errorData.errors?.join(', ') || 'Failed to create property');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating property:', error);
      throw error;
    }
  }

  // Create a property with images (multipart form data)
  async createPropertyWithImages(
    propertyData: CreatePropertyRequest, 
    mainImage: File, 
    additionalImages?: File[]
  ): Promise<PropertyResponse> {
    try {
      const token = await this.getAuthToken();
      const url = this.buildUrl();
      
      const formData = new FormData();
      formData.append('data', JSON.stringify(propertyData));
      formData.append('main_image', mainImage);
      
      if (additionalImages && additionalImages.length > 0) {
        additionalImages.forEach(image => {
          formData.append('additional_images', image);
        });
      }
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: formData
      });
      
      if (!response.ok) {
        const errorData: ErrorResponse = await response.json();
        throw new Error(errorData.error || errorData.errors?.join(', ') || 'Failed to create property with images');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating property with images:', error);
      throw error;
    }
  }

  // Update a property
  async updateProperty(id: string, propertyData: Partial<CreatePropertyRequest>): Promise<PropertyResponse> {
    try {
      const token = await this.getAuthToken();
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const url = this.buildUrl(`/${id}`);
      
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(propertyData)
      });
      
      if (!response.ok) {
        const errorData: ErrorResponse = await response.json();
        throw new Error(errorData.error || 'Failed to update property');
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error updating property with ID ${id}:`, error);
      throw error;
    }
  }

  // Delete a property
  async deleteProperty(id: string): Promise<{ message: string }> {
    try {
      const token = await this.getAuthToken();
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const url = this.buildUrl(`/${id}`);
      
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorData: ErrorResponse = await response.json();
        throw new Error(errorData.error || 'Failed to delete property');
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error deleting property with ID ${id}:`, error);
      throw error;
    }
  }
}

export default new PropertyService(); 