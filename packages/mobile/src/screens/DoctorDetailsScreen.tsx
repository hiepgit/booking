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
  Image,
  Dimensions
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

type DoctorDetailsScreenProps = {
  onBack?: () => void;
  onBookAppointment?: () => void;
  doctorId?: string;
};

type DoctorStats = {
  patients: string;
  experience: string;
  rating: string;
  reviews: string;
};

type Review = {
  id: string;
  name: string;
  rating: number;
  message: string;
  avatar: any;
};

const doctorStats: DoctorStats = {
  patients: '2,000+',
  experience: '10+',
  rating: '5.0',
  reviews: '1,872'
};

const review: Review = {
  id: '1',
  name: 'Emily Anderson',
  rating: 5.0,
  message: 'Dr. David Patel is an exceptional cardiologist. His expertise and caring approach made me feel confident throughout my treatment. Highly recommended!',
  avatar: require('../../assets/behnazsabaa_Smiling_Medical_Doctor__Style_of_Her_Film_with_Soft_7a04bd15-0067-406d-87f7-c3f253dbefb9.jpg')
};

function isFunction(fn: unknown): fn is Function {
  return typeof fn === 'function';
}

export default function DoctorDetailsScreen({ onBack, onBookAppointment, doctorId }: DoctorDetailsScreenProps): ReactElement {
  const [isLiked, setIsLiked] = useState(false);
  const [showFullAbout, setShowFullAbout] = useState(false);

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
              source={require('../../assets/behnazsabaa_Portrait_of_Smiling_male_Medical_Doctor__Style_of_H_22f8a7ff-a589-4d1b-880a-172332b8a241.jpg')}
              style={styles.doctorImage}
            />
            <View style={styles.doctorInfo}>
              <Text style={styles.doctorName}>Dr. David Patel</Text>
              <View style={styles.separator} />
              <Text style={styles.doctorSpecialty}>Cardiologist</Text>
              <View style={styles.locationContainer}>
                <MaterialIcons name="location-on" size={14} color="#4B5563" />
                <Text style={styles.locationText}>Golden Cardiology Center</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Stats Tab Bar */}
        <View style={styles.statsTabBar}>
          {renderStatTab('people', doctorStats.patients, 'patients')}
          {renderStatTab('military-tech', doctorStats.experience, 'experience')}
          <View style={styles.statTab}>
            <View style={styles.statIcon}>
              {renderStars(5)}
            </View>
            <Text style={styles.statValue}>{doctorStats.rating}</Text>
            <Text style={styles.statLabel}>rating</Text>
          </View>
          {renderStatTab('chat', doctorStats.reviews, 'reviews')}
        </View>

        {/* About Me */}
        <View style={styles.aboutSection}>
          <Text style={styles.sectionTitle}>Về tôi</Text>
          <Text style={styles.aboutText} numberOfLines={showFullAbout ? undefined : 3}>
            Dr. David Patel, một bác sĩ tim mạch tận tâm, mang đến sự giàu có về kinh nghiệm cho Trung tâm Tim mạch Golden Gate tại Golden Gate, CA. Với hơn 10 năm kinh nghiệm trong lĩnh vực tim mạch, bác sĩ Patel đã điều trị thành công hàng nghìn bệnh nhân với các vấn đề tim mạch phức tạp. Ông chuyên về các bệnh tim mạch như bệnh mạch vành, suy tim, rối loạn nhịp tim và các vấn đề tim mạch khác.
          </Text>
          <TouchableOpacity style={styles.readMoreButton} onPress={handleReadMore}>
            <Text style={styles.readMoreText}>
              {showFullAbout ? 'Thu gọn' : 'Xem thêm'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Working Hours */}
        <View style={styles.workingHoursSection}>
          <Text style={styles.sectionTitle}>Giờ làm việc</Text>
          <Text style={styles.workingHoursText}>
            Thứ 2 - Thứ 6, 08:00 AM - 18:00 PM
          </Text>
        </View>

        {/* Reviews */}
        <View style={styles.reviewsSection}>
          <View style={styles.reviewsHeader}>
            <Text style={styles.sectionTitle}>Đánh giá</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.reviewCard}>
            <View style={styles.reviewHeader}>
              <Image source={review.avatar} style={styles.reviewerAvatar} />
              <View style={styles.reviewerInfo}>
                <Text style={styles.reviewerName}>{review.name}</Text>
                <View style={styles.reviewRating}>
                  <Text style={styles.ratingText}>{review.rating}</Text>
                  <View style={styles.reviewStars}>
                    {renderStars(review.rating)}
                  </View>
                </View>
              </View>
            </View>
            <Text style={styles.reviewMessage}>{review.message}</Text>
          </View>
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
});
