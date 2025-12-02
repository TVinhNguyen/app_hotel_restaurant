import React, { useState, useEffect } from 'react';
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
  ActivityIndicator,
  StatusBar,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES, STORAGE_KEYS } from '../constants';
import { propertyService } from '../services/propertyService';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.75;
const SPACING = SIZES.spacing.lg;

const HomeScreen = () => {
  const navigation = useNavigation<any>();
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [isMapVisible, setIsMapVisible] = useState(false);
  const [properties, setProperties] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [userLocation, setUserLocation] = useState<string>('Đang xác định vị trí...');
  const [locationPermission, setLocationPermission] = useState<boolean>(false);
  const [mapRegion, setMapRegion] = useState({
    latitude: 21.0285, // Hanoi default
    longitude: 105.8542,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });

  useEffect(() => {
    fetchProperties();
    fetchUserData();
    fetchUserLocation();
  }, []);

  const fetchProperties = async () => {
    try {
      setIsLoading(true);
      const response = await propertyService.getProperties();
      if (response && Array.isArray(response)) {
        setProperties(response);
      } else if (response && response.data && Array.isArray(response.data)) {
        setProperties(response.data);
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserData = async () => {
    try {
      const storedUser = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
      if (storedUser) {
        setUserData(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const fetchUserLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setUserLocation('Không có quyền truy cập vị trí');
        return;
      }
      setLocationPermission(true);

      const location = await Location.getCurrentPositionAsync({});
      
      setMapRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });

      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (reverseGeocode && reverseGeocode.length > 0) {
        const address = reverseGeocode[0];
        const locationString = address.city || address.region || 'Vị trí không xác định';
        setUserLocation(locationString);
      } else {
        setUserLocation('Không thể xác định địa chỉ');
      }
    } catch (error) {
      console.error('Error fetching location:', error);
      setUserLocation('Lỗi lấy vị trí');
    }
  };

  const SAMPLE_IMAGES = [
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500',
    'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=500',
    'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=500',
    'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=500',
    'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=500',
    'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=500',
  ];

  const mapPropertyToUI = (property: any, index: number) => {
    let imageUrl = SAMPLE_IMAGES[index % SAMPLE_IMAGES.length];

    if (property.images && Array.isArray(property.images) && property.images.length > 0) {
      const firstImg = property.images[0];
      imageUrl = typeof firstImg === 'string' ? firstImg : (firstImg.url || imageUrl);
    }

    return {
      id: property.id,
      name: property.name,
      location: property.address || `${property.city || ''}, ${property.country || ''}`,
      price: property.price || 100,
      rating: property.rating || 4.5,
      image: imageUrl,
      liked: false,
      coordinate: {
        latitude: mapRegion.latitude + (Math.random() - 0.5) * 0.04,
        longitude: mapRegion.longitude + (Math.random() - 0.5) * 0.04,
      },
      distance: `${(Math.random() * 5 + 0.5).toFixed(1)} km`,
      phone: property.phone,
      email: property.email,
      website: property.website,
      type: property.propertyType || property.property_type,
    };
  };

  const uiProperties = properties.map((prop, index) => mapPropertyToUI(prop, index));
  const popularPlaces = uiProperties.length > 0 ? uiProperties : [];
  const nearbyHotels = uiProperties.length > 0 ? uiProperties.slice(0, 3) : [];
  
  // Filter logic could be improved here
  const recommendations = uiProperties.length > 0 ? uiProperties.slice(0, 5) : [];

  const filterOptions = [
    { label: 'All', icon: 'grid-outline' },
    { label: 'Villas', icon: 'home-outline' },
    { label: 'Hotels', icon: 'business-outline' },
    { label: 'Apartments', icon: 'layers-outline' },
  ];

  const formatPrice = (price: number) => `$${price}`;

  // Helper function for Avatar URL
  const getAvatarUrl = () => {
    if (userData?.avatar) return userData.avatar;
    if (userData?.name) {
      const name = encodeURIComponent(userData.name);
      return `https://ui-avatars.com/api/?name=${name}&background=random&color=fff&size=128`;
    }
    return 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400&q=80';
  };

  const renderPopularCard = ({ item }: { item: any }) => (
    <TouchableOpacity
      activeOpacity={0.9}
      style={styles.popularCard}
      onPress={() => navigation.navigate('HotelDetail', { 
        hotelId: item.id,
        hotelName: item.name,
        hotelImage: item.image,
        rating: item.rating,
        location: item.location,
      })}
    >
      <View style={styles.cardImageContainer}>
        <Image source={{ uri: item.image }} style={styles.cardImage} />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)']}
          style={styles.cardGradient}
        />
        <TouchableOpacity style={styles.likeButton}>
          <Ionicons
            name={item.liked ? 'heart' : 'heart-outline'}
            size={20}
            color={item.liked ? COLORS.error : COLORS.surface}
          />
        </TouchableOpacity>
        
        <View style={styles.cardContent}>
          <View style={styles.cardRating}>
            <Ionicons name="star" size={14} color={COLORS.warning} />
            <Text style={styles.cardRatingText}>{item.rating}</Text>
          </View>
          <Text style={styles.cardTitle} numberOfLines={1}>{item.name}</Text>
          <View style={styles.cardLocation}>
            <Ionicons name="location-outline" size={14} color={COLORS.surface} />
            <Text style={styles.cardLocationText} numberOfLines={1}>{item.location}</Text>
          </View>
          <View style={styles.priceTag}>
            <Text style={styles.cardPrice}>{formatPrice(item.price)}</Text>
            <Text style={styles.cardPriceUnit}>/night</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderRecommendationCard = ({ item }: { item: any }) => (
    <TouchableOpacity
      activeOpacity={0.8}
      style={styles.recommendationCard}
      onPress={() => navigation.navigate('HotelDetail', { 
        hotelId: item.id,
        hotelName: item.name,
        hotelImage: item.image,
        rating: item.rating,
        location: item.location,
      })}
    >
      <Image source={{ uri: item.image }} style={styles.recommendationImage} />
      <View style={styles.recommendationInfo}>
        <View>
          <Text style={styles.recommendationName} numberOfLines={1}>{item.name}</Text>
          <View style={styles.recommendationLocation}>
            <Ionicons name="location-outline" size={14} color={COLORS.text.secondary} />
            <Text style={styles.recommendationLocationText} numberOfLines={1}>{item.location}</Text>
          </View>
        </View>
        
        <View style={styles.recommendationBottom}>
          <View style={styles.ratingBadge}>
            <Ionicons name="star" size={12} color={COLORS.warning} />
            <Text style={styles.ratingBadgeText}>{item.rating}</Text>
          </View>
          <View style={styles.priceContainer}>
            <Text style={styles.recommendationPrice}>{formatPrice(item.price)}</Text>
            <Text style={styles.recommendationPriceUnit}>/night</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.userInfo}>
            <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
              <Image
                source={{ uri: getAvatarUrl() }}
                style={styles.avatar}
              />
            </TouchableOpacity>
            <View>
              <Text style={styles.greetingText}>Welcome Back 👋</Text>
              <Text style={styles.userName}>{userData?.name || 'Guest'}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <Ionicons name="notifications-outline" size={24} color={COLORS.text.primary} />
            <View style={styles.badge} />
          </TouchableOpacity>
        </View>

        {/* Search Bar (Visual Only) */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search-outline" size={20} color={COLORS.text.secondary} />
            <Text style={styles.searchText}>Search hotels, restaurants...</Text>
          </View>
          <TouchableOpacity style={styles.filterButton}>
            <Ionicons name="options-outline" size={20} color={COLORS.surface} />
          </TouchableOpacity>
        </View>

        {/* Map Preview Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Near You</Text>
            <TouchableOpacity 
              style={styles.locationButton}
              onPress={fetchUserLocation}
            >
              <Ionicons name="navigate-outline" size={16} color={COLORS.primary} />
              <Text style={styles.locationButtonText}>{userLocation}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.mapContainer}>
            <MapView
              style={styles.map}
              provider={PROVIDER_GOOGLE}
              region={mapRegion}
              scrollEnabled={false}
              zoomEnabled={false}
              rotateEnabled={false}
              pitchEnabled={false}
            >
              {nearbyHotels.map((hotel, index) => (
                <Marker
                  key={hotel.id}
                  coordinate={hotel.coordinate}
                  pinColor={index === 0 ? COLORS.primary : COLORS.secondary}
                />
              ))}
            </MapView>
            <TouchableOpacity 
              style={styles.viewMapOverlay}
              onPress={() => setIsMapVisible(true)}
              activeOpacity={0.9}
            >
              <View style={styles.viewMapButton}>
                <Ionicons name="map-outline" size={20} color={COLORS.surface} />
                <Text style={styles.viewMapText}>Explore Map</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Most Popular Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Most Popular</Text>
            <TouchableOpacity onPress={() => {}}>
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
            snapToInterval={CARD_WIDTH + SPACING}
            decelerationRate="fast"
          />
        </View>

        {/* Recommended Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recommended</Text>
          </View>

          {/* Filter Tabs */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterList}
            style={styles.filterContainer}
          >
            {filterOptions.map((filter, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.filterTab,
                  selectedFilter === filter.label && styles.filterTabActive,
                ]}
                onPress={() => setSelectedFilter(filter.label)}
              >
                <Ionicons
                  name={filter.icon as any}
                  size={18}
                  color={selectedFilter === filter.label ? COLORS.surface : COLORS.text.secondary}
                />
                <Text
                  style={[
                    styles.filterTabText,
                    selectedFilter === filter.label && styles.filterTabTextActive,
                  ]}
                >
                  {filter.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Recommendations List */}
          <View style={styles.verticalList}>
            {recommendations.map((item) => (
              <View key={item.id} style={{ marginBottom: SIZES.spacing.md }}>
                {renderRecommendationCard({ item })}
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Full Screen Map Modal */}
      <Modal
        visible={isMapVisible}
        animationType="slide"
        onRequestClose={() => setIsMapVisible(false)}
      >
        <SafeAreaView style={styles.fullScreenMapContainer}>
          <View style={styles.mapHeader}>
            <TouchableOpacity
              style={styles.closeMapButton}
              onPress={() => setIsMapVisible(false)}
            >
              <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
            </TouchableOpacity>
            <Text style={styles.mapTitle}>Explore Nearby</Text>
            <View style={{ width: 40 }} />
          </View>

          <MapView
            style={styles.fullScreenMap}
            provider={PROVIDER_GOOGLE}
            initialRegion={mapRegion}
            showsUserLocation={true}
            showsMyLocationButton={true}
          >
            {nearbyHotels.map((hotel) => (
              <Marker
                key={hotel.id}
                coordinate={hotel.coordinate}
                title={hotel.name}
                description={hotel.location}
              >
                <View style={styles.customMarker}>
                  <Ionicons name="bed" size={16} color={COLORS.surface} />
                </View>
              </Marker>
            ))}
          </MapView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING,
    paddingTop: Platform.OS === 'android' ? SIZES.spacing.xl : SIZES.spacing.md,
    paddingBottom: SIZES.spacing.md,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: SIZES.spacing.md,
    borderWidth: 2,
    borderColor: COLORS.surface,
  },
  greetingText: {
    fontSize: SIZES.sm,
    color: COLORS.text.secondary,
    marginBottom: 2,
  },
  userName: {
    fontSize: SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  badge: {
    position: 'absolute',
    top: 10,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.error,
    borderWidth: 1,
    borderColor: COLORS.surface,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING,
    marginBottom: SIZES.spacing.lg,
    gap: SIZES.spacing.sm,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: SIZES.spacing.md,
    height: 50,
    borderRadius: SIZES.radius.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchText: {
    marginLeft: SIZES.spacing.sm,
    color: COLORS.text.secondary,
    flex: 1,
  },
  filterButton: {
    width: 50,
    height: 50,
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    marginBottom: SIZES.spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING,
    marginBottom: SIZES.spacing.md,
  },
  sectionTitle: {
    fontSize: SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  seeAllButton: {
    fontSize: SIZES.sm,
    color: COLORS.primary,
    fontWeight: '600',
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.lightBlue,
    paddingHorizontal: SIZES.spacing.sm,
    paddingVertical: 4,
    borderRadius: SIZES.radius.sm,
    maxWidth: '50%',
  },
  locationButtonText: {
    fontSize: SIZES.xs,
    color: COLORS.primary,
    marginLeft: 4,
    fontWeight: '500',
  },
  mapContainer: {
    marginHorizontal: SPACING,
    height: 180,
    borderRadius: SIZES.radius.xl,
    overflow: 'hidden',
    position: 'relative',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  viewMapOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewMapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: SIZES.spacing.lg,
    paddingVertical: SIZES.spacing.sm,
    borderRadius: 30, // Updated radius
    gap: SIZES.spacing.xs,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  viewMapText: {
    color: COLORS.surface,
    fontWeight: '600',
    fontSize: SIZES.md,
  },
  popularList: {
    paddingHorizontal: SPACING,
    gap: SPACING,
  },
  popularCard: {
    width: CARD_WIDTH,
    height: 320,
    borderRadius: SIZES.radius.xl,
    backgroundColor: COLORS.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  cardImageContainer: {
    flex: 1,
    borderRadius: SIZES.radius.xl,
    overflow: 'hidden',
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
  },
  likeButton: {
    position: 'absolute',
    top: SIZES.spacing.md,
    right: SIZES.spacing.md,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: SIZES.spacing.lg,
  },
  cardRating: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: SIZES.radius.sm,
    marginBottom: SIZES.spacing.sm,
    gap: 4,
  },
  cardRatingText: {
    color: COLORS.surface,
    fontWeight: 'bold',
    fontSize: SIZES.xs,
  },
  cardTitle: {
    fontSize: SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.surface,
    marginBottom: 4,
  },
  cardLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.spacing.md,
  },
  cardLocationText: {
    color: COLORS.surface,
    opacity: 0.9,
    fontSize: SIZES.sm,
    marginLeft: 4,
  },
  priceTag: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  cardPrice: {
    fontSize: SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.surface,
  },
  cardPriceUnit: {
    fontSize: SIZES.sm,
    color: COLORS.surface,
    opacity: 0.9,
    marginLeft: 4,
  },
  filterContainer: {
    marginBottom: SIZES.spacing.lg,
  },
  filterList: {
    paddingHorizontal: SPACING,
    gap: SIZES.spacing.sm,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIZES.spacing.lg,
    paddingVertical: 10,
    borderRadius: 30, // Updated radius
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 6,
  },
  filterTabActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterTabText: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.text.secondary,
  },
  filterTabTextActive: {
    color: COLORS.surface,
  },
  verticalList: {
    paddingHorizontal: SPACING,
  },
  recommendationCard: {
    flexDirection: 'row',
    padding: SIZES.spacing.sm,
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  recommendationImage: {
    width: 90,
    height: 90,
    borderRadius: SIZES.radius.md,
  },
  recommendationInfo: {
    flex: 1,
    marginLeft: SIZES.spacing.md,
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  recommendationName: {
    fontSize: SIZES.md,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  recommendationLocation: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recommendationLocationText: {
    fontSize: SIZES.sm,
    color: COLORS.text.secondary,
    marginLeft: 4,
    flex: 1,
  },
  recommendationBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingBadgeText: {
    fontSize: SIZES.sm,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  recommendationPrice: {
    fontSize: SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  recommendationPriceUnit: {
    fontSize: SIZES.xs,
    color: COLORS.text.secondary,
    marginLeft: 2,
  },
  fullScreenMapContainer: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  mapHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SIZES.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  closeMapButton: {
    padding: 8,
  },
  mapTitle: {
    fontSize: SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  fullScreenMap: {
    flex: 1,
  },
  customMarker: {
    padding: 8,
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: COLORS.surface,
  },
});

export default HomeScreen;