import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  TextInput,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SIZES, STORAGE_KEYS } from '../constants';
import { reservationService } from '../services/reservationService';
import { guestService } from '../services/guestService';
import type { Booking, Reservation } from '../types';

const MyBookingScreen = () => {
  const navigation = useNavigation<any>(); // Sử dụng any hoặc type cụ thể nếu có
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'Booked' | 'History'>('Booked');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      
      const storedUser = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
      if (!storedUser) {
        setBookings([]);
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
        const response = await reservationService.getReservations({ guestId });
        let reservations: any[] = [];
        
        if (response && response.data) {
          if (response.data.data && Array.isArray(response.data.data)) {
            reservations = response.data.data;
          } else if (Array.isArray(response.data)) {
            reservations = response.data;
          }
        }

        if (reservations.length > 0) {
          const mappedBookings = reservations.map(mapReservationToBooking);
          setBookings(mappedBookings);
        } else {
          setBookings([]);
        }
      } catch (apiError: any) {
        setBookings([]);
      }
    } catch (error: any) {
      setBookings([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const mapReservationToBooking = (reservation: any): Booking => {
    const checkIn = reservation.checkIn || reservation.check_in_date || '';
    const checkOut = reservation.checkOut || reservation.check_out_date || '';
    const nights = reservationService.calculateNights(checkIn, checkOut);
    
    const propertyName = reservation.property?.name || 'Hotel Reservation';
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
    } else if (propertyCountry) {
      locationText = propertyCountry;
    } else {
      locationText = `Booking #${reservation.confirmationCode || reservation.id.substring(0, 8)}`;
    }
    
    // --- CẬP NHẬT: LẤY ẢNH TỪ API ---
    let imageUrl = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=300'; // Fallback
    
    // Ưu tiên ảnh của loại phòng (roomType)
    if (reservation.roomType?.photos && reservation.roomType.photos.length > 0) {
        imageUrl = reservation.roomType.photos[0].url;
    } 
    // Nếu không, lấy ảnh của khách sạn (property)
    else if (reservation.property?.images && reservation.property.images.length > 0) {
        imageUrl = reservation.property.images[0].url;
    } else if (reservation.property?.image) {
        imageUrl = reservation.property.image;
    }
    // -------------------------------
    
    return {
      id: reservation.id,
      userId: reservation.guest?.id || reservation.guestId || reservation.guest_id || '',
      roomId: reservation.assignedRoomId || reservation.assigned_room_id || reservation.roomTypeId || reservation.room_id || '',
      hotelName: propertyName,
      hotelLocation: locationText,
      hotelImage: imageUrl,
      checkInDate: checkIn.split('T')[0],
      checkOutDate: checkOut.split('T')[0],
      guests: (reservation.adults || reservation.number_of_adults || 1) + (reservation.children || reservation.number_of_children || 0),
      rooms: 1,
      totalPrice: parseFloat(reservation.totalAmount || reservation.total_amount || '0'),
      pricePerNight: nights > 0 ? parseFloat(reservation.totalAmount || reservation.total_amount || '0') / nights : parseFloat(reservation.totalAmount || reservation.total_amount || '0'),
      rating: 4.5,
      status: reservation.status === 'confirmed' || reservation.status === 'pending' ? 'booked' 
             : reservation.status === 'completed' || reservation.status === 'checked_out' ? 'completed' 
             : 'cancelled',
      createdAt: reservation.createdAt || reservation.created_at || new Date().toISOString(),
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
    return `$${price}`;
  };

  const renderBookingCard = ({ item }: { item: Booking }) => (
    <TouchableOpacity 
      style={styles.bookingCard}
      onPress={() => {
        // --- CẬP NHẬT: ĐIỀU HƯỚNG SANG TRANG CHI TIẾT ---
        navigation.navigate('BookingDetail', { 
            bookingId: item.id 
        });
      }}
    >
      <Image source={{ uri: item.hotelImage }} style={styles.hotelImage} />
      <View style={styles.bookingInfo}>
        <View style={styles.hotelHeader}>
          <Text style={styles.hotelName}>{item.hotelName}</Text>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={14} color={COLORS.warning} />
            <Text style={styles.ratingText}>{item.rating}</Text>
          </View>
        </View>
        
        <Text style={styles.locationText}>{item.hotelLocation}</Text>

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

  if (isLoading) {
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
    marginLeft: SIZES.spacing.xs,
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