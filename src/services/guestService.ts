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
   * NOTE: If backend doesn't filter properly, we filter client-side
   */
  async findGuestByEmail(email: string): Promise<Guest | null> {
    try {
      const endpoint = `${API_CONFIG.ENDPOINTS.GUESTS.GET_ALL}?email=${encodeURIComponent(email)}`;
      console.log('🔍 [GuestService] Searching guest with email:', email);
      console.log('🌐 [GuestService] API endpoint:', endpoint);
      
      const response = await apiService.get<Guest[]>(endpoint);
      console.log('📦 [GuestService] Raw response:', JSON.stringify(response, null, 2));
      
      let guests: Guest[] = [];
      
      if (response && response.data && Array.isArray(response.data)) {
        guests = response.data;
      } else if (response && Array.isArray(response)) {
        guests = response;
      }
      
      console.log('📊 [GuestService] Total guests from API:', guests.length);
      
      // IMPORTANT: Filter client-side to ensure exact email match (case-insensitive)
      const matchedGuests = guests.filter(g => 
        g.email.toLowerCase() === email.toLowerCase()
      );
      
      console.log('🔎 [GuestService] After email filter:', matchedGuests.length);
      
      if (matchedGuests.length > 0) {
        const guest = matchedGuests[0];
        console.log('✅ [GuestService] Found guest:', guest);
        console.log('✅ [GuestService] Guest ID:', guest.id);
        console.log('✅ [GuestService] Guest email:', guest.email);
        
        // Verify email match
        if (guest.email.toLowerCase() !== email.toLowerCase()) {
          console.error('❌ [GuestService] EMAIL MISMATCH - Backend not filtering!');
          console.error('   Requested:', email);
          console.error('   Returned:', guest.email);
          return null;
        }
        
        return guest;
      }
      
      console.log('⚠️ [GuestService] No guest found with email:', email);
      return null;
    } catch (error: any) {
      console.log('❌ [GuestService] Error finding guest:', error);
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
