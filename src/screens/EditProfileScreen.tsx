import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SIZES, STORAGE_KEYS } from '../constants';
import { apiService } from '../services/apiService';
import type { User } from '../types';

const EditProfileScreen = () => {
  const navigation = useNavigation<any>();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setIsLoading(true);
      const storedUser = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
      if (storedUser) {
        const user: User = JSON.parse(storedUser);
        setFormData({
          name: user.name || '',
          email: user.email || '',
          phone: user.phone || '',
          address: user.address || '',
        });
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên');
      return;
    }

    if (!formData.email.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập email');
      return;
    }

    try {
      setIsSaving(true);
      
      // Get current user data
      const storedUser = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
      if (!storedUser) {
        Alert.alert('Lỗi', 'Không tìm thấy thông tin người dùng');
        return;
      }

      const user: User = JSON.parse(storedUser);
      
      // Update user profile via API
      const response = await apiService.put(`/auth/profile/${user.id}`, formData);

      if (response) {
        // Update local storage
        const updatedUser = { ...user, ...formData };
        await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(updatedUser));
        
        Alert.alert('Thành công', 'Cập nhật thông tin thành công', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      }
    } catch (error: any) {
      console.error('Error updating profile:', error);
      Alert.alert('Lỗi', error.message || 'Cập nhật thông tin thất bại');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chỉnh sửa thông tin</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarContainer}>
            <Image
              source={{ uri: 'https://via.placeholder.com/100x100/4CAF50/FFFFFF?text=User' }}
              style={styles.avatar}
            />
            <TouchableOpacity 
              style={styles.changeAvatarButton}
              onPress={() => Alert.alert('Thông báo', 'Tính năng đổi avatar đang được phát triển')}
            >
              <Ionicons name="camera" size={20} color={COLORS.surface} />
            </TouchableOpacity>
          </View>
          <Text style={styles.changeAvatarText}>Thay đổi ảnh đại diện</Text>
        </View>

        {/* Form Fields */}
        <View style={styles.formSection}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Họ và tên *</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="person-outline" size={20} color={COLORS.text.secondary} />
              <TextInput
                style={styles.input}
                placeholder="Nhập họ và tên"
                placeholderTextColor={COLORS.text.hint}
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email *</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color={COLORS.text.secondary} />
              <TextInput
                style={styles.input}
                placeholder="Nhập email"
                placeholderTextColor={COLORS.text.hint}
                value={formData.email}
                onChangeText={(text) => setFormData({ ...formData, email: text })}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Số điện thoại</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="call-outline" size={20} color={COLORS.text.secondary} />
              <TextInput
                style={styles.input}
                placeholder="Nhập số điện thoại"
                placeholderTextColor={COLORS.text.hint}
                value={formData.phone}
                onChangeText={(text) => setFormData({ ...formData, phone: text })}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Địa chỉ</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="location-outline" size={20} color={COLORS.text.secondary} />
              <TextInput
                style={styles.input}
                placeholder="Nhập địa chỉ"
                placeholderTextColor={COLORS.text.hint}
                value={formData.address}
                onChangeText={(text) => setFormData({ ...formData, address: text })}
                multiline
              />
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Save Button */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.saveButton, isSaving && styles.saveButtonDisabled]} 
          onPress={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator color={COLORS.surface} />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={20} color={COLORS.surface} />
              <Text style={styles.saveButtonText}>Lưu thay đổi</Text>
            </>
          )}
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
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.spacing.lg,
    paddingVertical: SIZES.spacing.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  content: {
    padding: SIZES.spacing.lg,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: SIZES.spacing.xl,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: SIZES.spacing.sm,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  changeAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.surface,
  },
  changeAvatarText: {
    fontSize: SIZES.sm,
    color: COLORS.primary,
    fontWeight: '500',
  },
  formSection: {
    gap: SIZES.spacing.lg,
  },
  inputGroup: {
    gap: SIZES.spacing.xs,
  },
  label: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius.md,
    paddingHorizontal: SIZES.spacing.md,
    paddingVertical: SIZES.spacing.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  input: {
    flex: 1,
    marginLeft: SIZES.spacing.sm,
    fontSize: SIZES.md,
    color: COLORS.text.primary,
  },
  footer: {
    padding: SIZES.spacing.lg,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: SIZES.spacing.md,
    borderRadius: SIZES.radius.lg,
    gap: SIZES.spacing.sm,
  },
  saveButtonDisabled: {
    backgroundColor: COLORS.text.disabled,
  },
  saveButtonText: {
    fontSize: SIZES.md,
    fontWeight: 'bold',
    color: COLORS.surface,
  },
});

export default EditProfileScreen;
