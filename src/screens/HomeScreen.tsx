import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  FlatList,
  Dimensions,
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants';

const { width } = Dimensions.get('window');
const cardWidth = width * 0.7;

// Mock Map Component
const MockMapView = ({ children, style, onPress }: any) => (
  <TouchableOpacity style={[style, styles.mockMap]} onPress={onPress}>
    <Image 
      source={{ uri: 'https://via.placeholder.com/400x200/E0E0E0/666666?text=Map+View' }}
      style={style}
    />
    {children}
  </TouchableOpacity>
);

const MockMarker = ({ coordinate, title, pinColor }: any) => (
  <View style={[styles.marker, { backgroundColor: pinColor || COLORS.error }]}>
    <Ionicons name="location" size={16} color={COLORS.surface} />
  </View>
);

const HomeScreen = () => {
  const navigation = useNavigation();
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [isMapVisible, setIsMapVisible] = useState(false);

  // Mock user data
  const user = {
    name: 'Matr Kohler',
    location: 'San Diego, CA',
    avatar: 'https://via.placeholder.com/50x50/4CAF50/FFFFFF?text=MK',
  };

  // Mock popular hotels/villas data
  const popularPlaces = [
    {
      id: '1',
      name: 'The Horizon Retreat',
      location: 'Los Angeles, CA',
      price: 480,
      rating: 4.5,
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop',
      liked: true,
    },
    {
      id: '2',
      name: 'Opal Grove Inn',
      location: 'San Diego, CA',
      price: 190,
      rating: 4.5,
      image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400&h=300&fit=crop',
      liked: true,
    },
    {
      id: '3',
      name: 'Mountain Vista Resort',
      location: 'Big Sur, CA',
      price: 650,
      rating: 4.8,
      image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&h=300&fit=crop',
      liked: false,
    },
  ];

  // Mock recommended places
  const recommendations = [
    {
      id: '1',
      name: 'Serenity Sands',
      location: 'Honolulu, HI',
      price: 270,
      rating: 4.0,
      image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=300&h=200&fit=crop',
    },
    {
      id: '2',
      name: 'Ocean Breeze Villa',
      location: 'Malibu, CA',
      price: 420,
      rating: 4.3,
      image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=300&h=200&fit=crop',
    },
    {
      id: '3',
      name: 'Desert Oasis Resort',
      location: 'Phoenix, AZ',
      price: 180,
      rating: 4.1,
      image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=300&h=200&fit=crop',
    },
  ];

  // Mock nearby hotels with coordinates
  const nearbyHotels = [
    {
      id: '1',
      name: 'Grand Hotel Downtown',
      location: 'Downtown San Diego',
      price: 280,
      rating: 4.5,
      distance: '0.8 km',
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=300&h=200&fit=crop',
      coordinate: { latitude: 32.7157, longitude: -117.1611 },
    },
    {
      id: '2',
      name: 'Ocean View Resort',
      location: 'Mission Beach',
      price: 350,
      rating: 4.3,
      distance: '2.1 km',
      image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=300&h=200&fit=crop',
      coordinate: { latitude: 32.7767, longitude: -117.2533 },
    },
    {
      id: '3',
      name: 'Sunset Bay Hotel',
      location: 'Pacific Beach',
      price: 220,
      rating: 4.1,
      distance: '3.5 km',
      image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=300&h=200&fit=crop',
      coordinate: { latitude: 32.7941, longitude: -117.2507 },
    },
  ];

  const filterOptions = ['All', 'Villas', 'Hotels', 'Apartments'];

  const formatPrice = (price: number) => {
    return `$${price}`;
  };

  const renderPopularCard = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.popularCard}
      onPress={() => navigation.navigate('RoomDetails', { roomId: item.id })}
    >
      <View style={styles.cardImageContainer}>
        <Image source={{ uri: item.image }} style={styles.cardImage} />
        <TouchableOpacity style={styles.likeButton}>
          <Ionicons 
            name={item.liked ? 'heart' : 'heart-outline'} 
            size={20} 
            color={item.liked ? COLORS.error : COLORS.surface} 
          />
        </TouchableOpacity>
        <View style={styles.cardOverlay}>
          <Text style={styles.cardTitle}>{item.name}</Text>
          <View style={styles.cardLocation}>
            <Ionicons name="location" size={12} color={COLORS.surface} />
            <Text style={styles.cardLocationText}>{item.location}</Text>
          </View>
        </View>
        <View style={styles.cardFooter}>
          <View style={styles.priceContainer}>
            <Text style={styles.cardPrice}>{formatPrice(item.price)}</Text>
            <Text style={styles.cardPriceUnit}>/night</Text>
          </View>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={12} color={COLORS.warning} />
            <Text style={styles.ratingText}>{item.rating}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderRecommendationCard = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.recommendationCard}
      onPress={() => navigation.navigate('RoomDetails', { roomId: item.id })}
    >
      <Image source={{ uri: item.image }} style={styles.recommendationImage} />
      <View style={styles.recommendationInfo}>
        <View style={styles.recommendationHeader}>
          <Text style={styles.recommendationName}>{item.name}</Text>
          <View style={styles.recommendationRating}>
            <Ionicons name="star" size={14} color={COLORS.warning} />
            <Text style={styles.recommendationRatingText}>{item.rating}</Text>
          </View>
        </View>
        <View style={styles.recommendationLocation}>
          <Ionicons name="location" size={14} color={COLORS.text.secondary} />
          <Text style={styles.recommendationLocationText}>{item.location}</Text>
        </View>
        <View style={styles.recommendationPriceContainer}>
          <Text style={styles.recommendationPrice}>{formatPrice(item.price)}</Text>
          <Text style={styles.recommendationPriceUnit}>/night</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderNearbyHotelCard = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.nearbyHotelCard}
      onPress={() => navigation.navigate('RoomDetails', { roomId: item.id })}
    >
      <Image source={{ uri: item.image }} style={styles.nearbyHotelImage} />
      <View style={styles.nearbyHotelInfo}>
        <View style={styles.nearbyHotelHeader}>
          <Text style={styles.nearbyHotelName}>{item.name}</Text>
          <View style={styles.nearbyHotelRating}>
            <Ionicons name="star" size={12} color={COLORS.warning} />
            <Text style={styles.nearbyHotelRatingText}>{item.rating}</Text>
          </View>
        </View>
        <View style={styles.nearbyHotelLocation}>
          <Ionicons name="location" size={12} color={COLORS.text.secondary} />
          <Text style={styles.nearbyHotelLocationText}>{item.location}</Text>
          <Text style={styles.nearbyHotelDistance}>• {item.distance}</Text>
        </View>
        <View style={styles.nearbyHotelPriceContainer}>
          <Text style={styles.nearbyHotelPrice}>{formatPrice(item.price)}</Text>
          <Text style={styles.nearbyHotelPriceUnit}>/night</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.userInfo}>
            <Image source={{ uri: user.avatar }} style={styles.avatar} />
            <View style={styles.userDetails}>
              <Text style={styles.userName}>{user.name}</Text>
              <View style={styles.locationContainer}>
                <Ionicons name="location" size={12} color={COLORS.text.secondary} />
                <Text style={styles.userLocation}>{user.location}</Text>
              </View>
            </View>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerButton}>
              <Ionicons name="search" size={20} color={COLORS.text.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerButton}>
              <Ionicons name="notifications" size={20} color={COLORS.text.primary} />
              <View style={styles.notificationDot} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Nearby Hotels Cards */}
        <View style={styles.nearbyHotelsSection}>
          <FlatList
            data={nearbyHotels.slice(0, 2)}
            renderItem={renderNearbyHotelCard}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            contentContainerStyle={styles.nearbyHotelsList}
          />
        </View>

        {/* Hotels Near You with Mock Map */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Hotel Near You</Text>
            <TouchableOpacity onPress={() => setIsMapVisible(true)}>
              <Text style={styles.openMapButton}>Open Map</Text>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity 
            style={styles.mapContainer}
            onPress={() => setIsMapVisible(true)}
          >
            <MockMapView style={styles.map}>
              {/* Mock markers overlay */}
              <View style={styles.markersContainer}>
                <View style={[styles.marker, { backgroundColor: COLORS.primary, top: 60, left: 120 }]}>
                  <Ionicons name="location" size={16} color={COLORS.surface} />
                </View>
                <View style={[styles.marker, { backgroundColor: COLORS.secondary, top: 40, right: 80 }]}>
                  <Ionicons name="location" size={16} color={COLORS.surface} />
                </View>
                <View style={[styles.marker, { backgroundColor: COLORS.secondary, bottom: 50, left: 80 }]}>
                  <Ionicons name="location" size={16} color={COLORS.surface} />
                </View>
              </View>
            </MockMapView>
            <View style={styles.mapOverlay}>
              <Ionicons name="expand" size={20} color={COLORS.surface} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Most Popular Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Most Popular</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllButton}>See All</Text>
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={popularPlaces}
            renderItem={renderPopularCard}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.popularList}
            snapToInterval={cardWidth + SIZES.spacing.md}
            decelerationRate="fast"
          />
        </View>

        {/* Recommended Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recommended for you</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllButton}>See All</Text>
            </TouchableOpacity>
          </View>

          {/* Filter Tabs */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.filterContainer}
            contentContainerStyle={styles.filterContent}
          >
            {filterOptions.map((filter, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.filterTab,
                  selectedFilter === filter && styles.filterTabActive,
                ]}
                onPress={() => setSelectedFilter(filter)}
              >
                {filter === 'Villas' && (
                  <Ionicons 
                    name="home" 
                    size={16} 
                    color={selectedFilter === filter ? COLORS.surface : COLORS.text.secondary} 
                  />
                )}
                {filter === 'Hotels' && (
                  <Ionicons 
                    name="business" 
                    size={16} 
                    color={selectedFilter === filter ? COLORS.surface : COLORS.text.secondary} 
                  />
                )}
                {filter === 'Apartments' && (
                  <Ionicons 
                    name="layers" 
                    size={16} 
                    color={selectedFilter === filter ? COLORS.surface : COLORS.text.secondary} 
                  />
                )}
                <Text 
                  style={[
                    styles.filterTabText,
                    selectedFilter === filter && styles.filterTabTextActive,
                  ]}
                >
                  {filter}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Recommendations List */}
          <FlatList
            data={recommendations}
            renderItem={renderRecommendationCard}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            contentContainerStyle={styles.recommendationsList}
          />
        </View>
      </ScrollView>

      {/* Full Screen Map Modal */}
      <Modal
        visible={isMapVisible}
        animationType="slide"
        statusBarTranslucent={true}
      >
        <SafeAreaView style={styles.fullScreenMapContainer}>
          <View style={styles.mapHeader}>
            <TouchableOpacity
              style={styles.closeMapButton}
              onPress={() => setIsMapVisible(false)}
            >
              <Ionicons name="close" size={24} color={COLORS.text.primary} />
            </TouchableOpacity>
            <Text style={styles.mapTitle}>Hotels Near You</Text>
            <View style={{ width: 40 }} />
          </View>
          
          <View style={styles.fullScreenMap}>
            <MockMapView style={styles.fullScreenMap}>
              {/* Mock markers for full screen */}
              <View style={styles.markersContainer}>
                <TouchableOpacity style={[styles.marker, { backgroundColor: COLORS.primary, top: 100, left: 150 }]}>
                  <Ionicons name="location" size={20} color={COLORS.surface} />
                </TouchableOpacity>
                {nearbyHotels.map((hotel, index) => (
                  <TouchableOpacity 
                    key={hotel.id}
                    style={[styles.marker, { 
                      backgroundColor: COLORS.secondary, 
                      top: 120 + index * 80, 
                      left: 100 + index * 60 
                    }]}
                    onPress={() => {
                      setIsMapVisible(false);
                      navigation.navigate('RoomDetails', { roomId: hotel.id });
                    }}
                  >
                    <Ionicons name="location" size={20} color={COLORS.surface} />
                  </TouchableOpacity>
                ))}
              </View>
            </MockMapView>
          </View>
        </SafeAreaView>
      </Modal>
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
    padding: SIZES.spacing.lg,
    paddingTop: SIZES.spacing.md,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: SIZES.spacing.md,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: SIZES.spacing.xs,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userLocation: {
    fontSize: SIZES.sm,
    color: COLORS.text.secondary,
    marginLeft: SIZES.spacing.xs,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.spacing.sm,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  notificationDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.error,
  },
  nearbyHotelsSection: {
    paddingHorizontal: SIZES.spacing.lg,
    marginBottom: SIZES.spacing.lg,
  },
  nearbyHotelsList: {
    gap: SIZES.spacing.md,
  },
  nearbyHotelCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius.lg,
    padding: SIZES.spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  nearbyHotelImage: {
    width: 60,
    height: 60,
    borderRadius: SIZES.radius.md,
  },
  nearbyHotelInfo: {
    flex: 1,
    marginLeft: SIZES.spacing.sm,
  },
  nearbyHotelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SIZES.spacing.xs,
  },
  nearbyHotelName: {
    fontSize: SIZES.sm,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    flex: 1,
  },
  nearbyHotelRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.spacing.xs,
  },
  nearbyHotelRatingText: {
    fontSize: SIZES.xs,
    color: COLORS.text.primary,
    fontWeight: '500',
  },
  nearbyHotelLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.spacing.xs,
  },
  nearbyHotelLocationText: {
    fontSize: SIZES.xs,
    color: COLORS.text.secondary,
    marginLeft: SIZES.spacing.xs,
  },
  nearbyHotelDistance: {
    fontSize: SIZES.xs,
    color: COLORS.text.secondary,
    marginLeft: SIZES.spacing.xs,
  },
  nearbyHotelPriceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  nearbyHotelPrice: {
    fontSize: SIZES.sm,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  nearbyHotelPriceUnit: {
    fontSize: SIZES.xs,
    color: COLORS.text.secondary,
    marginLeft: SIZES.spacing.xs,
  },
  mockMap: {
    backgroundColor: '#E0E0E0',
    borderRadius: SIZES.radius.lg,
  },
  mapContainer: {
    height: 200,
    marginHorizontal: SIZES.spacing.lg,
    borderRadius: SIZES.radius.lg,
    overflow: 'hidden',
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  markersContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  marker: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  mapOverlay: {
    position: 'absolute',
    top: SIZES.spacing.sm,
    right: SIZES.spacing.sm,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenMapContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  mapHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SIZES.spacing.lg,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  closeMapButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapTitle: {
    fontSize: SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  fullScreenMap: {
    flex: 1,
  },
  section: {
    marginBottom: SIZES.spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.spacing.lg,
    marginBottom: SIZES.spacing.md,
  },
  sectionTitle: {
    fontSize: SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  seeAllButton: {
    fontSize: SIZES.sm,
    color: COLORS.primary,
    fontWeight: '500',
  },
  openMapButton: {
    fontSize: SIZES.sm,
    color: COLORS.primary,
    fontWeight: '500',
  },
  popularList: {
    paddingLeft: SIZES.spacing.lg,
  },
  popularCard: {
    width: cardWidth,
    marginRight: SIZES.spacing.md,
  },
  cardImageContainer: {
    position: 'relative',
    borderRadius: SIZES.radius.lg,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: 200,
  },
  likeButton: {
    position: 'absolute',
    top: SIZES.spacing.md,
    right: SIZES.spacing.md,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardOverlay: {
    position: 'absolute',
    bottom: 50,
    left: SIZES.spacing.md,
    right: SIZES.spacing.md,
  },
  cardTitle: {
    fontSize: SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.surface,
    marginBottom: SIZES.spacing.xs,
  },
  cardLocation: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardLocationText: {
    fontSize: SIZES.sm,
    color: COLORS.surface,
    marginLeft: SIZES.spacing.xs,
  },
  cardFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: SIZES.spacing.md,
    paddingVertical: SIZES.spacing.sm,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  cardPrice: {
    fontSize: SIZES.md,
    fontWeight: 'bold',
    color: COLORS.surface,
  },
  cardPriceUnit: {
    fontSize: SIZES.sm,
    color: COLORS.surface,
    opacity: 0.8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.spacing.xs,
  },
  ratingText: {
    fontSize: SIZES.sm,
    color: COLORS.surface,
    fontWeight: '500',
  },
  filterContainer: {
    marginBottom: SIZES.spacing.md,
  },
  filterContent: {
    paddingHorizontal: SIZES.spacing.lg,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIZES.spacing.md,
    paddingVertical: SIZES.spacing.sm,
    marginRight: SIZES.spacing.sm,
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius.lg,
    gap: SIZES.spacing.xs,
  },
  filterTabActive: {
    backgroundColor: COLORS.primary,
  },
  filterTabText: {
    fontSize: SIZES.sm,
    color: COLORS.text.secondary,
    fontWeight: '500',
  },
  filterTabTextActive: {
    color: COLORS.surface,
  },
  recommendationsList: {
    paddingHorizontal: SIZES.spacing.lg,
    gap: SIZES.spacing.md,
  },
  recommendationCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius.lg,
    padding: SIZES.spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  recommendationImage: {
    width: 80,
    height: 80,
    borderRadius: SIZES.radius.md,
  },
  recommendationInfo: {
    flex: 1,
    marginLeft: SIZES.spacing.md,
  },
  recommendationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SIZES.spacing.xs,
  },
  recommendationName: {
    fontSize: SIZES.md,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    flex: 1,
  },
  recommendationRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.spacing.xs,
  },
  recommendationRatingText: {
    fontSize: SIZES.sm,
    color: COLORS.text.primary,
    fontWeight: '500',
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
  recommendationPriceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  recommendationPrice: {
    fontSize: SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  recommendationPriceUnit: {
    fontSize: SIZES.sm,
    color: COLORS.text.secondary,
    marginLeft: SIZES.spacing.xs,
  },
});

export default HomeScreen;