import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Image,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants';

const CheckoutScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { 
    hotelId, 
    hotelName, 
    hotelLocation,
    hotelImage,
    rating,
    price, 
    checkInDate, 
    checkOutDate, 
    guestCount,
    roomType,
    phoneNumber
  } = route.params as any;

  const [selectedPromo, setSelectedPromo] = useState<string | null>(null);

  // Calculate derived values
  const timeDiff = checkOutDate.getTime() - checkInDate.getTime();
  const nights = Math.ceil(timeDiff / (1000 * 3600 * 24));
  const basePrice = price * nights;
  const adminFee = 2.50;
  const totalPrice = basePrice + adminFee;

  const formatDate = (date: Date) => {
    return `${date.getDate()} - ${date.getDate() + 1} ${date.toLocaleDateString('en-US', { month: 'short' })} ${date.getFullYear()}`;
  };

  const handlePromoSelect = () => {
    console.log('Select promo code');
  };

  const handleCheckout = () => {
    console.log('Processing checkout...');
    // Navigate to payment or confirmation
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
              <Text style={styles.bookingValue}>{formatDate(checkInDate)}</Text>
            </View>

            <View style={styles.bookingRow}>
              <View style={styles.bookingIconContainer}>
                <Ionicons name="person" size={20} color={COLORS.primary} />
              </View>
              <Text style={styles.bookingLabel}>Guest</Text>
              <Text style={styles.bookingValue}>{guestCount} Guests (1 Room)</Text>
            </View>

            <View style={styles.bookingRow}>
              <View style={styles.bookingIconContainer}>
                <Ionicons name="bed" size={20} color={COLORS.primary} />
              </View>
              <Text style={styles.bookingLabel}>Room type</Text>
              <Text style={styles.bookingValue}>{roomType}</Text>
            </View>

            <View style={styles.bookingRow}>
              <View style={styles.bookingIconContainer}>
                <Ionicons name="call" size={20} color={COLORS.primary} />
              </View>
              <Text style={styles.bookingLabel}>Phone</Text>
              <Text style={styles.bookingValue}>{phoneNumber}</Text>
            </View>
          </View>
        </View>

        {/* Price Details Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Price Details</Text>
          
          <View style={styles.priceDetailsCard}>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Price</Text>
              <Text style={styles.priceAmount}>${basePrice.toFixed(2)}</Text>
            </View>
            
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Admin fee</Text>
              <Text style={styles.priceAmount}>${adminFee.toFixed(2)}</Text>
            </View>
            
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
              <Text style={styles.promoText}>Select</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.text.secondary} />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Bottom Checkout Button */}
      <View style={styles.bottomSection}>
        <TouchableOpacity style={styles.checkoutButton} onPress={handleCheckout}>
          <Text style={styles.checkoutButtonText}>Checkout</Text>
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
  checkoutButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SIZES.spacing.md,
    borderRadius: SIZES.radius.lg,
    alignItems: 'center',
  },
  checkoutButtonText: {
    fontSize: SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.surface,
  },
});

export default CheckoutScreen;