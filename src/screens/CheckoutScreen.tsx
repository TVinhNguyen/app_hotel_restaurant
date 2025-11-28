import React, { useState, useEffect } from 'react';
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
  Modal,
  FlatList,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants';
import { reservationService } from '../services/reservationService';
import { apiService } from '../services/apiService';
import { ratePlanService } from '../services/ratePlanService';
import { guestService } from '../services/guestService';
import QRCodeModal from '../components/QRCodeModal';

const CheckoutScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { 
    propertyId, roomTypeId, roomTypeName, hotelName, hotelLocation, hotelImage, rating, price, 
    checkInDate: checkInDateString, checkOutDate: checkOutDateString, 
    adults, children, guestCount, nights, pricing, availableRooms, user,
  } = route.params as any;

  // --- STATE ---
  const [exchangeRate, setExchangeRate] = useState(25000);
  const [promotions, setPromotions] = useState<any[]>([]);
  const [selectedPromo, setSelectedPromo] = useState<any | null>(null);
  const [showPromoModal, setShowPromoModal] = useState(false);
  const [isLoadingPromo, setIsLoadingPromo] = useState(false);
  const [loading, setLoading] = useState(false);
  const [posLoading, setPosLoading] = useState(false);
  const [paymentPosData, setPaymentPosData] = useState<any>(null);
  const [showPosQR, setShowPosQR] = useState(false);
  
  const [currentReservationId, setCurrentReservationId] = useState<string | null>(null);

  // --- CONSTANTS ---
  const checkInDate = new Date(checkInDateString);
  const checkOutDate = new Date(checkOutDateString);
  const EXCHANGE_API_KEY = '466a929ab909370f108e1d7a8c732bb7';

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    let timeoutId: NodeJS.Timeout;

    if (showPosQR && paymentPosData?.data?.orderCode && currentReservationId) {
      const orderCode = paymentPosData.data.orderCode;
      console.log('Checking payment for orderId:', orderCode);

      intervalId = setInterval(async () => {
        try {
          const response: any = await apiService.get(`/payments-pos/status/${orderCode}`);
          console.log('Payment status:', response);

          // --- SỬA Ở ĐÂY ---
          // Chỉ kiểm tra duy nhất response.webhookData.success === true
          if (response?.webhookData?.success === true) {
            
            console.log('CHECK SUCCESS: Đã nhận được success: true'); // Log confirm
            
            // 1. Dừng polling
            clearInterval(intervalId);
            clearTimeout(timeoutId);
            
            // 2. Tắt modal QR
            setShowPosQR(false);
            
            // 3. Chuyển trang
            navigation.reset({
              index: 0,
              routes: [
                { name: 'MainTabs' as never },
                { 
                  name: 'BookingDetail' as never, 
                  params: { 
                    bookingId: currentReservationId,
                    isNewPayment: true,
                  } 
                }
              ],
            });

          } else if (response?.status === 'failed' || response?.status === 'cancelled') {
             // Giữ nguyên logic fail nếu cần, hoặc bỏ nếu bạn không muốn check
            clearInterval(intervalId);
            clearTimeout(timeoutId);
            setShowPosQR(false);
            Alert.alert('Thanh toán thất bại', 'Giao dịch đã bị hủy hoặc lỗi.');
          }
        } catch (error) {
          console.error('Error checking status:', error);
        }
      }, 2000);

      timeoutId = setTimeout(() => {
        if (intervalId) clearInterval(intervalId);
        Alert.alert('Thông báo', 'Hết thời gian chờ xác nhận tự động.');
      }, 60000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [showPosQR, paymentPosData, currentReservationId]);
  // --- CALCULATION ---
  const basePrice = pricing?.subtotal || (price * nights);
  let discountAmount = 0;
  if (selectedPromo) {
    discountAmount = (basePrice * parseFloat(selectedPromo.discountPercent)) / 100;
  }
  const taxAmount = pricing?.taxAmount || 0;
  const serviceAmount = pricing?.serviceAmount || 0;
  const totalPrice = (basePrice - discountAmount) + taxAmount + serviceAmount;

  // --- ACTION HANDLERS ---
  const navigateToSuccess = () => {
    if (!currentReservationId) return;
    // Chuyển hướng cho trường hợp trả sau (Pay at hotel)
    // Cũng chuyển về BookingDetail cho đồng bộ, hoặc PaymentComplete tuỳ ý
    // Ở đây tôi giữ PaymentComplete cho trường hợp trả sau như cũ, hoặc bạn có thể đổi thành BookingDetail
    navigation.reset({
      index: 0,
      routes: [
        { name: 'MainTabs' as never },
        {
          name: 'PaymentComplete' as never,
          params: {
            reservationId: currentReservationId,
            hotelName, hotelLocation, checkInDate: checkInDate.toISOString(), checkOutDate: checkOutDate.toISOString(),
            guestCount, roomType: roomTypeName, totalAmount: totalPrice,
          } as never,
        },
      ],
    });
  };

  // API 2: CREATE PAYMENT (Giống code mẫu)
  const createQRPayment = async (reservationId: string) => {
    try {
      setPosLoading(true);
      
      const orderId = Number(Date.now()); 
      const description = `Thanh toan don #${reservationId.substring(0, 5)}`;
      //const amountVND = Math.round(totalPrice * exchangeRate);
      const amountVND = 2000;
      
      const body = {
        orderId,
        amount: amountVND,
        description,
        reservationId 
      };

      console.log('Creating Payment:', body);

      const resp: any = await apiService.post('/payments-pos', body);
      
      if (resp && resp.code === '00' && resp.data) {
        setPaymentPosData(resp);
        setShowPosQR(true);
      } else {
        throw new Error('Tạo payment thất bại');
      }
    } catch (err: any) {
      console.error('Payment Error:', err);
      Alert.alert('Lỗi', 'Lỗi tạo thanh toán. Vui lòng thử lại.');
    } finally {
      setPosLoading(false);
      setLoading(false);
    }
  };

  // API 1: CREATE RESERVATION
  const handleCheckout = async () => {
    if (!user) return Alert.alert('Error', 'User info missing');
    setLoading(true);

    try {
      const guest = await guestService.getOrCreateGuestByEmail({
        name: user.name || 'Guest', email: user.email || '', phone: user.phone || '',
      });
      
      let ratePlanId = null;
      let ratePlanCurrency = 'VND';
      try {
        const ratePlansRes = await ratePlanService.getRatePlans({ roomTypeId });
        const plans = (ratePlansRes as any).data || ratePlansRes;
        if (plans && plans.length > 0) {
          ratePlanId = plans[0].id;
          ratePlanCurrency = plans[0].currency || 'VND';
        } else throw new Error('No rate plan');
      } catch (e) {
        setLoading(false);
        return Alert.alert('Lỗi', 'Không tìm thấy thông tin giá phòng.');
      }

      const reservationData: any = {
        propertyId, guestId: guest.id, roomTypeId, ratePlanId,
        checkIn: checkInDate.toISOString().split('T')[0],
        checkOut: checkOutDate.toISOString().split('T')[0],
        adults, children,
        totalAmount: Math.round(totalPrice * 100) / 100,
        currency: ratePlanCurrency,
        contactName: user.name, contactEmail: user.email, contactPhone: user.phone,
        channel: 'website', bookerUserId: user.id,
        paymentStatus: 'unpaid', status: 'pending',
      };

      console.log('Creating Reservation...');
      const response = await reservationService.createReservation(reservationData);
      const reservation = response.success ? response.data : response;

      if (reservation && (reservation as any).id) {
        console.log('Reservation Created:', (reservation as any).id);
        setCurrentReservationId((reservation as any).id);

        const params: any = route.params || {};
        if (params.selectedPaymentMethod?.type === 'qr') {
          await createQRPayment((reservation as any).id);
        } else {
          navigateToSuccess();
        }
      } else {
        throw new Error('Invalid reservation response');
      }
    } catch (error: any) {
      console.error('Checkout Error:', error);
      Alert.alert('Lỗi', 'Không thể tạo đơn đặt phòng. Vui lòng thử lại.');
      setLoading(false);
    }
  };

  const formatDateRange = (checkIn: Date, checkOut: Date) => {
    const cin = new Date(checkIn);
    const cout = new Date(checkOut);
    return `${cin.getDate()} - ${cout.getDate()} ${cin.toLocaleDateString('en-US', { month: 'short' })} ${cin.getFullYear()}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
        <TouchableOpacity style={styles.menuButton}>
          <Ionicons name="ellipsis-vertical" size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hotelCard}>
            <Image source={{ uri: hotelImage }} style={styles.hotelImage} />
            <View style={styles.hotelInfo}>
                <Text style={styles.hotelName}>{hotelName}</Text>
                <Text style={styles.locationText}>{hotelLocation}</Text>
                <Text style={styles.priceText}>${price} /night</Text>
            </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Price Details</Text>
          <View style={styles.priceDetailsCard}>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>${price} × {nights} Night{nights > 1 ? 's' : ''}</Text>
              <Text style={styles.priceAmount}>${basePrice.toFixed(2)}</Text>
            </View>
            
            {selectedPromo && (
              <View style={styles.priceRow}>
                <Text style={[styles.priceLabel, { color: COLORS.success }]}>
                  Promo ({selectedPromo.code}) -{parseFloat(selectedPromo.discountPercent)}%
                </Text>
                <Text style={[styles.priceAmount, { color: COLORS.success }]}>
                  -${discountAmount.toFixed(2)}
                </Text>
              </View>
            )}

            {taxAmount > 0 && (
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Tax</Text>
                <Text style={styles.priceAmount}>${taxAmount.toFixed(2)}</Text>
              </View>
            )}
            {serviceAmount > 0 && (
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Service fee</Text>
                <Text style={styles.priceAmount}>${serviceAmount.toFixed(2)}</Text>
              </View>
            )}
            <View style={[styles.priceRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total price</Text>
              <Text style={styles.totalAmount}>${totalPrice.toFixed(2)}</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Payment (VND)</Text>
              <Text style={[styles.priceAmount, { fontWeight: 'bold', color: COLORS.primary }]}>
                {exchangeRate === null
                  ? '...'
                  : `${Math.round(totalPrice * exchangeRate).toLocaleString('vi-VN')} ₫`}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Promo Code</Text>
          <TouchableOpacity 
            style={styles.promoCard} 
            onPress={() => setShowPromoModal(true)}
          >
            <View style={styles.promoLeft}>
              <View style={styles.promoIcon}>
                <Ionicons name="pricetag" size={24} color={COLORS.primary} />
              </View>
              <Text style={[styles.promoText, selectedPromo && { color: COLORS.primary, fontWeight: 'bold' }]}>
                {selectedPromo ? `${selectedPromo.code} applied` : 'Select promo code'}
              </Text>
            </View>
            {selectedPromo ? (
                 <TouchableOpacity onPress={() => setSelectedPromo(null)}>
                    <Ionicons name="close-circle" size={20} color={COLORS.error} />
                 </TouchableOpacity>
            ) : (
                <Ionicons name="chevron-forward" size={20} color={COLORS.text.secondary} />
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

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

      {paymentPosData ? (
        <QRCodeModal
          visible={showPosQR}
          onClose={() => setShowPosQR(false)}
          amount={Math.round(totalPrice * exchangeRate)}
          reference={String(paymentPosData?.data?.orderCode || '')}
          merchantName={hotelName}
          qrRaw={paymentPosData?.data?.qrCode}
          qrUrl={paymentPosData?.data?.checkoutUrl}
        />
      ) : null}

      <Modal
        visible={showPromoModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowPromoModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Available Promotions</Text>
                <TouchableOpacity onPress={() => setShowPromoModal(false)}>
                    <Ionicons name="close" size={24} color={COLORS.text.primary} />
                </TouchableOpacity>
            </View>

            {isLoadingPromo ? (
                <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 20 }} />
            ) : promotions.length === 0 ? (
                <Text style={styles.emptyText}>No promotions available right now.</Text>
            ) : (
                <FlatList
                    data={promotions}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{ padding: SIZES.spacing.md }}
                    renderItem={({ item }) => (
                        <TouchableOpacity 
                            style={[
                                styles.promoItem, 
                                selectedPromo?.id === item.id && styles.promoItemActive
                            ]}
                            onPress={() => {
                                setSelectedPromo(selectedPromo?.id === item.id ? null : item);
                                setShowPromoModal(false);
                            }}
                        >
                            <View style={{ flex: 1 }}>
                                <Text style={styles.promoCode}>{item.code}</Text>
                                <Text style={styles.promoDesc}>{item.description}</Text>
                                <Text style={styles.promoExpiry}>Expires: {item.validTo}</Text>
                            </View>
                            <View style={styles.discountBadge}>
                                <Text style={styles.discountText}>{parseFloat(item.discountPercent)}% OFF</Text>
                            </View>
                        </TouchableOpacity>
                    )}
                />
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.spacing.lg,
    paddingTop: SIZES.spacing.md,
    paddingBottom: SIZES.spacing.lg,
    backgroundColor: COLORS.surface,
  },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: SIZES.lg, fontWeight: 'bold', color: COLORS.text.primary },
  menuButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  content: { flex: 1, paddingHorizontal: SIZES.spacing.lg },
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
  hotelImage: { width: 80, height: 80, borderRadius: SIZES.radius.md, marginRight: SIZES.spacing.md },
  hotelInfo: { flex: 1 },
  hotelName: { fontSize: SIZES.md, fontWeight: 'bold', color: COLORS.text.primary, flex: 1, marginRight: SIZES.spacing.sm },
  locationText: { fontSize: SIZES.sm, color: COLORS.text.secondary, marginLeft: SIZES.spacing.xs },
  priceText: { fontSize: SIZES.md, fontWeight: 'bold', color: COLORS.primary },
  section: { marginTop: SIZES.spacing.xl },
  sectionTitle: { fontSize: SIZES.lg, fontWeight: 'bold', color: COLORS.primary, marginBottom: SIZES.spacing.md },
  priceDetailsCard: { backgroundColor: COLORS.surface, borderRadius: SIZES.radius.lg, padding: SIZES.spacing.md },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: SIZES.spacing.sm },
  priceLabel: { fontSize: SIZES.md, color: COLORS.text.primary },
  priceAmount: { fontSize: SIZES.md, color: COLORS.text.primary },
  totalRow: { borderTopWidth: 1, borderTopColor: COLORS.border, marginTop: SIZES.spacing.sm, paddingTop: SIZES.spacing.md },
  totalLabel: { fontSize: SIZES.md, fontWeight: 'bold', color: COLORS.text.primary },
  totalAmount: { fontSize: SIZES.md, fontWeight: 'bold', color: COLORS.text.primary },
  promoCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: COLORS.surface, padding: SIZES.spacing.md, borderRadius: SIZES.radius.lg },
  promoLeft: { flexDirection: 'row', alignItems: 'center' },
  promoIcon: { width: 40, height: 40, borderRadius: 8, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center', marginRight: SIZES.spacing.md },
  promoText: { fontSize: SIZES.md, color: COLORS.text.secondary },
  bottomSection: { padding: SIZES.spacing.lg, backgroundColor: COLORS.surface, borderTopWidth: 1, borderTopColor: COLORS.border },
  totalPriceContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SIZES.spacing.md },
  totalPriceLabel: { fontSize: SIZES.lg, fontWeight: 'bold', color: COLORS.text.primary },
  totalPriceValue: { fontSize: SIZES.xl, fontWeight: 'bold', color: COLORS.primary },
  checkoutButton: { backgroundColor: COLORS.primary, paddingVertical: SIZES.spacing.md, borderRadius: SIZES.radius.lg, alignItems: 'center' },
  checkoutButtonDisabled: { opacity: 0.6 },
  checkoutButtonText: { fontSize: SIZES.lg, fontWeight: 'bold', color: COLORS.surface },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContainer: { backgroundColor: COLORS.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20, height: '60%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: SIZES.spacing.lg, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  modalTitle: { fontSize: SIZES.lg, fontWeight: 'bold', color: COLORS.text.primary },
  promoItem: { flexDirection: 'row', alignItems: 'center', padding: SIZES.spacing.md, backgroundColor: COLORS.background, borderRadius: SIZES.radius.md, marginBottom: SIZES.spacing.md, borderWidth: 1, borderColor: 'transparent' },
  promoItemActive: { borderColor: COLORS.primary, backgroundColor: '#F0F9FF' },
  promoCode: { fontSize: SIZES.md, fontWeight: 'bold', color: COLORS.primary, marginBottom: 4 },
  promoDesc: { fontSize: SIZES.sm, color: COLORS.text.secondary, marginBottom: 4 },
  promoExpiry: { fontSize: SIZES.xs, color: COLORS.text.secondary },
  discountBadge: { backgroundColor: COLORS.primary, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  discountText: { color: '#fff', fontSize: SIZES.sm, fontWeight: 'bold' },
  emptyText: { textAlign: 'center', marginTop: 40, color: COLORS.text.secondary }
});

export default CheckoutScreen;