// User Types
export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
}

// Hotel Types
export interface Room {
  id: string;
  name: string;
  type: 'single' | 'double' | 'suite' | 'family';
  price: number;
  description: string;
  amenities: string[];
  images: string[];
  available: boolean;
  maxGuests: number;
}

export interface Booking {
  id: string;
  userId: string;
  roomId: string;
  hotelName: string;
  hotelLocation: string;
  hotelImage: string;
  checkInDate: string;
  checkOutDate: string;
  guests: number;
  rooms: number;
  totalPrice: number;
  pricePerNight: number;
  rating: number;
  status: 'booked' | 'completed' | 'cancelled';
  createdAt: string;
}

// Restaurant Types
export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'appetizer' | 'main' | 'dessert' | 'beverage';
  image?: string;
  available: boolean;
  preparationTime: number; // in minutes
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  totalPrice: number;
  status: 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  orderType: 'dine-in' | 'takeaway' | 'room-service';
  tableNumber?: string;
  roomNumber?: string;
  createdAt: string;
  estimatedReadyTime?: string;
}

export interface OrderItem {
  menuItemId: string;
  quantity: number;
  specialInstructions?: string;
  price: number;
}

// Navigation Types
export type RootStackParamList = {
  MainTabs: undefined;
  RoomDetails: { roomId: string };
  AllFacilities: { hotelId: string };
  BookingRequest: { hotelId: string; hotelName: string; price: number };
  Checkout: { 
    hotelId: string; 
    hotelName: string; 
    hotelLocation: string;
    hotelImage: string;
    rating: number;
    price: number; 
    checkInDate: Date; 
    checkOutDate: Date; 
    guestCount: number;
    roomType: string;
    phoneNumber: string;
  };
  AddNewCard: undefined;
  BookingConfirmation: { bookingId: string };
  OrderSummary: { orderId: string };
};

export type TabParamList = {
  Home: undefined;
  MyBooking: undefined;
  RestaurantMenu: undefined;
  Profile: undefined;
};

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}