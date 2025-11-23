import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Share,
  Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp, CompositeNavigationProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants';
import { RootStackParamList } from '../types';

type BookingDetailScreenNavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<RootStackParamList, 'BookingDetail'>,
  BottomTabNavigationProp<RootStackParamList>
>;
type BookingDetailScreenRouteProp = RouteProp<RootStackParamList, 'BookingDetail'>;

interface BookingDetail {
  id: string;
  hotelName: string;
  hotelImage: string;
  rating: number;
  location: string;
  pricePerNight: number;
  checkInDate: string;
  checkOutDate: string;
  guests: number;
  rooms: number;
  roomType: string;
  phone: string;
  latitude: number;
  longitude: number;
  bookingCode: string;
}

const BookingDetailScreen = () => {
  const navigation = useNavigation<BookingDetailScreenNavigationProp>();
  const route = useRoute<BookingDetailScreenRouteProp>();
  const { bookingId } = route.params;

  // Mock booking data
  const [booking] = useState<BookingDetail>({
    id: bookingId || '06158310-5427-471d-af1f-bd9029b',
    hotelName: 'The Aston Vill Hotel',
    hotelImage: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
    rating: 4.7,
    location: 'Veum Point, Michikoton',
    pricePerNight: 120,
    checkInDate: '12 Nov 2024',
    checkOutDate: '14 Nov 2024',
    guests: 2,
    rooms: 1,
    roomType: 'Queen Room',
    phone: '0214345646',
    latitude: 37.7749,
    longitude: -122.4194,
    bookingCode: '06158310-5427-471d-af1f-bd9029b',
  });

  const handleOpenMap = () => {
    Alert.alert('Open Map', 'Opening map with hotel location...');
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Booking Details\n\nHotel: ${booking.hotelName}\nBooking ID: ${booking.id}\nCheck-in: ${booking.checkInDate}\nCheck-out: ${booking.checkOutDate}\nGuests: ${booking.guests}\nRoom: ${booking.roomType}`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleCancelBooking = () => {
    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel this booking?',
      [
        {
          text: 'No',
          style: 'cancel',
        },
        {
          text: 'Yes',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Success', 'Booking cancelled successfully');
            navigation.navigate('Main', { screen: 'MyBooking' } as any);
          },
        },
      ]
    );
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
        <Text style={styles.headerTitle}>Booking Detail</Text>
        <TouchableOpacity style={styles.menuButton} onPress={handleShare}>
          <Ionicons name="ellipsis-vertical" size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Hotel Card */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Your Hotel</Text>
          <View style={styles.hotelCard}>
            <Image
              source={{ uri: booking.hotelImage }}
              style={styles.hotelImage}
            />
            <View style={styles.hotelInfo}>
              <View style={styles.hotelHeader}>
                <Text style={styles.hotelName} numberOfLines={1}>
                  {booking.hotelName}
                </Text>
                <View style={styles.ratingContainer}>
                  <Ionicons name="star" size={16} color="#FFB800" />
                  <Text style={styles.ratingText}>{booking.rating}</Text>
                </View>
              </View>
              <View style={styles.locationRow}>
                <Ionicons name="location" size={14} color={COLORS.text.secondary} />
                <Text style={styles.locationText} numberOfLines={1}>
                  {booking.location}
                </Text>
              </View>
              <Text style={styles.priceText}>
                ${booking.pricePerNight}
                <Text style={styles.priceUnit}>/night</Text>
              </Text>
            </View>
          </View>
        </View>

        {/* Location Map */}
        <View style={styles.section}>
          <View style={styles.locationHeader}>
            <Text style={styles.sectionLabel}>Location</Text>
            <TouchableOpacity onPress={handleOpenMap}>
              <Text style={styles.openMapText}>Open Map</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.mapContainer}>
            <Image
              source={{ uri: 'https://api.mapbox.com/styles/v1/mapbox/light-v10/static/pin-s-hotel+3b82f6(-122.4194,37.7749)/-122.4194,37.7749,14,0/600x300@2x?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw' }}
              style={styles.mapImage}
            />
            <View style={styles.mapPin}>
              <Ionicons name="location" size={32} color={COLORS.primary} />
            </View>
          </View>
        </View>

        {/* Booking Information */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Your Booking</Text>
          <View style={styles.bookingCard}>
            <View style={styles.bookingRow}>
              <View style={styles.bookingLeft}>
                <Ionicons name="calendar-outline" size={20} color={COLORS.text.secondary} />
                <Text style={styles.bookingLabel}>Dates</Text>
              </View>
              <Text style={styles.bookingValue}>
                {booking.checkInDate} - {booking.checkOutDate}
              </Text>
            </View>

            <View style={styles.bookingRow}>
              <View style={styles.bookingLeft}>
                <Ionicons name="person-outline" size={20} color={COLORS.text.secondary} />
                <Text style={styles.bookingLabel}>Guest</Text>
              </View>
              <Text style={styles.bookingValue}>
                {booking.guests} Guests ({booking.rooms} Room)
              </Text>
            </View>

            <View style={styles.bookingRow}>
              <View style={styles.bookingLeft}>
                <Ionicons name="bed-outline" size={20} color={COLORS.text.secondary} />
                <Text style={styles.bookingLabel}>Room type</Text>
              </View>
              <Text style={styles.bookingValue}>{booking.roomType}</Text>
            </View>

            <View style={styles.bookingRow}>
              <View style={styles.bookingLeft}>
                <Ionicons name="call-outline" size={20} color={COLORS.text.secondary} />
                <Text style={styles.bookingLabel}>Phone</Text>
              </View>
              <Text style={styles.bookingValue}>{booking.phone}</Text>
            </View>
          </View>
        </View>

        {/* Barcode */}
        <View style={styles.section}>
          <View style={styles.barcodeCard}>
            <View style={styles.barcodeContainer}>
              <View style={styles.barcode}>
                {[...Array(40)].map((_, i) => (
                  <View
                    key={i}
                    style={[
                      styles.barcodeBar,
                      { width: Math.random() > 0.5 ? 2 : 4 },
                    ]}
                  />
                ))}
              </View>
            </View>
            <Text style={styles.barcodeText}>{booking.bookingCode}</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleCancelBooking}
          >
            <Text style={styles.cancelButtonText}>Cancel Booking</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.contactButton}
            onPress={() => Alert.alert('Contact', 'Contacting hotel...')}
          >
            <Text style={styles.contactButtonText}>Contact Hotel</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  menuButton: {
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
    marginTop: SIZES.spacing.lg,
  },
  sectionLabel: {
    fontSize: SIZES.sm,
    color: COLORS.text.secondary,
    marginBottom: SIZES.spacing.md,
  },
  hotelCard: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius.lg,
    padding: SIZES.spacing.md,
    flexDirection: 'row',
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
  },
  hotelInfo: {
    flex: 1,
    marginLeft: SIZES.spacing.md,
    justifyContent: 'space-between',
  },
  hotelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  hotelName: {
    fontSize: SIZES.md,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    flex: 1,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: SIZES.spacing.sm,
  },
  ratingText: {
    fontSize: SIZES.sm,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginLeft: SIZES.spacing.xs,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: SIZES.sm,
    color: COLORS.text.secondary,
    marginLeft: SIZES.spacing.xs,
    flex: 1,
  },
  priceText: {
    fontSize: SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  priceUnit: {
    fontSize: SIZES.sm,
    fontWeight: 'normal',
    color: COLORS.text.secondary,
  },
  locationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.spacing.md,
  },
  openMapText: {
    fontSize: SIZES.sm,
    color: COLORS.primary,
    fontWeight: '600',
  },
  mapContainer: {
    height: 160,
    borderRadius: SIZES.radius.lg,
    overflow: 'hidden',
    position: 'relative',
  },
  mapImage: {
    width: '100%',
    height: '100%',
  },
  mapPin: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -20,
    marginLeft: -16,
  },
  bookingCard: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius.lg,
    padding: SIZES.spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bookingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SIZES.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  bookingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bookingLabel: {
    fontSize: SIZES.md,
    color: COLORS.text.secondary,
    marginLeft: SIZES.spacing.sm,
  },
  bookingValue: {
    fontSize: SIZES.md,
    color: COLORS.text.primary,
    fontWeight: '600',
  },
  barcodeCard: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius.lg,
    padding: SIZES.spacing.xl,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  barcodeContainer: {
    marginBottom: SIZES.spacing.md,
  },
  barcode: {
    flexDirection: 'row',
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  barcodeBar: {
    height: '100%',
    backgroundColor: COLORS.text.primary,
  },
  barcodeText: {
    fontSize: SIZES.sm,
    color: COLORS.text.secondary,
    fontFamily: 'monospace',
    letterSpacing: 1,
  },
  actionButtons: {
    paddingHorizontal: SIZES.spacing.lg,
    marginTop: SIZES.spacing.xl,
    gap: SIZES.spacing.md,
  },
  cancelButton: {
    height: 56,
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius.xl,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.error,
  },
  cancelButtonText: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.error,
  },
  contactButton: {
    height: 56,
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radius.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactButtonText: {
    fontSize: SIZES.md,
    fontWeight: 'bold',
    color: COLORS.surface,
  },
});

export default BookingDetailScreen;
