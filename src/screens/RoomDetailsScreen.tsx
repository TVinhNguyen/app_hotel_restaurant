import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Alert,
  Dimensions,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants';
import type { Room } from '../types';

const { width } = Dimensions.get('window');

const RoomDetailsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { roomId } = route.params as { roomId: string };
  
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Mock room data
  const mockRoom: Room = {
    id: roomId,
    name: 'Deluxe Single Room',
    type: 'single',
    price: 1500000,
    description: 'Phòng đơn cao cấp với đầy đủ tiện nghi hiện đại. Không gian rộng rãi, thoáng mát với thiết kế sang trọng. Phòng được trang bị đầy đủ các tiện ích cần thiết cho một kỳ nghỉ thoải mái.',
    amenities: ['Wi-Fi miễn phí', 'Điều hòa không khí', 'TV màn hình phẳng', 'Minibar', 'Két an toàn', 'Phòng tắm riêng', 'Dịch vụ phòng 24/7', 'Bàn làm việc'],
    images: [
      'https://via.placeholder.com/400x250/4CAF50/FFFFFF?text=Room+View+1',
      'https://via.placeholder.com/400x250/2196F3/FFFFFF?text=Room+View+2',
      'https://via.placeholder.com/400x250/FF5722/FFFFFF?text=Bathroom',
    ],
    available: true,
    maxGuests: 1,
  };

  useEffect(() => {
    loadRoomDetails();
  }, [roomId]);

  const loadRoomDetails = async () => {
    setLoading(true);
    try {
      // Simulate API call
      setTimeout(() => {
        setRoom(mockRoom);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error loading room details:', error);
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const handleBookRoom = () => {
    Alert.alert(
      'Đặt phòng',
      'Bạn có muốn đặt phòng này không?',
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Đặt phòng', 
          onPress: () => {
            Alert.alert('Thành công', 'Đặt phòng thành công! Chúng tôi sẽ liên hệ với bạn sớm.');
          }
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>Đang tải...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!room) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text>Không tìm thấy thông tin phòng</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image Gallery */}
        <View style={styles.imageContainer}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(event) => {
              const index = Math.round(event.nativeEvent.contentOffset.x / width);
              setActiveImageIndex(index);
            }}
          >
            {room.images.map((image, index) => (
              <Image key={index} source={{ uri: image }} style={styles.roomImage} />
            ))}
          </ScrollView>
          
          {/* Image Indicator */}
          <View style={styles.imageIndicator}>
            {room.images.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.indicatorDot,
                  activeImageIndex === index && styles.indicatorDotActive,
                ]}
              />
            ))}
          </View>
        </View>

        <View style={styles.contentContainer}>
          {/* Room Info */}
          <View style={styles.roomInfo}>
            <Text style={styles.roomName}>{room.name}</Text>
            <View style={styles.roomMeta}>
              <View style={styles.typeContainer}>
                <Ionicons name="bed" size={16} color={COLORS.primary} />
                <Text style={styles.roomType}>{room.type.charAt(0).toUpperCase() + room.type.slice(1)}</Text>
              </View>
              <View style={styles.guestContainer}>
                <Ionicons name="person" size={16} color={COLORS.primary} />
                <Text style={styles.guestText}>Tối đa {room.maxGuests} khách</Text>
              </View>
            </View>
            
            <View style={styles.priceContainer}>
              <Text style={styles.price}>{formatPrice(room.price)}</Text>
              <Text style={styles.priceUnit}>/đêm</Text>
            </View>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Mô tả</Text>
            <Text style={styles.description}>{room.description}</Text>
          </View>

          {/* Amenities */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tiện nghi</Text>
            <View style={styles.amenitiesGrid}>
              {room.amenities.map((amenity, index) => (
                <View key={index} style={styles.amenityItem}>
                  <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
                  <Text style={styles.amenityText}>{amenity}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Availability */}
          <View style={styles.section}>
            <View style={styles.availabilityContainer}>
              <Ionicons 
                name={room.available ? "checkmark-circle" : "close-circle"} 
                size={24} 
                color={room.available ? COLORS.success : COLORS.error} 
              />
              <Text style={[
                styles.availabilityText,
                { color: room.available ? COLORS.success : COLORS.error }
              ]}>
                {room.available ? 'Còn trống' : 'Hết phòng'}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Book Button */}
      {room.available && (
        <View style={styles.bookButtonContainer}>
          <TouchableOpacity style={styles.bookButton} onPress={handleBookRoom}>
            <Text style={styles.bookButtonText}>Đặt phòng ngay</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    height: 250,
    position: 'relative',
  },
  roomImage: {
    width: width,
    height: 250,
  },
  imageIndicator: {
    position: 'absolute',
    bottom: SIZES.spacing.md,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  indicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: 4,
  },
  indicatorDotActive: {
    backgroundColor: COLORS.surface,
  },
  contentContainer: {
    flex: 1,
  },
  roomInfo: {
    padding: SIZES.spacing.lg,
    backgroundColor: COLORS.surface,
  },
  roomName: {
    fontSize: SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: SIZES.spacing.sm,
  },
  roomMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.spacing.md,
    gap: SIZES.spacing.lg,
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  roomType: {
    fontSize: SIZES.sm,
    color: COLORS.text.secondary,
    marginLeft: SIZES.spacing.xs,
    textTransform: 'capitalize',
  },
  guestContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  guestText: {
    fontSize: SIZES.sm,
    color: COLORS.text.secondary,
    marginLeft: SIZES.spacing.xs,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    fontSize: SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.secondary,
  },
  priceUnit: {
    fontSize: SIZES.md,
    color: COLORS.text.secondary,
    marginLeft: SIZES.spacing.xs,
  },
  section: {
    padding: SIZES.spacing.lg,
    backgroundColor: COLORS.surface,
    marginTop: SIZES.spacing.sm,
  },
  sectionTitle: {
    fontSize: SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: SIZES.spacing.md,
  },
  description: {
    fontSize: SIZES.md,
    color: COLORS.text.secondary,
    lineHeight: 22,
  },
  amenitiesGrid: {
    gap: SIZES.spacing.sm,
  },
  amenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.spacing.sm,
  },
  amenityText: {
    fontSize: SIZES.md,
    color: COLORS.text.primary,
    flex: 1,
  },
  availabilityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.spacing.sm,
  },
  availabilityText: {
    fontSize: SIZES.lg,
    fontWeight: 'bold',
  },
  bookButtonContainer: {
    padding: SIZES.spacing.lg,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  bookButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SIZES.spacing.md,
    borderRadius: SIZES.radius.lg,
    alignItems: 'center',
  },
  bookButtonText: {
    fontSize: SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.surface,
  },
});

export default RoomDetailsScreen;