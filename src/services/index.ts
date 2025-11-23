// Export all services
export { apiService } from './apiService';
export { propertyService } from './propertyService';
export { roomService } from './roomService';
export { roomTypeService } from './roomTypeService';
export { reservationService } from './reservationService';
export { paymentService } from './paymentService';
export { ratePlanService } from './ratePlanService';
export { hotelService } from './hotelService';
export { restaurantService } from './restaurantService';

// Export restaurant-related services
export * as restaurantManagementService from './restaurantService';
export * as tableService from './tableService';
export * as tableBookingService from './tableBookingService';
