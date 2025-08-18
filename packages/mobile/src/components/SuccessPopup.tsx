import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
  Animated,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

interface SuccessPopupProps {
  visible: boolean;
  onClose: () => void;
  appointmentDetails: {
    date: string;
    startTime: string;
    endTime: string;
    doctorName?: string;
  };
}

export default function SuccessPopup({ 
  visible, 
  onClose, 
  appointmentDetails 
}: SuccessPopupProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.popupContainer}>
          {/* Success Icon */}
          <View style={styles.iconContainer}>
            <MaterialIcons name="check-circle" size={80} color="#10B981" />
          </View>

          {/* Success Title */}
          <Text style={styles.title}>Đặt lịch thành công!</Text>

          {/* Appointment Details */}
          <View style={styles.detailsContainer}>
            <View style={styles.detailRow}>
              <MaterialIcons name="event" size={20} color="#6B7280" />
              <Text style={styles.detailText}>
                Ngày: {appointmentDetails.date}
              </Text>
            </View>
            
            <View style={styles.detailRow}>
              <MaterialIcons name="access-time" size={20} color="#6B7280" />
              <Text style={styles.detailText}>
                Thời gian: {appointmentDetails.startTime} - {appointmentDetails.endTime}
              </Text>
            </View>

            {appointmentDetails.doctorName && (
              <View style={styles.detailRow}>
                <MaterialIcons name="person" size={20} color="#6B7280" />
                <Text style={styles.detailText}>
                  Bác sĩ: {appointmentDetails.doctorName}
                </Text>
              </View>
            )}
          </View>

          {/* Success Message */}
          <Text style={styles.message}>
            Chúng tôi đã gửi xác nhận qua email. Vui lòng kiểm tra email của bạn để biết thêm chi tiết.
          </Text>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.primaryButton} onPress={onClose}>
              <Text style={styles.primaryButtonText}>Xem lịch hẹn</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.secondaryButton} onPress={onClose}>
              <Text style={styles.secondaryButtonText}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  popupContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    margin: 20,
    width: width - 40,
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  iconContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 24,
    fontFamily: 'Inter',
  },
  detailsContainer: {
    width: '100%',
    marginBottom: 24,
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 20,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailText: {
    fontSize: 16,
    color: '#374151',
    marginLeft: 12,
    fontFamily: 'Inter',
    flex: 1,
  },
  message: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 32,
    fontFamily: 'Inter',
    paddingHorizontal: 10,
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#1C2A3A',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    shadowColor: '#1C2A3A',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  secondaryButtonText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'Inter',
  },
});
