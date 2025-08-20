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
  Image,
  Dimensions,
  ActivityIndicator,
  Alert
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useUnreadCount } from '../contexts/NotificationContext';
import { getDoctors, Doctor } from '../services/doctors.service';
import { getSpecialties, Specialty } from '../services/specialties.service';

const { width } = Dimensions.get('window');

type HomeScreenProps = {
  onLogout?: () => void;
  onNavigateLocation?: () => void;
  onNavigateFindDoctors?: () => void;
  onNavigateAppointments?: () => void;
  onNavigateProfile?: () => void;
  onNavigateNotifications?: () => void;
  onNavigateTest?: () => void;
};

type Category = {
  id: string;
  name: string;
  icon: string;
  color: string;
};

type Doctor = {
  id: string;
  name: string;
  address: string;
  rating: number;
  reviews: number;
  distance: string;
  type: string;
  image: any; // For require() images
};

const categories: Category[] = [
  { id: '1', name: 'Nha khoa', icon: 'healing', color: '#DC9497' },
  { id: '2', name: 'Tim mạch', icon: 'favorite', color: '#93C19E' },
  { id: '3', name: 'Phổi', icon: 'air', color: '#F5AD7E' },
  { id: '4', name: 'Tổng quát', icon: 'medical-services', color: '#ACA1CD' },
  { id: '5', name: 'Thần kinh', icon: 'psychology', color: '#4D9B91' },
  { id: '6', name: 'Tiêu hóa', icon: 'restaurant', color: '#352261' },
  { id: '7', name: 'Xét nghiệm', icon: 'biotech', color: '#DEB6B5' },
  { id: '8', name: 'Tiêm chủng', icon: 'vaccines', color: '#89CCDB' },
];

const doctors: Doctor[] = [
  {
    id: '1',
    name: 'Phòng khám Sunrise Health',
    address: '120 Yên Lãng, Cầu Giấy, Hà Nội',
    rating: 5.0,
    reviews: 58,
    distance: '2.5 km/40 phút',
    type: 'Bệnh viện',
    image: require('../../assets/25030.jpg')
  },
  {
    id: '2',
    name: 'Trung tâm Tim mạch Golden',
    address: '555 Đường Lê Lợi, Quận 1, TP.HCM',
    rating: 4.9,
    reviews: 108,
    distance: '3.2 km/25 phút',
    type: 'Phòng khám',
    image: require('../../assets/interior-reanimation-room-modern-clinic.jpg')
  }
];

function isFunction(fn: unknown): fn is (() => void) {
  return typeof fn === 'function';
}

