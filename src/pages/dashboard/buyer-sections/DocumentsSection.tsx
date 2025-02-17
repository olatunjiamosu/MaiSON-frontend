import React, { useState } from 'react';
import { Card, CardHeader, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Alert, AlertDescription } from '../../../components/ui/alert';
import { FileText, Upload, CheckCircle, XCircle, Clock } from 'lucide-react';

const DocumentsSection = () => {
  const documentTypes = {
    mortgageAgreement: 'Mortgage Agreement in Principle',
    bankStatement: 'Bank Statements (3 months)',
    idVerification: 'ID Verification',
    proofOfAddress: 'Proof of Address'
  };

  // Initialize documents state
  const initialDocuments = Object.keys(documentTypes).reduce((acc, key) => {
    acc[key] = { status: 'pending', file: null };
    return acc;
  }, {});

  const [documents, setDocuments] = useState(initialDocuments);

  const handleFileUpload = (documentType) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.doc,.docx,.jpg,.jpeg,.png';
    
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        setDocuments(prev => ({
          ...prev,
          [documentType]: {
            status: 'uploaded',
            file: file
          }
        }));
      }
    };
    
    input.click();
  };

  // Status icon component
  const StatusIcon = ({ status }) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'uploaded':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      default:
        return <Upload className="h-5 w-5 text-gray-400" />;
    }
  };

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <FileText className="h-6 w-6 text-emerald-600" />
            <h2 className="text-2xl font-bold">Required Documents</h2>
          </div>
        </CardHeader>

        <CardContent>
          <Alert className="mb-6">
            <AlertDescription>
              All documents are securely stored and will only be shared with relevant parties
              when necessary. Documents must be in PDF, DOC, DOCX, or image format.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            {Object.entries(documentTypes).map(([key, title]) => (
              <div key={key} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <StatusIcon status={documents[key]?.status || 'pending'} />
                  <div>
                    <h3 className="font-medium">{title}</h3>
                    <p className="text-sm text-gray-500">
                      {documents[key]?.file?.name || 'No file uploaded'}
                    </p>
                  </div>
                </div>
                
                <Button 
                  variant={documents[key]?.status === 'pending' ? 'default' : 'outline'}
                  onClick={() => handleFileUpload(key)}
                >
                  {documents[key]?.status === 'pending' ? 'Upload' : 'Replace'}
                </Button>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium mb-2">Document Status Key:</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Upload className="h-4 w-4 text-gray-400" />
                <span className="text-sm">Pending Upload</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-yellow-500" />
                <span className="text-sm">Awaiting Verification</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Verified</span>
              </div>
              <div className="flex items-center space-x-2">
                <XCircle className="h-4 w-4 text-red-500" />
                <span className="text-sm">Rejected</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DocumentsSection;
