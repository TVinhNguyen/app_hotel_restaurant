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
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants';
import type { Room } from '../types';

const HotelBookingScreen = () => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);

  // Mock data for demo
  const mockRooms: Room[] = [
    {
      id: '1',
      property_id: '1',
      roomTypeId: '1',
      number: '101',
      floor: '1',
      operationalStatus: 'available' as const,
      housekeepingStatus: 'clean' as const,
      name: 'Deluxe Single Room',
      type: 'single',
      price: 1500000,
      description: 'Phòng đơn cao cấp với đầy đủ tiện nghi hiện đại',
      amenities: ['Wi-Fi', 'Điều hòa', 'TV', 'Minibar'],
      images: ['https://via.placeholder.com/300x200/4CAF50/FFFFFF?text=Room+1'],
      available: true,
      maxGuests: 1,
    },
    {
      id: '2',
      property_id: '1',
      roomTypeId: '2',
      number: '201',
      floor: '2',
      operationalStatus: 'available' as const,
      housekeepingStatus: 'clean' as const,
      name: 'Superior Double Room',
      type: 'double',
      price: 2500000,
      description: 'Phòng đôi rộng rãi với view đẹp',
      amenities: ['Wi-Fi', 'Điều hòa', 'TV', 'Minibar', 'Balcony'],
      images: ['https://via.placeholder.com/300x200/FF5722/FFFFFF?text=Room+2'],
      available: true,
      maxGuests: 2,
    },
    {
      id: '3',
      property_id: '1',
      roomTypeId: '3',
      number: '301',
      floor: '3',
      operationalStatus: 'available' as const,
      housekeepingStatus: 'clean' as const,
      name: 'Family Suite',
      type: 'suite',
      price: 4000000,
      description: 'Suite gia đình với không gian rộng rãi',
      amenities: ['Wi-Fi', 'Điều hòa', 'TV', 'Minibar', 'Kitchen', 'Living Room'],
      images: ['https://via.placeholder.com/300x200/2196F3/FFFFFF?text=Suite'],
      available: true,
      maxGuests: 4,
    },
  ];

  const filters = [
    { id: 'all', title: 'Tất cả' },
    { id: 'single', title: 'Đơn' },
    { id: 'double', title: 'Đôi' },
    { id: 'suite', title: 'Suite' },
  ];

  useEffect(() => {
    loadRooms();
  }, []);

  const loadRooms = async () => {
    setLoading(true);
    try {
      // Simulate API call
      setTimeout(() => {
        setRooms(mockRooms);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error loading rooms:', error);
      setLoading(false);
    }
  };

  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.name?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false;
    const matchesFilter = selectedFilter === 'all' || room.type === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const handleRoomPress = (roomId: string) => {
    navigation.navigate('RoomDetails', { 
      roomId,
      hotelName: 'Hotel Name',
    } as any);
  };

  const renderRoomCard = (room: Room) => (
    <TouchableOpacity
      key={room.id}
      style={styles.roomCard}
      onPress={() => handleRoomPress(room.id)}
    >
      <Image source={{ uri: room.images?.[0] || 'https://via.placeholder.com/300x200' }} style={styles.roomImage} />
      <View style={styles.roomInfo}>
        <Text style={styles.roomName}>{room.name || 'Room'}</Text>
        <Text style={styles.roomDescription} numberOfLines={2}>
          {room.description || ''}
        </Text>
        <View style={styles.amenitiesContainer}>
          {(Array.isArray(room.amenities) ? room.amenities.slice(0, 3) : []).map((amenity, index) => (
            <View key={index} style={styles.amenityTag}>
              <Text style={styles.amenityText}>{typeof amenity === 'string' ? amenity : (amenity as any).name}</Text>
            </View>
          ))}
          {(room.amenities && room.amenities.length > 3) && (
            <Text style={styles.moreAmenities}>+{room.amenities.length - 3}</Text>
          )}
        </View>
        <View style={styles.roomFooter}>
          <View style={styles.priceContainer}>
            <Text style={styles.price}>{formatPrice(room.price || 0)}</Text>
            <Text style={styles.priceUnit}>/đêm</Text>
          </View>
          <View style={styles.guestInfo}>
            <Ionicons name="person" size={16} color={COLORS.text.secondary} />
            <Text style={styles.guestText}>Tối đa {room.maxGuests || 1} khách</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Đặt phòng khách sạn</Text>
        <Text style={styles.headerSubtitle}>Chọn phòng phù hợp với bạn</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={COLORS.text.secondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm phòng..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersContainer}>
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter.id}
            style={[
              styles.filterButton,
              selectedFilter === filter.id && styles.filterButtonActive,
            ]}
            onPress={() => setSelectedFilter(filter.id)}
          >
            <Text
              style={[
                styles.filterText,
                selectedFilter === filter.id && styles.filterTextActive,
              ]}
            >
              {filter.title}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Rooms List */}
      <ScrollView style={styles.roomsList} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text>Đang tải...</Text>
          </View>
        ) : (
          <View style={styles.roomsContainer}>
            {filteredRooms.map(renderRoomCard)}
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
  header: {
    backgroundColor: COLORS.primary,
    padding: SIZES.spacing.lg,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.surface,
    marginBottom: SIZES.spacing.xs,
  },
  headerSubtitle: {
    fontSize: SIZES.sm,
    color: COLORS.surface,
    opacity: 0.9,
  },
  searchContainer: {
    padding: SIZES.spacing.md,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: SIZES.spacing.md,
    paddingVertical: SIZES.spacing.sm,
    borderRadius: SIZES.radius.lg,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: SIZES.spacing.sm,
    fontSize: SIZES.md,
    color: COLORS.text.primary,
  },
  filtersContainer: {
    paddingHorizontal: SIZES.spacing.md,
    marginBottom: SIZES.spacing.md,
  },
  filterButton: {
    paddingHorizontal: SIZES.spacing.md,
    paddingVertical: SIZES.spacing.sm,
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius.round,
    marginRight: SIZES.spacing.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterText: {
    fontSize: SIZES.sm,
    color: COLORS.text.secondary,
  },
  filterTextActive: {
    color: COLORS.surface,
    fontWeight: 'bold',
  },
  roomsList: {
    flex: 1,
  },
  roomsContainer: {
    padding: SIZES.spacing.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.spacing.xl,
  },
  roomCard: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius.lg,
    marginBottom: SIZES.spacing.md,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  roomImage: {
    width: '100%',
    height: 200,
  },
  roomInfo: {
    padding: SIZES.spacing.md,
  },
  roomName: {
    fontSize: SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: SIZES.spacing.xs,
  },
  roomDescription: {
    fontSize: SIZES.sm,
    color: COLORS.text.secondary,
    marginBottom: SIZES.spacing.sm,
  },
  amenitiesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.spacing.md,
  },
  amenityTag: {
    backgroundColor: COLORS.primary + '20',
    paddingHorizontal: SIZES.spacing.sm,
    paddingVertical: SIZES.spacing.xs,
    borderRadius: SIZES.radius.sm,
    marginRight: SIZES.spacing.xs,
  },
  amenityText: {
    fontSize: SIZES.xs,
    color: COLORS.primary,
  },
  moreAmenities: {
    fontSize: SIZES.xs,
    color: COLORS.text.secondary,
    marginLeft: SIZES.spacing.xs,
  },
  roomFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    fontSize: SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.secondary,
  },
  priceUnit: {
    fontSize: SIZES.sm,
    color: COLORS.text.secondary,
    marginLeft: SIZES.spacing.xs,
  },
  guestInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  guestText: {
    fontSize: SIZES.sm,
    color: COLORS.text.secondary,
    marginLeft: SIZES.spacing.xs,
  },
});

export default HotelBookingScreen;