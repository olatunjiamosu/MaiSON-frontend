import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User, 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  updateProfile,
  UserCredential
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { db } from '../config/firebase';
import { doc, setDoc } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (email: string, password: string, firstName: string, lastName: string) => Promise<UserCredential>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
      console.log('Auth state changed:', user ? 'logged in' : 'logged out');
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      console.log('Login successful:', result.user.email);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      console.log('Logout successful');
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const signup = async (email: string, password: string, firstName: string, lastName: string) => {
    try {
      console.log('Starting signup process for:', email);
      console.log('Firebase auth instance:', auth);
      console.log('Firebase config:', {
        projectId: auth.app.options.projectId,
        authDomain: auth.app.options.authDomain
      });

      const result = await createUserWithEmailAndPassword(auth, email, password);
      console.log('User created:', result);
      
      console.log('User created, updating profile...');
      await updateProfile(result.user, {
        displayName: `${firstName} ${lastName}`
      });

      console.log('Signup complete:', {
        email: result.user.email,
        displayName: result.user.displayName,
        uid: result.user.uid
      });

      // Create a Firestore document for additional user data
      await setDoc(doc(db, 'users', result.user.uid), {
        firstName,
        lastName,
        email,
        createdAt: new Date().toISOString(),
        // Add any other user data you want to store
      });

      return result;
    } catch (error: any) {
      console.error('Signup error in AuthContext:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, signup }}>
      {!loading ? children : <div>Loading...</div>}
    </AuthContext.Provider>
  );
};