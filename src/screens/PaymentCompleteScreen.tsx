import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { useNavigation, useRoute, RouteProp, CompositeNavigationProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants';
import { RootStackParamList } from '../types';

type PaymentCompleteScreenNavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<RootStackParamList, 'PaymentComplete'>,
  BottomTabNavigationProp<RootStackParamList>
>;
type PaymentCompleteScreenRouteProp = RouteProp<RootStackParamList, 'PaymentComplete'>;

const PaymentCompleteScreen = () => {
  const navigation = useNavigation<PaymentCompleteScreenNavigationProp>();
  const route = useRoute<PaymentCompleteScreenRouteProp>();
  const { bookingId, amount, paymentMethod } = route.params;

  const scaleAnim = new Animated.Value(0);
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    // Animation cho checkmark icon
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleBackToHome = () => {
    navigation.navigate('Main', { screen: 'Home' } as any);
  };

  const handleViewBooking = () => {
    navigation.navigate('BookingDetail', {
      bookingId: bookingId,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBackToHome}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuButton}>
          <Ionicons name="ellipsis-vertical" size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Payment Card Illustration */}
        <View style={styles.illustrationContainer}>
          <View style={styles.cardBackground}>
            <View style={styles.cardTop}>
              <Ionicons name="card" size={24} color={COLORS.primary} />
              <View style={styles.cardBrandContainer}>
                <Text style={styles.cardBrandText}>InstaStay</Text>
              </View>
            </View>
            
            <View style={styles.cardDetails}>
              <View style={styles.cardIcon}>
                <Ionicons name="wallet" size={32} color={COLORS.primary} />
              </View>
              <View style={styles.cardLines}>
                <View style={[styles.cardLine, styles.cardLineLong]} />
                <View style={[styles.cardLine, styles.cardLineShort]} />
              </View>
            </View>
          </View>

          {/* Success Checkmark */}
          <Animated.View
            style={[
              styles.checkmarkContainer,
              {
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <Ionicons name="checkmark" size={40} color={COLORS.surface} />
          </Animated.View>
        </View>

        {/* Success Message */}
        <Animated.View style={[styles.messageContainer, { opacity: fadeAnim }]}>
          <Text style={styles.title}>Payment Complete</Text>
          <Text style={styles.description}>
            Your payment has been processed successfully. Thank you for booking with us!
          </Text>
        </Animated.View>

        {/* Booking Details */}
        {bookingId && (
          <View style={styles.detailsContainer}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Booking ID</Text>
              <Text style={styles.detailValue}>#{bookingId}</Text>
            </View>
            {amount && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Amount Paid</Text>
                <Text style={styles.detailValue}>${amount.toFixed(2)}</Text>
              </View>
            )}
            {paymentMethod && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Payment Method</Text>
                <Text style={styles.detailValue}>{paymentMethod}</Text>
              </View>
            )}
          </View>
        )}
      </View>

      {/* Bottom Buttons */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={handleBackToHome}
        >
          <Text style={styles.secondaryButtonText}>Back to Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleViewBooking}
        >
          <Text style={styles.primaryButtonText}>View Booking</Text>
        </TouchableOpacity>
      </View>
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
    paddingHorizontal: SIZES.spacing.lg,
    paddingTop: SIZES.spacing.md,
    paddingBottom: SIZES.spacing.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SIZES.spacing.xl,
  },
  illustrationContainer: {
    position: 'relative',
    marginBottom: SIZES.spacing.xxl,
  },
  cardBackground: {
    width: 280,
    height: 180,
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius.xl,
    padding: SIZES.spacing.lg,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.spacing.xl,
  },
  cardBrandContainer: {
    paddingHorizontal: SIZES.spacing.md,
    paddingVertical: SIZES.spacing.xs,
    backgroundColor: COLORS.background,
    borderRadius: SIZES.radius.sm,
  },
  cardBrandText: {
    fontSize: SIZES.sm,
    fontWeight: '600',
    color: COLORS.primary,
  },
  cardDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SIZES.spacing.lg,
  },
  cardIcon: {
    width: 60,
    height: 60,
    borderRadius: SIZES.radius.md,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SIZES.spacing.md,
  },
  cardLines: {
    flex: 1,
  },
  cardLine: {
    height: 12,
    backgroundColor: '#1565C0',
    borderRadius: 6,
    marginBottom: SIZES.spacing.sm,
  },
  cardLineLong: {
    width: '100%',
  },
  cardLineShort: {
    width: '70%',
  },
  checkmarkContainer: {
    position: 'absolute',
    bottom: -20,
    left: '50%',
    marginLeft: -35,
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4CAF50',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  messageContainer: {
    alignItems: 'center',
    marginTop: SIZES.spacing.xl,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: SIZES.spacing.md,
  },
  description: {
    fontSize: SIZES.md,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: SIZES.spacing.md,
  },
  detailsContainer: {
    width: '100%',
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius.lg,
    padding: SIZES.spacing.lg,
    marginTop: SIZES.spacing.xl,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SIZES.spacing.sm,
  },
  detailLabel: {
    fontSize: SIZES.md,
    color: COLORS.text.secondary,
  },
  detailValue: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  footer: {
    paddingHorizontal: SIZES.spacing.xl,
    paddingBottom: SIZES.spacing.xl,
    gap: SIZES.spacing.md,
  },
  secondaryButton: {
    height: 56,
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius.xl,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  secondaryButtonText: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  primaryButton: {
    height: 56,
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radius.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: SIZES.md,
    fontWeight: 'bold',
    color: COLORS.surface,
  },
});

export default PaymentCompleteScreen;
