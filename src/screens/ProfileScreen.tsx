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
  Linking,
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
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  useEffect(() => {
    checkLoginStatus();
  }, []);

  const checkLoginStatus = async () => {
    try {
      setIsLoading(true);
      const token = await AsyncStorage.getItem(STORAGE_KEYS.USER_TOKEN);
      const storedUser = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
      
      if (token && storedUser) {
        setIsLoggedIn(true);
        setUser(JSON.parse(storedUser));
        // Fetch fresh data
        fetchUserProfile();
      } else {
        setIsLoggedIn(false);
        setUser(null);
      }
    } catch (error) {
      console.error('Error checking login:', error);
      setIsLoggedIn(false);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserProfile = async () => {
    try {
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
    }
  };

  const getAvatarUrl = () => {
    if (user?.avatar) return user.avatar;
    if (user?.name) {
      const name = encodeURIComponent(user.name);
      return `https://ui-avatars.com/api/?name=${name}&background=F5F5F5&color=333&size=200&bold=true`;
    }
    return 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400&q=80';
  };

  const features = [
    {
      icon: 'bed-outline',
      title: 'Đặt phòng dễ dàng',
      description: 'Tìm và đặt phòng khách sạn chỉ trong vài thao tác đơn giản',
    },
    {
      icon: 'restaurant-outline',
      title: 'Nhà hàng đẳng cấp',
      description: 'Khám phá và đặt bàn tại các nhà hàng cao cấp',
    },
    {
      icon: 'card-outline',
      title: 'Thanh toán an toàn',
      description: 'Hỗ trợ phương thức thanh toán tiện lợi và bảo mật',
    },
    {
      icon: 'star-outline',
      title: 'Ưu đãi hấp dẫn',
      description: 'Nhận ngay các chương trình khuyến mãi độc quyền',
    },
  ];

  const faqs = [
    {
      question: 'Làm thế nào để hủy đặt phòng?',
      answer: 'Bạn có thể hủy đặt phòng trong mục "Đặt phòng của tôi". Vui lòng kiểm tra chính sách hủy của từng khách sạn.',
    },
    {
      question: 'Tôi có thể thay đổi ngày đặt phòng không?',
      answer: 'Có, vui lòng liên hệ trực tiếp với bộ phận CSKH hoặc khách sạn để được hỗ trợ thay đổi.',
    },
    {
      question: 'Phương thức thanh toán nào được chấp nhận?',
      answer: 'Chúng tôi chấp nhận thẻ tín dụng, chuyển khoản ngân hàng và ví điện tử (Momo, ZaloPay).',
    },
  ];

  const openLink = (url: string) => {
    Linking.openURL(url).catch(err => console.error("Couldn't load page", err));
  };

  const menuItems = [
    {
      id: 'support',
      title: 'Trung tâm trợ giúp',
      subtitle: 'Liên hệ hỗ trợ & FAQ',
      icon: 'help-circle-outline',
      color: '#2196F3',
      onPress: () => navigation.navigate('Support'),
    },
    {
      id: 'about',
      title: 'Về chúng tôi',
      subtitle: 'Thông tin ứng dụng & chính sách bảo mật',
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
              console.log('🚪 [Logout] Clearing user data...');
              
              // Clear all user-related data
              await AsyncStorage.multiRemove([STORAGE_KEYS.USER_TOKEN, STORAGE_KEYS.USER_DATA]);
              
              // Verify data was cleared
              const remainingToken = await AsyncStorage.getItem(STORAGE_KEYS.USER_TOKEN);
              const remainingUser = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
              console.log('✅ [Logout] Token cleared:', remainingToken === null);
              console.log('✅ [Logout] User data cleared:', remainingUser === null);
              
              // Reset navigation to Login screen
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            } catch (error) {
              console.error('❌ [Logout] Logout error:', error);
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

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  // Guest UI - Not logged in
  if (!isLoggedIn) {
    return (
      <SafeAreaView style={dynamicStyles.container}>
        <StatusBar barStyle="light-content" backgroundColor={theme.primary} />
        <View style={styles.guestContainer}>
          <View style={[styles.guestIconContainer, { backgroundColor: theme.primary + '15' }]}>
            <Ionicons name="person-outline" size={80} color={theme.primary} />
          </View>
          <Text style={[styles.guestTitle, dynamicStyles.textPrimary]}>Welcome, Guest!</Text>
          <Text style={[styles.guestSubtitle, dynamicStyles.textSecondary]}>
            Login to access your profile, bookings, and personalized features
          </Text>
          <TouchableOpacity 
            style={[styles.guestLoginButton, { backgroundColor: theme.primary }]}
            onPress={() => navigation.navigate('Login')}
            activeOpacity={0.8}
          >
            <Ionicons name="log-in-outline" size={20} color={theme.surface} />
            <Text style={[styles.guestLoginText, { color: theme.surface }]}>Login Now</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.guestRegisterButton}
            onPress={() => navigation.navigate('Register')}
            activeOpacity={0.8}
          >
            <Text style={[styles.guestRegisterText, { color: theme.primary }]}>Don't have an account? Register</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={dynamicStyles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.primary} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header Profile Section */}
        <View style={styles.headerSection}>
          <View style={[styles.headerBackground, { backgroundColor: theme.primary }]} />
          <View style={[styles.profileCard, dynamicStyles.card]}>
            
           

            <View style={styles.avatarContainer}>
              <Image
                source={{ uri: getAvatarUrl() }}
                style={[styles.avatar, { borderColor: theme.background }]}
              />
            </View>
            <Text style={[styles.userName, dynamicStyles.textPrimary]}>{user?.name || 'Guest'}</Text>
            <Text style={[styles.userEmail, dynamicStyles.textSecondary]}>{user?.email || 'Sign in to access profile'}</Text>
            
            {/* Main Edit Profile Button */}
            <TouchableOpacity style={[styles.editProfileBtn, { backgroundColor: theme.primary + '15' }]} onPress={handleEditProfile}>
              <Text style={[styles.editProfileText, { color: theme.primary }]}>Edit Profile</Text>
            </TouchableOpacity>
          </View>
        </View>

       
        {/* Support Section - Contact Channels */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionHeader, dynamicStyles.textPrimary]}>Liên hệ nhanh</Text>
          <View style={styles.contactGrid}>
            <TouchableOpacity style={[styles.contactCard, dynamicStyles.card]} onPress={() => openLink('tel:19001234')}>
              <View style={[styles.contactIconContainer, { backgroundColor: isDarkMode ? '#1565C015' : '#E3F2FD' }]}>
                <Ionicons name="call" size={24} color="#1E88E5" />
              </View>
              <Text style={[styles.contactLabel, dynamicStyles.textPrimary]}>Tổng đài</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.contactCard, dynamicStyles.card]} onPress={() => openLink('https://zalo.me')}>
              <View style={[styles.contactIconContainer, { backgroundColor: isDarkMode ? '#2E7D3215' : '#E8F5E9' }]}>
                <Ionicons name="chatbubbles" size={24} color="#43A047" />
              </View>
              <Text style={[styles.contactLabel, dynamicStyles.textPrimary]}>Zalo Chat</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.contactCard, dynamicStyles.card]} onPress={() => openLink('mailto:support@luxstay.com')}>
              <View style={[styles.contactIconContainer, { backgroundColor: isDarkMode ? '#E6530015' : '#FFF3E0' }]}>
                <Ionicons name="mail" size={24} color="#FB8C00" />
              </View>
              <Text style={[styles.contactLabel, dynamicStyles.textPrimary]}>Email</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* FAQ Section */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionHeader, dynamicStyles.textPrimary]}>Câu hỏi thường gặp</Text>
          {faqs.map((faq, index) => (
            <View key={index} style={[styles.faqItem, dynamicStyles.card]}>
              <View style={styles.faqHeader}>
                <Ionicons name="help-circle-outline" size={20} color={theme.primary} />
                <Text style={[styles.faqQuestion, dynamicStyles.textPrimary]}>{faq.question}</Text>
              </View>
              <Text style={[styles.faqAnswer, dynamicStyles.textSecondary]}>{faq.answer}</Text>
            </View>
          ))}
        </View>
       
        {/* Mission Statement */}
        <View style={styles.sectionContainer}>
          <View style={[styles.missionCard, dynamicStyles.card]}>
            <View style={[styles.missionIcon, { backgroundColor: theme.primary + '15' }]}>
              <Ionicons name="rocket" size={32} color={theme.primary} />
            </View>
            <Text style={[styles.missionTitle, dynamicStyles.textPrimary]}>Sứ mệnh của chúng tôi</Text>
            <Text style={[styles.missionText, dynamicStyles.textSecondary]}>
              Mang đến trải nghiệm đặt phòng và ẩm thực tuyệt vời nhất, kết nối bạn với những địa điểm sang trọng và dịch vụ đẳng cấp. Chúng tôi cam kết mang lại sự hài lòng tối đa cho mỗi khách hàng.
            </Text>
          </View>
        </View>

        {/* Features Section */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionHeader, dynamicStyles.textPrimary]}>Tính năng nổi bật</Text>
          <View style={styles.featuresGrid}>
            {features.map((feature, index) => (
              <View key={index} style={[styles.featureCard, dynamicStyles.card]}>
                <View style={[styles.featureIconBox, { backgroundColor: theme.primary + '15' }]}>
                  <Ionicons name={feature.icon as any} size={28} color={theme.primary} />
                </View>
                <Text style={[styles.featureTitle, dynamicStyles.textPrimary]}>{feature.title}</Text>
                <Text style={[styles.featureDescription, dynamicStyles.textSecondary]}>{feature.description}</Text>
              </View>
            ))}
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
            <Text style={[styles.logoutText, { color: theme.error }]}>Đăng xuất</Text>
          </TouchableOpacity>
          <Text style={[styles.versionText, { color: theme.text.disabled }]}>v1.0.0 • Ứng dụng Khách sạn & Nhà hàng</Text>
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
    marginBottom: 210,
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
  contactGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  contactCard: {
    alignItems: 'center',
    width: '31%',
    padding: SIZES.spacing.md,
    borderRadius: SIZES.radius.md,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 2,
  },
  contactIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.spacing.sm,
  },
  contactLabel: {
    fontSize: SIZES.sm,
    fontWeight: '500',
  },
  faqItem: {
    padding: SIZES.spacing.md,
    borderRadius: SIZES.radius.md,
    marginBottom: SIZES.spacing.sm,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    elevation: 2,
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.spacing.xs,
  },
  faqQuestion: {
    fontSize: SIZES.md,
    fontWeight: '600',
    marginLeft: SIZES.spacing.sm,
    flex: 1,
  },
  faqAnswer: {
    fontSize: SIZES.sm,
    lineHeight: 20,
    marginLeft: 28,
  },
  missionCard: {
    borderRadius: SIZES.radius.xl,
    padding: SIZES.spacing.lg,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 2,
  },
  missionIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.spacing.md,
  },
  missionTitle: {
    fontSize: SIZES.lg,
    fontWeight: 'bold',
    marginBottom: SIZES.spacing.md,
  },
  missionText: {
    fontSize: SIZES.md,
    textAlign: 'center',
    lineHeight: 24,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -SIZES.spacing.xs,
  },
  featureCard: {
    width: '48%',
    padding: SIZES.spacing.md,
    borderRadius: SIZES.radius.lg,
    marginHorizontal: '1%',
    marginBottom: SIZES.spacing.md,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 2,
  },
  featureIconBox: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.spacing.sm,
  },
  featureTitle: {
    fontSize: SIZES.md,
    fontWeight: '600',
    marginBottom: SIZES.spacing.xs,
    textAlign: 'center',
  },
  featureDescription: {
    fontSize: SIZES.sm,
    textAlign: 'center',
    lineHeight: 20,
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
  guestContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SIZES.spacing.xl * 2,
  },
  guestIconContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.spacing.xl,
  },
  guestTitle: {
    fontSize: SIZES.xxl,
    fontWeight: 'bold',
    marginBottom: SIZES.spacing.sm,
    textAlign: 'center',
  },
  guestSubtitle: {
    fontSize: SIZES.md,
    textAlign: 'center',
    marginBottom: SIZES.spacing.xl * 2,
    lineHeight: 22,
  },
  guestLoginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingVertical: SIZES.spacing.md,
    borderRadius: SIZES.radius.lg,
    marginBottom: SIZES.spacing.md,
  },
  guestLoginText: {
    fontSize: SIZES.md,
    fontWeight: 'bold',
    marginLeft: SIZES.spacing.sm,
  },
  guestRegisterButton: {
    paddingVertical: SIZES.spacing.sm,
  },
  guestRegisterText: {
    fontSize: SIZES.sm,
    fontWeight: '600',
  },
});

export default ProfileScreen;