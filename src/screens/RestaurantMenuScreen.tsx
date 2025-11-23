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
  FlatList,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants';
import type { MenuItem, OrderItem } from '../types';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = (width - SIZES.spacing.lg * 3) / 2;

const RestaurantMenuScreen = () => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Mock menu data
  const mockMenuItems: MenuItem[] = [
    {
      id: '1',
      name: 'Grilled Salmon',
      description: 'Fresh Atlantic salmon with lemon butter sauce and vegetables',
      price: 28.99,
      category: 'main',
      image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400',
      available: true,
      preparationTime: 20,
    },
    {
      id: '2',
      name: 'Caesar Salad',
      description: 'Crisp romaine lettuce with parmesan and croutons',
      price: 12.99,
      category: 'appetizer',
      image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400',
      available: true,
      preparationTime: 10,
    },
    {
      id: '3',
      name: 'Beef Steak',
      description: 'Premium cut grilled to perfection with mashed potatoes',
      price: 35.99,
      category: 'main',
      image: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=400',
      available: true,
      preparationTime: 25,
    },
    {
      id: '4',
      name: 'Tiramisu',
      description: 'Classic Italian dessert with coffee and mascarpone',
      price: 8.99,
      category: 'dessert',
      image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400',
      available: true,
      preparationTime: 5,
    },
    {
      id: '5',
      name: 'Fresh Orange Juice',
      description: 'Freshly squeezed orange juice',
      price: 5.99,
      category: 'beverage',
      image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400',
      available: true,
      preparationTime: 5,
    },
    {
      id: '6',
      name: 'Pasta Carbonara',
      description: 'Creamy pasta with bacon and parmesan',
      price: 18.99,
      category: 'main',
      image: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=400',
      available: true,
      preparationTime: 15,
    },
    {
      id: '7',
      name: 'Bruschetta',
      description: 'Toasted bread with tomatoes and basil',
      price: 9.99,
      category: 'appetizer',
      image: 'https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=400',
      available: true,
      preparationTime: 8,
    },
    {
      id: '8',
      name: 'Chocolate Lava Cake',
      description: 'Warm chocolate cake with molten center',
      price: 10.99,
      category: 'dessert',
      image: 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=400',
      available: true,
      preparationTime: 12,
    },
  ];

  const categories = [
    { id: 'all', title: 'All', icon: 'restaurant-outline' as const },
    { id: 'appetizer', title: 'Appetizers', icon: 'leaf-outline' as const },
    { id: 'main', title: 'Main Course', icon: 'fast-food-outline' as const },
    { id: 'dessert', title: 'Desserts', icon: 'ice-cream-outline' as const },
    { id: 'beverage', title: 'Beverages', icon: 'cafe-outline' as const },
  ];

  useEffect(() => {
    loadMenuItems();
  }, []);

  const loadMenuItems = async () => {
    setLoading(true);
    try {
      setTimeout(() => {
        setMenuItems(mockMenuItems);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error loading menu items:', error);
      setLoading(false);
    }
  };

  const filteredMenuItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const formatPrice = (price: number) => {
    return `$${price.toFixed(2)}`;
  };

  const addToCart = (item: MenuItem) => {
    const existingItem = cart.find(cartItem => cartItem.menuItemId === item.id);
    
    if (existingItem) {
      setCart(cart.map(cartItem => 
        cartItem.menuItemId === item.id 
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      ));
    } else {
      const newItem: OrderItem = {
        menuItemId: item.id,
        name: item.name,
        quantity: 1,
        price: item.price,
      };
      setCart([...cart, newItem]);
    }
  };

  const removeFromCart = (itemId: string) => {
    const existingItem = cart.find(cartItem => cartItem.menuItemId === itemId);
    
    if (existingItem && existingItem.quantity > 1) {
      setCart(cart.map(cartItem => 
        cartItem.menuItemId === itemId 
          ? { ...cartItem, quantity: cartItem.quantity - 1 }
          : cartItem
      ));
    } else {
      setCart(cart.filter(cartItem => cartItem.menuItemId !== itemId));
    }
  };

  const getItemQuantityInCart = (itemId: string): number => {
    const item = cart.find(cartItem => cartItem.menuItemId === itemId);
    return item ? item.quantity : 0;
  };

  const getTotalCartItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalCartPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const renderMenuItem = (item: MenuItem) => {
    const quantityInCart = getItemQuantityInCart(item.id);
    
    return (
      <TouchableOpacity style={styles.menuItem}>
        <Image source={{ uri: item.image }} style={styles.itemImage} />
        
        {/* Badge for quantity in cart */}
        {quantityInCart > 0 && (
          <View style={styles.quantityBadge}>
            <Text style={styles.quantityBadgeText}>{quantityInCart}</Text>
          </View>
        )}

        <View style={styles.itemInfo}>
          <Text style={styles.itemName} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.itemDescription} numberOfLines={2}>
            {item.description}
          </Text>
          
          <View style={styles.itemFooter}>
            <View style={styles.priceContainer}>
              <Text style={styles.itemPrice}>{formatPrice(item.price)}</Text>
              <View style={styles.timeContainer}>
                <Ionicons name="time-outline" size={12} color={COLORS.text.secondary} />
                <Text style={styles.timeText}>{item.preparationTime} min</Text>
              </View>
            </View>
            
            {quantityInCart > 0 ? (
              <View style={styles.quantityControls}>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => removeFromCart(item.id)}
                >
                  <Ionicons name="remove" size={16} color={COLORS.surface} />
                </TouchableOpacity>
                <Text style={styles.quantityText}>{quantityInCart}</Text>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => addToCart(item)}
                >
                  <Ionicons name="add" size={16} color={COLORS.surface} />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => addToCart(item)}
                disabled={!item.available}
              >
                <Ionicons name="add" size={20} color={COLORS.surface} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>Restaurant</Text>
            <Text style={styles.headerSubtitle}>Order your favorite dishes</Text>
          </View>
          
          {/* My Bookings Button */}
          <TouchableOpacity 
            style={styles.myBookingsButton}
            onPress={() => (navigation as any).navigate('MyTableBookings')}
          >
            <Ionicons name="list-outline" size={20} color={COLORS.primary} />
          </TouchableOpacity>

          {/* Book Table Button */}
          <TouchableOpacity 
            style={styles.bookTableButton}
            onPress={() => (navigation as any).navigate('TableBooking')}
          >
            <Ionicons name="calendar-outline" size={20} color={COLORS.surface} />
            <Text style={styles.bookTableButtonText}>Book Table</Text>
          </TouchableOpacity>

          {cart.length > 0 && (
            <TouchableOpacity style={styles.cartIconContainer}>
              <Ionicons name="cart-outline" size={24} color={COLORS.text.primary} />
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{getTotalCartItems()}</Text>
              </View>
            </TouchableOpacity>
          )}
        </View>

        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={20} color={COLORS.text.secondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search dishes..."
            placeholderTextColor={COLORS.text.secondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={COLORS.text.secondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Categories */}
      <View style={styles.categoriesSection}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryButton,
                selectedCategory === category.id && styles.categoryButtonActive,
              ]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <Ionicons 
                name={category.icon} 
                size={20} 
                color={selectedCategory === category.id ? COLORS.primary : COLORS.text.secondary} 
              />
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === category.id && styles.categoryTextActive,
                ]}
              >
                {category.title}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Menu Items */}
      <FlatList
        data={filteredMenuItems}
        renderItem={({ item }) => renderMenuItem(item)}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.menuList}
        columnWrapperStyle={styles.menuRow}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="restaurant-outline" size={64} color={COLORS.text.disabled} />
            <Text style={styles.emptyText}>No dishes found</Text>
          </View>
        }
      />

      {/* Cart Summary */}
      {cart.length > 0 && (
        <View style={styles.cartSummary}>
          <View style={styles.cartInfo}>
            <Text style={styles.cartItemCount}>
              {getTotalCartItems()} {getTotalCartItems() === 1 ? 'item' : 'items'}
            </Text>
            <Text style={styles.cartTotal}>{formatPrice(getTotalCartPrice())}</Text>
          </View>
          <TouchableOpacity style={styles.viewCartButton}>
            <Text style={styles.viewCartButtonText}>View Cart</Text>
            <Ionicons name="arrow-forward" size={20} color={COLORS.surface} />
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
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
    marginBottom: SIZES.spacing.lg,
  },
  headerTitle: {
    fontSize: SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: SIZES.spacing.xs,
  },
  headerSubtitle: {
    fontSize: SIZES.sm,
    color: COLORS.text.secondary,
  },
  myBookingsButton: {
    padding: SIZES.spacing.sm,
    marginRight: SIZES.spacing.xs,
    backgroundColor: COLORS.lightBlue,
    borderRadius: SIZES.radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookTableButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: SIZES.spacing.md,
    paddingVertical: SIZES.spacing.sm,
    borderRadius: SIZES.radius.md,
    marginRight: SIZES.spacing.sm,
  },
  bookTableButtonText: {
    fontSize: SIZES.sm,
    fontWeight: '600',
    color: COLORS.surface,
    marginLeft: SIZES.spacing.xs,
  },
  cartIconContainer: {
    position: 'relative',
    padding: SIZES.spacing.sm,
  },
  cartBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: COLORS.error,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    fontSize: SIZES.xs,
    fontWeight: 'bold',
    color: COLORS.surface,
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
  categoriesSection: {
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  categoriesContainer: {
    paddingHorizontal: SIZES.spacing.lg,
    paddingVertical: SIZES.spacing.md,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIZES.spacing.md,
    paddingVertical: SIZES.spacing.sm,
    backgroundColor: COLORS.background,
    borderRadius: SIZES.radius.xl,
    marginRight: SIZES.spacing.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SIZES.spacing.xs,
  },
  categoryButtonActive: {
    backgroundColor: COLORS.lightBlue,
    borderColor: COLORS.primary,
  },
  categoryText: {
    fontSize: SIZES.sm,
    color: COLORS.text.secondary,
    fontWeight: '500',
  },
  categoryTextActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  menuList: {
    padding: SIZES.spacing.md,
    paddingBottom: 100,
  },
  menuRow: {
    justifyContent: 'space-between',
  },
  menuItem: {
    width: ITEM_WIDTH,
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius.lg,
    marginBottom: SIZES.spacing.md,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemImage: {
    width: '100%',
    height: ITEM_WIDTH * 0.75,
    resizeMode: 'cover',
  },
  quantityBadge: {
    position: 'absolute',
    top: SIZES.spacing.sm,
    right: SIZES.spacing.sm,
    backgroundColor: COLORS.primary,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  quantityBadgeText: {
    fontSize: SIZES.sm,
    fontWeight: 'bold',
    color: COLORS.surface,
  },
  itemInfo: {
    padding: SIZES.spacing.sm,
  },
  itemName: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SIZES.spacing.xs,
  },
  itemDescription: {
    fontSize: SIZES.xs,
    color: COLORS.text.secondary,
    lineHeight: 16,
    marginBottom: SIZES.spacing.sm,
    height: 32,
  },
  itemFooter: {
    flexDirection: 'column',
    gap: SIZES.spacing.sm,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemPrice: {
    fontSize: SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.spacing.xs,
  },
  timeText: {
    fontSize: SIZES.xs,
    color: COLORS.text.secondary,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radius.xl,
    paddingVertical: SIZES.spacing.xs,
    paddingHorizontal: SIZES.spacing.sm,
  },
  quantityButton: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.surface,
    minWidth: 24,
    textAlign: 'center',
  },
  addButton: {
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radius.xl,
    paddingVertical: SIZES.spacing.xs,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SIZES.spacing.xxl * 2,
  },
  emptyText: {
    fontSize: SIZES.md,
    color: COLORS.text.secondary,
    marginTop: SIZES.spacing.md,
  },
  cartSummary: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SIZES.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  cartInfo: {
    flex: 1,
  },
  cartItemCount: {
    fontSize: SIZES.sm,
    color: COLORS.text.secondary,
    marginBottom: SIZES.spacing.xs,
  },
  cartTotal: {
    fontSize: SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  viewCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: SIZES.spacing.lg,
    paddingVertical: SIZES.spacing.md,
    borderRadius: SIZES.radius.xl,
    gap: SIZES.spacing.sm,
  },
  viewCartButtonText: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.surface,
  },
});

export default RestaurantMenuScreen;