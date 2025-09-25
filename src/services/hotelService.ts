import { apiService } from './apiService';
import { API_CONFIG } from '../constants';
import type { Room, Booking, PaginatedResponse } from '../types';

export class HotelService {
  // Get all available rooms
  async getRooms(params?: {
    checkIn?: string;
    checkOut?: string;
    guests?: number;
    type?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.checkIn) queryParams.append('checkIn', params.checkIn);
    if (params?.checkOut) queryParams.append('checkOut', params.checkOut);
    if (params?.guests) queryParams.append('guests', params.guests.toString());
    if (params?.type) queryParams.append('type', params.type);

    const url = `${API_CONFIG.ENDPOINTS.HOTEL.ROOMS}?${queryParams.toString()}`;
    return apiService.get<PaginatedResponse<Room>>(url);
  }

  // Get room details
  async getRoomDetails(roomId: string) {
    return apiService.get<Room>(`${API_CONFIG.ENDPOINTS.HOTEL.ROOMS}/${roomId}`);
  }

  // Create new booking
  async createBooking(bookingData: {
    roomId: string;
    checkInDate: string;
    checkOutDate: string;
    guests: number;
  }) {
    return apiService.post<Booking>(API_CONFIG.ENDPOINTS.HOTEL.BOOKINGS, bookingData);
  }

  // Get user bookings
  async getUserBookings() {
    return apiService.get<PaginatedResponse<Booking>>(API_CONFIG.ENDPOINTS.HOTEL.BOOKINGS);
  }

  // Get booking details
  async getBookingDetails(bookingId: string) {
    return apiService.get<Booking>(`${API_CONFIG.ENDPOINTS.HOTEL.BOOKINGS}/${bookingId}`);
  }

  // Cancel booking
  async cancelBooking(bookingId: string) {
    return apiService.put<Booking>(`${API_CONFIG.ENDPOINTS.HOTEL.BOOKINGS}/${bookingId}/cancel`);
  }
}

export const hotelService = new HotelService();