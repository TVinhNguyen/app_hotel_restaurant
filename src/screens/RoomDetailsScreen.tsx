import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants';
import type { RootStackParamList } from '../types';

type RoomDetailsNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const { width } = Dimensions.get('window');

const RoomDetailsScreen = () => {
  const navigation = useNavigation<RoomDetailsNavigationProp>();
  const route = useRoute();
  const { roomId } = route.params as { roomId: string };
  
  const [loading, setLoading] = useState(true);

  // Mock hotel data based on the image
  const hotelData = {
    id: roomId,
    name: 'The Aston Vill Hotel',
    location: 'Veum Point, Michikoton',
    rating: 4.6,
    price: 120,
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop',
    description: 'The ideal place for those looking for a luxurious and tranquil holiday experience with stunning sea views.....',
    facilities: [
      { icon: 'snow', name: 'Ac' },
      { icon: 'restaurant', name: 'Restaurant' },
      { icon: 'water', name: 'Swimming Pool' },
      { icon: 'time', name: '24-Hours Front Desk' },
    ],
    reviews: [
      {
        id: '1',
        name: 'Kim Borrdy',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b593?w=50&h=50&fit=crop&crop=face',
        rating: 4.5,
        comment: 'Amazing! The room is good than the picture. Thanks for amazing experience!',
        date: '2024-10-01',
      },
      {
        id: '2',
        name: 'Mirai Kamazuki',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&crop=face',
        rating: 5.0,
        comment: 'The service is on point, and I really like the facilities. Good job!',
        date: '2024-09-28',
      },
    ],
    recommendations: [
      {
        id: '1',
        name: 'Lumière Palace',
        location: 'Las Vegas, NV',
        rating: 4.4,
        reviewCount: 532,
        price: 210,
        originalPrice: 345,
        image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=300&h=200&fit=crop',
      },
      {
        id: '2',
        name: 'Ocean Paradise Resort',
        location: 'Miami, FL',
        rating: 4.7,
        reviewCount: 298,
        price: 180,
        originalPrice: 250,
        image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=300&h=200&fit=crop',
      },
    ],
  };

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, [roomId]);

  const handleBookingNow = () => {
    navigation.navigate('BookingRequest', { 
      hotelId: hotelData.id, 
      hotelName: hotelData.name, 
      price: hotelData.price 
    });
  };

  const handleOpenMap = () => {
    console.log('Open map for location:', hotelData.location);
  };

  const handleSeeAll = () => {
    navigation.navigate('AllFacilities', { hotelId: hotelData.id });
  };

  const handleReadMore = () => {
    console.log('Read more description');
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>Loading...</Text>
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
          <Ionicons name="arrow-back" size={24} color={COLORS.surface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detail</Text>
        <TouchableOpacity style={styles.headerButton}>
          <Ionicons name="ellipsis-vertical" size={24} color={COLORS.surface} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hero Image */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: hotelData.image }} style={styles.heroImage} />
        </View>

        {/* Hotel Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.hotelHeader}>
            <View style={styles.hotelMainInfo}>
              <Text style={styles.hotelName}>{hotelData.name}</Text>
              <View style={styles.locationContainer}>
                <Ionicons name="location" size={16} color={COLORS.primary} />
                <Text style={styles.locationText}>{hotelData.location}</Text>
                <View style={styles.ratingContainer}>
                  <Ionicons name="star" size={16} color={COLORS.warning} />
                  <Text style={styles.ratingText}>{hotelData.rating}</Text>
                </View>
              </View>
            </View>
            <TouchableOpacity style={styles.favoriteButton}>
              <Ionicons name="heart-outline" size={24} color={COLORS.primary} />
            </TouchableOpacity>
          </View>

          {/* Common Facilities */}
          <View style={styles.facilitiesSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Common Facilities</Text>
              <TouchableOpacity onPress={handleSeeAll}>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.facilitiesGrid}>
              {hotelData.facilities.map((facility, index) => (
                <View key={index} style={styles.facilityItem}>
                  <View style={styles.facilityIcon}>
                    <Ionicons name={facility.icon as any} size={24} color={COLORS.primary} />
                  </View>
                  <Text style={styles.facilityText}>{facility.name}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Description */}
          <View style={styles.descriptionSection}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.descriptionText}>
              {hotelData.description}
              <TouchableOpacity onPress={handleReadMore}>
                <Text style={styles.readMoreText}> Read More</Text>
              </TouchableOpacity>
            </Text>
          </View>

          {/* Location */}
          <View style={styles.locationSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Location</Text>
              <TouchableOpacity onPress={handleOpenMap}>
                <Text style={styles.openMapText}>Open Map</Text>
              </TouchableOpacity>
            </View>
            
            {/* Address */}
            <View style={styles.addressContainer}>
              <Ionicons name="location" size={16} color={COLORS.primary} />
              <Text style={styles.addressText}>9175 Chestnut Street Rome, NY 13440</Text>
            </View>
            
            {/* Mock Map */}
            <TouchableOpacity style={styles.mapContainer} onPress={handleOpenMap}>
              <Image 
                source={{ uri: 'https://via.placeholder.com/350x120/E0E0E0/666666?text=Map+Location' }}
                style={styles.mapImage}
              />
              <View style={styles.mapOverlay}>
                <Ionicons name="location" size={20} color={COLORS.primary} />
              </View>
            </TouchableOpacity>
          </View>

          {/* Reviews Section */}
          <View style={styles.reviewsSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Reviews</Text>
              <TouchableOpacity>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            
            {hotelData.reviews.map((review) => (
              <View key={review.id} style={styles.reviewItem}>
                <View style={styles.reviewHeader}>
                  <Image source={{ uri: review.avatar }} style={styles.reviewerAvatar} />
                  <View style={styles.reviewerInfo}>
                    <Text style={styles.reviewerName}>{review.name}</Text>
                    <View style={styles.reviewRating}>
                      <Ionicons name="star" size={14} color={COLORS.warning} />
                      <Text style={styles.reviewRatingText}>{review.rating}</Text>
                    </View>
                  </View>
                </View>
                <Text style={styles.reviewComment}>{review.comment}</Text>
              </View>
            ))}
          </View>

          {/* Recommendation Section */}
          <View style={styles.recommendationSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recommendation</Text>
              <TouchableOpacity>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {hotelData.recommendations.map((recommendation) => (
                <TouchableOpacity key={recommendation.id} style={styles.recommendationCard}>
                  <Image source={{ uri: recommendation.image }} style={styles.recommendationImage} />
                  <View style={styles.recommendationInfo}>
                    <Text style={styles.recommendationName}>{recommendation.name}</Text>
                    <View style={styles.recommendationLocation}>
                      <Ionicons name="location" size={12} color={COLORS.text.secondary} />
                      <Text style={styles.recommendationLocationText}>{recommendation.location}</Text>
                    </View>
                    <View style={styles.recommendationRating}>
                      <Ionicons name="star" size={12} color={COLORS.warning} />
                      <Text style={styles.recommendationRatingText}>
                        {recommendation.rating} ({recommendation.reviewCount})
                      </Text>
                    </View>
                    <View style={styles.recommendationPricing}>
                      <Text style={styles.recommendationPrice}>${recommendation.price}</Text>
                      <Text style={styles.recommendationOriginalPrice}>${recommendation.originalPrice}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Booking Section */}
      <View style={styles.bottomSection}>
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>Price</Text>
          <Text style={styles.priceValue}>${hotelData.price}.00</Text>
        </View>
        <TouchableOpacity style={styles.bookingButton} onPress={handleBookingNow}>
          <Text style={styles.bookingButtonText}>Booking Now</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.spacing.lg,
    paddingTop: 50,
    paddingBottom: SIZES.spacing.md,
    zIndex: 10,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.surface,
  },
  content: {
    flex: 1,
  },
  imageContainer: {
    height: 300,
    width: '100%',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  infoCard: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
    paddingTop: SIZES.spacing.lg,
    paddingHorizontal: SIZES.spacing.lg,
    minHeight: '70%',
  },
  hotelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SIZES.spacing.lg,
  },
  hotelMainInfo: {
    flex: 1,
  },
  hotelName: {
    fontSize: SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: SIZES.spacing.sm,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.spacing.sm,
  },
  locationText: {
    fontSize: SIZES.sm,
    color: COLORS.text.secondary,
    flex: 1,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.spacing.xs,
  },
  ratingText: {
    fontSize: SIZES.sm,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  favoriteButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  facilitiesSection: {
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
  },
  seeAllText: {
    fontSize: SIZES.sm,
    color: COLORS.primary,
    fontWeight: '500',
  },
  facilitiesGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  facilityItem: {
    alignItems: 'center',
    flex: 1,
  },
  facilityIcon: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.spacing.sm,
  },
  facilityText: {
    fontSize: SIZES.xs,
    color: COLORS.text.primary,
    textAlign: 'center',
    lineHeight: 16,
  },
  descriptionSection: {
    marginBottom: SIZES.spacing.xl,
  },
  descriptionText: {
    fontSize: SIZES.sm,
    color: COLORS.text.secondary,
    lineHeight: 20,
    marginTop: SIZES.spacing.sm,
  },
  readMoreText: {
    fontSize: SIZES.sm,
    color: COLORS.primary,
    fontWeight: '500',
  },
  locationSection: {
    marginBottom: SIZES.spacing.xl,
  },
  openMapText: {
    fontSize: SIZES.sm,
    color: COLORS.primary,
    fontWeight: '500',
  },
  mapContainer: {
    marginTop: SIZES.spacing.md,
    borderRadius: SIZES.radius.lg,
    overflow: 'hidden',
    position: 'relative',
  },
  mapImage: {
    width: '100%',
    height: 120,
  },
  mapOverlay: {
    position: 'absolute',
    top: 10,
    left: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SIZES.spacing.sm,
  },
  addressText: {
    fontSize: SIZES.sm,
    color: COLORS.text.secondary,
    marginLeft: SIZES.spacing.sm,
  },
  reviewsSection: {
    marginBottom: SIZES.spacing.xl,
  },
  reviewItem: {
    marginBottom: SIZES.spacing.md,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.spacing.sm,
  },
  reviewerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: SIZES.spacing.sm,
  },
  reviewerInfo: {
    flex: 1,
  },
  reviewerName: {
    fontSize: SIZES.sm,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  reviewRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.spacing.xs,
  },
  reviewRatingText: {
    fontSize: SIZES.sm,
    color: COLORS.text.secondary,
  },
  reviewComment: {
    fontSize: SIZES.sm,
    color: COLORS.text.secondary,
  },
  recommendationSection: {
    marginBottom: SIZES.spacing.xl,
  },
  recommendationCard: {
    width: 200,
    marginRight: SIZES.spacing.md,
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius.md,
    overflow: 'hidden',
  },
  recommendationImage: {
    width: '100%',
    height: 120,
  },
  recommendationInfo: {
    padding: SIZES.spacing.md,
  },
  recommendationName: {
    fontSize: SIZES.md,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: SIZES.spacing.sm,
  },
  recommendationLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.spacing.sm,
  },
  recommendationLocationText: {
    fontSize: SIZES.sm,
    color: COLORS.text.secondary,
    marginLeft: SIZES.spacing.xs,
  },
  recommendationRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.spacing.sm,
  },
  recommendationRatingText: {
    fontSize: SIZES.sm,
    color: COLORS.text.secondary,
    marginLeft: SIZES.spacing.xs,
  },
  recommendationPricing: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recommendationPrice: {
    fontSize: SIZES.md,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginRight: SIZES.spacing.sm,
  },
  recommendationOriginalPrice: {
    fontSize: SIZES.sm,
    color: COLORS.text.secondary,
    textDecorationLine: 'line-through',
  },
  bottomSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIZES.spacing.lg,
    paddingVertical: SIZES.spacing.lg,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  priceContainer: {
    flex: 1,
  },
  priceLabel: {
    fontSize: SIZES.sm,
    color: COLORS.text.secondary,
    marginBottom: SIZES.spacing.xs,
  },
  priceValue: {
    fontSize: SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  bookingButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SIZES.spacing.xl,
    paddingVertical: SIZES.spacing.md,
    borderRadius: SIZES.radius.lg,
    minWidth: 150,
    alignItems: 'center',
  },
  bookingButtonText: {
    fontSize: SIZES.md,
    fontWeight: 'bold',
    color: COLORS.surface,
  },
});

export default RoomDetailsScreen;