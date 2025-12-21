import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Alert,
  Linking,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants';

const SupportScreen = () => {
  const navigation = useNavigation();

  const faqs = [
    {
      question: 'Làm thế nào để hủy đặt phòng?',
      answer: 'Bạn có thể hủy đặt phòng trong mục "Đặt phòng của tôi". Vui lòng kiểm tra chính sách hủy của từng khách sạn.',
    },
    {
      question: 'Tôi có thể thay đổi ngày đặt phòng không?',
      answer: 'Có, vui lòng liên hệ trực tiếp với bộ phận CSKH hoặc khách sạn để được hỗ trợ thay đổi.',
    },
    {
      question: 'Phương thức thanh toán nào được chấp nhận?',
      answer: 'Chúng tôi chấp nhận thẻ tín dụng, chuyển khoản ngân hàng và ví điện tử (Momo, ZaloPay).',
    },
  ];

  const openLink = (url: string) => {
    Linking.openURL(url).catch(err => console.error("Couldn't load page", err));
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
        <Text style={styles.headerTitle}>Hỗ trợ khách hàng</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Contact Channels */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Liên hệ nhanh</Text>
          <View style={styles.contactGrid}>
            <TouchableOpacity style={styles.contactCard} onPress={() => openLink('tel:19001234')}>
              <View style={[styles.iconContainer, { backgroundColor: '#E3F2FD' }]}>
                <Ionicons name="call" size={24} color="#1E88E5" />
              </View>
              <Text style={styles.contactLabel}>Tổng đài</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.contactCard} onPress={() => openLink('https://zalo.me')}>
              <View style={[styles.iconContainer, { backgroundColor: '#E8F5E9' }]}>
                <Ionicons name="chatbubbles" size={24} color="#43A047" />
              </View>
              <Text style={styles.contactLabel}>Zalo Chat</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.contactCard} onPress={() => openLink('mailto:support@hotelapp.com')}>
              <View style={[styles.iconContainer, { backgroundColor: '#FFF3E0' }]}>
                <Ionicons name="mail" size={24} color="#FB8C00" />
              </View>
              <Text style={styles.contactLabel}>Email</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* FAQ Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Câu hỏi thường gặp</Text>
          {faqs.map((faq, index) => (
            <View key={index} style={styles.faqItem}>
              <View style={styles.faqHeader}>
                <Ionicons name="help-circle-outline" size={20} color={COLORS.primary} />
                <Text style={styles.faqQuestion}>{faq.question}</Text>
              </View>
              <Text style={styles.faqAnswer}>{faq.answer}</Text>
            </View>
          ))}
        </View>
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
    alignItems: 'center',
    justifyContent: 'space-between',
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
  content: {
    flex: 1,
    padding: SIZES.spacing.lg,
  },
  section: {
    marginBottom: SIZES.spacing.xl,
  },
  sectionTitle: {
    fontSize: SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: SIZES.spacing.md,
  },
  contactGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  contactCard: {
    alignItems: 'center',
    width: '30%',
    backgroundColor: COLORS.surface,
    padding: SIZES.spacing.md,
    borderRadius: SIZES.radius.md,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.spacing.sm,
  },
  contactLabel: {
    fontSize: SIZES.sm,
    fontWeight: '500',
    color: COLORS.text.primary,
  },
  formContainer: {
    backgroundColor: COLORS.surface,
    padding: SIZES.spacing.md,
    borderRadius: SIZES.radius.md,
  },
  label: {
    fontSize: SIZES.sm,
    fontWeight: '500',
    color: COLORS.text.primary,
    marginBottom: SIZES.spacing.xs,
  },
  input: {
    backgroundColor: COLORS.background,
    borderRadius: SIZES.radius.sm,
    padding: SIZES.spacing.sm,
    marginBottom: SIZES.spacing.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  textArea: {
    height: 100,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    padding: SIZES.spacing.md,
    borderRadius: SIZES.radius.md,
    alignItems: 'center',
  },
  submitButtonText: {
    color: COLORS.surface,
    fontWeight: 'bold',
    fontSize: SIZES.md,
  },
  faqItem: {
    backgroundColor: COLORS.surface,
    padding: SIZES.spacing.md,
    borderRadius: SIZES.radius.md,
    marginBottom: SIZES.spacing.sm,
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.spacing.xs,
  },
  faqQuestion: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginLeft: SIZES.spacing.sm,
    flex: 1,
  },
  faqAnswer: {
    fontSize: SIZES.sm,
    color: COLORS.text.secondary,
    lineHeight: 20,
    marginLeft: 28,
  },
});

export default SupportScreen;