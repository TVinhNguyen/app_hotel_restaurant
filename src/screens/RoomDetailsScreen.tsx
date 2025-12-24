import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants';
import { RootStackParamList, RoomType } from '../types';
import { roomTypeService } from '../services/roomTypeService';

const { width } = Dimensions.get('window');

type RoomDetailsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'RoomDetails'>;
type RoomDetailsScreenRouteProp = RouteProp<RootStackParamList, 'RoomDetails'>;

interface Review {
  id: string;
  userName: string;
  userAvatar: string;
  rating: number;
  comment: string;
  date: string;
}

// Map amenity names to icons
const getAmenityIcon = (name: string): keyof typeof Ionicons.glyphMap => {
  const iconMap: Record<string, keyof typeof Ionicons.glyphMap> = {
    'wifi': 'wifi',
    'wi-fi': 'wifi',
    'internet': 'wifi',
    'ac': 'snow',
    'air conditioning': 'snow',
    'tv': 'tv',
    'television': 'tv',
    'mini bar': 'wine',
    'minibar': 'wine',
    'safe': 'lock-closed',
    'balcony': 'resize',
    'parking': 'car',
    'gym': 'fitness',
    'pool': 'water',
    'spa': 'flower',
    'restaurant': 'restaurant',
    'room service': 'fast-food',
    'laundry': 'shirt',
    'breakfast': 'cafe',
    'phone': 'call',
    'desk': 'briefcase',
    'bath': 'water',
    'shower': 'water',
    'coffee': 'cafe',
    'kettle': 'cafe',
  };
  
  const lowerName = name.toLowerCase();
  for (const [key, icon] of Object.entries(iconMap)) {
    if (lowerName.includes(key)) {
      return icon;
    }
  }
  return 'checkmark-circle';
};

