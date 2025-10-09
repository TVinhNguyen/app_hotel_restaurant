import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  TextInput,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants';

const { width } = Dimensions.get('window');

const AddNewCardScreen = () => {
  const navigation = useNavigation();
  
  const [cardNumber, setCardNumber] = useState('');
  const [holderName, setHolderName] = useState('');
  const [expiredDate, setExpiredDate] = useState('');
  const [cvvCode, setCvvCode] = useState('');

  const formatCardNumber = (text: string) => {
    // Remove all non-digits
    const cleaned = text.replace(/\D/g, '');
    // Add spaces every 4 digits
    const formatted = cleaned.replace(/(\d{4})(?=\d)/g, '$1 - ');
    return formatted;
  };

  const formatExpiredDate = (text: string) => {
    // Remove all non-digits
    const cleaned = text.replace(/\D/g, '');
    // Add slash after 2 digits
    if (cleaned.length >= 2) {
      return cleaned.substring(0, 2) + '/' + cleaned.substring(2, 4);
    }
    return cleaned;
  };

  const handleCardNumberChange = (text: string) => {
    const formatted = formatCardNumber(text);
    if (formatted.length <= 19) { // 16 digits + 3 spaces
      setCardNumber(formatted);
    }
  };

  const handleExpiredDateChange = (text: string) => {
    const formatted = formatExpiredDate(text);
    if (formatted.length <= 5) { // MM/YY
      setExpiredDate(formatted);
    }
  };

  const handleCvvChange = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length <= 3) {
      setCvvCode(cleaned);
    }
  };

  const getCardType = () => {
    const firstDigit = cardNumber.replace(/\D/g, '')[0];
    if (firstDigit === '4') return 'visa';
    if (firstDigit === '5') return 'mastercard';
    return 'maestro'; // default
  };

  const getDisplayCardNumber = () => {
    if (cardNumber) {
      return cardNumber;
    }
    return '2894 - 4389 - 4432 - 9432';
  };

  const getDisplayHolderName = () => {
    if (holderName) {
      return holderName;
    }
    return 'Natalie Vernandez';
  };

  const handleSaveCard = () => {
    console.log('Save card:', {
      cardNumber,
      holderName,
      expiredDate,
      cvvCode
    });
    navigation.goBack();
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
        <Text style={styles.headerTitle}>Add New Card</Text>
        <TouchableOpacity style={styles.menuButton}>
          <Ionicons name="ellipsis-vertical" size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Credit Card Preview */}
        <View style={styles.cardPreview}>
          <View style={styles.creditCard}>
            {/* Card Logo */}
            <View style={styles.cardHeader}>
              {getCardType() === 'mastercard' ? (
                <View style={styles.mastercardLogo}>
                  <View style={[styles.circle, styles.circleRed]} />
                  <View style={[styles.circle, styles.circleYellow]} />
                </View>
              ) : (
                <Text style={styles.cardBrand}>Maestro Kard</Text>
              )}
            </View>

            {/* Card Number */}
            <Text style={styles.cardNumberDisplay}>
              {getDisplayCardNumber()}
            </Text>

            {/* Holder Name */}
            <View style={styles.cardBottom}>
              <View>
                <Text style={styles.cardLabel}>Holder Name</Text>
                <Text style={styles.cardHolderName}>{getDisplayHolderName()}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Form Fields */}
        <View style={styles.form}>
          {/* Card Number */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Card Number</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter Card Number"
              placeholderTextColor={COLORS.text.disabled}
              value={cardNumber}
              onChangeText={handleCardNumberChange}
              keyboardType="numeric"
              maxLength={19}
            />
          </View>

          {/* Card Holder Name */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Card Holder Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter Holder Name"
              placeholderTextColor={COLORS.text.disabled}
              value={holderName}
              onChangeText={setHolderName}
              autoCapitalize="words"
            />
          </View>

          {/* Expired and CVV */}
          <View style={styles.rowContainer}>
            <View style={[styles.formGroup, styles.halfWidth]}>
              <Text style={styles.label}>Expired</Text>
              <TextInput
                style={styles.input}
                placeholder="MM/YY"
                placeholderTextColor={COLORS.text.disabled}
                value={expiredDate}
                onChangeText={handleExpiredDateChange}
                keyboardType="numeric"
                maxLength={5}
              />
            </View>

            <View style={[styles.formGroup, styles.halfWidth]}>
              <Text style={styles.label}>CVV Code</Text>
              <TextInput
                style={styles.input}
                placeholder="CVV"
                placeholderTextColor={COLORS.text.disabled}
                value={cvvCode}
                onChangeText={handleCvvChange}
                keyboardType="numeric"
                maxLength={3}
                secureTextEntry
              />
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Save Button */}
      <View style={styles.bottomSection}>
        <TouchableOpacity style={styles.saveButton} onPress={handleSaveCard}>
          <Text style={styles.saveButtonText}>Save</Text>
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
  menuButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: SIZES.spacing.lg,
  },
  cardPreview: {
    marginTop: SIZES.spacing.xl,
    marginBottom: SIZES.spacing.xl,
  },
  creditCard: {
    width: '100%',
    height: 200,
    borderRadius: SIZES.radius.lg,
    padding: SIZES.spacing.lg,
    marginBottom: SIZES.spacing.xl,
    // Remove CSS gradient and use backgroundColor with shadowColor for 3D effect
    backgroundColor: '#667eea',
    shadowColor: '#764ba2',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  cardHeader: {
    alignItems: 'flex-end',
  },
  mastercardLogo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  circle: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  circleRed: {
    backgroundColor: '#EB001B',
    marginRight: -8,
  },
  circleYellow: {
    backgroundColor: '#FF5F00',
  },
  cardBrand: {
    fontSize: SIZES.md,
    fontWeight: 'bold',
    color: COLORS.surface,
    opacity: 0.9,
  },
  cardNumberDisplay: {
    fontSize: SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.surface,
    letterSpacing: 2,
    marginTop: SIZES.spacing.md,
  },
  cardBottom: {
    marginTop: SIZES.spacing.md,
  },
  cardLabel: {
    fontSize: SIZES.xs,
    color: COLORS.surface,
    opacity: 0.8,
    marginBottom: SIZES.spacing.xs,
  },
  cardHolderName: {
    fontSize: SIZES.md,
    fontWeight: 'bold',
    color: COLORS.surface,
    textTransform: 'capitalize',
  },
  form: {
    flex: 1,
  },
  formGroup: {
    marginBottom: SIZES.spacing.lg,
  },
  label: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SIZES.spacing.sm,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius.md,
    paddingHorizontal: SIZES.spacing.md,
    paddingVertical: SIZES.spacing.md,
    fontSize: SIZES.md,
    color: COLORS.text.primary,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SIZES.spacing.md,
  },
  halfWidth: {
    flex: 1,
  },
  bottomSection: {
    padding: SIZES.spacing.lg,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SIZES.spacing.md,
    borderRadius: SIZES.radius.lg,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.surface,
  },
});

export default AddNewCardScreen;