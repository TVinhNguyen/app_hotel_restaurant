import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants';
import { RootStackParamList } from '../types';
import { reservationService, paymentService } from '../services';
import PaymentMethodModal from '../components/PaymentMethodModal';

type CheckoutScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Checkout'>;
type CheckoutScreenRouteProp = RouteProp<RootStackParamList, 'Checkout'>;

const CheckoutScreen = () => {
  const navigation = useNavigation<CheckoutScreenNavigationProp>();
  const route = useRoute<CheckoutScreenRouteProp>();
  const { bookingData } = route.params;

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPromo, setSelectedPromo] = useState<string>('');

  // Calculate prices
  const nights = reservationService.calculateNights(
    bookingData.checkIn,
    bookingData.checkOut
  );
  
  const priceCalculation = reservationService.calculateTotalPrice(
    bookingData.price,
    nights,
    0.1,  // 10% tax
    0.05, // 5% service fee
    0     // no discount for now
  );

  const handleCheckout = async () => {
    if (!selectedPaymentMethod) {
      Alert.alert('Error', 'Please select a payment method');
      return;
    }

    try {
      setIsProcessing(true);

      // Step 1: Create reservation
      const reservationData = {
        property_id: 'mock-property-id', // Should come from bookingData
        roomTypeId: 'mock-room-type-id', // Should come from bookingData
        ratePlanId: 'mock-rate-plan-id', // Should come from bookingData
        checkIn: bookingData.checkIn,
        checkOut: bookingData.checkOut,
        adults: bookingData.guests,
        children: 0,
        contact_name: 'Guest Name', // Should get from user profile or form
        contact_email: 'guest@example.com',
        contact_phone: '1234567890',
        channel: 'mobile_app' as const,
        guest: {
          name: 'Guest Name',
          email: 'guest@example.com',
          phone: '1234567890',
        },
      };

      const reservationResponse = await reservationService.createReservation(reservationData);

      if (!reservationResponse.success || !reservationResponse.data) {
        throw new Error(reservationResponse.message || 'Failed to create reservation');
      }

      const reservation = reservationResponse.data;

      // Step 2: Create payment
      const paymentData = {
        reservationId: reservation.id,
        amount: priceCalculation.totalAmount,
        method: selectedPaymentMethod.toLowerCase().includes('card') ? 'card' as const : 'cash' as const,
        transaction_id: `TXN-${Date.now()}`,
        notes: `Payment for ${bookingData.roomName}`,
      };

      const paymentResponse = await paymentService.createPayment(paymentData);

      if (!paymentResponse.success) {
        throw new Error(paymentResponse.message || 'Payment failed');
      }

      // Step 3: Navigate to success screen
      navigation.navigate('PaymentComplete', {
        bookingId: reservation.confirmation_code,
        amount: priceCalculation.totalAmount,
        paymentMethod: selectedPaymentMethod,
      });

    } catch (error: any) {
      console.error('Checkout error:', error);
      Alert.alert(
        'Checkout Failed',
        error.message || 'An error occurred during checkout. Please try again.'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          disabled={isProcessing}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Booking Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Booking Summary</Text>
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Room</Text>
              <Text style={styles.summaryValue}>{bookingData.roomName}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Check-in</Text>
              <Text style={styles.summaryValue}>{bookingData.checkIn}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Check-out</Text>
              <Text style={styles.summaryValue}>{bookingData.checkOut}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Guests</Text>
              <Text style={styles.summaryValue}>{bookingData.guests} Guests</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Nights</Text>
              <Text style={styles.summaryValue}>{nights} {nights === 1 ? 'Night' : 'Nights'}</Text>
            </View>
          </View>
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <TouchableOpacity
            style={styles.paymentButton}
            onPress={() => setShowPaymentModal(true)}
            disabled={isProcessing}
          >
            <View style={styles.paymentLeft}>
              <Ionicons name="card-outline" size={24} color={COLORS.primary} />
              <Text style={styles.paymentText}>
                {selectedPaymentMethod || 'Select payment method'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.text.secondary} />
          </TouchableOpacity>
        </View>

        {/* Price Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Price Details</Text>
          <View style={styles.priceCard}>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>
                ${bookingData.price} x {nights} {nights === 1 ? 'night' : 'nights'}
              </Text>
              <Text style={styles.priceValue}>${priceCalculation.subtotal.toFixed(2)}</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Tax (10%)</Text>
              <Text style={styles.priceValue}>${priceCalculation.taxAmount.toFixed(2)}</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Service Fee (5%)</Text>
              <Text style={styles.priceValue}>${priceCalculation.serviceAmount.toFixed(2)}</Text>
            </View>
            {priceCalculation.discountAmount > 0 && (
              <View style={styles.priceRow}>
                <Text style={[styles.priceLabel, { color: COLORS.success }]}>Discount</Text>
                <Text style={[styles.priceValue, { color: COLORS.success }]}>
                  -${priceCalculation.discountAmount.toFixed(2)}
                </Text>
              </View>
            )}
            <View style={[styles.priceRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>${priceCalculation.totalAmount.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        {/* Cancellation Policy */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cancellation Policy</Text>
          <View style={styles.policyCard}>
            <Ionicons name="information-circle-outline" size={20} color={COLORS.primary} />
            <Text style={styles.policyText}>
              Free cancellation up to 7 days before check-in. Partial refunds may apply for 
              cancellations made within 7 days of check-in.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Button */}
      <View style={styles.footer}>
        <View style={styles.footerPrice}>
          <Text style={styles.footerPriceLabel}>Total</Text>
          <Text style={styles.footerPriceValue}>${priceCalculation.totalAmount.toFixed(2)}</Text>
        </View>
        <TouchableOpacity
          style={[
            styles.checkoutButton,
            (!selectedPaymentMethod || isProcessing) && styles.checkoutButtonDisabled,
          ]}
          onPress={handleCheckout}
          disabled={!selectedPaymentMethod || isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator color={COLORS.surface} />
          ) : (
            <Text style={styles.checkoutButtonText}>Confirm & Pay</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Payment Method Modal */}
      <PaymentMethodModal
        visible={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onPaymentMethodSelect={(method) => {
          setSelectedPaymentMethod(method.name);
          setShowPaymentModal(false);
        }}
        selectedMethodId={selectedPaymentMethod}
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
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: SIZES.spacing.xxl,
  },
  section: {
    paddingHorizontal: SIZES.spacing.lg,
    marginTop: SIZES.spacing.xl,
  },
  sectionTitle: {
    fontSize: SIZES.md,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: SIZES.spacing.md,
  },
  summaryCard: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius.lg,
    padding: SIZES.spacing.lg,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SIZES.spacing.sm,
  },
  summaryLabel: {
    fontSize: SIZES.md,
    color: COLORS.text.secondary,
  },
  summaryValue: {
    fontSize: SIZES.md,
    color: COLORS.text.primary,
    fontWeight: '600',
  },
  paymentButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius.lg,
    padding: SIZES.spacing.lg,
  },
  paymentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  paymentText: {
    fontSize: SIZES.md,
    color: COLORS.text.primary,
    marginLeft: SIZES.spacing.md,
  },
  priceCard: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius.lg,
    padding: SIZES.spacing.lg,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SIZES.spacing.sm,
  },
  priceLabel: {
    fontSize: SIZES.md,
    color: COLORS.text.secondary,
  },
  priceValue: {
    fontSize: SIZES.md,
    color: COLORS.text.primary,
    fontWeight: '600',
  },
  totalRow: {
    marginTop: SIZES.spacing.md,
    paddingTop: SIZES.spacing.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  totalLabel: {
    fontSize: SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  totalValue: {
    fontSize: SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  policyCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius.lg,
    padding: SIZES.spacing.md,
    gap: SIZES.spacing.sm,
  },
  policyText: {
    flex: 1,
    fontSize: SIZES.sm,
    color: COLORS.text.secondary,
    lineHeight: 20,
  },
  footer: {
    paddingHorizontal: SIZES.spacing.lg,
    paddingVertical: SIZES.spacing.lg,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  footerPrice: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.spacing.md,
  },
  footerPriceLabel: {
    fontSize: SIZES.md,
    color: COLORS.text.secondary,
  },
  footerPriceValue: {
    fontSize: SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  checkoutButton: {
    height: 56,
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radius.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkoutButtonDisabled: {
    backgroundColor: COLORS.text.disabled,
  },
  checkoutButtonText: {
    fontSize: SIZES.md,
    fontWeight: 'bold',
    color: COLORS.surface,
  },
});

export default CheckoutScreen;
