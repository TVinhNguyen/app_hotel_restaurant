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
        // Construct query string if params exist
        let url = API_CONFIG.ENDPOINTS.PROPERTIES.GET_ALL;
        // Note: Simple implementation, can be expanded to handle query params properly if API supports it
        return apiService.get<Property[]>(url);
    }

    async getPropertyDetails(id: string, params?: any): Promise<ApiResponse<Property>> {
        return apiService.get<Property>(API_CONFIG.ENDPOINTS.PROPERTIES.GET_BY_ID(id), { params });
    }

    async getPropertyRooms(id: string, params?: any): Promise<ApiResponse<any[]>> {
        return apiService.get<any[]>(API_CONFIG.ENDPOINTS.PROPERTIES.GET_ROOMS(id), { params });
    }

    async getPropertyRestaurants(id: string): Promise<ApiResponse<any[]>> {
        return apiService.get<any[]>(API_CONFIG.ENDPOINTS.PROPERTIES.GET_RESTAURANTS(id));
    }
}

export const propertyService = new PropertyService();
