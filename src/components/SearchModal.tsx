import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { COLORS, SIZES } from '../constants';

interface SearchModalProps {
  visible: boolean;
  onClose: () => void;
  onSearch: (searchParams: SearchParams) => void;
}

export interface SearchParams {
  location: string;
  checkIn: Date;
  checkOut: Date;
  adults: number;
  children: number;
}

const SearchModal: React.FC<SearchModalProps> = ({ visible, onClose, onSearch }) => {
  const [location, setLocation] = useState('');
  const [checkIn, setCheckIn] = useState(new Date());
  const [checkOut, setCheckOut] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  });
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [showCheckInPicker, setShowCheckInPicker] = useState(false);
  const [showCheckOutPicker, setShowCheckOutPicker] = useState(false);
  const [pickerMode, setPickerMode] = useState<'checkin' | 'checkout'>('checkin');

  const popularLocations = [
    { id: '1', name: 'Hanoi', icon: '🏛️' },
    { id: '2', name: 'Ho Chi Minh City', icon: '🌆' },
    { id: '3', name: 'Da Nang', icon: '🏖️' },
    { id: '4', name: 'Hoi An', icon: '🏮' },
    { id: '5', name: 'Nha Trang', icon: '🏝️' },
    { id: '6', name: 'Phu Quoc', icon: '🌴' },
  ];

  const formatDate = (date: Date) => {
    const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    const months = ['Thg 1', 'Thg 2', 'Thg 3', 'Thg 4', 'Thg 5', 'Thg 6', 
                    'Thg 7', 'Thg 8', 'Thg 9', 'Thg 10', 'Thg 11', 'Thg 12'];
    const day = days[date.getDay()];
    const dateNum = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day}, ${dateNum} ${month} ${year}`;
  };

  const formatShortDate = (date: Date) => {
    const dateNum = date.getDate();
    const month = date.getMonth() + 1;
    return `${dateNum}/${month}`;
  };

  const calculateNights = () => {
    const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleSearch = () => {
    // Validation
    if (!location.trim()) {
      alert('⚠️ Vui lòng chọn địa điểm trước khi tìm kiếm');
      return;
    }

    if (checkOut <= checkIn) {
      alert('⚠️ Ngày trả phòng phải sau ngày nhận phòng');
      return;
    }

    // Success
    onSearch({
      location: location.trim(),
      checkIn,
      checkOut,
      adults,
      children,
    });
    
    onClose();
  };

  const adjustCount = (type: 'adults' | 'children', increment: boolean) => {
    if (type === 'adults') {
      const newValue = increment ? adults + 1 : adults - 1;
      if (newValue >= 1 && newValue <= 10) {
        setAdults(newValue);
      }
    } else {
      const newValue = increment ? children + 1 : children - 1;
      if (newValue >= 0 && newValue <= 10) {
        setChildren(newValue);
      }
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || (pickerMode === 'checkin' ? checkIn : checkOut);
    
    if (event.type === 'dismissed') {
      setShowCheckInPicker(false);
      setShowCheckOutPicker(false);
      return;
    }

    if (pickerMode === 'checkin') {
      setCheckIn(currentDate);
      // Auto-adjust checkout if needed
      if (currentDate >= checkOut) {
        const newCheckOut = new Date(currentDate);
        newCheckOut.setDate(newCheckOut.getDate() + 1);
        setCheckOut(newCheckOut);
      }
      
      // On Android, close picker after selection
      if (Platform.OS === 'android') {
        setShowCheckInPicker(false);
      }
    } else {
      // Ensure checkout is after checkin
      if (currentDate > checkIn) {
        setCheckOut(currentDate);
      } else {
        alert('Ngày trả phòng phải sau ngày nhận phòng');
      }
      
      // On Android, close picker after selection
      if (Platform.OS === 'android') {
        setShowCheckOutPicker(false);
      }
    }
  };

  const openCheckInPicker = () => {
    setPickerMode('checkin');
    setShowCheckInPicker(true);
    setShowCheckOutPicker(false);
  };

  const openCheckOutPicker = () => {
    setPickerMode('checkout');
    setShowCheckOutPicker(true);
    setShowCheckInPicker(false);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={28} color={COLORS.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Tìm kiếm</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Location Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <Ionicons name="location" size={20} color={COLORS.primary} /> Bạn muốn đi đâu?
            </Text>
            <View style={styles.inputContainer}>
              <Ionicons name="search-outline" size={20} color={COLORS.primary} />
              <TextInput
                style={styles.input}
                placeholder="Nhập thành phố, địa điểm..."
                value={location}
                onChangeText={setLocation}
                placeholderTextColor={COLORS.text.secondary}
                autoCapitalize="words"
              />
              {location.length > 0 && (
                <TouchableOpacity onPress={() => setLocation('')}>
                  <Ionicons name="close-circle" size={20} color={COLORS.text.secondary} />
                </TouchableOpacity>
              )}
            </View>

            {/* Popular Locations */}
            <View style={styles.popularContainer}>
              <Text style={styles.popularTitle}>Gợi ý địa điểm phổ biến</Text>
              <View style={styles.popularGrid}>
                {popularLocations.map((loc) => (
                  <TouchableOpacity
                    key={loc.id}
                    style={[
                      styles.popularItem,
                      location === loc.name && styles.popularItemSelected
                    ]}
                    onPress={() => setLocation(loc.name)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.popularIcon}>{loc.icon}</Text>
                    <Text style={[
                      styles.popularName,
                      location === loc.name && styles.popularNameSelected
                    ]}>{loc.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          {/* Dates Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <Ionicons name="calendar" size={20} color={COLORS.primary} /> Chọn ngày
            </Text>
            
            <View style={styles.datesContainer}>
              {/* Check-in */}
              <TouchableOpacity
                style={[styles.dateBox, showCheckInPicker && styles.dateBoxActive]}
                onPress={openCheckInPicker}
                activeOpacity={0.7}
              >
                <View style={styles.dateHeader}>
                  <Ionicons name="log-in-outline" size={18} color={COLORS.primary} />
                  <Text style={styles.dateLabel}>Nhận phòng</Text>
                </View>
                <Text style={styles.dateValue}>{formatShortDate(checkIn)}</Text>
                <Text style={styles.dateFull}>{formatDate(checkIn)}</Text>
              </TouchableOpacity>

              {/* Arrow & Nights */}
              <View style={styles.divider}>
                <Ionicons name="arrow-forward" size={20} color={COLORS.primary} />
                <View style={styles.nightsBadge}>
                  <Ionicons name="moon" size={12} color={COLORS.primary} />
                  <Text style={styles.nightsText}>{calculateNights()}</Text>
                </View>
              </View>

              {/* Check-out */}
              <TouchableOpacity
                style={[styles.dateBox, showCheckOutPicker && styles.dateBoxActive]}
                onPress={openCheckOutPicker}
                activeOpacity={0.7}
              >
                <View style={styles.dateHeader}>
                  <Ionicons name="log-out-outline" size={18} color={COLORS.primary} />
                  <Text style={styles.dateLabel}>Trả phòng</Text>
                </View>
                <Text style={styles.dateValue}>{formatShortDate(checkOut)}</Text>
                <Text style={styles.dateFull}>{formatDate(checkOut)}</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.dateHint}>
              💡 Nhấn vào ngày để thay đổi
            </Text>
          </View>

          {/* Guests Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <Ionicons name="people" size={20} color={COLORS.primary} /> Số khách
            </Text>
            
            {/* Adults */}
            <View style={styles.guestRow}>
              <View style={styles.guestInfo}>
                <Text style={styles.guestLabel}>
                  <Ionicons name="person" size={16} /> Người lớn
                </Text>
                <Text style={styles.guestSubLabel}>Từ 18 tuổi trở lên</Text>
              </View>
              <View style={styles.counter}>
                <TouchableOpacity
                  style={[styles.counterButton, adults <= 1 && styles.counterButtonDisabled]}
                  onPress={() => adjustCount('adults', false)}
                  disabled={adults <= 1}
                  activeOpacity={0.7}
                >
                  <Ionicons 
                    name="remove" 
                    size={20} 
                    color={adults <= 1 ? COLORS.text.disabled : COLORS.primary} 
                  />
                </TouchableOpacity>
                <Text style={styles.counterValue}>{adults}</Text>
                <TouchableOpacity
                  style={[styles.counterButton, adults >= 10 && styles.counterButtonDisabled]}
                  onPress={() => adjustCount('adults', true)}
                  disabled={adults >= 10}
                  activeOpacity={0.7}
                >
                  <Ionicons 
                    name="add" 
                    size={20} 
                    color={adults >= 10 ? COLORS.text.disabled : COLORS.primary} 
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Children */}
            <View style={styles.guestRow}>
              <View style={styles.guestInfo}>
                <Text style={styles.guestLabel}>
                  <Ionicons name="person-outline" size={16} /> Trẻ em
                </Text>
                <Text style={styles.guestSubLabel}>Dưới 18 tuổi</Text>
              </View>
              <View style={styles.counter}>
                <TouchableOpacity
                  style={[styles.counterButton, children <= 0 && styles.counterButtonDisabled]}
                  onPress={() => adjustCount('children', false)}
                  disabled={children <= 0}
                  activeOpacity={0.7}
                >
                  <Ionicons 
                    name="remove" 
                    size={20} 
                    color={children <= 0 ? COLORS.text.disabled : COLORS.primary} 
                  />
                </TouchableOpacity>
                <Text style={styles.counterValue}>{children}</Text>
                <TouchableOpacity
                  style={[styles.counterButton, children >= 10 && styles.counterButtonDisabled]}
                  onPress={() => adjustCount('children', true)}
                  disabled={children >= 10}
                  activeOpacity={0.7}
                >
                  <Ionicons 
                    name="add" 
                    size={20} 
                    color={children >= 10 ? COLORS.text.disabled : COLORS.primary} 
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Summary */}
          <View style={styles.summaryContainer}>
            <View style={styles.summaryRow}>
              <Ionicons name="checkmark-circle" size={22} color={COLORS.primary} />
              <View style={styles.summaryTextContainer}>
                <Text style={styles.summaryTitle}>Tóm tắt tìm kiếm</Text>
                <Text style={styles.summaryText}>
                  {location || 'Chưa chọn địa điểm'} • {calculateNights()} đêm • {adults + children} khách
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Search Button */}
        <View style={styles.footer}>
          <TouchableOpacity 
            style={[styles.searchButton, !location.trim() && styles.searchButtonDisabled]} 
            onPress={handleSearch}
            activeOpacity={0.8}
          >
            <Ionicons name="search" size={22} color={COLORS.surface} />
            <Text style={styles.searchButtonText}>Tìm kiếm ngay</Text>
          </TouchableOpacity>
        </View>

        {/* Date Pickers */}
        {(showCheckInPicker || showCheckOutPicker) && (
          <DateTimePicker
            value={pickerMode === 'checkin' ? checkIn : checkOut}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleDateChange}
            minimumDate={pickerMode === 'checkin' ? new Date() : (() => {
              const minDate = new Date(checkIn);
              minDate.setDate(minDate.getDate() + 1);
              return minDate;
            })()}
          />
        )}
      </View>
    </Modal>
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
    paddingVertical: SIZES.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  closeButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  section: {
    padding: SIZES.spacing.lg,
    backgroundColor: COLORS.surface,
    marginBottom: SIZES.spacing.sm,
  },
  sectionTitle: {
    fontSize: SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: SIZES.spacing.md,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: SIZES.radius.md,
    paddingHorizontal: SIZES.spacing.md,
    height: 54,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  input: {
    flex: 1,
    fontSize: SIZES.md,
    color: COLORS.text.primary,
    marginLeft: SIZES.spacing.sm,
  },
  popularContainer: {
    marginTop: SIZES.spacing.lg,
  },
  popularTitle: {
    fontSize: SIZES.sm,
    fontWeight: '600',
    color: COLORS.text.secondary,
    marginBottom: SIZES.spacing.sm,
  },
  popularGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SIZES.spacing.sm,
  },
  popularItem: {
    width: '31%',
    backgroundColor: COLORS.background,
    borderRadius: SIZES.radius.md,
    padding: SIZES.spacing.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  popularItemSelected: {
    backgroundColor: COLORS.lightBlue,
    borderColor: COLORS.primary,
  },
  popularIcon: {
    fontSize: 28,
    marginBottom: 4,
  },
  popularName: {
    fontSize: SIZES.xs,
    color: COLORS.text.primary,
    textAlign: 'center',
    fontWeight: '500',
  },
  popularNameSelected: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  datesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SIZES.spacing.sm,
  },
  dateBox: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderRadius: SIZES.radius.md,
    padding: SIZES.spacing.md,
    borderWidth: 2,
    borderColor: COLORS.border,
    minHeight: 90,
  },
  dateBoxActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.lightBlue,
  },
  dateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  dateLabel: {
    fontSize: SIZES.xs,
    color: COLORS.text.secondary,
    marginLeft: 6,
    fontWeight: '600',
  },
  dateValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 4,
  },
  dateFull: {
    fontSize: SIZES.xs,
    color: COLORS.text.secondary,
  },
  divider: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  nightsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.lightBlue,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: SIZES.radius.sm,
    gap: 4,
  },
  nightsText: {
    fontSize: SIZES.xs,
    fontWeight: '700',
    color: COLORS.primary,
  },
  dateHint: {
    fontSize: SIZES.xs,
    color: COLORS.text.secondary,
    marginTop: SIZES.spacing.sm,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  guestRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SIZES.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  guestInfo: {
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
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  counterButtonDisabled: {
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
    opacity: 0.5,
  },
  counterValue: {
    fontSize: SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    minWidth: 40,
    textAlign: 'center',
  },
  summaryContainer: {
    backgroundColor: COLORS.lightBlue,
    padding: SIZES.spacing.lg,
    marginHorizontal: SIZES.spacing.lg,
    marginBottom: SIZES.spacing.lg,
    borderRadius: SIZES.radius.lg,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.spacing.md,
  },
  summaryTextContainer: {
    flex: 1,
  },
  summaryTitle: {
    fontSize: SIZES.sm,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 4,
  },
  summaryText: {
    fontSize: SIZES.md,
    color: COLORS.text.primary,
    fontWeight: '500',
  },
  footer: {
    padding: SIZES.spacing.lg,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  searchButton: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SIZES.spacing.lg,
    borderRadius: SIZES.radius.lg,
    gap: SIZES.spacing.sm,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  searchButtonDisabled: {
    backgroundColor: COLORS.text.disabled,
    opacity: 0.6,
  },
  searchButtonText: {
    fontSize: SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.surface,
  },
});

export default SearchModal;