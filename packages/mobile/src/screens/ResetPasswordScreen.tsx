import React, { useState, useMemo } from 'react';
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
  ScrollView
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { HealthPalLogo, LockIcon } from '../components';

type ResetPasswordScreenProps = {
  onResetSuccess?: () => void;
  onBack?: () => void;
};

// Type guard functions để đảm bảo type safety
function isFunction(fn: unknown): fn is (() => void) {
  return typeof fn === 'function';
}

function isString(value: unknown): value is string {
  return typeof value === 'string';
}

// Password validation function
function isValidPassword(password: string): boolean {
  // Ít nhất 8 ký tự, có chữ hoa, chữ thường, số
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
}

export default function ResetPasswordScreen({
  onResetSuccess,
  onBack
}: ResetPasswordScreenProps): ReactElement {
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showNewPassword, setShowNewPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleNewPasswordChange = (text: string): void => {
    if (isString(text)) {
      setNewPassword(text);
    }
  };

  const handleConfirmPasswordChange = (text: string): void => {
    if (isString(text)) {
      setConfirmPassword(text);
    }
  };

  const handleResetPassword = async (): Promise<void> => {
    if (!newPassword.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập mật khẩu mới');
      return;
    }

    if (!passwordValidation.isValidPassword) {
      Alert.alert(
        'Lỗi',
        'Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và số'
      );
      return;
    }

    if (!confirmPassword.trim()) {
      Alert.alert('Lỗi', 'Vui lòng xác nhận mật khẩu');
      return;
    }

    if (!passwordValidation.passwordsMatch) {
      Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp');
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      console.log('Password reset successful');

      Alert.alert(
        'Thành công',
        'Mật khẩu của bạn đã được đặt lại thành công. Bạn có thể đăng nhập với mật khẩu mới.',
        [
          {
            text: 'OK',
            onPress: () => {
              if (isFunction(onResetSuccess)) {
                onResetSuccess();
              }
            }
          }
        ]
      );
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

  // Memoize validation results để tránh flickering
  const passwordValidation = useMemo(() => {
    const trimmedNewPassword = newPassword.trim();
    const trimmedConfirmPassword = confirmPassword.trim();

    return {
      hasMinLength: trimmedNewPassword.length >= 8,
      hasUpperCase: /[A-Z]/.test(trimmedNewPassword),
      hasLowerCase: /[a-z]/.test(trimmedNewPassword),
      hasNumber: /\d/.test(trimmedNewPassword),
      isValidPassword: isValidPassword(trimmedNewPassword),
      passwordsMatch: trimmedNewPassword === trimmedConfirmPassword && trimmedConfirmPassword.length > 0,
      isFormValid: trimmedNewPassword && trimmedConfirmPassword && isValidPassword(trimmedNewPassword) && trimmedNewPassword === trimmedConfirmPassword
    };
  }, [newPassword, confirmPassword]);

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

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Logo Section */}
          <View style={styles.logoSection}>
            <HealthPalLogo size={66} showText={true} />
          </View>

          {/* Content */}
          <View style={styles.contentContainer}>
            {/* Title and Description */}
            <View style={styles.textSection}>
              <Text style={styles.title}>Đặt lại mật khẩu</Text>
              <Text style={styles.description}>
                Nhập mật khẩu mới của bạn để hoàn tất quá trình đặt lại mật khẩu.
              </Text>
            </View>

            {/* Input Fields */}
            <View style={styles.inputsContainer}>
              {/* New Password Input */}
              <View style={styles.inputField}>
                <View style={[
                  styles.inputContainer,
                  passwordValidation.isValidPassword && newPassword.length > 0 && styles.inputContainerValid
                ]}>
                  <LockIcon size={18} color="#9CA3AF" />
                  <TextInput
                    style={styles.input}
                    placeholder="Mật khẩu mới"
                    placeholderTextColor="#9CA3AF"
                    value={newPassword}
                    onChangeText={handleNewPasswordChange}
                    secureTextEntry={!showNewPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    selectionColor="#1C64F2"
                    underlineColorAndroid="transparent"
                    editable={!isLoading}
                    accessible
                    accessibilityLabel="Nhập mật khẩu mới"
                  />
                  <TouchableOpacity
                    onPress={() => setShowNewPassword(!showNewPassword)}
                    style={styles.eyeIcon}
                  >
                    <MaterialIcons
                      name={showNewPassword ? "visibility" : "visibility-off"}
                      size={20}
                      color="#9CA3AF"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Confirm Password Input */}
              <View style={styles.inputField}>
                <View style={[
                  styles.inputContainer,
                  passwordValidation.passwordsMatch && styles.inputContainerValid
                ]}>
                  <LockIcon size={18} color="#9CA3AF" />
                  <TextInput
                    style={styles.input}
                    placeholder="Xác nhận mật khẩu"
                    placeholderTextColor="#9CA3AF"
                    value={confirmPassword}
                    onChangeText={handleConfirmPasswordChange}
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    selectionColor="#1C64F2"
                    underlineColorAndroid="transparent"
                    editable={!isLoading}
                    accessible
                    accessibilityLabel="Xác nhận mật khẩu mới"
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={styles.eyeIcon}
                  >
                    <MaterialIcons
                      name={showConfirmPassword ? "visibility" : "visibility-off"}
                      size={20}
                      color="#9CA3AF"
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Password Requirements */}
            <View style={styles.requirementsContainer}>
              <Text style={styles.requirementsTitle}>Yêu cầu mật khẩu:</Text>
              <Text style={[
                styles.requirementText,
                passwordValidation.hasMinLength && styles.requirementMet
              ]}>
                • Ít nhất 8 ký tự
              </Text>
              <Text style={[
                styles.requirementText,
                passwordValidation.hasUpperCase && styles.requirementMet
              ]}>
                • Có ít nhất 1 chữ hoa
              </Text>
              <Text style={[
                styles.requirementText,
                passwordValidation.hasLowerCase && styles.requirementMet
              ]}>
                • Có ít nhất 1 chữ thường
              </Text>
              <Text style={[
                styles.requirementText,
                passwordValidation.hasNumber && styles.requirementMet
              ]}>
                • Có ít nhất 1 số
              </Text>
              {confirmPassword.length > 0 && (
                <Text style={[
                  styles.requirementText,
                  passwordValidation.passwordsMatch && styles.requirementMet
                ]}>
                  • Mật khẩu xác nhận khớp
                </Text>
              )}
            </View>

            {/* Reset Button */}
            <TouchableOpacity
              style={[
                styles.resetButton,
                (!passwordValidation.isFormValid || isLoading) && styles.resetButtonDisabled
              ]}
              onPress={handleResetPassword}
              disabled={!passwordValidation.isFormValid || isLoading}
              accessible
              accessibilityLabel="Đặt lại mật khẩu"
            >
              <Text style={[
                styles.resetButtonText,
                (!passwordValidation.isFormValid || isLoading) && styles.resetButtonTextDisabled
              ]}>
                {isLoading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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

  // Logo Section
  logoSection: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
    paddingBottom: 32,
    width: '100%',
  },

  // Content Container
  contentContainer: {
    paddingHorizontal: 24,
    gap: 32,
    flex: 1,
    paddingBottom: 40,
  },

  // Text Section
  textSection: {
    alignItems: 'center',
    gap: 8,
    width: '100%',
  },
  title: {
    fontFamily: 'Inter',
    fontWeight: '600',
    fontSize: 20,
    lineHeight: 30,
    color: '#1C2A3A',
    textAlign: 'center',
  },
  description: {
    fontFamily: 'Inter',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 21,
    color: '#6B7280',
    textAlign: 'center',
    width: '100%',
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
  inputContainerValid: {
    backgroundColor: '#F0FDF4',
    borderColor: '#10B981',
    borderWidth: 2,
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
  eyeIcon: {
    padding: 4,
  },

  // Password Requirements
  requirementsContainer: {
    gap: 4,
    width: '100%',
  },
  requirementsTitle: {
    fontFamily: 'Inter',
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 21,
    color: '#1C2A3A',
    marginBottom: 4,
  },
  requirementText: {
    fontFamily: 'Inter',
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 18,
    color: '#9CA3AF',
  },
  requirementMet: {
    color: '#10B981',
  },

  // Reset Button
  resetButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#1C2A3A',
    borderRadius: 29,
    height: 48,
    width: '100%',
  },
  resetButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  resetButtonText: {
    fontFamily: 'Inter',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    color: '#FFFFFF',
  },
  resetButtonTextDisabled: {
    color: '#FFFFFF',
    opacity: 0.7,
  },
});