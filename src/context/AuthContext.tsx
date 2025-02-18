import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User, 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  updateProfile,
  UserCredential,
  sendPasswordResetEmail // Add this import
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { db } from '../config/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { UserData } from '../types/user';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<string>; // Add this to interface
  signup: (
    email: string, 
    password: string, 
    firstName: string, 
    lastName: string, 
    userData?: Partial<UserData>
  ) => Promise<UserCredential>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
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
      return result;
    } catch (error: any) {
      const errorMessage = (() => {
        switch (error.code) {
          case 'auth/user-not-found':
            return 'No account found with this email address';
          case 'auth/wrong-password':
            return 'Incorrect password';
          case 'auth/invalid-email':
            return 'Please enter a valid email address';
          case 'auth/user-disabled':
            return 'This account has been disabled';
          case 'auth/too-many-requests':
            return 'Too many failed attempts. Please try again later';
          default:
            return 'An error occurred during login';
        }
      })();
      throw new Error(errorMessage);
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

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return 'Password reset email sent';
    } catch (error: any) {
      const errorMessage = (() => {
        switch (error.code) {
          case 'auth/user-not-found':
            return 'No account found with this email address';
          case 'auth/invalid-email':
            return 'Please enter a valid email address';
          default:
            return 'An error occurred';
        }
      })();
      throw new Error(errorMessage);
    }
  };

  const signup = async (
    email: string, 
    password: string, 
    firstName: string, 
    lastName: string, 
    userData?: Partial<UserData>
  ) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      await updateProfile(result.user, {
        displayName: `${firstName} ${lastName}`
      });

      const userDoc = {
        firstName,
        lastName,
        email,
        preferences: {
          emailUpdates: userData?.preferences?.emailUpdates || false,
          smsUpdates: userData?.preferences?.smsUpdates || false,
        },
        phone: userData?.phone,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...userData
      };

      const userDocRef = doc(db, 'users', result.user.uid);
      await setDoc(userDocRef, userDoc);
      
      return result;
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      logout, 
      signup, 
      resetPassword // Add this to the provider value
    }}>
      {!loading ? children : <div>Loading...</div>}
    </AuthContext.Provider>
  );
}