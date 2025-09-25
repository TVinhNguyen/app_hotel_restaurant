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
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants';
import type { MenuItem, OrderItem } from '../types';

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
      name: 'Phở Bò Đặc Biệt',
      description: 'Phở bò truyền thống với thịt bò tươi ngon, nước dùng đậm đà',
      price: 85000,
      category: 'main',
      image: 'https://via.placeholder.com/150x150/4CAF50/FFFFFF?text=Pho+Bo',
      available: true,
      preparationTime: 15,
    },
    {
      id: '2',
      name: 'Gỏi Cuốn Tôm',
      description: 'Gỏi cuốn tươi với tôm, rau sống và bún tươi',
      price: 45000,
      category: 'appetizer',
      image: 'https://via.placeholder.com/150x150/FF5722/FFFFFF?text=Goi+Cuon',
      available: true,
      preparationTime: 10,
    },
    {
      id: '3',
      name: 'Cơm Tấm Sườn Nướng',
      description: 'Cơm tấm với sườn nướng thơm lừng, trứng ốp la',
      price: 95000,
      category: 'main',
      image: 'https://via.placeholder.com/150x150/2196F3/FFFFFF?text=Com+Tam',
      available: true,
      preparationTime: 20,
    },
    {
      id: '4',
      name: 'Chè Ba Màu',
      description: 'Chè truyền thống ba màu với đậu xanh, đậu đỏ và nước cốt dừa',
      price: 35000,
      category: 'dessert',
      image: 'https://via.placeholder.com/150x150/9C27B0/FFFFFF?text=Che',
      available: true,
      preparationTime: 5,
    },
    {
      id: '5',
      name: 'Trà Đá',
      description: 'Trà đá mát lạnh, thức uống truyền thống',
      price: 15000,
      category: 'beverage',
      image: 'https://via.placeholder.com/150x150/795548/FFFFFF?text=Tra+Da',
      available: true,
      preparationTime: 2,
    },
  ];

  const categories = [
    { id: 'all', title: 'Tất cả', icon: 'restaurant' },
    { id: 'appetizer', title: 'Khai vị', icon: 'leaf' },
    { id: 'main', title: 'Món chính', icon: 'pizza' },
    { id: 'dessert', title: 'Tráng miệng', icon: 'ice-cream' },
    { id: 'beverage', title: 'Thức uống', icon: 'wine' },
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
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
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
        quantity: 1,
        price: item.price,
      };
      setCart([...cart, newItem]);
    }
    
    Alert.alert('Thành công', `Đã thêm ${item.name} vào giỏ hàng!`);
  };

  const getTotalCartItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalCartPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const renderMenuItem = (item: MenuItem) => (
    <View key={item.id} style={styles.menuItem}>
      <Image source={{ uri: item.image }} style={styles.itemImage} />
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemDescription} numberOfLines={2}>
          {item.description}
        </Text>
        <View style={styles.itemMeta}>
          <View style={styles.timeContainer}>
            <Ionicons name="time" size={14} color={COLORS.text.secondary} />
            <Text style={styles.timeText}>{item.preparationTime} phút</Text>
          </View>
          <Text style={styles.itemPrice}>{formatPrice(item.price)}</Text>
        </View>
      </View>
      <TouchableOpacity 
        style={[
          styles.addButton,
          !item.available && styles.addButtonDisabled
        ]} 
        onPress={() => addToCart(item)}
        disabled={!item.available}
      >
        <Ionicons 
          name="add" 
          size={20} 
          color={item.available ? COLORS.surface : COLORS.text.disabled} 
        />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Menu Nhà Hàng</Text>
        <Text style={styles.headerSubtitle}>Thưởng thức ẩm thực đặc sắc</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={COLORS.text.secondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm món ăn..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Categories */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesContainer}>
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
              color={selectedCategory === category.id ? COLORS.surface : COLORS.text.secondary} 
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

      {/* Menu Items */}
      <ScrollView style={styles.menuList} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text>Đang tải menu...</Text>
          </View>
        ) : (
          <View style={styles.menuContainer}>
            {filteredMenuItems.map(renderMenuItem)}
          </View>
        )}
      </ScrollView>

      {/* Cart Summary */}
      {cart.length > 0 && (
        <View style={styles.cartSummary}>
          <View style={styles.cartInfo}>
            <Text style={styles.cartItemCount}>{getTotalCartItems()} món</Text>
            <Text style={styles.cartTotal}>{formatPrice(getTotalCartPrice())}</Text>
          </View>
          <TouchableOpacity style={styles.viewCartButton}>
            <Text style={styles.viewCartButtonText}>Xem giỏ hàng</Text>
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
    backgroundColor: COLORS.secondary,
    padding: SIZES.spacing.lg,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.surface,
    marginBottom: SIZES.spacing.xs,
  },
  headerSubtitle: {
    fontSize: SIZES.sm,
    color: COLORS.surface,
    opacity: 0.9,
  },
  searchContainer: {
    padding: SIZES.spacing.md,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: SIZES.spacing.md,
    paddingVertical: SIZES.spacing.sm,
    borderRadius: SIZES.radius.lg,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: SIZES.spacing.sm,
    fontSize: SIZES.md,
    color: COLORS.text.primary,
  },
  categoriesContainer: {
    paddingHorizontal: SIZES.spacing.md,
    marginBottom: SIZES.spacing.md,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIZES.spacing.md,
    paddingVertical: SIZES.spacing.sm,
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius.lg,
    marginRight: SIZES.spacing.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SIZES.spacing.xs,
  },
  categoryButtonActive: {
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.secondary,
  },
  categoryText: {
    fontSize: SIZES.sm,
    color: COLORS.text.secondary,
  },
  categoryTextActive: {
    color: COLORS.surface,
    fontWeight: 'bold',
  },
  menuList: {
    flex: 1,
  },
  menuContainer: {
    padding: SIZES.spacing.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.spacing.xl,
  },
  menuItem: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius.lg,
    padding: SIZES.spacing.md,
    marginBottom: SIZES.spacing.md,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: SIZES.radius.md,
  },
  itemInfo: {
    flex: 1,
    marginLeft: SIZES.spacing.md,
    marginRight: SIZES.spacing.sm,
  },
  itemName: {
    fontSize: SIZES.md,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: SIZES.spacing.xs,
  },
  itemDescription: {
    fontSize: SIZES.sm,
    color: COLORS.text.secondary,
    marginBottom: SIZES.spacing.sm,
  },
  itemMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: SIZES.xs,
    color: COLORS.text.secondary,
    marginLeft: SIZES.spacing.xs,
  },
  itemPrice: {
    fontSize: SIZES.md,
    fontWeight: 'bold',
    color: COLORS.secondary,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  addButtonDisabled: {
    backgroundColor: COLORS.text.disabled,
  },
  cartSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SIZES.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cartInfo: {
    flex: 1,
  },
  cartItemCount: {
    fontSize: SIZES.sm,
    color: COLORS.text.secondary,
  },
  cartTotal: {
    fontSize: SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  viewCartButton: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: SIZES.spacing.lg,
    paddingVertical: SIZES.spacing.sm,
    borderRadius: SIZES.radius.lg,
  },
  viewCartButtonText: {
    fontSize: SIZES.md,
    fontWeight: 'bold',
    color: COLORS.surface,
  },
});

export default RestaurantMenuScreen;