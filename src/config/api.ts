export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL,
  API_VERSION: '/api/v1',
  VIEWING_API_URL: import.meta.env.VITE_VIEWING_API_URL || 'https://maison-viewing-api.jollybush-a62cec71.uksouth.azurecontainerapps.io',
  CHAT: {
    GENERAL: '/chat/general',
    PROPERTY: '/chat/property',
    HISTORY: '/conversations',
    GENERAL_HISTORY: '/conversations/general/{conversation_id}/history',
    PROPERTY_HISTORY: '/conversations/property/{conversation_id}/history',
    UPDATE_STATUS: '/conversations/property/{conversation_id}/status',
    USER_CONVERSATIONS: '/conversations/user/{user_id}'
  }
}; 