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
  BASE_URL: 'https://your-api-url.com/api',
  TIMEOUT: 10000,
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/auth/login',
      REGISTER: '/auth/register',
      LOGOUT: '/auth/logout',
      REFRESH: '/auth/refresh',
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
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
} as const;