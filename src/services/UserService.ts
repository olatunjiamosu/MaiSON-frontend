import { UserRole } from '../types/property';
import { getAuth } from 'firebase/auth';

// Use the same API URL configuration as PropertyService, but ensure no trailing slash
const PROPERTY_API_URL = (import.meta.env.VITE_PROPERTY_API_URL || 'https://maison-api.jollybush-a62cec71.uksouth.azurecontainerapps.io').replace(/\/$/, '');

interface UserInfo {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number?: string;
  roles: UserRole[];
}

interface UserResponse {
  message: string;
  user: UserInfo;
}

interface ErrorResponse {
  error: string | Record<string, string[]>;
  message?: string;
}

class UserService {
  private async getAuthToken(): Promise<string | null> {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (!user) {
        return null;
      }
      
      const token = await user.getIdToken();
      return token;
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  }

  private async getHeaders(requireAuth: boolean = true): Promise<Record<string, string>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (requireAuth) {
      const token = await this.getAuthToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  /**
   * Create a user in the listings API database
   */
  async createUser(userData: {
    user_id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone_number?: string;
    roles: UserRole[];
  }): Promise<UserResponse> {
    try {
      const headers = await this.getHeaders(false); // Don't require auth for user creation
      
      console.log('Creating user with data:', JSON.stringify(userData, null, 2));
      console.log('API URL:', `${PROPERTY_API_URL}/api/users`);
      
      const response = await fetch(`${PROPERTY_API_URL}/api/users`, {
        method: 'POST',
        headers,
        body: JSON.stringify(userData),
      });

      const data = await response.json();
      console.log('API Response:', response.status, data);
      
      if (!response.ok) {
        const errorMsg = typeof data.error === 'string' 
          ? data.error 
          : data.message || 'Failed to create user in listings API';
        console.error('API Error Response:', data);
        throw new Error(errorMsg);
      }

      return data as UserResponse;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  /**
   * Update a user's roles in the listings API
   */
  async updateUserRoles(userId: string, roles: UserRole[]): Promise<UserResponse> {
    try {
      const headers = await this.getHeaders();
      
      const response = await fetch(`${PROPERTY_API_URL}/api/users/${userId}/roles`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ roles }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(typeof data.error === 'string' 
          ? data.error 
          : 'Failed to update user roles');
      }

      return data as UserResponse;
    } catch (error) {
      console.error('Error updating user roles:', error);
      throw error;
    }
  }

  /**
   * Get the current user from the listings API
   */
  async getCurrentUser(): Promise<UserInfo> {
    try {
      const headers = await this.getHeaders();
      
      const response = await fetch(`${PROPERTY_API_URL}/api/users/me`, {
        method: 'GET',
        headers,
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(typeof data.error === 'string' 
          ? data.error 
          : 'Failed to get current user');
      }

      return data.user as UserInfo;
    } catch (error) {
      console.error('Error getting current user:', error);
      throw error;
    }
  }
}

export default new UserService(); 