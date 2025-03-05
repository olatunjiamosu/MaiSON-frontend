import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  UserCredential,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { UserData } from '../types/user';

type UserRole = 'buyer' | 'seller' | 'both' | null;

interface AuthContextType {
  user: User | null;
  userRole: UserRole;
  loading: boolean;
  login: (email: string, password: string) => Promise<UserCredential>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  signInWithGoogle: () => Promise<UserCredential>;
  signup: (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    userData?: Partial<UserData>
  ) => Promise<UserCredential>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user role whenever user changes
  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user) {
        setUserRole(null);
        return;
      }
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const userData = userDoc.data();
        setUserRole(userData?.role || null);
      } catch (error) {
        console.error('Error fetching user role:', error);
        setUserRole(null);
      }
    };

    fetchUserRole();
  }, [user]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('Auth state changed:', user);
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signup = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    userData?: Partial<UserData>
  ) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    const user = userCredential.user;
    const userDocRef = doc(db, 'users', user.uid);
    
    await setDoc(userDocRef, {
      firstName,
      lastName,
      email,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...userData
    });

    return userCredential;
  };

  const login = (email: string, password: string) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    // Clear chat-related data from localStorage
    localStorage.removeItem('chat_session_id');
    localStorage.removeItem('chat_history');
    localStorage.removeItem('selected_chat');
    
    // Clear all conversation messages
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('chat_messages_')) {
        localStorage.removeItem(key);
      }
    });
    
    return signOut(auth);
  };

  const resetPassword = (email: string) => {
    return sendPasswordResetEmail(auth, email);
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider);
  };

  const value = {
    user,
    userRole,
    loading,
    login,
    signup,
    logout,
    resetPassword,
    signInWithGoogle,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading ? children : <div>Loading...</div>}
    </AuthContext.Provider>
  );
};

export default AuthProvider;