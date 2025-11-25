// App Colors
export const COLORS = {
  primary: '#42A5F5',        // Light Blue
  primaryLight: '#64B5F6',   // Lighter Blue
  primaryDark: '#1E88E5',    // Darker Blue
  secondary: '#FF5722',
  secondaryLight: '#FF8A65',
  secondaryDark: '#D84315',
  background: '#FAFAFA',
  surface: '#FFFFFF',
  error: '#F44336',
  warning: '#FF9800',
  success: '#66BB6A',        // Keep success green but lighter
  info: '#29B6F6',           // Light Blue for info
  text: {
    primary: '#212121',
    secondary: '#757575',
    disabled: '#BDBDBD',
    hint: '#9E9E9E',
  },
  border: '#E0E0E0',
  divider: '#F5F5F5',

  // Utility colors
  lightBlue: '#E3F2FD',
  lightOrange: '#FFE0B2',
  lightGreen: '#E8F5E9',
  lightRed: '#FFEBEE',
};

// App Dimensions
export const SIZES = {
  // Font sizes
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,

  // Spacing
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },

  // Border radius
  radius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    round: 999,
  },
};

// API Configuration
export const API_CONFIG = {
  BASE_URL: 'http://34.151.224.213:4000/api/v1',
  TIMEOUT: 10000,
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/auth/login',
      REGISTER: '/auth/register',
      LOGOUT: '/auth/logout',
      REFRESH: '/auth/refresh',
      ME: '/auth/me',
    },
    PROPERTIES: {
      GET_ALL: '/properties',
      GET_BY_ID: (id: string) => `/properties/${id}`,
      GET_ROOMS: (id: string) => `/properties/${id}/rooms`,
      GET_RESTAURANTS: (id: string) => `/properties/${id}/restaurants`,
    },
    HOTEL: {
      ROOMS: '/hotel/rooms',
      BOOKINGS: '/hotel/bookings',
    },
    RESTAURANT: {
      MENU: '/restaurant/menu',
      ORDERS: '/restaurant/orders',
    },
    USER: {
      PROFILE: '/user/profile',
    },
    ROOM_TYPES: {
      GET_ALL: '/room-types',
      CREATE: '/room-types',
      GET_BY_ID: (id: string) => `/room-types/${id}`,
      UPDATE: (id: string) => `/room-types/${id}`,
      DELETE: (id: string) => `/room-types/${id}`,
      ADD_AMENITY: (id: string) => `/room-types/${id}/amenities`,
      REMOVE_AMENITY: (roomTypeId: string, amenityId: string) => `/room-types/${roomTypeId}/amenities/${amenityId}`,
      BULK_ADD_AMENITIES: (id: string) => `/room-types/${id}/amenities/bulk`,
    },
    ROOMS: {
      GET_ALL: '/rooms',
      CREATE: '/rooms',
      GET_BY_ID: (id: string) => `/rooms/${id}`,
      UPDATE: (id: string) => `/rooms/${id}`,
      DELETE: (id: string) => `/rooms/${id}`,
      UPDATE_STATUS: (id: string) => `/rooms/${id}/status`,
    },
    GUESTS: {
      GET_ALL: '/guests',
      CREATE: '/guests',
      GET_BY_ID: (id: string) => `/guests/${id}`,
      GET_BY_USER: (userId: string) => `/guests/user/${userId}`,
    },
    RESERVATIONS: {
      GET_ALL: '/reservations',
      CREATE: '/reservations',
      GET_BY_ID: (id: string) => `/reservations/${id}`,
      UPDATE: (id: string) => `/reservations/${id}`,
      CANCEL: (id: string) => `/reservations/${id}/cancel`,
      CHECK_IN: (id: string) => `/reservations/${id}/check-in`,
      CHECK_OUT: (id: string) => `/reservations/${id}/check-out`,
      GET_BY_GUEST: (guestId: string) => `/reservations/guest/${guestId}`,
      GET_BY_PROPERTY: (propertyId: string) => `/reservations/property/${propertyId}`,
      CHECK_AVAILABILITY: '/reservations/check-availability',
    },
    RATE_PLANS: {
      GET_ALL: '/rate-plans',
      GET_BY_ROOM_TYPE: (roomTypeId: string) => `/rate-plans/room-type/${roomTypeId}`,
      GET_DAILY_RATES: (ratePlanId: string) => `/rate-plans/${ratePlanId}/daily-rates`,
    },
    PAYMENTS: {
      CREATE: '/payments',
      GET_BY_RESERVATION: (reservationId: string) => `/payments/reservation/${reservationId}`,
      REFUND: (paymentId: string) => `/payments/${paymentId}/refund`,
    },
    AMENITIES: {
      GET_ALL: '/amenities',
      CREATE: '/amenities',
      GET_BY_CATEGORY: (category: string) => `/amenities/category/${category}`,
    },
    RESTAURANTS: {
      GET_ALL: '/restaurants',
      CREATE: '/restaurants',
      GET_BY_ID: (id: string) => `/restaurants/${id}`,
      UPDATE: (id: string) => `/restaurants/${id}`,
      DELETE: (id: string) => `/restaurants/${id}`,
      CREATE_AREA: '/restaurants/areas',
      GET_AREAS: (restaurantId: string) => `/restaurants/${restaurantId}/areas`,
      GET_AREA_BY_ID: (id: string) => `/restaurants/areas/${id}`,
      UPDATE_AREA: (id: string) => `/restaurants/areas/${id}`,
      DELETE_AREA: (id: string) => `/restaurants/areas/${id}`,
    },
    RESTAURANT_TABLES: {
      GET_ALL: '/restaurants/tables',
      CREATE: '/restaurants/tables',
      GET_AVAILABLE: '/restaurants/tables/available',
      GET_BY_ID: (id: string) => `/restaurants/tables/${id}`,
      UPDATE: (id: string) => `/restaurants/tables/${id}`,
      DELETE: (id: string) => `/restaurants/tables/${id}`,
    },
    TABLE_BOOKINGS: {
      GET_ALL: '/restaurants/bookings',
      CREATE: '/restaurants/bookings',
      GET_BY_ID: (id: string) => `/restaurants/bookings/${id}`,
      UPDATE: (id: string) => `/restaurants/bookings/${id}`,
      CANCEL: (id: string) => `/restaurants/bookings/${id}`,
      CONFIRM: (id: string) => `/restaurants/bookings/${id}/confirm`,
      SEAT: (id: string) => `/restaurants/bookings/${id}/seat`,
      COMPLETE: (id: string) => `/restaurants/bookings/${id}/complete`,
    },
  },
};

