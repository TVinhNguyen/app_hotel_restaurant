import React from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SIZES } from '../constants';

export interface SearchParams {
  checkIn: Date | null;
  checkOut: Date | null;
  adults: number;
  children: number;
}

interface SearchModalProps {
  visible: boolean;
  onClose: () => void;
  onSearch: (params: SearchParams) => void;

  checkIn: Date | null;
  checkOut: Date | null;

  guests: {
    adults: number;
    children: number;
  };

  onOpenCheckIn: () => void;
  onOpenCheckOut: () => void;
  onOpenGuest: () => void;
}

const formatDate = (date?: Date | null) => {
  if (!date) return 'Select date';
  return date.toLocaleDateString('en-GB');
};

const SearchModal: React.FC<SearchModalProps> = ({
  visible,
  onClose,
  onSearch,
  checkIn,
  checkOut,
  guests,
  onOpenCheckIn,
  onOpenCheckOut,
  onOpenGuest,
}) => {
  const totalGuests =
    (guests?.adults ?? 1) + (guests?.children ?? 0);

  const handleSearchPress = () => {
    onSearch({
      checkIn,
      checkOut,
      adults: guests?.adults ?? 1,
      children: guests?.children ?? 0,
    });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      presentationStyle="overFullScreen"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <SafeAreaView style={styles.container} edges={['bottom']}>
          <View style={styles.modal}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Search</Text>
              <TouchableOpacity onPress={onClose}>
                <Ionicons
                  name="close"
                  size={24}
                  color={COLORS.text.primary}
                />
              </TouchableOpacity>
            </View>

            {/* Check-in */}
            <TouchableOpacity
              style={styles.row}
              onPress={onOpenCheckIn}
            >
              <Ionicons
                name="calendar-outline"
                size={22}
                color={COLORS.primary}
              />
              <View>
                <Text style={styles.label}>Check-in</Text>
                <Text style={styles.value}>
                  {formatDate(checkIn)}
                </Text>
              </View>
            </TouchableOpacity>

            {/* Check-out */}
            <TouchableOpacity
              style={styles.row}
              onPress={onOpenCheckOut}
            >
              <Ionicons
                name="calendar-outline"
                size={22}
                color={COLORS.primary}
              />
              <View>
                <Text style={styles.label}>Check-out</Text>
                <Text style={styles.value}>
                  {formatDate(checkOut)}
                </Text>
              </View>
            </TouchableOpacity>

            {/* Guests */}
            <TouchableOpacity
              style={styles.row}
              onPress={onOpenGuest}
            >
              <Ionicons
                name="people-outline"
                size={22}
                color={COLORS.primary}
              />
              <View>
                <Text style={styles.label}>Guests</Text>
                <Text style={styles.value}>
                  {totalGuests} guests
                </Text>
              </View>
            </TouchableOpacity>

            {/* Search Button */}
            <TouchableOpacity
              style={styles.searchBtn}
              onPress={handleSearchPress}
            >
              <Text style={styles.searchText}>Search</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

export default SearchModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: SIZES.spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.spacing.lg,
  },
  title: {
    fontSize: SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  label: {
    fontSize: SIZES.sm,
    color: COLORS.text.secondary,
  },
  value: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  searchBtn: {
    marginTop: 24,
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  searchText: {
    color: '#fff',
    fontSize: SIZES.md,
    fontWeight: 'bold',
  },
});
