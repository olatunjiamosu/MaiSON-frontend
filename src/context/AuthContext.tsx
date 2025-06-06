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
  updateEmail,
  updateProfile,
  reload,
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { UserData } from '../types/user';
import { useNavigate } from 'react-router-dom';
import UserService from '../services/UserService';

type UserRole = 'buyer' | 'seller' | 'both' | null;

interface AuthContextType {
  user: User | null;
  userRole: UserRole;
  loading: boolean;
  roleLoading: boolean;
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
  refreshUserRole: () => Promise<UserRole>;
  updateUserProfile: (data: { email?: string; phoneNumber?: string; photoURL?: string }) => Promise<void>;
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
  const [roleLoading, setRoleLoading] = useState(true);

  // Create a reusable function to fetch user role
  const fetchUserRole = async (currentUser: User | null): Promise<UserRole> => {
    if (!currentUser) {
      setUserRole(null);
      setRoleLoading(false);
      return null;
    }
    
    try {
      console.log('Fetching user role for user:', currentUser.uid);
      setRoleLoading(true);
      
      // Get the auth token
      const token = await currentUser.getIdToken();
      
      // PRIMARY SOURCE OF TRUTH: Fetch user info from the API
      try {
        console.log('Fetching user data from API');
        const apiUrl = `${import.meta.env.VITE_PROPERTY_API_URL}/api/users/${currentUser.uid}`;
        console.log('API URL:', apiUrl);
        
        const response = await fetch(apiUrl, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const apiData = await response.json();
          console.log('API user data:', apiData);
          
          if (apiData && apiData.roles && apiData.roles.length > 0) {
            // Convert API roles to Firestore role format
            let derivedRole: UserRole = null;
            const hasSellerRole = apiData.roles.some((r: any) => r.role_type === 'seller');
            const hasBuyerRole = apiData.roles.some((r: any) => r.role_type === 'buyer');
            
            if (hasSellerRole && hasBuyerRole) {
              derivedRole = 'both';
            } else if (hasSellerRole) {
              derivedRole = 'seller';
            } else if (hasBuyerRole) {
              derivedRole = 'buyer';
            }
            
            console.log('User role from API:', derivedRole);
            
            // SECONDARY: Update Firestore with the role from API for future use
            const userDocRef = doc(db, 'users', currentUser.uid);
            const userDoc = await getDoc(userDocRef);
            const firestoreData = userDoc.data();
            
            if (!firestoreData || firestoreData.role !== derivedRole) {
              console.log('Updating Firestore role to match API:', derivedRole);
              await setDoc(userDocRef, {
                role: derivedRole,
                updatedAt: new Date().toISOString()
              }, { merge: true });
            }
            
            // Use API-derived role
            setUserRole(derivedRole);
            setRoleLoading(false);
            return derivedRole;
          } else {
            console.log('No roles found in API response');
          }
        } else {
          console.error('API response not OK:', response.status);
          console.log('Trying to read from Firestore as fallback');
        }
      } catch (apiError) {
        console.error('Error fetching user from API:', apiError);
        console.log('Falling back to Firestore for role data');
      }
      
      // FALLBACK: If API fails, try Firestore
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      const userData = userDoc.data();
      console.log('User data from Firestore (fallback):', userData);
      const role = userData?.role || null;
      setUserRole(role);
      setRoleLoading(false);
      return role;
    } catch (error) {
      console.error('Error fetching user role:', error);
      setUserRole(null);
      setRoleLoading(false);
      return null;
    }
  };

  // Expose a function to explicitly refresh the user role
  const refreshUserRole = async (): Promise<UserRole> => {
    console.log('Explicitly refreshing user role');
    return await fetchUserRole(user);
  };

  // Fetch user role whenever user changes
  useEffect(() => {
    if (user) {
      fetchUserRole(user);
    } else {
      setRoleLoading(false);
    }
  }, [user]);

  useEffect(() => {
    console.log('Setting up auth state change listener');
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('Auth state changed:', user ? `User ${user.uid}` : 'No user');
      setUser(user);
      setLoading(false);
      if (!user) {
        // Clear role when user logs out
        setUserRole(null);
        setRoleLoading(false);
      }
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
    
    // Set default user type as 'both'
    const defaultUserData = {
      firstName,
      lastName,
      email,
      userType: 'both',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...userData
    };
    
    await setDoc(userDocRef, defaultUserData);

    // Create user in listings API with both roles
    try {
      await UserService.createUser({
        user_id: user.uid,
        first_name: firstName,
        last_name: lastName,
        email: email,
        phone_number: userData?.phone,
        roles: [
          { role_type: 'buyer' },
          { role_type: 'seller' }
        ]
      });
    } catch (error) {
      console.error('Error creating user in listings API:', error);
      // Continue even if API creation fails
    }

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

  const updateUserProfile = async (data: { email?: string; phoneNumber?: string; photoURL?: string }) => {
    if (!user) throw new Error('No user logged in');

    try {
      if (data.email && data.email !== user.email) {
        await updateEmail(auth.currentUser!, data.email);
      }

      if (data.photoURL) {
        await updateProfile(auth.currentUser!, {
          photoURL: data.photoURL
        });
      }

      // Update phone number in Firestore
      if (data.phoneNumber) {
        await updateDoc(doc(db, 'users', user.uid), {
          phoneNumber: data.phoneNumber
        });
      }

      // Refresh user object to get latest data
      await reload(auth.currentUser!);
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  const value = {
    user,
    userRole,
    loading,
    roleLoading,
    login,
    signup,
    logout,
    resetPassword,
    signInWithGoogle,
    refreshUserRole,
    updateUserProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading ? children : <div>Loading...</div>}
    </AuthContext.Provider>
  );
};

export default AuthProvider;