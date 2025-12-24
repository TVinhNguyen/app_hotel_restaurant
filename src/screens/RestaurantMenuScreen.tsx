import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  SafeAreaView,
  TextInput,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants';
import { apiService } from '../services/apiService'; // Giả sử đã có apiService

// Interface dựa trên JSON bạn cung cấp
interface Restaurant {
  id: string;
  name: string;
  description: string;
  location: string;
  openingHours: string;
  cuisineType: string;
  property: {
    name: string;
    address: string;
    city: string;
    country: string;
  };
  // Các field khác nếu cần dùng
}

const RestaurantMenuScreen = () => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(false);
  const [filteredRestaurants, setFilteredRestaurants] = useState<Restaurant[]>([]);

  // Array of restaurant images for variety
  const restaurantImages = [
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500', // Restaurant interior
    'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=500', // Fine dining
    'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=500', // Cozy restaurant
  ];

  useEffect(() => {
    fetchRestaurants();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = restaurants.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.cuisineType.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.property?.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredRestaurants(filtered);
    } else {
      setFilteredRestaurants(restaurants);
    }
  }, [searchQuery, restaurants]);

  const fetchRestaurants = async () => {
    setLoading(true);
    try {
      // Gọi API thực tế
      const response: any = await apiService.get('/restaurants');
      
      console.log('=== RESTAURANT API RESPONSE ===');
      console.log('Full Response:', JSON.stringify(response, null, 2));
      
      // Xử lý response theo cấu trúc JSON bạn đưa: { restaurants: [...], total: 3 }
      if (response && response.restaurants) {
        console.log('Number of restaurants:', response.restaurants.length);
        response.restaurants.forEach((restaurant: Restaurant, index: number) => {
          console.log(`\n--- Restaurant ${index + 1} ---`);
          console.log('ID:', restaurant.id);
          console.log('Name:', restaurant.name);
          console.log('Opening Hours:', restaurant.openingHours);
          console.log('Cuisine Type:', restaurant.cuisineType);
          console.log('Description:', restaurant.description);
          console.log('Location:', restaurant.location);
          console.log('Property:', restaurant.property);
        });
        setRestaurants(response.restaurants);
        setFilteredRestaurants(response.restaurants);
      } else if (Array.isArray(response)) {
        // Fallback nếu API trả về mảng trực tiếp
        console.log('Response is array, length:', response.length);
        setRestaurants(response);
        setFilteredRestaurants(response);
      }
    } catch (error) {
      console.error('Failed to fetch restaurants:', error);
      Alert.alert('Error', 'Could not load restaurants. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderRestaurantItem = ({ item, index }: { item: Restaurant, index: number }) => (
    <TouchableOpacity 
      style={styles.restaurantCard}
      onPress={() => {
        // Điều hướng sang màn hình đặt bàn hoặc chi tiết cho nhà hàng này
        (navigation as any).navigate('TableBooking', { restaurantId: item.id, restaurantName: item.name });
      }}
    >
      {/* Cycle through images based on restaurant index */}
      <Image 
        source={{ uri: restaurantImages[index % restaurantImages.length] }} 
        style={styles.cardImage} 
      />
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text style={styles.restaurantName}>{item.name}</Text>
          
        </View>
        
        <Text style={styles.cuisineText}>{item.cuisineType} • {item.openingHours}</Text>
        
        <View style={styles.locationContainer}>
          <Ionicons name="location-outline" size={14} color={COLORS.text.secondary} />
          <Text style={styles.locationText} numberOfLines={1}>
            {item.property?.name}, {item.property?.city}
          </Text>
        </View>

        <Text style={styles.descriptionText} numberOfLines={2}>
            {item.description}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => (navigation as any).navigate('Home')}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
            <Text style={styles.backButtonText}>Trang chủ</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.myBookingsButton}
            onPress={() => (navigation as any).navigate('MyTableBookings')}
          >
            <Ionicons name="time-outline" size={20} color={COLORS.primary} />
            <Text style={styles.myBookingsText}>Lịch sử đặt bàn</Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={20} color={COLORS.text.secondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm theo tên, loại món ăn..."
            placeholderTextColor={COLORS.text.secondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredRestaurants}
          renderItem={renderRestaurantItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.centerContainer}>
              <Ionicons name="restaurant-outline" size={48} color={COLORS.text.disabled} />
              <Text style={styles.emptyText}>No restaurants found</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
  header: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: SIZES.spacing.lg,
    paddingTop: SIZES.spacing.md,
    paddingBottom: SIZES.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.spacing.md,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.spacing.xs,
  },
  backButtonText: {
    fontSize: SIZES.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  myBookingsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIZES.spacing.md,
    paddingVertical: SIZES.spacing.sm,
    backgroundColor: COLORS.lightBlue,
    borderRadius: SIZES.radius.md,
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
    gap: SIZES.spacing.xs,
  },
  myBookingsText: {
    fontSize: SIZES.sm,
    fontWeight: '600',
    color: COLORS.primary,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    paddingHorizontal: SIZES.spacing.md,
    paddingVertical: SIZES.spacing.sm,
    borderRadius: SIZES.radius.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchInput: {
    flex: 1,
    marginLeft: SIZES.spacing.sm,
    fontSize: SIZES.md,
    color: COLORS.text.primary,
  },
  listContainer: {
    padding: SIZES.spacing.lg,
  },
  restaurantCard: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius.lg,
    marginBottom: SIZES.spacing.lg,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardImage: {
    width: '100%',
    height: 180,
    resizeMode: 'cover',
  },
  cardContent: {
    padding: SIZES.spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.spacing.xs,
  },
  restaurantName: {
    fontSize: SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    flex: 1,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    paddingHorizontal: SIZES.spacing.xs,
    paddingVertical: 2,
    borderRadius: SIZES.radius.sm,
    gap: 4,
  },
  ratingText: {
    fontSize: SIZES.sm,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  cuisineText: {
    fontSize: SIZES.sm,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: SIZES.spacing.sm,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.spacing.sm,
    gap: SIZES.spacing.xs,
  },
  locationText: {
    fontSize: SIZES.sm,
    color: COLORS.text.secondary,
    flex: 1,
  },
  descriptionText: {
    fontSize: SIZES.sm,
    color: COLORS.text.secondary,
    lineHeight: 20,
  },
  emptyText: {
    marginTop: SIZES.spacing.md,
    color: COLORS.text.secondary,
    fontSize: SIZES.md,
  }
});

export default RestaurantMenuScreen;