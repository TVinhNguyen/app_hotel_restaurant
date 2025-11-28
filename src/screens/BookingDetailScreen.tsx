import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants';
import { reservationService } from '../services/reservationService';

const BookingDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  
  // 1. Nhận thêm tham số isNewPayment
  const { bookingId, isNewPayment } = route.params as { bookingId: string, isNewPayment?: boolean };

  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookingDetails();
  }, [bookingId]);

  // Hàm helper để xử lý số liệu an toàn (tránh lỗi NaN)
  const safeNumber = (val: any) => {
    const num = parseFloat(val);
    return isNaN(num) ? 0 : num;
  };

  const fetchBookingDetails = async () => {
    try {
      setLoading(true);
      const response = await reservationService.getReservationById(bookingId);
      console.log('Booking detail response:', response);
      
      let reservation = response.success ? response.data : response;
      
      // 2. LOGIC QUAN TRỌNG: Ghi đè trạng thái nếu vừa thanh toán thành công
      // Giúp hiển thị Paid ngay lập tức mà không cần chờ Backend đồng bộ
      if (isNewPayment) {
        reservation = {
          ...reservation,
          paymentStatus: 'paid',
          status: 'confirmed'
        };
      }
      
      setBooking(reservation);
    } catch (error) {
      console.error('Error fetching booking details:', error);
      Alert.alert('Error', 'Unable to load booking details');
    } finally {
      setLoading(false);
    }
  };

  const handleCallHotel = () => {
    if (booking?.property?.phone) {
      Linking.openURL(`tel:${booking.property.phone}`);
    } else {
      Alert.alert('Info', 'Phone number not available');
    }
  };

  const handleGetDirections = () => {
    const address = booking?.property?.address || '';
    const city = booking?.property?.city || '';
    const query = encodeURIComponent(`${address}, ${city}`);
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!booking) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.errorText}>Booking not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
      case 'paid':
        return COLORS.success;
      case 'pending':
        return COLORS.warning;
      case 'cancelled':
        return COLORS.error;
      case 'completed':
        return COLORS.primary;
      default:
        return COLORS.text.secondary;
    }
  };

  const propertyImage = booking.property?.images?.[0]?.url 
    || booking.roomType?.photos?.[0]?.url
    || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500';

  // Tính toán giá trị hiển thị dùng safeNumber
  const totalAmount = safeNumber(booking.totalAmount);
  const taxAmount = safeNumber(booking.taxAmount);
  const serviceAmount = safeNumber(booking.serviceAmount);
  const roomPrice = totalAmount - taxAmount - serviceAmount;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerBtn}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Booking Detail</Text>
        <TouchableOpacity style={styles.headerBtn}>
          <Ionicons name="share-outline" size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hotel Image & Status */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: propertyImage }} style={styles.hotelImage} />
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(booking.status) }]}>
            <Text style={styles.statusText}>{booking.status?.toUpperCase()}</Text>
          </View>
        </View>

        {/* Hotel Info */}
        <View style={styles.section}>
          <Text style={styles.hotelName}>{booking.property?.name}</Text>
          <View style={styles.locationRow}>
            <Ionicons name="location" size={16} color={COLORS.text.secondary} />
            <Text style={styles.locationText}>
              {booking.property?.address}, {booking.property?.city}
            </Text>
          </View>
          
          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.actionBtn} onPress={handleCallHotel}>
              <View style={[styles.actionIcon, { backgroundColor: '#E3F2FD' }]}>
                <Ionicons name="call" size={20} color="#1E88E5" />
              </View>
              <Text style={styles.actionText}>Call</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionBtn} onPress={handleGetDirections}>
              <View style={[styles.actionIcon, { backgroundColor: '#E8F5E9' }]}>
                <Ionicons name="map" size={20} color="#43A047" />
              </View>
              <Text style={styles.actionText}>Directions</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionBtn}>
              <View style={[styles.actionIcon, { backgroundColor: '#FFF3E0' }]}>
                <Ionicons name="chatbubble-ellipses" size={20} color="#FB8C00" />
              </View>
              <Text style={styles.actionText}>Message</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Booking Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reservation Details</Text>
          
          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Check-in</Text>
              <Text style={styles.detailValue}>{formatDate(booking.checkIn)}</Text>
              <Text style={styles.detailSub}>{booking.property?.checkInTime || '14:00'}</Text>
            </View>
            <View style={styles.dividerVertical} />
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Check-out</Text>
              <Text style={styles.detailValue}>{formatDate(booking.checkOut)}</Text>
              <Text style={styles.detailSub}>{booking.property?.checkOutTime || '12:00'}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Booking ID</Text>
            <Text style={styles.infoValue}>#{booking.confirmationCode || booking.id.slice(0, 8)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Guest Name</Text>
            <Text style={styles.infoValue}>{booking.contactName || booking.guest?.name}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Guests</Text>
            <Text style={styles.infoValue}>
              {booking.adults} Adults, {booking.children} Children
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Room Type</Text>
            <Text style={styles.infoValue}>{booking.roomType?.name}</Text>
          </View>
        </View>

        {/* Payment Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Summary</Text>
          
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Room Price</Text>
            <Text style={styles.paymentValue}>${roomPrice.toFixed(2)}</Text>
          </View>
          
          {taxAmount > 0 && (
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Tax</Text>
              <Text style={styles.paymentValue}>${taxAmount.toFixed(2)}</Text>
            </View>
          )}
          
          {serviceAmount > 0 && (
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Service Fee</Text>
              <Text style={styles.paymentValue}>${serviceAmount.toFixed(2)}</Text>
            </View>
          )}

          <View style={styles.divider} />
          
          <View style={[styles.paymentRow, { marginTop: 8 }]}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalValue}>${totalAmount.toFixed(2)}</Text>
          </View>
          
          <View style={styles.paymentStatusRow}>
            <Text style={styles.paymentStatusLabel}>Payment Status:</Text>
            <Text style={[
              styles.paymentStatusValue, 
              { color: booking.paymentStatus?.toLowerCase() === 'paid' ? COLORS.success : COLORS.error }
            ]}>
              {booking.paymentStatus?.toUpperCase() || 'UNPAID'}
            </Text>
          </View>
        </View>

        {/* Action Button: Go to Home */}
        <View style={styles.footer}>
          <TouchableOpacity 
            style={[styles.cancelButton, { backgroundColor: COLORS.primary, borderColor: COLORS.primary }]}
            onPress={() => navigation.reset({
              index: 0,
              routes: [{ name: 'MainTabs' as never }],
            })}
          >
            <Text style={[styles.cancelButtonText, { color: COLORS.surface }]}>Go to Home Page</Text>
          </TouchableOpacity>
        </View>
        
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
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
  headerBtn: {
    padding: 8,
  },
  headerTitle: {
    fontSize: SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  imageContainer: {
    height: 200,
    width: '100%',
    position: 'relative',
  },
  hotelImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  statusBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: SIZES.sm,
  },
  section: {
    backgroundColor: COLORS.surface,
    marginTop: SIZES.spacing.md,
    padding: SIZES.spacing.lg,
  },
  hotelName: {
    fontSize: SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: SIZES.spacing.xs,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.spacing.lg,
  },
  locationText: {
    fontSize: SIZES.sm,
    color: COLORS.text.secondary,
    marginLeft: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SIZES.spacing.sm,
  },
  actionBtn: {
    alignItems: 'center',
    flex: 1,
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  actionText: {
    fontSize: SIZES.xs,
    color: COLORS.text.secondary,
  },
  sectionTitle: {
    fontSize: SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: SIZES.spacing.lg,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailItem: {
    flex: 1,
    alignItems: 'center',
  },
  dividerVertical: {
    width: 1,
    height: 40,
    backgroundColor: COLORS.divider,
  },
  detailLabel: {
    fontSize: SIZES.sm,
    color: COLORS.text.secondary,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: SIZES.md,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  detailSub: {
    fontSize: SIZES.xs,
    color: COLORS.text.hint,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.divider,
    marginVertical: SIZES.spacing.lg,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: SIZES.sm,
    color: COLORS.text.secondary,
  },
  infoValue: {
    fontSize: SIZES.sm,
    color: COLORS.text.primary,
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  paymentLabel: {
    fontSize: SIZES.sm,
    color: COLORS.text.secondary,
  },
  paymentValue: {
    fontSize: SIZES.sm,
    color: COLORS.text.primary,
  },
  totalLabel: {
    fontSize: SIZES.md,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  totalValue: {
    fontSize: SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  paymentStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    backgroundColor: COLORS.background,
    padding: 8,
    borderRadius: 8,
  },
  paymentStatusLabel: {
    fontSize: SIZES.sm,
    color: COLORS.text.secondary,
    marginRight: 8,
  },
  paymentStatusValue: {
    fontSize: SIZES.sm,
    fontWeight: 'bold',
  },
  footer: {
    padding: SIZES.spacing.lg,
    alignItems: 'center',
  },
  cancelButton: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: SIZES.radius.md,
    borderWidth: 1,
    borderColor: COLORS.error,
    backgroundColor: '#FFF',
    alignItems: 'center',
    marginBottom: 12,
  },
  cancelButtonText: {
    fontSize: SIZES.md,
    fontWeight: 'bold',
    color: COLORS.error,
  },
  cancelPolicy: {
    fontSize: SIZES.xs,
    color: COLORS.text.hint,
    textAlign: 'center',
  },
  errorText: {
    fontSize: SIZES.lg,
    color: COLORS.text.secondary,
    marginBottom: 20,
  },
  backButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
});

export default BookingDetailScreen;