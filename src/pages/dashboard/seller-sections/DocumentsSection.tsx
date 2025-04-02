import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Upload, 
  Trash2, 
  Eye,
  Plus,
  FolderOpen,
  File,
  Home,
  X,
  AlertCircle,
  Loader2,
  Settings,
  LogOut,
  RefreshCw,
} from 'lucide-react';
import DocumentService, { Document as ApiDocument } from '@/services/DocumentService';
import { toast } from 'react-toastify';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import { useAuth } from '../../../context/AuthContext';

// Rename to avoid conflict with DOM Document
interface DocumentItem {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadedAt: string;
  category: 'property' | 'legal' | 'financial' | 'other';
}

interface DocumentType {
  id: string;
  name: string;
  description: string;
  category: DocumentItem['category'];
  required: boolean;
}

const mockDocuments: DocumentItem[] = [
  {
    id: '1',
    name: 'Property Deed.pdf',
    type: 'PDF',
    size: '2.4 MB',
    uploadedAt: '2024-02-20',
    category: 'property'
  },
  {
    id: '2',
    name: 'Energy Performance Certificate.pdf',
    type: 'PDF',
    size: '1.8 MB',
    uploadedAt: '2024-02-19',
    category: 'property'
  },
  {
    id: '3',
    name: 'Sales Contract.pdf',
    type: 'PDF',
    size: '3.2 MB',
    uploadedAt: '2024-02-18',
    category: 'legal'
  },
  {
    id: '4',
    name: 'Property Valuation.pdf',
    type: 'PDF',
    size: '1.5 MB',
    uploadedAt: '2024-02-17',
    category: 'financial'
  }
];

const documentTypes: DocumentType[] = [
  {
    id: 'property_deed',
    name: 'Property Deed',
    description: 'Title deed or proof of ownership document',
    category: 'property',
    required: true
  },
  {
    id: 'epc_certificate',
    name: 'Energy Performance Certificate',
    description: 'Valid EPC for your property',
    category: 'property',
    required: true
  },
  {
    id: 'gas_certificate',
    name: 'Gas Safety Certificate',
    description: 'Current gas safety certificate if applicable',
    category: 'property',
    required: false
  },
  {
    id: 'electrical_certificate',
    name: 'Electrical Safety Certificate',
    description: 'Current electrical installation certificate',
    category: 'property',
    required: true
  },
  {
    id: 'floor_plan',
    name: 'Floor Plan',
    description: 'Detailed floor plan of your property',
    category: 'property',
    required: true
  },
  {
    id: 'id_verification',
    name: 'ID Verification',
    description: 'Government-issued ID for verification',
    category: 'legal',
    required: true
  },
  {
    id: 'proof_address',
    name: 'Proof of Address',
    description: 'Recent utility bill or bank statement',
    category: 'legal',
    required: true
  },
  {
    id: 'property_valuation',
    name: 'Property Valuation Report',
    description: 'Professional valuation of your property',
    category: 'financial',
    required: false
  }
];

