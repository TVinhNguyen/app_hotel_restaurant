import React, { useState } from 'react';
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
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants';
import { RootStackParamList } from '../types';

const { width } = Dimensions.get('window');

type RoomDetailsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'RoomDetails'>;
type RoomDetailsScreenRouteProp = RouteProp<RootStackParamList, 'RoomDetails'>;

interface Amenity {
  id: string;
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
}

interface Review {
  id: string;
  userName: string;
  userAvatar: string;
  rating: number;
  comment: string;
  date: string;
}

const RoomDetailsScreen = () => {
  const navigation = useNavigation<RoomDetailsScreenNavigationProp>();
  const route = useRoute<RoomDetailsScreenRouteProp>();
  const { roomId, hotelName, hotelImage, rating, location } = route.params;

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  // Mock data
  const images = [
    'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800',
    'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800',
    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800',
  ];

  const amenities: Amenity[] = [
    { id: '1', name: 'WiFi', icon: 'wifi' },
    { id: '2', name: 'AC', icon: 'snow' },
    { id: '3', name: 'TV', icon: 'tv' },
    { id: '4', name: 'Mini Bar', icon: 'wine' },
    { id: '5', name: 'Safe', icon: 'lock-closed' },
    { id: '6', name: 'Balcony', icon: 'resize' },
  ];

  const reviews: Review[] = [
    {
      id: '1',
      userName: 'John Doe',
      userAvatar: 'https://i.pravatar.cc/150?img=1',
      rating: 5,
      comment: 'Amazing room with great view! Highly recommend.',
      date: '2 days ago',
    },
    {
      id: '2',
      userName: 'Sarah Smith',
      userAvatar: 'https://i.pravatar.cc/150?img=2',
      rating: 4,
      comment: 'Very comfortable and clean. Great service.',
      date: '1 week ago',
    },
  ];

  const handleBookNow = () => {
    navigation.navigate('BookingRequest', {
      roomId: roomId,
      roomName: hotelName || 'Deluxe Room',
      price: 120,
      hotelName: hotelName,
    });
  };

  const handleViewAllFacilities = () => {
    navigation.navigate('AllFacilities', {
      hotelId: roomId,
    });
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
        contentContainerStyle={styles.scrollContent}
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
              <Text style={styles.roomTitle}>{hotelName || 'Deluxe Room'}</Text>
              <View style={styles.locationRow}>
                <Ionicons name="location" size={14} color={COLORS.text.secondary} />
                <Text style={styles.locationText}>
                  {location || 'Downtown, City Center'}
                </Text>
              </View>
            </View>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={16} color="#FFB800" />
              <Text style={styles.ratingText}>{rating || 4.8}</Text>
            </View>
          </View>

          <Text style={styles.priceText}>
            $120<Text style={styles.priceUnit}>/night</Text>
          </Text>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.descriptionText}>
              Experience luxury in our spacious deluxe room featuring modern amenities,
              elegant decor, and stunning city views. Perfect for both business and
              leisure travelers.
            </Text>
          </View>

          {/* Amenities */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Amenities</Text>
              <TouchableOpacity onPress={handleViewAllFacilities}>
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.amenitiesGrid}>
              {amenities.slice(0, 6).map((amenity) => (
                <View key={amenity.id} style={styles.amenityItem}>
                  <View style={styles.amenityIcon}>
                    <Ionicons name={amenity.icon} size={20} color={COLORS.primary} />
                  </View>
                  <Text style={styles.amenityText}>{amenity.name}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Reviews */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Reviews</Text>
            {reviews.map((review) => (
              <View key={review.id} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <Image
                    source={{ uri: review.userAvatar }}
                    style={styles.userAvatar}
                  />
                  <View style={styles.reviewHeaderInfo}>
                    <Text style={styles.userName}>{review.userName}</Text>
                    <View style={styles.reviewRating}>
                      {[...Array(5)].map((_, index) => (
                        <Ionicons
                          key={index}
                          name="star"
                          size={12}
                          color={index < review.rating ? '#FFB800' : COLORS.border}
                        />
                      ))}
                      <Text style={styles.reviewDate}>{review.date}</Text>
                    </View>
                  </View>
                </View>
                <Text style={styles.reviewComment}>{review.comment}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Bottom Button */}
      <View style={styles.footer}>
        <View style={styles.footerPrice}>
          <Text style={styles.footerPriceLabel}>Price</Text>
          <Text style={styles.footerPriceValue}>
            $120<Text style={styles.footerPriceUnit}>/night</Text>
          </Text>
        </View>
        <TouchableOpacity style={styles.bookButton} onPress={handleBookNow}>
          <Text style={styles.bookButtonText}>Book Now</Text>
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
    marginBottom: SIZES.spacing.lg,
  },
  priceUnit: {
    fontSize: SIZES.md,
    fontWeight: 'normal',
    color: COLORS.text.secondary,
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
  bookButtonText: {
    fontSize: SIZES.md,
    fontWeight: 'bold',
    color: COLORS.surface,
  },
});

export default RoomDetailsScreen;
