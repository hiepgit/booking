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
import { getDoctors, searchDoctors, Doctor } from '../services/doctors.service';
import { getSpecialties, Specialty } from '../services/specialties.service';

const { width } = Dimensions.get('window');

type FindDoctorsScreenProps = {
  onBack?: () => void;
  onDoctorPress?: (doctorId: string) => void;
};

// Using Doctor type from service

// Mock data removed - using real API data

const tabs = ['List', 'Map', 'Calendar', 'Filter'];

function isFunction(fn: unknown): fn is Function {
  return typeof fn === 'function';
}

export default function FindDoctorsScreen({ onBack, onDoctorPress }: FindDoctorsScreenProps): ReactElement {
  const [activeTab, setActiveTab] = useState(0);
  const [searchText, setSearchText] = useState('');

  // Real data states
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSpecialtyId, setSelectedSpecialtyId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [hasMoreData, setHasMoreData] = useState<boolean>(true);

  // Fetch data when component mounts
  useEffect(() => {
    fetchInitialData();
    fetchSpecialties();
  }, []);

  // Search when searchText changes (with debounce)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchText.trim()) {
        handleSearch();
      } else {
        fetchInitialData();
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchText, selectedSpecialtyId]);

  const fetchInitialData = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await getDoctors({
        page: 1,
        limit: 20,
        specialtyId: selectedSpecialtyId || undefined
      });

      if (result.success && result.data) {
        setDoctors(result.data.data);
        setCurrentPage(1);
        setHasMoreData(result.data.pagination.page < result.data.pagination.totalPages);
        console.log('✅ FindDoctorsScreen: Initial doctors loaded successfully');
      } else {
        console.log('❌ FindDoctorsScreen: Failed to load doctors:', result.error);
        setError(result.error?.message || 'Failed to load doctors');
      }
    } catch (error: any) {
      console.error('❌ FindDoctorsScreen: Unexpected error loading doctors:', error);
      setError('Unexpected error loading doctors');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSpecialties = async (): Promise<void> => {
    try {
      const result = await getSpecialties();

      if (result.success && result.data) {
        setSpecialties(result.data);
        console.log('✅ FindDoctorsScreen: Specialties loaded successfully');
      } else {
        console.log('❌ FindDoctorsScreen: Failed to load specialties:', result.error);
      }
    } catch (error: any) {
      console.error('❌ FindDoctorsScreen: Unexpected error loading specialties:', error);
    }
  };

  const handleSearch = async (): Promise<void> => {
    if (!searchText.trim()) return;

    try {
      setIsSearching(true);
      setError(null);

      const result = await searchDoctors(searchText.trim(), {
        page: 1,
        limit: 20,
        specialtyId: selectedSpecialtyId || undefined
      });

      if (result.success && result.data) {
        setDoctors(result.data.data);
        setCurrentPage(1);
        setHasMoreData(result.data.pagination.page < result.data.pagination.totalPages);
        console.log('✅ FindDoctorsScreen: Search completed:', result.data.data.length, 'results');
      } else {
        console.log('❌ FindDoctorsScreen: Search failed:', result.error);
        setError(result.error?.message || 'Search failed');
      }
    } catch (error: any) {
      console.error('❌ FindDoctorsScreen: Unexpected search error:', error);
      setError('Unexpected search error');
    } finally {
      setIsSearching(false);
    }
  };

  const handleBack = (): void => {
    if (isFunction(onBack)) {
      onBack();
    }
  };

  const handleDoctorPress = (doctorId: string): void => {
    if (isFunction(onDoctorPress)) {
      onDoctorPress(doctorId);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <MaterialIcons
        key={index}
        name={index < Math.floor(rating) ? "star" : "star-border"}
        size={12}
        color={index < Math.floor(rating) ? "#FEB052" : "#D1D5DB"}
      />
    ));
  };

  const renderDoctorCard = (doctor: Doctor) => (
    <TouchableOpacity
      key={doctor.id}
      style={styles.doctorCard}
      onPress={() => handleDoctorPress(doctor.id)}
    >
      <Image
        source={
          doctor.user.avatar
            ? { uri: doctor.user.avatar }
            : require('../../assets/behnazsabaa_Portrait_of_Smiling_Medical_Doctor__Style_of_Her_Fi_023af117-7d28-4eff-9146-da3d323b964a.jpg')
        }
        style={styles.doctorImage}
      />
      <View style={styles.doctorInfo}>
        <View style={styles.doctorHeader}>
          <Text style={styles.doctorName}>
            Dr. {doctor.user.firstName} {doctor.user.lastName}
          </Text>
          <MaterialIcons name="favorite-border" size={16} color="#1F2A37" />
        </View>
        <View style={styles.divider} />
        <View style={styles.doctorDetails}>
          <Text style={styles.doctorSpecialty}>{doctor.specialty.name}</Text>
          <View style={styles.locationContainer}>
            <MaterialIcons name="location-on" size={14} color="#4B5563" />
            <Text style={styles.locationText}>
              {doctor.clinicDoctors[0]?.clinic?.address || 'Địa chỉ không có sẵn'}
            </Text>
          </View>
          <View style={styles.ratingContainer}>
            <View style={styles.starsContainer}>
              {renderStars(doctor.averageRating || 0)}
            </View>
            <View style={styles.ratingDivider} />
            <Text style={styles.reviewsText}>
              {doctor.totalReviews || 0} Reviews
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      


      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Search & Filter Section */}
        <View style={styles.searchSection}>
          {/* Title and Back Button */}
          <View style={styles.titleSection}>
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <MaterialIcons name="arrow-back" size={24} color="#374151" />
            </TouchableOpacity>
            <Text style={styles.title}>Tìm bác sĩ</Text>
            <View style={styles.placeholder} />
          </View>

          {/* Search Bar */}
          <View style={styles.searchBar}>
            <MaterialIcons name="search" size={24} color="#9CA3AF" />
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm bác sĩ..."
              placeholderTextColor="#9CA3AF"
              value={searchText}
              onChangeText={setSearchText}
            />
          </View>

          {/* Tab Bar */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabContainer}>
            {tabs.map((tab, index) => (
              <TouchableOpacity
                key={tab}
                style={[styles.tab, activeTab === index && styles.activeTab]}
                onPress={() => setActiveTab(index)}
              >
                <Text style={[styles.tabText, activeTab === index && styles.activeTabText]}>
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Doctors List */}
        <View style={styles.doctorsList}>
          <View style={styles.listHeader}>
            <Text style={styles.listTitle}>
              Bác sĩ {!isLoading && !isSearching && `(${doctors.length})`}
            </Text>
            <TouchableOpacity style={styles.sortButton}>
              <Text style={styles.sortText}>Sắp xếp</Text>
              <MaterialIcons name="sort" size={14} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Loading State */}
          {(isLoading || isSearching) && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#007AFF" />
              <Text style={styles.loadingText}>
                {isSearching ? 'Đang tìm kiếm...' : 'Đang tải bác sĩ...'}
              </Text>
            </View>
          )}

          {/* Error State */}
          {error && !isLoading && !isSearching && (
            <View style={styles.errorContainer}>
              <MaterialIcons name="error-outline" size={48} color="#EF4444" />
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={searchText.trim() ? handleSearch : fetchInitialData}
              >
                <Text style={styles.retryText}>Thử lại</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Empty State */}
          {!isLoading && !isSearching && !error && doctors.length === 0 && (
            <View style={styles.emptyContainer}>
              <MaterialIcons name="search-off" size={48} color="#9CA3AF" />
              <Text style={styles.emptyText}>
                {searchText.trim() ? 'Không tìm thấy bác sĩ nào' : 'Chưa có bác sĩ'}
              </Text>
            </View>
          )}

          {/* Doctors List */}
          {!isLoading && !isSearching && !error && doctors.length > 0 && (
            <>
              {doctors.map(renderDoctorCard)}

              {/* Load More Button */}
              {hasMoreData && (
                <TouchableOpacity
                  style={styles.loadMoreButton}
                  onPress={() => {
                    // TODO: Implement load more functionality
                    console.log('Load more doctors');
                  }}
                >
                  <Text style={styles.loadMoreText}>Tải thêm</Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
      </ScrollView>
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
  searchSection: {
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
  placeholder: {
    width: 24,
    height: 9,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#000000',
  },
  tabContainer: {
    paddingLeft: 0,
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 45,
    borderWidth: 1,
    borderColor: '#1C2A3A',
    marginRight: 8,
  },
  activeTab: {
    backgroundColor: '#1C2A3A',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C2A3A',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  doctorsList: {
    flex: 1,
    marginTop: 10,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2A37',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sortText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  doctorCard: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 0.5,
    borderColor: '#F3F4F6',
    borderRadius: 12,
    marginBottom: 8,
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
  doctorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  doctorName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2A37',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  doctorDetails: {
    gap: 4,
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
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingDivider: {
    width: 13,
    height: 1,
    backgroundColor: '#4B5563',
  },
  reviewsText: {
    fontSize: 12,
    fontWeight: '400',
    color: '#6B7280',
  },

  // Loading, Error, Empty States
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    fontFamily: 'Inter',
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: 40,
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
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    fontFamily: 'Inter',
  },
  loadMoreButton: {
    backgroundColor: '#F3F4F6',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  loadMoreText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '500',
  },
});
