import React, { useState } from 'react';
import type { ReactElement } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Alert
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { HealthPalLogo, EmailIcon, LockIcon, GoogleIcon, FacebookIcon, UserIcon } from '../components';
import { registerWithEmail } from '../services/auth.service';

type SignUpScreenProps = {
  onSignUp?: (name: string, email: string) => void;
  onSignIn?: () => void;
  onGoogleSignUp?: () => void;
  onFacebookSignUp?: () => void;
  onBack?: () => void;
};

// Type guard functions để đảm bảo type safety
function isFunction(fn: unknown): fn is (() => void) {
  return typeof fn === 'function';
}

function isFunctionWithUserData(fn: unknown): fn is ((name: string, email: string) => void) {
  return typeof fn === 'function';
}

function isString(value: unknown): value is string {
  return typeof value === 'string';
}

export default function SignUpScreen({
  onSignUp,
  onSignIn,
  onGoogleSignUp,
  onFacebookSignUp,
  onBack
}: SignUpScreenProps): ReactElement {
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleNameChange = (text: string): void => {
    if (isString(text)) {
      setName(text);
    }
  };

  const handleEmailChange = (text: string): void => {
    if (isString(text)) {
      setEmail(text);
    }
  };

  const handlePasswordChange = (text: string): void => {
    if (isString(text)) {
      setPassword(text);
    }
  };

  const handleSignUp = async (): Promise<void> => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin');
      return;
    }

    setIsLoading(true);

    try {
      const result = await registerWithEmail(name.trim(), email.trim(), password, 'PATIENT');

      if (result.success) {
        console.log('✅ Registration successful:', result.data);
        Alert.alert(
          'Đăng ký thành công!',
          'Chúng tôi đã gửi mã xác thực đến email của bạn. Vui lòng kiểm tra email để xác thực tài khoản.',
          [
            {
              text: 'OK',
              onPress: () => {
                if (isFunctionWithUserData(onSignUp)) {
                  onSignUp(name.trim(), email.trim());
                }
              }
            }
          ]
        );
      } else {
        console.log('❌ Registration failed:', result.error);
        let errorMessage = 'Đăng ký thất bại';

        if (result.error?.code === 'VALIDATION_ERROR') {
          errorMessage = 'Thông tin đăng ký không hợp lệ';
          if (result.error.details) {
            // Hiển thị chi tiết lỗi validation
            const details = result.error.details;
            if (Array.isArray(details) && details.length > 0) {
              errorMessage = details.map((d: any) => d.message).join('\n');
            }
          }
        } else if (result.error?.message?.includes('Email already exists')) {
          errorMessage = 'Email này đã được sử dụng. Vui lòng sử dụng email khác hoặc đăng nhập.';
        } else if (result.error?.message?.includes('Password does not meet requirements')) {
          errorMessage = 'Mật khẩu không đủ mạnh. Vui lòng sử dụng mật khẩu có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và số.';
        } else if (result.error?.code === 'NETWORK_ERROR') {
          errorMessage = 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.';
        } else if (result.error?.message) {
          errorMessage = result.error.message;
        }

        Alert.alert('Lỗi đăng ký', errorMessage);
      }
    } catch (error: any) {
      console.error('❌ Unexpected registration error:', error);
      Alert.alert('Lỗi', 'Đã xảy ra lỗi không mong muốn. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = (): void => {
    if (isFunction(onSignIn)) {
      onSignIn();
    }
  };

  const handleGoogleSignUp = (): void => {
    if (isFunction(onGoogleSignUp)) {
      onGoogleSignUp();
    }
  };

  const handleFacebookSignUp = (): void => {
    if (isFunction(onFacebookSignUp)) {
      onFacebookSignUp();
    }
  };

  const handleBack = (): void => {
    if (isFunction(onBack)) {
      onBack();
    } else {
      console.log('Back button pressed but no onBack prop provided');
    }
  };

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
          <MaterialIcons name="arrow-back" size={24} color="#1C2A3A" />
        </TouchableOpacity>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Logo Section */}
          <View style={styles.logoSection}>
            <HealthPalLogo size={66} showText={true} />
          </View>

          {/* Sign Up Form */}
          <View style={styles.formContainer}>
            {/* Title and Description */}
            <View style={styles.titleSection}>
              <Text style={styles.welcomeTitle}>Tạo tài khoản</Text>
              <Text style={styles.subtitle}>Chúng tôi ở đây để giúp bạn!</Text>
            </View>

            {/* Input Fields */}
            <View style={styles.inputsContainer}>
              {/* Name Input */}
              <View style={styles.inputField}>
                <View style={styles.inputContainer}>
                  <UserIcon size={18} color="#9CA3AF" />
                  <TextInput
                    style={styles.input}
                    placeholder="Tên của bạn"
                    placeholderTextColor="#9CA3AF"
                    value={name}
                    onChangeText={handleNameChange}
                    autoCapitalize="words"
                    autoCorrect={false}
                    selectionColor="#1C64F2"
                    underlineColorAndroid="transparent"
                  />
                </View>
              </View>

              {/* Email Input */}
              <View style={styles.inputField}>
                <View style={styles.inputContainer}>
                  <EmailIcon size={18} color="#9CA3AF" />
                  <TextInput
                    style={styles.input}
                    placeholder="Email của bạn"
                    placeholderTextColor="#9CA3AF"
                    value={email}
                    onChangeText={handleEmailChange}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    selectionColor="#1C64F2"
                    underlineColorAndroid="transparent"
                  />
                </View>
              </View>

              {/* Password Input */}
              <View style={styles.inputField}>
                <View style={styles.inputContainer}>
                  <LockIcon size={18} color="#9CA3AF" />
                  <TextInput
                    style={styles.input}
                    placeholder="Mật khẩu"
                    placeholderTextColor="#9CA3AF"
                    value={password}
                    onChangeText={handlePasswordChange}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    selectionColor="#1C64F2"
                    underlineColorAndroid="transparent"
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeIcon}
                  >
                    <MaterialIcons
                      name={showPassword ? "visibility" : "visibility-off"}
                      size={20}
                      color="#9CA3AF"
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Sign Up Button */}
            <TouchableOpacity
              style={[styles.signUpButton, isLoading && styles.signUpButtonDisabled]}
              onPress={handleSignUp}
              disabled={isLoading}
              accessible
              accessibilityLabel="Tạo tài khoản miễn phí"
            >
              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <MaterialIcons name="hourglass-empty" size={20} color="#FFFFFF" />
                  <Text style={styles.signUpButtonText}>Đang tạo tài khoản...</Text>
                </View>
              ) : (
                <Text style={styles.signUpButtonText}>Tạo tài khoản miễn phí</Text>
              )}
            </TouchableOpacity>

            {/* Separator */}
            <View style={styles.separatorContainer}>
              <View style={styles.separatorLine} />
              <Text style={styles.separatorText}>hoặc</Text>
              <View style={styles.separatorLine} />
            </View>

            {/* Social Buttons */}
            <View style={styles.socialButtons}>
              {/* Google Button */}
              <TouchableOpacity
                style={styles.socialButton}
                onPress={handleGoogleSignUp}
                accessible
                accessibilityLabel="Tiếp tục với Google"
              >
                <GoogleIcon size={20} />
                <Text style={styles.socialButtonText}>Tiếp tục với Google</Text>
              </TouchableOpacity>

              {/* Facebook Button */}
              <TouchableOpacity
                style={styles.socialButton}
                onPress={handleFacebookSignUp}
                accessible
                accessibilityLabel="Tiếp tục với Facebook"
              >
                <FacebookIcon size={20} />
                <Text style={styles.socialButtonText}>Tiếp tục với Facebook</Text>
              </TouchableOpacity>
            </View>

            {/* Helper Text */}
            <View style={styles.signInContainer}>
              <Text style={styles.helperText}>Đã có tài khoản? </Text>
              <TouchableOpacity onPress={handleSignIn}>
                <Text style={styles.signInLink}>Đăng nhập</Text>
              </TouchableOpacity>
            </View>
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

  // Back Button
  backButton: {
    position: 'absolute',
    top: 10,
    left: 20,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  scrollView: {
    flex: 1,
  },

  // Logo Section
  logoSection: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
    paddingBottom: 40,
    width: '100%',
  },

  // Form Container
  formContainer: {
    paddingHorizontal: 24,
    paddingBottom: 80,
    gap: 32,
    flex: 1,
  },

  // Title Section
  titleSection: {
    alignItems: 'center',
    gap: 8,
    width: '100%',
  },
  welcomeTitle: {
    fontFamily: 'Inter',
    fontWeight: '600',
    fontSize: 20,
    lineHeight: 30,
    color: '#1C2A3A',
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: 'Inter',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 21,
    color: '#6B7280',
    textAlign: 'center',
  },

  // Inputs Section
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
  eyeIcon: {
    padding: 4,
  },

  // Sign Up Button
  signUpButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#1C2A3A',
    borderRadius: 54,
    height: 48,
    width: '100%',
  },
  signUpButtonText: {
    fontFamily: 'Inter',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    color: '#FFFFFF',
  },

  // Separator
  separatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
    height: 24,
    width: '100%',
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  separatorText: {
    fontFamily: 'Inter',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    color: '#6B7280',
  },

  // Social Buttons
  socialButtons: {
    gap: 16,
    width: '100%',
  },
  socialButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    gap: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    height: 41,
    width: '100%',
  },
  socialButtonText: {
    fontFamily: 'Inter',
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 21,
    color: '#1C2A3A',
  },

  // Helper Text
  signInContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  helperText: {
    fontFamily: 'Inter',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 21,
    color: '#6B7280',
  },
  signInLink: {
    fontFamily: 'Inter',
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 21,
    color: '#1C64F2',
  },
  signUpButtonDisabled: {
    opacity: 0.6,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
});