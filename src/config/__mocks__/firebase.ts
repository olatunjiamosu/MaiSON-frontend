// Mock Firebase configuration
export const firebaseConfig = {
  apiKey: 'mock-api-key',
  authDomain: 'mock-auth-domain',
  projectId: 'mock-project-id',
  storageBucket: 'mock-storage-bucket',
  messagingSenderId: 'mock-sender-id',
  appId: 'mock-app-id',
  measurementId: 'mock-measurement-id'
};

// Mock Firebase instances
export const auth = {
  currentUser: null,
  onAuthStateChanged: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
};

export const db = {
  collection: jest.fn(),
  doc: jest.fn(),
}; 