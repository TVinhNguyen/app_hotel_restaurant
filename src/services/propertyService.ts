import { apiService } from './apiService';
import { API_CONFIG } from '../constants';
import type { Property, ApiResponse } from '../types';

class PropertyService {
  async getProperties(params?: {
    page?: number;
    limit?: number;
    search?: string;
    type?: string;
  }): Promise<ApiResponse<Property[]>> {
    const url = API_CONFIG.ENDPOINTS.PROPERTIES.GET_ALL;
    return apiService.get<Property[]>(url, { params });
  }

  async getPropertyDetails(
    id: string,
    params?: any
  ): Promise<ApiResponse<Property>> {
    return apiService.get<Property>(
      API_CONFIG.ENDPOINTS.PROPERTIES.GET_BY_ID(id),
      { params }
    );
  }

  async getPropertyRooms(
    id: string,
    params?: any
  ): Promise<ApiResponse<any[]>> {
    return apiService.get<any[]>(
      API_CONFIG.ENDPOINTS.PROPERTIES.GET_ROOMS(id),
      { params }
    );
  }

  async getPropertyRestaurants(
    id: string
  ): Promise<ApiResponse<any[]>> {
    return apiService.get<any[]>(
      API_CONFIG.ENDPOINTS.PROPERTIES.GET_RESTAURANTS(id)
    );
  }

  async searchProperties(params: {
    city?: string | null;
    checkIn?: string;
    checkOut?: string;
    adults?: number;
    children?: number;
  }): Promise<ApiResponse<Property[]>> {
    return apiService.get<Property[]>(
      API_CONFIG.ENDPOINTS.PROPERTIES.GET_ALL,
      { params }
    );
  }
}

export const propertyService = new PropertyService();
