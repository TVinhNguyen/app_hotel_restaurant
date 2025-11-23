import { apiService } from './apiService';
import { API_CONFIG } from '../constants';
import { Room, ApiResponse } from '../types';

class RoomService {
    async getRooms(params?: { propertyId?: string; status?: string }): Promise<ApiResponse<Room[]>> {
        // Note: Assuming the API supports query params for filtering, though not explicitly shown in the basic endpoint list.
        // If not, filtering might need to happen client-side or via a different endpoint structure.
        // For now, we'll just call the base endpoint.
        return apiService.get<Room[]>(API_CONFIG.ENDPOINTS.ROOMS.GET_ALL);
    }

    async createRoom(data: Omit<Room, 'id'>): Promise<ApiResponse<Room>> {
        return apiService.post<Room>(API_CONFIG.ENDPOINTS.ROOMS.CREATE, data);
    }

    async getRoomById(id: string): Promise<ApiResponse<Room>> {
        return apiService.get<Room>(API_CONFIG.ENDPOINTS.ROOMS.GET_BY_ID(id));
    }

    async updateRoom(id: string, data: Partial<Room>): Promise<ApiResponse<Room>> {
        return apiService.put<Room>(API_CONFIG.ENDPOINTS.ROOMS.UPDATE(id), data);
    }

    async deleteRoom(id: string): Promise<ApiResponse<void>> {
        return apiService.delete<void>(API_CONFIG.ENDPOINTS.ROOMS.DELETE(id));
    }

    async updateRoomStatus(id: string, status: string): Promise<ApiResponse<void>> {
        return apiService.put<void>(API_CONFIG.ENDPOINTS.ROOMS.UPDATE_STATUS(id), { status });
    }
}

export const roomService = new RoomService();
