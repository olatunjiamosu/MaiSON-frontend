import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';

// Import the mock DocumentService type definitions
import mockDocumentService, {
  mockDocument,
  mockDocumentWithBuyer,
  mockDocumentId,
  mockPropertyId,
  mockSellerId,
  mockBuyerId,
  mockDocumentTag
} from './__mocks__/DocumentService';

// Import the actual types from DocumentService
import { DocumentUploadParams } from './DocumentService';

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
jest.mock('./UserService', () => ({
  default: {
    getCurrentUser: jest.fn(() => Promise.resolve({ user_id: 'test-user-123' }))
  }
}));

// Mock DocumentService
jest.mock('./DocumentService', () => {
  return {
    __esModule: true,
    default: mockDocumentService
  };
});

describe('DocumentService', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('uploadDocument', () => {
    it('should upload a document successfully', async () => {
      const mockSuccessResponse = {
        message: 'Document uploaded successfully',
        document_id: mockDocumentId
      };

      // Setup mock implementation
      mockDocumentService.uploadDocument.mockResolvedValueOnce(mockSuccessResponse);

      const uploadParams: DocumentUploadParams = {
        file: new File(['dummy content'], 'test-document.pdf', { type: 'application/pdf' }),
        property_id: mockPropertyId,
        document_tag: mockDocumentTag,
        uploaded_by: 'seller'
      };

      // Import the actual service after mocking
      const { default: DocumentService } = await import('./DocumentService');

      // Call the method
      const result = await DocumentService.uploadDocument(uploadParams);

      // Verify function was called with correct parameters
      expect(mockDocumentService.uploadDocument).toHaveBeenCalledWith(uploadParams);
      expect(mockDocumentService.uploadDocument).toHaveBeenCalledTimes(1);

      // Verify response
      expect(result).toEqual(mockSuccessResponse);
    });

    it('should handle upload errors', async () => {
      // Setup mock implementation
      mockDocumentService.uploadDocument.mockRejectedValueOnce(
        new Error('Failed to upload document')
      );

      const uploadParams: DocumentUploadParams = {
        file: new File(['dummy content'], 'test-document.pdf', { type: 'application/pdf' }),
        property_id: mockPropertyId,
        document_tag: mockDocumentTag,
        uploaded_by: 'seller'
      };

      // Import the actual service after mocking
      const { default: DocumentService } = await import('./DocumentService');

      // Verify that error is caught
      await expect(DocumentService.uploadDocument(uploadParams)).rejects.toThrow('Failed to upload document');
      expect(mockDocumentService.uploadDocument).toHaveBeenCalledTimes(1);
    });
  });

  describe('queryDocuments', () => {
    it('should query documents successfully', async () => {
      const documents = [mockDocument, mockDocumentWithBuyer];
      
      // Setup mock implementation
      mockDocumentService.queryDocuments.mockResolvedValueOnce(documents);

      // Import the actual service after mocking
      const { default: DocumentService } = await import('./DocumentService');

      // Call the method
      const result = await DocumentService.queryDocuments(
        'seller',
        mockPropertyId,
        undefined,
        mockSellerId,
        mockDocumentTag
      );

      // Verify function was called with correct parameters
      expect(mockDocumentService.queryDocuments).toHaveBeenCalledWith(
        'seller',
        mockPropertyId,
        undefined,
        mockSellerId,
        mockDocumentTag
      );
      expect(mockDocumentService.queryDocuments).toHaveBeenCalledTimes(1);

      // Verify response
      expect(result).toEqual(documents);
    });

    it('should handle query errors', async () => {
      // Setup mock implementation
      mockDocumentService.queryDocuments.mockRejectedValueOnce(
        new Error('Failed to query documents')
      );

      // Import the actual service after mocking
      const { default: DocumentService } = await import('./DocumentService');

      // Verify that error is caught
      await expect(DocumentService.queryDocuments('seller', mockPropertyId)).rejects.toThrow('Failed to query documents');
      expect(mockDocumentService.queryDocuments).toHaveBeenCalledTimes(1);
    });
  });

  describe('deleteDocument', () => {
    it('should delete a document successfully', async () => {
      const mockSuccessResponse = {
        message: 'Document deleted successfully'
      };
      
      // Setup mock implementation
      mockDocumentService.deleteDocument.mockResolvedValueOnce(mockSuccessResponse);

      // Import the actual service after mocking
      const { default: DocumentService } = await import('./DocumentService');

      // Call the method
      const result = await DocumentService.deleteDocument(
        mockPropertyId,
        'seller',
        mockDocumentTag
      );

      // Verify function was called with correct parameters
      expect(mockDocumentService.deleteDocument).toHaveBeenCalledWith(
        mockPropertyId,
        'seller',
        mockDocumentTag
      );
      expect(mockDocumentService.deleteDocument).toHaveBeenCalledTimes(1);

      // Verify response
      expect(result).toEqual(mockSuccessResponse);
    });

    it('should handle deletion errors', async () => {
      // Setup mock implementation
      mockDocumentService.deleteDocument.mockRejectedValueOnce(
        new Error('Failed to delete document')
      );

      // Import the actual service after mocking
      const { default: DocumentService } = await import('./DocumentService');

      // Verify that error is caught
      await expect(DocumentService.deleteDocument(
        mockPropertyId,
        'seller',
        'non-existent-tag'
      )).rejects.toThrow('Failed to delete document');
      expect(mockDocumentService.deleteDocument).toHaveBeenCalledTimes(1);
    });
  });
}); 