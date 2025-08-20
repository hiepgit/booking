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
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { searchClinics, getClinicsNearby, Clinic, SearchClinicsParams, NearbyClinicsParams } from '../services/clinics.service';
import * as Location from 'expo-location';

interface ClinicsSearchScreenProps {
  onNavigateBack?: () => void;
  onNavigateClinicDetails?: (clinicId: string) => void;
}

interface SearchFilters {
  city: string;
  district: string;
  name: string;
  useLocation: boolean;
  radius: number; // in km
}

export default function ClinicsSearchScreen({
  onNavigateBack,
  onNavigateClinicDetails,
}: ClinicsSearchScreenProps): ReactElement {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState<boolean>(false);
  
  // Search filters
  const [filters, setFilters] = useState<SearchFilters>({
    city: '',
    district: '',
    name: '',
    useLocation: false,
    radius: 5,
  });

  // Location state
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationPermission, setLocationPermission] = useState<boolean>(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [hasMoreData, setHasMoreData] = useState<boolean>(true);

  useEffect(() => {
    requestLocationPermission();
  }, []);

  useEffect(() => {
    handleSearch();
  }, [filters.useLocation, userLocation]);

  const requestLocationPermission = async (): Promise<void> => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status === 'granted') {
        setLocationPermission(true);
        await getCurrentLocation();
      } else {
        setLocationPermission(false);
      }
    } catch (error) {
      console.error('Location permission error:', error);
      setLocationPermission(false);
    }
  };

  const getCurrentLocation = async (): Promise<void> => {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
      
      console.log('✅ Current location obtained');
    } catch (error) {
      console.error('Get current location error:', error);
    }
  };

  const handleSearch = async (loadMore: boolean = false): Promise<void> => {
    try {
      if (!loadMore) {
        setIsLoading(true);
        setError(null);
        setCurrentPage(1);
        setClinics([]);
      }

      const page = loadMore ? currentPage + 1 : 1;

      let result;

      if (filters.useLocation && userLocation) {
        // Use nearby search
        const nearbyParams: NearbyClinicsParams = {
          lat: userLocation.latitude,
          lng: userLocation.longitude,
          radius: filters.radius,
          page,
          limit: 10,
        };
        result = await getClinicsNearby(nearbyParams);
      } else {
        // Use text search
        const searchParams: SearchClinicsParams = {
          name: filters.name.trim() || undefined,
          city: filters.city.trim() || undefined,
          district: filters.district.trim() || undefined,
          page,
          limit: 10,
        };
        result = await searchClinics(searchParams);
      }

      if (result.success && result.data) {
        const newClinics = result.data.data;
        
        if (loadMore) {
          setClinics(prev => [...prev, ...newClinics]);
        } else {
          setClinics(newClinics);
        }
        
        setCurrentPage(page);
        setHasMoreData(newClinics.length === 10); // Assume no more data if less than limit
        
        console.log('✅ Search completed:', newClinics.length, 'clinics found');
      } else {
        throw new Error(result.error?.message || 'Failed to search clinics');
      }
    } catch (error: any) {
      console.error('❌ Search error:', error);
      setError(error.message || 'Không thể tìm kiếm phòng khám');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadMore = (): void => {
    if (!isLoading && hasMoreData) {
      handleSearch(true);
    }
  };

  const handleClinicPress = (clinic: Clinic): void => {
    if (onNavigateClinicDetails) {
      onNavigateClinicDetails(clinic.id);
    } else {
      Alert.alert('Chi tiết phòng khám', clinic.name);
    }
  };

  const applyFilters = (): void => {
    setShowFilters(false);
    handleSearch();
  };

  const clearFilters = (): void => {
    setFilters({
      city: '',
      district: '',
      name: '',
      useLocation: false,
      radius: 5,
    });
    setShowFilters(false);
    handleSearch();
  };

  const renderClinicCard = (clinic: Clinic) => (
    <TouchableOpacity
      key={clinic.id}
      style={styles.clinicCard}
      onPress={() => handleClinicPress(clinic)}
    >
      <View style={styles.clinicInfo}>
        <Text style={styles.clinicName}>{clinic.name}</Text>
        
        <View style={styles.addressRow}>
          <MaterialIcons name="location-on" size={14} color="#6B7280" />
          <Text style={styles.addressText} numberOfLines={2}>{clinic.address}</Text>
        </View>

        <View style={styles.timeRow}>
          <MaterialIcons name="access-time" size={14} color="#6B7280" />
          <Text style={styles.timeText}>{clinic.openTime} - {clinic.closeTime}</Text>
        </View>

        {clinic.phone && (
          <View style={styles.phoneRow}>
            <MaterialIcons name="phone" size={14} color="#6B7280" />
            <Text style={styles.phoneText}>{clinic.phone}</Text>
          </View>
        )}

        {clinic.distance && (
          <View style={styles.distanceRow}>
            <MaterialIcons name="directions" size={14} color="#007AFF" />
            <Text style={styles.distanceText}>{clinic.distance.toFixed(1)} km</Text>
          </View>
        )}
      </View>

      <View style={styles.clinicActions}>
        <MaterialIcons name="chevron-right" size={24} color="#9CA3AF" />
      </View>
    </TouchableOpacity>
  );

  const renderFiltersModal = () => (
    <Modal
      visible={showFilters}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowFilters(false)}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => setShowFilters(false)}>
            <Text style={styles.modalCancelText}>Hủy</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Bộ lọc tìm kiếm</Text>
          <TouchableOpacity onPress={applyFilters}>
            <Text style={styles.modalApplyText}>Áp dụng</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          {/* Location Toggle */}
          <View style={styles.filterSection}>
            <Text style={styles.filterTitle}>Tìm kiếm theo vị trí</Text>
            <TouchableOpacity
              style={styles.toggleRow}
              onPress={() => setFilters(prev => ({ ...prev, useLocation: !prev.useLocation }))}
            >
              <Text style={styles.toggleText}>Sử dụng vị trí hiện tại</Text>
              <MaterialIcons
                name={filters.useLocation ? 'toggle-on' : 'toggle-off'}
                size={24}
                color={filters.useLocation ? '#007AFF' : '#9CA3AF'}
              />
            </TouchableOpacity>
            
            {filters.useLocation && (
              <View style={styles.radiusSection}>
                <Text style={styles.radiusLabel}>Bán kính: {filters.radius} km</Text>
                <View style={styles.radiusButtons}>
                  {[1, 3, 5, 10, 20].map(radius => (
                    <TouchableOpacity
                      key={radius}
                      style={[
                        styles.radiusButton,
                        filters.radius === radius && styles.activeRadiusButton
                      ]}
                      onPress={() => setFilters(prev => ({ ...prev, radius }))}
                    >
                      <Text style={[
                        styles.radiusButtonText,
                        filters.radius === radius && styles.activeRadiusButtonText
                      ]}>
                        {radius}km
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </View>

          {/* Text Search */}
          {!filters.useLocation && (
            <>
              <View style={styles.filterSection}>
                <Text style={styles.filterTitle}>Tên phòng khám</Text>
                <TextInput
                  style={styles.filterInput}
                  value={filters.name}
                  onChangeText={(text) => setFilters(prev => ({ ...prev, name: text }))}
                  placeholder="Nhập tên phòng khám..."
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View style={styles.filterSection}>
                <Text style={styles.filterTitle}>Thành phố</Text>
                <TextInput
                  style={styles.filterInput}
                  value={filters.city}
                  onChangeText={(text) => setFilters(prev => ({ ...prev, city: text }))}
                  placeholder="Nhập tên thành phố..."
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View style={styles.filterSection}>
                <Text style={styles.filterTitle}>Quận/Huyện</Text>
                <TextInput
                  style={styles.filterInput}
                  value={filters.district}
                  onChangeText={(text) => setFilters(prev => ({ ...prev, district: text }))}
                  placeholder="Nhập tên quận/huyện..."
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </>
          )}

          <TouchableOpacity style={styles.clearFiltersButton} onPress={clearFilters}>
            <Text style={styles.clearFiltersText}>Xóa tất cả bộ lọc</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onNavigateBack} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tìm kiếm phòng khám</Text>
        <TouchableOpacity onPress={() => setShowFilters(true)} style={styles.filterButton}>
          <MaterialIcons name="tune" size={24} color="#1F2937" />
        </TouchableOpacity>
      </View>

      {/* Quick Search */}
      <View style={styles.quickSearchContainer}>
        <View style={styles.searchBar}>
          <MaterialIcons name="search" size={20} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            value={filters.name}
            onChangeText={(text) => {
              setFilters(prev => ({ ...prev, name: text }));
              // Auto search after 500ms delay
              setTimeout(() => handleSearch(), 500);
            }}
            placeholder="Tìm kiếm phòng khám..."
            placeholderTextColor="#9CA3AF"
          />
        </View>
      </View>

      {/* Results */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {isLoading && clinics.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Đang tìm kiếm...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <MaterialIcons name="error-outline" size={48} color="#DC2626" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={() => handleSearch()} style={styles.retryButton}>
              <Text style={styles.retryText}>Thử lại</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Results Header */}
            <View style={styles.resultsHeader}>
              <Text style={styles.resultsText}>
                {clinics.length} phòng khám được tìm thấy
              </Text>
            </View>

            {/* Clinics List */}
            {clinics.map(renderClinicCard)}

            {/* Load More */}
            {hasMoreData && (
              <TouchableOpacity
                style={styles.loadMoreButton}
                onPress={handleLoadMore}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#007AFF" />
                ) : (
                  <Text style={styles.loadMoreText}>Tải thêm</Text>
                )}
              </TouchableOpacity>
            )}

            {/* Bottom spacing */}
            <View style={styles.bottomSpacing} />
          </>
        )}
      </ScrollView>

      {/* Filters Modal */}
      {renderFiltersModal()}
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
  filterButton: {
    padding: 5,
  },
  quickSearchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#6B7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 50,
  },
  errorText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 15,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  resultsHeader: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  resultsText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
  },

  // Clinic Card
  clinicCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 15,
    padding: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  clinicInfo: {
    flex: 1,
    marginRight: 10,
  },
  clinicName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
    gap: 6,
  },
  addressText: {
    flex: 1,
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 6,
  },
  timeText: {
    fontSize: 14,
    color: '#6B7280',
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 6,
  },
  phoneText: {
    fontSize: 14,
    color: '#6B7280',
  },
  distanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  distanceText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#007AFF',
  },
  clinicActions: {
    justifyContent: 'center',
  },
  loadMoreButton: {
    marginHorizontal: 20,
    marginVertical: 20,
    paddingVertical: 15,
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  loadMoreText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#007AFF',
  },
  bottomSpacing: {
    height: 50,
  },

  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalCancelText: {
    fontSize: 16,
    color: '#6B7280',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  modalApplyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  filterSection: {
    marginTop: 25,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 15,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  toggleText: {
    fontSize: 16,
    color: '#1F2937',
  },
  radiusSection: {
    marginTop: 15,
  },
  radiusLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 10,
  },
  radiusButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  radiusButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  activeRadiusButton: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  radiusButtonText: {
    fontSize: 14,
    color: '#6B7280',
  },
  activeRadiusButtonText: {
    color: '#FFFFFF',
  },
  filterInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1F2937',
    backgroundColor: '#FFFFFF',
  },
  clearFiltersButton: {
    marginTop: 30,
    marginBottom: 50,
    paddingVertical: 15,
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  clearFiltersText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#DC2626',
  },
});
