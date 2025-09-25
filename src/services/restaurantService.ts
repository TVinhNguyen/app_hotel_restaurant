import { apiService } from './apiService';
import { API_CONFIG } from '../constants';
import type { MenuItem, Order, OrderItem, PaginatedResponse } from '../types';

export class RestaurantService {
  // Get menu items
  async getMenuItems(params?: {
    category?: string;
    available?: boolean;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.category) queryParams.append('category', params.category);
    if (params?.available !== undefined) queryParams.append('available', params.available.toString());

    const url = `${API_CONFIG.ENDPOINTS.RESTAURANT.MENU}?${queryParams.toString()}`;
    return apiService.get<PaginatedResponse<MenuItem>>(url);
  }

  // Get menu item details
  async getMenuItemDetails(itemId: string) {
    return apiService.get<MenuItem>(`${API_CONFIG.ENDPOINTS.RESTAURANT.MENU}/${itemId}`);
  }

  // Create new order
  async createOrder(orderData: {
    items: OrderItem[];
    orderType: 'dine-in' | 'takeaway' | 'room-service';
    tableNumber?: string;
    roomNumber?: string;
  }) {
    return apiService.post<Order>(API_CONFIG.ENDPOINTS.RESTAURANT.ORDERS, orderData);
  }

  // Get user orders
  async getUserOrders() {
    return apiService.get<PaginatedResponse<Order>>(API_CONFIG.ENDPOINTS.RESTAURANT.ORDERS);
  }

  // Get order details
  async getOrderDetails(orderId: string) {
    return apiService.get<Order>(`${API_CONFIG.ENDPOINTS.RESTAURANT.ORDERS}/${orderId}`);
  }

  // Update order status (for staff)
  async updateOrderStatus(orderId: string, status: string) {
    return apiService.put<Order>(`${API_CONFIG.ENDPOINTS.RESTAURANT.ORDERS}/${orderId}/status`, { status });
  }

  // Cancel order
  async cancelOrder(orderId: string) {
    return apiService.put<Order>(`${API_CONFIG.ENDPOINTS.RESTAURANT.ORDERS}/${orderId}/cancel`);
  }
}

export const restaurantService = new RestaurantService();