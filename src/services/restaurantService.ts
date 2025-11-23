import { apiService } from './apiService';
import { API_CONFIG } from '../constants';
import type { MenuItem, Order, OrderItem, Restaurant, RestaurantArea } from '../types';

// =====================
// RESTAURANT MANAGEMENT
// =====================

/**
 * Get all restaurants for a property
 */
export const getAllRestaurants = async (propertyId: string): Promise<Restaurant[]> => {
  const response = await apiService.get<Restaurant[]>(API_CONFIG.ENDPOINTS.RESTAURANTS.GET_ALL, {
    params: { propertyId }
  });
  return response.data;
};

/**
 * Get restaurant by ID
 */
export const getRestaurantById = async (restaurantId: string): Promise<Restaurant> => {
  const url = API_CONFIG.ENDPOINTS.RESTAURANTS.GET_BY_ID(restaurantId);
  const response = await apiService.get<Restaurant>(url);
  return response.data;
};

/**
 * Create a new restaurant
 */
export const createRestaurant = async (data: {
  property_id: string;
  name: string;
  description?: string;
  location?: string;
  openingHours?: string;
  cuisine_type?: string;
}): Promise<Restaurant> => {
  const response = await apiService.post<Restaurant>(API_CONFIG.ENDPOINTS.RESTAURANTS.CREATE, data);
  return response.data;
};

/**
 * Update restaurant
 */
export const updateRestaurant = async (
  restaurantId: string,
  data: Partial<Restaurant>
): Promise<Restaurant> => {
  const url = API_CONFIG.ENDPOINTS.RESTAURANTS.UPDATE(restaurantId);
  const response = await apiService.put<Restaurant>(url, data);
  return response.data;
};

/**
 * Delete restaurant
 */
export const deleteRestaurant = async (restaurantId: string): Promise<void> => {
  const url = API_CONFIG.ENDPOINTS.RESTAURANTS.DELETE(restaurantId);
  await apiService.delete(url);
};

// =====================
// RESTAURANT AREA MANAGEMENT
// =====================

/**
 * Get all areas for a restaurant
 */
export const getRestaurantAreas = async (restaurantId: string): Promise<RestaurantArea[]> => {
  const url = API_CONFIG.ENDPOINTS.RESTAURANTS.GET_AREAS(restaurantId);
  const response = await apiService.get<RestaurantArea[]>(url);
  return response.data;
};

/**
 * Get area by ID
 */
export const getRestaurantAreaById = async (
  restaurantId: string,
  areaId: string
): Promise<RestaurantArea> => {
  const url = API_CONFIG.ENDPOINTS.RESTAURANTS.GET_AREA_BY_ID(areaId);
  const response = await apiService.get<RestaurantArea>(url);
  return response.data;
};

/**
 * Create a new restaurant area
 */
export const createRestaurantArea = async (
  restaurantId: string,
  data: {
    name: string;
  }
): Promise<RestaurantArea> => {
  const response = await apiService.post<RestaurantArea>(API_CONFIG.ENDPOINTS.RESTAURANTS.CREATE_AREA, {
    ...data,
    restaurantId,
  });
  return response.data;
};

/**
 * Update restaurant area
 */
export const updateRestaurantArea = async (
  restaurantId: string,
  areaId: string,
  data: { name: string }
): Promise<RestaurantArea> => {
  const url = API_CONFIG.ENDPOINTS.RESTAURANTS.UPDATE_AREA(areaId);
  const response = await apiService.put<RestaurantArea>(url, data);
  return response.data;
};

/**
 * Delete restaurant area
 */
export const deleteRestaurantArea = async (
  restaurantId: string,
  areaId: string
): Promise<void> => {
  const url = API_CONFIG.ENDPOINTS.RESTAURANTS.DELETE_AREA(areaId);
  await apiService.delete(url);
};

// =====================
// MENU & ORDER MANAGEMENT (Keep existing functionality)
// =====================

export class RestaurantService {
  // Get menu items
  async getMenuItems(params?: {
    category?: string;
    available?: boolean;
  }) {
    // TODO: Update when menu API endpoints are available
    return { data: [] };
  }

  // Get menu item details
  async getMenuItemDetails(itemId: string) {
    // TODO: Update when menu API endpoints are available
    return { data: null };
  }

  // Create new order
  async createOrder(orderData: {
    items: OrderItem[];
    orderType: 'dine-in' | 'takeaway' | 'room-service';
    tableNumber?: string;
    roomNumber?: string;
  }) {
    // TODO: Update when order API endpoints are available
    return { data: null };
  }

  // Get user orders
  async getUserOrders() {
    // TODO: Update when order API endpoints are available
    return { data: [] };
  }

  // Get order details
  async getOrderDetails(orderId: string) {
    // TODO: Update when order API endpoints are available
    return { data: null };
  }

  // Update order status (for staff)
  async updateOrderStatus(orderId: string, status: string) {
    // TODO: Update when order API endpoints are available
    return { data: null };
  }

  // Cancel order
  async cancelOrder(orderId: string) {
    // TODO: Update when order API endpoints are available
    return { data: null };
  }
}

export const restaurantService = new RestaurantService();

export default {
  getAllRestaurants,
  getRestaurantById,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
  getRestaurantAreas,
  getRestaurantAreaById,
  createRestaurantArea,
  updateRestaurantArea,
  deleteRestaurantArea,
  restaurantService,
};
