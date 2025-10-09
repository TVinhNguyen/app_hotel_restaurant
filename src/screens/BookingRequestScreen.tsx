import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants';
import DatePickerModal from '../components/DatePickerModal';
import PaymentMethodModal from '../components/PaymentMethodModal';

const BookingRequestScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { hotelId, hotelName, price } = route.params as { 
    hotelId: string; 
    hotelName: string; 
    price: number; 
  };

  const [checkInDate, setCheckInDate] = useState(new Date(2024, 10, 12)); // Nov 12, 2024
  const [checkOutDate, setCheckOutDate] = useState(new Date(2024, 10, 14)); // Nov 14, 2024
  const [guestCount, setGuestCount] = useState(1);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerType, setDatePickerType] = useState<'checkin' | 'checkout'>('checkin');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState({
    id: '1',
    name: 'FastPayz',
    cardNumber: '•••••6587'
  });

  // Calculate derived values
  const timeDiff = checkOutDate.getTime() - checkInDate.getTime();
  const nights = Math.ceil(timeDiff / (1000 * 3600 * 24));
  const subtotal = price * nights;
  const cleaningFee = 5;
  const serviceFee = 5;
  const totalPayment = subtotal + cleaningFee + serviceFee;

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

  const handleGuestIncrement = () => {
    setGuestCount(prev => prev + 1);
  };

  const handleGuestDecrement = () => {
    if (guestCount > 1) {
      setGuestCount(prev => prev - 1);
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

  const handleBookingConfirm = () => {
    // Navigate to checkout with booking details
    navigation.navigate('Checkout', {
      hotelId: hotelId,
      hotelName: hotelName,
      hotelLocation: 'Veum Point, Michikoton',
      hotelImage: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=300&h=200&fit=crop',
      rating: 4.7,
      price: price,
      checkInDate: checkInDate,
      checkOutDate: checkOutDate,
      guestCount: guestCount,
      roomType: 'Queen Room',
      phoneNumber: '0214345646'
    });
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
          <Text style={styles.sectionTitle}>Guest</Text>
          
          <View style={styles.guestContainer}>
            <TouchableOpacity
              style={styles.guestButton}
              onPress={handleGuestDecrement}
            >
              <Ionicons name="remove" size={20} color={COLORS.text.primary} />
            </TouchableOpacity>
            
            <Text style={styles.guestCount}>{guestCount}</Text>
            
            <TouchableOpacity
              style={[styles.guestButton, styles.guestButtonActive]}
              onPress={handleGuestIncrement}
            >
              <Ionicons name="add" size={20} color={COLORS.surface} />
            </TouchableOpacity>
          </View>
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
              <Text style={styles.paymentLabel}>Total : {nights} Night</Text>
              <Text style={styles.paymentAmount}>${subtotal}</Text>
            </View>
            
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Cleaning Fee</Text>
              <Text style={styles.paymentAmount}>${cleaningFee}</Text>
            </View>
            
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Service Fee</Text>
              <Text style={styles.paymentAmount}>${serviceFee}</Text>
            </View>
            
            <View style={[styles.paymentRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total Payment:</Text>
              <Text style={styles.totalAmount}>${totalPayment}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Book Button */}
      <View style={styles.bottomSection}>
        <TouchableOpacity style={styles.bookButton} onPress={handleBookingConfirm}>
          <Text style={styles.bookButtonText}>Book</Text>
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
  guestContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SIZES.spacing.xl,
  },
  guestButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
  guestCount: {
    fontSize: SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    minWidth: 30,
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
  bookButtonText: {
    fontSize: SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.surface,
  },
});

export default BookingRequestScreen;