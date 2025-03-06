// API configuration

// Get the API URL from environment variables or use a default
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// API endpoints
export const API_CONFIG = {
  ENDPOINTS: {
    // Availability endpoints
    AVAILABILITY: {
      GET_PROPERTY: (propertyId: string | number) => 
        `${API_URL}/api/availability/property/${propertyId}`,
      CREATE: `${API_URL}/api/availability`,
      DELETE: (availabilityId: string | number) => 
        `${API_URL}/api/availability/${availabilityId}`,
    },
    
    // Test endpoints
    TEST: {
      BASIC: `${API_URL}/test`,
      DB_CONNECTION: `${API_URL}/test-db-connection`,
      CREATE_TEST: `${API_URL}/api/test-create`,
    }
  },

  // Default headers for API requests
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
  },

  // Helper function for API requests
  apiRequest: async function(
    url: string, 
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    body?: any,
    headers = this.DEFAULT_HEADERS
  ) {
    try {
      const response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'API request failed');
      }
      
      return data;
    } catch (error) {
      console.error('API request error:', error);
      throw error;
    }
  }
};

export default API_CONFIG; 