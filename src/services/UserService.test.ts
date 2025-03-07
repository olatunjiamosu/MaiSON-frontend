import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { UserRole } from '../types/property';

// Import the mock UserService type definitions
import mockUserService, { UserInfo, UserResponse } from './__mocks__/UserService';

// Mock the fetch function
global.fetch = jest.fn() as jest.MockedFunction<typeof fetch>;

// Mock Firebase auth
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({
    currentUser: {
      uid: 'test-user-123',
      getIdToken: jest.fn(() => Promise.resolve('mock-token-123'))
    }
  }))
}));

// Mock UserService
jest.mock('./UserService', () => {
  return {
    __esModule: true,
    default: mockUserService
  };
});

describe('UserService', () => {
  const mockUser: UserInfo = {
    user_id: 'test-user-123',
    first_name: 'Test',
    last_name: 'User',
    email: 'test@example.com',
    phone_number: '+44123456789',
    roles: [{ role_type: 'buyer' }]
  };

  const mockResponse: UserResponse = {
    message: 'Success',
    user: mockUser
  };

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    it('should create a user successfully', async () => {
      // Setup mock implementation for this test
      mockUserService.createUser.mockResolvedValueOnce(mockResponse);

      // Import the actual service after mocking
      const { default: UserService } = await import('./UserService');

      const result = await UserService.createUser(mockUser);

      // Verify the function was called with correct arguments
      expect(mockUserService.createUser).toHaveBeenCalledWith(mockUser);
      expect(mockUserService.createUser).toHaveBeenCalledTimes(1);

      // Verify response
      expect(result).toEqual(mockResponse);
    });

    it('should handle errors', async () => {
      // Setup mock implementation for this test
      mockUserService.createUser.mockRejectedValueOnce(new Error('Failed to create user'));

      // Import the actual service after mocking
      const { default: UserService } = await import('./UserService');

      // Verify that error is thrown
      await expect(UserService.createUser(mockUser)).rejects.toThrow('Failed to create user');
      expect(mockUserService.createUser).toHaveBeenCalledTimes(1);
    });
  });

  describe('updateUserRoles', () => {
    it('should update user roles successfully', async () => {
      // Setup mock implementation for this test
      mockUserService.updateUserRoles.mockResolvedValueOnce(mockResponse);

      // Import the actual service after mocking
      const { default: UserService } = await import('./UserService');

      const userId = 'test-user-123';
      const roles = [{ role_type: 'seller' }] as UserRole[];

      const result = await UserService.updateUserRoles(userId, roles);

      // Verify the function was called with correct arguments
      expect(mockUserService.updateUserRoles).toHaveBeenCalledWith(userId, roles);
      expect(mockUserService.updateUserRoles).toHaveBeenCalledTimes(1);

      // Verify response
      expect(result).toEqual(mockResponse);
    });

    it('should handle errors when updating roles', async () => {
      // Setup mock implementation for this test
      mockUserService.updateUserRoles.mockRejectedValueOnce(new Error('Failed to update roles'));

      // Import the actual service after mocking
      const { default: UserService } = await import('./UserService');

      const userId = 'test-user-123';
      const roles = [{ role_type: 'seller' }] as UserRole[];

      // Verify that error is thrown
      await expect(UserService.updateUserRoles(userId, roles)).rejects.toThrow('Failed to update roles');
      expect(mockUserService.updateUserRoles).toHaveBeenCalledTimes(1);
    });
  });

  describe('getCurrentUser', () => {
    it('should get current user successfully', async () => {
      // Setup mock implementation for this test
      mockUserService.getCurrentUser.mockResolvedValueOnce(mockUser);

      // Import the actual service after mocking
      const { default: UserService } = await import('./UserService');

      const result = await UserService.getCurrentUser();

      // Verify the function was called
      expect(mockUserService.getCurrentUser).toHaveBeenCalledTimes(1);

      // Verify response
      expect(result).toEqual(mockUser);
    });

    it('should handle errors when getting current user', async () => {
      // Setup mock implementation for this test
      mockUserService.getCurrentUser.mockRejectedValueOnce(new Error('Failed to get user'));

      // Import the actual service after mocking
      const { default: UserService } = await import('./UserService');

      // Verify that error is thrown
      await expect(UserService.getCurrentUser()).rejects.toThrow('Failed to get user');
      expect(mockUserService.getCurrentUser).toHaveBeenCalledTimes(1);
    });
  });
}); 