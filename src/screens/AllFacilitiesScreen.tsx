import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants';

interface FacilityCategory {
  id: string;
  title: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  count: number;
  facilities: string[];
  expanded: boolean;
}

const AllFacilitiesScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { hotelId } = route.params as { hotelId: string };

  // Mock facilities data based on the image
  const [facilitiesData, setFacilitiesData] = useState<FacilityCategory[]>([
    {
      id: '1',
      title: 'Food and Drink',
      icon: 'restaurant',
      count: 4,
      facilities: ['A la carte dinner', 'A la carte lunch', 'Breakfast', 'Vegetarian meal'],
      expanded: true,
    },
    {
      id: '2',
      title: 'Transportation',
      icon: 'car',
      count: 5,
      facilities: ['Airport shuttle', 'Car rental', 'Taxi service', 'Parking', 'Valet parking'],
      expanded: false,
    },
    {
      id: '3',
      title: 'General',
      icon: 'settings',
      count: 8,
      facilities: ['24-hour front desk', 'Concierge', 'Luggage storage', 'Laundry service', 'Room service', 'Housekeeping', 'Currency exchange', 'Tour desk'],
      expanded: false,
    },
    {
      id: '4',
      title: 'Hotel Service',
      icon: 'bed',
      count: 6,
      facilities: ['Daily housekeeping', 'Turndown service', 'Wake-up service', 'Shoe shine', 'Newspaper delivery', 'Express check-in/out'],
      expanded: false,
    },
    {
      id: '5',
      title: 'Business Facilities',
      icon: 'briefcase',
      count: 6,
      facilities: ['Business center', 'Meeting rooms', 'Conference facilities', 'Fax/photocopying', 'Audio/visual equipment', 'Event planning'],
      expanded: false,
    },
    {
      id: '6',
      title: 'Nearby facilities',
      icon: 'location',
      count: 8,
      facilities: ['Shopping mall', 'Restaurants', 'Museums', 'Parks', 'Beach access', 'Golf course', 'Spa services', 'Entertainment venues'],
      expanded: false,
    },
    {
      id: '7',
      title: 'Kids',
      icon: 'happy',
      count: 3,
      facilities: ['Kids club', 'Playground', 'Babysitting service'],
      expanded: false,
    },
    {
      id: '8',
      title: 'Connectivity',
      icon: 'wifi',
      count: 2,
      facilities: ['Free WiFi', 'Internet access'],
      expanded: false,
    },
    {
      id: '9',
      title: 'Public Facilities',
      icon: 'people',
      count: 10,
      facilities: ['Swimming pool', 'Fitness center', 'Spa', 'Library', 'Garden', 'Terrace', 'Bar/lounge', 'Game room', 'Gift shop', 'ATM'],
      expanded: false,
    },
  ]);

  const toggleExpanded = (categoryId: string) => {
    setFacilitiesData(prev =>
      prev.map(category =>
        category.id === categoryId
          ? { ...category, expanded: !category.expanded }
          : category
      )
    );
  };

  const renderFacilityCategory = (category: FacilityCategory) => (
    <View key={category.id} style={styles.categoryContainer}>
      <TouchableOpacity
        style={styles.categoryHeader}
        onPress={() => toggleExpanded(category.id)}
      >
        <View style={styles.categoryLeft}>
          <View style={styles.iconContainer}>
            <Ionicons name={category.icon} size={20} color={COLORS.text.primary} />
          </View>
          <View style={styles.categoryInfo}>
            <Text style={styles.categoryTitle}>{category.title}</Text>
            <Text style={styles.categoryCount}>({category.count} facilities)</Text>
          </View>
        </View>
        <Ionicons
          name={category.expanded ? 'remove' : 'add'}
          size={20}
          color={COLORS.text.secondary}
        />
      </TouchableOpacity>

      {category.expanded && (
        <View style={styles.facilitiesList}>
          {category.facilities.map((facility, index) => (
            <View key={index} style={styles.facilityItem}>
              <View style={styles.bulletPoint} />
              <Text style={styles.facilityText}>{facility}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );

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
        <Text style={styles.headerTitle}>All Facilities</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Facilities List */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {facilitiesData.map(renderFacilityCategory)}
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
    justifyContent: 'space-between',
    alignItems: 'center',
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
    borderRadius: 20,
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
  scrollContent: {
    paddingHorizontal: SIZES.spacing.lg,
    paddingVertical: SIZES.spacing.md,
  },
  categoryContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius.lg,
    marginBottom: SIZES.spacing.sm,
    overflow: 'hidden',
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SIZES.spacing.lg,
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SIZES.spacing.md,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: SIZES.md,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: SIZES.spacing.xs,
  },
  categoryCount: {
    fontSize: SIZES.sm,
    color: COLORS.text.secondary,
  },
  facilitiesList: {
    paddingHorizontal: SIZES.spacing.lg,
    paddingBottom: SIZES.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  facilityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SIZES.spacing.xs,
  },
  bulletPoint: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.text.secondary,
    marginRight: SIZES.spacing.sm,
  },
  facilityText: {
    fontSize: SIZES.sm,
    color: COLORS.text.secondary,
    flex: 1,
  },
});

export default AllFacilitiesScreen;