import React, { useState } from 'react';
import type { ReactElement } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { changePassword, ChangePasswordRequest } from '../services/me.service';

interface ChangePasswordScreenProps {
  onNavigateBack?: () => void;
}

export default function ChangePasswordScreen({
  onNavigateBack,
}: ChangePasswordScreenProps): ReactElement {
  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Password visibility states
  const [showCurrentPassword, setShowCurrentPassword] = useState<boolean>(false);
  const [showNewPassword, setShowNewPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);

  const validateForm = (): string | null => {
    if (!currentPassword.trim()) {
      return 'Vui lòng nhập mật khẩu hiện tại';
    }

    if (!newPassword.trim()) {
      return 'Vui lòng nhập mật khẩu mới';
    }

    if (newPassword.length < 6) {
      return 'Mật khẩu mới phải có ít nhất 6 ký tự';
    }

    if (newPassword !== confirmPassword) {
      return 'Mật khẩu xác nhận không khớp';
    }

    if (currentPassword === newPassword) {
      return 'Mật khẩu mới phải khác mật khẩu hiện tại';
    }

    return null;
  };

  const handleChangePassword = async (): Promise<void> => {
    try {
      setError(null);

      // Validate form
      const validationError = validateForm();
      if (validationError) {
        setError(validationError);
        Alert.alert('Lỗi', validationError);
        return;
      }

      setIsSaving(true);

      const requestData: ChangePasswordRequest = {
        currentPassword: currentPassword.trim(),
        newPassword: newPassword.trim(),
      };

      const result = await changePassword(requestData);

      if (result.success) {
        Alert.alert(
          'Thành công', 
          'Mật khẩu đã được thay đổi thành công!',
          [
            { 
              text: 'OK', 
              onPress: () => {
                // Clear form
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
                // Navigate back
                if (onNavigateBack) {
                  onNavigateBack();
                }
              }
            }
          ]
        );

        console.log('✅ ChangePasswordScreen: Password changed successfully');
      } else {
        throw new Error(result.error?.message || 'Failed to change password');
      }
    } catch (error: any) {
      console.error('❌ ChangePasswordScreen: Change password error:', error);
      setError(error.message || 'Failed to change password');
      Alert.alert('Lỗi', error.message || 'Không thể thay đổi mật khẩu. Vui lòng thử lại.');
    } finally {
      setIsSaving(false);
    }
  };

  const isFormValid = currentPassword.trim() && newPassword.trim() && confirmPassword.trim();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onNavigateBack} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Đổi mật khẩu</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Error Message */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Instructions */}
        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionsTitle}>Thay đổi mật khẩu</Text>
          <Text style={styles.instructionsText}>
            Để bảo mật tài khoản, vui lòng nhập mật khẩu hiện tại và mật khẩu mới.
          </Text>
        </View>

        {/* Form */}
        <View style={styles.formContainer}>
          {/* Current Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Mật khẩu hiện tại *</Text>
            <View style={styles.passwordInputContainer}>
              <TextInput
                style={styles.passwordInput}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                placeholder="Nhập mật khẩu hiện tại"
                placeholderTextColor="#9CA3AF"
                secureTextEntry={!showCurrentPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                style={styles.eyeButton}
              >
                <MaterialIcons
                  name={showCurrentPassword ? 'visibility' : 'visibility-off'}
                  size={20}
                  color="#6B7280"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* New Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Mật khẩu mới *</Text>
            <View style={styles.passwordInputContainer}>
              <TextInput
                style={styles.passwordInput}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Nhập mật khẩu mới (ít nhất 6 ký tự)"
                placeholderTextColor="#9CA3AF"
                secureTextEntry={!showNewPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                onPress={() => setShowNewPassword(!showNewPassword)}
                style={styles.eyeButton}
              >
                <MaterialIcons
                  name={showNewPassword ? 'visibility' : 'visibility-off'}
                  size={20}
                  color="#6B7280"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Confirm Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Xác nhận mật khẩu mới *</Text>
            <View style={styles.passwordInputContainer}>
              <TextInput
                style={styles.passwordInput}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Nhập lại mật khẩu mới"
                placeholderTextColor="#9CA3AF"
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                style={styles.eyeButton}
              >
                <MaterialIcons
                  name={showConfirmPassword ? 'visibility' : 'visibility-off'}
                  size={20}
                  color="#6B7280"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Password Requirements */}
          <View style={styles.requirementsContainer}>
            <Text style={styles.requirementsTitle}>Yêu cầu mật khẩu:</Text>
            <View style={styles.requirementItem}>
              <MaterialIcons 
                name={newPassword.length >= 6 ? 'check-circle' : 'radio-button-unchecked'} 
                size={16} 
                color={newPassword.length >= 6 ? '#10B981' : '#9CA3AF'} 
              />
              <Text style={[
                styles.requirementText,
                newPassword.length >= 6 && styles.requirementTextValid
              ]}>
                Ít nhất 6 ký tự
              </Text>
            </View>
            <View style={styles.requirementItem}>
              <MaterialIcons 
                name={newPassword !== currentPassword && newPassword.length > 0 ? 'check-circle' : 'radio-button-unchecked'} 
                size={16} 
                color={newPassword !== currentPassword && newPassword.length > 0 ? '#10B981' : '#9CA3AF'} 
              />
              <Text style={[
                styles.requirementText,
                newPassword !== currentPassword && newPassword.length > 0 && styles.requirementTextValid
              ]}>
                Khác mật khẩu hiện tại
              </Text>
            </View>
            <View style={styles.requirementItem}>
              <MaterialIcons 
                name={newPassword === confirmPassword && newPassword.length > 0 ? 'check-circle' : 'radio-button-unchecked'} 
                size={16} 
                color={newPassword === confirmPassword && newPassword.length > 0 ? '#10B981' : '#9CA3AF'} 
              />
              <Text style={[
                styles.requirementText,
                newPassword === confirmPassword && newPassword.length > 0 && styles.requirementTextValid
              ]}>
                Mật khẩu xác nhận khớp
              </Text>
            </View>
          </View>

          {/* Save Button */}
          <TouchableOpacity
            onPress={handleChangePassword}
            style={[styles.saveButton, (!isFormValid || isSaving) && styles.saveButtonDisabled]}
            disabled={!isFormValid || isSaving}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.saveButtonText}>Đổi mật khẩu</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Bottom spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  placeholder: {
    width: 34, // Same width as back button for centering
  },
  content: {
    flex: 1,
  },
  errorContainer: {
    marginHorizontal: 20,
    marginTop: 20,
    padding: 15,
    backgroundColor: '#FEF2F2',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
    textAlign: 'center',
  },
  instructionsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  instructionsTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 10,
  },
  instructionsText: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 24,
  },
  formContainer: {
    paddingHorizontal: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  eyeButton: {
    padding: 12,
  },
  requirementsContainer: {
    marginBottom: 30,
    padding: 15,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 10,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  requirementText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
  },
  requirementTextValid: {
    color: '#10B981',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  saveButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomSpacing: {
    height: 50,
  },
});
