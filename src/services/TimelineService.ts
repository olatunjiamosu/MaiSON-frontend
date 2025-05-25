import { getAuth } from 'firebase/auth';

class TimelineService {
  private static async getAuthToken(): Promise<string | null> {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return null;
    return user.getIdToken();
  }

  static async getTimelineProgress(userId: string, transactionId: string) {
    const token = await this.getAuthToken();
    if (!token) throw new Error('Not authenticated');

    const url = `https://maison-api.jollybush-a62cec71.uksouth.azurecontainerapps.io/api/users/${userId}/transactions/${transactionId}/progress`;
    console.log('TimelineService - Fetching timeline progress:', { url });
    
    const res = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      console.error('TimelineService - API Error:', {
        status: res.status,
        statusText: res.statusText,
        errorData
      });
      throw new Error('Failed to fetch timeline progress');
    }
    
    const data = await res.json();
    console.log('TimelineService - API Response:', {
      ...data,
      onsite_visit_required: data.onsite_visit_required,
      mortgage_decision: data.mortgage_decision
    });
    return data;
  }

  static async updateTimelineProgress(userId: string, transactionId: string, progress: any) {
    if (!userId) {
      throw new Error('User ID is required to update timeline progress');
    }
    if (!transactionId) {
      throw new Error('Transaction ID is required to update timeline progress');
    }
    const url = `https://maison-api.jollybush-a62cec71.uksouth.azurecontainerapps.io/api/users/${userId}/transactions/${transactionId}/progress`;
    const token = await this.getAuthToken();
    if (!token) {
      throw new Error('User is not authenticated');
    }

    console.log('TimelineService - Request details:', {
      url,
      method: 'PUT',
      headers: {
        'Authorization': 'Bearer [REDACTED]',
        'Content-Type': 'application/json'
      },
      body: progress
    });

    // Add detailed payload logging
    console.log('TimelineService - Full request payload:', JSON.stringify(progress, null, 2));

    const res = await fetch(url, {
      method: 'PUT',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(progress),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('TimelineService - API Error Response:', errorText);
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch (e) {
        console.error('TimelineService - Failed to parse error response as JSON:', e);
        errorData = { message: errorText };
      }
      console.error('TimelineService - API Error:', {
        status: res.status,
        statusText: res.statusText,
        errorData,
        requestBody: progress,
        url,
        method: 'PUT',
        headers: {
          'Authorization': 'Bearer [REDACTED]',
          'Content-Type': 'application/json'
        }
      });
      throw new Error(errorData?.message || 'Failed to update timeline progress');
    }

    const responseData = await res.json();
    console.log('TimelineService - API Response:', responseData);
    return responseData;
  }

  static async confirmTimelineStep(userId: string, transactionId: string, step: string) {
    const token = await this.getAuthToken();
    if (!token) throw new Error('Not authenticated');

    const url = `https://maison-api.jollybush-a62cec71.uksouth.azurecontainerapps.io/api/users/${userId}/transactions/${transactionId}/progress/confirm`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({ step }),
    });
    if (!res.ok) throw new Error('Failed to confirm timeline step');
    return res.json();
  }

  // Add PATCH/PUT methods here as needed
}

export default TimelineService; 