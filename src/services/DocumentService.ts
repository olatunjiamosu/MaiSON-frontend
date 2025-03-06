import { getAuth } from 'firebase/auth';
import UserService from './UserService';
import { UserRole } from '../types/property';

// Document API URL - ensure no trailing slash
const DOCUMENT_API_URL = import.meta.env.VITE_DOCUMENT_API_URL;

// Test the API connection on module load
(async function testApiConnection() {
  try {
    console.log('Testing connection to Document API:', DOCUMENT_API_URL);
    const response = await fetch(`${DOCUMENT_API_URL}/documents/query`);
    console.log('Document API connection test:', response.status, response.ok ? 'OK' : 'Failed');
    if (!response.ok) {
      console.warn('Document API connection test failed. Status:', response.status);
      try {
        const text = await response.text();
        console.warn('Response text:', text.substring(0, 200));
      } catch (e) {
        console.error('Could not read response text:', e);
      }
    } else {
      console.log('API connection successful!');
    }
  } catch (error) {
    console.error('Document API connection test error:', error);
  }
})();

export interface DocumentUploadParams {
  file: File;
  property_id: string;
  document_tag: string;
  buyer_id?: string;
  seller_id?: string;
  uploaded_by?: 'buyer' | 'seller';
}

export interface Document {
  document_id: string;
  filename: string;
  file_type: string;
  image_url: string; // Base64 encoded image
  datetime_uploaded: string;
  property_id: string;
  buyer_id?: string;
  seller_id?: string;
  uploaded_by: 'buyer' | 'seller';
  document_tag: string;
}

export interface DocumentQueryParams {
  uploaded_by?: 'buyer' | 'seller';
  property_id?: string;
  buyer_id?: string;
  seller_id?: string;
  document_tag?: string;
}

export interface DocumentQueryResponse {
  count: number;
  documents: Document[];
}

// Add interfaces for buyer document operations
export interface BuyerDocumentUploadParams {
  file: File;
  buyer_id?: string; // Optional because we'll get it from Firebase if not provided
  document_tag: string;
}

