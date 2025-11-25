import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SIZES, STORAGE_KEYS } from '../constants';
import DatePickerModal from '../components/DatePickerModal';
import PaymentMethodModal from '../components/PaymentMethodModal';
import { RootStackParamList } from '../types';
import { reservationService } from '../services/reservationService';
import { roomTypeService } from '../services/roomTypeService';

type BookingRequestNavigationProp = NativeStackNavigationProp<RootStackParamList, 'BookingRequest'>;

const BookingRequestScreen = () => {
  const navigation = useNavigation<BookingRequestNavigationProp>();
  const route = useRoute();
  const { roomId, hotelName, price, hotelImage, rating, location } = route.params as {
    roomId: string;
    hotelName: string;
    price: number;
    hotelImage?: string;
    rating?: number;
    location?: string;
  };

  const [checkInDate, setCheckInDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  });
  const [checkOutDate, setCheckOutDate] = useState(() => {
    const dayAfterTomorrow = new Date();
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
    return dayAfterTomorrow;
  });
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerType, setDatePickerType] = useState<'checkin' | 'checkout'>('checkin');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState({
    id: '1',
    name: 'FastPayz',
    cardNumber: '•••••6587'
  });
  const [loading, setLoading] = useState(false);
  const [roomTypeData, setRoomTypeData] = useState<any>(null);
  const [propertyId, setPropertyId] = useState<string>('');

  // Calculate derived values
  const timeDiff = checkOutDate.getTime() - checkInDate.getTime();
  const nights = Math.ceil(timeDiff / (1000 * 3600 * 24));
  const guestCount = adults + children;
  
  // Calculate pricing
  const pricing = reservationService.calculateTotalPrice(
    price,
    nights,
    0.1,  // 10% tax
    0.05, // 5% service
    0     // no discount
  );

  // Fetch room type details on mount
  useEffect(() => {
    fetchRoomTypeDetails();
  }, [roomId]);

  const fetchRoomTypeDetails = async () => {
    try {
      const response = await roomTypeService.getRoomTypeById(roomId);
      const roomData = response.success ? response.data : response;
      
      if (roomData) {
        // Map API response
        const mapped = {
          id: roomData.id,
          property_id: (roomData as any).propertyId || roomData.property_id,
          name: roomData.name,
          base_price: parseFloat((roomData as any).basePrice || roomData.base_price || '0'),
          maxAdults: roomData.maxAdults,
          maxChildren: roomData.maxChildren,
          property: (roomData as any).property
        };
        setRoomTypeData(mapped);
        setPropertyId(mapped.property_id);
      }
    } catch (error) {
      console.error('Error fetching room type:', error);
    }
  };



  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleDatePress = (type: 'checkin' | 'checkout') => {
    setDatePickerType(type);
    setShowDatePicker(true);
  };

  const handleDateSelect = (selectedDate: Date) => {
    if (datePickerType === 'checkin') {
      setCheckInDate(selectedDate);
      // Auto-adjust checkout date if it's before or same as checkin
      if (selectedDate >= checkOutDate) {
        const newCheckOut = new Date(selectedDate);
        newCheckOut.setDate(newCheckOut.getDate() + 1);
        setCheckOutDate(newCheckOut);
      }
    } else {
      // Only allow checkout date after checkin date
      if (selectedDate > checkInDate) {
        setCheckOutDate(selectedDate);
      }
    }
  };

  const handleGuestIncrement = (type: 'adults' | 'children') => {
    if (type === 'adults') {
      if (!roomTypeData || adults < roomTypeData.maxAdults) {
        setAdults(prev => prev + 1);
      } else {
        Alert.alert('Maximum Reached', `This room allows maximum ${roomTypeData.maxAdults} adults.`);
      }
    } else {
      if (!roomTypeData || children < roomTypeData.maxChildren) {
        setChildren(prev => prev + 1);
      } else {
        Alert.alert('Maximum Reached', `This room allows maximum ${roomTypeData.maxChildren} children.`);
      }
    }
  };

  const handleGuestDecrement = (type: 'adults' | 'children') => {
    if (type === 'adults' && adults > 1) {
      setAdults(prev => prev - 1);
    } else if (type === 'children' && children > 0) {
      setChildren(prev => prev - 1);
    }
  };

  const handlePaymentMethodSelect = (method: any) => {
    let cardNumber = '•••••6587';
    let name = method.name;

    if (method.type === 'mastercard') {
      name = 'Master Card';
      cardNumber = '•••••1234';
    } else if (method.type === 'visa') {
      name = 'Visa';
      cardNumber = '•••••5678';
    }

    setSelectedPaymentMethod({
      id: method.id,
      name: name,
      cardNumber: cardNumber
    });
  };

  const handleBookingConfirm = async () => {
    if (!propertyId) {
      Alert.alert('Error', 'Property information not loaded. Please try again.');
      return;
    }

    setLoading(true);
    try {
      // Get user info for contact details
      const userJson = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
      const user = userJson ? JSON.parse(userJson) : null;

      if (!user) {
        Alert.alert('Error', 'Please login to continue booking.');
        setLoading(false);
        return;
      }

      // Check availability (optional - skip if API not available)
      let availabilityData: any = {
        available: true,
        availableRooms: roomTypeData?.rooms?.length || 1,
      };

      try {
        const availabilityResponse = await reservationService.checkAvailability({
          property_id: propertyId,
          roomTypeId: roomId,
          checkIn: checkInDate.toISOString().split('T')[0],
          checkOut: checkOutDate.toISOString().split('T')[0],
          adults: adults,
          children: children,
        });

        availabilityData = availabilityResponse.success 
          ? availabilityResponse.data 
          : availabilityResponse;

        if (!availabilityData.available) {
          Alert.alert('Not Available', 'Sorry, this room is not available for selected dates.');
          setLoading(false);
          return;
        }
      } catch (availError) {
        // If check availability API fails, continue anyway
        console.log('Check availability not available, continuing with booking...');
      }

      // Navigate to checkout with all booking details
      navigation.navigate('Checkout', {
        propertyId: propertyId,
        roomTypeId: roomId,
        roomTypeName: roomTypeData?.name || hotelName,
        hotelName: roomTypeData?.property?.name || hotelName,
        hotelLocation: location || roomTypeData?.property?.city || '',
        hotelImage: hotelImage || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=300',
        rating: rating || 4.8,
        price: price,
        checkInDate: checkInDate.toISOString(), // ✅ Convert to string
        checkOutDate: checkOutDate.toISOString(), // ✅ Convert to string
        adults: adults,
        children: children,
        guestCount: guestCount,
        nights: nights,
        pricing: pricing,
        availableRooms: availabilityData.availableRooms || 1,
        user: user,
      });
    } catch (error: any) {
      console.error('Error in booking process:', error);
      Alert.alert('Error', 'Failed to proceed with booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
        <Text style={styles.headerTitle}>Request to book</Text>
        <TouchableOpacity style={styles.menuButton}>
          <Ionicons name="ellipsis-vertical" size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Date Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Date</Text>

          <View style={styles.dateContainer}>
            <TouchableOpacity
              style={styles.dateItem}
              onPress={() => handleDatePress('checkin')}
            >
              <View style={styles.dateHeader}>
                <Ionicons name="calendar-outline" size={20} color={COLORS.text.secondary} />
                <Text style={styles.dateLabel}>Check - In</Text>
              </View>
              <Text style={styles.dateValue}>{formatDate(checkInDate)}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.dateItem}
              onPress={() => handleDatePress('checkout')}
            >
              <View style={styles.dateHeader}>
                <Ionicons name="calendar-outline" size={20} color={COLORS.text.secondary} />
                <Text style={styles.dateLabel}>Check - Out</Text>
              </View>
              <Text style={styles.dateValue}>{formatDate(checkOutDate)}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Guest Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Guests</Text>

          {/* Adults */}
          <View style={styles.guestRow}>
            <View style={styles.guestInfo}>
              <Text style={styles.guestLabel}>Adults</Text>
              <Text style={styles.guestSubLabel}>Age 13+</Text>
            </View>
            <View style={styles.guestControls}>
              <TouchableOpacity
                style={[styles.guestButton, adults <= 1 && styles.guestButtonDisabled]}
                onPress={() => handleGuestDecrement('adults')}
                disabled={adults <= 1}
              >
                <Ionicons name="remove" size={20} color={adults <= 1 ? COLORS.text.disabled : COLORS.text.primary} />
              </TouchableOpacity>

              <Text style={styles.guestCount}>{adults}</Text>

              <TouchableOpacity
                style={[styles.guestButton, styles.guestButtonActive]}
                onPress={() => handleGuestIncrement('adults')}
              >
                <Ionicons name="add" size={20} color={COLORS.surface} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Children */}
          <View style={[styles.guestRow, { marginTop: SIZES.spacing.md }]}>
            <View style={styles.guestInfo}>
              <Text style={styles.guestLabel}>Children</Text>
              <Text style={styles.guestSubLabel}>Age 0-12</Text>
            </View>
            <View style={styles.guestControls}>
              <TouchableOpacity
                style={[styles.guestButton, children <= 0 && styles.guestButtonDisabled]}
                onPress={() => handleGuestDecrement('children')}
                disabled={children <= 0}
              >
                <Ionicons name="remove" size={20} color={children <= 0 ? COLORS.text.disabled : COLORS.text.primary} />
              </TouchableOpacity>

              <Text style={styles.guestCount}>{children}</Text>

              <TouchableOpacity
                style={[styles.guestButton, styles.guestButtonActive]}
                onPress={() => handleGuestIncrement('children')}
              >
                <Ionicons name="add" size={20} color={COLORS.surface} />
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.guestTotal}>Total: {guestCount} Guest{guestCount > 1 ? 's' : ''}</Text>
        </View>

        {/* Payment Method Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pay With</Text>

          <TouchableOpacity style={styles.paymentMethod}>
            <View style={styles.paymentLeft}>
              <View style={styles.paymentIcon}>
                <Ionicons name="card" size={24} color={COLORS.primary} />
              </View>
              <View style={styles.paymentInfo}>
                <Text style={styles.paymentName}>{selectedPaymentMethod.name}</Text>
                <Text style={styles.paymentDetails}>{selectedPaymentMethod.cardNumber}</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => setShowPaymentModal(true)}
            >
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </View>

        {/* Payment Details Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Details</Text>

          <View style={styles.paymentDetailsSection}>
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>${price} × {nights} Night{nights > 1 ? 's' : ''}</Text>
              <Text style={styles.paymentAmount}>${pricing.subtotal.toFixed(2)}</Text>
            </View>

            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Tax (10%)</Text>
              <Text style={styles.paymentAmount}>${pricing.taxAmount.toFixed(2)}</Text>
            </View>

            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Service Fee (5%)</Text>
              <Text style={styles.paymentAmount}>${pricing.serviceAmount.toFixed(2)}</Text>
            </View>

            <View style={[styles.paymentRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total Payment:</Text>
              <Text style={styles.totalAmount}>${pricing.totalAmount.toFixed(2)}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Book Button */}
      <View style={styles.bottomSection}>
        <TouchableOpacity 
          style={[styles.bookButton, loading && styles.bookButtonDisabled]} 
          onPress={handleBookingConfirm}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.surface} />
          ) : (
            <Text style={styles.bookButtonText}>Continue to Checkout</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Date Picker Modal */}
      {showDatePicker && (
        <DatePickerModal
          visible={showDatePicker}
          onClose={() => setShowDatePicker(false)}
          onDateSelect={handleDateSelect}
          selectedDate={datePickerType === 'checkin' ? checkInDate : checkOutDate}
          title={datePickerType === 'checkin' ? 'Select Check-in Date' : 'Select Check-out Date'}
        />
      )}

      {/* Payment Method Modal */}
      <PaymentMethodModal
        visible={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onPaymentMethodSelect={handlePaymentMethodSelect}
        selectedMethodId={selectedPaymentMethod.id}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.spacing.lg,
    paddingTop: SIZES.spacing.md,
    paddingBottom: SIZES.spacing.lg,
    backgroundColor: COLORS.surface,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  menuButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: SIZES.spacing.lg,
  },
  section: {
    marginTop: SIZES.spacing.lg,
  },
  sectionTitle: {
    fontSize: SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: SIZES.spacing.md,
  },
  dateContainer: {
    flexDirection: 'row',
    gap: SIZES.spacing.md,
  },
  dateItem: {
    flex: 1,
    backgroundColor: COLORS.surface,
    padding: SIZES.spacing.md,
    borderRadius: SIZES.radius.lg,
  },
  dateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.spacing.sm,
  },
  dateLabel: {
    fontSize: SIZES.sm,
    color: COLORS.text.secondary,
    marginLeft: SIZES.spacing.sm,
  },
  dateValue: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  guestRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SIZES.spacing.md,
    borderRadius: SIZES.radius.lg,
  },
  guestInfo: {
    flex: 1,
  },
  guestLabel: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SIZES.spacing.xs / 2,
  },
  guestSubLabel: {
    fontSize: SIZES.sm,
    color: COLORS.text.secondary,
  },
  guestControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.spacing.md,
  },
  guestContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SIZES.spacing.xl,
  },
  guestButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  guestButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  guestButtonDisabled: {
    opacity: 0.3,
  },
  guestCount: {
    fontSize: SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    minWidth: 30,
    textAlign: 'center',
  },
  guestTotal: {
    fontSize: SIZES.sm,
    color: COLORS.text.secondary,
    marginTop: SIZES.spacing.md,
    textAlign: 'center',
  },
  paymentMethod: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SIZES.spacing.md,
    borderRadius: SIZES.radius.lg,
  },
  paymentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  paymentIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SIZES.spacing.md,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentName: {
    fontSize: SIZES.md,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: SIZES.spacing.xs,
  },
  paymentDetails: {
    fontSize: SIZES.sm,
    color: COLORS.text.secondary,
  },
  editButton: {
    paddingHorizontal: SIZES.spacing.md,
    paddingVertical: SIZES.spacing.sm,
    borderRadius: SIZES.radius.lg,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  editButtonText: {
    fontSize: SIZES.sm,
    color: COLORS.primary,
    fontWeight: '500',
  },
  paymentDetailsSection: {
    backgroundColor: COLORS.surface,
    padding: SIZES.spacing.md,
    borderRadius: SIZES.radius.lg,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SIZES.spacing.sm,
  },
  paymentLabel: {
    fontSize: SIZES.md,
    color: COLORS.text.secondary,
  },
  paymentAmount: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    marginTop: SIZES.spacing.sm,
    paddingTop: SIZES.spacing.md,
  },
  totalLabel: {
    fontSize: SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  totalAmount: {
    fontSize: SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  bottomSection: {
    padding: SIZES.spacing.lg,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  bookButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SIZES.spacing.md,
    borderRadius: SIZES.radius.lg,
    alignItems: 'center',
  },
  bookButtonDisabled: {
    opacity: 0.6,
  },
  bookButtonText: {
    fontSize: SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.surface,
  },
});

export default BookingRequestScreen;