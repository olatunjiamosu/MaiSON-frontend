import { getAuth } from 'firebase/auth';
import PropertyService from './PropertyService';

// Types
export interface PropertyQuestion {
  id: number;
  property_id: string;
  buyer_id: string;
  question_text: string;
  status: 'pending' | 'answered';
  created_at: string;
  answered_at?: string;
  answer_text?: string;
  property_address?: {
    street: string;
    city: string;
    postcode: string;
  };
}

export interface CreateQuestionRequest {
  property_id: string;
  question_text: string;
}

export interface AnswerQuestionRequest {
  question_id: number;
  answer: string;
}

// Base URL - use same base URL as other APIs
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
const API_VERSION = '/api/v1';

// API Endpoints
const ENDPOINTS = {
  GET_SELLER_QUESTIONS: (sellerId: string, status?: string) => 
    `${BASE_URL}${API_VERSION}/seller/questions/${sellerId}${status ? `?status=${status}` : ''}`,
  
  ANSWER_QUESTION: (questionId: number) => 
    `${BASE_URL}${API_VERSION}/seller/questions/${questionId}/answer`,
};

class PropertyQuestionsService {
  private async getAuthToken(): Promise<string | null> {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (user) {
        return await user.getIdToken();
      }
      return null;
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  }

  private async getHeaders(requireAuth: boolean = true): Promise<Record<string, string>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (requireAuth) {
      const token = await this.getAuthToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      } else {
        throw new Error('Authentication required but no token available');
      }
    }

    return headers;
  }

  // Get all questions for a seller
  async getSellerQuestions(status?: 'pending' | 'answered'): Promise<PropertyQuestion[]> {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const url = ENDPOINTS.GET_SELLER_QUESTIONS(user.uid, status);
      console.log('Fetching questions from:', url);

      const headers = await this.getHeaders(true);
      const response = await fetch(url, { headers });

      if (!response.ok) {
        console.error('API Response error:', {
          status: response.status,
          statusText: response.statusText,
          url: response.url
        });
        throw new Error(`Failed to fetch seller questions: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Questions data received:', data);
      
      // Fetch property details for each question
      const questions = data.questions || [];
      console.log('Processing questions:', questions);

      const questionsWithAddresses = await Promise.all(
        questions.map(async (question: PropertyQuestion) => {
          try {
            // Extract the actual property ID from the question
            // The property_id in the question should be the actual property ID
            const propertyId = question.property_id;
            console.log('Fetching property details for ID:', propertyId);
            
            // Use the property API URL for fetching property details
            const propertyApiUrl = import.meta.env.VITE_PROPERTY_API_URL || 'http://127.0.0.1:8000';
            const propertyApiEndpoint = import.meta.env.VITE_PROPERTY_API_ENDPOINT || '/api/properties';
            const propertyUrl = `${propertyApiUrl}${propertyApiEndpoint}/${propertyId}`;
            
            console.log('Property API URL:', propertyUrl);
            const propertyResponse = await fetch(propertyUrl, {
              headers: {
                'Content-Type': 'application/json'
              }
            });

            if (!propertyResponse.ok) {
              console.warn(`Property not found for ID ${propertyId}`);
              return question;
            }

            const property = await propertyResponse.json();
            console.log('Property data received:', property);

            if (!property || !property.address) {
              console.warn('Property or address data missing for ID:', propertyId);
              return question;
            }

            const enhancedQuestion = {
              ...question,
              property_address: {
                street: property.address.street,
                city: property.address.city,
                postcode: property.address.postcode
              }
            };
            console.log('Enhanced question with address:', enhancedQuestion);
            return enhancedQuestion;
          } catch (error) {
            console.error(`Failed to fetch property details for property ${question.property_id}:`, error);
            return question;
          }
        })
      );
      
      console.log('Final questions with addresses:', questionsWithAddresses);
      return questionsWithAddresses;
    } catch (error) {
      console.error('Error fetching seller questions:', error);
      throw error;
    }
  }

  // Get questions for a specific property (for buyers)
  async getPropertyQuestions(propertyId: string): Promise<PropertyQuestion[]> {
    try {
      const response = await fetch(`${BASE_URL}${API_VERSION}/property/${propertyId}/questions`, {
        headers: await this.getHeaders(true),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch property questions');
      }

      const data = await response.json();
      return data.questions;
    } catch (error) {
      console.error('Error fetching property questions:', error);
      throw error;
    }
  }

  // Submit a new question (for buyers)
  async submitQuestion(question: CreateQuestionRequest): Promise<PropertyQuestion> {
    try {
      const response = await fetch(`${BASE_URL}${API_VERSION}/property/questions`, {
        method: 'POST',
        headers: await this.getHeaders(true),
        body: JSON.stringify(question),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to submit question');
      }

      return await response.json();
    } catch (error) {
      console.error('Error submitting question:', error);
      throw error;
    }
  }

  // Answer a question (for sellers)
  async answerQuestion(questionId: number, answer: string): Promise<void> {
    try {
      const url = ENDPOINTS.ANSWER_QUESTION(questionId);
      const response = await fetch(url, {
        method: 'POST',
        headers: await this.getHeaders(true),
        body: JSON.stringify({
          question_id: questionId,
          answer: answer
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to submit answer');
      }

      const data = await response.json();
      if (data.status !== 'success') {
        throw new Error(data.message || 'Failed to submit answer');
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
      throw error;
    }
  }
}

export const propertyQuestionsService = new PropertyQuestionsService();
export default propertyQuestionsService; 