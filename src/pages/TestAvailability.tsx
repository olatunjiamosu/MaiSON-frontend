import React from 'react';
import TestAvailabilitySection from '../components/test/TestAvailabilitySection';
import { useAuth } from '../context/AuthContext';

const TestAvailability: React.FC = () => {
  const { user } = useAuth();

  const testHeader = (
    <div className="p-4 bg-gray-100 mb-4">
      <h2 className="text-lg font-bold mb-4">Test Environment</h2>
      
      {/* User Status */}
      <div className="bg-white p-3 rounded shadow-sm mb-4">
        <h3 className="font-medium mb-2">Current User:</h3>
        <p className="text-sm font-mono">
          {user ? (
            <>
              Email: {user.email}<br />
              UID: {user.uid}
            </>
          ) : (
            'Not signed in - Please login as a seller first'
          )}
        </p>
      </div>

      <div className="bg-blue-50 p-3 rounded">
        <p className="text-sm text-blue-800">
          This is a test environment using local state. No database calls will be made.
          Use this to test the UI and functionality before integrating with your backend.
        </p>
      </div>
    </div>
  );

  return (
    <div>
      {testHeader}
      <TestAvailabilitySection />
    </div>
  );
};

export default TestAvailability; 