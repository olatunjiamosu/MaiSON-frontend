import { UserRole } from '../../types/property';

// Interface definitions
export interface UserInfo {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number?: string;
  roles: UserRole[];
}

export interface UserResponse {
  message: string;
  user: UserInfo;
}

// Create a mock user
const mockUser: UserInfo = {
  user_id: 'test-user-123',
  first_name: 'Test',
  last_name: 'User',
  email: 'test@example.com',
  phone_number: '+44123456789',
  roles: [{ role_type: 'buyer' }]
};

// Mock implementation of UserService
const mockUserService = {
  createUser: jest.fn(async (userData: UserInfo): Promise<UserResponse> => {
    return {
      message: 'User created successfully',
      user: {
        ...userData,
        user_id: 'test-user-123',
        roles: userData.roles || [{ role_type: 'buyer' }]
      }
    };
  }),

  updateUserRoles: jest.fn(async (userId: string, roles: UserRole[]): Promise<UserResponse> => {
    return {
      message: 'User roles updated successfully',
      user: {
        ...mockUser,
        roles
      }
    };
  }),

  getCurrentUser: jest.fn(async (): Promise<UserInfo> => {
    return {
      user_id: 'test-user-123',
      first_name: 'Test',
      last_name: 'User',
      email: 'test@example.com',
      phone_number: '+44123456789',
      roles: [{ role_type: 'buyer' }]
    };
  }),

  // Private methods - not normally accessible but helpful for testing
  getAuthToken: jest.fn(async () => 'mock-token-123'),
  getHeaders: jest.fn(async (requireAuth = true) => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    
    if (requireAuth) {
      headers['Authorization'] = 'Bearer mock-token-123';
    }
    
    return headers;
  })
};

export default mockUserService; 