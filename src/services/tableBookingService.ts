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
  const response = await apiService.get<TableBooking[]>(API_CONFIG.ENDPOINTS.TABLE_BOOKINGS.GET_ALL, {
    params
  });
  return response.data;
};

/**
 * Get table booking by ID
 */
export const getTableBookingById = async (bookingId: string): Promise<TableBooking> => {
  const url = API_CONFIG.ENDPOINTS.TABLE_BOOKINGS.GET_BY_ID(bookingId);
  const response = await apiService.get<TableBooking>(url);
  return response.data;
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
  const response = await apiService.post<TableBooking>(API_CONFIG.ENDPOINTS.TABLE_BOOKINGS.CREATE, data);
  return response.data;
};

/**
 * Update table booking
 */
export const updateTableBooking = async (
  bookingId: string,
  data: Partial<TableBooking>
): Promise<TableBooking> => {
  const url = API_CONFIG.ENDPOINTS.TABLE_BOOKINGS.UPDATE(bookingId);
  const response = await apiService.put<TableBooking>(url, data);
  return response.data;
};

/**
 * Cancel table booking
 */
export const cancelTableBooking = async (bookingId: string): Promise<TableBooking> => {
  const url = API_CONFIG.ENDPOINTS.TABLE_BOOKINGS.CANCEL(bookingId);
  const response = await apiService.put<TableBooking>(url);
  return response.data;
};

/**
 * Confirm table booking (staff action)
 */
export const confirmTableBooking = async (
  bookingId: string,
  assignedTableId?: string
): Promise<TableBooking> => {
  const url = API_CONFIG.ENDPOINTS.TABLE_BOOKINGS.CONFIRM(bookingId);
  const response = await apiService.put<TableBooking>(url, {
    assigned_table_id: assignedTableId
  });
  return response.data;
};

/**
 * Seat guests (mark as seated)
 */
export const seatTableBooking = async (bookingId: string): Promise<TableBooking> => {
  const url = API_CONFIG.ENDPOINTS.TABLE_BOOKINGS.SEAT(bookingId);
  const response = await apiService.put<TableBooking>(url);
  return response.data;
};

/**
 * Complete table booking (guests finished)
 */
export const completeTableBooking = async (bookingId: string): Promise<TableBooking> => {
  const url = API_CONFIG.ENDPOINTS.TABLE_BOOKINGS.COMPLETE(bookingId);
  const response = await apiService.put<TableBooking>(url);
  return response.data;
};

/**
 * Get user's table bookings
 */
export const getUserTableBookings = async (guestId: string): Promise<TableBooking[]> => {
  return getAllTableBookings({ guestId });
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
