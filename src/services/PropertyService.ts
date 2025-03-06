import { 
  PropertySummary, 
  PropertyDetail, 
  CreatePropertyRequest, 
  PropertyResponse, 
  PropertyFilters, 
  ErrorResponse,
  DashboardResponse,
  SavedProperty
} from '../types/property';
import { getAuth } from 'firebase/auth';

// Update the API base URL to point to the Flask backend
const API_BASE_URL = 'http://localhost:8000';

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
    const baseUrl = `${API_BASE_URL}${path}`;
    
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
      
      const properties = await response.json();
      
      // Ensure each property has an id field regardless of whether API returns id or property_id
      return properties.map((property: any) => {
        if (!property.id && property.property_id) {
          property.id = property.property_id;
        }
        return property;
      });
    } catch (error) {
      console.error('Error fetching properties:', error);
      throw error;
    }
  }

  async getPropertyById(id: string): Promise<PropertyDetail> {
    try {
      console.log(`Fetching property details for ${id}`);
      const response = await fetch(`${API_BASE_URL}/api/property/${id}`, {
        headers: {
          'Accept': 'application/json',
        }
      });
      
      console.log('Property details response status:', response.status);
      const text = await response.text();
      console.log('Property details raw response:', text);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch property: ${text}`);
      }
      
      const data = JSON.parse(text);
      
      // Transform the simplified test property data into the expected format
      if (data.name && !data.address) {
        // This is a test property with simplified structure
        return {
          id: data.id,
          name: data.name,
          description: 'Test property created for development purposes',
          price: 500000, // Default price for test properties
          address: {
            street: data.name,
            city: 'Test City',
            postcode: 'TE5T 1ST',
            country: 'United Kingdom'
          },
          bedrooms: 3,
          bathrooms: 2,
          property_type: 'house',
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          seller_id: 'test-seller',
          availability_count: data.availability_count || 0
        };
      }
      
      return data;
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
      
      const properties = await response.json();
      
      // Ensure each property has an id field regardless of whether API returns id or property_id
      return properties.map((property: any) => {
        if (!property.id && property.property_id) {
          property.id = property.property_id;
        }
        return property;
      });
    } catch (error) {
      console.error('Error fetching user properties:', error);
      throw error;
    }
  }

  /**
   * Get the complete dashboard data for the current user
   * This includes saved properties, listed properties, and negotiations
   */
  async getUserDashboard(): Promise<DashboardResponse> {
    try {
      // Get the current user's ID from Firebase
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      const userId = user.uid;
      const url = `${API_BASE_URL}/api/users/${userId}/dashboard`;
      
      const response = await fetch(url, {
        headers: await this.getHeaders(true)
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch user dashboard: ${response.status} ${response.statusText}`);
      }
      
      const dashboardData = await response.json();
      
      // Process the data to ensure consistency with our frontend models
      if (dashboardData.listed_properties) {
        dashboardData.listed_properties = dashboardData.listed_properties.map((property: any) => {
          if (!property.id && property.property_id) {
            property.id = property.property_id;
          }
          return property;
        });
      }
      
      return dashboardData;
    } catch (error) {
      console.error('Error fetching user dashboard:', error);
      throw error;
    }
  }

  /**
   * Create a property without images
   * Uses direct JSON submission with Content-Type: application/json
   */
  async createProperty(property: CreatePropertyRequest): Promise<PropertyDetail> {
    try {
      const url = this.buildUrl('');
      
      // Ensure we're using the correct seller_id property name
      const formattedProperty: any = { ...property };
      if ('user_id' in formattedProperty && !formattedProperty.seller_id) {
        formattedProperty.seller_id = formattedProperty.user_id;
        delete formattedProperty.user_id;
      }
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(await this.getHeaders(true, false)) // Add auth headers
        },
        body: JSON.stringify(formattedProperty)
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          `Failed to create property: ${response.status} ${response.statusText}${
            errorData ? ` - ${JSON.stringify(errorData)}` : ''
          }`
        );
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating property:', error);
      throw error;
    }
  }

  /**
   * Create a property with images
   * Uses multipart/form-data submission with separate fields for data and images
   */
  async createPropertyWithImages(
    propertyData: CreatePropertyRequest, 
    mainImage: File, 
    additionalImages?: File[]
  ): Promise<PropertyDetail> {
    try {
      // Create a FormData object to submit multipart form data
      const formData = new FormData();
      
      // Ensure we're using the correct seller_id property name
      const formattedProperty: any = { ...propertyData };
      if ('user_id' in formattedProperty && !formattedProperty.seller_id) {
        formattedProperty.seller_id = formattedProperty.user_id;
        delete formattedProperty.user_id;
      }
      
      // Convert property data to a JSON string and add as 'data' field
      formData.append('data', JSON.stringify(formattedProperty));
      
      // Add main image as 'main_image' field
      formData.append('main_image', mainImage);
      
      // Add any additional images as 'additional_image' fields (singular name as required by API)
      if (additionalImages && additionalImages.length > 0) {
        additionalImages.forEach(image => {
          formData.append('additional_image', image);
        });
      }
      
      const url = this.buildUrl('');
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          // Don't set Content-Type header - browser will set it with boundary for multipart/form-data
          ...(await this.getHeaders(true, false)) // Add auth headers but skip content-type
        },
        body: formData
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          `Failed to create property: ${response.status} ${response.statusText}${
            errorData ? ` - ${JSON.stringify(errorData)}` : ''
          }`
        );
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating property with images:', error);
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

  /**
   * Save a property for the current user
   * @param propertyId - The ID of the property to save
   * @param notes - Optional notes about the property
   */
  async saveProperty(propertyId: string, notes?: string): Promise<any> {
    try {
      // Get the current user's ID from Firebase
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      const userId = user.uid;
      // Fix potential double slash by ensuring proper URL construction
      const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
      const url = `${baseUrl}/api/users/${userId}/saved-properties`;
      
      console.log('POST URL:', url); // For debugging
      
      const response = await fetch(url, {
        method: 'POST',
        headers: await this.getHeaders(true),
        body: JSON.stringify({
          property_id: propertyId,
          notes: notes || null
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          `Failed to save property: ${response.status} ${response.statusText}${
            errorData ? ` - ${JSON.stringify(errorData)}` : ''
          }`
        );
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error saving property:', error);
      throw error;
    }
  }

  /**
   * Unsave (remove) a property from the current user's saved properties
   * @param propertyId - The ID of the property to unsave
   */
  async unsaveProperty(propertyId: string): Promise<any> {
    try {
      // Get the current user's ID from Firebase
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      const userId = user.uid;
      // Fix potential double slash by ensuring proper URL construction
      const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
      const url = `${baseUrl}/api/users/${userId}/saved-properties/${propertyId}`;
      
      console.log('DELETE URL:', url); // For debugging
      
      const response = await fetch(url, {
        method: 'DELETE',
        headers: await this.getHeaders(true)
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          `Failed to unsave property: ${response.status} ${response.statusText}${
            errorData ? ` - ${JSON.stringify(errorData)}` : ''
          }`
        );
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error unsaving property:', error);
      throw error;
    }
  }

  /**
   * Update notes for a saved property
   * @param propertyId - The ID of the saved property
   * @param notes - The updated notes
   */
  async updateSavedPropertyNotes(propertyId: string, notes: string): Promise<any> {
    try {
      // Get the current user's ID from Firebase
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      const userId = user.uid;
      // Fix potential double slash by ensuring proper URL construction
      const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
      const url = `${baseUrl}/api/users/${userId}/saved-properties/${propertyId}/notes`;
      
      console.log('PATCH URL:', url); // For debugging
      
      const response = await fetch(url, {
        method: 'PATCH',
        headers: await this.getHeaders(true),
        body: JSON.stringify({ notes })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          `Failed to update saved property notes: ${response.status} ${response.statusText}${
            errorData ? ` - ${JSON.stringify(errorData)}` : ''
          }`
        );
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating saved property notes:', error);
      throw error;
    }
  }

  /**
   * Get the user's saved properties
   */
  async getSavedProperties(): Promise<SavedProperty[]> {
    try {
      // This is a convenience method that extracts saved properties from the dashboard
      const dashboardData = await this.getUserDashboard();
      return dashboardData.saved_properties || [];
    } catch (error) {
      console.error('Error fetching saved properties:', error);
      throw error;
    }
  }
}

export default new PropertyService(); 