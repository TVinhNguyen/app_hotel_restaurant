import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants';

interface GuestPickerModalProps {
  visible: boolean;
  onClose: () => void;
  guests: {
    adults: number;
    children: number;
  };
  onGuestsChange: (guests: { adults: number; children: number }) => void;
}

const GuestPickerModal: React.FC<GuestPickerModalProps> = ({
  visible,
  onClose,
  guests,
  onGuestsChange,
}) => {
  const [localGuests, setLocalGuests] = useState(guests);

  // Sync với props khi modal mở
  useEffect(() => {
    if (visible) {
      setLocalGuests(guests);
    }
  }, [visible, guests]);

  const updateGuests = (type: 'adults' | 'children', operation: 'increment' | 'decrement') => {
    setLocalGuests((prev) => {
      const newGuests = { ...prev };
      if (operation === 'increment') {
        newGuests[type] = prev[type] + 1;
      } else if (operation === 'decrement' && prev[type] > 0) {
        newGuests[type] = prev[type] - 1;
      }
      return newGuests;
    });
  };

  const handleApply = () => {
    onGuestsChange(localGuests);
    onClose();
  };

  const getTotalGuests = () => {
    return localGuests.adults + localGuests.children;
  };

  return (
    <Modal 
      visible={visible} 
      transparent 
      animationType="slide" 
      onRequestClose={onClose}
      statusBarTranslucent={true}
      presentationStyle="overFullScreen"
    >
      <View style={styles.overlay}>
        <SafeAreaView style={styles.container} edges={['bottom']}>
          <View style={styles.modal}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Chọn số khách</Text>
              <TouchableOpacity 
                onPress={onClose} 
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close" size={24} color={COLORS.text.primary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
              {/* Adults Row */}
              <View style={styles.guestRow}>
                <View style={styles.guestInfo}>
                  <View style={styles.iconContainer}>
                    <Ionicons name="person" size={24} color={COLORS.primary} />
                  </View>
                  <View style={styles.guestTextContainer}>
                    <Text style={styles.guestLabel}>Số người lớn</Text>
                    <Text style={styles.guestSubLabel}>Từ 13 tuổi</Text>
                  </View>
                </View>
                <View style={styles.counter}>
                  <TouchableOpacity
                    style={[
                      styles.counterButton,
                      localGuests.adults === 0 && styles.counterButtonDisabled,
                    ]}
                    onPress={() => updateGuests('adults', 'decrement')}
                    disabled={localGuests.adults === 0}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name="remove"
                      size={20}
                      color={localGuests.adults === 0 ? COLORS.text.disabled : COLORS.primary}
                    />
                  </TouchableOpacity>
                  <Text style={styles.counterText}>{localGuests.adults}</Text>
                  <TouchableOpacity
                    style={styles.counterButton}
                    onPress={() => updateGuests('adults', 'increment')}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="add" size={20} color={COLORS.primary} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Children Row */}
              <View style={styles.guestRow}>
                <View style={styles.guestInfo}>
                  <View style={styles.iconContainer}>
                    <Ionicons name="happy" size={24} color={COLORS.primary} />
                  </View>
                  <View style={styles.guestTextContainer}>
                    <Text style={styles.guestLabel}>Trẻ em</Text>
                    <Text style={styles.guestSubLabel}>Tuổi 2-12</Text>
                  </View>
                </View>
                <View style={styles.counter}>
                  <TouchableOpacity
                    style={[
                      styles.counterButton,
                      localGuests.children === 0 && styles.counterButtonDisabled,
                    ]}
                    onPress={() => updateGuests('children', 'decrement')}
                    disabled={localGuests.children === 0}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name="remove"
                      size={20}
                      color={localGuests.children === 0 ? COLORS.text.disabled : COLORS.primary}
                    />
                  </TouchableOpacity>
                  <Text style={styles.counterText}>{localGuests.children}</Text>
                  <TouchableOpacity
                    style={styles.counterButton}
                    onPress={() => updateGuests('children', 'increment')}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="add" size={20} color={COLORS.primary} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Summary Box */}
              {getTotalGuests() > 0 && (
                <View style={styles.summaryBox}>
                  <Ionicons name="people" size={20} color={COLORS.primary} />
                  <Text style={styles.summaryText}>
                    Total: {getTotalGuests()} guest{getTotalGuests() > 1 ? 's' : ''}
                  </Text>
                </View>
              )}

              {/* Info Note */}
              <View style={styles.noteBox}>
                <Ionicons name="information-circle-outline" size={18} color={COLORS.text.secondary} />
                <Text style={styles.noteText}>
                  Most hotels allow 2-3 guests per room. Room allocation can be specified during booking.
                </Text>
              </View>
            </ScrollView>

            {/* Apply Button */}
            <TouchableOpacity 
              style={styles.applyButton} 
              onPress={handleApply}
              activeOpacity={0.8}
            >
              <Text style={styles.applyButtonText}>Done</Text>
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
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: SIZES.radius.xl,
    borderTopRightRadius: SIZES.radius.xl,
    paddingBottom: SIZES.spacing.lg,
    maxHeight: '70%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.spacing.lg,
    paddingTop: SIZES.spacing.lg,
    paddingBottom: SIZES.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    fontSize: SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  content: {
    paddingHorizontal: SIZES.spacing.lg,
    paddingTop: SIZES.spacing.lg,
  },
  guestRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SIZES.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  guestInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: SIZES.spacing.md,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  guestTextContainer: {
    flex: 1,
  },
  guestLabel: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  guestSubLabel: {
    fontSize: SIZES.sm,
    color: COLORS.text.secondary,
  },
  counter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.spacing.md,
  },
  counterButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
  },
  counterButtonDisabled: {
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
  },
  counterText: {
    fontSize: SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    minWidth: 32,
    textAlign: 'center',
  },
  summaryBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    padding: SIZES.spacing.md,
    borderRadius: SIZES.radius.lg,
    marginTop: SIZES.spacing.lg,
    gap: SIZES.spacing.sm,
  },
  summaryText: {
    flex: 1,
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  noteBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.background,
    padding: SIZES.spacing.md,
    borderRadius: SIZES.radius.lg,
    marginTop: SIZES.spacing.md,
    gap: SIZES.spacing.sm,
  },
  noteText: {
    flex: 1,
    fontSize: SIZES.sm,
    color: COLORS.text.secondary,
    lineHeight: 20,
  },
  applyButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SIZES.spacing.lg,
    borderRadius: SIZES.radius.lg,
    alignItems: 'center',
    marginHorizontal: SIZES.spacing.lg,
    marginTop: SIZES.spacing.lg,
    elevation: 2,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  applyButtonText: {
    fontSize: SIZES.md,
    fontWeight: 'bold',
    color: COLORS.surface,
  },
});

export default GuestPickerModal;