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
  Dimensions,
  ActivityIndicator,
  Alert
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { getDoctorById, Doctor } from '../services/doctors.service';
import { getDoctorReviews, Review } from '../services/reviews.service';

const { width } = Dimensions.get('window');

type DoctorDetailsScreenProps = {
  onBack?: () => void;
  onBookAppointment?: () => void;
  doctorId?: string;
};

// Using Doctor and Review types from services

// Mock data removed - using real API data

function isFunction(fn: unknown): fn is Function {
  return typeof fn === 'function';
}

export default function DoctorDetailsScreen({ onBack, onBookAppointment, doctorId }: DoctorDetailsScreenProps): ReactElement {
  const [isLiked, setIsLiked] = useState(false);
  const [showFullAbout, setShowFullAbout] = useState(false);

  // Real data states
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoadingDoctor, setIsLoadingDoctor] = useState<boolean>(true);
  const [isLoadingReviews, setIsLoadingReviews] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data when component mounts or doctorId changes
  useEffect(() => {
    if (doctorId) {
      fetchDoctorDetails();
      fetchDoctorReviews();
    }
  }, [doctorId]);

  const fetchDoctorDetails = async (): Promise<void> => {
    if (!doctorId) return;

    try {
      setIsLoadingDoctor(true);
      setError(null);

      const result = await getDoctorById(doctorId);

      if (result.success && result.data) {
        setDoctor(result.data);
        console.log('✅ DoctorDetailsScreen: Doctor details loaded successfully');
      } else {
        console.log('❌ DoctorDetailsScreen: Failed to load doctor details:', result.error);
        setError(result.error?.message || 'Failed to load doctor details');
      }
    } catch (error: any) {
      console.error('❌ DoctorDetailsScreen: Unexpected error loading doctor details:', error);
      setError('Unexpected error loading doctor details');
    } finally {
      setIsLoadingDoctor(false);
    }
  };

  const fetchDoctorReviews = async (): Promise<void> => {
    if (!doctorId) return;

    try {
      setIsLoadingReviews(true);

      const result = await getDoctorReviews(doctorId, { limit: 10 });

      if (result.success && result.data) {
        setReviews(result.data.data);
        console.log('✅ DoctorDetailsScreen: Doctor reviews loaded successfully');
      } else {
        console.log('❌ DoctorDetailsScreen: Failed to load doctor reviews:', result.error);
        // Don't set error for reviews failure, just log it
      }
    } catch (error: any) {
      console.error('❌ DoctorDetailsScreen: Unexpected error loading doctor reviews:', error);
      // Don't set error for reviews failure, just log it
    } finally {
      setIsLoadingReviews(false);
    }
  };

  const handleBack = (): void => {
    if (isFunction(onBack)) {
      onBack();
    }
  };

  const handleBookAppointment = (): void => {
    if (isFunction(onBookAppointment)) {
      onBookAppointment();
    }
  };

  const handleLike = (): void => {
    setIsLiked(!isLiked);
  };

  const handleReadMore = (): void => {
    setShowFullAbout(!showFullAbout);
  };

  const renderStars = (rating: number) => {
    return (
      <View style={styles.star}>
        <MaterialIcons
          name="star"
          size={12}
          color="#1C2A3A"
        />
      </View>
    );
  };

  const renderStatTab = (icon: string, value: string, label: string) => (
    <View style={styles.statTab}>
      <View style={styles.statIcon}>
        <MaterialIcons name={icon as any} size={30} color="#1C2A3A" />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );

  // Show loading screen while fetching doctor details
  if (isLoadingDoctor) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Đang tải thông tin bác sĩ...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show error screen if failed to load doctor
  if (error || !doctor) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={48} color="#EF4444" />
          <Text style={styles.errorText}>
            {error || 'Không tìm thấy thông tin bác sĩ'}
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={fetchDoctorDetails}
          >
            <Text style={styles.retryText}>Thử lại</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.backButtonError}
            onPress={handleBack}
          >
            <Text style={styles.backButtonText}>Quay lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Card & Title Section */}
        <View style={styles.cardSection}>
          {/* Title/Back-icon/Like-icon */}
          <View style={styles.titleSection}>
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <MaterialIcons name="arrow-back" size={24} color="#374151" />
            </TouchableOpacity>
            <Text style={styles.title}>Chi tiết bác sĩ</Text>
            <TouchableOpacity onPress={handleLike} style={styles.likeButton}>
              <MaterialIcons 
                name={isLiked ? "favorite" : "favorite-border"} 
                size={20} 
                color={isLiked ? "#FF6B6B" : "#374151"} 
              />
            </TouchableOpacity>
          </View>

          {/* Doctor Card */}
          <View style={styles.doctorCard}>
            <Image
              source={
                doctor.user.avatar
                  ? { uri: doctor.user.avatar }
                  : require('../../assets/behnazsabaa_Portrait_of_Smiling_male_Medical_Doctor__Style_of_H_22f8a7ff-a589-4d1b-880a-172332b8a241.jpg')
              }
              style={styles.doctorImage}
            />
            <View style={styles.doctorInfo}>
              <Text style={styles.doctorName}>
                Dr. {doctor.user.firstName} {doctor.user.lastName}
              </Text>
              <View style={styles.separator} />
              <Text style={styles.doctorSpecialty}>{doctor.specialty.name}</Text>
              <View style={styles.locationContainer}>
                <MaterialIcons name="location-on" size={14} color="#4B5563" />
                <Text style={styles.locationText}>
                  {doctor.clinicDoctors[0]?.clinic?.address || 'Địa chỉ không có sẵn'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Stats Tab Bar */}
        <View style={styles.statsTabBar}>
          {renderStatTab('people', '1,000+', 'patients')}
          {renderStatTab('military-tech', `${doctor.experience}+`, 'experience')}
          <View style={styles.statTab}>
            <View style={styles.statIcon}>
              {renderStars(Math.floor(doctor.averageRating || 0))}
            </View>
            <Text style={styles.statValue}>{(doctor.averageRating || 0).toFixed(1)}</Text>
            <Text style={styles.statLabel}>rating</Text>
          </View>
          {renderStatTab('chat', `${doctor.totalReviews || 0}`, 'reviews')}
        </View>

        {/* About Me */}
        <View style={styles.aboutSection}>
          <Text style={styles.sectionTitle}>Về tôi</Text>
          <Text style={styles.aboutText} numberOfLines={showFullAbout ? undefined : 3}>
            {doctor.biography || `Dr. ${doctor.user.firstName} ${doctor.user.lastName} là một bác sĩ ${doctor.specialty.name} có kinh nghiệm ${doctor.experience} năm trong lĩnh vực y tế. Bác sĩ cam kết mang đến dịch vụ chăm sóc sức khỏe tốt nhất cho bệnh nhân.`}
          </Text>
          {(doctor.biography && doctor.biography.length > 150) && (
            <TouchableOpacity style={styles.readMoreButton} onPress={handleReadMore}>
              <Text style={styles.readMoreText}>
                {showFullAbout ? 'Thu gọn' : 'Xem thêm'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Working Hours */}
        <View style={styles.workingHoursSection}>
          <Text style={styles.sectionTitle}>Giờ làm việc</Text>
          <Text style={styles.workingHoursText}>
            {doctor.clinicDoctors[0] ? (
              `${doctor.clinicDoctors[0].workingDays.join(', ')}, ${doctor.clinicDoctors[0].startTime} - ${doctor.clinicDoctors[0].endTime}`
            ) : (
              'Thông tin giờ làm việc chưa có sẵn'
            )}
          </Text>
        </View>

        {/* Reviews */}
        <View style={styles.reviewsSection}>
          <View style={styles.reviewsHeader}>
            <Text style={styles.sectionTitle}>
              Đánh giá {!isLoadingReviews && `(${reviews.length})`}
            </Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>

          {/* Reviews Loading */}
          {isLoadingReviews && (
            <View style={styles.reviewsLoading}>
              <ActivityIndicator size="small" color="#007AFF" />
              <Text style={styles.loadingText}>Đang tải đánh giá...</Text>
            </View>
          )}

          {/* Reviews List */}
          {!isLoadingReviews && reviews.length > 0 && (
            <>
              {reviews.slice(0, 3).map((reviewItem) => (
                <View key={reviewItem.id} style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    <Image
                      source={
                        reviewItem.patient.avatar
                          ? { uri: reviewItem.patient.avatar }
                          : require('../../assets/behnazsabaa_Portrait_of_Smiling_Medical_Doctor__Style_of_Her_Fi_023af117-7d28-4eff-9146-da3d323b964a.jpg')
                      }
                      style={styles.reviewerAvatar}
                    />
                    <View style={styles.reviewerInfo}>
                      <Text style={styles.reviewerName}>
                        {reviewItem.patient.firstName} {reviewItem.patient.lastName}
                      </Text>
                      <View style={styles.reviewRating}>
                        <Text style={styles.ratingText}>{reviewItem.rating}</Text>
                        <View style={styles.reviewStars}>
                          {renderStars(reviewItem.rating)}
                        </View>
                      </View>
                    </View>
                  </View>
                  <Text style={styles.reviewMessage}>{reviewItem.comment}</Text>
                </View>
              ))}
            </>
          )}

          {/* No Reviews */}
          {!isLoadingReviews && reviews.length === 0 && (
            <View style={styles.noReviewsContainer}>
              <MaterialIcons name="rate-review" size={48} color="#9CA3AF" />
              <Text style={styles.noReviewsText}>Chưa có đánh giá nào</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom Menu Bar */}
      <View style={styles.menuBar}>
        <TouchableOpacity style={styles.bookButton} onPress={handleBookAppointment}>
          <Text style={styles.bookButtonText}>Đặt lịch hẹn</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  cardSection: {
    paddingVertical: 10,
    gap: 16,
  },
  titleSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 30,
  },
  backButton: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
  },
  likeButton: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  doctorCard: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 0.5,
    borderColor: '#F3F4F6',
    borderRadius: 12,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  doctorImage: {
    width: 109,
    height: 109,
    borderRadius: 12,
  },
  doctorInfo: {
    flex: 1,
    marginLeft: 12,
    gap: 8,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2A37',
  },
  separator: {
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  doctorSpecialty: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#4B5563',
  },
  statsTabBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
  },
  statTab: {
    alignItems: 'center',
    gap: 2,
    width: 70,
  },
  statIcon: {
    width: 56,
    height: 56,
    backgroundColor: '#F3F4F6',
    borderRadius: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ratingStars: {
    flexDirection: 'row',
    gap: 2,
  },
  star: {
    width: 12,
    height: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '400',
    color: '#6B7280',
    textAlign: 'center',
  },
  aboutSection: {
    paddingVertical: 8,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2A37',
  },
  aboutText: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 21,
    color: '#6B7280',
  },
  readMoreButton: {
    marginTop: 8,
  },
  readMoreText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1C2A3A',
  },
  workingHoursSection: {
    paddingVertical: 8,
    gap: 8,
  },
  workingHoursText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#6B7280',
  },
  reviewsSection: {
    gap: 16,
  },
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  reviewCard: {
    paddingVertical: 8,
    gap: 8,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  reviewerAvatar: {
    width: 57,
    height: 57,
    borderRadius: 41,
  },
  reviewerInfo: {
    gap: 8,
  },
  reviewerName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#374151',
  },
  reviewRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  reviewStars: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewMessage: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 21,
    color: '#6B7280',
  },
  menuBar: {
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F7F7F7',
  },
  bookButton: {
    backgroundColor: '#1C2A3A',
    borderRadius: 50,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  bookButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
  },

  // Loading, Error, Empty States
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    fontFamily: 'Inter',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    gap: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    fontFamily: 'Inter',
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  backButtonError: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '500',
  },
  reviewsLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  noReviewsContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 16,
  },
  noReviewsText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    fontFamily: 'Inter',
  },
});
