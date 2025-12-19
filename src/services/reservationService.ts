import { apiService } from './apiService';
import { API_CONFIG } from '../constants';
import type { 
  Reservation, 
  ApiResponse, 
  CreateReservationRequest,
  CheckAvailabilityRequest,
  CheckAvailabilityResponse,
  PaginatedResponse 
} from '../types';

class ReservationService {
  /**
   * Get all reservations with optional filters
   */
  async getReservations(params?: {
    property_id?: string;
    guestId?: string;
    status?: string;
    checkIn?: string;
    checkOut?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<PaginatedResponse<Reservation>>> {
    return apiService.get<PaginatedResponse<Reservation>>(
      API_CONFIG.ENDPOINTS.RESERVATIONS.GET_ALL,
      { params }
    );
  }

  /**
   * Get reservation by ID
   */
  async getReservationById(id: string): Promise<ApiResponse<Reservation>> {
    return apiService.get<Reservation>(
      API_CONFIG.ENDPOINTS.RESERVATIONS.GET_BY_ID(id)
    );
  }

  /**
   * Get reservations by guest ID
   * Uses query param: GET /reservations?guestId={id}
   */
  async getReservationsByGuest(guestId: string): Promise<ApiResponse<Reservation[]>> {
    return this.getReservations({ guestId }) as any;
  }

  /**
   * Get reservations by property ID
   * Uses query param: GET /reservations?property_id={id}
   */
  async getReservationsByProperty(
    propertyId: string,
    params?: {
      status?: string;
      checkIn?: string;
      checkOut?: string;
    }
  ): Promise<ApiResponse<Reservation[]>> {
    return this.getReservations({ property_id: propertyId, ...params }) as any;
  }

  /**
   * Check room availability
   * NOTE: This endpoint does not exist in current API.
   * Use getReservations() with date filters instead.
   */
  async checkAvailability(
    data: CheckAvailabilityRequest
  ): Promise<ApiResponse<CheckAvailabilityResponse>> {
    console.warn('⚠️ checkAvailability endpoint does not exist in API');
    throw new Error('Endpoint not implemented');
  }

  /**
   * Create a new reservation
   */
  async createReservation(
    data: CreateReservationRequest
  ): Promise<ApiResponse<Reservation>> {
    return apiService.post<Reservation>(
      API_CONFIG.ENDPOINTS.RESERVATIONS.CREATE,
      data
    );
  }

  /**
   * Update reservation
   */
  async updateReservation(
    id: string,
    data: Partial<Reservation>
  ): Promise<ApiResponse<Reservation>> {
    return apiService.put<Reservation>(
      API_CONFIG.ENDPOINTS.RESERVATIONS.UPDATE(id),
      data
    );
  }

  /**
   * Cancel reservation
   */
  async cancelReservation(
    id: string,
    reason?: string
  ): Promise<ApiResponse<Reservation>> {
    return apiService.put<Reservation>(
      API_CONFIG.ENDPOINTS.RESERVATIONS.CANCEL(id),
      { reason }
    );
  }

  /**
   * Check-in reservation
   * POST /reservations/{id}/checkin
   */
  async checkIn(
    id: string,
    data: {
      assigned_room_id: string;
      notes?: string;
    }
  ): Promise<ApiResponse<Reservation>> {
    return apiService.post<Reservation>(
      API_CONFIG.ENDPOINTS.RESERVATIONS.CHECK_IN(id),
      data
    );
  }

  /**
   * Check-out reservation
   * POST /reservations/{id}/checkout
   */
  async checkOut(
    id: string,
    data?: {
      notes?: string;
    }
  ): Promise<ApiResponse<Reservation>> {
    return apiService.post<Reservation>(
      API_CONFIG.ENDPOINTS.RESERVATIONS.CHECK_OUT(id),
      data
    );
  }

  /**
   * Assign room to reservation
   * PUT /reservations/{id}/room
   */
  async assignRoom(
    id: string,
    roomId: string
  ): Promise<ApiResponse<Reservation>> {
    return apiService.put<Reservation>(
      API_CONFIG.ENDPOINTS.RESERVATIONS.ASSIGN_ROOM(id),
      { assigned_room_id: roomId }
    );
  }

  /**
   * Calculate reservation price
   */
  calculateTotalPrice(
    basePrice: number,
    nights: number,
    taxRate: number = 0.1,
    serviceRate: number = 0.05,
    discountAmount: number = 0
  ): {
    subtotal: number;
    taxAmount: number;
    serviceAmount: number;
    discountAmount: number;
    totalAmount: number;
  } {
    const subtotal = basePrice * nights;
    const taxAmount = subtotal * taxRate;
    const serviceAmount = subtotal * serviceRate;
    const totalAmount = subtotal + taxAmount + serviceAmount - discountAmount;

    return {
      subtotal,
      taxAmount,
      serviceAmount,
      discountAmount,
      totalAmount,
    };
  }

  /**
   * Calculate number of nights between dates
   */
  calculateNights(checkIn: string, checkOut: string): number {
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const diffTime = Math.abs(checkOutDate.getTime() - checkInDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  /**
   * Generate confirmation code
   */
  generateConfirmationCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }
}

export const reservationService = new ReservationService();
