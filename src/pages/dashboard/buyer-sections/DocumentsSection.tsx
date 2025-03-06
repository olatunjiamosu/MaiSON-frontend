import React, { useState } from 'react';
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
  FileCheck
} from 'lucide-react';

interface Document {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadedAt: string;
  category: 'mortgage' | 'offers' | 'identity' | 'other';
}

interface DocumentType {
  id: string;
  name: string;
  description: string;
  category: Document['category'];
  required: boolean;
}

const mockDocuments: Document[] = [
  {
    id: '1',
    name: 'Mortgage Agreement in Principle.pdf',
    type: 'PDF',
    size: '2.4 MB',
    uploadedAt: '2024-02-20',
    category: 'mortgage'
  },
  {
    id: '2',
    name: 'Property Offer Letter.pdf',
    type: 'PDF',
    size: '1.8 MB',
    uploadedAt: '2024-02-19',
    category: 'offers'
  },
  {
    id: '3',
    name: 'Passport Scan.pdf',
    type: 'PDF',
    size: '3.2 MB',
    uploadedAt: '2024-02-18',
    category: 'identity'
  },
  {
    id: '4',
    name: 'Bank Statements.pdf',
    type: 'PDF',
    size: '1.5 MB',
    uploadedAt: '2024-02-17',
    category: 'mortgage'
  }
];

const documentTypes: DocumentType[] = [
  {
    id: 'mortgage_agreement',
    name: 'Mortgage Agreement in Principle',
    description: 'Upload your mortgage agreement from your lender',
    category: 'mortgage',
    required: true
  },
  {
    id: 'bank_statements',
    name: 'Bank Statements',
    description: 'Last 3 months of bank statements',
    category: 'mortgage',
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

const DocumentsSection = () => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | Document['category']>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    // TODO: Implement file upload
    console.log('Files:', e.target.files);
  };

  const handleDownload = (documentId: string) => {
    // TODO: Implement document download
    console.log('Downloading document:', documentId);
  };

  const handleDelete = (documentId: string) => {
    // TODO: Implement document deletion
    console.log('Deleting document:', documentId);
  };

  const handleSpecificDocumentUpload = (documentType: DocumentType) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.doc,.docx,.jpg,.jpeg,.png';
    input.style.display = 'none';
    
    input.onchange = (e: Event) => {
      const files = (e.target as HTMLInputElement).files;
      if (files && files[0]) {
        // TODO: Handle the specific document upload
        console.log(`Uploading ${documentType.name}:`, files[0]);
      }
    };

    document.body.appendChild(input);
    input.click();
    document.body.removeChild(input);
  };

  const filteredDocuments = mockDocuments.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [
    { id: 'all', label: 'All Documents', icon: FileText },
    { id: 'mortgage', label: 'Mortgage Documents', icon: Wallet },
    { id: 'offers', label: 'Offer Documents', icon: FileCheck },
    { id: 'identity', label: 'Identity Documents', icon: FileText },
    { id: 'other', label: 'Other', icon: FileText },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">My Documents</h2>
        <p className="text-gray-500">Manage your property purchase documents</p>
      </div>

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
              multiple
              className="hidden"
              onChange={handleFileUpload}
            />
            <label
              htmlFor="file-upload"
              className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 cursor-pointer"
            >
              <Upload className="h-5 w-5" />
              <span>Upload Documents</span>
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
                    doc.name.includes(docType.name)
                  );

                  return (
                    <div
                      key={docType.id}
                      onClick={() => handleSpecificDocumentUpload(docType)}
                      className="p-4 hover:bg-gray-50 flex items-center justify-between cursor-pointer"
                    >
                <div className="flex items-center space-x-4">
                        <div className="p-2 bg-gray-100 rounded">
                          <File className="h-6 w-6 text-gray-600" />
                        </div>
                  <div>
                          <h4 className="text-sm font-medium text-gray-900">
                            {docType.name}
                            {docType.required && 
                              <span className="ml-2 text-xs text-red-500">Required</span>
                            }
                          </h4>
                          <p className="text-sm text-gray-500">{docType.description}</p>
                          {uploadedDoc && (
                            <div className="flex items-center gap-4 mt-1">
                              <span className="text-xs text-gray-500">{uploadedDoc.size}</span>
                              <span className="text-xs text-gray-500">
                                Uploaded {new Date(uploadedDoc.uploadedAt).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                  </div>
                </div>
                
                      <div className="flex items-center gap-2">
                        {uploadedDoc ? (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDownload(uploadedDoc.id);
                              }}
                              className="p-1 text-gray-400 hover:text-gray-600"
                              title="Download"
                            >
                              <Download className="h-5 w-5" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(uploadedDoc.id);
                              }}
                              className="p-1 text-gray-400 hover:text-red-600"
                              title="Delete"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </>
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
                  doc.name.includes(type.name)
                ))
                .map((document) => (
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
                        <div className="flex items-center gap-4 mt-1">
                          <span className="text-xs text-gray-500">{document.size}</span>
                          <span className="text-xs text-gray-500">
                            Uploaded {new Date(document.uploadedAt).toLocaleDateString()}
                          </span>
                        </div>
              </div>
          </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownload(document.id);
                        }}
                        className="p-1 text-gray-400 hover:text-gray-600"
                        title="Download"
                      >
                        <Download className="h-5 w-5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(document.id);
                        }}
                        className="p-1 text-gray-400 hover:text-red-600"
                        title="Delete"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
              </div>
              </div>
                ))}

              {filteredDocuments.length === 0 && 
               documentTypes.filter(docType => 
                 selectedCategory === 'all' || docType.category === selectedCategory
               ).length === 0 && (
                <div className="text-center py-12">
                  <FolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No documents found</p>
              </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentsSection;
