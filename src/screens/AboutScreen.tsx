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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants';

const AboutScreen = () => {
  const navigation = useNavigation();

  const handleLinkPress = (url: string) => {
    Linking.openURL(url).catch((err) => console.error('An error occurred', err));
  };

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
        {/* App Logo & Version */}
        <View style={styles.logoSection}>
          <View style={styles.logoContainer}>
            {/* Thay thế bằng logo thật của bạn nếu có */}
            <Ionicons name="business" size={60} color={COLORS.primary} />
          </View>
          <Text style={styles.appName}>Hotel & Restaurant</Text>
          <Text style={styles.appVersion}>Phiên bản 1.0.0</Text>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.description}>
            Ứng dụng đặt phòng khách sạn và nhà hàng hàng đầu, mang đến trải nghiệm nghỉ dưỡng và ẩm thực tuyệt vời nhất cho bạn. Chúng tôi kết nối bạn với những địa điểm sang trọng và dịch vụ đẳng cấp.
          </Text>
        </View>

        {/* Contact Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Liên hệ</Text>
          
          <TouchableOpacity 
            style={styles.contactItem}
            onPress={() => handleLinkPress('tel:+84123456789')}
          >
            <View style={styles.iconBox}>
              <Ionicons name="call" size={20} color={COLORS.primary} />
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactLabel}>Hotline</Text>
              <Text style={styles.contactValue}>1900 1234</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.text.secondary} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.contactItem}
            onPress={() => handleLinkPress('mailto:support@hotelapp.com')}
          >
            <View style={styles.iconBox}>
              <Ionicons name="mail" size={20} color={COLORS.primary} />
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactLabel}>Email</Text>
              <Text style={styles.contactValue}>support@hotelapp.com</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.text.secondary} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.contactItem}
            onPress={() => handleLinkPress('https://www.google.com')}
          >
            <View style={styles.iconBox}>
              <Ionicons name="globe" size={20} color={COLORS.primary} />
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactLabel}>Website</Text>
              <Text style={styles.contactValue}>www.hotelapp.com</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.text.secondary} />
          </TouchableOpacity>
        </View>

        {/* Legal */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pháp lý</Text>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuText}>Điều khoản sử dụng</Text>
            <Ionicons name="chevron-forward" size={20} color={COLORS.text.secondary} />
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuText}>Chính sách bảo mật</Text>
            <Ionicons name="chevron-forward" size={20} color={COLORS.text.secondary} />
          </TouchableOpacity>
        </View>

        <Text style={styles.copyright}>© 2025 Hotel & Restaurant App. All rights reserved.</Text>
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
  logoSection: {
    alignItems: 'center',
    paddingVertical: SIZES.spacing.xl,
    backgroundColor: COLORS.surface,
    marginBottom: SIZES.spacing.md,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 20,
    backgroundColor: COLORS.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.spacing.md,
  },
  appName: {
    fontSize: SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: SIZES.spacing.xs,
  },
  appVersion: {
    fontSize: SIZES.sm,
    color: COLORS.text.secondary,
  },
  section: {
    backgroundColor: COLORS.surface,
    marginTop: SIZES.spacing.md,
    paddingVertical: SIZES.spacing.md,
  },
  description: {
    fontSize: SIZES.md,
    color: COLORS.text.secondary,
    lineHeight: 24,
    paddingHorizontal: SIZES.spacing.lg,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: SIZES.md,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: SIZES.spacing.md,
    paddingHorizontal: SIZES.spacing.lg,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SIZES.spacing.md,
    paddingHorizontal: SIZES.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SIZES.spacing.md,
  },
  contactInfo: {
    flex: 1,
  },
  contactLabel: {
    fontSize: SIZES.sm,
    color: COLORS.text.secondary,
  },
  contactValue: {
    fontSize: SIZES.md,
    color: COLORS.text.primary,
    fontWeight: '500',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SIZES.spacing.md,
    paddingHorizontal: SIZES.spacing.lg,
  },
  menuText: {
    fontSize: SIZES.md,
    color: COLORS.text.primary,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.divider,
    marginLeft: SIZES.spacing.lg,
  },
  copyright: {
    textAlign: 'center',
    fontSize: SIZES.sm,
    color: COLORS.text.disabled,
    marginVertical: SIZES.spacing.xl,
  },
});

export default AboutScreen;