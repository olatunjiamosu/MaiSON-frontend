export interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  preferences: {
    emailUpdates: boolean;
    smsUpdates: boolean;
  };
  userType?: 'buyer' | 'seller';  // Set this when they choose their type
  createdAt: string;
  updatedAt: string;
} 