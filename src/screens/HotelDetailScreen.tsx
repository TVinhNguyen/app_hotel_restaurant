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
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants';
import { RootStackParamList } from '../types';
import { roomTypeService } from '../services/roomTypeService';

const { width } = Dimensions.get('window');

type HotelDetailScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'HotelDetail'>;
type HotelDetailScreenRouteProp = RouteProp<RootStackParamList, 'HotelDetail'>;

const HotelDetailScreen = () => {
  const navigation = useNavigation<HotelDetailScreenNavigationProp>();
  const route = useRoute<HotelDetailScreenRouteProp>();
  const { hotelId, hotelName, hotelImage, rating, location } = route.params;

  const [roomTypes, setRoomTypes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    fetchRoomTypes();
  }, []);

  const fetchRoomTypes = async () => {
    try {
      setIsLoading(true);
      const response = await roomTypeService.getRoomTypes();
      
      if (response && response.data) {
        // Filter room types for this hotel
        const hotelRoomTypes = response.data.filter(
          (rt: any) => rt.propertyId === hotelId
        );
        setRoomTypes(hotelRoomTypes);
      }
    } catch (error) {
      console.error('Error fetching room types:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (price: string | number) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return `$${numPrice.toFixed(0)}`;
  };

  const renderRoomTypeCard = ({ item }: { item: any }) => {
    const firstPhoto = item.photos && item.photos.length > 0 
      ? item.photos[0].url 
      : 'https://via.placeholder.com/300x200';
    const availableRooms = item.rooms?.filter((r: any) => r.operationalStatus === 'available').length || 0;

    return (
      <TouchableOpacity
        style={styles.roomTypeCard}
        onPress={() => navigation.navigate('RoomDetails', {
          roomId: item.id,
          hotelName: hotelName,
          hotelImage: firstPhoto,
          rating: rating,
          location: location,
        })}
      >
        <Image source={{ uri: firstPhoto }} style={styles.roomTypeImage} />
        <View style={styles.roomTypeInfo}>
          <View style={styles.roomTypeHeader}>
            <Text style={styles.roomTypeName}>{item.name}</Text>
            <Text style={styles.roomTypePrice}>
              {formatPrice(item.basePrice)}
              <Text style={styles.priceUnit}>/night</Text>
            </Text>
          </View>
          
          <Text style={styles.roomTypeDescription} numberOfLines={2}>
            {item.description}
          </Text>

          <View style={styles.roomTypeDetails}>
            <View style={styles.detailItem}>
              <Ionicons name="people" size={16} color={COLORS.text.secondary} />
              <Text style={styles.detailText}>
                {item.maxAdults} Adults, {item.maxChildren} Children
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="bed" size={16} color={COLORS.text.secondary} />
              <Text style={styles.detailText}>{item.bedType}</Text>
            </View>
          </View>

          <View style={styles.roomTypeFooter}>
            <Text style={styles.availableRooms}>
              {availableRooms > 0 
                ? `${availableRooms} rooms available` 
                : 'No rooms available'}
            </Text>
            <TouchableOpacity style={styles.viewDetailsButton}>
              <Text style={styles.viewDetailsText}>View Details</Text>
              <Ionicons name="chevron-forward" size={16} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

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
        <Text style={styles.headerTitle}>Hotel Details</Text>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => setIsFavorite(!isFavorite)}
        >
          <Ionicons
            name={isFavorite ? 'heart' : 'heart-outline'}
            size={24}
            color={isFavorite ? COLORS.error : COLORS.text.primary}
          />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Hotel Image */}
        <Image source={{ uri: hotelImage }} style={styles.hotelImage} />

        {/* Hotel Info */}
        <View style={styles.hotelInfoContainer}>
          <View style={styles.hotelHeader}>
            <View style={styles.hotelTitleSection}>
              <Text style={styles.hotelName}>{hotelName}</Text>
              <View style={styles.locationRow}>
                <Ionicons name="location" size={16} color={COLORS.text.secondary} />
                <Text style={styles.locationText}>{location}</Text>
              </View>
            </View>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={18} color="#FFB800" />
              <Text style={styles.ratingText}>{rating}</Text>
            </View>
          </View>

          {/* Room Types Section */}
          <View style={styles.roomTypesSection}>
            <Text style={styles.sectionTitle}>Available Room Types</Text>
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.loadingText}>Loading rooms...</Text>
              </View>
            ) : roomTypes.length > 0 ? (
              <FlatList
                data={roomTypes}
                renderItem={renderRoomTypeCard}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                contentContainerStyle={styles.roomTypesList}
              />
            ) : (
              <View style={styles.emptyContainer}>
                <Ionicons name="bed-outline" size={64} color={COLORS.text.disabled} />
                <Text style={styles.emptyText}>No rooms available</Text>
                <Text style={styles.emptySubtext}>
                  This hotel doesn't have any rooms at the moment
                </Text>
              </View>
            )}
          </View>
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
    paddingVertical: SIZES.spacing.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.background,
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
  hotelImage: {
    width: width,
    height: 250,
    resizeMode: 'cover',
  },
  hotelInfoContainer: {
    padding: SIZES.spacing.lg,
  },
  hotelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SIZES.spacing.lg,
  },
  hotelTitleSection: {
    flex: 1,
    marginRight: SIZES.spacing.md,
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
  },
  locationText: {
    fontSize: SIZES.sm,
    color: COLORS.text.secondary,
    marginLeft: SIZES.spacing.xs,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight + '20',
    paddingHorizontal: SIZES.spacing.sm,
    paddingVertical: SIZES.spacing.xs,
    borderRadius: SIZES.radius.md,
  },
  ratingText: {
    fontSize: SIZES.md,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginLeft: SIZES.spacing.xs,
  },
  roomTypesSection: {
    marginTop: SIZES.spacing.md,
  },
  sectionTitle: {
    fontSize: SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: SIZES.spacing.md,
  },
  roomTypesList: {
    gap: SIZES.spacing.md,
  },
  roomTypeCard: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius.lg,
    overflow: 'hidden',
    marginBottom: SIZES.spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  roomTypeImage: {
    width: '100%',
    height: 180,
    resizeMode: 'cover',
  },
  roomTypeInfo: {
    padding: SIZES.spacing.md,
  },
  roomTypeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SIZES.spacing.sm,
  },
  roomTypeName: {
    fontSize: SIZES.md,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    flex: 1,
  },
  roomTypePrice: {
    fontSize: SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  priceUnit: {
    fontSize: SIZES.sm,
    fontWeight: 'normal',
    color: COLORS.text.secondary,
  },
  roomTypeDescription: {
    fontSize: SIZES.sm,
    color: COLORS.text.secondary,
    marginBottom: SIZES.spacing.sm,
    lineHeight: 20,
  },
  roomTypeDetails: {
    gap: SIZES.spacing.xs,
    marginBottom: SIZES.spacing.sm,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: SIZES.sm,
    color: COLORS.text.secondary,
    marginLeft: SIZES.spacing.xs,
  },
  roomTypeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SIZES.spacing.sm,
    paddingTop: SIZES.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
  },
  availableRooms: {
    fontSize: SIZES.sm,
    color: COLORS.success,
    fontWeight: '500',
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewDetailsText: {
    fontSize: SIZES.sm,
    color: COLORS.primary,
    fontWeight: '600',
    marginRight: SIZES.spacing.xs,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: SIZES.spacing.xxl,
  },
  loadingText: {
    fontSize: SIZES.md,
    color: COLORS.text.secondary,
    marginTop: SIZES.spacing.md,
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

export default HotelDetailScreen;
