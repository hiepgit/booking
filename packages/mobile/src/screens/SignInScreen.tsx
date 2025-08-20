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
import { HealthPalLogo, EmailIcon, LockIcon, GoogleIcon, FacebookIcon } from '../components';
import { mockGoogleSignIn, mockFacebookSignIn } from '../services/socialAuthWebView.service';
import { loginWithEmail } from '../services/auth.service';
import { useAuth } from '../contexts/AuthContext';

type SignInScreenProps = {
  onSignIn?: () => void;
  onCreateAccount?: () => void;
  onGoogleSignIn?: () => void;
  onFacebookSignIn?: () => void;
  onForgotPassword?: () => void;
  onBack?: () => void;
};

// Type guard functions để đảm bảo type safety
function isFunction(fn: unknown): fn is (() => void) {
  return typeof fn === 'function';
}

function isString(value: unknown): value is string {
  return typeof value === 'string';
}

export default function SignInScreen({
  onSignIn,
  onCreateAccount,
  onGoogleSignIn,
  onFacebookSignIn,
  onForgotPassword,
  onBack
}: SignInScreenProps): ReactElement {
  const { login } = useAuth();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

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

  const handleSignIn = async (): Promise<void> => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ email và mật khẩu');
      return;
    }

    setIsLoading(true);

    try {
      const result = await loginWithEmail(email.trim(), password);

      if (result.success) {
        console.log('✅ Login successful:', result.data?.user);

        // Update AuthContext with user data
        if (result.data?.user) {
          login(result.data.user);
        }

        Alert.alert('Thành công', 'Đăng nhập thành công!', [
          {
            text: 'OK',
            onPress: () => {
              if (isFunction(onSignIn)) {
                onSignIn();
              }
            }
          }
        ]);
      } else {
        console.log('❌ Login failed:', result.error);
        let errorMessage = 'Đăng nhập thất bại';

        if (result.error?.code === 'VALIDATION_ERROR') {
          errorMessage = 'Thông tin đăng nhập không hợp lệ';
        } else if (result.error?.message?.includes('Invalid credentials')) {
          errorMessage = 'Email hoặc mật khẩu không đúng';
        } else if (result.error?.message?.includes('Account not verified')) {
          errorMessage = 'Tài khoản chưa được xác thực. Vui lòng kiểm tra email để xác thực tài khoản.';
        } else if (result.error?.code === 'NETWORK_ERROR') {
          errorMessage = 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.';
        } else if (result.error?.message) {
          errorMessage = result.error.message;
        }

        Alert.alert('Lỗi đăng nhập', errorMessage);
      }
    } catch (error: any) {
      console.error('❌ Unexpected login error:', error);
      Alert.alert('Lỗi', 'Đã xảy ra lỗi không mong muốn. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAccount = (): void => {
    if (isFunction(onCreateAccount)) {
      onCreateAccount();
    }
  };

  const handleGoogleSignIn = async (): Promise<void> => {
    setIsLoading(true);

    try {
      console.log('🔍 Starting Google sign in');
      const result = await mockGoogleSignIn();

      if (result.success) {
        console.log('✅ Google sign in successful:', result.user);

        // Update AuthContext with user data
        if (result.user) {
          login(result.user);
        }

        Alert.alert('Thành công', 'Đăng nhập Google thành công!', [
          {
            text: 'OK',
            onPress: () => {
              if (isFunction(onGoogleSignIn)) {
                onGoogleSignIn();
              }
            }
          }
        ]);
      } else {
        console.log('❌ Google sign in failed:', result.error);
        Alert.alert('Lỗi đăng nhập Google', result.error || 'Đăng nhập Google thất bại');
      }
    } catch (error: any) {
      console.error('❌ Unexpected Google sign in error:', error);
      Alert.alert('Lỗi', 'Đã xảy ra lỗi không mong muốn. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFacebookSignIn = async (): Promise<void> => {
    setIsLoading(true);

    try {
      console.log('📘 Starting Facebook sign in');
      const result = await mockFacebookSignIn();

      if (result.success) {
        console.log('✅ Facebook sign in successful:', result.user);

        // Update AuthContext with user data
        if (result.user) {
          login(result.user);
        }

        Alert.alert('Thành công', 'Đăng nhập Facebook thành công!', [
          {
            text: 'OK',
            onPress: () => {
              if (isFunction(onFacebookSignIn)) {
                onFacebookSignIn();
              }
            }
          }
        ]);
      } else {
        console.log('❌ Facebook sign in failed:', result.error);
        Alert.alert('Lỗi đăng nhập Facebook', result.error || 'Đăng nhập Facebook thất bại');
      }
    } catch (error: any) {
      console.error('❌ Unexpected Facebook sign in error:', error);
      Alert.alert('Lỗi', 'Đã xảy ra lỗi không mong muốn. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = (): void => {
    if (isFunction(onBack)) {
      onBack();
    } else {
      // Fallback: log để debug
      console.log('Back button pressed but no onBack prop provided');
      // Có thể thêm navigation logic ở đây nếu cần
    }
  };

  const handleForgotPassword = (): void => {
    if (isFunction(onForgotPassword)) {
      onForgotPassword();
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

          {/* Login Form */}
          <View style={styles.formContainer}>
            {/* Title and Description */}
            <View style={styles.titleSection}>
              <Text style={styles.welcomeTitle}>Xin chào, chào mừng trở lại!</Text>
              <Text style={styles.subtitle}>Hy vọng bạn đang khỏe mạnh.</Text>
            </View>

            {/* Input Fields */}
            <View style={styles.inputsContainer}>
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

            {/* Sign In Button */}
            <TouchableOpacity
              style={[styles.signInButton, isLoading && styles.signInButtonDisabled]}
              onPress={handleSignIn}
              disabled={isLoading}
              accessible
              accessibilityLabel="Đăng nhập"
            >
              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <MaterialIcons name="hourglass-empty" size={20} color="#FFFFFF" />
                  <Text style={styles.signInButtonText}>Đang đăng nhập...</Text>
                </View>
              ) : (
                <Text style={styles.signInButtonText}>Đăng nhập</Text>
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
                onPress={handleGoogleSignIn}
                accessible
                accessibilityLabel="Đăng nhập với Google"
              >
                <GoogleIcon size={20} />
                <Text style={styles.socialButtonText}>Tiếp tục với Google</Text>
              </TouchableOpacity>

              {/* Facebook Button */}
              <TouchableOpacity
                style={styles.socialButton}
                onPress={handleFacebookSignIn}
                accessible
                accessibilityLabel="Đăng nhập với Facebook"
              >
                <FacebookIcon size={20} />
                <Text style={styles.socialButtonText}>Tiếp tục với Facebook</Text>
              </TouchableOpacity>
            </View>

            {/* Test Login Button */}
            <TouchableOpacity
              style={styles.testLoginButton}
              onPress={handleSignIn}
              accessible
              accessibilityLabel="Test đăng nhập nhanh"
            >
              <MaterialIcons name="flash-on" size={20} color="#FFFFFF" />
              <Text style={styles.testLoginButtonText}>Test Đăng Nhập Nhanh</Text>
            </TouchableOpacity>

            {/* Helper Text */}
            <TouchableOpacity onPress={handleForgotPassword}>
              <Text style={styles.forgotPasswordLink}>Quên mật khẩu?</Text>
            </TouchableOpacity>

            <View style={styles.signUpContainer}>
              <Text style={styles.helperText}>Chưa có tài khoản? </Text>
              <TouchableOpacity onPress={handleCreateAccount}>
                <Text style={styles.signUpLink}>Đăng ký</Text>
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



  // Sign In Button
  signInButton: {
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
  signInButtonText: {
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
  forgotPasswordLink: {
    fontFamily: 'Inter',
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    color: '#1C64F2',
    width: '100%',
  },
  signUpContainer: {
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
  signUpLink: {
    fontFamily: 'Inter',
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 21,
    color: '#1C64F2',
  },

  // Test Login Button
  testLoginButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    gap: 8,
    backgroundColor: '#10B981',
    borderRadius: 8,
    height: 48,
    width: '100%',
  },
  testLoginButtonText: {
    fontFamily: 'Inter',
    fontWeight: '600',
    fontSize: 14,
    lineHeight: 21,
    color: '#FFFFFF',
  },
  signInButtonDisabled: {
    opacity: 0.6,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
});
