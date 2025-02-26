/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PROPERTY_API_URL: string;
  readonly VITE_PROPERTY_API_ENDPOINT: string;
  readonly VITE_API_BASE_URL: string;
  // Add other environment variables as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
} 