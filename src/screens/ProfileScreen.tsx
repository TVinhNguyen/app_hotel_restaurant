import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Alert,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SIZES, API_CONFIG, STORAGE_KEYS } from '../constants';
import { apiService } from '../services/apiService';
import type { User } from '../types';

const ProfileScreen = () => {
  const navigation = useNavigation<any>();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setIsLoading(true);
      // First try to get from local storage for immediate display
      const storedUser = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }

      // Then fetch fresh data from API
      const response: any = await apiService.get(API_CONFIG.ENDPOINTS.AUTH.ME);
      console.log('Profile response:', response);

      if (response && response.user) {
        setUser(response.user);
        await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(response.user));
      } else if (response) {
        setUser(response);
        await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(response));
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const menuItems = [
    {
      id: 'bookings',
      title: 'Đặt phòng của tôi',
      subtitle: 'Xem lịch sử đặt phòng',
      icon: 'bed',
      onPress: () => navigation.navigate('MyBooking'),
    },
    {
      id: 'orders',
      title: 'Đặt bàn của tôi',
      subtitle: 'Xem lịch sử đặt bàn',
      icon: 'restaurant',
      onPress: () => navigation.navigate('MyTableBookings'),
    },
    {
      id: 'favorites',
      title: 'Yêu thích',
      subtitle: 'Phòng và món ăn yêu thích',
      icon: 'heart',
      onPress: () => Alert.alert('Thông báo', 'Tính năng đang được phát triển'),
    },
    {
      id: 'payment',
      title: 'Phương thức thanh toán',
      subtitle: 'Quản lý thẻ và ví điện tử',
      icon: 'card',
      onPress: () => navigation.navigate('AddNewCard'),
    },
    {
      id: 'support',
      title: 'Hỗ trợ khách hàng',
      subtitle: 'Liên hệ với chúng tôi',
      icon: 'help-circle',
      onPress: () => Alert.alert('Thông báo', 'Tính năng đang được phát triển'),
    },
    {
      id: 'about',
      title: 'Về chúng tôi',
      subtitle: 'Thông tin ứng dụng',
      icon: 'information-circle',
      onPress: () => Alert.alert('Thông báo', 'Tính năng đang được phát triển'),
    },
  ];

  const handleEditProfile = () => {
    navigation.navigate('EditProfile');
  };

  const handleLogout = () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất không?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đăng xuất',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.multiRemove([STORAGE_KEYS.USER_TOKEN, STORAGE_KEYS.USER_DATA]);
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Lỗi', 'Đăng xuất thất bại');
            }
          }
        },
      ]
    );
  };

  const renderMenuItem = (item: any) => (
    <TouchableOpacity key={item.id} style={styles.menuItem} onPress={item.onPress}>
      <View style={styles.menuItemLeft}>
        <View style={styles.menuItemIcon}>
          <Ionicons name={item.icon as any} size={20} color={COLORS.primary} />
        </View>
        <View style={styles.menuItemContent}>
          <Text style={styles.menuItemTitle}>{item.title}</Text>
          <Text style={styles.menuItemSubtitle}>{item.subtitle}</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color={COLORS.text.secondary} />
    </TouchableOpacity>
  );

  if (isLoading && !user) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Tài khoản</Text>
        </View>

        {/* User Info */}
        <View style={styles.userInfoContainer}>
          <View style={styles.avatarContainer}>
            <Image
              source={{ uri: user?.avatar || 'https://via.placeholder.com/100x100/4CAF50/FFFFFF?text=User' }}
              style={styles.avatar}
            />
            <TouchableOpacity style={styles.editAvatarButton}>
              <Ionicons name="camera" size={16} color={COLORS.surface} />
            </TouchableOpacity>
          </View>
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{user?.name || 'Khách'}</Text>
            <Text style={styles.userEmail}>{user?.email || 'Chưa đăng nhập'}</Text>
            <Text style={styles.userPhone}>{user?.phone || ''}</Text>
          </View>
          <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
            <Ionicons name="pencil" size={20} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        {/* Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cài đặt</Text>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="notifications" size={20} color={COLORS.primary} />
              <Text style={styles.settingTitle}>Thông báo</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: COLORS.border, true: COLORS.primaryLight }}
              thumbColor={notificationsEnabled ? COLORS.primary : COLORS.text.disabled}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="moon" size={20} color={COLORS.primary} />
              <Text style={styles.settingTitle}>Chế độ tối</Text>
            </View>
            <Switch
              value={darkModeEnabled}
              onValueChange={setDarkModeEnabled}
              trackColor={{ false: COLORS.border, true: COLORS.primaryLight }}
              thumbColor={darkModeEnabled ? COLORS.primary : COLORS.text.disabled}
            />
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chung</Text>
          <View style={styles.menuContainer}>
            {menuItems.map(renderMenuItem)}
          </View>
        </View>

        {/* App Info */}
        <View style={styles.section}>
          <View style={styles.appInfo}>
            <Text style={styles.appName}>Hotel & Restaurant App</Text>
            <Text style={styles.appVersion}>Phiên bản 1.0.0</Text>
          </View>
        </View>

        {/* Logout Button */}
        <View style={styles.logoutContainer}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out" size={20} color={COLORS.error} />
            <Text style={styles.logoutText}>Đăng xuất</Text>
          </TouchableOpacity>
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
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: COLORS.primary,
    padding: SIZES.spacing.lg,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.surface,
  },
  userInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SIZES.spacing.lg,
    marginTop: SIZES.spacing.sm,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.surface,
  },
  userDetails: {
    flex: 1,
    marginLeft: SIZES.spacing.md,
  },
  userName: {
    fontSize: SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: SIZES.spacing.xs,
  },
  userEmail: {
    fontSize: SIZES.sm,
    color: COLORS.text.secondary,
    marginBottom: SIZES.spacing.xs,
  },
  userPhone: {
    fontSize: SIZES.sm,
    color: COLORS.text.secondary,
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    marginTop: SIZES.spacing.sm,
  },
  sectionTitle: {
    fontSize: SIZES.md,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: SIZES.spacing.sm,
    marginHorizontal: SIZES.spacing.lg,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: SIZES.spacing.lg,
    paddingVertical: SIZES.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingTitle: {
    fontSize: SIZES.md,
    color: COLORS.text.primary,
    marginLeft: SIZES.spacing.md,
  },
  menuContainer: {
    backgroundColor: COLORS.surface,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.spacing.lg,
    paddingVertical: SIZES.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SIZES.spacing.md,
  },
  menuItemContent: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: SIZES.md,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: SIZES.spacing.xs,
  },
  menuItemSubtitle: {
    fontSize: SIZES.sm,
    color: COLORS.text.secondary,
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: SIZES.spacing.lg,
  },
  appName: {
    fontSize: SIZES.md,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: SIZES.spacing.xs,
  },
  appVersion: {
    fontSize: SIZES.sm,
    color: COLORS.text.secondary,
  },
  logoutContainer: {
    padding: SIZES.spacing.lg,
    marginTop: SIZES.spacing.md,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    paddingVertical: SIZES.spacing.md,
    borderRadius: SIZES.radius.lg,
    borderWidth: 1,
    borderColor: COLORS.error + '30',
  },
  logoutText: {
    fontSize: SIZES.md,
    fontWeight: 'bold',
    color: COLORS.error,
    marginLeft: SIZES.spacing.sm,
  },
});

export default ProfileScreen;