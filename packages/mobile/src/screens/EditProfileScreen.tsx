import React, { useState, useEffect } from 'react';
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
  Image,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { getUserProfile, updateUserProfile, updatePatientProfile, uploadAvatar, UserProfile, UpdateProfileRequest, UpdatePatientProfileRequest } from '../services/me.service';
import { useAuth } from '../contexts/AuthContext';
import * as ImagePicker from 'expo-image-picker';

interface EditProfileScreenProps {
  onNavigateBack?: () => void;
}

export default function EditProfileScreen({
  onNavigateBack,
}: EditProfileScreenProps): ReactElement {
  const { user: authUser, updateUser } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(authUser);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Form fields
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [dateOfBirth, setDateOfBirth] = useState<string>('');
  const [gender, setGender] = useState<'MALE' | 'FEMALE' | 'OTHER' | ''>('');
  const [address, setAddress] = useState<string>('');

  // Patient-specific fields
  const [bloodType, setBloodType] = useState<string>('');
  const [allergies, setAllergies] = useState<string>('');
  const [emergencyContact, setEmergencyContact] = useState<string>('');
  const [insuranceNumber, setInsuranceNumber] = useState<string>('');

  useEffect(() => {
    fetchUserProfile();
  }, []);

  useEffect(() => {
    if (userProfile) {
      populateForm(userProfile);
    }
  }, [userProfile]);

  const fetchUserProfile = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await getUserProfile();

      if (result.success && result.data) {
        setUserProfile(result.data);
        console.log('✅ EditProfileScreen: User profile loaded successfully');
      } else {
        console.log('❌ EditProfileScreen: Failed to load user profile:', result.error);
        setError(result.error?.message || 'Failed to load user profile');
        // Fallback to auth user if available
        if (authUser) {
          setUserProfile(authUser);
        }
      }
    } catch (error: any) {
      console.error('❌ EditProfileScreen: Unexpected error loading user profile:', error);
      setError('Unexpected error loading user profile');
      if (authUser) {
        setUserProfile(authUser);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const populateForm = (profile: UserProfile): void => {
    setFirstName(profile.firstName || '');
    setLastName(profile.lastName || '');
    setPhone(profile.phone || '');
    setDateOfBirth(profile.dateOfBirth ? profile.dateOfBirth.split('T')[0] : '');
    setGender(profile.gender || '');
    setAddress(profile.address || '');

    // Patient-specific fields
    if (profile.patient) {
      setBloodType(profile.patient.bloodType || '');
      setAllergies(profile.patient.allergies || '');
      setEmergencyContact(profile.patient.emergencyContact || '');
      setInsuranceNumber(profile.patient.insuranceNumber || '');
    }
  };

  const handleSaveProfile = async (): Promise<void> => {
    try {
      setIsSaving(true);
      setError(null);

      // Validate required fields
      if (!firstName.trim() || !lastName.trim()) {
        Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ họ và tên');
        return;
      }

      // Prepare basic profile data
      const profileData: UpdateProfileRequest = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim() || undefined,
        dateOfBirth: dateOfBirth ? `${dateOfBirth}T00:00:00.000Z` : undefined,
        gender: gender || undefined,
        address: address.trim() || undefined,
      };

      // Update basic profile
      const profileResult = await updateUserProfile(profileData);

      if (!profileResult.success) {
        throw new Error(profileResult.error?.message || 'Failed to update profile');
      }

      // Update patient-specific data if user is a patient
      if (userProfile?.role === 'PATIENT') {
        const patientData: UpdatePatientProfileRequest = {
          bloodType: bloodType.trim() || undefined,
          allergies: allergies.trim() || undefined,
          emergencyContact: emergencyContact.trim() || undefined,
          insuranceNumber: insuranceNumber.trim() || undefined,
        };

        const patientResult = await updatePatientProfile(patientData);

        if (!patientResult.success) {
          throw new Error(patientResult.error?.message || 'Failed to update patient profile');
        }

        // Update local state with new data
        if (patientResult.data) {
          setUserProfile(patientResult.data);
          updateUser(patientResult.data);
        }
      } else {
        // For non-patient users, just update with basic profile data
        const updatedProfile = { ...userProfile, ...profileResult.data } as UserProfile;
        setUserProfile(updatedProfile);
        updateUser(updatedProfile);
      }

      Alert.alert('Thành công', 'Hồ sơ đã được cập nhật thành công!', [
        { text: 'OK', onPress: onNavigateBack }
      ]);

      console.log('✅ EditProfileScreen: Profile updated successfully');

    } catch (error: any) {
      console.error('❌ EditProfileScreen: Save profile error:', error);
      setError(error.message || 'Failed to save profile');
      Alert.alert('Lỗi', error.message || 'Không thể lưu hồ sơ. Vui lòng thử lại.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangeAvatar = async (): Promise<void> => {
    try {
      // Request permission
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permissionResult.granted === false) {
        Alert.alert('Quyền truy cập', 'Cần quyền truy cập thư viện ảnh để thay đổi avatar.');
        return;
      }

      // Pick image
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setIsSaving(true);

        const uploadResult = await uploadAvatar(result.assets[0].uri);

        if (uploadResult.success && uploadResult.data) {
          // Update local state
          const updatedProfile = { ...userProfile, avatar: uploadResult.data.avatarUrl } as UserProfile;
          setUserProfile(updatedProfile);
          updateUser(updatedProfile);

          Alert.alert('Thành công', 'Avatar đã được cập nhật!');
        } else {
          throw new Error(uploadResult.error?.message || 'Failed to upload avatar');
        }
      }
    } catch (error: any) {
      console.error('❌ EditProfileScreen: Change avatar error:', error);
      Alert.alert('Lỗi', error.message || 'Không thể thay đổi avatar. Vui lòng thử lại.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Đang tải hồ sơ...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onNavigateBack} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chỉnh sửa hồ sơ</Text>
        <TouchableOpacity
          onPress={handleSaveProfile}
          style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.saveButtonText}>Lưu</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Content */}

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Error Message */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={fetchUserProfile} style={styles.retryButton}>
              <Text style={styles.retryText}>Thử lại</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarContainer}>
            {userProfile?.avatar ? (
              <Image
                source={{ uri: userProfile.avatar }}
                style={styles.avatar}
                onError={() => console.log('Failed to load avatar')}
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <MaterialIcons name="person" size={60} color="#9CA3AF" />
              </View>
            )}
          </View>
          <TouchableOpacity onPress={handleChangeAvatar} style={styles.changeAvatarButton}>
            <Text style={styles.changeAvatarText}>Thay đổi ảnh đại diện</Text>
          </TouchableOpacity>
        </View>

        {/* Basic Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin cơ bản</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Họ *</Text>
            <TextInput
              style={styles.input}
              value={firstName}
              onChangeText={setFirstName}
              placeholder="Nhập họ"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Tên *</Text>
            <TextInput
              style={styles.input}
              value={lastName}
              onChangeText={setLastName}
              placeholder="Nhập tên"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Số điện thoại</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="Nhập số điện thoại"
              placeholderTextColor="#9CA3AF"
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Ngày sinh</Text>
            <TextInput
              style={styles.input}
              value={dateOfBirth}
              onChangeText={setDateOfBirth}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Địa chỉ</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={address}
              onChangeText={setAddress}
              placeholder="Nhập địa chỉ"
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={3}
            />
          </View>
        </View>
        {/* Patient-specific Information */}
        {userProfile?.role === 'PATIENT' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Thông tin y tế</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nhóm máu</Text>
              <TextInput
                style={styles.input}
                value={bloodType}
                onChangeText={setBloodType}
                placeholder="Ví dụ: A+, B-, O+, AB-"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Dị ứng</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={allergies}
                onChangeText={setAllergies}
                placeholder="Mô tả các loại dị ứng (nếu có)"
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Liên hệ khẩn cấp</Text>
              <TextInput
                style={styles.input}
                value={emergencyContact}
                onChangeText={setEmergencyContact}
                placeholder="Số điện thoại liên hệ khẩn cấp"
                placeholderTextColor="#9CA3AF"
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Số bảo hiểm</Text>
              <TextInput
                style={styles.input}
                value={insuranceNumber}
                onChangeText={setInsuranceNumber}
                placeholder="Nhập số bảo hiểm y tế"
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </View>
        )}

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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#6B7280',
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
  saveButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 60,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
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
    marginBottom: 10,
  },
  retryButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: '#DC2626',
    borderRadius: 6,
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },

  avatarSection: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  avatarContainer: {
    marginBottom: 15,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  changeAvatarButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  changeAvatarText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '500',
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 20,
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
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1F2937',
    backgroundColor: '#FFFFFF',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  bottomSpacing: {
    height: 50,
  },
});

