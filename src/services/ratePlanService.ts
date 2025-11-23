import { apiService } from './apiService';
import { API_CONFIG } from '../constants';
import type { RatePlan, DailyRate, ApiResponse } from '../types';

class RatePlanService {
  /**
   * Get all rate plans
   */
  async getRatePlans(params?: {
    property_id?: string;
    roomTypeId?: string;
  }): Promise<ApiResponse<RatePlan[]>> {
    return apiService.get<RatePlan[]>(API_CONFIG.ENDPOINTS.RATE_PLANS.GET_ALL, {
      params,
    });
  }

  /**
   * Get rate plans by room type
   */
  async getRatePlansByRoomType(roomTypeId: string): Promise<ApiResponse<RatePlan[]>> {
    return apiService.get<RatePlan[]>(
      API_CONFIG.ENDPOINTS.RATE_PLANS.GET_BY_ROOM_TYPE(roomTypeId)
    );
  }

  /**
   * Get daily rates for a rate plan
   */
  async getDailyRates(
    ratePlanId: string,
    params?: {
      startDate?: string;
      endDate?: string;
    }
  ): Promise<ApiResponse<DailyRate[]>> {
    return apiService.get<DailyRate[]>(
      API_CONFIG.ENDPOINTS.RATE_PLANS.GET_DAILY_RATES(ratePlanId),
      { params }
    );
  }

  /**
   * Calculate total price for date range
   */
  calculateTotalPrice(dailyRates: DailyRate[]): number {
    return dailyRates.reduce((total, rate) => total + rate.price, 0);
  }

  /**
   * Get available rooms for date range
   */
  getMinAvailableRooms(dailyRates: DailyRate[]): number {
    if (dailyRates.length === 0) return 0;
    return Math.min(...dailyRates.map((rate) => rate.availableRooms));
  }

  /**
   * Check if any day has stop sell
   */
  hasStopSell(dailyRates: DailyRate[]): boolean {
    return dailyRates.some((rate) => rate.stopSell);
  }

  /**
   * Get dates between start and end
   */
  getDatesBetween(startDate: string, endDate: string): string[] {
    const dates: string[] = [];
    const start = new Date(startDate);
    const end = new Date(endDate);

    for (
      let current = new Date(start);
      current < end;
      current.setDate(current.getDate() + 1)
    ) {
      dates.push(current.toISOString().split('T')[0]);
    }

    return dates;
  }

  /**
   * Format cancellation policy text
   */
  formatCancellationPolicy(isRefundable: boolean, minDays: number = 7): string {
    if (!isRefundable) {
      return 'Non-refundable. No refunds will be issued for cancellations.';
    }

    return `Free cancellation up to ${minDays} days before check-in. Partial refunds may apply for cancellations made within ${minDays} days of check-in.`;
  }
}

export const ratePlanService = new RatePlanService();
