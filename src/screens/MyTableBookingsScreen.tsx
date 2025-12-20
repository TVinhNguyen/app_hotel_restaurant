import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SIZES, STORAGE_KEYS } from '../constants';
import {
  getUserTableBookings,
  cancelTableBooking,
  formatBookingTime,
} from '../services/tableBookingService';
import { guestService } from '../services/guestService';
import type { TableBooking } from '../types';

const MyTableBookingsScreen = () => {
  const navigation = useNavigation();
  const [bookings, setBookings] = useState<TableBooking[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'upcoming' | 'past'>('upcoming');

  // Load bookings whenever screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadBookings();
    }, [])
  );

  const loadBookings = async () => {
    setLoading(true);
    try {
      // 1. Check login status
      const token = await AsyncStorage.getItem(STORAGE_KEYS.USER_TOKEN);
      const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
      
      if (!token || !userData) {
        setIsLoggedIn(false);
        setBookings([]);
        setLoading(false);
        return;
      }
      
      setIsLoggedIn(true);
      
      const user = JSON.parse(userData);
      
      // 2. Find Guest ID
      let guestId = user.id; // Fallback
      try {
        const guest = await guestService.findGuestByEmail(user.email);
        if (guest && guest.id) {
            guestId = guest.id;
        }
      } catch (e) {
        // Continue with userId as fallback
      }

      // 3. Fetch Bookings from API
      const data = await getUserTableBookings(guestId);
      
      // 4. Sort by date desc (newest first)
      const sortedData = Array.isArray(data) ? data.sort((a, b) => {
        // Ép kiểu 'any' để truy cập 'createdAt' nếu nó tồn tại
        const dateA = new Date((a as any).createdAt || `${a.bookingDate}T${a.bookingTime}`).getTime();
        const dateB = new Date((b as any).createdAt || `${b.bookingDate}T${b.bookingTime}`).getTime();
        return dateB - dateA;
    }) : [];

      setBookings(sortedData);
    } catch (error) {
      console.error('Error loading bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadBookings();
    setRefreshing(false);
  };

  const handleCancelBooking = (bookingId: string) => {
    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel this booking? This action cannot be undone.',
      [
        {
          text: 'No',
          style: 'cancel',
        },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              
              // Call API cancel (uses DELETE method)
              await cancelTableBooking(bookingId);
              
              // Refresh list
              await loadBookings();
              
              Alert.alert('Success', 'Booking cancelled successfully');
            } catch (error: any) {
              console.error('Error cancelling booking:', error);
              const errorMessage = error.response?.data?.message || 'Failed to cancel booking. Please try again.';
              Alert.alert('Error', errorMessage);
            } finally {
               setLoading(false);
            }
          },
        },
      ]
    );
  };

  const getFilteredBookings = () => {
    const now = new Date();
    // Reset time part for date comparison only
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString().split('T')[0];

    return bookings.filter((booking) => {
      if (selectedFilter === 'all') return true;
      
      // Basic logic: compare dates
      const bookingDateStr = booking.bookingDate.split('T')[0]; // Ensure YYYY-MM-DD
      
      // Check if past
      let isPast = bookingDateStr < today;
      
      // If same day, check status or maybe time (optional complexity)
      if (bookingDateStr === today) {
          if (booking.status === 'completed' || booking.status === 'cancelled' || booking.status === 'no_show') {
              isPast = true;
          }
      }
      
      // Also consider status for past/upcoming logic
      if (booking.status === 'completed' || booking.status === 'cancelled' || booking.status === 'no_show') {
          isPast = true;
      }

      if (selectedFilter === 'upcoming') {
        return !isPast; 
      } else { // Past
        return isPast;
      }
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return COLORS.warning;
      case 'confirmed':
        return COLORS.primary;
      case 'seated':
        return COLORS.info;
      case 'completed':
        return COLORS.success;
      case 'cancelled':
      case 'no_show':
        return COLORS.error;
      default:
        return COLORS.text.secondary;
    }
  };

  const getStatusText = (status: string) => {
    if (!status) return '';
    return status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ');
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    };
    return date.toLocaleDateString('en-US', options);
  };

  const renderBookingCard = (booking: TableBooking) => {
    const canCancel = booking.status === 'pending' || booking.status === 'confirmed';
    
    return (
      <View key={booking.id} style={styles.bookingCard}>
        <View style={styles.cardHeader}>
          <View style={styles.restaurantInfo}>
            <Ionicons name="restaurant" size={24} color={COLORS.primary} />
            <View style={styles.restaurantDetails}>
              <Text style={styles.restaurantName}>
                {booking.restaurant?.name || 'Restaurant'}
              </Text>
              <Text style={styles.bookingId}>#{booking.id.slice(0, 8)}</Text>
            </View>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(booking.status) }]}>
            <Text style={styles.statusText}>{getStatusText(booking.status)}</Text>
          </View>
        </View>

        <View style={styles.cardBody}>
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={18} color={COLORS.text.secondary} />
            <Text style={styles.infoText}>{formatDate(booking.bookingDate)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="time-outline" size={18} color={COLORS.text.secondary} />
            <Text style={styles.infoText}>{formatBookingTime(booking.bookingTime)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="people-outline" size={18} color={COLORS.text.secondary} />
            <Text style={styles.infoText}>{booking.pax} {booking.pax === 1 ? 'guest' : 'guests'}</Text>
          </View>
          {booking.assignedTable && (
            <View style={styles.infoRow}>
              <Ionicons name="location-outline" size={18} color={COLORS.text.secondary} />
              <Text style={styles.infoText}>Table {booking.assignedTable.tableNumber}</Text>
            </View>
          )}
        </View>

        {booking.specialRequests ? (
          <View style={styles.specialRequests}>
            <Text style={styles.specialRequestsLabel}>Special Requests:</Text>
            <Text style={styles.specialRequestsText}>{booking.specialRequests}</Text>
          </View>
        ) : null}

        {canCancel && (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => handleCancelBooking(booking.id)}
          >
            <Ionicons name="close-circle-outline" size={20} color={COLORS.error} />
            <Text style={styles.cancelButtonText}>Cancel Booking</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const filteredBookings = getFilteredBookings();

  if (loading && !refreshing && bookings.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Table Bookings</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading bookings...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Guest UI - Not logged in
  if (!isLoggedIn) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Table Bookings</Text>
        </View>
        <View style={styles.emptyStateContainer}>
          <View style={styles.emptyIconContainer}>
            <Ionicons name="log-in-outline" size={80} color={COLORS.primary} />
          </View>
          <Text style={styles.emptyStateTitle}>Login Required</Text>
          <Text style={styles.emptyStateMessage}>
            Please login to view your table bookings
          </Text>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => navigation.navigate('Login' as never)}
          >
            <Ionicons name="log-in-outline" size={20} color={COLORS.surface} />
            <Text style={styles.loginButtonText}>Login Now</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

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
        <Text style={styles.headerTitle}>My Table Bookings</Text>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterTab, selectedFilter === 'all' && styles.filterTabActive]}
          onPress={() => setSelectedFilter('all')}
        >
          <Text style={[styles.filterTabText, selectedFilter === 'all' && styles.filterTabTextActive]}>
            All
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTab, selectedFilter === 'upcoming' && styles.filterTabActive]}
          onPress={() => setSelectedFilter('upcoming')}
        >
          <Text style={[styles.filterTabText, selectedFilter === 'upcoming' && styles.filterTabTextActive]}>
            Upcoming
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTab, selectedFilter === 'past' && styles.filterTabActive]}
          onPress={() => setSelectedFilter('past')}
        >
          <Text style={[styles.filterTabText, selectedFilter === 'past' && styles.filterTabTextActive]}>
            Past
          </Text>
        </TouchableOpacity>
      </View>

      {/* Bookings List */}
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
          />
        }
      >
        {filteredBookings.length > 0 ? (
          filteredBookings.map((booking) => renderBookingCard(booking))
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={64} color={COLORS.text.disabled} />
            <Text style={styles.emptyTitle}>No bookings found</Text>
            <Text style={styles.emptySubtitle}>
              {selectedFilter === 'upcoming' 
                ? "You don't have any upcoming bookings"
                : selectedFilter === 'past'
                ? "You don't have any past bookings"
                : "You haven't made any table bookings yet"}
            </Text>
            <TouchableOpacity
              style={styles.bookNowButton}
              onPress={() => (navigation as any).navigate('TableBooking')}
            >
              <Text style={styles.bookNowButtonText}>Book a Table</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SIZES.spacing.md,
    fontSize: SIZES.md,
    color: COLORS.text.secondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: SIZES.spacing.lg,
    paddingVertical: SIZES.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    marginRight: SIZES.spacing.md,
    padding: SIZES.spacing.xs,
  },
  headerTitle: {
    fontSize: SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    paddingHorizontal: SIZES.spacing.lg,
    paddingVertical: SIZES.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  filterTab: {
    flex: 1,
    paddingVertical: SIZES.spacing.sm,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  filterTabActive: {
    borderBottomColor: COLORS.primary,
  },
  filterTabText: {
    fontSize: SIZES.md,
    color: COLORS.text.secondary,
    fontWeight: '500',
  },
  filterTabTextActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: SIZES.spacing.lg,
  },
  bookingCard: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius.lg,
    padding: SIZES.spacing.lg,
    marginBottom: SIZES.spacing.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SIZES.spacing.md,
  },
  restaurantInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  restaurantDetails: {
    marginLeft: SIZES.spacing.md,
    flex: 1,
  },
  restaurantName: {
    fontSize: SIZES.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  bookingId: {
    fontSize: SIZES.sm,
    color: COLORS.text.secondary,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: SIZES.spacing.md,
    paddingVertical: SIZES.spacing.xs,
    borderRadius: SIZES.radius.sm,
  },
  statusText: {
    fontSize: SIZES.sm,
    fontWeight: '600',
    color: COLORS.surface,
  },
  cardBody: {
    gap: SIZES.spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    fontSize: SIZES.md,
    color: COLORS.text.primary,
    marginLeft: SIZES.spacing.sm,
  },
  specialRequests: {
    marginTop: SIZES.spacing.md,
    padding: SIZES.spacing.md,
    backgroundColor: COLORS.lightBlue,
    borderRadius: SIZES.radius.md,
  },
  specialRequestsLabel: {
    fontSize: SIZES.sm,
    fontWeight: '600',
    color: COLORS.text.secondary,
    marginBottom: 4,
  },
  specialRequestsText: {
    fontSize: SIZES.md,
    color: COLORS.text.primary,
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SIZES.spacing.md,
    paddingVertical: SIZES.spacing.sm,
    borderWidth: 1,
    borderColor: COLORS.error,
    borderRadius: SIZES.radius.md,
  },
  cancelButtonText: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.error,
    marginLeft: SIZES.spacing.xs,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SIZES.spacing.xxl * 2,
  },
  emptyTitle: {
    fontSize: SIZES.xl,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginTop: SIZES.spacing.lg,
  },
  emptySubtitle: {
    fontSize: SIZES.md,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginTop: SIZES.spacing.sm,
    paddingHorizontal: SIZES.spacing.xl,
  },
  bookNowButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SIZES.spacing.xl,
    paddingVertical: SIZES.spacing.md,
    borderRadius: SIZES.radius.md,
    marginTop: SIZES.spacing.xl,
  },
  bookNowButtonText: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.surface,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SIZES.spacing.xl * 2,
  },
  emptyIconContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.spacing.xl,
  },
  emptyStateTitle: {
    fontSize: SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: SIZES.spacing.sm,
    textAlign: 'center',
  },
  emptyStateMessage: {
    fontSize: SIZES.md,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: SIZES.spacing.xl * 2,
    lineHeight: 22,
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: SIZES.spacing.xl,
    paddingVertical: SIZES.spacing.md,
    borderRadius: SIZES.radius.lg,
    width: '100%',
  },
  loginButtonText: {
    fontSize: SIZES.md,
    fontWeight: 'bold',
    color: COLORS.surface,
    marginLeft: SIZES.spacing.sm,
  },
});

export default MyTableBookingsScreen;