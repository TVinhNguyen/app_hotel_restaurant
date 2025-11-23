import { apiService } from './apiService';
import { API_CONFIG } from '../constants';
import { RoomType, ApiResponse, Amenity } from '../types';

class RoomTypeService {
    async getRoomTypes(): Promise<ApiResponse<RoomType[]>> {
        return apiService.get<RoomType[]>(API_CONFIG.ENDPOINTS.ROOM_TYPES.GET_ALL);
    }

    async createRoomType(data: Omit<RoomType, 'id'>): Promise<ApiResponse<RoomType>> {
        return apiService.post<RoomType>(API_CONFIG.ENDPOINTS.ROOM_TYPES.CREATE, data);
    }

    async getRoomTypeById(id: string): Promise<ApiResponse<RoomType>> {
        return apiService.get<RoomType>(API_CONFIG.ENDPOINTS.ROOM_TYPES.GET_BY_ID(id));
    }

    async updateRoomType(id: string, data: Partial<RoomType>): Promise<ApiResponse<RoomType>> {
        return apiService.put<RoomType>(API_CONFIG.ENDPOINTS.ROOM_TYPES.UPDATE(id), data);
    }

    async deleteRoomType(id: string): Promise<ApiResponse<void>> {
        return apiService.delete<void>(API_CONFIG.ENDPOINTS.ROOM_TYPES.DELETE(id));
    }

    async addAmenity(roomTypeId: string, amenityId: string): Promise<ApiResponse<void>> {
        return apiService.post<void>(API_CONFIG.ENDPOINTS.ROOM_TYPES.ADD_AMENITY(roomTypeId), { amenityId });
    }

    async removeAmenity(roomTypeId: string, amenityId: string): Promise<ApiResponse<void>> {
        return apiService.delete<void>(API_CONFIG.ENDPOINTS.ROOM_TYPES.REMOVE_AMENITY(roomTypeId, amenityId));
    }

    async bulkAddAmenities(roomTypeId: string, amenityIds: string[]): Promise<ApiResponse<void>> {
        return apiService.post<void>(API_CONFIG.ENDPOINTS.ROOM_TYPES.BULK_ADD_AMENITIES(roomTypeId), { amenityIds });
    }
}

export const roomTypeService = new RoomTypeService();
