import { Routes, Route } from 'react-router-dom';
import LandingPage from '../pages/LandingPage';
import Login from '../pages/auth/Login';
import Verification from '../pages/auth/Verification';
import ResetPassword from '../pages/auth/ResetPassword';
import PrivateRoute from './PrivateRoute';
import PublicRoute from './PublicRoute';
import BuyerDashboard from '../pages/dashboard/BuyerDashboard';
import SelectUserType from '../pages/auth/SelectUserType';
import RegisterBuyer from '../pages/auth/RegisterBuyer';
import PropertyChats from '../pages/dashboard/buyer-sections/PropertyChats';
import SignUp from '../pages/auth/SignUp';
import PropertyDetails from '../pages/property/PropertyDetails';
import SavedPropertiesSection from '../pages/dashboard/buyer-sections/SavedPropertiesSection';
import ViewingsSection from '../pages/dashboard/buyer-sections/ViewingsSection';
import PublicListings from '../pages/PublicListings';
import FeaturesPage from '../pages/FeaturesPage';

// Add mock property data for testing
const mockProperty = {
  id: '1',
  images: [
    'https://images.unsplash.com/photo-1568605114967-8130f3a36994',
    'https://images.unsplash.com/photo-1570129477492-45c003edd2be',
    'https://images.unsplash.com/photo-1560448204-603b3fc33ddc',
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c',
  ],
  price: '£800,000',
  road: '123 Park Avenue',
  city: 'London',
  postcode: 'SE22 9QA',
  beds: 4,
  baths: 2,
  reception: 2,
  sqft: 2200,
  propertyType: 'Semi-Detached',
  epcRating: 'B',
  description: `A beautifully presented four-bedroom semi-detached family home situated in a prime location. This property has been extensively renovated by the current owners to provide bright and spacious accommodation arranged over two floors.

The ground floor comprises a welcoming entrance hall, elegant double reception room with period features, and a stunning extended kitchen/dining room with bi-fold doors leading to the landscaped garden.

The first floor offers four well-proportioned bedrooms and two modern bathrooms (one en-suite). Additional benefits include a utility room, guest cloakroom, and ample storage throughout.`,
  floorPlan: 'https://images.unsplash.com/photo-1536483229849-91bbb16321cd',
  lat: 51.5074,
  lng: -0.1278,
};

const AppRoutes = () => (
  <Routes>
    {/* Public Routes - Redirect Authenticated Users to Dashboard */}
    <Route
      path="/"
      element={
        <PublicRoute>
          <LandingPage />
        </PublicRoute>
      }
    />
    <Route
      path="/login"
      element={
        <PublicRoute>
          <Login />
        </PublicRoute>
      }
    />
    <Route
      path="/sign-up"
      element={
        <PublicRoute>
          <SignUp />
        </PublicRoute>
      }
    />
    <Route
      path="/verification"
      element={
        <PublicRoute>
          <Verification />
        </PublicRoute>
      }
    />
    <Route
      path="/reset-password"
      element={
        <PublicRoute>
          <ResetPassword />
        </PublicRoute>
      }
    />
    <Route
      path="/select-user-type"
      element={
        <PublicRoute>
          <SelectUserType />
        </PublicRoute>
      }
    />
    <Route
      path="/register-buyer"
      element={
        <PublicRoute>
          <RegisterBuyer />
        </PublicRoute>
      }
    />
    <Route
      path="/listings"
      element={
        <PublicRoute>
          <PublicListings />
        </PublicRoute>
      }
    />
    <Route
      path="/features"
      element={
        <PublicRoute>
          <FeaturesPage />
        </PublicRoute>
      }
    />

    {/* Protected Routes */}
    <Route
      path="/buyer-dashboard/*"
      element={
        <PrivateRoute>
          <BuyerDashboard />
        </PrivateRoute>
      }
    />

    {/* Property details route */}
    <Route
      path="/property/:id"
      element={<PropertyDetails property={mockProperty} />}
    />
  </Routes>
);

export default AppRoutes;
