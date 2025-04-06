import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Camera, ArrowLeft } from 'lucide-react';
import PageTitle from '../../components/PageTitle';
import { useAuth } from '../../context/AuthContext';
import { useDashboard } from '../../context/DashboardContext';
import { toast } from 'react-hot-toast';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '../../config/firebase';

const ProfileSettings = () => {
  const navigate = useNavigate();
  const { user, updateUserProfile } = useAuth();
  const { dashboardData, isLoading: isLoadingDashboard } = useDashboard();
  const [email, setEmail] = useState(user?.email || '');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch phone number from Firebase when user changes
  useEffect(() => {
    const fetchPhoneNumber = async () => {
      if (user?.uid) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setPhoneNumber(userDoc.data().phone || '');
          }
        } catch (error) {
          console.error('Error fetching phone number:', error);
        }
      }
    };

    fetchPhoneNumber();
  }, [user]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let photoURL = undefined;
      
      // If there's a new profile picture, upload it to Firebase Storage
      if (previewUrl && fileInputRef.current?.files?.[0]) {
        try {
          const storage = getStorage();
          const file = fileInputRef.current.files[0];
          const storageRef = ref(storage, `profile-photos/${user?.uid}/${file.name}`);
          
          // Upload the file
          await uploadBytes(storageRef, file);
          
          // Get the download URL
          photoURL = await getDownloadURL(storageRef);
        } catch (error) {
          console.error('Error uploading profile photo:', error);
          toast.error('Failed to upload profile photo. Please try again later.');
          setIsLoading(false);
          return;
        }
      }

      await updateUserProfile({
        email: email !== user?.email ? email : undefined,
        phoneNumber: phoneNumber !== user?.phoneNumber ? phoneNumber : undefined,
        photoURL: photoURL || undefined
      });
      
      toast.success('Profile updated successfully');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingDashboard) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageTitle title="Profile Settings" />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100">
          {/* Header */}
          <div className="border-b border-gray-100 p-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-6 w-6" />
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Profile Picture Section */}
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <div className="h-32 w-32 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Profile"
                      className="h-full w-full object-cover"
                    />
                  ) : user?.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt="Profile"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-32 w-32 rounded-full bg-emerald-100 flex items-center justify-center">
                      <span className="text-4xl font-medium text-emerald-600">
                        {dashboardData?.user?.first_name?.[0] || user?.email?.[0]?.toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 p-2 bg-emerald-600 rounded-full text-white hover:bg-emerald-700 transition-colors"
                >
                  <Camera className="h-4 w-4" />
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
              </div>
              <p className="text-sm text-gray-500">Click the camera icon to change your profile picture</p>
            </div>

            {/* Name Section (Read-only) */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <User className="h-5 w-5 text-gray-400" />
                <span className="text-gray-900">
                  {dashboardData?.user?.first_name} {dashboardData?.user?.last_name}
                </span>
              </div>
              <p className="text-sm text-gray-500">Name cannot be changed</p>
            </div>

            {/* Email Section */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
                  required
                />
              </div>
            </div>

            {/* Phone Number Section */}
            <div className="space-y-2">
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="tel"
                  id="phone"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-emerald-600 text-white py-2 px-4 rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings; 