export default function DocumentsSection() {
  // No need to create an instance, DocumentService is already exported as a singleton
  
  const [selectedCategory, setSelectedCategory] = useState<'all' | DocumentItem['category']>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [documents, setDocuments] = useState<ApiDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [currentPropertyId, setCurrentPropertyId] = useState<string>('');
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const { logout } = useAuth();
  const navigate = useNavigate();
  
  // Try to get property ID from URL params or location state
  const params = useParams<{ propertyId?: string }>();
  const location = useLocation();
  const locationState = location.state as { propertyId?: string } | null;

  // Get current user ID from Firebase
  const getCurrentUserId = async (): Promise<string | null> => {
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
  };

  // Fetch documents on component mount
  useEffect(() => {
    const fetchUserAndDocuments = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get property ID from URL params or location state
        const propertyId = params.propertyId || locationState?.propertyId;
        if (propertyId) {
          setCurrentPropertyId(propertyId);
          console.log('Property ID:', propertyId);
        } else {
          console.warn('No property ID found in URL or state');
        }
        
        // Fetch documents
        await fetchDocuments(propertyId);
      } catch (error) {
        console.error('Error fetching user and documents:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        setError(`Failed to load data: ${errorMessage}`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserAndDocuments();
  }, [params.propertyId, locationState?.propertyId]);
  
  const fetchDocuments = async (propertyId?: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // Get the current user ID
      const userId = await getCurrentUserId();
      if (!userId) {
        console.error('No user ID available');
        setError('You must be logged in to view documents');
        setLoading(false);
        return;
      }
      
      console.log('Fetching documents for user ID:', userId, 'and property ID:', propertyId);
      
      // Call the queryDocuments method with the updated signature
      const documents = await DocumentService.queryDocuments(
        'seller',    // uploaded_by
        propertyId,  // property_id
        undefined,   // buyer_id
        userId,      // seller_id
        undefined    // document_tag
      );
      
      console.log('Fetched documents:', documents);
      setDocuments(documents);
    } catch (error) {
      console.error('Error fetching documents:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(`Failed to fetch documents: ${errorMessage}`);
      toast.error(`Failed to fetch documents: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    try {
      setUploadLoading(true);
      setError(null);
      
      const file = e.target.files[0];
      
      // Default to 'other' category if not specified
      const documentTag = 'other';
      
      console.log('Uploading file:', file.name, 'to property:', currentPropertyId);
      
      const result = await DocumentService.uploadDocument({
        file,
        property_id: currentPropertyId,
        document_tag: documentTag,
        uploaded_by: 'seller'
      });
      
      console.log('Upload result:', result);
      toast.success('Document uploaded successfully!');
      
      // Refresh documents list
      await fetchDocuments(currentPropertyId);
      
    } catch (error) {
      console.error('Error uploading document:', error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Unknown error';
      setError(`Upload error: ${errorMessage}`);
      toast.error(`Failed to upload document: ${errorMessage}`);
    } finally {
      setUploadLoading(false);
      // Reset the file input
      e.target.value = '';
    }
  };

  const handleDownload = (document: ApiDocument) => {
    try {
      // Convert base64 to blob
      const byteCharacters = atob(document.image_url.split(',')[1]);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: document.file_type });
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const a = window.document.createElement('a');
      a.href = url;
      a.download = document.filename;
      window.document.body.appendChild(a);
      a.click();
      
      // Clean up
      setTimeout(() => {
        window.document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 0);
    } catch (error) {
      console.error('Error downloading document:', error);
      toast.error('Failed to download document. Please try again.');
    }
  };

  const handleDelete = async (documentId: string, documentTag: string) => {
    try {
      if (!window.confirm('Are you sure you want to delete this document? This action cannot be undone.')) {
        return;
      }
      
      console.log('Deleting document:', documentId, 'with tag:', documentTag);
      
      // Show loading toast
      const toastId = toast.loading('Deleting document...');
      
      // Delete document with required parameters
      await DocumentService.deleteDocument(
        currentPropertyId,
        'seller',
        documentTag
      );
      
      // Update toast
      toast.success('Document deleted successfully');
      toast.dismiss(toastId);
      
      // Refresh documents list
      fetchDocuments(currentPropertyId);
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error('Failed to delete document. Please try again.');
    }
  };

  const handleSpecificDocumentUpload = (documentType: DocumentType) => {
    return () => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.pdf,.doc,.docx,.jpg,.jpeg,.png';
      input.style.display = 'none';
      
      input.onchange = async (e: Event) => {
        const files = (e.target as HTMLInputElement).files;
        if (files && files.length > 0) {
          const file = files[0];
          try {
            setUploadLoading(true);
            setError(null);
            
            console.log(`Uploading ${documentType.name}: ${file.name}`);
            console.log('Document tag:', documentType.id);
            
            // Special handling for property deed
            if (documentType.id === 'property_deed') {
              console.log('Special handling for Property Deed document');
            }
            
            // Upload the document using the service instance
            await DocumentService.uploadDocument({
              file,
              document_tag: documentType.id,
              property_id: currentPropertyId,
            });
            
            toast.success(`${documentType.name} uploaded successfully!`);
            
            // Refresh documents list
            await fetchDocuments(currentPropertyId);
            
          } catch (error) {
            console.error(`Error uploading ${documentType.name}:`, error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            setError(`Failed to upload ${documentType.name}: ${errorMessage}`);
            toast.error(`Failed to upload ${documentType.name}: ${errorMessage}`);
          } finally {
            setUploadLoading(false);
          }
        }
      };
      
      document.body.appendChild(input);
      input.click();
      document.body.removeChild(input);
    };
  };

  // Filter documents by category and search term
  const getFilteredDocuments = () => {
    if (!documents) return [];
    
    return documents.filter(doc => {
      const matchesSearch = doc.filename.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Map API document_tag to UI category
      let category: DocumentItem['category'] = 'other';
      
      // Map document tags to categories based on your document types
      const tagToCategory: Record<string, DocumentItem['category']> = {
        'property_deed': 'property',
        'epc_certificate': 'property',
        'gas_certificate': 'property',
        'electrical_certificate': 'property',
        'floor_plan': 'property',
        'id_verification': 'legal',
        'proof_address': 'legal',
        'property_valuation': 'financial',
        // Add more mappings as needed
      };
      
      category = tagToCategory[doc.document_tag] || 'other';
      
      const matchesCategory = selectedCategory === 'all' || category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  };

  const filteredDocuments = getFilteredDocuments();

  const categories = [
    { id: 'all', label: 'All Documents', icon: FileText },
    { id: 'property', label: 'Property Documents', icon: Home },
    { id: 'legal', label: 'Legal Documents', icon: FileText },
    { id: 'financial', label: 'Financial Documents', icon: FileText },
    { id: 'other', label: 'Other', icon: FileText },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
      toast.error('Failed to logout. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Documents</h2>
          <p className="text-gray-500">Manage your property documents</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            className="text-gray-600 hover:text-gray-900"
            onClick={() => navigate('/profile')}
          >
            <Settings className="h-6 w-6" />
          </button>
          <button
            className="text-gray-600 hover:text-gray-900"
            onClick={handleLogout}
          >
            <LogOut className="h-6 w-6" />
          </button>
          <button
            className="text-gray-600 hover:text-gray-900 disabled:text-gray-300"
            onClick={() => window.location.reload()}
          >
            <RefreshCw className="h-6 w-6" />
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
          <button
            className="absolute top-0 bottom-0 right-0 px-4 py-3"
            onClick={() => setError(null)}
          >
            <span className="sr-only">Dismiss</span>
            <X className="h-5 w-5" />
          </button>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="w-full lg:w-64 space-y-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id as any)}
              className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors ${
                selectedCategory === category.id
                  ? 'bg-emerald-50 text-emerald-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <category.icon className="h-5 w-5" />
              <span className="text-sm font-medium">{category.label}</span>
            </button>
          ))}

          {/* Upload Button */}
          <div className="pt-4">
            <input
              type="file"
              id="file-upload"
              multiple
              className="hidden"
              onChange={handleFileUpload}
              disabled={uploadLoading}
            />
            <label
              htmlFor="file-upload"
              className={`flex items-center justify-center gap-2 px-4 py-2 ${
                uploadLoading 
                  ? 'bg-emerald-400 cursor-not-allowed' 
                  : 'bg-emerald-600 hover:bg-emerald-700 cursor-pointer'
              } text-white rounded-lg`}
            >
              {uploadLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Upload className="h-5 w-5" />
              )}
              <span>{uploadLoading ? 'Uploading...' : 'Upload Documents'}</span>
            </label>
          </div>
        </div>
        
        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Search */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Documents Grid */}
          <div className="bg-white rounded-lg border">
            <div className="p-4 border-b">
              <h3 className="font-medium text-gray-900">
                {categories.find(c => c.id === selectedCategory)?.label}
              </h3>
            </div>
            
            {loading ? (
              <div className="flex justify-center items-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
                <span className="ml-2 text-gray-600">Loading documents...</span>
              </div>
            ) : (
              <div className="divide-y">
                {/* Required Documents */}
                {documentTypes
                  .filter(docType => 
                    selectedCategory === 'all' || docType.category === selectedCategory
                  )
                  .map((docType) => {
                    // Find if this document type has been uploaded
                    const uploadedDoc = documents.find(doc => 
                      doc.document_tag === docType.id
                    );
                    
                    return (
                      <div key={docType.id} className="p-4 flex items-center justify-between">
                        <div className="flex items-start space-x-3">
                          <div className="p-2 bg-gray-100 rounded-lg">
                            <FileText className="h-6 w-6 text-gray-600" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900 flex items-center">
                              {docType.name}
                              {docType.required && !uploadedDoc && (
                                <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded">
                                  Required
                                </span>
                              )}
                            </h4>
                            <p className="text-sm text-gray-500">{docType.description}</p>
                            
                            {uploadedDoc ? (
                              <div className="mt-1 text-xs text-emerald-600 flex items-center">
                                <span className="mr-2">✓ Uploaded</span>
                                <span className="text-emerald-500 font-medium">
                                  {new Date(uploadedDoc.datetime_uploaded).toLocaleDateString()}
                                </span>
                              </div>
                            ) : (
                              <div className="mt-1 text-xs text-gray-400">
                                Not uploaded yet
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex space-x-2">
                          {uploadedDoc ? (
                            <>
                              <button 
                                onClick={() => handleDownload(uploadedDoc)}
                                className="p-2 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg"
                                title="Download"
                              >
                                <Download className="h-5 w-5" />
                              </button>
                              <button 
                                onClick={() => handleDelete(uploadedDoc.document_id, uploadedDoc.document_tag)}
                                className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg"
                                title="Delete"
                              >
                                <Trash2 className="h-5 w-5" />
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={handleSpecificDocumentUpload(docType)}
                              disabled={uploadLoading}
                              className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg ${
                                uploadLoading
                                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                  : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                              }`}
                            >
                              {uploadLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Plus className="h-4 w-4" />
                              )}
                              <span>Upload</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                
                {/* Uploaded Documents (that don't match predefined types) */}
                {filteredDocuments
                  .filter(doc => !documentTypes.some(type => type.id === doc.document_tag))
                  .map((doc) => (
                    <div key={doc.document_id} className="p-4 flex items-center justify-between">
                      <div className="flex items-start space-x-3">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          <FileText className="h-6 w-6 text-gray-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{doc.filename}</h4>
                          <p className="text-sm text-gray-500">
                            {doc.file_type.split('/')[1]?.toUpperCase() || doc.file_type}
                          </p>
                          <div className="mt-1 text-xs text-emerald-600 flex items-center">
                            <span className="mr-2">✓ Uploaded on</span>
                            <span className="text-emerald-500 font-medium">
                              {new Date(doc.datetime_uploaded).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleDownload(doc)}
                          className="p-2 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg"
                          title="Download"
                        >
                          <Download className="h-5 w-5" />
                        </button>
                        <button 
                          onClick={() => handleDelete(doc.document_id, doc.document_tag)}
                          className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg"
                          title="Delete"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                
                {/* Empty state */}
                {filteredDocuments.length === 0 && (
                  <div className="p-8 text-center">
                    <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                      <FolderOpen className="h-6 w-6 text-gray-400" />
                    </div>
                    <h3 className="text-gray-900 font-medium mb-1">No documents found</h3>
                    <p className="text-gray-500 mb-4">
                      {searchTerm 
                        ? `No documents match "${searchTerm}"`
                        : 'Upload documents to see them here'}
                    </p>
                    <input
                      type="file"
                      id="empty-upload"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                    <label
                      htmlFor="empty-upload"
                      className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 cursor-pointer"
                    >
                      <Upload className="h-5 w-5 mr-2" />
                      <span>Upload Document</span>
                    </label>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 