import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Image,
  Linking,
  ImageBackground,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES } from '../constants';

const AboutScreen = () => {
  const navigation = useNavigation();

  const handleLinkPress = (url: string) => {
    Linking.openURL(url).catch((err) => console.error('An error occurred', err));
  };

  const features = [
    {
      icon: 'bed-outline',
      title: 'Đặt phòng dễ dàng',
      description: 'Cung cấp nhiều dịch vụ khách sạn đẳng cấp với đầy đủ tiện nghi, giá cả cạnh tranh và dịch vụ chu đáo',
    },
    {
      icon: 'restaurant-outline',
      title: 'Nhà hàng đẳng cấp',
      description: 'Chúng tôi cũng cấp các dịch vụ nhà hàng nổi tiếng, sang trọng, thưởng thức những món ăn ngon hàng đầu',
    },
    {
      icon: 'card-outline',
      title: 'Thanh toán an toàn',
      description: 'Hỗ trợ thanh toán qua QR code với bảo mật cao và giao dịch nhanh chóng.',
    },
    {
      icon: 'star-outline',
      title: 'Ưu đãi hấp dẫn',
      description: 'Nhận ngay các chương trình khuyến mãi độc quyền',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Về chúng tôi</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hero Section with Gradient */}
        <View style={styles.heroSection}>
          <View style={styles.heroGradient}>
            <View style={styles.logoContainer}>
              <View style={styles.logoCircle}>
                <Ionicons name="business" size={48} color={COLORS.surface} />
              </View>
            </View>
            <Text style={styles.heroTitle}>LuxStay</Text>
            <Text style={styles.heroSubtitle}>Đặt Khách Sạn & Nhà Hàng</Text>
            <Text style={styles.heroVersion}>Phiên bản 1.0.0</Text>
          </View>
        </View>

        {/* Mission Statement */}
        <View style={styles.missionCard}>
          <View style={styles.missionIcon}>
            <Ionicons name="rocket" size={32} color={COLORS.primary} />
          </View>
          <Text style={styles.missionTitle}>Sứ mệnh của chúng tôi</Text>
          <Text style={styles.missionText}>
            Mang đến trải nghiệm đặt phòng và ẩm thực tuyệt vời nhất, kết nối bạn với những địa điểm sang trọng và dịch vụ đẳng cấp. Chúng tôi cam kết mang lại sự hài lòng tối đa cho mỗi khách hàng.
          </Text>
        </View>

        {/* Features Grid */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>Tính năng nổi bật</Text>
          <View style={styles.featuresGrid}>
            {features.map((feature, index) => (
              <View key={index} style={styles.featureCard}>
                <View style={styles.featureIconBox}>
                  <Ionicons name={feature.icon as any} size={28} color={COLORS.primary} />
                </View>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDescription}>{feature.description}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.copyright}>
            © 2025 LuxStay. Đã đăng ký bản quyền.
          </Text>
          <Text style={styles.footerSubtext}>
            Được tạo với ❤️ tại Việt Nam
          </Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.spacing.lg,
    paddingTop: SIZES.spacing.md,
    paddingBottom: SIZES.spacing.lg,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  content: {
    flex: 1,
  },
  
  // Hero Section
  heroSection: {
    backgroundColor: COLORS.surface,
    marginBottom: SIZES.spacing.md,
    overflow: 'hidden',
  },
  heroGradient: {
    paddingVertical: SIZES.spacing.xxl * 1.5,
    alignItems: 'center',
    backgroundColor: COLORS.primary,
  },
  logoContainer: {
    marginBottom: SIZES.spacing.lg,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  heroTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: COLORS.surface,
    marginBottom: SIZES.spacing.xs,
    letterSpacing: 1,
  },
  heroSubtitle: {
    fontSize: SIZES.md,
    color: COLORS.surface,
    opacity: 0.9,
    marginBottom: SIZES.spacing.xs,
  },
  heroVersion: {
    fontSize: SIZES.sm,
    color: COLORS.surface,
    opacity: 0.7,
  },

  // Stats Section
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    paddingVertical: SIZES.spacing.lg,
    marginBottom: SIZES.spacing.md,
    borderRadius: SIZES.radius.lg,
    marginHorizontal: SIZES.spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: COLORS.border,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SIZES.spacing.xs / 2,
  },
  statLabel: {
    fontSize: SIZES.sm,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },

  // Mission Card
  missionCard: {
    backgroundColor: COLORS.surface,
    marginHorizontal: SIZES.spacing.lg,
    marginBottom: SIZES.spacing.md,
    padding: SIZES.spacing.lg,
    borderRadius: SIZES.radius.lg,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  missionIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.spacing.md,
  },
  missionTitle: {
    fontSize: SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: SIZES.spacing.md,
  },
  missionText: {
    fontSize: SIZES.md,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },

  // Features Section
  featuresSection: {
    paddingHorizontal: SIZES.spacing.lg,
    marginBottom: SIZES.spacing.md,
  },
  sectionTitle: {
    fontSize: SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: SIZES.spacing.md,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -SIZES.spacing.xs,
  },
  featureCard: {
    width: '48%',
    backgroundColor: COLORS.surface,
    padding: SIZES.spacing.md,
    borderRadius: SIZES.radius.lg,
    marginHorizontal: '1%',
    marginBottom: SIZES.spacing.md,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  featureIconBox: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.spacing.sm,
  },
  featureTitle: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SIZES.spacing.xs,
    textAlign: 'center',
  },
  featureDescription: {
    fontSize: SIZES.sm,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },

  // Footer
  footer: {
    alignItems: 'center',
    paddingVertical: SIZES.spacing.xl,
    paddingHorizontal: SIZES.spacing.lg,
  },
  copyright: {
    fontSize: SIZES.sm,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: SIZES.spacing.xs,
  },
  footerSubtext: {
    fontSize: SIZES.sm,
    color: COLORS.text.disabled,
    textAlign: 'center',
  },
});

export default AboutScreen;