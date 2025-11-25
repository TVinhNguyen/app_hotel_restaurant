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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { COLORS, SIZES, API_CONFIG, STORAGE_KEYS } from '../constants';
import { propertyService } from '../services/propertyService';

const { width } = Dimensions.get('window');
const cardWidth = width * 0.7;

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
      
      // Update map region to user's location
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

  // Map properties (hotels) to UI format
  const mapPropertyToUI = (property: any, index: number) => ({
    id: property.id,
    name: property.name,
    location: property.address || `${property.city}, ${property.country}`,
    price: 100, // Placeholder - will show "From $100"
    rating: 4.5, // Placeholder
    image: 'https://via.placeholder.com/300x200',
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
  });

  const uiProperties = properties.map((prop, index) => mapPropertyToUI(prop, index));

  // Use properties for display
  const popularPlaces = uiProperties.length > 0 ? uiProperties : [];
  const recommendations = uiProperties.length > 0 ? uiProperties.slice(0, 5) : [];
  const nearbyHotels = uiProperties.length > 0 ? uiProperties.slice(0, 3) : [];

  const filterOptions = ['All', 'Villas', 'Hotels', 'Apartments'];

  const formatPrice = (price: number) => {
    return `$${price}`;
  };

  const renderPopularCard = ({ item }: { item: any }) => (
    <TouchableOpacity
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
      onPress={() => navigation.navigate('HotelDetail', { 
        hotelId: item.id,
        hotelName: item.name,
        hotelImage: item.image,
        rating: item.rating,
        location: item.location,
      })}
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

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.userInfo}>
            <Image
              source={{ uri: userData?.avatar || 'https://via.placeholder.com/100x100/4CAF50/FFFFFF?text=User' }}
              style={styles.avatar}
            />
            <View style={styles.userDetails}>
              <Text style={styles.userName}>Hello, {userData?.name || 'Khách'}</Text>
              <TouchableOpacity 
                style={styles.locationContainer}
                onPress={fetchUserLocation}
              >
                <Ionicons name="location" size={12} color={COLORS.text.secondary} />
                <Text style={styles.userLocation}>
                  {userLocation}
                  {!locationPermission && ' (Tap để bật vị trí)'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <Ionicons name="notifications-outline" size={24} color={COLORS.text.primary} />
            <View style={styles.badge} />
          </TouchableOpacity>
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

        {/* Hotels Near You with Real Map and Hotel List */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Hotels Near You</Text>
            <TouchableOpacity onPress={() => setIsMapVisible(true)}>
              <Text style={styles.openMapButton}>Open Map</Text>
            </TouchableOpacity>
          </View>

          {/* Real Map Preview */}
          <View style={styles.mapContainer}>
            <MapView
              style={styles.map}
              provider={PROVIDER_GOOGLE}
              region={mapRegion}
              onPress={() => setIsMapVisible(true)}
              scrollEnabled={false}
              zoomEnabled={false}
              rotateEnabled={false}
              pitchEnabled={false}
            >
              {nearbyHotels.map((hotel, index) => (
                <Marker
                  key={hotel.id}
                  coordinate={hotel.coordinate}
                  title={hotel.name}
                  description={hotel.location}
                  pinColor={index === 0 ? COLORS.primary : COLORS.secondary}
                >
                  <View style={[
                    styles.customMarker,
                    { backgroundColor: index === 0 ? COLORS.primary : COLORS.secondary }
                  ]}>
                    <Ionicons name="business" size={18} color={COLORS.surface} />
                  </View>
                </Marker>
              ))}
            </MapView>
            <TouchableOpacity 
              style={styles.mapOverlay}
              onPress={() => setIsMapVisible(true)}
            >
              <Ionicons name="expand" size={20} color={COLORS.surface} />
            </TouchableOpacity>
          </View>

          {/* Nearby Hotels List */}
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={COLORS.primary} />
            </View>
          ) : nearbyHotels.length > 0 ? (
            <View style={styles.nearbyHotelsList}>
              {nearbyHotels.map((hotel) => (
                <TouchableOpacity
                  key={hotel.id}
                  style={styles.nearbyHotelCard}
                  onPress={() => navigation.navigate('RoomDetails', { roomId: hotel.id })}
                >
                  <Image source={{ uri: hotel.image }} style={styles.nearbyHotelImage} />
                  <View style={styles.nearbyHotelInfo}>
                    <Text style={styles.nearbyHotelName} numberOfLines={1}>
                      {hotel.name}
                    </Text>
                    <View style={styles.nearbyHotelLocation}>
                      <Ionicons name="location-outline" size={12} color={COLORS.text.secondary} />
                      <Text style={styles.nearbyHotelLocationText} numberOfLines={1}>
                        {hotel.location}
                      </Text>
                    </View>
                    <View style={styles.nearbyHotelDetails}>
                      <View style={styles.nearbyHotelRating}>
                        <Ionicons name="star" size={12} color={COLORS.warning} />
                        <Text style={styles.nearbyHotelRatingText}>{hotel.rating}</Text>
                      </View>
                      <Text style={styles.nearbyHotelDistance}>{hotel.distance}</Text>
                    </View>
                  </View>
                  <View style={styles.nearbyHotelPriceContainer}>
                    <Text style={styles.nearbyHotelPrice}>{formatPrice(hotel.price)}</Text>
                    <Text style={styles.nearbyHotelPriceUnit}>/night</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.emptyNearbyContainer}>
              <Ionicons name="business-outline" size={40} color={COLORS.text.disabled} />
              <Text style={styles.emptyNearbyText}>No hotels found nearby</Text>
            </View>
          )}
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

      {/* Full Screen Real Map Modal */}
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

          <MapView
            style={styles.fullScreenMap}
            provider={PROVIDER_GOOGLE}
            initialRegion={mapRegion}
            showsUserLocation={locationPermission}
            showsMyLocationButton={true}
          >
            {nearbyHotels.map((hotel, index) => (
              <Marker
                key={hotel.id}
                coordinate={hotel.coordinate}
                title={hotel.name}
                description={`${hotel.location} • ${hotel.distance}`}
                onPress={() => {
                  // Show callout, user can tap again to navigate
                }}
                onCalloutPress={() => {
                  setIsMapVisible(false);
                  navigation.navigate('HotelDetail', { 
                    hotelId: hotel.id,
                    hotelName: hotel.name,
                    hotelImage: hotel.image,
                    rating: hotel.rating,
                    location: hotel.location,
                  });
                }}
              >
                <View style={[
                  styles.customMarker,
                  { backgroundColor: index === 0 ? COLORS.primary : COLORS.secondary }
                ]}>
                  <Ionicons name="business" size={20} color={COLORS.surface} />
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
  notificationButton: {
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
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.error,
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
  nearbyHotelDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    backgroundColor: '#D4E7F5',
    borderRadius: SIZES.radius.lg,
    overflow: 'hidden',
  },
  mockMapContent: {
    flex: 1,
    position: 'relative',
  },
  mapGridContainer: {
    flex: 1,
    opacity: 0.3,
  },
  mapGridRow: {
    flex: 1,
    flexDirection: 'row',
  },
  mapGridCell: {
    flex: 1,
    borderWidth: 0.5,
    borderColor: '#A8D5F2',
  },
  mapRoadsContainer: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.4,
  },
  mapRoad: {
    position: 'absolute',
    backgroundColor: '#7AB8E8',
  },
  mapRoadHorizontal: {
    width: '100%',
    height: 8,
  },
  mapRoadVertical: {
    height: '100%',
    width: 8,
  },
  mapContainer: {
    height: 200,
    marginHorizontal: SIZES.spacing.lg,
    borderRadius: SIZES.radius.lg,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: COLORS.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    borderWidth: 3,
    borderColor: COLORS.surface,
  },
  customMarker: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
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
  loadingContainer: {
    padding: SIZES.spacing.xl,
    alignItems: 'center',
  },
  emptyNearbyContainer: {
    padding: SIZES.spacing.xl,
    alignItems: 'center',
    gap: SIZES.spacing.sm,
  },
  emptyNearbyText: {
    fontSize: SIZES.md,
    color: COLORS.text.disabled,
  },
});

export default HomeScreen;