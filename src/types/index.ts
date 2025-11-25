// =====================
// CORE TYPES
// =====================

// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  address?: string;
  avatar?: string;
  password_hash?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Guest {
  id: string;
  name: string;
  email: string;
  phone: string;
  loyalty_tier?: string;
  passport_id?: string;
  consent_marketing?: boolean;
  privacy_version?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Property {
  id: string;
  name: string;
  address: string;
  city: string;
  country: string;
  phone: string;
  email: string;
  website?: string;
  property_type: 'Hotel' | 'Resort' | 'Restaurant Chain';
  check_in_time?: string;
  check_out_time?: string;
}

// =====================
// ROOM TYPES
// =====================

export interface RoomType {
  id: string;
  property_id: string;
  name: string;
  description: string;
  maxAdults: number;
  maxChildren: number;
  base_price: number;
  bed_type: string;
  amenities?: Amenity[];
  photos?: Photo[];
  rooms?: Room[];
  property?: Property;
}

export interface Room {
  id: string;
  property_id: string;
  roomTypeId: string;
  number: string;
  floor: string;
  view_type?: string;
  operationalStatus: 'available' | 'out_of_service';
  housekeepingStatus: 'clean' | 'dirty' | 'inspected';
  housekeeperNotes?: string;
  roomType?: RoomType;
}

export interface Amenity {
  id: string;
  name: string;
  category: 'room' | 'facility';
}

export interface Photo {
  id: string;
  roomTypeId: string;
  url: string;
  caption?: string;
}

// =====================
// RATE & AVAILABILITY
// =====================

export interface RatePlan {
  id: string;
  property_id: string;
  roomTypeId: string;
  name: string;
  cancellationPolicyText?: string;
  currency: string;
  min_stay?: number;
  max_stay?: number;
  is_refundable: boolean;
}

export interface DailyRate {
  id: string;
  ratePlanId: string;
  date: string;
  price: number;
  availableRooms: number;
  stopSell: boolean;
}

// =====================
// RESERVATION & PAYMENT
// =====================

export interface Reservation {
  id: string;
  property_id: string;
  guestId: string;
  booker_user_id?: string;
  channel: 'ota' | 'website' | 'walkin' | 'phone' | 'mobile_app';
  external_ref?: string;
  promotion_id?: string;
  checkIn: string;
  checkOut: string;
  status: 'pending' | 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled' | 'no_show';
  roomTypeId: string;
  ratePlanId: string;
  assigned_room_id?: string;
  adults: number;
  children: number;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  guestNotes?: string;
  confirmation_code: string;
  totalAmount: number;
  taxAmount: number;
  discountAmount: number;
  serviceAmount: number;
  amountPaid: number;
  currency: string;
  paymentStatus: 'unpaid' | 'partial' | 'paid' | 'refunded';
  // Populated fields
  guest?: Guest;
  roomType?: RoomType;
  ratePlan?: RatePlan;
  assignedRoom?: Room;
  payments?: Payment[];
  services?: ReservationService[];
}

export interface Payment {
  id: string;
  reservationId: string;
  parent_payment_id?: string;
  amount: number;
  currency: string;
  method: 'cash' | 'card' | 'bank' | 'e_wallet' | 'ota_virtual';
  transaction_id?: string;
  status: 'authorized' | 'captured' | 'refunded' | 'voided';
  paidAt: string;
  notes?: string;
}

export interface ReservationService {
  id: string;
  reservationId: string;
  property_service_id: string;
  quantity: number;
  totalPrice: number;
  dateProvided: string;
}

export interface Promotion {
  id: string;
  code: string;
  discount_percent: number;
  valid_from: string;
  valid_to: string;
  property_id?: string;
}

// =====================
// LEGACY TYPES (for backward compatibility)
// =====================

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

// =====================
// RESTAURANT TYPES
// =====================
export interface Restaurant {
  id: string;
  property_id: string;
  name: string;
  description?: string;
  location?: string;
  openingHours?: string;
  cuisine_type?: string;
}

export interface RestaurantArea {
  id: string;
  restaurantId: string;
  name: string;
}

export interface RestaurantTable {
  id: string;
  restaurantId: string;
  areaId: string;
  tableNumber: string;
  capacity: number;
  status: 'available' | 'occupied' | 'reserved';
  area?: RestaurantArea;
}

export interface TableBooking {
  id: string;
  restaurantId: string;
  guestId?: string;
  reservation_id?: string;
  bookingDate: string;
  bookingTime: string;
  pax: number;
  status: 'pending' | 'confirmed' | 'seated' | 'completed' | 'no_show' | 'cancelled';
  assigned_table_id?: string;
  specialRequests?: string;
  duration_minutes?: number;
  // Populated fields
  restaurant?: Restaurant;
  guest?: Guest;
  assignedTable?: RestaurantTable;
}

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
  name: string;
  quantity: number;
  price: number;
  notes?: string;
}

// =====================
// NAVIGATION TYPES
// =====================

export type RootStackParamList = {
  Main: undefined;
  Home: undefined;
  MyBooking: undefined;
  Restaurant: undefined;
  Profile: undefined;
  RoomDetails: {
    roomId: string;
    hotelName?: string;
    hotelImage?: string;
    rating?: number;
    location?: string;
  };
  AllFacilities: {
    hotelId: string;
  };
  BookingRequest: {
    roomId: string;
    roomName: string;
    price: number;
    hotelName?: string;
  };
  Checkout: {
    bookingData: {
      roomName: string;
      checkIn: string;
      checkOut: string;
      guests: number;
      price: number;
    };
  };
  AddNewCard: undefined;
  HotelBooking: undefined;
  PaymentComplete: {
    reservationId: string;
    confirmationCode?: string;
    hotelName?: string;
    hotelLocation?: string;
    checkInDate?: string;
    checkOutDate?: string;
    guestCount?: number;
    roomType?: string;
    totalAmount?: number;
  };
  BookingDetail: {
    bookingId: string;
  };
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  MainTabs: undefined;
  TableBooking: undefined;
  MyTableBookings: undefined;
  EditProfile: undefined;
  HotelDetail: {
    hotelId: string;
    hotelName?: string;
    hotelImage?: string;
    rating?: number;
    location?: string;
  };
};

export type TabParamList = {
  Home: undefined;
  MyBooking: undefined;
  RestaurantMenu: undefined;
  Profile: undefined;
};

// =====================
// API TYPES
// =====================

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

// =====================
// REQUEST/RESPONSE TYPES
// =====================

export interface CreateReservationRequest {
  property_id: string;
  guestId?: string;
  guest?: {
    name: string;
    email: string;
    phone: string;
  };
  roomTypeId: string;
  ratePlanId: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  guestNotes?: string;
  channel?: string;
  promotion_id?: string;
}

export interface CheckAvailabilityRequest {
  property_id: string;
  roomTypeId: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
}

export interface CheckAvailabilityResponse {
  available: boolean;
  availableRooms: number;
  ratePlans: RatePlan[];
  dailyRates: DailyRate[];
  totalPrice: number;
}

export interface CreatePaymentRequest {
  reservationId: string;
  amount: number;
  method: 'cash' | 'card' | 'bank' | 'e_wallet' | 'ota_virtual';
  transaction_id?: string;
  notes?: string;
}