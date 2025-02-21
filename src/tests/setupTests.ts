import '@testing-library/jest-dom';

// Mock Firebase
jest.mock('../config/firebase', () => ({
  auth: {
    currentUser: null,
    onAuthStateChanged: jest.fn(),
    signInWithEmailAndPassword: jest.fn(() => Promise.resolve({
      user: { 
        uid: 'testuid123',
        email: 'test@example.com',
        displayName: 'Test User'
      }
    })),
    signOut: jest.fn(),
  },
  db: {
    collection: jest.fn(),
    doc: jest.fn(),
  },
  googleProvider: {
    setCustomParameters: jest.fn(),
  },
}));

// Mock window.matchMedia
window.matchMedia = jest.fn().mockImplementation(query => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: jest.fn(),
  removeListener: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  dispatchEvent: jest.fn(),
}));

// Mock Firebase Auth
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(),
  signInWithEmailAndPassword: jest.fn(() => Promise.resolve({
    user: { 
      uid: 'testuid123',
      email: 'test@example.com',
      displayName: 'Test User'
    }
  })),
  createUserWithEmailAndPassword: jest.fn(() => Promise.resolve({
    user: {
      uid: 'testuid123',
      email: 'test@example.com'
    }
  })),
  signOut: jest.fn(() => Promise.resolve()),
  sendPasswordResetEmail: jest.fn(() => Promise.resolve()),
  GoogleAuthProvider: jest.fn(() => ({})),
  signInWithPopup: jest.fn(() => Promise.resolve({
    user: {
      uid: 'testuid123',
      email: 'test@example.com'
    }
  })),
  onAuthStateChanged: jest.fn((auth, callback) => {
    callback(null);
    return jest.fn();
  }),
}));

// Mock Firestore
jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(),
  doc: jest.fn(),
  setDoc: jest.fn(() => Promise.resolve()),
  getDoc: jest.fn(() => Promise.resolve({
    data: () => ({
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com'
    }),
    exists: () => true
  })),
})); 