import { apiService } from './apiService';
import { API_CONFIG } from '../constants';
import type { TableBooking } from '../types';

// =====================
// TABLE BOOKING MANAGEMENT
// =====================

/**
 * Get all table bookings
 */
export const getAllTableBookings = async (params?: {
  restaurantId?: string;
  guestId?: string;
  status?: string;
  date?: string;
}): Promise<TableBooking[]> => {
  const response: any = await apiService.get<any>(API_CONFIG.ENDPOINTS.TABLE_BOOKINGS.GET_ALL, {
    params
  });
  
  // Handle { bookings: [...], total: ... } structure
  if (response && response.bookings && Array.isArray(response.bookings)) {
      return response.bookings;
  }
  
  // Handle standard { data: [...] } structure
  if (response && response.data && Array.isArray(response.data)) {
      return response.data;
  }

  // Handle direct array
  if (Array.isArray(response)) {
      return response;
  }

  return [];
};

/**
 * Get table booking by ID
 */
export const getTableBookingById = async (bookingId: string): Promise<TableBooking> => {
  const url = API_CONFIG.ENDPOINTS.TABLE_BOOKINGS.GET_BY_ID(bookingId);
  const response: any = await apiService.get<TableBooking>(url);
  return response.data || response;
};

/**
 * Create a new table booking
 */
export const createTableBooking = async (data: {
  restaurantId: string;
  guestId?: string;
  reservation_id?: string;
  bookingDate: string;
  bookingTime: string;
  pax: number;
  specialRequests?: string;
  duration_minutes?: number;
}): Promise<TableBooking> => {
  const response: any = await apiService.post<TableBooking>(API_CONFIG.ENDPOINTS.TABLE_BOOKINGS.CREATE, data);
  if (response && response.data) return response.data;
  return response as TableBooking;
};

/**
 * Update table booking
 */
export const updateTableBooking = async (
  bookingId: string,
  data: Partial<TableBooking>
): Promise<TableBooking> => {
  const url = API_CONFIG.ENDPOINTS.TABLE_BOOKINGS.UPDATE(bookingId);
  const response: any = await apiService.put<TableBooking>(url, data);
  return response.data || response;
};

/**
 * Cancel table booking
 * Method: POST (not DELETE)
 * Endpoint: POST /api/v1/restaurants/bookings/{id}/cancel
 */
export const cancelTableBooking = async (bookingId: string): Promise<any> => {
  const url = API_CONFIG.ENDPOINTS.TABLE_BOOKINGS.CANCEL(bookingId);
  const response: any = await apiService.post(url);
  return response.data || response;
};

/**
 * Confirm table booking (staff action)
 */
export const confirmTableBooking = async (
  bookingId: string,
  assignedTableId?: string
): Promise<TableBooking> => {
  const url = API_CONFIG.ENDPOINTS.TABLE_BOOKINGS.CONFIRM(bookingId);
  const response: any = await apiService.put<TableBooking>(url, {
    assigned_table_id: assignedTableId
  });
  return response.data || response;
};

/**
 * Seat guests (mark as seated)
 */
export const seatTableBooking = async (bookingId: string): Promise<TableBooking> => {
  const url = API_CONFIG.ENDPOINTS.TABLE_BOOKINGS.SEAT(bookingId);
  const response: any = await apiService.put<TableBooking>(url);
  return response.data || response;
};

/**
 * Complete table booking (guests finished)
 */
export const completeTableBooking = async (bookingId: string): Promise<TableBooking> => {
  const url = API_CONFIG.ENDPOINTS.TABLE_BOOKINGS.COMPLETE(bookingId);
  const response: any = await apiService.put<TableBooking>(url);
  return response.data || response;
};

/**
 * Get user's table bookings
 * NOTE: Backend GET /restaurants/bookings does NOT support guestId filter
 * So we fetch all and filter client-side
 */
export const getUserTableBookings = async (guestId: string): Promise<TableBooking[]> => {
  console.log('🔍 [TableBookingService] Fetching all bookings to filter by guestId:', guestId);
  const allBookings = await getAllTableBookings();
  
  console.log('📦 [TableBookingService] Total bookings from API:', allBookings.length);
  
  // Log first booking structure to understand the data format
  if (allBookings.length > 0) {
    console.log('📋 [TableBookingService] First booking structure:', JSON.stringify(allBookings[0], null, 2));
  }
  
  // Filter by guestId on client side
  // Check both camelCase (guestId) and snake_case (guest_id), and also nested guest.id
  const filtered = allBookings.filter((booking: any) => {
    const bookingGuestId = booking.guestId || booking.guest_id || booking.guest?.id;
    const matches = bookingGuestId === guestId;
    
    if (allBookings.length <= 5) {
      // Only log details if there are few bookings to avoid spam
      console.log(`🔎 [TableBookingService] Booking ${booking.id}: guestId=${bookingGuestId}, target=${guestId}, matches=${matches}`);
    }
    
    return matches;
  });
  
  console.log('✅ [TableBookingService] Filtered bookings:', filtered.length);
  
  return filtered;
};

/**
 * Get upcoming bookings for a restaurant
 */
export const getUpcomingBookings = async (
  restaurantId: string,
  date?: string
): Promise<TableBooking[]> => {
  const bookings = await getAllTableBookings({
    restaurantId,
    date: date || new Date().toISOString().split('T')[0],
  });
  
  return bookings.filter(
    booking => booking.status !== 'completed' && booking.status !== 'cancelled'
  );
};

/**
 * Check if time slot is available
 */
export const checkTimeSlotAvailability = async (
  restaurantId: string,
  date: string,
  time: string,
  pax: number
): Promise<boolean> => {
  try {
    const bookings = await getAllTableBookings({
      restaurantId,
      date,
    });

    // Simple check - can be enhanced with duration and overlap logic
    const conflictingBookings = bookings.filter(
      booking =>
        booking.bookingTime === time &&
        booking.status !== 'cancelled' &&
        booking.status !== 'no_show'
    );

    return conflictingBookings.length === 0;
  } catch (error) {
    console.error('Error checking time slot availability:', error);
    return false;
  }
};

/**
 * Format booking time for display
 */
export const formatBookingTime = (time: string): string => {
  if (!time) return '';
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  return `${displayHour}:${minutes} ${ampm}`;
};

/**
 * Generate time slots for booking
 */
export const generateTimeSlots = (
  openTime: string = '11:00',
  closeTime: string = '22:00',
  interval: number = 30
): string[] => {
  const slots: string[] = [];
  const [openHour, openMinute] = openTime.split(':').map(Number);
  const [closeHour, closeMinute] = closeTime.split(':').map(Number);

  let currentHour = openHour;
  let currentMinute = openMinute;

  while (
    currentHour < closeHour ||
    (currentHour === closeHour && currentMinute <= closeMinute)
  ) {
    const timeString = `${String(currentHour).padStart(2, '0')}:${String(
      currentMinute
    ).padStart(2, '0')}`;
    slots.push(timeString);

    currentMinute += interval;
    if (currentMinute >= 60) {
      currentHour += Math.floor(currentMinute / 60);
      currentMinute = currentMinute % 60;
    }
  }

  return slots;
};

export default {
  getAllTableBookings,
  getTableBookingById,
  createTableBooking,
  updateTableBooking,
  cancelTableBooking,
  confirmTableBooking,
  seatTableBooking,
  completeTableBooking,
  getUserTableBookings,
  getUpcomingBookings,
  checkTimeSlotAvailability,
  formatBookingTime,
  generateTimeSlots,
};