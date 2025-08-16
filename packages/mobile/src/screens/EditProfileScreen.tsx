import React, { useState } from 'react';
import type { ReactElement } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  SafeAreaView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Modal
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

type EditProfileScreenProps = {
  onProfileComplete?: () => void;
  onBack?: () => void;
  initialName?: string;
  initialEmail?: string;
};

// Type guard functions để đảm bảo type safety
function isFunction(fn: unknown): fn is (() => void) {
  return typeof fn === 'function';
}

function isString(value: unknown): value is string {
  return typeof value === 'string';
}

export default function EditProfileScreen({
  onProfileComplete,
  onBack,
  initialName = 'Nguyễn Văn A',
  initialEmail = 'nguyenvana@example.com'
}: EditProfileScreenProps): ReactElement {
  const [fullName, setFullName] = useState<string>(initialName);
  const [nickname, setNickname] = useState<string>('');
  const [email, setEmail] = useState<string>(initialEmail);
  const [dateOfBirth, setDateOfBirth] = useState<string>('');
  const [gender, setGender] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);

  const handleFullNameChange = (text: string): void => {
    if (isString(text)) {
      setFullName(text);
    }
  };

  const handleNicknameChange = (text: string): void => {
    if (isString(text)) {
      setNickname(text);
    }
  };

  const handleEmailChange = (text: string): void => {
    if (isString(text)) {
      setEmail(text);
    }
  };

  const handleDateOfBirthChange = (text: string): void => {
    if (isString(text)) {
      setDateOfBirth(text);
    }
  };

  const handleGenderChange = (text: string): void => {
    if (isString(text)) {
      setGender(text);
    }
  };

  const handleSaveProfile = async (): Promise<void> => {
    if (!fullName.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập họ và tên');
      return;
    }

    if (!email.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập email');
      return;
    }

    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('Profile saved:', {
        fullName,
        nickname,
        email,
        dateOfBirth,
        gender
      });
      
      setShowSuccessModal(true);
      
      // Auto close modal and navigate after 3 seconds
      setTimeout(() => {
        setShowSuccessModal(false);
        if (isFunction(onProfileComplete)) {
          onProfileComplete();
        }
      }, 3000);
      
    } catch (error) {
      Alert.alert('Lỗi', 'Có lỗi xảy ra. Vui lòng thử lại sau.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = (): void => {
    if (isFunction(onBack)) {
      onBack();
    } else {
      console.log('Back button pressed but no onBack prop provided');
    }
  };

  const isFormValid = fullName.trim() && email.trim();

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

        {/* Back Button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          accessible
          accessibilityLabel="Quay lại"
          activeOpacity={0.7}
        >
          <MaterialIcons name="arrow-back" size={24} color="#292D32" />
        </TouchableOpacity>

        {/* Title */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Hoàn thiện hồ sơ</Text>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Content */}
          <View style={styles.contentContainer}>
            {/* Profile Avatar */}
            <View style={styles.avatarContainer}>
              <View style={styles.avatarPlaceholder}>
                <MaterialIcons name="person" size={72} color="#E5E7EB" />
              </View>
              <TouchableOpacity style={styles.editAvatarButton}>
                <MaterialIcons name="edit" size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {/* Input Fields */}
            <View style={styles.inputsContainer}>
              {/* Full Name Input */}
              <View style={styles.inputField}>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="Họ và tên"
                    placeholderTextColor="#9CA3AF"
                    value={fullName}
                    onChangeText={handleFullNameChange}
                    autoCapitalize="words"
                    autoCorrect={false}
                    selectionColor="#1C64F2"
                    underlineColorAndroid="transparent"
                    editable={!isLoading}
                    accessible
                    accessibilityLabel="Nhập họ và tên"
                  />
                </View>
              </View>

              {/* Nickname Input */}
              <View style={styles.inputField}>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="Biệt danh"
                    placeholderTextColor="#9CA3AF"
                    value={nickname}
                    onChangeText={handleNicknameChange}
                    autoCapitalize="none"
                    autoCorrect={false}
                    selectionColor="#1C64F2"
                    underlineColorAndroid="transparent"
                    editable={!isLoading}
                    accessible
                    accessibilityLabel="Nhập biệt danh"
                  />
                </View>
              </View>

              {/* Email Input */}
              <View style={styles.inputField}>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="Email"
                    placeholderTextColor="#9CA3AF"
                    value={email}
                    onChangeText={handleEmailChange}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    selectionColor="#1C64F2"
                    underlineColorAndroid="transparent"
                    editable={!isLoading}
                    accessible
                    accessibilityLabel="Nhập email"
                  />
                </View>
              </View>

              {/* Date of Birth Input */}
              <View style={styles.inputField}>
                <View style={styles.inputContainer}>
                  <MaterialIcons name="calendar-today" size={18} color="#9CA3AF" />
                  <TextInput
                    style={styles.input}
                    placeholder="Ngày sinh"
                    placeholderTextColor="#9CA3AF"
                    value={dateOfBirth}
                    onChangeText={handleDateOfBirthChange}
                    autoCapitalize="none"
                    autoCorrect={false}
                    selectionColor="#1C64F2"
                    underlineColorAndroid="transparent"
                    editable={!isLoading}
                    accessible
                    accessibilityLabel="Nhập ngày sinh"
                  />
                </View>
              </View>

              {/* Gender Input */}
              <View style={styles.inputField}>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="Giới tính"
                    placeholderTextColor="#9CA3AF"
                    value={gender}
                    onChangeText={handleGenderChange}
                    autoCapitalize="none"
                    autoCorrect={false}
                    selectionColor="#1C64F2"
                    underlineColorAndroid="transparent"
                    editable={!isLoading}
                    accessible
                    accessibilityLabel="Nhập giới tính"
                  />
                  <MaterialIcons name="keyboard-arrow-down" size={18} color="#9CA3AF" />
                </View>
              </View>
            </View>

            {/* Save Button */}
            <TouchableOpacity
              style={[
                styles.saveButton,
                (!isFormValid || isLoading) && styles.saveButtonDisabled
              ]}
              onPress={handleSaveProfile}
              disabled={!isFormValid || isLoading}
              accessible
              accessibilityLabel="Lưu hồ sơ"
            >
              <Text style={[
                styles.saveButtonText,
                (!isFormValid || isLoading) && styles.saveButtonTextDisabled
              ]}>
                {isLoading ? 'Đang lưu...' : 'Lưu'}
              </Text>
            </TouchableOpacity>

            {/* Test Button - Skip to Main App */}
            <TouchableOpacity
              style={styles.testButton}
              onPress={() => {
                console.log('Test: Skip to main app');
                if (isFunction(onProfileComplete)) {
                  onProfileComplete();
                }
              }}
            >
              <Text style={styles.testButtonText}>Test: Bỏ qua → Main App</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSuccessModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.successIcon}>
              <MaterialIcons name="check" size={48} color="#FFFFFF" />
            </View>
            <View style={styles.modalTextContainer}>
              <Text style={styles.modalTitle}>Hoàn thành!</Text>
              <Text style={styles.modalDescription}>
                Hồ sơ của bạn đã được tạo thành công. Chào mừng bạn đến với HealthPal!
              </Text>
            </View>
            <View style={styles.loadingSpinner}>
              <MaterialIcons name="hourglass-empty" size={24} color="#1F2A37" />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },

  // Back Button
  backButton: {
    position: 'absolute',
    top: 10,
    left: 24,
    zIndex: 10,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Title
  titleContainer: {
    paddingTop: 16,
    paddingLeft: 24,
    paddingBottom: 16,
  },
  title: {
    fontFamily: 'Inter',
    fontWeight: '600',
    fontSize: 20,
    lineHeight: 30,
    color: '#374151',
    marginLeft: 38, // Account for back button space
  },

  // Content Container
  contentContainer: {
    paddingHorizontal: 24,
    gap: 32,
    flex: 1,
    paddingBottom: 40,
  },

  // Avatar
  avatarContainer: {
    alignItems: 'center',
    position: 'relative',
    marginBottom: 8,
  },
  avatarPlaceholder: {
    width: 202,
    height: 202,
    borderRadius: 101,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 8,
    right: 70,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#1C2A3A',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Input Fields
  inputsContainer: {
    gap: 20,
    width: '100%',
  },
  inputField: {
    gap: 8,
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    minHeight: 48,
  },
  input: {
    flex: 1,
    fontFamily: 'Inter',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 21,
    color: '#1C2A3A',
    paddingVertical: 0,
    includeFontPadding: false,
  },

  // Save Button
  saveButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#1C2A3A',
    borderRadius: 55,
    height: 48,
    width: '100%',
  },
  saveButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  saveButtonText: {
    fontFamily: 'Inter',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    color: '#FFFFFF',
  },
  saveButtonTextDisabled: {
    color: '#FFFFFF',
    opacity: 0.7,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: 337,
    backgroundColor: '#FFFFFF',
    borderRadius: 48,
    paddingVertical: 32,
    paddingHorizontal: 10,
    alignItems: 'center',
    gap: 32,
  },
  successIcon: {
    width: 131,
    height: 131,
    borderRadius: 65.5,
    backgroundColor: '#A4CFC3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTextContainer: {
    alignItems: 'center',
    gap: 8,
    width: 252,
  },
  modalTitle: {
    fontFamily: 'Inter',
    fontWeight: '600',
    fontSize: 20,
    lineHeight: 30,
    color: '#1C2A3A',
    textAlign: 'center',
  },
  modalDescription: {
    fontFamily: 'Inter',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 21,
    color: '#6B7280',
    textAlign: 'center',
  },
  loadingSpinner: {
    width: 57,
    height: 57,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Test Button
  testButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#10B981',
    borderRadius: 8,
    height: 48,
    width: '100%',
    marginTop: 16,
  },
  testButtonText: {
    fontFamily: 'Inter',
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 21,
    color: '#FFFFFF',
  },
});