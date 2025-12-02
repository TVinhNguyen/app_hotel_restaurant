import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
  TextInput,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SIZES, STORAGE_KEYS } from '../constants';
import { reservationService } from '../services/reservationService';
import { guestService } from '../services/guestService';
import { roomTypeService } from '../services/roomTypeService'; // Import thêm service này
import type { Booking } from '../types';

const MyBookingScreen = () => {
  const navigation = useNavigation<any>();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'Booked' | 'History'>('Booked');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Tự động tải lại dữ liệu mỗi khi màn hình được focus
  useFocusEffect(
    useCallback(() => {
      fetchBookings();
    }, [])
  );

  const fetchBookings = async () => {
    try {
      if (bookings.length === 0) setIsLoading(true);
      
      const storedUser = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
      if (!storedUser) {
        setBookings([]);
        setIsLoading(false);
        return;
      }

      const userData = JSON.parse(storedUser);
      
      let guestId: string | null = null;
      try {
        const guest = await guestService.findGuestByEmail(userData.email);
        if (guest) {
          guestId = guest.id;
        } else {
          setBookings([]);
          setIsLoading(false);
          setIsRefreshing(false);
          return;
        }
      } catch (guestError) {
        setBookings([]);
        setIsLoading(false);
        setIsRefreshing(false);
        return;
      }
      
      try {
        // 1. Lấy danh sách cơ bản
        const response = await reservationService.getReservations({ guestId });
        let basicReservations: any[] = [];
        
        if (response && response.data) {
          if (response.data.data && Array.isArray(response.data.data)) {
            basicReservations = response.data.data;
          } else if (Array.isArray(response.data)) {
            basicReservations = response.data;
          }
        }

        if (basicReservations.length > 0) {
          // Sắp xếp theo ngày tạo mới nhất
          basicReservations.sort((a, b) => {
             const dateA = new Date(a.createdAt || 0).getTime();
             const dateB = new Date(b.createdAt || 0).getTime();
             return dateB - dateA;
          });

          // 2. Lấy chi tiết từng đơn (để có tên khách sạn và ảnh)
          // Giới hạn 10 đơn gần nhất để tối ưu hiệu năng vì phải gọi nhiều API
          const recentReservations = basicReservations.slice(0, 10); 
          
          const detailedReservationsPromises = recentReservations.map(async (res: any) => {
            try {
              // Bước A: Lấy chi tiết Reservation (để có Property Name)
              const detailResponse = await reservationService.getReservationById(res.id);
              const reservationDetail = detailResponse.data || detailResponse || res;

              // Bước B: Lấy chi tiết RoomType (để có Photos)
              // Vì API Reservation thường không trả về photos của roomType để nhẹ payload
              const roomTypeId = reservationDetail.roomTypeId || reservationDetail.roomType?.id;
              
              if (roomTypeId) {
                 try {
                    const roomTypeResponse = await roomTypeService.getRoomTypeById(roomTypeId);
                    // Xử lý response room type (có thể bọc trong data hoặc trả về trực tiếp)
                    let fullRoomType = roomTypeResponse;
                    if ((roomTypeResponse as any).data) {
                        fullRoomType = (roomTypeResponse as any).data;
                    }

                    // Gán photos vào reservationDetail để hàm map sử dụng
                    if (fullRoomType && (fullRoomType as any).photos) {
                        if (!reservationDetail.roomType) reservationDetail.roomType = {} as any;
                        
                        // Fix: Ensure roomType exists before assignment
                        if (reservationDetail.roomType) {
                            reservationDetail.roomType.photos = (fullRoomType as any).photos;
                        }
                    }
                 } catch (rtError) {
                    console.log(`Failed to fetch room type photos for ${roomTypeId}`, rtError);
                 }
              }

              return reservationDetail;
            } catch (err) {
              console.log(`Failed detail fetch for ${res.id}`, err);
              return res;
            }
          });

          const detailedReservations = await Promise.all(detailedReservationsPromises);

          // 3. Map dữ liệu
          const mappedBookings = detailedReservations.map((res, index) => mapReservationToBooking(res, index));
          setBookings(mappedBookings);
        } else {
          setBookings([]);
        }
      } catch (apiError: any) {
        console.error('API Error:', apiError);
        setBookings([]);
      }
    } catch (error: any) {
      console.error('General Error:', error);
      setBookings([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const mapReservationToBooking = (reservation: any, index: number): Booking => {
    const checkIn = reservation.checkIn || reservation.check_in_date || '';
    const checkOut = reservation.checkOut || reservation.check_out_date || '';
    
    // Tìm tên khách sạn ở nhiều vị trí
    const propertyName = 
        reservation.property?.name || 
        reservation.roomType?.property?.name || 
        reservation.hotelName ||
        reservation.property_name || 
        'Hotel Reservation';
    
    const propertyCity = reservation.property?.city || '';
    const propertyCountry = reservation.property?.country || '';
    const propertyAddress = reservation.property?.address || '';
    
    let locationText = '';
    if (propertyAddress) {
      locationText = propertyAddress;
    } else if (propertyCity && propertyCountry) {
      locationText = `${propertyCity}, ${propertyCountry}`;
    } else if (propertyCity) {
      locationText = propertyCity;
    } else {
      locationText = `Booking #${reservation.confirmationCode || reservation.id.substring(0, 8)}`;
    }
    
    // --- LOGIC ẢNH: Lấy từ API, nếu không có thì để rỗng ---
    let imageUrl = ''; 
    
    // 1. Ảnh của loại phòng (roomType) - Đã được fetch bổ sung ở trên
    if (reservation.roomType?.photos && reservation.roomType.photos.length > 0) {
        const photo = reservation.roomType.photos[0];
        imageUrl = typeof photo === 'string' ? photo : photo.url;
    } 
    // 2. Ảnh của khách sạn (property)
    else if (reservation.property?.images && reservation.property.images.length > 0) {
        const img = reservation.property.images[0];
        imageUrl = typeof img === 'string' ? img : img.url;
    } else if (reservation.property?.image) {
        imageUrl = reservation.property.image;
    }
    // --------------------------------------------------------
    
    let status: 'booked' | 'completed' | 'cancelled' = 'booked';
    
    if (reservation.status === 'cancelled') {
        status = 'cancelled';
    } else if (reservation.status === 'completed' || reservation.status === 'checked_out') {
        status = 'completed';
    } else {
        status = 'booked';
    }

    return {
      id: reservation.id,
      userId: reservation.guest?.id || '',
      roomId: reservation.assignedRoomId || '',
      hotelName: propertyName,
      hotelLocation: locationText,
      hotelImage: imageUrl,
      checkInDate: checkIn.split('T')[0],
      checkOutDate: checkOut.split('T')[0],
      guests: (reservation.adults || 1) + (reservation.children || 0),
      rooms: 1,
      totalPrice: parseFloat(reservation.totalAmount || '0'),
      pricePerNight: 0,
      rating: 4.5,
      status: status,
      createdAt: reservation.createdAt || new Date().toISOString(),
    };
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchBookings();
  };

  const bookedBookings = bookings.filter(booking => booking.status === 'booked');
  const historyBookings = bookings.filter(booking => booking.status !== 'booked');

  const filteredBookings = (activeTab === 'Booked' ? bookedBookings : historyBookings)
    .filter(booking => 
      booking.hotelName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.hotelLocation.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const formatDateRange = (checkIn: string, checkOut: string) => {
    if (!checkIn || !checkOut) return '';
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const dayIn = checkInDate.getDate();
    const dayOut = checkOutDate.getDate();
    const monthIn = checkInDate.toLocaleDateString('en-US', { month: 'short' });
    const monthOut = checkOutDate.toLocaleDateString('en-US', { month: 'short' });
    const year = checkInDate.getFullYear();
    
    if (monthIn === monthOut) {
      return `${dayIn} - ${dayOut} ${monthIn} ${year}`;
    }
    return `${dayIn} ${monthIn} - ${dayOut} ${monthOut} ${year}`;
  };

  const formatPrice = (price: number) => {
    return `$${price.toFixed(2)}`;
  };

  const renderBookingCard = ({ item }: { item: Booking }) => (
    <TouchableOpacity 
      style={styles.bookingCard}
      onPress={() => {
        navigation.navigate('BookingDetail', { 
            bookingId: item.id 
        });
      }}
    >
      {/* Hiển thị ảnh nếu có, không thì hiển thị Icon mặc định */}
      {item.hotelImage ? (
        <Image source={{ uri: item.hotelImage }} style={styles.hotelImage} />
      ) : (
        <View style={[styles.hotelImage, { backgroundColor: COLORS.lightBlue, justifyContent: 'center', alignItems: 'center' }]}>
          <Ionicons name="business" size={32} color={COLORS.primary} />
        </View>
      )}

      <View style={styles.bookingInfo}>
        <View style={styles.hotelHeader}>
          <Text style={styles.hotelName} numberOfLines={1}>{item.hotelName}</Text>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={14} color={COLORS.warning} />
            <Text style={styles.ratingText}>{item.rating}</Text>
          </View>
        </View>
        
        <Text style={styles.locationText} numberOfLines={1}>{item.hotelLocation}</Text>

        <Text style={styles.priceText}>
          {formatPrice(item.totalPrice)} <Text style={styles.priceUnit}>total</Text>
        </Text>

        <View style={styles.bookingDetails}>
          <View style={styles.detailRow}>
            <Ionicons name="calendar" size={16} color={COLORS.primary} />
            <Text style={styles.detailLabel}>Dates</Text>
            <Text style={styles.detailValue}>{formatDateRange(item.checkInDate, item.checkOutDate)}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (isLoading && bookings.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Booking</Text>
        <TouchableOpacity style={styles.menuButton}>
          <Ionicons name="ellipsis-vertical" size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={COLORS.text.secondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={COLORS.text.hint}
          />
        </View>
        <TouchableOpacity style={styles.filterButton}>
          <Ionicons name="options" size={20} color={COLORS.text.primary} />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'Booked' && styles.activeTab]}
          onPress={() => setActiveTab('Booked')}
        >
          <Text style={[styles.tabText, activeTab === 'Booked' && styles.activeTabText]}>
            Booked
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'History' && styles.activeTab]}
          onPress={() => setActiveTab('History')}
        >
          <Text style={[styles.tabText, activeTab === 'History' && styles.activeTabText]}>
            History
          </Text>
        </TouchableOpacity>
      </View>

      {/* Bookings List */}
      <FlatList
        data={filteredBookings}
        renderItem={renderBookingCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.bookingsList}
        showsVerticalScrollIndicator={false}
        refreshing={isRefreshing}
        onRefresh={handleRefresh}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={64} color={COLORS.text.disabled} />
            <Text style={styles.emptyText}>
              {activeTab === 'Booked' ? 'No booked hotels yet' : 'No booking history'}
            </Text>
            <Text style={styles.emptySubtext}>
              {activeTab === 'Booked' 
                ? 'Book your first hotel to see it here'
                : 'Your completed bookings will appear here'
              }
            </Text>
          </View>
        }
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
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  headerTitle: {
    fontSize: SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIZES.spacing.lg,
    marginBottom: SIZES.spacing.lg,
    gap: SIZES.spacing.sm,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: SIZES.spacing.md,
    paddingVertical: SIZES.spacing.sm,
    borderRadius: SIZES.radius.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: SIZES.spacing.sm,
    fontSize: SIZES.md,
    color: COLORS.text.primary,
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: SIZES.spacing.lg,
    marginBottom: SIZES.spacing.lg,
  },
  tab: {
    flex: 1,
    paddingVertical: SIZES.spacing.sm,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: COLORS.text.primary,
  },
  tabText: {
    fontSize: SIZES.md,
    color: COLORS.text.hint,
    fontWeight: '500',
  },
  activeTabText: {
    color: COLORS.text.primary,
    fontWeight: 'bold',
  },
  bookingsList: {
    paddingHorizontal: SIZES.spacing.lg,
    paddingBottom: SIZES.spacing.xl,
  },
  bookingCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius.lg,
    padding: SIZES.spacing.md,
    marginBottom: SIZES.spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  hotelImage: {
    width: 80,
    height: 100,
    borderRadius: SIZES.radius.md,
    marginRight: SIZES.spacing.md,
  },
  bookingInfo: {
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
    color: COLORS.text.primary,
    fontWeight: '500',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.spacing.sm,
  },
  locationText: {
    fontSize: SIZES.sm,
    color: COLORS.text.secondary,
    marginLeft: 0,
    marginBottom: SIZES.spacing.xs,
  },
  priceText: {
    fontSize: SIZES.md,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SIZES.spacing.md,
  },
  priceUnit: {
    fontSize: SIZES.sm,
    fontWeight: 'normal',
    color: COLORS.text.secondary,
  },
  bookingDetails: {
    gap: SIZES.spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.spacing.sm,
  },
  detailLabel: {
    fontSize: SIZES.sm,
    color: COLORS.text.secondary,
    width: 50,
  },
  detailValue: {
    fontSize: SIZES.sm,
    color: COLORS.text.primary,
    fontWeight: '500',
    flex: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: SIZES.spacing.xxl,
  },
  emptyText: {
    fontSize: SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginTop: SIZES.spacing.lg,
    marginBottom: SIZES.spacing.sm,
  },
  emptySubtext: {
    fontSize: SIZES.sm,
    color: COLORS.text.secondary,
    textAlign: 'center',
    paddingHorizontal: SIZES.spacing.xl,
  },
});

export default MyBookingScreen;