class DocumentService {
  /**
   * Get the current Firebase user ID
   */
  private async getCurrentUserId(): Promise<string | null> {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (!user) {
        console.warn('No current user found in Firebase');
        return null;
      }
      
      console.log('Current Firebase user:', user.uid);
      return user.uid;
    } catch (error) {
      console.error('Error getting current user ID from Firebase:', error);
      return null;
    }
  }

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
    const headers: Record<string, string> = {};

    if (requireAuth) {
      const token = await this.getAuthToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  /**
   * Upload a document to the API
   */
  async uploadDocument(params: DocumentUploadParams): Promise<{ message: string; document_id: string }> {
    try {
      const headers = await this.getHeaders();
      
      // Get current user ID directly from Firebase
      const userId = await this.getCurrentUserId();
      if (!userId) {
        throw new Error('No authenticated user found. Please log in and try again.');
      }
      
      // Create form data
      const formData = new FormData();
      formData.append('file', params.file);
      formData.append('property_id', params.property_id);
      formData.append('document_tag', params.document_tag);
      
      // Use provided uploaded_by or default to 'seller'
      const uploadedBy = params.uploaded_by || 'seller';
      formData.append('uploaded_by', uploadedBy);
      
      // Use provided seller_id or current user ID if uploaded_by is 'seller'
      if (uploadedBy === 'seller') {
        const sellerId = params.seller_id || userId;
        formData.append('seller_id', sellerId);
        console.log('Using seller_id:', sellerId);
      }
      
      // Add buyer_id if provided
      if (params.buyer_id) {
        formData.append('buyer_id', params.buyer_id);
      }
      
      const requestDetails = {
        property_id: params.property_id,
        document_tag: params.document_tag,
        uploaded_by: uploadedBy,
        seller_id: uploadedBy === 'seller' ? (params.seller_id || userId) : undefined,
        buyer_id: params.buyer_id,
        file_name: params.file.name,
        file_type: params.file.type,
        file_size: params.file.size
      };
      
      console.log('Uploading document with params:', requestDetails);
      
      // Log the FormData entries for debugging
      console.log('FormData entries:');
      for (const pair of (formData as any).entries()) {
        // Don't log the actual file content, just its presence
        if (pair[0] === 'file') {
          console.log('file:', pair[1].name, pair[1].type, pair[1].size);
        } else {
          console.log(pair[0], pair[1]);
        }
      }
      
      // Use the correct endpoint from the API documentation
      const uploadUrl = `${DOCUMENT_API_URL}/documents`;
      console.log('Uploading to URL:', uploadUrl);
      
      // Try using XMLHttpRequest for better multipart/form-data handling
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', uploadUrl);
        
        // Add authorization header if available
        if (headers.Authorization) {
          xhr.setRequestHeader('Authorization', headers.Authorization);
        }
        
        xhr.onload = function() {
          console.log('XHR response status:', xhr.status);
          console.log('XHR response text (first 500 chars):', xhr.responseText.substring(0, 500));
          
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const response = JSON.parse(xhr.responseText);
              resolve(response);
            } catch (e) {
              console.error('Error parsing JSON response:', e);
              
              // Log the full response for debugging
              console.error('Full response text:', xhr.responseText);
              
              // Check if response is HTML instead of JSON
              if (xhr.responseText.trim().startsWith('<!DOCTYPE') || xhr.responseText.trim().startsWith('<html')) {
                console.error('Received HTML response instead of JSON. This usually indicates a server error or incorrect endpoint.');
                console.error('HTML response (first 1000 chars):', xhr.responseText.substring(0, 1000));
                reject(new Error(`Server returned HTML instead of JSON. Status: ${xhr.status}. Check the API endpoint.`));
              } else {
                reject(new Error(`Failed to parse server response as JSON. Received: ${xhr.responseText.substring(0, 200)}`));
              }
            }
          } else {
            // Check if the response is HTML
            if (xhr.responseText.trim().startsWith('<!DOCTYPE') || xhr.responseText.trim().startsWith('<html')) {
              console.error('Received HTML response instead of JSON. This usually indicates a server error or incorrect endpoint.');
              console.error('HTML response (first 1000 chars):', xhr.responseText.substring(0, 1000));
              reject(new Error(`Server returned HTML instead of JSON. Status: ${xhr.status}. Check the API endpoint.`));
            } else {
              try {
                const errorData = JSON.parse(xhr.responseText);
                reject(new Error(errorData.error || `Failed to upload document: ${xhr.status}`));
              } catch (e) {
                console.error('Could not parse error response:', e);
                console.error('Error response text:', xhr.responseText);
                reject(new Error(`Failed to upload document: ${xhr.status} - ${xhr.responseText.substring(0, 200)}`));
              }
            }
          }
        };
        
        xhr.onerror = function() {
          console.error('XHR network error');
          reject(new Error('Network error occurred while uploading document'));
        };
        
        xhr.send(formData);
      });
    } catch (error) {
      console.error('Error uploading document:', error);
      throw error;
    }
  }

  /**
   * Query documents based on filters
   */
  async queryDocuments(
    uploaded_by?: string,
    property_id?: string,
    buyer_id?: string,
    seller_id?: string,
    document_tag?: string
  ): Promise<Document[]> {
    try {
      // If no seller_id is provided, use the current user's ID
      if (!seller_id && !buyer_id) {
        const currentUserId = await this.getCurrentUserId();
        if (currentUserId) {
          seller_id = currentUserId;
          console.log('Using current user ID as seller_id:', seller_id);
        }
      }

      // Build query string
      const params = new URLSearchParams();
      if (uploaded_by) params.append('uploaded_by', uploaded_by);
      if (property_id) params.append('property_id', property_id);
      if (buyer_id) params.append('buyer_id', buyer_id);
      if (seller_id) params.append('seller_id', seller_id);
      if (document_tag) params.append('document_tag', document_tag);

      const queryString = params.toString();
      const url = `${DOCUMENT_API_URL}/documents/query${queryString ? `?${queryString}` : ''}`;
      
      console.log('Querying documents with URL:', url);
      console.log('Query parameters:', {
        uploaded_by,
        property_id,
        buyer_id,
        seller_id,
        document_tag
      });

      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url);
        
        // Get auth token if available
        this.getAuthToken().then(token => {
          if (token) {
            xhr.setRequestHeader('Authorization', `Bearer ${token}`);
          }
          
          xhr.onload = () => {
            console.log('Query response status:', xhr.status);
            console.log('Query response text (first 500 chars):', xhr.responseText.substring(0, 500));
            
            if (xhr.status >= 200 && xhr.status < 300) {
              try {
                const response = JSON.parse(xhr.responseText);
                
                // Ensure documents is always an array
                const documents = response.documents || [];
                console.log(`Retrieved ${documents.length} documents`);
                resolve(documents);
              } catch (error) {
                console.error('Error parsing JSON response:', error);
                
                // Check if response is HTML instead of JSON
                if (xhr.responseText.includes('<!DOCTYPE html>') || 
                    xhr.responseText.includes('<html>')) {
                  console.error('Received HTML response instead of JSON. Server might be returning an error page.');
                  console.error('HTML response (first 1000 chars):', xhr.responseText.substring(0, 1000));
                  reject(new Error('Received HTML response instead of JSON. API endpoint might be incorrect or server error occurred.'));
                } else {
                  reject(error);
                }
              }
            } else {
              console.error('Query failed with status:', xhr.status);
              reject(new Error(`Query failed with status: ${xhr.status}`));
            }
          };
          
          xhr.onerror = () => {
            console.error('Network error during query');
            reject(new Error('Network error during query'));
          };
          
          xhr.send();
        }).catch(error => {
          console.error('Error getting auth token:', error);
          reject(error);
        });
      });
    } catch (error) {
      console.error('Error in queryDocuments:', error);
      throw error;
    }
  }

  /**
   * Upload a document to the buyer table (not associated with a property)
   */
  async uploadBuyerDocument(params: BuyerDocumentUploadParams): Promise<{ message: string; document_id: string }> {
    try {
      // Get current user ID directly from Firebase if not provided
      const buyerId = params.buyer_id || await this.getCurrentUserId();
      if (!buyerId) {
        throw new Error('No authenticated user found. Please log in and try again.');
      }
      
      // Create form data
      const formData = new FormData();
      formData.append('file', params.file);
      formData.append('buyer_id', buyerId);
      formData.append('document_tag', params.document_tag);
      
      const requestDetails = {
        buyer_id: buyerId,
        document_tag: params.document_tag,
        file_name: params.file.name,
        file_type: params.file.type,
        file_size: params.file.size
      };
      
      console.log('Uploading buyer document with params:', requestDetails);
      
      // Log the FormData entries for debugging
      console.log('FormData entries:');
      for (const pair of (formData as any).entries()) {
        // Don't log the actual file content, just its presence
        if (pair[0] === 'file') {
          console.log('file:', pair[1].name, pair[1].type, pair[1].size);
        } else {
          console.log(pair[0], pair[1]);
        }
      }
      
      // Use the correct endpoint for buyer documents
      const uploadUrl = `${DOCUMENT_API_URL}/documents/buyer`;
      console.log('Uploading to URL:', uploadUrl);
      
      // Use XMLHttpRequest for better multipart/form-data handling
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', uploadUrl);
        
        // Add authorization header if available
        this.getAuthToken().then(token => {
          if (token) {
            xhr.setRequestHeader('Authorization', `Bearer ${token}`);
          }
          
          xhr.onload = function() {
            console.log('XHR response status:', xhr.status);
            console.log('XHR response text (first 200 chars):', xhr.responseText.substring(0, 200));
            
            if (xhr.status >= 200 && xhr.status < 300) {
              try {
                const response = JSON.parse(xhr.responseText);
                resolve(response);
              } catch (e) {
                console.error('Error parsing JSON response:', e);
                reject(new Error(`Failed to parse server response as JSON. Received: ${xhr.responseText.substring(0, 100)}`));
              }
            } else {
              // Check if the response is HTML
              if (xhr.responseText.trim().startsWith('<!DOCTYPE') || xhr.responseText.trim().startsWith('<html')) {
                console.error('Received HTML response instead of JSON. This usually indicates a server error or incorrect endpoint.');
                reject(new Error(`Server returned HTML instead of JSON. Status: ${xhr.status}. Check the API endpoint.`));
              } else {
                try {
                  const errorData = JSON.parse(xhr.responseText);
                  reject(new Error(errorData.error || `Failed to upload buyer document: ${xhr.status}`));
                } catch (e) {
                  reject(new Error(`Failed to upload buyer document: ${xhr.status} - ${xhr.responseText.substring(0, 100)}`));
                }
              }
            }
          };
          
          xhr.onerror = function() {
            console.error('XHR network error');
            reject(new Error('Network error occurred while uploading buyer document'));
          };
          
          xhr.send(formData);
        }).catch(error => {
          console.error('Error getting auth token:', error);
          reject(error);
        });
      });
    } catch (error) {
      console.error('Error uploading buyer document:', error);
      throw error;
    }
  }

  /**
   * Query documents from the buyer table
   */
  async queryBuyerDocuments(
    buyer_id?: string,
    document_tag?: string
  ): Promise<Document[]> {
    try {
      // If no buyer_id is provided, use the current user's ID
      if (!buyer_id) {
        const currentUserId = await this.getCurrentUserId();
        if (currentUserId) {
          buyer_id = currentUserId;
          console.log('Using current user ID as buyer_id:', buyer_id);
        } else {
          throw new Error('No authenticated user found. Please log in and try again.');
        }
      }

      // Build query string
      const params = new URLSearchParams();
      params.append('buyer_id', buyer_id);
      if (document_tag) params.append('document_tag', document_tag);

      const queryString = params.toString();
      const url = `${DOCUMENT_API_URL}/documents/query/buyer${queryString ? `?${queryString}` : ''}`;
      
      console.log('Querying buyer documents with URL:', url);
      console.log('Query parameters:', {
        buyer_id,
        document_tag
      });

      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url);
        
        // Get auth token if available
        this.getAuthToken().then(token => {
          if (token) {
            xhr.setRequestHeader('Authorization', `Bearer ${token}`);
          }
          
          xhr.onload = () => {
            console.log('Query response status:', xhr.status);
            console.log('Query response text (first 100 chars):', xhr.responseText.substring(0, 100));
            
            if (xhr.status >= 200 && xhr.status < 300) {
              try {
                const response = JSON.parse(xhr.responseText);
                
                // Ensure documents is always an array
                const documents = response.documents || [];
                console.log(`Retrieved ${documents.length} buyer documents`);
                resolve(documents);
              } catch (error) {
                console.error('Error parsing JSON response:', error);
                
                // Check if response is HTML instead of JSON
                if (xhr.responseText.includes('<!DOCTYPE html>') || 
                    xhr.responseText.includes('<html>')) {
                  console.error('Received HTML response instead of JSON. Server might be returning an error page.');
                  reject(new Error('Received HTML response instead of JSON. API endpoint might be incorrect or server error occurred.'));
                } else {
                  reject(error);
                }
              }
            } else {
              console.error('Query failed with status:', xhr.status);
              reject(new Error(`Query failed with status: ${xhr.status}`));
            }
          };
          
          xhr.onerror = () => {
            console.error('Network error during query');
            reject(new Error('Network error during query'));
          };
          
          xhr.send();
        }).catch(error => {
          console.error('Error getting auth token:', error);
          reject(error);
        });
      });
    } catch (error) {
      console.error('Error in queryBuyerDocuments:', error);
      throw error;
    }
  }

  /**
   * Run a diagnostic test on the API connection
   * This can help identify CORS issues, authentication problems, etc.
   */
  async runDiagnostics(): Promise<{ success: boolean; details: any }> {
    try {
      console.log('Running API diagnostics...');
      
      // Test 1: Basic fetch to the API root
      console.log('Test 1: Basic fetch to API root');
      const rootResponse = await fetch(DOCUMENT_API_URL);
      console.log('Root response status:', rootResponse.status);
      
      let rootText = '';
      try {
        rootText = await rootResponse.text();
        console.log('Root response text (first 500 chars):', rootText.substring(0, 500));
      } catch (e) {
        console.error('Could not read root response text:', e);
      }
      
      // Test 2: Query with no parameters
      console.log('Test 2: Query with no parameters');
      const queryUrl = `${DOCUMENT_API_URL}/documents/query`;
      console.log('Query URL:', queryUrl);
      
      const queryResponse = await fetch(queryUrl);
      console.log('Query response status:', queryResponse.status);
      
      let queryText = '';
      try {
        queryText = await queryResponse.text();
        console.log('Query response text (first 500 chars):', queryText.substring(0, 500));
      } catch (e) {
        console.error('Could not read query response text:', e);
      }
      
      // Test 3: Check request headers
      console.log('Test 3: Check request headers');
      const headers = await this.getHeaders();
      console.log('Auth headers:', headers.Authorization ? 'Present (token hidden)' : 'Not present');
      
      // Test 4: Check CORS with preflight
      console.log('Test 4: Check CORS with preflight');
      try {
        const corsResponse = await fetch(queryUrl, {
          method: 'OPTIONS',
          headers: {
            'Access-Control-Request-Method': 'GET',
            'Access-Control-Request-Headers': 'Authorization',
            'Origin': window.location.origin
          }
        });
        console.log('CORS preflight response status:', corsResponse.status);
        console.log('CORS headers:', {
          'Access-Control-Allow-Origin': corsResponse.headers.get('Access-Control-Allow-Origin'),
          'Access-Control-Allow-Methods': corsResponse.headers.get('Access-Control-Allow-Methods'),
          'Access-Control-Allow-Headers': corsResponse.headers.get('Access-Control-Allow-Headers')
        });
      } catch (e) {
        console.error('CORS preflight error:', e);
      }
      
      // Test 5: Check browser info
      console.log('Test 5: Browser and environment info');
      console.log('User Agent:', navigator.userAgent);
      console.log('Origin:', window.location.origin);
      console.log('API URL:', DOCUMENT_API_URL);
      
      return {
        success: true,
        details: {
          rootStatus: rootResponse.status,
          queryStatus: queryResponse.status,
          hasAuthToken: !!headers.Authorization,
          origin: window.location.origin,
          userAgent: navigator.userAgent
        }
      };
    } catch (error) {
      console.error('Diagnostics error:', error);
      return {
        success: false,
        details: {
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined
        }
      };
    }
  }
}

export default new DocumentService(); 