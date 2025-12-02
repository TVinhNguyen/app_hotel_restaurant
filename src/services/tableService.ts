import { apiService } from './apiService';
import { API_CONFIG } from '../constants';
import type { RestaurantTable } from '../types';

// =====================
// TABLE MANAGEMENT
// =====================

/**
 * Get all tables for a restaurant with optional filters
 */
export const getAllTables = async (
  restaurantId: string, 
  filters?: { status?: string; areaId?: string }
): Promise<RestaurantTable[]> => {
  const response: any = await apiService.get<RestaurantTable[]>(API_CONFIG.ENDPOINTS.RESTAURANT_TABLES.GET_ALL, {
    params: { restaurantId, ...filters }
  });
  // Handle response structure flexibility
  if (Array.isArray(response)) return response;
  if (response && Array.isArray(response.data)) return response.data;
  return [];
};

/**
 * Get available tables for booking
 */
export const getAvailableTables = async (params: {
  restaurantId: string;
  date: string;     // YYYY-MM-DD
  time: string;     // HH:mm
  partySize: number;
}): Promise<RestaurantTable[]> => {
  const response: any = await apiService.get<RestaurantTable[]>(API_CONFIG.ENDPOINTS.RESTAURANT_TABLES.GET_AVAILABLE, {
    params
  });
  
  // Handle response structure flexibility
  if (Array.isArray(response)) return response;
  if (response && Array.isArray(response.data)) return response.data;
  
  return [];
};

/**
 * Get table by ID
 */
export const getTableById = async (tableId: string): Promise<RestaurantTable> => {
  const url = API_CONFIG.ENDPOINTS.RESTAURANT_TABLES.GET_BY_ID(tableId);
  const response: any = await apiService.get<RestaurantTable>(url);
  return response.data || response;
};

/**
 * Create a new table
 */
export const createTable = async (data: {
  restaurantId: string;
  areaId: string;
  tableNumber: string;
  capacity: number;
  status?: 'available' | 'occupied' | 'reserved';
}): Promise<RestaurantTable> => {
  const response: any = await apiService.post<RestaurantTable>(API_CONFIG.ENDPOINTS.RESTAURANT_TABLES.CREATE, data);
  return response.data || response;
};

/**
 * Update table
 */
export const updateTable = async (
  tableId: string,
  data: Partial<RestaurantTable>
): Promise<RestaurantTable> => {
  const url = API_CONFIG.ENDPOINTS.RESTAURANT_TABLES.UPDATE(tableId);
  const response: any = await apiService.put<RestaurantTable>(url, data);
  return response.data || response;
};

/**
 * Delete table
 */
export const deleteTable = async (tableId: string): Promise<void> => {
  const url = API_CONFIG.ENDPOINTS.RESTAURANT_TABLES.DELETE(tableId);
  await apiService.delete(url);
};

/**
 * Update table status
 */
export const updateTableStatus = async (
  tableId: string,
  status: 'available' | 'occupied' | 'reserved'
): Promise<RestaurantTable> => {
  return updateTable(tableId, { status });
};

/**
 * Check if table is available for specific time
 */
export const checkTableAvailability = async (
  tableId: string,
  date: string,
  time: string,
  duration: number = 120 // default 2 hours
): Promise<boolean> => {
  try {
    const availableTables = await getAvailableTables({
      restaurantId: '', // Note: This might need adjustment if backend strictly requires restaurantId
      date,
      time,
      partySize: 1
    });
    return availableTables.some(table => table.id === tableId);
  } catch (error) {
    console.error('Error checking table availability:', error);
    return false;
  }
};

export default {
  getAllTables,
  getAvailableTables,
  getTableById,
  createTable,
  updateTable,
  deleteTable,
  updateTableStatus,
  checkTableAvailability,
};