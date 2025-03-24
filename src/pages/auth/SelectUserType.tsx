import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Home, Image, Users, Building } from 'lucide-react';
import { doc, updateDoc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import UserService from '../../services/UserService';
import PageTitle from '../../components/PageTitle';

const SelectUserType = () => {
  const navigate = useNavigate();
  const { user, userRole, roleLoading, refreshUserRole } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [roleUpdateCompleted, setRoleUpdateCompleted] = useState(false);

  useEffect(() => {
    // Redirect if user already has a role
    if (!roleLoading && userRole) {
      console.log('User already has role:', userRole);
      if (userRole === 'buyer') {
        navigate('/buyer-dashboard');
      } else if (userRole === 'seller') {
        navigate('/seller-dashboard');
      } else if (userRole === 'both') {
        navigate('/select-dashboard');
      }
    }
  }, [userRole, roleLoading, navigate]);

  // We'll keep this effect for cases where the role might be refreshed by other means
  useEffect(() => {
    // Only navigate if we've completed the role update process
    if (roleUpdateCompleted && !roleLoading && userRole) {
      console.log('Role update completed, navigating with role:', userRole);
      
      if (userRole === 'buyer') {
        navigate('/buyer-dashboard');
      } else if (userRole === 'seller') {
        navigate('/seller-dashboard');
      } else if (userRole === 'both') {
        navigate('/select-dashboard');
      }
      
      // Reset the flag after navigation
      setRoleUpdateCompleted(false);
    }
  }, [roleUpdateCompleted, userRole, roleLoading, navigate]);

  const handleUserTypeSelection = async (userType: 'buyer' | 'seller' | 'both') => {
    if (!user) return;
    
    setLoading(true);
    setError('');
    
    try {
      // Update user document in Firestore
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
        role: userType,
        email: user.email,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      // Create user in listings API
      await createUserInListingsAPI(userType);

      // Show success toast
      toast.success(`You are now registered as a ${userType}!`);
      
      // Explicitly refresh the user role and navigate based on the updated role
      console.log('Refreshing user role after API and Firestore updates');
      const updatedRole = await refreshUserRole();
      console.log('User role refreshed:', updatedRole);
      
      // Navigate based on the refreshed role
      if (updatedRole === 'buyer') {
        navigate('/buyer-dashboard');
      } else if (updatedRole === 'seller') {
        navigate('/seller-dashboard');
      } else if (updatedRole === 'both') {
        navigate('/select-dashboard');
      } else {
        // This should rarely happen, but just in case the role refresh fails
        console.warn('Failed to get updated role, using selected type for navigation');
        // Fall back to the type that was selected
        if (userType === 'buyer') {
          navigate('/buyer-dashboard');
        } else if (userType === 'seller') {
          navigate('/seller-dashboard');
        } else {
          navigate('/select-dashboard');
        }
      }
    } catch (error) {
      console.error('Error setting user role:', error);
      setError('Failed to set user role. Please try again.');
      toast.error('Failed to set user role. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Create user in listings API database
  const createUserInListingsAPI = async (userType: 'buyer' | 'seller' | 'both') => {
    if (!user?.uid || !user.email) {
      console.error('User information missing');
      toast.error('User information is incomplete. Please try again.');
      return;
    }
    
    try {
      // Determine the roles based on user type
      const roles = [];
      
      if (userType === 'buyer' || userType === 'both') {
        roles.push({ role_type: 'buyer' });
      }
      
      if (userType === 'seller' || userType === 'both') {
        roles.push({ role_type: 'seller' });
      }
      
      // Get user data from Firestore
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      // Get user's first and last name from Firestore if available
      let firstName = 'User';
      let lastName = 'User';
      let phoneNumber = undefined;
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        // Use Firestore data if available
        firstName = userData.firstName || firstName;
        lastName = userData.lastName || lastName;
        phoneNumber = userData.phone || phoneNumber;
        
        console.log('Firestore user data:', userData);
      } else {
        console.log('No user document found in Firestore');
        // Fall back to Auth user data if Firestore data not available
        if (user.displayName) {
          const nameParts = user.displayName.split(' ');
          firstName = nameParts[0] || 'User';
          lastName = nameParts.slice(1).join(' ') || 'User';
        } else if (user.email) {
          firstName = user.email.split('@')[0] || 'User';
        }
      }
      
      // Create the user data object matching API expectations
      const userData = {
        user_id: user.uid,
        first_name: firstName,
        last_name: lastName,
        email: user.email,
        phone_number: phoneNumber || user.phoneNumber || undefined,
        roles: roles
      };
      
      console.log('Sending user data to API:', userData);
      
      // Create the user in the listings API
      await UserService.createUser(userData);
      console.log('User successfully created in listings API');

      // After creating the user in the API, try to fetch the updated user data
      try {
        console.log('Fetching updated user data from API to ensure role is set');
        // Force a new API request to get the user's updated roles
        const token = await user.getIdToken(true); // Force token refresh
        
        const apiUrl = `${import.meta.env.VITE_PROPERTY_API_URL}/api/users/${user.uid}`;
        const response = await fetch(apiUrl, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const apiData = await response.json();
          console.log('Updated API user data:', apiData);
          
          if (apiData && apiData.roles) {
            console.log('Roles confirmed in API:', apiData.roles);
          } else {
            console.warn('No roles found in API response after creation');
          }
        } else {
          console.warn('Could not verify user roles in API after creation:', response.status);
        }
      } catch (verifyError) {
        console.warn('Error verifying user roles in API:', verifyError);
        // Non-blocking - we'll continue even if verification fails
      }
      
    } catch (error: any) {
      console.error('Error creating user in listings API:', error);
      // Show more detailed error message if available
      const errorMessage = error.message || 'We had trouble setting up your account fully. Some features may be limited.';
      toast.warning(errorMessage);
      
      // Don't block the user from continuing if this fails
      // We'll show a warning but let them proceed
    }
  };

  return (
    <>
      <PageTitle title="Select User Type" />
      <div className="min-h-screen flex flex-col bg-white">
        {/* Back Navigation */}
        <div className="bg-gray-50 border-b border-gray-200 py-4">
          <div className="max-w-7xl mx-auto px-4">
            <Link to="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-emerald-600 font-medium">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
          {/* Logo */}
          <div className="text-5xl font-bold mb-2">
            <span>M</span>
            <span className="text-emerald-600">ai</span>
            <span>SON</span>
          </div>
          <p className="text-gray-600 text-lg mb-16">
            Your smart AI-powered property platform.
          </p>

          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            We're Glad You're Here
          </h1>
          <p className="text-xl text-gray-600 mb-12">
            Are you looking to buy or sell a property?
          </p>

          {/* Options Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl w-full">
            {/* Buyer Option */}
            <button 
              onClick={() => handleUserTypeSelection('buyer')}
              disabled={loading}
              className="flex flex-col items-center p-10 border-2 border-emerald-600 rounded-xl hover:bg-emerald-50 hover:-translate-y-1 transition-all duration-300 disabled:opacity-50"
            >
              <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center mb-6">
                <Home className="h-10 w-10 text-emerald-600" />
              </div>
              <h2 className="text-2xl font-semibold text-emerald-600 mb-3">I'm a Buyer</h2>
              <p className="text-gray-600 text-center">
                Find your perfect property with our AI matching system. Browse listings and get personalized recommendations.
              </p>
            </button>

            {/* Seller Option */}
            <button 
              onClick={() => handleUserTypeSelection('seller')}
              disabled={loading}
              className="flex flex-col items-center p-10 border-2 border-emerald-600 rounded-xl hover:bg-emerald-50 hover:-translate-y-1 transition-all duration-300 disabled:opacity-50"
            >
              <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center mb-6">
                <Building className="h-10 w-10 text-emerald-600" />
              </div>
              <h2 className="text-2xl font-semibold text-emerald-600 mb-3">I'm a Seller</h2>
              <p className="text-gray-600 text-center">
                List your property and reach potential buyers. Get AI-powered insights and manage viewings efficiently.
              </p>
            </button>

            {/* Both Option */}
            <button 
              onClick={() => handleUserTypeSelection('both')}
              disabled={loading}
              className="flex flex-col items-center p-10 border-2 border-emerald-600 rounded-xl hover:bg-emerald-50 hover:-translate-y-1 transition-all duration-300 disabled:opacity-50"
            >
              <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center mb-6">
                <Users className="h-10 w-10 text-emerald-600" />
              </div>
              <h2 className="text-2xl font-semibold text-emerald-600 mb-3">I'm Both</h2>
              <p className="text-gray-600 text-center">
                Access both buyer and seller features. Switch between roles seamlessly as needed.
              </p>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default SelectUserType;
