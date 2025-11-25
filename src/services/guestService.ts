import { apiService } from './apiService';
import { API_CONFIG } from '../constants';
import type { ApiResponse } from '../types';

export interface Guest {
  id: string;
  userId?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  postalCode?: string;
  dateOfBirth?: string;
  nationality?: string;
  identificationNumber?: string;
  identificationType?: string;
  preferences?: any;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateGuestRequest {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
}

class GuestService {
  /**
   * Create a new guest
   */
  async createGuest(guestData: CreateGuestRequest): Promise<ApiResponse<Guest>> {
    return apiService.post<Guest>(
      API_CONFIG.ENDPOINTS.GUESTS.CREATE,
      guestData
    );
  }

  /**
   * Get guest by ID
   */
  async getGuestById(id: string): Promise<ApiResponse<Guest>> {
    return apiService.get<Guest>(
      API_CONFIG.ENDPOINTS.GUESTS.GET_BY_ID(id)
    );
  }

  /**
   * Find guest by email
   */
  async findGuestByEmail(email: string): Promise<Guest | null> {
    try {
      const response = await apiService.get<Guest[]>(
        `${API_CONFIG.ENDPOINTS.GUESTS.GET_ALL}?email=${encodeURIComponent(email)}`
      );
      
      if (response && response.data && Array.isArray(response.data) && response.data.length > 0) {
        console.log('✅ Found existing guest by email:', response.data[0].id);
        return response.data[0];
      }
      
      return null;
    } catch (error: any) {
      console.log('No guest found with email:', email);
      return null;
    }
  }

  /**
   * Get or create guest by email (like frontend website)
   * First tries to find by email, if not found creates a new one
   */
  async getOrCreateGuestByEmail(guestData: {
    name: string;
    email: string;
    phone?: string;
  }): Promise<Guest> {
    try {
      // Step 1: Try to find existing guest by email
      const existingGuest = await this.findGuestByEmail(guestData.email);
      if (existingGuest) {
        console.log('✅ Found existing guest:', existingGuest.id);
        return existingGuest;
      }
    } catch (error: any) {
      console.log('No existing guest found, will create new one...');
    }

    // Step 2: Create new guest
    const createData: CreateGuestRequest = {
      name: guestData.name,
      email: guestData.email,
      phone: guestData.phone,
    };

    console.log('Creating new guest with data:', createData);
    const response = await this.createGuest(createData);
    
    if (response && response.data) {
      console.log('✅ Created new guest:', response.data.id);
      return response.data;
    }

    throw new Error('Failed to create guest');
  }
}

export const guestService = new GuestService();
export default guestService;
