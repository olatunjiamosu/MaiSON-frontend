import { Viewing } from '../types/viewing';
import { getAuth } from 'firebase/auth';
import { API_CONFIG } from '../config/api';

class ViewingService {
  private async getAuthToken(): Promise<string | null> {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return null;
    return user.getIdToken();
  }

  async getUpcomingViewings(): Promise<Viewing[]> {
    try {
      const token = await this.getAuthToken();
      if (!token) throw new Error('Not authenticated');

      const response = await fetch(`${API_CONFIG.VIEWING_API_URL}/api/viewings/upcoming`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch upcoming viewings: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching upcoming viewings:', error);
      throw error;
    }
  }
}

export default new ViewingService(); 