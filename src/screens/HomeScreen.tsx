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
  ActivityIndicator,
  StatusBar,
  Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES, STORAGE_KEYS } from '../constants';
import { propertyService } from '../services/propertyService';
import type { SearchParams } from './SearchScreen';


const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.75;
const SPACING = SIZES.spacing.lg;

const HomeScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [properties, setProperties] = useState<any[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [searchParams, setSearchParams] = useState<SearchParams | null>(null);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);


  const normalizeText = (text: string = '') => {
  return text
    .toLowerCase()
    .normalize('NFD')                 // tách dấu
    .replace(/[\u0300-\u036f]/g, '') // xoá dấu
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s]/g, '')
    .trim();
};


  useEffect(() => {
    fetchProperties();
    fetchUserData();
  }, []);

  // Nhận searchParams từ SearchScreen khi navigate back
  useEffect(() => {
    if (route.params?.searchParams) {
      setSearchParams(route.params.searchParams);
      // Clear params sau khi nhận
      navigation.setParams({ searchParams: undefined });
    }
  }, [route.params?.searchParams]);

  // Apply filters when properties or searchParams change
  useEffect(() => {
    applyFilters();
  }, [properties, searchParams, selectedCity]);

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

  const applyFilters = () => {
    let filtered = [...properties];

    // 🔍 Search theo location
    if (searchParams?.location) {
      const searchNormalized = normalizeText(searchParams.location);

      filtered = filtered.filter(prop => {
        const fields = [
          prop.name,
          prop.city,
          prop.country,
          prop.address,
        ];

        return fields.some(field =>
          normalizeText(field || '').includes(searchNormalized)
        );
      });
    }

    // 📍 Filter theo city
    if (selectedCity) {
      const cityNormalized = normalizeText(selectedCity);

      filtered = filtered.filter(prop =>
        normalizeText(prop.city || '').includes(cityNormalized)
      );
    }

    setFilteredProperties(filtered);
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
      distance: `${(Math.random() * 5 + 0.5).toFixed(1)} km`,
      phone: property.phone,
      email: property.email,
      website: property.website,
      type: property.propertyType || property.property_type,
    };
  };

  const displayProperties =
    searchParams || selectedCity
      ? filteredProperties
      : properties;
  const uiProperties = displayProperties.map((prop, index) => mapPropertyToUI(prop, index));
  const popularPlaces = uiProperties.slice(0, 6);
  const recommendations = uiProperties.slice(0, 5);

  const filterOptions = [
    { label: 'All', city: null, icon: 'grid-outline' },
    { label: 'Đà Nẵng', city: 'da nang', icon: 'location-outline' },
    { label: 'Hà Nội', city: 'ha noi', icon: 'location-outline' },
    { label: 'TP.HCM', city: 'ho chi minh', icon: 'location-outline' },
    { label: 'Nha Trang', city: 'nha trang', icon: 'location-outline' },
  ];


  const formatPrice = (price: number) => `$${price}`;

  const getAvatarUrl = () => {
    if (userData?.avatar) return userData.avatar;
    if (userData?.name) {
      const name = encodeURIComponent(userData.name);
      return `https://ui-avatars.com/api/?name=${name}&background=random&color=fff&size=128`;
    }
    return 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400&q=80';
  };

  const clearSearch = () => {
    setSearchParams(null);
    setSelectedFilter('All');
    setSelectedCity(null);
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
              <Text style={styles.greetingText}>Chào mừng bạn trở lại 👋</Text>
              <Text style={styles.userName}>{userData?.name || 'Guest'}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <Ionicons name="notifications-outline" size={24} color={COLORS.text.primary} />
            <View style={styles.badge} />
          </TouchableOpacity>
        </View>

        {/* Search Bar - Click để navigate đến SearchScreen */}
        <TouchableOpacity 
          style={styles.searchContainer}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('Search')}
        >
          <View style={styles.searchBar}>
            <Ionicons name="search-outline" size={20} color={COLORS.text.secondary} />
            <Text style={styles.searchText}>
              {searchParams ? searchParams.location : 'Tìm kiếm khách sạn, địa điểm...'}
            </Text>
          </View>
          <View style={styles.filterButton}>
            <Ionicons name="options-outline" size={20} color={COLORS.surface} />
          </View>
        </TouchableOpacity>

        {/* Active Search Filter Badge */}
        {searchParams && (
          <View style={styles.activeSearchContainer}>
            <View style={styles.activeSearchBadge}>
              <Ionicons name="search" size={16} color={COLORS.primary} />
              <Text style={styles.activeSearchText}>
                Search: {searchParams.location} • {searchParams.guests.adults + searchParams.guests.children} guests
              </Text>
              <TouchableOpacity onPress={clearSearch} style={styles.clearSearchButton}>
                <Ionicons name="close-circle" size={18} color={COLORS.error} />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Results Count */}
        {searchParams && (
          <View style={styles.resultsCount}>
            <Text style={styles.resultsCountText}>
              Found {uiProperties.length} result{uiProperties.length !== 1 ? 's' : ''}
            </Text>
          </View>
        )}

        {/* Most Popular Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {searchParams ? 'Search Results' : 'Phổ biến'}
            </Text>
          </View>

          {popularPlaces.length > 0 ? (
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
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="search-outline" size={64} color={COLORS.text.disabled} />
              <Text style={styles.emptyStateText}>Không tìm thấy khách sạn</Text>
              <Text style={styles.emptyStateSubText}>Hãy thử điều chỉnh tiêu chí tìm kiếm của bạn</Text>
            </View>
          )}
        </View>

        {/* Recommended Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {searchParams ? 'More Options' : 'Đề xuất cho bạn'}
            </Text>
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
                onPress={() => { setSelectedCity(filter.city); setSelectedFilter(filter.label); }}
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
          {recommendations.length > 0 ? (
            <View style={styles.verticalList}>
              {recommendations.map((item) => (
                <View key={item.id} style={{ marginBottom: SIZES.spacing.md }}>
                  {renderRecommendationCard({ item })}
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="filter-outline" size={48} color={COLORS.text.disabled} />
              <Text style={styles.emptyStateText}>Không tìm thấy khách sạn ở khu vực này!</Text>
            </View>
          )}
        </View>
      </ScrollView>
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
    marginBottom: SIZES.spacing.md,
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
    marginRight: SIZES.spacing.sm,
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
  activeSearchContainer: {
    paddingHorizontal: SPACING,
    marginBottom: SIZES.spacing.sm,
  },
  activeSearchBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: SIZES.spacing.md,
    paddingVertical: SIZES.spacing.sm,
    borderRadius: SIZES.radius.lg,
    gap: SIZES.spacing.xs,
  },
  activeSearchText: {
    flex: 1,
    fontSize: SIZES.sm,
    color: COLORS.text.primary,
    fontWeight: '500',
  },
  clearSearchButton: {
    padding: 4,
  },
  resultsCount: {
    paddingHorizontal: SPACING,
    marginBottom: SIZES.spacing.sm,
  },
  resultsCountText: {
    fontSize: SIZES.sm,
    color: COLORS.text.secondary,
    fontWeight: '500',
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
    borderRadius: 30,
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
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SIZES.spacing.xxl * 2,
    paddingHorizontal: SPACING,
  },
  emptyStateText: {
    fontSize: SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text.secondary,
    marginTop: SIZES.spacing.md,
  },
  emptyStateSubText: {
    fontSize: SIZES.sm,
    color: COLORS.text.disabled,
    marginTop: SIZES.spacing.xs,
  },
});

export default HomeScreen;