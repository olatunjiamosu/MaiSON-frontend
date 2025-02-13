export const environment = {
  production: process.env.NODE_ENV === 'production',
  apiUrl: process.env.REACT_APP_API_URL || 'http://localhost:3000',
  googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '',
  // Add other environment variables as needed
};
