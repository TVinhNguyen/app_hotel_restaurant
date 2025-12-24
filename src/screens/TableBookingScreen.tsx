import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants';
import DatePickerModal from '../components/DatePickerModal';
import { apiService } from '../services/apiService';
import {
  getRestaurantAreas,
} from '../services/restaurantService';
import {
  getAvailableTables,
} from '../services/tableService';
import {
  createTableBooking,
  generateTimeSlots,
  formatBookingTime,
} from '../services/tableBookingService';
import { guestService } from '../services/guestService';
import type { Restaurant, RestaurantArea, RestaurantTable } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants';

const TableBookingScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  
  // Params from navigation (e.g. from RestaurantMenuScreen)
  const { restaurantId, restaurantName } = (route.params as any) || {};

  // Form state
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState('');
  const [numberOfGuests, setNumberOfGuests] = useState('2');
  const [specialRequests, setSpecialRequests] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  // Data state
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [areas, setAreas] = useState<RestaurantArea[]>([]);
  const [availableTables, setAvailableTables] = useState<RestaurantTable[]>([]);
  const [timeSlots, setTimeSlots] = useState<string[]>([]);
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [loadingTables, setLoadingTables] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadRestaurants();
  }, []);

  // Generate time slots when restaurant is selected
  useEffect(() => {
    if (selectedRestaurant) {
      generateAvailableTimeSlots();
    }
  }, [selectedRestaurant]);

  // Handle pre-selected restaurant from navigation params
  useEffect(() => {
    if (restaurantId && restaurants.length > 0) {
      const found = restaurants.find(r => r.id === restaurantId);
      if (found) {
        setSelectedRestaurant(found);
        loadAreas(found.id);
      }
    }
  }, [restaurantId, restaurants]);

  useEffect(() => {
    if (selectedRestaurant && selectedDate && selectedTime && numberOfGuests) {
      checkAvailability();
    }
  }, [selectedRestaurant, selectedDate, selectedTime, numberOfGuests]);

  const loadRestaurants = async () => {
    setLoading(true);
    try {
      // Fetch all restaurants
      const response: any = await apiService.get('/restaurants');
      let data: Restaurant[] = [];
      
      if (response && response.restaurants) {
        data = response.restaurants;
      } else if (Array.isArray(response)) {
        data = response;
      } else if (response.data && Array.isArray(response.data)) {
        data = response.data;
      }

      setRestaurants(data);
      
      // If no pre-selected restaurant, select the first one
      if (!restaurantId && data.length > 0) {
        setSelectedRestaurant(data[0]);
        loadAreas(data[0].id);
      }
    } catch (error) {
      console.error('Error loading restaurants:', error);
      Alert.alert('Error', 'Failed to load restaurants');
    } finally {
      setLoading(false);
    }
  };

  const loadAreas = async (resId: string) => {
    try {
      const data = await getRestaurantAreas(resId);
      setAreas(data || []);
    } catch (error) {
      console.error('Error loading areas:', error);
      // Fail silently for areas, not critical
      setAreas([]);
    }
  };

  const generateAvailableTimeSlots = () => {
    // Generate full day slots from 00:00 to 23:30 to cover overnight restaurants (e.g., 17:00 to 02:00)
    const allSlots = generateTimeSlots('00:00', '23:30', 30);
    setTimeSlots(allSlots);
  };

  const isTimeSlotAvailable = (time: string): boolean => {
    if (!selectedRestaurant || !selectedRestaurant.openingHours) {
      return true; // Allow all if no hours specified
    }

    try {
      // Check if selected date is today
      const today = new Date();
      const isToday = selectedDate.toDateString() === today.toDateString();
      
      // Check if selected date is in the past
      const selectedDateOnly = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
      const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      if (selectedDateOnly < todayDateOnly) {
        return false; // Past dates not allowed
      }

      // If it's today, check if the time slot has passed
      if (isToday) {
        const [hours, minutes] = time.split(':').map(Number);
        const slotTime = new Date();
        slotTime.setHours(hours, minutes, 0, 0);
        
        // Add 30 minutes buffer to current time
        const nowWithBuffer = new Date(today.getTime() + 30 * 60 * 1000);
        
        if (slotTime < nowWithBuffer) {
          return false; // Time slot has passed
        }
      }

      const hoursStr = selectedRestaurant.openingHours;
      const timePattern = /(\d{1,2}:\d{2})/g;
      const times = hoursStr.match(timePattern);
      
      if (!times || times.length < 2) {
        return true; // Allow all if can't parse
      }

      const startTime = times[0];
      const endTime = times[1];
      
      // Convert to minutes for comparison
      const timeToMinutes = (t: string) => {
        const [h, m] = t.split(':').map(Number);
        return h * 60 + m;
      };
      
      const slotMinutes = timeToMinutes(time);
      const startMinutes = timeToMinutes(startTime);
      const endMinutes = timeToMinutes(endTime);
      
      // Handle overnight hours (e.g., 17:00 to 02:00)
      if (endMinutes < startMinutes) {
        // Time is valid if it's after start OR before end
        return slotMinutes >= startMinutes || slotMinutes <= endMinutes;
      } else {
        // Normal hours (e.g., 07:00 to 22:00)
        return slotMinutes >= startMinutes && slotMinutes <= endMinutes;
      }
    } catch (error) {
      console.error('Error checking time availability:', error);
      return true; // Allow on error
    }
  };

  // Helper function to get local date string YYYY-MM-DD to avoid UTC timezone issues
  const getLocalDateString = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const checkAvailability = async () => {
    if (!selectedRestaurant || !selectedDate || !selectedTime || !numberOfGuests) {
      return;
    }

    setLoadingTables(true);
    try {
      // FIX: Use local date string instead of ISO UTC
      const dateStr = getLocalDateString(selectedDate);
      
      console.log('Checking availability with params:', {
        restaurantId: selectedRestaurant.id,
        date: dateStr,
        time: selectedTime,
        partySize: parseInt(numberOfGuests),
      });

      // Call API: api/v1/restaurants/tables/available
      const tables = await getAvailableTables({
        restaurantId: selectedRestaurant.id,
        date: dateStr,
        time: selectedTime,
        partySize: parseInt(numberOfGuests),
      });
      
      // Ensure we have an array
      if (Array.isArray(tables)) {
          setAvailableTables(tables);
      } else {
          setAvailableTables([]);
      }
    } catch (error) {
      console.error('Error checking availability:', error);
      setAvailableTables([]);
    } finally {
      setLoadingTables(false);
    }
  };

  const handleSubmitBooking = async () => {
    if (!selectedRestaurant || !selectedDate || !selectedTime || !numberOfGuests) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    // Check if date is in the past
    const today = new Date();
    const selectedDateOnly = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
    const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    if (selectedDateOnly < todayDateOnly) {
      Alert.alert('Lỗi', 'Không thể đặt bàn cho ngày đã qua');
      return;
    }

    // Check if time is in the past (if date is today)
    if (selectedDateOnly.getTime() === todayDateOnly.getTime()) {
      const [hours, minutes] = selectedTime.split(':').map(Number);
      const slotTime = new Date();
      slotTime.setHours(hours, minutes, 0, 0);
      
      if (slotTime < today) {
        Alert.alert('Lỗi', 'Không thể đặt bàn cho thời gian đã qua');
        return;
      }
    }

    if (availableTables.length === 0) {
      Alert.alert('Không có bàn trống', 'Không có bàn trống cho thời gian và số khách đã chọn.');
      return;
    }

    // Check if user is logged in
    const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
    if (!userData) {
      Alert.alert('Yêu cầu đăng nhập', 'Vui lòng đăng nhập để đặt bàn', [
        { text: 'Huỷ', style: 'cancel' },
        { text: 'Đăng nhập', onPress: () => (navigation as any).navigate('Login') }
      ]);
      return;
    }

    setSubmitting(true);
    try {
      // FIX: Use local date string instead of ISO UTC
      const dateStr = getLocalDateString(selectedDate);
      const user = JSON.parse(userData);

      console.log('--- START BOOKING SUBMISSION ---');
      console.log('User Data:', user);

      // 1. Get or Create Guest based on logged-in user email
      let guestId = user.id; // Fallback
      let guest: any = null;
      try {
        console.log('Fetching guest for email:', user.email);
        guest = await guestService.getOrCreateGuestByEmail({
            name: user.name || 'App User',
            email: user.email,
            phone: user.phone
        });
        console.log('Guest Service Response:', guest);
        if (guest && guest.id) {
            guestId = guest.id;
        }
      } catch (guestError) {
        console.log('Guest creation failed, using fallback ID', guestError);
      }

      console.log('Final Guest ID being used:', guestId);

      // 2. Create booking - Use camelCase (service will transform to snake_case)
      const bookingData = {
        restaurantId: selectedRestaurant.id,
        guestId: guestId,
        bookingDate: dateStr,
        bookingTime: selectedTime,
        pax: parseInt(numberOfGuests),
        contactName: user.name || user.fullName || guest?.fullName || 'Guest User',
        contactPhone: user.phone || guest?.phone || '',
        specialRequests: specialRequests.trim() || undefined,
        durationMinutes: 90, // Default 90 minutes as per API spec
      };

      console.log('Submitting booking payload:', JSON.stringify(bookingData, null, 2));
      const booking = await createTableBooking(bookingData);
      console.log('Booking Creation Response:', JSON.stringify(booking, null, 2));

      if (booking && booking.id) {
        Alert.alert(
          'Đặt bàn thành công',
          'Bàn của bạn đã được đặt thành công!',
          [
            {
              text: 'Xem đặt bàn của tôi',
              onPress: () => {
                 navigation.goBack();
                 (navigation as any).navigate('MyTableBookings');
              },
            },
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      } else {
          throw new Error('Booking response invalid (no ID returned)');
      }
    } catch (error: any) {
      console.error('Error creating booking FULL:', JSON.stringify(error.response?.data || error.message, null, 2));
      
      const serverMessage = error.response?.data?.message;
      const validationErrors = error.response?.data?.errors; // Nếu backend trả về danh sách lỗi
      
      let displayMessage = 'Không thể tạo đặt bàn. Vui lòng thử lại.';
      
      if (Array.isArray(serverMessage)) {
          // Nếu message là array (như lỗi duration_minutes vừa rồi)
          displayMessage = serverMessage.join('\n');
      } else if (serverMessage) {
          displayMessage = serverMessage;
      } else if (validationErrors) {
          displayMessage = Object.values(validationErrors).flat().join('\n');
      } else if (error.message) {
          displayMessage = error.message;
      }

      Alert.alert('Đặt bàn thất bại', displayMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    };
    return date.toLocaleDateString('vi-VN', options);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Đang tải nhà hàng...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Đặt Bàn</Text>
          <Text style={styles.headerSubtitle}>Giữ chỗ trải nghiệm ẩm thực của bạn</Text>
        </View>
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Selected Restaurant Display */}
        {selectedRestaurant && (
          <View style={styles.selectedRestaurantBanner}>
            <Ionicons name="restaurant" size={24} color={COLORS.primary} />
            <View style={styles.selectedRestaurantInfo}>
              <Text style={styles.selectedRestaurantLabel}>Nhà hàng đã chọn</Text>
              <Text style={styles.selectedRestaurantName}>{selectedRestaurant.name}</Text>
              {selectedRestaurant.cuisine_type && (
                <Text style={styles.selectedRestaurantCuisine}>{selectedRestaurant.cuisine_type}</Text>
              )}
            </View>
          </View>
        )}

        {/* Restaurant Selection - Only show if no restaurant pre-selected */}
        {!restaurantId && restaurants.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Nhà hàng</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.restaurantScroll}
            >
              {restaurants.map((restaurant) => (
                <TouchableOpacity
                  key={restaurant.id}
                  style={[
                    styles.restaurantCard,
                    selectedRestaurant?.id === restaurant.id && styles.restaurantCardActive,
                  ]}
                  onPress={() => {
                    setSelectedRestaurant(restaurant);
                    loadAreas(restaurant.id);
                  }}
                >
                  <Ionicons 
                    name="restaurant" 
                    size={24} 
                    color={selectedRestaurant?.id === restaurant.id ? COLORS.primary : COLORS.text.secondary} 
                  />
                  <Text style={[
                    styles.restaurantName,
                    selectedRestaurant?.id === restaurant.id && styles.restaurantNameActive,
                  ]}>
                    {restaurant.name}
                  </Text>
                  {restaurant.cuisine_type && (
                    <Text style={styles.cuisineType}>{restaurant.cuisine_type}</Text>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Date Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ngày</Text>
          <TouchableOpacity
            style={styles.inputButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Ionicons name="calendar-outline" size={20} color={COLORS.primary} />
            <Text style={styles.inputButtonText}>{formatDate(selectedDate)}</Text>
            <Ionicons name="chevron-forward" size={20} color={COLORS.text.secondary} />
          </TouchableOpacity>
        </View>

        {/* Time Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Giờ</Text>
          <View style={styles.timeSlotContainer}>
            {timeSlots.map((time) => {
              const isAvailable = isTimeSlotAvailable(time);
              return (
                <TouchableOpacity
                  key={time}
                  style={[
                    styles.timeSlot,
                    selectedTime === time && styles.timeSlotActive,
                    !isAvailable && styles.timeSlotDisabled,
                  ]}
                  onPress={() => {
                    if (isAvailable) {
                      setSelectedTime(time);
                    }
                  }}
                  disabled={!isAvailable}
                >
                  <Text style={[
                    styles.timeSlotText,
                    selectedTime === time && styles.timeSlotTextActive,
                    !isAvailable && styles.timeSlotTextDisabled,
                  ]}>
                    {formatBookingTime(time)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Number of Guests */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Số khách</Text>
          <View style={styles.guestSelector}>
            <TouchableOpacity
              style={styles.guestButton}
              onPress={() => {
                const current = parseInt(numberOfGuests);
                if (current > 1) setNumberOfGuests(String(current - 1));
              }}
            >
              <Ionicons name="remove" size={24} color={COLORS.primary} />
            </TouchableOpacity>
            <TextInput
              style={styles.guestInput}
              value={numberOfGuests}
              onChangeText={setNumberOfGuests}
              keyboardType="number-pad"
              maxLength={2}
            />
            <TouchableOpacity
              style={styles.guestButton}
              onPress={() => {
                const current = parseInt(numberOfGuests);
                if (current < 20) setNumberOfGuests(String(current + 1));
              }}
            >
              <Ionicons name="add" size={24} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Availability Status */}
        {loadingTables ? (
          <View style={styles.availabilityContainer}>
            <ActivityIndicator size="small" color={COLORS.primary} />
            <Text style={styles.availabilityText}>Đang kiểm tra...</Text>
          </View>
        ) : selectedTime ? (
          <View style={styles.availabilityContainer}>
            <Ionicons 
              name={availableTables.length > 0 ? "checkmark-circle" : "close-circle"} 
              size={24} 
              color={availableTables.length > 0 ? COLORS.success : COLORS.error} 
            />
            <Text style={[
              styles.availabilityText,
              { color: availableTables.length > 0 ? COLORS.success : COLORS.error }
            ]}>
              {availableTables.length > 0 
                ? `Có ${availableTables.length} bàn trống` 
                : 'Không có bàn trống cho thời gian này'}
            </Text>
          </View>
        ) : null}

        {/* Special Requests */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Yêu cầu đặc biệt (Tùy chọn)</Text>
          <TextInput
            style={styles.textArea}
            value={specialRequests}
            onChangeText={setSpecialRequests}
            placeholder="Ví dụ: Chỗ ngồi gần cửa sổ, ghế trẻ em, sinh nhật..."
            placeholderTextColor={COLORS.text.disabled}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Summary */}
        {selectedRestaurant && selectedTime && (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Tóm tắt đặt bàn</Text>
            <View style={styles.summaryRow}>
              <Ionicons name="restaurant" size={20} color={COLORS.text.secondary} />
              <Text style={styles.summaryText}>{selectedRestaurant.name}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Ionicons name="calendar" size={20} color={COLORS.text.secondary} />
              <Text style={styles.summaryText}>{formatDate(selectedDate)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Ionicons name="time" size={20} color={COLORS.text.secondary} />
              <Text style={styles.summaryText}>{formatBookingTime(selectedTime)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Ionicons name="people" size={20} color={COLORS.text.secondary} />
              <Text style={styles.summaryText}>{numberOfGuests} khách</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Submit Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.submitButton,
            (submitting || availableTables.length === 0 || !selectedTime) && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmitBooking}
          disabled={submitting || availableTables.length === 0 || !selectedTime}
        >
          {submitting ? (
            <ActivityIndicator size="small" color={COLORS.surface} />
          ) : (
            <>
              <Text style={styles.submitButtonText}>Xác nhận đặt bàn</Text>
              <Ionicons name="checkmark" size={24} color={COLORS.surface} />
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Date Picker Modal */}
      <DatePickerModal
        visible={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        onDateSelect={(date: Date) => {
          setSelectedDate(date);
          setShowDatePicker(false);
        }}
        selectedDate={selectedDate}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SIZES.spacing.md,
    fontSize: SIZES.md,
    color: COLORS.text.secondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: SIZES.spacing.lg,
    paddingVertical: SIZES.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    marginRight: SIZES.spacing.md,
    padding: SIZES.spacing.xs,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  headerSubtitle: {
    fontSize: SIZES.sm,
    color: COLORS.text.secondary,
    marginTop: 2,
  },
  content: {
    flex: 1,
    padding: SIZES.spacing.lg,
  },
  section: {
    marginBottom: SIZES.spacing.xl,
  },
  selectedRestaurantBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.lightBlue,
    borderRadius: SIZES.radius.lg,
    padding: SIZES.spacing.lg,
    marginBottom: SIZES.spacing.xl,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  selectedRestaurantInfo: {
    marginLeft: SIZES.spacing.md,
    flex: 1,
  },
  selectedRestaurantLabel: {
    fontSize: SIZES.sm,
    color: COLORS.text.secondary,
    marginBottom: 2,
  },
  selectedRestaurantName: {
    fontSize: SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  selectedRestaurantCuisine: {
    fontSize: SIZES.sm,
    color: COLORS.text.secondary,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: SIZES.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SIZES.spacing.md,
  },
  restaurantScroll: {
    marginHorizontal: -SIZES.spacing.lg,
    paddingHorizontal: SIZES.spacing.lg,
  },
  restaurantCard: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius.md,
    padding: SIZES.spacing.lg,
    marginRight: SIZES.spacing.md,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
    minWidth: 120,
  },
  restaurantCardActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.lightBlue,
  },
  restaurantName: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginTop: SIZES.spacing.sm,
    textAlign: 'center',
  },
  restaurantNameActive: {
    color: COLORS.primary,
  },
  cuisineType: {
    fontSize: SIZES.sm,
    color: COLORS.text.secondary,
    marginTop: 4,
  },
  inputButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius.md,
    padding: SIZES.spacing.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  inputButtonText: {
    flex: 1,
    fontSize: SIZES.md,
    color: COLORS.text.primary,
    marginLeft: SIZES.spacing.md,
  },
  timeSlotContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -SIZES.spacing.xs,
  },
  timeSlot: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius.md,
    paddingHorizontal: SIZES.spacing.md,
    paddingVertical: SIZES.spacing.md,
    marginHorizontal: SIZES.spacing.xs,
    marginBottom: SIZES.spacing.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    minWidth: '30%',
    alignItems: 'center',
  },
  timeSlotActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  timeSlotDisabled: {
    backgroundColor: COLORS.background,
    borderColor: COLORS.border,
    opacity: 0.4,
  },
  timeSlotText: {
    fontSize: SIZES.md,
    color: COLORS.text.primary,
    fontWeight: '600',
  },
  timeSlotTextActive: {
    color: COLORS.surface,
  },
  timeSlotTextDisabled: {
    color: COLORS.text.disabled,
  },
  guestSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius.md,
    padding: SIZES.spacing.md,
  },
  guestButton: {
    backgroundColor: COLORS.lightBlue,
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  guestInput: {
    fontSize: SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginHorizontal: SIZES.spacing.xl,
    textAlign: 'center',
    minWidth: 60,
  },
  availabilityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius.md,
    padding: SIZES.spacing.lg,
    marginBottom: SIZES.spacing.xl,
  },
  availabilityText: {
    fontSize: SIZES.md,
    fontWeight: '600',
    marginLeft: SIZES.spacing.sm,
  },
  textArea: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius.md,
    padding: SIZES.spacing.lg,
    fontSize: SIZES.md,
    color: COLORS.text.primary,
    borderWidth: 1,
    borderColor: COLORS.border,
    minHeight: 100,
  },
  summaryCard: {
    backgroundColor: COLORS.lightBlue,
    borderRadius: SIZES.radius.lg,
    padding: SIZES.spacing.xl,
    marginBottom: SIZES.spacing.xl,
  },
  summaryTitle: {
    fontSize: SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: SIZES.spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SIZES.spacing.sm,
  },
  summaryText: {
    fontSize: SIZES.md,
    color: COLORS.text.primary,
    marginLeft: SIZES.spacing.md,
  },
  footer: {
    backgroundColor: COLORS.surface,
    padding: SIZES.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radius.md,
    padding: SIZES.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: COLORS.text.disabled,
    opacity: 0.5,
  },
  submitButtonText: {
    fontSize: SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.surface,
    marginRight: SIZES.spacing.sm,
  },
});

export default TableBookingScreen;