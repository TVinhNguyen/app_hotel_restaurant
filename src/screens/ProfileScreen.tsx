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
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SIZES, API_CONFIG, STORAGE_KEYS } from '../constants';
import { apiService } from '../services/apiService';
import { useTheme } from '../context/ThemeContext'; // Import Hook
import type { User } from '../types';

const ProfileScreen = () => {
  const navigation = useNavigation<any>();
  const { theme, isDarkMode, toggleTheme } = useTheme(); // Sử dụng theme từ context
  
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setIsLoading(true);
      const storedUser = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }

      const response: any = await apiService.get(API_CONFIG.ENDPOINTS.AUTH.ME);
      
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

  const getAvatarUrl = () => {
    if (user?.avatar) return user.avatar;
    if (user?.name) {
      const name = encodeURIComponent(user.name);
      return `https://ui-avatars.com/api/?name=${name}&background=random&color=fff&size=200`;
    }
    return 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400&q=80';
  };

  const menuItems = [
    {
      id: 'payment',
      title: 'Payment Methods',
      subtitle: 'Manage cards & wallets',
      icon: 'card-outline',
      color: '#4CAF50',
      onPress: () => navigation.navigate('AddNewCard'),
    },
    {
      id: 'support',
      title: 'Help Center',
      subtitle: 'Contact support & FAQ',
      icon: 'help-circle-outline',
      color: '#2196F3',
      onPress: () => navigation.navigate('Support'),
    },
    {
      id: 'about',
      title: 'About Us',
      subtitle: 'App info & privacy policy',
      icon: 'information-circle-outline',
      color: '#9C27B0',
      onPress: () => navigation.navigate('About'),
    },
  ];

  const handleEditProfile = () => {
    navigation.navigate('EditProfile');
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
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
              Alert.alert('Error', 'Logout failed');
            }
          }
        },
      ]
    );
  };

  const renderMenuItem = (item: any, index: number, isLast: boolean) => (
    <TouchableOpacity 
      key={item.id} 
      style={[
        styles.menuItem, 
        !isLast && { borderBottomWidth: 1, borderBottomColor: theme.divider }
      ]} 
      onPress={item.onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.menuItemIconContainer, { backgroundColor: item.color + '15' }]}>
        <Ionicons name={item.icon as any} size={22} color={item.color} />
      </View>
      <View style={styles.menuItemContent}>
        <Text style={[styles.menuItemTitle, { color: theme.text.primary }]}>{item.title}</Text>
        <Text style={[styles.menuItemSubtitle, { color: theme.text.secondary }]}>{item.subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={theme.text.secondary} />
    </TouchableOpacity>
  );

  if (isLoading && !user) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  // Styles động dựa trên theme
  const dynamicStyles = {
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    card: {
      backgroundColor: theme.surface,
      shadowColor: isDarkMode ? '#000' : '#000',
      shadowOpacity: isDarkMode ? 0.3 : 0.05,
    },
    textPrimary: {
      color: theme.text.primary,
    },
    textSecondary: {
      color: theme.text.secondary,
    }
  };

  return (
    <SafeAreaView style={dynamicStyles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.primary} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header Profile Section */}
        <View style={styles.headerSection}>
          <View style={[styles.headerBackground, { backgroundColor: theme.primary }]} />
          <View style={[styles.profileCard, dynamicStyles.card]}>
            
            {/* Top Right Edit Icon */}
            <TouchableOpacity style={styles.topEditButton} onPress={handleEditProfile}>
              <Ionicons name="create-outline" size={24} color={theme.primary} />
            </TouchableOpacity>

            <View style={styles.avatarContainer}>
              <Image
                source={{ uri: getAvatarUrl() }}
                style={[styles.avatar, { borderColor: theme.background }]}
              />
              <TouchableOpacity style={[styles.editAvatarButton, { backgroundColor: theme.primary, borderColor: theme.surface }]} onPress={handleEditProfile}>
                <Ionicons name="camera" size={18} color={theme.surface} />
              </TouchableOpacity>
            </View>
            <Text style={[styles.userName, dynamicStyles.textPrimary]}>{user?.name || 'Guest'}</Text>
            <Text style={[styles.userEmail, dynamicStyles.textSecondary]}>{user?.email || 'Sign in to access profile'}</Text>
            
            {/* Main Edit Profile Button */}
            <TouchableOpacity style={[styles.editProfileBtn, { backgroundColor: theme.primary + '15' }]} onPress={handleEditProfile}>
              <Text style={[styles.editProfileText, { color: theme.primary }]}>Edit Profile</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Settings Section */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionHeader, dynamicStyles.textPrimary]}>Settings</Text>
          <View style={[styles.cardContainer, dynamicStyles.card]}>
            <View style={[styles.settingItem, { borderBottomWidth: 1, borderBottomColor: theme.divider }]}>
              <View style={[styles.menuItemIconContainer, { backgroundColor: theme.primary + '15' }]}>
                <Ionicons name="notifications-outline" size={22} color={theme.primary} />
              </View>
              <Text style={[styles.settingTitle, dynamicStyles.textPrimary]}>Notifications</Text>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: theme.border, true: theme.primary + '80' }}
                thumbColor={notificationsEnabled ? theme.primary : '#f4f3f4'}
              />
            </View>
            <View style={styles.settingItem}>
              <View style={[styles.menuItemIconContainer, { backgroundColor: '#607D8B15' }]}>
                <Ionicons name="moon-outline" size={22} color="#607D8B" />
              </View>
              <Text style={[styles.settingTitle, dynamicStyles.textPrimary]}>Dark Mode</Text>
              <Switch
                value={isDarkMode}
                onValueChange={toggleTheme}
                trackColor={{ false: theme.border, true: theme.primary + '80' }}
                thumbColor={isDarkMode ? theme.primary : '#f4f3f4'}
              />
            </View>
          </View>
        </View>

        {/* General Menu Section */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionHeader, dynamicStyles.textPrimary]}>General</Text>
          <View style={[styles.cardContainer, dynamicStyles.card]}>
            {menuItems.map((item, index) => renderMenuItem(item, index, index === menuItems.length - 1))}
          </View>
        </View>

        {/* Logout */}
        <View style={styles.logoutContainer}>
          <TouchableOpacity 
            style={[styles.logoutButton, { backgroundColor: isDarkMode ? '#332022' : '#FFE5E5' }]} 
            onPress={handleLogout} 
            activeOpacity={0.8}
          >
            <Ionicons name="log-out-outline" size={20} color={theme.error} />
            <Text style={[styles.logoutText, { color: theme.error }]}>Log Out</Text>
          </TouchableOpacity>
          <Text style={[styles.versionText, { color: theme.text.disabled }]}>v1.0.0 • Hotel & Restaurant App</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  headerSection: {
    marginBottom: 60,
  },
  headerBackground: {
    height: 140,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  profileCard: {
    position: 'absolute',
    top: 60,
    left: SIZES.spacing.lg,
    right: SIZES.spacing.lg,
    borderRadius: SIZES.radius.xl,
    padding: SIZES.spacing.xl,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 5,
  },
  topEditButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 8,
    zIndex: 10,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: SIZES.spacing.md,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
  },
  userName: {
    fontSize: SIZES.xl,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: SIZES.sm,
    marginBottom: SIZES.spacing.lg,
  },
  editProfileBtn: {
    paddingHorizontal: SIZES.spacing.xl,
    paddingVertical: SIZES.spacing.sm,
    borderRadius: 20,
  },
  editProfileText: {
    fontWeight: '600',
    fontSize: SIZES.sm,
  },
  sectionContainer: {
    paddingHorizontal: SIZES.spacing.lg,
    marginBottom: SIZES.spacing.xl,
  },
  sectionHeader: {
    fontSize: SIZES.lg,
    fontWeight: 'bold',
    marginBottom: SIZES.spacing.sm,
    marginLeft: 4,
  },
  cardContainer: {
    borderRadius: SIZES.radius.lg,
    paddingVertical: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SIZES.spacing.md,
  },
  menuItemIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SIZES.spacing.md,
  },
  menuItemContent: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: SIZES.md,
    fontWeight: '600',
    marginBottom: 2,
  },
  menuItemSubtitle: {
    fontSize: SIZES.xs,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SIZES.spacing.md,
    justifyContent: 'space-between',
  },
  settingTitle: {
    flex: 1,
    fontSize: SIZES.md,
    fontWeight: '600',
  },
  logoutContainer: {
    paddingHorizontal: SIZES.spacing.lg,
    alignItems: 'center',
    marginBottom: SIZES.spacing.xl,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingVertical: SIZES.spacing.md,
    borderRadius: SIZES.radius.lg,
    marginBottom: SIZES.spacing.lg,
  },
  logoutText: {
    fontWeight: 'bold',
    fontSize: SIZES.md,
    marginLeft: SIZES.spacing.sm,
  },
  versionText: {
    fontSize: SIZES.xs,
  },
});

export default ProfileScreen;