const RoomDetailsScreen = () => {
  const navigation = useNavigation<RoomDetailsScreenNavigationProp>();
  const route = useRoute<RoomDetailsScreenRouteProp>();
  const { roomId, hotelName, hotelImage, rating, location } = route.params;

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [roomType, setRoomType] = useState<RoomType | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch room type data
  const fetchRoomTypeDetails = async () => {
    try {
      setError(null);
      console.log('Fetching room type with ID:', roomId);
      const response = await roomTypeService.getRoomTypeById(roomId);
      console.log('Room type response:', JSON.stringify(response, null, 2));
      
      // Check if response is wrapped in ApiResponse or direct data
      let roomData: RoomType | null = null;
      
      if (response && typeof response === 'object') {
        // If response has success property, it's wrapped
        if ('success' in response && response.success && response.data) {
          roomData = response.data;
        } 
        // If response has id property, it's direct room type data
        else if ('id' in response) {
          roomData = response as any as RoomType;
        }
      }
      
      if (roomData) {
        console.log('Setting room type:', roomData.name);
        
        // Map API response structure to our RoomType interface
        const mappedRoomType: RoomType = {
          id: roomData.id,
          property_id: (roomData as any).propertyId || roomData.property_id,
          name: roomData.name,
          description: roomData.description,
          maxAdults: roomData.maxAdults,
          maxChildren: roomData.maxChildren,
          base_price: parseFloat((roomData as any).basePrice || roomData.base_price || '0'),
          bed_type: (roomData as any).bedType || roomData.bed_type,
          // Map roomTypePhotos to photos array (similar to amenities mapping)
          photos: (roomData as any).roomTypePhotos?.map((rtp: any) => rtp.photo) || roomData.photos || [],
          rooms: roomData.rooms,
          property: (roomData as any).property,
          // Map roomTypeAmenities to amenities array
          amenities: (roomData as any).roomTypeAmenities?.map((rta: any) => rta.amenity) || roomData.amenities || []
        };
        
        console.log('Photos count:', mappedRoomType.photos?.length || 0);
        console.log('Amenities count:', mappedRoomType.amenities?.length || 0);
        console.log('Available rooms:', mappedRoomType.rooms?.length || 0);
        setRoomType(mappedRoomType);
      } else {
        console.error('No valid room data in response');
        setError('Failed to load room details');
      }
    } catch (err: any) {
      console.error('Error fetching room type:', err);
      console.error('Error response:', err.response?.data);
      setError(err.response?.data?.message || 'Failed to load room details');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRoomTypeDetails();
  }, [roomId]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchRoomTypeDetails();
  };

  // Get images from room type photos or use fallback
  const images = roomType?.photos && roomType.photos.length > 0
    ? roomType.photos.map(photo => photo.url)
    : hotelImage
    ? [hotelImage]
    : ['https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800'];

  const handleBookNow = () => {
    if (!roomType) return;
    
    navigation.navigate('BookingRequest', {
      roomId: roomId,
      roomName: roomType.name,
      price: roomType.base_price,
      hotelName: hotelName,
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Đang tải thông tin phòng...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !roomType) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
          </TouchableOpacity>
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={COLORS.error} />
          <Text style={styles.errorText}>{error || 'Không tìm thấy phòng'}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchRoomTypeDetails}>
            <Text style={styles.retryButtonText}>Thử lại</Text>
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
          style={styles.headerButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
          />
        }
      >
        {/* Image Carousel */}
        <FlatList
          data={images}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={(event) => {
            const index = Math.round(
              event.nativeEvent.contentOffset.x / width
            );
            setCurrentImageIndex(index);
          }}
          renderItem={({ item }) => (
            <Image source={{ uri: item }} style={styles.roomImage} />
          )}
          keyExtractor={(item, index) => index.toString()}
        />

        {/* Image Indicators */}
        <View style={styles.imageIndicators}>
          {images.map((_, index) => (
            <View
              key={index}
              style={[
                styles.indicator,
                index === currentImageIndex && styles.activeIndicator,
              ]}
            />
          ))}
        </View>

        {/* Room Info */}
        <View style={styles.infoContainer}>
          <View style={styles.titleRow}>
            <View style={styles.titleLeft}>
              <Text style={styles.roomTitle}>{roomType.name}</Text>
              <View style={styles.locationRow}>
                <Ionicons name="layers" size={14} color={COLORS.text.secondary} />
                <Text style={styles.locationText}>
                  Tầng {roomType.rooms && roomType.rooms.length > 0 
                    ? [...new Set(roomType.rooms.map(r => Number(r.floor)))].sort((a, b) => a - b).join(', ')
                    : 'N/A'}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.priceText}>
              {Math.round(roomType.base_price).toLocaleString('vi-VN')} ₫<Text style={styles.priceUnit}>/đêm</Text>
            </Text>
          </View>

          {/* Room Details */}
          <View style={styles.detailsRow}>
            <View style={styles.detailItem}>
              <Ionicons name="bed" size={18} color={COLORS.primary} />
              <Text style={styles.detailText}>{roomType.bed_type}</Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="people" size={18} color={COLORS.primary} />
              <Text style={styles.detailText}>
                {roomType.maxAdults} Người lớn
              </Text>
            </View>
            {roomType.maxChildren > 0 && (
              <View style={styles.detailItem}>
                <Ionicons name="person" size={18} color={COLORS.primary} />
                <Text style={styles.detailText}>
                  {roomType.maxChildren} Trẻ em
                </Text>
              </View>
            )}
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Mô tả</Text>
            <Text style={styles.descriptionText}>
              {roomType.description || 'Không có mô tả'}
            </Text>
          </View>

          {/* Property Information */}
          {roomType.property && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Thông tin khách sạn</Text>
              <View style={styles.propertyInfoCard}>
                <View style={styles.propertyInfoRow}>
                  <Ionicons name="business" size={18} color={COLORS.primary} />
                  <Text style={styles.propertyInfoText}>{roomType.property.name}</Text>
                </View>
                <View style={styles.propertyInfoRow}>
                  <Ionicons name="location" size={18} color={COLORS.primary} />
                  <Text style={styles.propertyInfoText}>
                    {[roomType.property.address, roomType.property.city, roomType.property.country].filter(Boolean).join(', ')}
                  </Text>
                </View>
                {roomType.property.phone && (
                  <View style={styles.propertyInfoRow}>
                    <Ionicons name="call" size={18} color={COLORS.primary} />
                    <Text style={styles.propertyInfoText}>{roomType.property.phone}</Text>
                  </View>
                )}
                {roomType.property.email && (
                  <View style={styles.propertyInfoRow}>
                    <Ionicons name="mail" size={18} color={COLORS.primary} />
                    <Text style={styles.propertyInfoText}>{roomType.property.email}</Text>
                  </View>
                )}
                {roomType.property.website && (
                  <View style={styles.propertyInfoRow}>
                    <Ionicons name="globe" size={18} color={COLORS.primary} />
                    <Text style={styles.propertyInfoText}>{roomType.property.website}</Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Room Views Available */}
          {roomType.rooms && roomType.rooms.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Loại view có sẵn</Text>
              <View style={styles.viewTypesContainer}>
                {(() => {
                  const viewTypes = [...new Set(roomType.rooms.map(r => (r as any).viewType))].filter(Boolean);
                  return viewTypes.map((viewType, index) => (
                    <View key={index} style={styles.viewTypeBadge}>
                      <Ionicons name="eye" size={16} color={COLORS.primary} />
                      <Text style={styles.viewTypeText}>{viewType}</Text>
                    </View>
                  ));
                })()}
              </View>
            </View>
          )}

          {/* Amenities */}
          {roomType.amenities && roomType.amenities.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Tiện ích</Text>
              </View>
              <View style={styles.amenitiesGrid}>
                {roomType.amenities.slice(0, 9).map((amenity) => (
                  <View key={amenity.id} style={styles.amenityItem}>
                    <View style={styles.amenityIcon}>
                      <Ionicons name={getAmenityIcon(amenity.name)} size={20} color={COLORS.primary} />
                    </View>
                    <Text style={styles.amenityText}>{amenity.name}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom Button */}
      <View style={styles.footer}>
        <View style={styles.footerPrice}>
          <Text style={styles.footerPriceLabel}>Giá</Text>
          <Text style={styles.footerPriceValue}>
            {Math.round(roomType.base_price).toLocaleString('vi-VN')} ₫<Text style={styles.footerPriceUnit}>/đêm</Text>
          </Text>
        </View>
        <TouchableOpacity 
          style={styles.bookButton} 
          onPress={handleBookNow}
        >
          <Text style={styles.bookButtonText}>Đặt ngay</Text>
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
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.spacing.lg,
    zIndex: 10,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  roomImage: {
    width: width,
    height: 300,
    resizeMode: 'cover',
  },
  imageIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SIZES.spacing.md,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.border,
    marginHorizontal: 4,
  },
  activeIndicator: {
    backgroundColor: COLORS.primary,
    width: 24,
  },
  infoContainer: {
    paddingHorizontal: SIZES.spacing.lg,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SIZES.spacing.sm,
  },
  titleLeft: {
    flex: 1,
  },
  roomTitle: {
    fontSize: SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: SIZES.spacing.xs,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: SIZES.sm,
    color: COLORS.text.secondary,
    marginLeft: SIZES.spacing.xs,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.lightBlue,
    paddingHorizontal: SIZES.spacing.sm,
    paddingVertical: SIZES.spacing.xs,
    borderRadius: SIZES.radius.sm,
  },
  ratingText: {
    fontSize: SIZES.sm,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginLeft: SIZES.spacing.xs,
  },
  priceText: {
    fontSize: SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  priceUnit: {
    fontSize: SIZES.md,
    fontWeight: 'normal',
    color: COLORS.text.secondary,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SIZES.spacing.lg,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.spacing.lg,
    flexWrap: 'wrap',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SIZES.spacing.lg,
    marginBottom: SIZES.spacing.xs,
  },
  detailText: {
    fontSize: SIZES.sm,
    color: COLORS.text.secondary,
    marginLeft: SIZES.spacing.xs,
    fontWeight: '500',
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SIZES.spacing.xl,
  },
  errorText: {
    fontSize: SIZES.lg,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginTop: SIZES.spacing.md,
    marginBottom: SIZES.spacing.xl,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SIZES.spacing.xl,
    paddingVertical: SIZES.spacing.md,
    borderRadius: SIZES.radius.lg,
  },
  retryButtonText: {
    color: COLORS.surface,
    fontSize: SIZES.md,
    fontWeight: '600',
  },
  section: {
    marginBottom: SIZES.spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.spacing.md,
  },
  sectionTitle: {
    fontSize: SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: SIZES.spacing.md,
  },
  viewAllText: {
    fontSize: SIZES.sm,
    color: COLORS.primary,
    fontWeight: '600',
  },
  descriptionText: {
    fontSize: SIZES.md,
    color: COLORS.text.secondary,
    lineHeight: 22,
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -SIZES.spacing.xs,
  },
  amenityItem: {
    width: '33.33%',
    alignItems: 'center',
    marginBottom: SIZES.spacing.md,
  },
  amenityIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.lightBlue,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.spacing.xs,
  },
  amenityText: {
    fontSize: SIZES.sm,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
  propertyInfoCard: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius.lg,
    padding: SIZES.spacing.md,
  },
  propertyInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.spacing.md,
  },
  propertyInfoText: {
    fontSize: SIZES.sm,
    color: COLORS.text.primary,
    marginLeft: SIZES.spacing.sm,
    flex: 1,
  },
  viewTypesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SIZES.spacing.sm,
  },
  viewTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.lightBlue,
    paddingHorizontal: SIZES.spacing.md,
    paddingVertical: SIZES.spacing.sm,
    borderRadius: SIZES.radius.lg,
    gap: SIZES.spacing.xs,
  },
  viewTypeText: {
    fontSize: SIZES.sm,
    color: COLORS.primary,
    fontWeight: '600',
  },
  reviewCard: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius.lg,
    padding: SIZES.spacing.md,
    marginBottom: SIZES.spacing.md,
  },
  reviewHeader: {
    flexDirection: 'row',
    marginBottom: SIZES.spacing.sm,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  reviewHeaderInfo: {
    marginLeft: SIZES.spacing.md,
    flex: 1,
  },
  userName: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SIZES.spacing.xs,
  },
  reviewRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewDate: {
    fontSize: SIZES.xs,
    color: COLORS.text.secondary,
    marginLeft: SIZES.spacing.sm,
  },
  reviewComment: {
    fontSize: SIZES.sm,
    color: COLORS.text.secondary,
    lineHeight: 20,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIZES.spacing.lg,
    paddingVertical: SIZES.spacing.md,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  footerPrice: {
    flex: 1,
  },
  footerPriceLabel: {
    fontSize: SIZES.sm,
    color: COLORS.text.secondary,
    marginBottom: SIZES.spacing.xs,
  },
  footerPriceValue: {
    fontSize: SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  footerPriceUnit: {
    fontSize: SIZES.sm,
    fontWeight: 'normal',
    color: COLORS.text.secondary,
  },
  bookButton: {
    height: 50,
    paddingHorizontal: SIZES.spacing.xl,
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radius.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookButtonDisabled: {
    backgroundColor: COLORS.text.secondary,
    opacity: 0.5,
  },
  bookButtonText: {
    fontSize: SIZES.md,
    fontWeight: 'bold',
    color: COLORS.surface,
  },
});

export default RoomDetailsScreen;
