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
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants';
import DatePickerModal from '../components/DatePickerModal';
import {
  getAllRestaurants,
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
import type { Restaurant, RestaurantArea, RestaurantTable } from '../types';

const TableBookingScreen = () => {
  const navigation = useNavigation();
  
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
    generateAvailableTimeSlots();
  }, []);

  useEffect(() => {
    if (selectedRestaurant && selectedDate && selectedTime && numberOfGuests) {
      checkAvailability();
    }
  }, [selectedRestaurant, selectedDate, selectedTime, numberOfGuests]);

  const loadRestaurants = async () => {
    setLoading(true);
    try {
      // Mock data - Replace with real API call when user context is available
      const mockRestaurants: Restaurant[] = [
        {
          id: 'rest-1',
          property_id: 'prop-1',
          name: 'Main Restaurant',
          description: 'Fine dining experience',
          cuisine_type: 'International',
          openingHours: '11:00 - 22:00',
        },
        {
          id: 'rest-2',
          property_id: 'prop-1',
          name: 'Rooftop Bar & Grill',
          description: 'Casual dining with city views',
          cuisine_type: 'American',
          openingHours: '17:00 - 23:00',
        },
      ];
      
      // Uncomment when API is ready:
      // const propertyId = await getPropertyIdFromUser();
      // const data = await getAllRestaurants(propertyId);
      
      setRestaurants(mockRestaurants);
      if (mockRestaurants.length > 0) {
        setSelectedRestaurant(mockRestaurants[0]);
        loadAreas(mockRestaurants[0].id);
      }
    } catch (error) {
      console.error('Error loading restaurants:', error);
      Alert.alert('Error', 'Failed to load restaurants');
    } finally {
      setLoading(false);
    }
  };

  const loadAreas = async (restaurantId: string) => {
    try {
      // Mock data - Replace with real API call
      const mockAreas: RestaurantArea[] = [
        { id: 'area-1', restaurantId, name: 'Main Hall' },
        { id: 'area-2', restaurantId, name: 'Private Room' },
        { id: 'area-3', restaurantId, name: 'Terrace' },
      ];
      
      // Uncomment when API is ready:
      // const data = await getRestaurantAreas(restaurantId);
      
      setAreas(mockAreas);
    } catch (error) {
      console.error('Error loading areas:', error);
    }
  };

  const generateAvailableTimeSlots = () => {
    const slots = generateTimeSlots('11:00', '22:00', 30);
    setTimeSlots(slots);
  };

  const checkAvailability = async () => {
    if (!selectedRestaurant || !selectedDate || !selectedTime || !numberOfGuests) {
      return;
    }

    setLoadingTables(true);
    try {
      // Mock available tables - Replace with real API call
      const mockTables: RestaurantTable[] = [
        {
          id: 'table-1',
          restaurantId: selectedRestaurant.id,
          areaId: 'area-1',
          tableNumber: 'T1',
          capacity: 4,
          status: 'available',
        },
        {
          id: 'table-2',
          restaurantId: selectedRestaurant.id,
          areaId: 'area-1',
          tableNumber: 'T2',
          capacity: 6,
          status: 'available',
        },
      ];
      
      // Uncomment when API is ready:
      // const dateStr = selectedDate.toISOString().split('T')[0];
      // const tables = await getAvailableTables({
      //   restaurantId: selectedRestaurant.id,
      //   date: dateStr,
      //   time: selectedTime,
      //   pax: parseInt(numberOfGuests),
      // });
      
      setAvailableTables(mockTables);
    } catch (error) {
      console.error('Error checking availability:', error);
      setAvailableTables([]);
    } finally {
      setLoadingTables(false);
    }
  };

  const handleSubmitBooking = async () => {
    if (!selectedRestaurant || !selectedDate || !selectedTime || !numberOfGuests) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (availableTables.length === 0) {
      Alert.alert('Error', 'No tables available for selected time');
      return;
    }

    setSubmitting(true);
    try {
      // Mock booking - Replace with real API call
      const dateStr = selectedDate.toISOString().split('T')[0];
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Uncomment when API is ready:
      // const booking = await createTableBooking({
      //   restaurantId: selectedRestaurant.id,
      //   bookingDate: dateStr,
      //   bookingTime: selectedTime,
      //   pax: parseInt(numberOfGuests),
      //   specialRequests: specialRequests.trim() || undefined,
      //   duration_minutes: 120,
      // });

      Alert.alert(
        'Success',
        'Your table has been booked successfully!\n\n(Demo mode - no actual booking created)',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('Error creating booking:', error);
      Alert.alert('Error', 'Failed to create booking. Please try again.');
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
    return date.toLocaleDateString('en-US', options);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading restaurants...</Text>
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
          <Text style={styles.headerTitle}>Book a Table</Text>
          <Text style={styles.headerSubtitle}>Reserve your dining experience</Text>
        </View>
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Restaurant Selection */}
        {restaurants.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Restaurant</Text>
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
          <Text style={styles.sectionTitle}>Date</Text>
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
          <Text style={styles.sectionTitle}>Time</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.timeSlotContainer}
          >
            {timeSlots.map((time) => (
              <TouchableOpacity
                key={time}
                style={[
                  styles.timeSlot,
                  selectedTime === time && styles.timeSlotActive,
                ]}
                onPress={() => setSelectedTime(time)}
              >
                <Text style={[
                  styles.timeSlotText,
                  selectedTime === time && styles.timeSlotTextActive,
                ]}>
                  {formatBookingTime(time)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Number of Guests */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Number of Guests</Text>
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
            <Text style={styles.availabilityText}>Checking availability...</Text>
          </View>
        ) : selectedTime && (
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
                ? `${availableTables.length} table(s) available` 
                : 'No tables available for this time'}
            </Text>
          </View>
        )}

        {/* Special Requests */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Special Requests (Optional)</Text>
          <TextInput
            style={styles.textArea}
            value={specialRequests}
            onChangeText={setSpecialRequests}
            placeholder="E.g., Window seat, high chair, birthday celebration..."
            placeholderTextColor={COLORS.text.disabled}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Summary */}
        {selectedRestaurant && selectedTime && (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Booking Summary</Text>
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
              <Text style={styles.summaryText}>{numberOfGuests} {parseInt(numberOfGuests) === 1 ? 'guest' : 'guests'}</Text>
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
              <Text style={styles.submitButtonText}>Confirm Booking</Text>
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
    paddingVertical: SIZES.spacing.xs,
  },
  timeSlot: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius.md,
    paddingHorizontal: SIZES.spacing.lg,
    paddingVertical: SIZES.spacing.md,
    marginRight: SIZES.spacing.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  timeSlotActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  timeSlotText: {
    fontSize: SIZES.md,
    color: COLORS.text.primary,
    fontWeight: '500',
  },
  timeSlotTextActive: {
    color: COLORS.surface,
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
