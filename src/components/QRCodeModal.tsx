import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  Image,
  Alert,
  Linking,
} from 'react-native';
import QRCodeSVG from 'react-native-qrcode-svg';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants';

interface QRCodeModalProps {
  visible: boolean;
  onClose: () => void;
  amount: number;
  reference?: string;
  merchantName?: string;
  // Optional raw QR string returned from backend (e.g. qrCode) OR a checkout URL
  qrRaw?: string;
  qrUrl?: string;
}

const QRCodeModal: React.FC<QRCodeModalProps> = ({
  visible,
  onClose,
  amount,
  reference,
  merchantName = 'Merchant',
  qrRaw,
  qrUrl,
}) => {
  // If caller provides a direct qrUrl or raw qr string (qrRaw), prefer those.
  let imageSourceUrl = '';
  if (qrUrl) {
    imageSourceUrl = qrUrl;
  } else if (qrRaw) {
    // When we have qrRaw, we will render it natively with react-native-qrcode-svg.
    imageSourceUrl = '';
  } else {
    const payload = JSON.stringify({ merchant: merchantName, amount, reference });
    imageSourceUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
      payload
    )}`;
  }

  // Debug: log the final image URL so we can troubleshoot image loading issues
  // (kept intentionally lightweight; remove or guard in production)
  // eslint-disable-next-line no-console
  console.log('QRCodeModal - imageSourceUrl:', imageSourceUrl);

  const handleCopyRef = async () => {
    try {
      // Clipboard API usage varies; use fallback
      // @ts-ignore
      await Clipboard.setString(reference || '');
      Alert.alert('Copied', 'Reference copied to clipboard');
    } catch (e) {
      Alert.alert('Error', 'Unable to copy reference');
    }
  };

  const handleConfirm = () => {
    Alert.alert('Payment', 'If you have completed the scan/payment, press Done.');
    onClose();
  };

  const handleOpenCheckout = async () => {
    const url = qrUrl || '';
    if (!url) {
      Alert.alert('No link', 'No checkout URL available');
      return;
    }
    try {
      await Linking.openURL(url);
    } catch (e) {
      Alert.alert('Error', 'Unable to open link');
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <SafeAreaView style={styles.container}>
          <View style={styles.modal}>
            <View style={styles.header}>
              <Text style={styles.title}>Mã QR Thanh Toán</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color={COLORS.text.primary} />
              </TouchableOpacity>
            </View>

            <View style={styles.content}>
              <Text style={styles.merchant}>{merchantName}</Text>
              <Text style={styles.amount}>Số tiền: {amount.toLocaleString('vi-VN')} đ</Text>

              <View style={styles.qrContainer}>
                {qrRaw ? (
                  <QRCodeSVG value={qrRaw} size={220} />
                ) : (
                  <Image source={{ uri: imageSourceUrl }} style={styles.qrImage} />
                )}

                {/* If checkout URL is present, offer to open it */}
                {qrUrl ? (
                  <TouchableOpacity style={styles.linkButton} onPress={handleOpenCheckout}>
                    <Text style={styles.linkButtonText}>Open payment link</Text>
                  </TouchableOpacity>
                ) : null}
              </View>

             
              {/* If the QR image cannot be rendered, also show the raw payload so user can copy it */}
              {qrRaw ? (
                <View style={{ marginTop: 8, alignItems: 'center' }}>
                 
                </View>
              ) : null}

              <View style={styles.actionsRow}>
               

                <TouchableOpacity style={styles.primaryButton} onPress={handleConfirm}>
                  <Text style={styles.primaryButtonText}>Done</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '100%',
    paddingHorizontal: SIZES.spacing.lg,
  },
  modal: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius.lg,
    padding: SIZES.spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  closeButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    marginTop: SIZES.spacing.lg,
  },
  merchant: {
    fontSize: SIZES.md,
    color: COLORS.text.secondary,
    marginBottom: SIZES.spacing.sm,
  },
  amount: {
    fontSize: SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: SIZES.spacing.md,
  },
  qrContainer: {
    backgroundColor: COLORS.background,
    padding: SIZES.spacing.sm,
    borderRadius: 6,
    marginBottom: SIZES.spacing.md,
  },
  qrImage: {
    width: 220,
    height: 220,
    resizeMode: 'contain',
  },
  refRow: {
    marginTop: SIZES.spacing.sm,
    alignItems: 'center',
  },
  refLabel: {
    fontSize: SIZES.sm,
    color: COLORS.text.secondary,
  },
  refValue: {
    fontSize: SIZES.sm,
    color: COLORS.text.primary,
    marginTop: SIZES.spacing.xs,
    fontWeight: '600',
  },
  actionsRow: {
    flexDirection: 'row',
    marginTop: SIZES.spacing.lg,
    width: '100%',
    justifyContent: 'space-between',
  },
  secondaryButton: {
    flex: 1,
    marginRight: SIZES.spacing.md,
    paddingVertical: SIZES.spacing.md,
    borderRadius: SIZES.radius.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: COLORS.text.primary,
    fontWeight: '600',
  },
  linkButton: {
    marginTop: SIZES.spacing.sm,
    paddingVertical: SIZES.spacing.sm,
    paddingHorizontal: SIZES.spacing.md,
    borderRadius: SIZES.radius.md,
    borderWidth: 1,
    borderColor: COLORS.primary,
    alignItems: 'center',
  },
  linkButtonText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  primaryButton: {
    flex: 1,
    marginLeft: SIZES.spacing.md,
    paddingVertical: SIZES.spacing.md,
    borderRadius: SIZES.radius.lg,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: COLORS.surface,
    fontWeight: '600',
  },
});

export default QRCodeModal;
