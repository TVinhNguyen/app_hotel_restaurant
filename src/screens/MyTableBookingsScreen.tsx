import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Calendar } from 'react-native-calendars';
import { COLORS, SIZES } from '../constants';
import { propertyService } from '../services/propertyService';

const HomeScreen = () => {
  const navigation = useNavigation<any>();

  /* ================= STATE ================= */
  const [properties, setProperties] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Search modal
  const [isSearchModalVisible, setIsSearchModalVisible] = useState(false);

  // Search fields
  const [searchCity, setSearchCity] = useState<string | null>(null);
  const [checkInDate, setCheckInDate] = useState<string | null>(null);
  const [checkOutDate, setCheckOutDate] = useState<string | null>(null);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [selecting, setSelecting] = useState<'checkin' | 'checkout'>('checkin');

  /* ================= DATE SELECT ================= */
  const onSelectDate = (day: any) => {
    if (selecting === 'checkin') {
      setCheckInDate(day.dateString);
      setCheckOutDate(null);
      setSelecting('checkout');
    } else {
      if (day.dateString <= checkInDate!) return;
      setCheckOutDate(day.dateString);
    }
  };

  /* ================= HANDLE SEARCH ================= */
  const handleSearch = async () => {
    if (!checkInDate || !checkOutDate) return;

    setIsSearchModalVisible(false);
    setIsLoading(true);

    try {
      const res = await propertyService.getProperties({
        search: searchCity ?? '',
        type: 'Hotel',
      });

      setProperties(res?.data || []);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /* ================= UI ================= */
  return (
    <SafeAreaView style={styles.container}>
      {/* ===== HEADER ===== */}
      <View style={styles.header}>
        <Text style={styles.title}>Find your stay</Text>

        <TouchableOpacity
          style={styles.searchBar}
          onPress={() => setIsSearchModalVisible(true)}
        >
          <Text style={{ color: COLORS.text.secondary }}>
            Where are you going?
          </Text>
        </TouchableOpacity>
      </View>

      {/* ===== CONTENT ===== */}
      <ScrollView showsVerticalScrollIndicator={false}>
        {isLoading && <ActivityIndicator style={{ marginTop: 20 }} />}

        {!isLoading &&
          properties.map(item => (
            <TouchableOpacity
              key={item.id}
              style={styles.card}
              onPress={() =>
                navigation.navigate('HotelDetail', { id: item.id })
              }
            >
              <Text style={styles.cardTitle}>{item.name}</Text>
              <Text style={styles.cardSub}>{item.city}</Text>
            </TouchableOpacity>
          ))}
      </ScrollView>

      {/* ================= SEARCH MODAL ================= */}
      <Modal visible={isSearchModalVisible} animationType="slide">
        <SafeAreaView style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Search stay</Text>

          {/* DESTINATION */}
          <Text style={styles.label}>Destination</Text>
          <TouchableOpacity
            style={styles.input}
            onPress={() => setSearchCity('Da Nang')}
          >
            <Text>{searchCity || 'Enter city or area'}</Text>
          </TouchableOpacity>

          {/* DATES */}
          <Text style={styles.label}>Dates</Text>
          <Calendar
            minDate={new Date().toISOString().split('T')[0]}
            onDayPress={onSelectDate}
            markingType="period"
            markedDates={{
              ...(checkInDate && {
                [checkInDate]: { startingDay: true, color: COLORS.primary },
              }),
              ...(checkOutDate && {
                [checkOutDate]: { endingDay: true, color: COLORS.primary },
              }),
            }}
          />

          {/* GUESTS */}
          <Text style={styles.label}>Guests</Text>

          <View style={styles.row}>
            <Text>Adults</Text>
            <View style={styles.counter}>
              <TouchableOpacity onPress={() => setAdults(Math.max(1, adults - 1))}>
                <Text>-</Text>
              </TouchableOpacity>
              <Text>{adults}</Text>
              <TouchableOpacity onPress={() => setAdults(adults + 1)}>
                <Text>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.row}>
            <Text>Children</Text>
            <View style={styles.counter}>
              <TouchableOpacity
                onPress={() => setChildren(Math.max(0, children - 1))}
              >
                <Text>-</Text>
              </TouchableOpacity>
              <Text>{children}</Text>
              <TouchableOpacity onPress={() => setChildren(children + 1)}>
                <Text>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* ACTION */}
          <TouchableOpacity style={styles.searchBtn} onPress={handleSearch}>
            <Text style={{ color: '#fff', fontWeight: '600' }}>Search</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{ marginTop: 16 }}
            onPress={() => setIsSearchModalVisible(false)}
          >
            <Text style={{ textAlign: 'center' }}>Close</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

export default HomeScreen;

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  searchBar: {
    marginTop: 12,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  card: {
    backgroundColor: COLORS.surface,
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
    borderRadius: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  cardSub: {
    marginTop: 4,
    color: COLORS.text.secondary,
  },
  modalContainer: {
    flex: 1,
    padding: 16,
    backgroundColor: COLORS.background,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 16,
  },
  label: {
    marginTop: 16,
    marginBottom: 8,
    fontWeight: '600',
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    justifyContent: 'center',
    paddingHorizontal: 12,
    backgroundColor: COLORS.surface,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  counter: {
    flexDirection: 'row',
    gap: 16,
  },
  searchBtn: {
    marginTop: 24,
    height: 50,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
