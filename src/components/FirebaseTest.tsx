import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

const FirebaseTest: React.FC = () => {
  const { user, login, signup, logout } = useAuth();
  const navigate = useNavigate();

  const testSignup = async () => {
    try {
      await signup(
        'test@example.com', 
        'Password123!',
        'Test',  // firstName
        'User'   // lastName
      );
      console.log('Signup successful');
      navigate('/select-user-type');
    } catch (error) {
      console.error('Signup failed:', error);
    }
  };

  const testLogin = async () => {
    try {
      await login('test@example.com', 'Password123!');
      console.log('Login successful');
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const testFirestore = async () => {
    try {
      const testDoc = doc(db, 'test', 'test-doc');
      await setDoc(testDoc, {
        test: 'Hello Firestore',
        timestamp: new Date().toISOString()
      });
      console.log('Test document written successfully');
    } catch (error) {
      console.error('Error writing test document:', error);
    }
  };

  return (
    <div className="p-4">
      <h2>Firebase Test</h2>
      <p>Current user: {user?.email || 'None'}</p>
      <div className="space-x-2">
        <button onClick={testSignup} className="bg-green-500 text-white px-4 py-2 rounded">
          Test Signup
        </button>
        <button onClick={testLogin} className="bg-blue-500 text-white px-4 py-2 rounded">
          Test Login
        </button>
        {user && (
          <button onClick={logout} className="bg-red-500 text-white px-4 py-2 rounded">
            Test Logout
          </button>
        )}
        <button onClick={testFirestore} className="bg-purple-500 text-white px-4 py-2 rounded">
          Test Firestore
        </button>
      </div>
    </div>
  );
};

export default FirebaseTest; 