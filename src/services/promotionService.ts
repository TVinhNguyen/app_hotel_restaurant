import { apiService } from './apiService';

export interface Promotion {
  id: string;
  propertyId?: string;
  code: string;
  discountPercent: number;
  validFrom: string;
  validTo: string;
  description?: string;
  notes?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GetPromotionsParams {
  page?: number;
  limit?: number;
  propertyId?: string;
  active?: boolean;
}

export const promotionService = {
  /**
   * Get all promotions with filters
   * GET /api/v1/promotions
   */
  getPromotions: async (params?: GetPromotionsParams) => {
    try {
      const response = await apiService.get('/promotions', { params });
      return response;
    } catch (error) {
      console.error('Error fetching promotions:', error);
      throw error;
    }
  },

  /**
   * Get promotion by ID
   * GET /api/v1/promotions/:id
   */
  getPromotionById: async (id: string) => {
    try {
      const response = await apiService.get(`/promotions/${id}`);
      return response;
    } catch (error) {
      console.error('Error fetching promotion:', error);
      throw error;
    }
  },

  /**
   * Get promotion by code
   * GET /api/v1/promotions/code/:code
   */
  getPromotionByCode: async (code: string) => {
    try {
      const response = await apiService.get(`/promotions/code/${code}`);
      return response;
    } catch (error) {
      console.error('Error fetching promotion by code:', error);
      throw error;
    }
  },

  /**
   * Validate if promotion is applicable
   */
  isPromotionValid: (promotion: Promotion): boolean => {
    if (!promotion.active) return false;
    
    const now = new Date();
    const validFrom = new Date(promotion.validFrom);
    const validTo = new Date(promotion.validTo);
    
    return now >= validFrom && now <= validTo;
  },
};