export default function HomeScreen({
  onLogout,
  onNavigateLocation,
  onNavigateFindDoctors,
  onNavigateAppointments,
  onNavigateProfile,
  onNavigateNotifications
}: HomeScreenProps): ReactElement {
  // Get unread count from notification context
  const { unreadCount } = useUnreadCount();
  const [activeTab, setActiveTab] = useState<'home' | 'location' | 'appointment' | 'profile'>('home');

  // Real data states
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [isLoadingDoctors, setIsLoadingDoctors] = useState<boolean>(true);
  const [isLoadingSpecialties, setIsLoadingSpecialties] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data when component mounts
  useEffect(() => {
    fetchDoctors();
    fetchSpecialties();
  }, []);

  const fetchDoctors = async (): Promise<void> => {
    try {
      setIsLoadingDoctors(true);
      setError(null);

      const result = await getDoctors({ limit: 10 });

      if (result.success && result.data) {
        setDoctors(result.data.data);
        console.log('✅ HomeScreen: Doctors loaded successfully');
      } else {
        console.log('❌ HomeScreen: Failed to load doctors:', result.error);
        setError(result.error?.message || 'Failed to load doctors');
      }
    } catch (error: any) {
      console.error('❌ HomeScreen: Unexpected error loading doctors:', error);
      setError('Unexpected error loading doctors');
    } finally {
      setIsLoadingDoctors(false);
    }
  };

  const fetchSpecialties = async (): Promise<void> => {
    try {
      setIsLoadingSpecialties(true);
      setError(null);

      const result = await getSpecialties();

      if (result.success && result.data) {
        setSpecialties(result.data);
        console.log('✅ HomeScreen: Specialties loaded successfully');
      } else {
        console.log('❌ HomeScreen: Failed to load specialties:', result.error);
        setError(result.error?.message || 'Failed to load specialties');
      }
    } catch (error: any) {
      console.error('❌ HomeScreen: Unexpected error loading specialties:', error);
      setError('Unexpected error loading specialties');
    } finally {
      setIsLoadingSpecialties(false);
    }
  };

  const handleLogout = (): void => {
    if (isFunction(onLogout)) {
      onLogout();
    }
  };

  const handleNavigateLocation = (): void => {
    if (isFunction(onNavigateLocation)) {
      onNavigateLocation();
    }
  };

  const handleNavigateFindDoctors = (): void => {
    if (isFunction(onNavigateFindDoctors)) {
      onNavigateFindDoctors();
    }
  };

  const handleNavigateAppointments = (): void => {
    if (isFunction(onNavigateAppointments)) {
      onNavigateAppointments();
    }
  };

  const handleNavigateProfile = (): void => {
    if (isFunction(onNavigateProfile)) {
      onNavigateProfile();
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <MaterialIcons
        key={index}
        name="star"
        size={10}
        color={index < Math.floor(rating) ? "#FEB052" : "#E5E7EB"}
      />
    ));
  };

  const CategoryItem = ({ category }: { category: Category }) => (
    <TouchableOpacity style={styles.categoryItem}>
      <View style={[styles.categoryIcon, { backgroundColor: category.color }]}>
        <MaterialIcons name={category.icon as any} size={24} color="#FFFFFF" />
        <View style={styles.categoryIconBg} />
      </View>
      <Text style={styles.categoryText}>{category.name}</Text>
    </TouchableOpacity>
  );

  const DoctorCard = ({ doctor }: { doctor: Doctor }) => (
    <View style={styles.doctorCard}>
      <View style={styles.cardImageContainer}>
        <Image 
          source={doctor.image}
          style={styles.cardImage}
          resizeMode="cover"
        />
        <TouchableOpacity style={styles.favoriteButton}>
          <MaterialIcons name="favorite-border" size={15} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
      <View style={styles.cardContent}>
        <View style={styles.cardInfo}>
          <Text style={styles.doctorName}>{doctor.name}</Text>
          <View style={styles.addressRow}>
            <MaterialIcons name="location-on" size={14} color="#6B7280" />
            <Text style={styles.addressText}>{doctor.address}</Text>
          </View>
        </View>
        
        <View style={styles.ratingRow}>
          <View style={styles.ratingContainer}>
            <Text style={styles.ratingText}>{doctor.rating}</Text>
            <View style={styles.starsContainer}>
              {renderStars(doctor.rating)}
            </View>
          </View>
          <Text style={styles.reviewsText}>({doctor.reviews} đánh giá)</Text>
        </View>

        <View style={styles.separator} />

        <View style={styles.doctorLocationRow}>
          <View style={styles.distanceContainer}>
            <MaterialIcons name="directions" size={16} color="#9CA3AF" />
            <Text style={styles.distanceText}>{doctor.distance}</Text>
          </View>
          <View style={styles.typeContainer}>
            <MaterialIcons name="local-hospital" size={16} color="#9CA3AF" />
            <Text style={styles.typeText}>{doctor.type}</Text>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Top Section */}
        <View style={styles.topSection}>
          {/* Location & Notification */}
          <View style={styles.headerRow}>
            <View style={styles.locationContainer}>
              <View style={styles.locationRow}>
                <MaterialIcons name="location-on" size={18} color="#1C2A3A" />
                <View style={styles.locationTextContainer}>
                  <Text style={styles.locationText}>Hà Nội, Việt Nam</Text>
                  <MaterialIcons name="keyboard-arrow-down" size={14} color="#374151" />
                </View>
              </View>
            </View>
            
            <TouchableOpacity
              style={styles.notificationButton}
              onPress={onNavigateNotifications}
            >
              <MaterialIcons name="notifications" size={24} color="#4B5563" />
              {unreadCount > 0 && (
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationBadgeText}>
                    {unreadCount > 99 ? '99+' : unreadCount.toString()}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <TouchableOpacity style={styles.searchBar} onPress={handleNavigateFindDoctors}>
            <MaterialIcons name="search" size={24} color="#9CA3AF" />
            <Text style={styles.searchPlaceholder}>Tìm bác sĩ...</Text>
          </TouchableOpacity>

          {/* Banner */}
          <TouchableOpacity style={styles.bannerContainer} onPress={handleNavigateFindDoctors}>
            <View style={styles.banner}>
              <Image 
                source={require('../../assets/behnazsabaa_Smiling_Medical_Doctor__Style_of_Her_Film_with_Soft_7a04bd15-0067-406d-87f7-c3f253dbefb9.jpg')}
                style={styles.bannerImage}
                resizeMode="cover"
              />
              <View style={styles.bannerOverlay} />
              <View style={styles.bannerContent}>
                <Text style={styles.bannerTitle}>{"Tìm bác sĩ tốt nhất\ngần bạn"}</Text>
                <Text style={styles.bannerDescription}>
                  {"Đặt lịch hẹn với các\nchuyên gia y tế\nhàng đầu"}
                </Text>
              </View>
              <View style={styles.bannerBg1} />
              <View style={styles.bannerBg2} />
            </View>
            <View style={styles.carousel}>
              <View style={styles.carouselActive} />
              <View style={styles.carouselInactive} />
              <View style={styles.carouselInactive} />
              <View style={styles.carouselInactive} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Middle Section - Categories */}
        <View style={styles.middleSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Chuyên khoa</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.categoriesContainer}>
            {isLoadingSpecialties ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#007AFF" />
                <Text style={styles.loadingText}>Đang tải chuyên khoa...</Text>
              </View>
            ) : (
              <>
                <View style={styles.categoriesRow}>
                  {specialties.slice(0, 4).map(specialty => (
                    <CategoryItem key={specialty.id} category={{
                      id: specialty.id,
                      name: specialty.name,
                      icon: specialty.icon,
                      color: '#007AFF' // Default color for now
                    }} />
                  ))}
                </View>
                {specialties.length > 4 && (
                  <View style={styles.categoriesRow}>
                    {specialties.slice(4, 8).map(specialty => (
                      <CategoryItem key={specialty.id} category={{
                        id: specialty.id,
                        name: specialty.name,
                        icon: specialty.icon,
                        color: '#007AFF' // Default color for now
                      }} />
                    ))}
                  </View>
                )}
              </>
            )}
          </View>
        </View>

        {/* Bottom Section - Recommended Doctors */}
        <View style={styles.bottomSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Phòng khám gần bạn</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>

          {isLoadingDoctors ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#007AFF" />
              <Text style={styles.loadingText}>Đang tải bác sĩ...</Text>
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.doctorsScroll}
            >
              {doctors.map(doctor => (
                <DoctorCard key={doctor.id} doctor={{
                  id: doctor.id,
                  name: `${doctor.user.firstName} ${doctor.user.lastName}`,
                  image: doctor.user.avatar ? { uri: doctor.user.avatar } : require('../../assets/behnazsabaa_Portrait_of_Smiling_Medical_Doctor__Style_of_Her_Fi_023af117-7d28-4eff-9146-da3d323b964a.jpg'),
                  address: doctor.clinicDoctors[0]?.clinic?.address || 'Địa chỉ không có sẵn',
                  rating: doctor.averageRating || 0,
                  reviews: doctor.totalReviews || 0,
                  distance: '1.2 km', // TODO: Calculate real distance
                  type: doctor.specialty.name
                }} />
              ))}
            </ScrollView>
          )}
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity 
          style={[styles.navItem, activeTab === 'home' && styles.activeNavItem]}
          onPress={() => setActiveTab('home')}
        >
          <MaterialIcons 
            name="home" 
            size={24} 
            color={activeTab === 'home' ? "#4B5563" : "#9CA3AF"} 
          />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navItem}
          onPress={handleNavigateLocation}
        >
          <MaterialIcons name="location-on" size={24} color="#9CA3AF" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.navItem, activeTab === 'appointment' && styles.activeNavItem]}
          onPress={handleNavigateAppointments}
        >
          <MaterialIcons 
            name="event" 
            size={24} 
            color={activeTab === 'appointment' ? "#4B5563" : "#9CA3AF"} 
          />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.navItem, activeTab === 'profile' && styles.activeNavItem]}
          onPress={handleNavigateProfile}
        >
          <MaterialIcons 
            name="person-outline" 
            size={24} 
            color={activeTab === 'profile' ? "#4B5563" : "#9CA3AF"} 
          />
        </TouchableOpacity>
      </View>

      {/* Development logout button */}
      <TouchableOpacity
        style={styles.devLogoutButton}
        onPress={handleLogout}
      >
        <Text style={styles.devLogoutText}>Logout (Dev)</Text>
      </TouchableOpacity>
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
    backgroundColor: '#FFFFFF',
  },
  
  // Top Section
  topSection: {
    paddingHorizontal: 24,
    paddingTop: 16,
    gap: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 46,
  },
  locationContainer: {
    gap: 4,
  },
  locationLabel: {
    fontFamily: 'Inter',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 21,
    color: '#6B7280',
    textAlign: 'center',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  locationTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  locationText: {
    fontFamily: 'Inter',
    fontWeight: '600',
    fontSize: 14,
    lineHeight: 21,
    color: '#374151',
  },
  notificationButton: {
    width: 34,
    height: 34,
    backgroundColor: '#F3F4F6',
    borderRadius: 72,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  notificationBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },

  // Search Bar
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'Inter',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 21,
    color: '#000000',
  },
  searchPlaceholder: {
    flex: 1,
    fontFamily: 'Inter',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 21,
    color: '#9CA3AF',
  },

  // Banner
  bannerContainer: {
    gap: 8,
  },
  banner: {
    height: 163,
    backgroundColor: '#1C2A3A',
    borderRadius: 12,
    position: 'relative',
    overflow: 'hidden',
  },
  bannerImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  bannerOverlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(28, 42, 58, 0.4)',
    borderRadius: 12,
    zIndex: 1,
  },
  bannerContent: {
    position: 'absolute',
    left: 11,
    top: 31,
    zIndex: 4,
  },
  bannerTitle: {
    fontFamily: 'Inter',
    fontWeight: '700',
    fontSize: 18,
    lineHeight: 27,
    color: '#FFFFFF',
    width: 172,
  },
  bannerDescription: {
    fontFamily: 'Inter',
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 18,
    color: '#FFFFFF',
    width: 177,
    marginTop: 8,
  },
  bannerBg1: {
    position: 'absolute',
    width: 154,
    height: 154,
    left: -40,
    top: -55,
    backgroundColor: 'rgba(217, 217, 217, 0.2)',
    borderRadius: 77,
  },
  bannerBg2: {
    position: 'absolute',
    width: 83,
    height: 83,
    left: 68,
    bottom: -20,
    backgroundColor: 'rgba(217, 217, 217, 0.2)',
    borderRadius: 41.5,
  },
  carousel: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  carouselActive: {
    width: 30,
    height: 6,
    backgroundColor: '#FFFFFF',
    borderRadius: 40,
  },
  carouselInactive: {
    width: 6,
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 40,
    opacity: 0.8,
  },

  // Middle Section - Categories
  middleSection: {
    paddingHorizontal: 24,
    paddingTop: 16,
    gap: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontFamily: 'Inter',
    fontWeight: '700',
    fontSize: 16,
    lineHeight: 24,
    color: '#1C2A3A',
  },
  seeAllText: {
    fontFamily: 'Inter',
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 21,
    color: '#6B7280',
  },
  categoriesContainer: {
    gap: 16,
  },
  categoriesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 32,
  },
  categoryItem: {
    alignItems: 'center',
    gap: 4,
    width: 62,
  },
  categoryIcon: {
    width: 62,
    height: 62,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  categoryIconBg: {
    position: 'absolute',
    width: 68,
    height: 68,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 34,
    top: -34,
    left: -3,
  },
  categoryText: {
    fontFamily: 'Inter',
    fontWeight: '700',
    fontSize: 12,
    lineHeight: 18,
    color: '#4B5563',
    textAlign: 'center',
  },

  // Bottom Section - Doctors
  bottomSection: {
    paddingLeft: 24,
    paddingTop: 16,
    gap: 10,
  },
  doctorsScroll: {
    paddingRight: 24,
  },
  doctorCard: {
    width: 232,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginRight: 16,
    shadowColor: '#000000',
    shadowOffset: {
      width: 3,
      height: 3,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 3,
  },
  cardImageContainer: {
    position: 'relative',
  },
  cardImage: {
    width: 232,
    height: 121,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  favoriteButton: {
    position: 'absolute',
    right: 8,
    top: 8,
    width: 27,
    height: 25,
    backgroundColor: 'rgba(31, 42, 55, 0.2)',
    borderRadius: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContent: {
    padding: 12,
    paddingBottom: 12,
    gap: 12,
  },
  cardInfo: {
    gap: 4,
  },
  doctorName: {
    fontFamily: 'Inter',
    fontWeight: '700',
    fontSize: 14,
    lineHeight: 21,
    color: '#4B5563',
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addressText: {
    fontFamily: 'Inter',
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 18,
    color: '#6B7280',
    flex: 1,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontFamily: 'Inter',
    fontWeight: '600',
    fontSize: 12,
    lineHeight: 18,
    color: '#6B7280',
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewsText: {
    fontFamily: 'Inter',
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 18,
    color: '#6B7280',
  },
  separator: {
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  doctorLocationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  distanceText: {
    fontFamily: 'Inter',
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 18,
    color: '#6B7280',
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  typeText: {
    fontFamily: 'Inter',
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 18,
    color: '#4B5563',
  },

  // Bottom Navigation
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 48,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F7F7F7',
    height: 76,
  },
  navItem: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 38,
  },
  activeNavItem: {
    backgroundColor: '#F3F4F6',
  },

  // Development
  devLogoutButton: {
    position: 'absolute',
    top: 100,
    right: 20,
    backgroundColor: '#EF4444',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    zIndex: 1000,
  },
  devLogoutText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },

  // Loading states
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  loadingText: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Inter',
  },
});
