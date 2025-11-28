import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants';
import type { RootStackParamList } from '../types';

type PaymentMethodNavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface PaymentMethod {
  id: string;
  type: 'mastercard' | 'visa' | 'add' | 'qr';
  name: string;
  icon?: string;
  color?: string;
}

interface PaymentMethodModalProps {
  visible: boolean;
  onClose: () => void;
  onPaymentMethodSelect: (method: PaymentMethod) => void;
  selectedMethodId?: string;
}

const PaymentMethodModal: React.FC<PaymentMethodModalProps> = ({
  visible,
  onClose,
  onPaymentMethodSelect,
  selectedMethodId,
}) => {
  const navigation = useNavigation<PaymentMethodNavigationProp>();
  const [tempSelectedId, setTempSelectedId] = useState<string>(selectedMethodId || '');

  const paymentMethods: PaymentMethod[] = [
    {
      id: '1',
      type: 'mastercard',
      name: 'Master Card',
      color: '#FF5F00',
    },
    {
      id: '2',
      type: 'visa',
      name: 'Visa',
      color: '#1A1F71',
    },
    {
      id: '4',
      type: 'qr',
      name: 'QR Pay',
      color: '#2D9CDB',
    },
    {
      id: '3',
      type: 'add',
      name: 'Add Debit Card',
      color: COLORS.primary,
    },
  ];

  const handleMethodSelect = (method: PaymentMethod) => {
    if (method.type === 'add') {
      // Navigate to Add New Card screen
      onClose(); // Close modal first
      navigation.navigate('AddNewCard');
      return;
    }

    // For other types (mastercard, visa, qr) just select
    setTempSelectedId(method.id);
  };

  const handleConfirm = () => {
    const selectedMethod = paymentMethods.find(method => method.id === tempSelectedId);
    if (selectedMethod) {
      onPaymentMethodSelect(selectedMethod);
    }
    onClose();
  };

  const renderPaymentMethod = (method: PaymentMethod) => {
    const isSelected = tempSelectedId === method.id;
    const isAddCard = method.type === 'add';
    const isQR = method.type === 'qr';

    return (
      <TouchableOpacity
        key={method.id}
        style={[styles.methodItem, isAddCard && styles.addCardItem]}
        onPress={() => handleMethodSelect(method)}
      >
        <View style={styles.methodLeft}>
          {isAddCard ? (
            <View style={[styles.methodIcon, { backgroundColor: method.color }]}>
              <Ionicons name="add" size={24} color={COLORS.surface} />
            </View>
          ) : isQR ? (
            <View style={styles.methodIcon}>
              <Ionicons name="qr-code" size={20} color={method.color || COLORS.primary} />
            </View>
          ) : (
            <View style={styles.methodIcon}>
              {method.type === 'mastercard' ? (
                <View style={styles.mastercardIcon}>
                  <View style={[styles.mastercardCircle, styles.mastercardRed]} />
                  <View style={[styles.mastercardCircle, styles.mastercardYellow]} />
                </View>
              ) : (
                <Text style={[styles.visaText, { color: method.color }]}>VISA</Text>
              )}
            </View>
          )}
          <Text style={[styles.methodName, isAddCard && styles.addCardText]}>
            {method.name}
          </Text>
        </View>

        {!isAddCard && (
          <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
            {isSelected && (
              <Ionicons name="checkmark" size={16} color={COLORS.surface} />
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <SafeAreaView style={styles.container}>
          <View style={styles.modal}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Payment Method</Text>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Ionicons name="close" size={24} color={COLORS.text.primary} />
              </TouchableOpacity>
            </View>

            {/* Payment Methods List */}
            <View style={styles.methodsList}>
              {paymentMethods.map(renderPaymentMethod)}
            </View>

            {/* Confirm Button */}
            <TouchableOpacity 
              style={[styles.confirmButton, !tempSelectedId && styles.confirmButtonDisabled]} 
              onPress={handleConfirm}
              disabled={!tempSelectedId}
            >
              <Text style={styles.confirmButtonText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: SIZES.radius.xl,
    borderTopRightRadius: SIZES.radius.xl,
    paddingTop: SIZES.spacing.lg,
    paddingHorizontal: SIZES.spacing.lg,
    paddingBottom: SIZES.spacing.xl,
    minHeight: '50%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.spacing.xl,
  },
  title: {
    fontSize: SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  methodsList: {
    flex: 1,
    gap: SIZES.spacing.md,
  },
  methodItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SIZES.spacing.md,
    paddingHorizontal: SIZES.spacing.sm,
    borderRadius: SIZES.radius.md,
  },
  addCardItem: {
    backgroundColor: 'transparent',
  },
  methodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  methodIcon: {
    width: 48,
    height: 32,
    borderRadius: 8,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SIZES.spacing.md,
    overflow: 'hidden',
  },
  mastercardIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mastercardCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  mastercardRed: {
    backgroundColor: '#EB001B',
    marginRight: -4,
  },
  mastercardYellow: {
    backgroundColor: '#FF5F00',
  },
  visaText: {
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  methodName: {
    fontSize: SIZES.md,
    color: COLORS.text.primary,
    fontWeight: '500',
  },
  addCardText: {
    color: COLORS.text.primary,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  confirmButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SIZES.spacing.md,
    borderRadius: SIZES.radius.lg,
    alignItems: 'center',
    marginTop: SIZES.spacing.lg,
  },
  confirmButtonDisabled: {
    backgroundColor: COLORS.text.disabled,
  },
  confirmButtonText: {
    fontSize: SIZES.md,
    fontWeight: 'bold',
    color: COLORS.surface,
  },
});

export default PaymentMethodModal;