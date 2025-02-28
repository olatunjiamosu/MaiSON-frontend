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

  private async getHeaders(requiresAuth: boolean = false): Promise<HeadersInit> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (requiresAuth) {
      const token = await this.getAuthToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
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
}

export default new PropertyService(); 