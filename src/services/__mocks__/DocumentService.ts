// Mock implementation of DocumentService
import { Document, DocumentUploadParams, DocumentQueryParams } from '../DocumentService';
import { UserRole } from '../../types/property';

export const mockDocumentId = 'mock-document-123';
export const mockPropertyId = 'property-123';
export const mockSellerId = 'test-user-123';
export const mockBuyerId = 'buyer-456';
export const mockDocumentTag = 'contract';

export const mockDocument: Document = {
  document_id: mockDocumentId,
  filename: 'test-document.pdf',
  file_type: 'application/pdf',
  image_url: 'data:application/pdf;base64,ZHVtbXkgY29udGVudA==',
  datetime_uploaded: '2023-05-15T10:30:00Z',
  property_id: mockPropertyId,
  seller_id: mockSellerId,
  uploaded_by: 'seller',
  document_tag: mockDocumentTag
};

export const mockDocumentWithBuyer: Document = {
  ...mockDocument,
  buyer_id: mockBuyerId
};

// Full mock implementation
const mockDocumentService = {
  uploadDocument: jest.fn(async (params: DocumentUploadParams): Promise<{ message: string; document_id: string }> => {
    return {
      message: 'Document uploaded successfully',
      document_id: mockDocumentId
    };
  }),

  queryDocuments: jest.fn(async (
    uploadedBy?: 'buyer' | 'seller',
    propertyId?: string,
    buyerId?: string,
    sellerId?: string,
    documentTag?: string
  ): Promise<Document[]> => {
    return [mockDocument, mockDocumentWithBuyer];
  }),

  deleteDocument: jest.fn(async (
    propertyId: string,
    uploadedBy: 'buyer' | 'seller',
    documentTag: string
  ): Promise<{ message: string }> => {
    return {
      message: 'Document deleted successfully'
    };
  }),

  uploadBuyerDocument: jest.fn(async (params: any): Promise<{ message: string; document_id: string }> => {
    return {
      message: 'Buyer document uploaded successfully',
      document_id: mockDocumentId
    };
  }),

  getBuyerDocuments: jest.fn(async (buyerId?: string): Promise<Document[]> => {
    return [mockDocumentWithBuyer];
  }),

  // Private methods for testing
  getCurrentUserId: jest.fn(async (): Promise<string> => {
    return mockSellerId;
  }),

  getAuthToken: jest.fn(async (): Promise<string> => {
    return 'mock-token-123';
  }),

  getHeaders: jest.fn(async (requireAuth = true): Promise<Record<string, string>> => {
    const headers: Record<string, string> = {};
    
    if (requireAuth) {
      headers['Authorization'] = 'Bearer mock-token-123';
    }
    
    return headers;
  })
};

export default mockDocumentService; 