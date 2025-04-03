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
  Wallet,
  FileCheck,
  Loader2,
  X,
  AlertCircle
} from 'lucide-react';
import DocumentService, { Document as ApiDocument } from '@/services/DocumentService';
import { toast } from 'react-hot-toast';
import { getAuth } from 'firebase/auth';

interface Document {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadedAt: string;
  category: 'financial' | 'identity' | 'other';
  document_tag: string;
}

interface DocumentType {
  id: string;
  name: string;
  description: string;
  category: Document['category'];
  required: boolean;
}

// Document types for buyer
const documentTypes: DocumentType[] = [
  {
    id: 'bank_statements',
    name: 'Bank Statements',
    description: 'Last 3 months of bank statements',
    category: 'financial',
    required: true
  },
  {
    id: 'passport',
    name: 'Passport/ID',
    description: 'Valid passport or government-issued ID',
    category: 'identity',
    required: true
  },
  {
    id: 'proof_address',
    name: 'Proof of Address',
    description: 'Utility bill or bank statement showing your address',
    category: 'identity',
    required: true
  }
];

const DocumentsSection: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | Document['category']>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [documents, setDocuments] = useState<ApiDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

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
        
        // Get current user ID
        const userId = await getCurrentUserId();
        if (!userId) {
          throw new Error('No authenticated user found. Please log in and try again.');
        }
        
        setCurrentUserId(userId);
        
        // Fetch documents
        await fetchDocuments();
      } catch (error) {
        console.error('Error fetching user and documents:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        setError(`Failed to load data: ${errorMessage}`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserAndDocuments();
  }, []);

  const fetchDocuments = async () => {
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
      
      console.log('Fetching buyer documents for user ID:', userId);
      
      // Call the queryBuyerDocuments method
      const documents = await DocumentService.queryBuyerDocuments(userId);
      
      console.log('Fetched buyer documents:', documents);
      setDocuments(documents);
    } catch (error) {
      console.error('Error fetching buyer documents:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(`Failed to fetch documents: ${errorMessage}`);
      toast.error(`Failed to fetch documents: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    try {
      setUploading(true);
      setError(null);
      
      console.log('Uploading file:', file.name);
      
      // Upload the document using the service
      const result = await DocumentService.uploadBuyerDocument({
        file,
        document_tag: 'other', // Default tag for general uploads
      });
      
      console.log('Upload result:', result);
      toast.success(`Document uploaded successfully!`);
      
      // Refresh documents list
      await fetchDocuments();
      
    } catch (error) {
      console.error('Error uploading document:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(`Failed to upload document: ${errorMessage}`);
      toast.error(`Failed to upload document: ${errorMessage}`);
    } finally {
      setUploading(false);
      // Reset the file input
      e.target.value = '';
    }
  };

  const handleDownload = (document: ApiDocument) => {
    try {
      // Create a link element
      const link = window.document.createElement('a');
      
      // Set link's href to the document's image_url (which contains base64 data)
      link.href = document.image_url;
      
      // Set the download attribute with the filename
      link.download = document.filename;
      
      // Append to the document, click it, and remove it
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
      
      toast.success(`Downloading ${document.filename}`);
    } catch (error) {
      console.error('Error downloading document:', error);
      toast.error('Failed to download document');
    }
  };

  const handleDelete = async (documentId: string, documentTag: string) => {
    try {
      if (!window.confirm('Are you sure you want to delete this document? This action cannot be undone.')) {
        return;
      }
      
      console.log('Deleting document:', documentId, 'with tag:', documentTag);
      
      if (!currentUserId) {
        toast.error('User ID not found. Please try again later.');
        return;
      }
      
      // Show loading toast
      const toastId = toast.loading('Deleting document...');
      
      // Delete document with required parameters
      await DocumentService.deleteBuyerDocument(
        currentUserId,
        documentTag
      );
      
      // Update toast
      toast.success('Document deleted successfully');
      toast.dismiss(toastId);
      
      // Refresh documents list
      fetchDocuments();
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
            setUploading(true);
            setError(null);
            
            console.log(`Uploading ${documentType.name}: ${file.name}`);
            console.log('Document tag:', documentType.id);
            
            // Upload the document using the service
            await DocumentService.uploadBuyerDocument({
              file,
              document_tag: documentType.id,
            });
            
            toast.success(`${documentType.name} uploaded successfully!`);
            
            // Refresh documents list
            await fetchDocuments();
            
          } catch (error) {
            console.error(`Error uploading ${documentType.name}:`, error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            setError(`Failed to upload ${documentType.name}: ${errorMessage}`);
            toast.error(`Failed to upload ${documentType.name}: ${errorMessage}`);
          } finally {
            setUploading(false);
          }
        }
      };
      
      document.body.appendChild(input);
      input.click();
      document.body.removeChild(input);
    };
  };

  // Convert API documents to the UI format
  const convertApiDocumentsToUiFormat = (): Document[] => {
    return documents.map(doc => ({
      id: doc.document_id,
      name: doc.filename,
      type: doc.file_type.split('/')[1]?.toUpperCase() || 'FILE',
      size: 'Unknown', // Size information not available from API
      uploadedAt: doc.datetime_uploaded,
      category: mapDocumentTagToCategory(doc.document_tag),
      document_tag: doc.document_tag // Store the original document_tag for deletion
    }));
  };

  // Map document tags to UI categories
  const mapDocumentTagToCategory = (tag: string): Document['category'] => {
    if (tag.includes('bank')) return 'financial';
    if (tag.includes('passport') || tag.includes('address')) return 'identity';
    return 'other';
  };

  const uiDocuments = convertApiDocumentsToUiFormat();
  
  const filteredDocuments = uiDocuments.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [
    { id: 'all', label: 'All Documents', icon: FileText },
    { id: 'financial', label: 'Financial Documents', icon: Wallet },
    { id: 'identity', label: 'Identity Documents', icon: FileText },
    { id: 'other', label: 'Other', icon: FileText },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Documents</h2>
          <p className="text-gray-500">View and manage your documents</p>
        </div>
      </div>

      {/* Error display */}
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

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
          <span className="ml-2 text-gray-600">Loading documents...</span>
        </div>
      ) : (
        <div className="flex flex-col md:flex-row gap-6">
          {/* Categories Sidebar */}
          <div className="w-full md:w-64 space-y-2">
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
                className="hidden"
                onChange={handleFileUpload}
                disabled={uploading}
              />
              <label
                htmlFor="file-upload"
                className={`flex items-center justify-center gap-2 px-4 py-2 ${
                  uploading 
                    ? 'bg-emerald-400 cursor-not-allowed' 
                    : 'bg-emerald-600 hover:bg-emerald-700 cursor-pointer'
                } text-white rounded-lg`}
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <Upload className="h-5 w-5" />
                    <span>Upload Documents</span>
                  </>
                )}
              </label>
            </div>
          </div>

          {/* Documents List */}
          <div className="flex-1">
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
              
              <div className="divide-y">
                {/* Required Documents */}
                {documentTypes
                  .filter(docType => 
                    selectedCategory === 'all' || docType.category === selectedCategory
                  )
                  .map((docType) => {
                    const uploadedDoc = filteredDocuments.find(doc => 
                      doc.name.toLowerCase().includes(docType.name.toLowerCase()) ||
                      documents.some(apiDoc => 
                        apiDoc.document_tag === docType.id && 
                        apiDoc.document_id === doc.id
                      )
                    );

                    // Find the original API document if we have a match
                    const apiDocument = uploadedDoc 
                      ? documents.find(d => d.document_id === uploadedDoc.id)
                      : undefined;

                    return (
                      <div
                        key={docType.id}
                        onClick={handleSpecificDocumentUpload(docType)}
                        className="p-4 hover:bg-gray-50 flex items-center justify-between cursor-pointer"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="p-2 bg-gray-100 rounded">
                            <File className="h-6 w-6 text-gray-600" />
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-900">
                              {docType.name}
                              {docType.required && !uploadedDoc && 
                                <span className="ml-2 text-xs text-red-500">Required</span>
                              }
                            </h4>
                            <p className="text-sm text-gray-500">{docType.description}</p>
                            {uploadedDoc && (
                              <div className="mt-1 text-xs text-emerald-600 flex items-center">
                                <span className="mr-2">✓ Uploaded</span>
                                <span className="text-emerald-500 font-medium">
                                  {new Date(uploadedDoc.uploadedAt).toLocaleDateString()}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {uploadedDoc && apiDocument ? (
                            <>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDownload(apiDocument);
                                }}
                                className="p-1 text-gray-400 hover:text-gray-600"
                                title="Download"
                              >
                                <Download className="h-5 w-5" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(uploadedDoc.id, uploadedDoc.document_tag);
                                }}
                                className="p-1 text-gray-400 hover:text-red-600"
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </>
                          ) : uploading ? (
                            <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                          ) : (
                            <Upload className="h-5 w-5 text-gray-400" />
                          )}
                        </div>
                      </div>
                    );
                  })}

                {/* Other uploaded documents not in required list */}
                {filteredDocuments
                  .filter(doc => !documentTypes.some(type => 
                    doc.name.toLowerCase().includes(type.name.toLowerCase()) ||
                    documents.some(apiDoc => 
                      apiDoc.document_tag === type.id && 
                      apiDoc.document_id === doc.id
                    )
                  ))
                  .map((document) => {
                    // Find the original API document
                    const apiDocument = documents.find(d => d.document_id === document.id);
                    
                    if (!apiDocument) return null;
                    
                    return (
                      <div
                        key={document.id}
                        className="p-4 hover:bg-gray-50 flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="p-2 bg-gray-100 rounded">
                            <File className="h-6 w-6 text-gray-600" />
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-900">{document.name}</h4>
                            <div className="flex items-center mt-1">
                              <span className="text-xs text-gray-500 mr-2">{document.type}</span>
                              <div className="text-xs text-emerald-600 flex items-center">
                                <span className="mr-2">✓ Uploaded</span>
                                <span className="text-emerald-500 font-medium">
                                  {new Date(document.uploadedAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownload(apiDocument);
                            }}
                            className="p-1 text-gray-400 hover:text-gray-600"
                            title="Download"
                          >
                            <Download className="h-5 w-5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(document.id, document.document_tag);
                            }}
                            className="p-1 text-gray-400 hover:text-red-600"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentsSection;
