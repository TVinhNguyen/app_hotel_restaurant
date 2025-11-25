import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants';
import { reservationService } from '../services/reservationService';
import { ratePlanService } from '../services/ratePlanService';
import { guestService } from '../services/guestService';
import type { CreateReservationRequest } from '../types';

const CheckoutScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { 
    propertyId,
    roomTypeId,
    roomTypeName,
    hotelName, 
    hotelLocation,
    hotelImage,
    rating,
    price, 
    checkInDate: checkInDateString, 
    checkOutDate: checkOutDateString, 
    adults,
    children,
    guestCount,
    nights,
    pricing,
    availableRooms,
    user,
  } = route.params as any;

  // Parse date strings back to Date objects
  const checkInDate = new Date(checkInDateString);
  const checkOutDate = new Date(checkOutDateString);

  const [selectedPromo, setSelectedPromo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Calculate derived values
  const basePrice = pricing?.subtotal || (price * nights);
  const taxAmount = pricing?.taxAmount || 0;
  const serviceAmount = pricing?.serviceAmount || 0;
  const adminFee = 0; // No admin fee in new pricing
  const totalPrice = pricing?.totalAmount || basePrice;

  const formatDate = (date: Date) => {
    const d = new Date(date);
    return `${d.getDate()} ${d.toLocaleDateString('en-US', { month: 'short' })} ${d.getFullYear()}`;
  };

  const formatDateRange = (checkIn: Date, checkOut: Date) => {
    const cin = new Date(checkIn);
    const cout = new Date(checkOut);
    return `${cin.getDate()} - ${cout.getDate()} ${cin.toLocaleDateString('en-US', { month: 'short' })} ${cin.getFullYear()}`;
  };

  const handlePromoSelect = () => {
    console.log('Select promo code');
    // TODO: Implement promo code selection
  };

  const handleCheckout = async () => {
    if (!user) {
      Alert.alert('Error', 'User information not found. Please login again.');
      return;
    }

    if (!propertyId || !roomTypeId) {
      Alert.alert('Error', 'Booking information is incomplete.');
      return;
    }

    setLoading(true);
    try {
      // Step 1: Find or create guest by email (same as frontend website)
      console.log('Step 1: Finding or creating guest by email:', user.email);
      let guestId: string;
      try {
        const guest = await guestService.getOrCreateGuestByEmail({
          name: user.name || 'Guest',
          email: user.email || '',
          phone: user.phone || '',
        });
        guestId = guest.id;
        console.log('✅ Guest ID obtained:', guestId);
      } catch (guestError: any) {
        console.error('❌ Error finding/creating guest:', guestError);
        console.error('Guest error response:', guestError.response?.data);
        
        // If guest creation fails, show detailed error
        const guestErrorMsg = guestError.response?.data?.message 
          || guestError.message
          || 'Không thể xử lý thông tin khách hàng';
        
        Alert.alert(
          'Lỗi',
          `Không thể tạo hồ sơ khách: ${guestErrorMsg}`,
          [{ text: 'OK' }]
        );
        setLoading(false);
        return;
      }

      // Step 2: Get a valid rate plan ID - REQUIRED by backend
      let ratePlanId = null;
      let ratePlanCurrency = 'VND'; // Default currency
      try {
        console.log('Fetching rate plans for room type:', roomTypeId);
        console.log('Trying GET /rate-plans with roomTypeId filter...');
        
        const ratePlansResponse = await ratePlanService.getRatePlans({
          roomTypeId: roomTypeId,
        });
        
        console.log('Rate plans raw response:', JSON.stringify(ratePlansResponse, null, 2));
        
        // Handle different response formats
        let plans = null;
        if (ratePlansResponse && typeof ratePlansResponse === 'object') {
          if (ratePlansResponse.success && ratePlansResponse.data) {
            plans = ratePlansResponse.data;
          } else if (Array.isArray(ratePlansResponse)) {
            plans = ratePlansResponse;
          } else if (ratePlansResponse.data && Array.isArray(ratePlansResponse.data)) {
            plans = ratePlansResponse.data;
          }
        }
        
        console.log('Parsed plans:', plans);
        
        if (plans && Array.isArray(plans) && plans.length > 0) {
          ratePlanId = plans[0].id;
          ratePlanCurrency = plans[0].currency || 'VND'; // Use rate plan's currency
          console.log('✅ Found rate plan:', ratePlanId, plans[0].name || plans[0]);
          console.log('✅ Using currency from rate plan:', ratePlanCurrency);
        } else {
          console.log('❌ No rate plans found in response');
          Alert.alert(
            'Configuration Error',
            'No rate plan available for this room. Please contact support.',
            [{ text: 'OK' }]
          );
          setLoading(false);
          return;
        }
      } catch (ratePlanError: any) {
        console.error('❌ Error fetching rate plans:', ratePlanError);
        console.error('Error response:', ratePlanError.response?.data);
        Alert.alert(
          'Error',
          'Cannot fetch rate plan. Please try again or contact support.',
          [{ text: 'OK' }]
        );
        setLoading(false);
        return;
      }

      // Prepare reservation data matching frontend website format
      const reservationData: any = {
        propertyId: propertyId,
        guestId: guestId, // Use guest ID from guest service, NOT user ID
        roomTypeId: roomTypeId,
        ratePlanId: ratePlanId,
        checkIn: new Date(checkInDate).toISOString().split('T')[0],
        checkOut: new Date(checkOutDate).toISOString().split('T')[0],
        adults: adults || 1,
        children: children || 0,
        totalAmount: Math.round(totalPrice * 100) / 100,
        currency: ratePlanCurrency,
        // Contact info - camelCase NOT snake_case
        contactName: user.name || 'Guest',
        contactEmail: user.email || '',
        contactPhone: user.phone || '',
        guestNotes: '',
        // Channel
        channel: 'website',
        // Optional fields
        bookerUserId: user.id, // Same as guestId for mobile booking
        // Pricing
        taxAmount: Math.round((taxAmount || 0) * 100) / 100,
        serviceAmount: Math.round((serviceAmount || 0) * 100) / 100,
        // Status
        paymentStatus: 'unpaid',
        status: 'pending',
      };

      // ratePlanId is REQUIRED - we already have it from above
      if (!ratePlanId) {
        throw new Error('Rate plan ID is required but not found');
      }

      console.log('Creating reservation with ratePlanId:', ratePlanId);
      console.log('Full reservation data:', JSON.stringify(reservationData, null, 2));

      // Create reservation
      const response = await reservationService.createReservation(reservationData);
      console.log('Reservation response:', response);

      const reservation = response.success ? response.data : response;

      if (reservation && (reservation as any).id) {
        // Success! Navigate to payment complete
        navigation.reset({
          index: 0,
          routes: [
            { name: 'MainTabs' as never },
            {
              name: 'PaymentComplete' as never,
              params: {
                reservationId: (reservation as any).id,
                confirmationCode: (reservation as any).confirmation_code || (reservation as any).confirmationCode,
                hotelName: hotelName,
                hotelLocation: hotelLocation,
                checkInDate: checkInDate.toISOString(), // ✅ Convert to string
                checkOutDate: checkOutDate.toISOString(), // ✅ Convert to string
                guestCount: guestCount,
                roomType: roomTypeName,
                totalAmount: totalPrice,
              } as never,
            },
          ],
        });
      } else {
        throw new Error('Invalid reservation response');
      }
    } catch (error: any) {
      console.error('Error creating reservation:', error);
      console.error('Error response:', error.response?.data);
      
      const errorMessage = error.response?.data?.message 
        || error.response?.data?.error
        || error.message
        || 'Failed to create reservation. Please try again.';
      
      Alert.alert(
        'Booking Failed',
        Array.isArray(errorMessage) ? errorMessage.join('\n') : errorMessage,
        [{ text: 'OK' }]
      );
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
        <Text style={styles.headerTitle}>Checkout</Text>
        <TouchableOpacity style={styles.menuButton}>
          <Ionicons name="ellipsis-vertical" size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hotel Info Card */}
        <View style={styles.hotelCard}>
          <Image source={{ uri: hotelImage }} style={styles.hotelImage} />
          <View style={styles.hotelInfo}>
            <View style={styles.hotelHeader}>
              <Text style={styles.hotelName}>{hotelName}</Text>
              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={16} color={COLORS.warning} />
                <Text style={styles.ratingText}>{rating}</Text>
              </View>
            </View>
            <View style={styles.locationContainer}>
              <Ionicons name="location" size={14} color={COLORS.text.secondary} />
              <Text style={styles.locationText}>{hotelLocation}</Text>
            </View>
            <Text style={styles.priceText}>${price} /night</Text>
          </View>
        </View>

        {/* Your Booking Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Booking</Text>
          
          <View style={styles.bookingDetailsCard}>
            <View style={styles.bookingRow}>
              <View style={styles.bookingIconContainer}>
                <Ionicons name="calendar" size={20} color={COLORS.primary} />
              </View>
              <Text style={styles.bookingLabel}>Dates</Text>
              <Text style={styles.bookingValue}>{formatDateRange(checkInDate, checkOutDate)}</Text>
            </View>

            <View style={styles.bookingRow}>
              <View style={styles.bookingIconContainer}>
                <Ionicons name="moon" size={20} color={COLORS.primary} />
              </View>
              <Text style={styles.bookingLabel}>Nights</Text>
              <Text style={styles.bookingValue}>{nights} Night{nights > 1 ? 's' : ''}</Text>
            </View>

            <View style={styles.bookingRow}>
              <View style={styles.bookingIconContainer}>
                <Ionicons name="person" size={20} color={COLORS.primary} />
              </View>
              <Text style={styles.bookingLabel}>Guests</Text>
              <Text style={styles.bookingValue}>
                {adults} Adult{adults > 1 ? 's' : ''}{children > 0 ? `, ${children} Child${children > 1 ? 'ren' : ''}` : ''}
              </Text>
            </View>

            <View style={styles.bookingRow}>
              <View style={styles.bookingIconContainer}>
                <Ionicons name="bed" size={20} color={COLORS.primary} />
              </View>
              <Text style={styles.bookingLabel}>Room type</Text>
              <Text style={styles.bookingValue}>{roomTypeName}</Text>
            </View>

            <View style={styles.bookingRow}>
              <View style={styles.bookingIconContainer}>
                <Ionicons name="call" size={20} color={COLORS.primary} />
              </View>
              <Text style={styles.bookingLabel}>Phone</Text>
              <Text style={styles.bookingValue}>{user?.phone || 'Not provided'}</Text>
            </View>
          </View>
        </View>

        {/* Price Details Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Price Details</Text>
          
          <View style={styles.priceDetailsCard}>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>${price} × {nights} Night{nights > 1 ? 's' : ''}</Text>
              <Text style={styles.priceAmount}>${basePrice.toFixed(2)}</Text>
            </View>
            
            {taxAmount > 0 && (
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Tax (10%)</Text>
                <Text style={styles.priceAmount}>${taxAmount.toFixed(2)}</Text>
              </View>
            )}
            
            {serviceAmount > 0 && (
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Service fee (5%)</Text>
                <Text style={styles.priceAmount}>${serviceAmount.toFixed(2)}</Text>
              </View>
            )}
            
            <View style={[styles.priceRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total price</Text>
              <Text style={styles.totalAmount}>${totalPrice.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        {/* Promo Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Promo</Text>
          
          <TouchableOpacity style={styles.promoCard} onPress={handlePromoSelect}>
            <View style={styles.promoLeft}>
              <View style={styles.promoIcon}>
                <Ionicons name="pricetag" size={24} color={COLORS.primary} />
              </View>
              <Text style={styles.promoText}>Select promo code</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.text.secondary} />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Bottom Checkout Button */}
      <View style={styles.bottomSection}>
        <View style={styles.totalPriceContainer}>
          <Text style={styles.totalPriceLabel}>Total</Text>
          <Text style={styles.totalPriceValue}>${totalPrice.toFixed(2)}</Text>
        </View>
        <TouchableOpacity 
          style={[styles.checkoutButton, loading && styles.checkoutButtonDisabled]} 
          onPress={handleCheckout}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.surface} />
          ) : (
            <Text style={styles.checkoutButtonText}>Confirm Booking</Text>
          )}
        </TouchableOpacity>
      </View>
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
  hotelCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius.lg,
    padding: SIZES.spacing.md,
    marginTop: SIZES.spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  hotelImage: {
    width: 80,
    height: 80,
    borderRadius: SIZES.radius.md,
    marginRight: SIZES.spacing.md,
  },
  hotelInfo: {
    flex: 1,
  },
  hotelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SIZES.spacing.xs,
  },
  hotelName: {
    fontSize: SIZES.md,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    flex: 1,
    marginRight: SIZES.spacing.sm,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.spacing.xs,
  },
  ratingText: {
    fontSize: SIZES.sm,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.spacing.sm,
  },
  locationText: {
    fontSize: SIZES.sm,
    color: COLORS.text.secondary,
    marginLeft: SIZES.spacing.xs,
  },
  priceText: {
    fontSize: SIZES.md,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  section: {
    marginTop: SIZES.spacing.xl,
  },
  sectionTitle: {
    fontSize: SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SIZES.spacing.md,
  },
  bookingDetailsCard: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius.lg,
    padding: SIZES.spacing.md,
  },
  bookingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SIZES.spacing.sm,
  },
  bookingIconContainer: {
    width: 24,
    marginRight: SIZES.spacing.md,
  },
  bookingLabel: {
    fontSize: SIZES.md,
    color: COLORS.text.primary,
    width: 80,
  },
  bookingValue: {
    fontSize: SIZES.md,
    color: COLORS.text.primary,
    flex: 1,
    textAlign: 'right',
  },
  priceDetailsCard: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius.lg,
    padding: SIZES.spacing.md,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SIZES.spacing.sm,
  },
  priceLabel: {
    fontSize: SIZES.md,
    color: COLORS.text.primary,
  },
  priceAmount: {
    fontSize: SIZES.md,
    color: COLORS.text.primary,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    marginTop: SIZES.spacing.sm,
    paddingTop: SIZES.spacing.md,
  },
  totalLabel: {
    fontSize: SIZES.md,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  totalAmount: {
    fontSize: SIZES.md,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  promoCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SIZES.spacing.md,
    borderRadius: SIZES.radius.lg,
  },
  promoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  promoIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SIZES.spacing.md,
  },
  promoText: {
    fontSize: SIZES.md,
    color: COLORS.text.secondary,
  },
  bottomSection: {
    padding: SIZES.spacing.lg,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  totalPriceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.spacing.md,
  },
  totalPriceLabel: {
    fontSize: SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  totalPriceValue: {
    fontSize: SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  checkoutButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SIZES.spacing.md,
    borderRadius: SIZES.radius.lg,
    alignItems: 'center',
  },
  checkoutButtonDisabled: {
    opacity: 0.6,
  },
  checkoutButtonText: {
    fontSize: SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.surface,
  },
});

export default CheckoutScreen;