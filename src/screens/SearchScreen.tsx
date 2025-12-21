import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StatusBar,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SIZES } from '../constants';
import DatePickerModal from '../components/DatePickerModal';
import GuestPickerModal from '../components/GuestPickerModal';

export interface SearchParams {
  location: string;
  checkIn?: Date ;
  checkOut?: Date ;
  guests: {
    adults: number;
    children: number;
  };
}

const SearchScreen = () => {
  const navigation = useNavigation<any>();
  const [location, setLocation] = useState('');
  const [checkIn, setCheckIn] = useState<Date | undefined>(undefined);
    const [checkOut, setCheckOut] = useState<Date | undefined>(undefined);
  const [guests, setGuests] = useState({ adults: 2, children: 0 });
  const [showCheckInPicker, setShowCheckInPicker] = useState(false);
  const [showCheckOutPicker, setShowCheckOutPicker] = useState(false);
  const [showGuestPicker, setShowGuestPicker] = useState(false);

  const formatDate = (date?: Date | null) => {
    if (!date) return 'Chọn ngày';
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric'
    };
    return date.toLocaleDateString('vi-VN', {
        weekday: 'short',
        day: 'numeric',
        month: 'numeric',
        year: 'numeric',
    });

  };

  const getGuestsText = () => {
    const total = guests.adults + guests.children;
    if (total === 0) return 'Chọn số khách';

    const parts: string[] = [];

    if (guests.adults > 0) {
        parts.push(`${guests.adults} người lớn`);
    }

    if (guests.children > 0) {
        parts.push(`${guests.children} trẻ em`);
    }

    return parts.join(', ');
};


  const handleSearch = () => {
    if (location.trim() !== '' && (guests.adults + guests.children) > 0) {
        const searchParams: SearchParams = {
        location,
        checkIn,
        checkOut,
        guests,
        };

        navigation.navigate('MainTabs', {
        screen: 'Home',
        params: { searchParams },
        });
    }
    };


  const canSearch = location.trim() !== '' && (guests.adults + guests.children) > 0;

  const getNights = () => {
    if (!checkIn || !checkOut) return 0;
    return Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
  };

  const resetForm = () => {
    setLocation('');
    setCheckIn(undefined);
    setCheckOut(undefined);
    setGuests({ adults: 2, children: 0 });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={styles.backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tìm kiếm khách sạn</Text>
        <TouchableOpacity onPress={resetForm} style={styles.resetButton}>
          <Text style={styles.resetText}>Đặt lại</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Location Input */}
        <View style={styles.section}>
          <Text style={styles.label}>
            <Ionicons name="location" size={16} color={COLORS.primary} /> Điểm đến
          </Text>
          <View style={styles.inputContainer}>
            <Ionicons name="search-outline" size={20} color={COLORS.text.secondary} />
            <TextInput
              style={styles.input}
              placeholder="Thành phố, tên khách sạn hoặc khu vực"
              value={location}
              onChangeText={setLocation}
              placeholderTextColor={COLORS.text.secondary}
              autoCapitalize="words"
            />
            {location ? (
              <TouchableOpacity onPress={() => setLocation('')}>
                <Ionicons name="close-circle" size={20} color={COLORS.text.secondary} />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        {/* Guests Section */}
        <View style={styles.section}>
          <Text style={styles.label}>
            <Ionicons name="people" size={16} color={COLORS.primary} /> Số khách
          </Text>
          <TouchableOpacity
            style={styles.guestContainer}
            onPress={() => setShowGuestPicker(true)}
            activeOpacity={0.7}
          >
            <View style={styles.guestInfo}>
              <Ionicons name="people-outline" size={24} color={COLORS.text.secondary} />
              <Text style={[
                styles.guestText, 
                (guests.adults + guests.children) === 0 && styles.placeholderText
              ]}>
                {getGuestsText()}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.text.secondary} />
          </TouchableOpacity>
        </View>

        {/* Dates Section */}
        <View style={styles.section}>
          <Text style={styles.label}>
            <Ionicons name="calendar" size={16} color={COLORS.primary} /> Ngày lưu trú (không bắt buộc)
          </Text>
          
          <View style={styles.dateRow}>
            {/* Check-in */}
            <TouchableOpacity
              style={styles.dateBox}
              onPress={() => setShowCheckInPicker(true)}
              activeOpacity={0.7}
            >
              <Text style={styles.dateLabel}>Nhận phòng</Text>
              <Text style={[styles.dateText, !checkIn && styles.placeholderText]}>
                {formatDate(checkIn)}
              </Text>
            </TouchableOpacity>

            {/* Arrow */}
            <View style={styles.arrowContainer}>
              <Ionicons name="arrow-forward" size={20} color={COLORS.text.secondary} />
            </View>

            {/* Check-out */}
            <TouchableOpacity
              style={styles.dateBox}
              onPress={() => setShowCheckOutPicker(true)}
              activeOpacity={0.7}
            >
              <Text style={styles.dateLabel}>Trả phòng</Text>
              <Text style={[styles.dateText, !checkOut && styles.placeholderText]}>
                {formatDate(checkOut)}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Nights Display */}
          {checkIn && checkOut && (
            <View style={styles.nightsBadge}>
              <Ionicons name="moon" size={14} color={COLORS.primary} />
              <Text style={styles.nightsText}>
                {getNights()} đêm {getNights() > 1 ? 's' : ''}
              </Text>
            </View>
          )}
        </View>

        {/* Popular Destinations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Điểm đến phổ biến</Text>
          <View style={styles.popularGrid}>
            {[
              { name: 'Đà Nẵng', icon: 'sunny' },
              { name: 'Thành phố Hồ Chí Minh', icon: 'business' },
              { name: 'Hà Nội', icon: 'flag' },
              { name: 'Nha Trang', icon: 'water' },
              { name: 'Hội An', icon: 'moon' },
              { name: 'Phú Quốc', icon: 'boat' },
            ].map((city) => (
              <TouchableOpacity
                key={city.name}
                style={[
                  styles.popularChip,
                  location === city.name && styles.popularChipActive
                ]}
                onPress={() => setLocation(city.name)}
                activeOpacity={0.7}
              >
                <Ionicons 
                  name={city.icon as any} 
                  size={16} 
                  color={location === city.name ? COLORS.surface : COLORS.primary} 
                />
                <Text style={[
                  styles.popularText,
                  location === city.name && styles.popularTextActive
                ]}>
                  {city.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Quick Filters */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bộ lọc nhanh</Text>
          <View style={styles.quickFilters}>
            <TouchableOpacity style={styles.quickFilterChip} activeOpacity={0.7}>
              <Ionicons name="star" size={16} color={COLORS.warning} />
              <Text style={styles.quickFilterText}>Đánh giá cao nhất</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickFilterChip} activeOpacity={0.7}>
              <Ionicons name="cash-outline" size={16} color={COLORS.success} />
              <Text style={styles.quickFilterText}>Giá tốt nhất</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickFilterChip} activeOpacity={0.7}>
              <Ionicons name="location-outline" size={16} color={COLORS.primary} />
              <Text style={styles.quickFilterText}>Gần tôi</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={20} color={COLORS.primary} />
          <Text style={styles.infoText}>
            Ngày nhận phòng và trả phòng là tùy chọn. Bạn có thể tìm kiếm theo địa điểm và khách trước, sau đó lọc theo ngày sau.
          </Text>
        </View>
      </ScrollView>

      {/* Search Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.searchButton, !canSearch && styles.searchButtonDisabled]}
          onPress={handleSearch}
          disabled={!canSearch}
          activeOpacity={0.8}
        >
          <Ionicons name="search" size={22} color={COLORS.surface} />
          <Text style={styles.searchButtonText}>Tìm kiếm khách sạn</Text>
        </TouchableOpacity>
      </View>

      {/* Date Pickers & Guest Picker - Không bị conflict vì render trên Screen */}
      <DatePickerModal
        visible={showCheckInPicker}
        onClose={() => setShowCheckInPicker(false)}
        onDateSelect={(date) => {
          setCheckIn(date);
          setShowCheckInPicker(false);
          // Auto-set checkout to next day if not set
          if (!checkOut || checkOut <= date) {
            const nextDay = new Date(date);
            nextDay.setDate(nextDay.getDate() + 1);
            setCheckOut(nextDay);
          }
        }}
        selectedDate={checkIn}
        title="Chọn ngày nhận phòng"
        minimumDate={new Date()}
      />

      <DatePickerModal
        visible={showCheckOutPicker}
        onClose={() => setShowCheckOutPicker(false)}
        onDateSelect={(date) => {
          setCheckOut(date);
          setShowCheckOutPicker(false);
        }}
        selectedDate={checkOut}
        title="Chọn ngày trả phòng"
        minimumDate={checkIn || new Date()}
      />

      <GuestPickerModal
        visible={showGuestPicker}
        onClose={() => setShowGuestPicker(false)}
        guests={guests}
        onGuestsChange={setGuests}
      />
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
    paddingVertical: SIZES.spacing.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    padding: SIZES.spacing.sm,
  },
  headerTitle: {
    fontSize: SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  resetButton: {
    padding: SIZES.spacing.sm,
  },
  resetText: {
    fontSize: SIZES.md,
    color: COLORS.primary,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SIZES.spacing.lg,
    paddingBottom: SIZES.spacing.xl,
  },
  section: {
    marginTop: SIZES.spacing.xl,
  },
  label: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SIZES.spacing.md,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius.lg,
    paddingHorizontal: SIZES.spacing.md,
    height: 56,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    gap: SIZES.spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: SIZES.md,
    color: COLORS.text.primary,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.spacing.sm,
  },
  dateBox: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius.lg,
    padding: SIZES.spacing.md,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    minHeight: 70,
    justifyContent: 'center',
  },
  dateLabel: {
    fontSize: SIZES.xs,
    color: COLORS.text.secondary,
    marginBottom: 4,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  dateText: {
    fontSize: SIZES.md,
    color: COLORS.text.primary,
    fontWeight: '600',
  },
  arrowContainer: {
    paddingHorizontal: 4,
  },
  nightsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: SIZES.spacing.md,
    paddingVertical: SIZES.spacing.sm,
    borderRadius: SIZES.radius.lg,
    marginTop: SIZES.spacing.sm,
    gap: SIZES.spacing.xs,
  },
  nightsText: {
    fontSize: SIZES.sm,
    color: COLORS.primary,
    fontWeight: '600',
  },
  guestContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius.lg,
    padding: SIZES.spacing.md,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    minHeight: 56,
  },
  guestInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.spacing.sm,
    flex: 1,
  },
  guestText: {
    fontSize: SIZES.md,
    color: COLORS.text.primary,
    fontWeight: '500',
  },
  placeholderText: {
    color: COLORS.text.secondary,
    fontWeight: '400',
  },
  sectionTitle: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SIZES.spacing.md,
  },
  popularGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SIZES.spacing.sm,
  },
  popularChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: SIZES.spacing.md,
    paddingVertical: SIZES.spacing.sm,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    gap: SIZES.spacing.xs,
  },
  popularChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  popularText: {
    fontSize: SIZES.sm,
    color: COLORS.text.primary,
    fontWeight: '500',
  },
  popularTextActive: {
    color: COLORS.surface,
    fontWeight: '600',
  },
  quickFilters: {
    flexDirection: 'row',
    gap: SIZES.spacing.sm,
    flexWrap: 'wrap',
  },
  quickFilterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: SIZES.spacing.md,
    paddingVertical: SIZES.spacing.sm,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    gap: SIZES.spacing.xs,
  },
  quickFilterText: {
    fontSize: SIZES.sm,
    color: COLORS.text.primary,
    fontWeight: '500',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#E3F2FD',
    padding: SIZES.spacing.md,
    borderRadius: SIZES.radius.lg,
    marginTop: SIZES.spacing.xl,
    gap: SIZES.spacing.sm,
  },
  infoText: {
    flex: 1,
    fontSize: SIZES.sm,
    color: COLORS.text.primary,
    lineHeight: 20,
  },
  footer: {
    padding: SIZES.spacing.lg,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: SIZES.spacing.lg,
    borderRadius: SIZES.radius.lg,
    gap: SIZES.spacing.sm,
    elevation: 2,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  searchButtonDisabled: {
    backgroundColor: COLORS.text.disabled,
    elevation: 0,
    shadowOpacity: 0,
  },
  searchButtonText: {
    fontSize: SIZES.md,
    fontWeight: 'bold',
    color: COLORS.surface,
  },
});

export default SearchScreen;