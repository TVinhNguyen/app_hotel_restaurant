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
import QRCodeModal from '../components/QRCodeModal';
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
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<any>({
    id: '1',
    type: 'qr',
    name: 'Thanh toán QR',
    cardNumber: ''
  });
  const [showQRModal, setShowQRModal] = useState(false);
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

  // Fetch room type details and check user login on mount
  useEffect(() => {
    fetchRoomTypeDetails();
    checkUserLogin();
  }, [roomId]);

  const checkUserLogin = async () => {
    try {
      const storedUser = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        console.log('User logged in:', userData.email);
      }
    } catch (error) {
      console.error('Error checking user login:', error);
    }
  };

  const fetchRoomTypeDetails = async () => {
    try {
      const response = await roomTypeService.getRoomTypeById(roomId);
      const roomData = response.success ? response.data : response;
      
      if (roomData) {
        // Map API response
        const mapped = {
          id: (roomData as any).id,
          property_id: (roomData as any).propertyId || (roomData as any).property_id,
          name: (roomData as any).name,
          base_price: parseFloat((roomData as any).basePrice || (roomData as any).base_price || '0'),
          maxAdults: (roomData as any).maxAdults,
          maxChildren: (roomData as any).maxChildren,
          property: (roomData as any).property,
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
        Alert.alert('Đã đạt giới hạn', `Phòng này chỉ cho phép tối đa ${roomTypeData.maxAdults} người lớn.`);
      }
    } else {
      if (!roomTypeData || children < roomTypeData.maxChildren) {
        setChildren(prev => prev + 1);
      } else {
        Alert.alert('Đã đạt giới hạn', `Phòng này chỉ cho phép tối đa ${roomTypeData.maxChildren} trẻ em.`);
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
    // Map method into selectedPaymentMethod shape
    const mapped: any = {
      id: method.id,
      type: method.type,
      name: method.name,
    };

    if (method.type === 'mastercard') {
      mapped.cardNumber = '•••••1234';
      mapped.type = 'mastercard';
    } else if (method.type === 'visa') {
      mapped.cardNumber = '•••••5678';
      mapped.type = 'visa';
    }
    else if (method.type === 'Cash') {
      mapped.cardNumber = '';
      mapped.type = 'cash';
    } else if (method.type === 'qr') {
      mapped.cardNumber = '';
      mapped.type = 'qr';
      setSelectedPaymentMethod(mapped);
    }

    setSelectedPaymentMethod(mapped);
  };

  const handleBookingConfirm = async () => {
    // Check if user is logged in first
    const userJson = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
    const currentUser = userJson ? JSON.parse(userJson) : null;

    if (!currentUser) {
      Alert.alert(
        'Yêu cầu đăng nhập',
        'Vui lòng đăng nhập để tiếp tục đặt phòng.',
        [
          { text: 'Hủy', style: 'cancel' },
          {
            text: 'Đăng nhập',
            onPress: () => navigation.navigate('Login')
          }
        ]
      );
      return;
    }

    if (!propertyId) {
      Alert.alert('Lỗi', 'Không thể tải thông tin khách sạn. Vui lòng thử lại.');
      return;
    }

    setLoading(true);
    try {
      const user = currentUser;

      // Backend will check availability with pessimistic locking
      // No need to check on frontend - just handle error from backend
      
      // Navigate to checkout with all booking details
      const property = roomTypeData?.property;
      const fullAddress = [
        property?.address,
        property?.city,
        property?.country
      ].filter(Boolean).join(', ');
      
      navigation.navigate('Checkout', {
        propertyId: propertyId,
        roomTypeId: roomId,
        roomTypeName: roomTypeData?.name || hotelName,
        hotelName: roomTypeData?.property?.name || hotelName,
        hotelLocation: fullAddress || location || '',
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
        user: user,
        selectedPaymentMethod: selectedPaymentMethod,
      } as any);
    } catch (error: any) {
      console.error('Error in booking process:', error);
      Alert.alert('Lỗi', 'Không thể tiếp tục đặt phòng. Vui lòng thử lại.');
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
        <Text style={styles.headerTitle}>Yêu cầu đặt phòng</Text>
        <View style={styles.menuButton} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Date Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ngày đặt phòng</Text>

          <View style={styles.dateContainer}>
            <TouchableOpacity
              style={styles.dateItem}
              onPress={() => handleDatePress('checkin')}
            >
              <View style={styles.dateHeader}>
                <Ionicons name="calendar-outline" size={20} color={COLORS.text.secondary} />
                <Text style={styles.dateLabel}>Nhận phòng</Text>
              </View>
              <Text style={styles.dateValue}>{formatDate(checkInDate)}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.dateItem}
              onPress={() => handleDatePress('checkout')}
            >
              <View style={styles.dateHeader}>
                <Ionicons name="calendar-outline" size={20} color={COLORS.text.secondary} />
                <Text style={styles.dateLabel}>Trả phòng</Text>
              </View>
              <Text style={styles.dateValue}>{formatDate(checkOutDate)}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Guest Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Khách</Text>

          {/* Adults */}
          <View style={styles.guestRow}>
            <View style={styles.guestInfo}>
              <Text style={styles.guestLabel}>Người lớn</Text>
              <Text style={styles.guestSubLabel}>Từ 13 tuổi</Text>
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
              <Text style={styles.guestLabel}>Trẻ em</Text>
              <Text style={styles.guestSubLabel}>Từ 0-12 tuổi</Text>
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

          <Text style={styles.guestTotal}>Tổng: {guestCount} Khách</Text>
        </View>

        {/* Payment Method Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Phương thức thanh toán</Text>

          <View style={styles.paymentMethod}>
            <View style={styles.paymentLeft}>
              <View style={styles.paymentIcon}>
                <Ionicons name="qr-code" size={24} color={COLORS.primary} />
              </View>
              <View style={styles.paymentInfo}>
                <Text style={styles.paymentName}>THANH TOÁN BẰNG MÃ QR</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Payment Details Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chi tiết thanh toán</Text>

          <View style={styles.paymentDetailsSection}>
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>{Math.round(price).toLocaleString('vi-VN')} ₫ × {nights} Đêm</Text>
              <Text style={styles.paymentAmount}>{Math.round(pricing.subtotal).toLocaleString('vi-VN')} ₫</Text>
            </View>

            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Thuế (10%)</Text>
              <Text style={styles.paymentAmount}>{Math.round(pricing.taxAmount).toLocaleString('vi-VN')} ₫</Text>
            </View>

            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Phí dịch vụ (5%)</Text>
              <Text style={styles.paymentAmount}>{Math.round(pricing.serviceAmount).toLocaleString('vi-VN')} ₫</Text>
            </View>

            <View style={[styles.paymentRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Tổng thanh toán:</Text>
              <Text style={styles.totalAmount}>{Math.round(pricing.totalAmount).toLocaleString('vi-VN')} ₫</Text>
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
            <Text style={styles.bookButtonText}>Tiếp tục thanh toán</Text>
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
          title={datePickerType === 'checkin' ? 'Chọn ngày nhận phòng' : 'Chọn ngày trả phòng'}
        />
      )}

      {/* Payment Method Modal */}
      <PaymentMethodModal
        visible={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onPaymentMethodSelect={handlePaymentMethodSelect}
        selectedMethodId={selectedPaymentMethod.id}
      />

      {/* QR Code Modal */}
      <QRCodeModal
        visible={showQRModal}
        onClose={() => setShowQRModal(false)}
        amount={pricing.totalAmount}
        reference={reservationService.generateConfirmationCode()}
        merchantName={roomTypeData?.property?.name || hotelName}
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