import React, { useState } from 'react';

interface TestData {
  message: string;
  property: {
    id: string;
    name: string;
  };
  seller: {
    id: string;
    name: string;
  };
}

export const TestApi: React.FC = () => {
  const [getData, setGetData] = useState<TestData | null>(null);
  const [postData, setPostData] = useState<TestData | null>(null);
  const [error, setError] = useState<string>('');

  const handleGet = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/test-create');
      const data = await response.json();
      setGetData(data);
      setError('');
    } catch (err) {
      setError('Error during GET request: ' + (err as Error).message);
    }
  };

  const handlePost = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/test-create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      setPostData(data);
      setError('');
    } catch (err) {
      setError('Error during POST request: ' + (err as Error).message);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">API Test Component</h2>
      
      <div className="space-x-4 mb-4">
        <button
          onClick={handleGet}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Test GET
        </button>
        
        <button
          onClick={handlePost}
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
        >
          Test POST
        </button>
      </div>

      {error && (
        <div className="text-red-500 mb-4">
          {error}
        </div>
      )}

      {getData && (
        <div className="mb-4">
          <h3 className="font-bold">GET Response:</h3>
          <pre className="bg-gray-100 p-2 rounded">
            {JSON.stringify(getData, null, 2)}
          </pre>
        </div>
      )}

      {postData && (
        <div>
          <h3 className="font-bold">POST Response:</h3>
          <pre className="bg-gray-100 p-2 rounded">
            {JSON.stringify(postData, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}; 