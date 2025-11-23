import { apiService } from './apiService';
import { API_CONFIG } from '../constants';
import type { Payment, ApiResponse, CreatePaymentRequest } from '../types';

class PaymentService {
  /**
   * Create a new payment
   */
  async createPayment(data: CreatePaymentRequest): Promise<ApiResponse<Payment>> {
    return apiService.post<Payment>(API_CONFIG.ENDPOINTS.PAYMENTS.CREATE, data);
  }

  /**
   * Get payments by reservation ID
   */
  async getPaymentsByReservation(reservationId: string): Promise<ApiResponse<Payment[]>> {
    return apiService.get<Payment[]>(
      API_CONFIG.ENDPOINTS.PAYMENTS.GET_BY_RESERVATION(reservationId)
    );
  }

  /**
   * Process refund
   */
  async refundPayment(
    paymentId: string,
    data: {
      amount: number;
      reason?: string;
    }
  ): Promise<ApiResponse<Payment>> {
    return apiService.post<Payment>(
      API_CONFIG.ENDPOINTS.PAYMENTS.REFUND(paymentId),
      data
    );
  }

  /**
   * Calculate refund amount based on cancellation policy
   */
  calculateRefundAmount(
    totalAmount: number,
    checkInDate: string,
    cancellationDate: string,
    isRefundable: boolean
  ): {
    refundAmount: number;
    refundPercentage: number;
    penaltyAmount: number;
  } {
    if (!isRefundable) {
      return {
        refundAmount: 0,
        refundPercentage: 0,
        penaltyAmount: totalAmount,
      };
    }

    const checkIn = new Date(checkInDate);
    const cancellation = new Date(cancellationDate);
    const daysBeforeCheckIn = Math.ceil(
      (checkIn.getTime() - cancellation.getTime()) / (1000 * 60 * 60 * 24)
    );

    let refundPercentage = 0;

    // Cancellation policy
    if (daysBeforeCheckIn >= 7) {
      refundPercentage = 100; // Full refund
    } else if (daysBeforeCheckIn >= 3) {
      refundPercentage = 50; // 50% refund
    } else if (daysBeforeCheckIn >= 1) {
      refundPercentage = 25; // 25% refund
    } else {
      refundPercentage = 0; // No refund
    }

    const refundAmount = (totalAmount * refundPercentage) / 100;
    const penaltyAmount = totalAmount - refundAmount;

    return {
      refundAmount,
      refundPercentage,
      penaltyAmount,
    };
  }

  /**
   * Validate card number (basic Luhn algorithm)
   */
  validateCardNumber(cardNumber: string): boolean {
    const cleaned = cardNumber.replace(/\s/g, '');
    if (!/^\d{13,19}$/.test(cleaned)) return false;

    let sum = 0;
    let isEven = false;

    for (let i = cleaned.length - 1; i >= 0; i--) {
      let digit = parseInt(cleaned[i], 10);

      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }

      sum += digit;
      isEven = !isEven;
    }

    return sum % 10 === 0;
  }

  /**
   * Detect card type
   */
  detectCardType(cardNumber: string): 'visa' | 'mastercard' | 'amex' | 'unknown' {
    const cleaned = cardNumber.replace(/\s/g, '');

    if (/^4/.test(cleaned)) return 'visa';
    if (/^5[1-5]/.test(cleaned)) return 'mastercard';
    if (/^3[47]/.test(cleaned)) return 'amex';

    return 'unknown';
  }

  /**
   * Format card number with spaces
   */
  formatCardNumber(cardNumber: string): string {
    const cleaned = cardNumber.replace(/\s/g, '');
    const groups = cleaned.match(/.{1,4}/g);
    return groups ? groups.join(' ') : cleaned;
  }

  /**
   * Mask card number
   */
  maskCardNumber(cardNumber: string): string {
    const cleaned = cardNumber.replace(/\s/g, '');
    if (cleaned.length < 4) return '****';
    return '**** **** **** ' + cleaned.slice(-4);
  }
}

export const paymentService = new PaymentService();
