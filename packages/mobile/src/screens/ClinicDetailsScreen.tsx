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
  Image,
  ActivityIndicator,
  Alert,
  Linking,
  Dimensions,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { getClinicById, getClinicDoctors, Clinic, ClinicWithDoctors } from '../services/clinics.service';

const { width: screenWidth } = Dimensions.get('window');

interface ClinicDetailsScreenProps {
  clinicId: string;
  onNavigateBack?: () => void;
  onNavigateDoctorDetails?: (doctorId: string) => void;
  onNavigateBookAppointment?: (doctorId: string, clinicId: string) => void;
}

export default function ClinicDetailsScreen({
  clinicId,
  onNavigateBack,
  onNavigateDoctorDetails,
  onNavigateBookAppointment,
}: ClinicDetailsScreenProps): ReactElement {
  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [doctors, setDoctors] = useState<ClinicWithDoctors['clinicDoctors']>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDoctorsLoading, setIsDoctorsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);

  useEffect(() => {
    fetchClinicDetails();
    fetchClinicDoctors();
  }, [clinicId]);

  const fetchClinicDetails = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await getClinicById(clinicId);

      if (result.success && result.data) {
        setClinic(result.data);
        console.log('✅ Clinic details loaded:', result.data.name);
      } else {
        throw new Error(result.error?.message || 'Failed to fetch clinic details');
      }
    } catch (error: any) {
      console.error('❌ Fetch clinic details error:', error);
      setError(error.message || 'Không thể tải thông tin phòng khám');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchClinicDoctors = async (): Promise<void> => {
    try {
      setIsDoctorsLoading(true);

      const result = await getClinicDoctors(clinicId, { limit: 10 });

      if (result.success && result.data) {
        setDoctors(result.data.data);
        console.log('✅ Clinic doctors loaded:', result.data.data.length, 'doctors');
      } else {
        console.log('⚠️ Failed to fetch clinic doctors:', result.error);
        // Don't show error for doctors, just keep empty array
      }
    } catch (error: any) {
      console.error('❌ Fetch clinic doctors error:', error);
      // Don't show error for doctors, just keep empty array
    } finally {
      setIsDoctorsLoading(false);
    }
  };

  const handleCallClinic = (): void => {
    if (clinic?.phone) {
      Linking.openURL(`tel:${clinic.phone}`);
    } else {
      Alert.alert('Thông báo', 'Số điện thoại không khả dụng');
    }
  };

  const handleGetDirections = (): void => {
    if (clinic?.latitude && clinic?.longitude) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${clinic.latitude},${clinic.longitude}`;
      Linking.openURL(url);
    } else {
      Alert.alert('Thông báo', 'Vị trí không khả dụng');
    }
  };

  const handleDoctorPress = (doctor: ClinicWithDoctors['clinicDoctors'][0]): void => {
    if (onNavigateDoctorDetails) {
      onNavigateDoctorDetails(doctor.doctorId);
    } else {
      Alert.alert('Chi tiết bác sĩ', `${doctor.doctor.user.firstName} ${doctor.doctor.user.lastName}`);
    }
  };

  const handleBookAppointment = (doctor: ClinicWithDoctors['clinicDoctors'][0]): void => {
    if (onNavigateBookAppointment) {
      onNavigateBookAppointment(doctor.doctorId, clinicId);
    } else {
      Alert.alert('Đặt lịch hẹn', `Đặt lịch với ${doctor.doctor.user.firstName} ${doctor.doctor.user.lastName}`);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <MaterialIcons
        key={index}
        name="star"
        size={14}
        color={index < Math.floor(rating) ? "#FEB052" : "#E5E7EB"}
      />
    ));
  };

  const formatWorkingDays = (workingDays: string[]): string => {
    const dayMap: { [key: string]: string } = {
      'MONDAY': 'T2',
      'TUESDAY': 'T3',
      'WEDNESDAY': 'T4',
      'THURSDAY': 'T5',
      'FRIDAY': 'T6',
      'SATURDAY': 'T7',
      'SUNDAY': 'CN',
    };
    
    return workingDays.map(day => dayMap[day] || day).join(', ');
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Đang tải thông tin phòng khám...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !clinic) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={48} color="#DC2626" />
          <Text style={styles.errorTitle}>Không thể tải thông tin</Text>
          <Text style={styles.errorText}>{error || 'Phòng khám không tồn tại'}</Text>
          <TouchableOpacity onPress={fetchClinicDetails} style={styles.retryButton}>
            <Text style={styles.retryText}>Thử lại</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onNavigateBack} style={styles.backButton}>
            <Text style={styles.backText}>Quay lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onNavigateBack} style={styles.headerBackButton}>
          <MaterialIcons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết phòng khám</Text>
        <TouchableOpacity style={styles.favoriteButton}>
          <MaterialIcons name="favorite-border" size={24} color="#1F2937" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Images */}
        {clinic.images && clinic.images.length > 0 && (
          <View style={styles.imagesSection}>
            <ScrollView 
              horizontal 
              pagingEnabled 
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={(event) => {
                const index = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
                setSelectedImageIndex(index);
              }}
            >
              {clinic.images.map((image, index) => (
                <Image
                  key={index}
                  source={{ uri: image }}
                  style={styles.clinicImage}
                  resizeMode="cover"
                />
              ))}
            </ScrollView>
            
            {/* Image indicators */}
            {clinic.images.length > 1 && (
              <View style={styles.imageIndicators}>
                {clinic.images.map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.indicator,
                      index === selectedImageIndex && styles.activeIndicator
                    ]}
                  />
                ))}
              </View>
            )}
          </View>
        )}

        {/* Basic Info */}
        <View style={styles.basicInfoSection}>
          <Text style={styles.clinicName}>{clinic.name}</Text>
          
          <View style={styles.addressRow}>
            <MaterialIcons name="location-on" size={16} color="#6B7280" />
            <Text style={styles.addressText}>{clinic.address}</Text>
          </View>

          <View style={styles.timeRow}>
            <MaterialIcons name="access-time" size={16} color="#6B7280" />
            <Text style={styles.timeText}>
              {clinic.openTime} - {clinic.closeTime}
            </Text>
          </View>

          {clinic.phone && (
            <View style={styles.phoneRow}>
              <MaterialIcons name="phone" size={16} color="#6B7280" />
              <Text style={styles.phoneText}>{clinic.phone}</Text>
            </View>
          )}

          {clinic.email && (
            <View style={styles.emailRow}>
              <MaterialIcons name="email" size={16} color="#6B7280" />
              <Text style={styles.emailText}>{clinic.email}</Text>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtonsSection}>
          <TouchableOpacity style={styles.actionButton} onPress={handleCallClinic}>
            <MaterialIcons name="phone" size={20} color="#007AFF" />
            <Text style={styles.actionButtonText}>Gọi điện</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton} onPress={handleGetDirections}>
            <MaterialIcons name="directions" size={20} color="#007AFF" />
            <Text style={styles.actionButtonText}>Chỉ đường</Text>
          </TouchableOpacity>
        </View>

        {/* Description */}
        {clinic.description && (
          <View style={styles.descriptionSection}>
            <Text style={styles.sectionTitle}>Mô tả</Text>
            <Text style={styles.descriptionText}>{clinic.description}</Text>
          </View>
        )}

        {/* Doctors */}
        <View style={styles.doctorsSection}>
          <Text style={styles.sectionTitle}>Bác sĩ ({doctors.length})</Text>
          
          {isDoctorsLoading ? (
            <View style={styles.doctorsLoading}>
              <ActivityIndicator size="small" color="#007AFF" />
              <Text style={styles.loadingText}>Đang tải danh sách bác sĩ...</Text>
            </View>
          ) : doctors.length > 0 ? (
            doctors.map((clinicDoctor) => (
              <TouchableOpacity
                key={clinicDoctor.id}
                style={styles.doctorCard}
                onPress={() => handleDoctorPress(clinicDoctor)}
              >
                <View style={styles.doctorAvatar}>
                  {clinicDoctor.doctor.user.avatar ? (
                    <Image
                      source={{ uri: clinicDoctor.doctor.user.avatar }}
                      style={styles.avatarImage}
                    />
                  ) : (
                    <MaterialIcons name="person" size={30} color="#9CA3AF" />
                  )}
                </View>
                
                <View style={styles.doctorInfo}>
                  <Text style={styles.doctorName}>
                    {clinicDoctor.doctor.user.firstName} {clinicDoctor.doctor.user.lastName}
                  </Text>
                  <Text style={styles.specialtyName}>
                    {clinicDoctor.doctor.specialty?.name || 'Chuyên khoa'}
                  </Text>
                  <Text style={styles.experienceText}>
                    {clinicDoctor.doctor.experience} năm kinh nghiệm
                  </Text>
                  
                  <View style={styles.ratingRow}>
                    <View style={styles.starsContainer}>
                      {renderStars(clinicDoctor.doctor.averageRating)}
                    </View>
                    <Text style={styles.ratingText}>
                      {clinicDoctor.doctor.averageRating.toFixed(1)} ({clinicDoctor.doctor.totalReviews} đánh giá)
                    </Text>
                  </View>
                  
                  <Text style={styles.workingDaysText}>
                    {formatWorkingDays(clinicDoctor.workingDays)} • {clinicDoctor.startTime} - {clinicDoctor.endTime}
                  </Text>
                </View>
                
                <View style={styles.doctorActions}>
                  <Text style={styles.consultationFee}>
                    {clinicDoctor.doctor.consultationFee.toLocaleString('vi-VN')}đ
                  </Text>
                  <TouchableOpacity
                    style={styles.bookButton}
                    onPress={() => handleBookAppointment(clinicDoctor)}
                  >
                    <Text style={styles.bookButtonText}>Đặt lịch</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.noDoctorsContainer}>
              <MaterialIcons name="person-off" size={48} color="#9CA3AF" />
              <Text style={styles.noDoctorsText}>Chưa có thông tin bác sĩ</Text>
            </View>
          )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 15,
    marginBottom: 10,
  },
  errorText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  backText: {
    color: '#6B7280',
    fontSize: 16,
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
  headerBackButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  favoriteButton: {
    padding: 5,
  },
  content: {
    flex: 1,
  },

  // Images Section
  imagesSection: {
    position: 'relative',
  },
  clinicImage: {
    width: screenWidth,
    height: 250,
  },
  imageIndicators: {
    position: 'absolute',
    bottom: 15,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  activeIndicator: {
    backgroundColor: '#FFFFFF',
  },

  // Basic Info Section
  basicInfoSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  clinicName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 15,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
    gap: 8,
  },
  addressText: {
    flex: 1,
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 24,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  timeText: {
    fontSize: 16,
    color: '#6B7280',
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  phoneText: {
    fontSize: 16,
    color: '#6B7280',
  },
  emailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  emailText: {
    fontSize: 16,
    color: '#6B7280',
  },

  // Action Buttons
  actionButtonsSection: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
    gap: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#007AFF',
    borderRadius: 8,
    gap: 8,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#007AFF',
  },

  // Description Section
  descriptionSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 15,
  },
  descriptionText: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 24,
  },

  // Doctors Section
  doctorsSection: {
    padding: 20,
  },
  doctorsLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 10,
  },
  doctorCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  doctorAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    overflow: 'hidden',
  },
  avatarImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  doctorInfo: {
    flex: 1,
    marginRight: 10,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  specialtyName: {
    fontSize: 14,
    color: '#007AFF',
    marginBottom: 4,
  },
  experienceText: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 2,
  },
  ratingText: {
    fontSize: 12,
    color: '#6B7280',
  },
  workingDaysText: {
    fontSize: 12,
    color: '#6B7280',
  },
  doctorActions: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  consultationFee: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 10,
  },
  bookButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  noDoctorsContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noDoctorsText: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 10,
  },
  bottomSpacing: {
    height: 50,
  },
});