// Storage Keys
export const STORAGE_KEYS = {
  USER_TOKEN: '@user_token',
  USER_DATA: '@user_data',
  LANGUAGE: '@language',
  THEME: '@theme',
};

// Animation Durations
export const ANIMATION_DURATION = {
  FAST: 200,
  NORMAL: 300,
  SLOW: 500,
};

// Room Types
export const ROOM_TYPES = {
  SINGLE: 'single',
  DOUBLE: 'double',
  SUITE: 'suite',
  FAMILY: 'family',
} as const;

// Order Status
export const ORDER_STATUS = {
  PENDING: 'pending',
  PREPARING: 'preparing',
  READY: 'ready',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
} as const;

// Booking Status
export const BOOKING_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CHECKED_IN: 'checked_in',
  CHECKED_OUT: 'checked_out',
  CANCELLED: 'cancelled',
  NO_SHOW: 'no_show',
  COMPLETED: 'completed',
} as const;

// Reservation Status (alias for Booking)
export const RESERVATION_STATUS = BOOKING_STATUS;

// Payment Status
export const PAYMENT_STATUS = {
  UNPAID: 'unpaid',
  PARTIAL: 'partial',
  PAID: 'paid',
  REFUNDED: 'refunded',
  AUTHORIZED: 'authorized',
  CAPTURED: 'captured',
  VOIDED: 'voided',
} as const;

// Payment Methods
export const PAYMENT_METHODS = {
  CASH: 'cash',
  CARD: 'card',
  BANK_TRANSFER: 'bank',
  E_WALLET: 'e_wallet',
  OTA_VIRTUAL: 'ota_virtual',
} as const;

// Booking Channels
export const BOOKING_CHANNELS = {
  OTA: 'ota',
  WEBSITE: 'website',
  WALK_IN: 'walkin',
  PHONE: 'phone',
  MOBILE_APP: 'mobile_app',
} as const;

// Room Operational Status
export const ROOM_OPERATIONAL_STATUS = {
  AVAILABLE: 'available',
  OUT_OF_SERVICE: 'out_of_service',
} as const;

// Room Housekeeping Status
export const ROOM_HOUSEKEEPING_STATUS = {
  CLEAN: 'clean',
  DIRTY: 'dirty',
  INSPECTED: 'inspected',
} as const;