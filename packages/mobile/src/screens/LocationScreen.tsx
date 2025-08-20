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
  ActivityIndicator,
  Alert,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { getClinicsNearby, searchClinics, Clinic } from '../services/clinics.service';

type LocationScreenProps = {
  onNavigateHome?: () => void;
  onNavigateAppointment?: () => void;
  onNavigateProfile?: () => void;
  onNavigateClinicDetails?: (clinicId: string) => void;
};

interface LocationState {
  latitude: number;
  longitude: number;
}

interface ClinicWithDistance extends Clinic {
  displayDistance?: string;
  mapPosition?: { x: number; y: number };
}

export default function LocationScreen({
  onNavigateHome,
  onNavigateAppointment,
  onNavigateProfile,
  onNavigateClinicDetails,
}: LocationScreenProps): ReactElement {
  const [clinics, setClinics] = useState<ClinicWithDistance[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [userLocation, setUserLocation] = useState<LocationState | null>(null);
  const [locationPermission, setLocationPermission] = useState<boolean>(false);

  useEffect(() => {
    requestLocationPermission();
  }, []);

  useEffect(() => {
    if (userLocation) {
      fetchNearbyClinics();
    }
  }, [userLocation]);

  const requestLocationPermission = async (): Promise<void> => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status === 'granted') {
        setLocationPermission(true);
        await getCurrentLocation();
      } else {
        setLocationPermission(false);
        Alert.alert(
          'Quyền truy cập vị trí',
          'Ứng dụng cần quyền truy cập vị trí để tìm phòng khám gần bạn.',
          [
            { text: 'Hủy', style: 'cancel' },
            { text: 'Cài đặt', onPress: () => Location.requestForegroundPermissionsAsync() }
          ]
        );
        // Load all clinics without location
        await fetchAllClinics();
      }
    } catch (error) {
      console.error('Location permission error:', error);
      setLocationPermission(false);
      await fetchAllClinics();
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

      console.log('✅ Current location:', location.coords);
    } catch (error) {
      console.error('Get current location error:', error);
      Alert.alert('Lỗi', 'Không thể lấy vị trí hiện tại. Sẽ hiển thị tất cả phòng khám.');
      await fetchAllClinics();
    }
  };
  const fetchNearbyClinics = async (): Promise<void> => {
    if (!userLocation) return;

    try {
      setIsLoading(true);
      setError(null);

      const result = await getClinicsNearby({
        lat: userLocation.latitude,
        lng: userLocation.longitude,
        radius: 10, // 10km radius
        limit: 20,
      });

      if (result.success && result.data) {
        const clinicsWithDisplay = result.data.data.map((clinic, index) => ({
          ...clinic,
          displayDistance: clinic.distance ? `${clinic.distance.toFixed(1)} km` : 'N/A',
          mapPosition: generateMapPosition(index), // Generate random positions for demo
        }));

        setClinics(clinicsWithDisplay);
        console.log('✅ Nearby clinics loaded:', clinicsWithDisplay.length);
      } else {
        throw new Error(result.error?.message || 'Failed to fetch nearby clinics');
      }
    } catch (error: any) {
      console.error('❌ Fetch nearby clinics error:', error);
      setError(error.message || 'Không thể tải danh sách phòng khám gần đây');
      // Fallback to all clinics
      await fetchAllClinics();
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAllClinics = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await searchClinics({
        limit: 20,
      });

      if (result.success && result.data) {
        const clinicsWithDisplay = result.data.data.map((clinic, index) => ({
          ...clinic,
          displayDistance: 'N/A',
          mapPosition: generateMapPosition(index),
        }));

        setClinics(clinicsWithDisplay);
        console.log('✅ All clinics loaded:', clinicsWithDisplay.length);
      } else {
        throw new Error(result.error?.message || 'Failed to fetch clinics');
      }
    } catch (error: any) {
      console.error('❌ Fetch all clinics error:', error);
      setError(error.message || 'Không thể tải danh sách phòng khám');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (query: string): Promise<void> => {
    setSearchQuery(query);

    if (!query.trim()) {
      // If search is empty, reload nearby or all clinics
      if (userLocation) {
        await fetchNearbyClinics();
      } else {
        await fetchAllClinics();
      }
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const result = await searchClinics({
        name: query.trim(),
        limit: 20,
      });

      if (result.success && result.data) {
        const clinicsWithDisplay = result.data.data.map((clinic, index) => ({
          ...clinic,
          displayDistance: clinic.distance ? `${clinic.distance.toFixed(1)} km` : 'N/A',
          mapPosition: generateMapPosition(index),
        }));

        setClinics(clinicsWithDisplay);
        console.log('✅ Search results loaded:', clinicsWithDisplay.length);
      } else {
        throw new Error(result.error?.message || 'Failed to search clinics');
      }
    } catch (error: any) {
      console.error('❌ Search clinics error:', error);
      setError(error.message || 'Không thể tìm kiếm phòng khám');
    } finally {
      setIsLoading(false);
    }
  };

  const generateMapPosition = (index: number): { x: number; y: number } => {
    // Generate random positions for demo map
    const positions = [
      { x: 288, y: 179 },
      { x: 272, y: 358 },
      { x: 105, y: 246 },
      { x: 100, y: 384 },
      { x: 200, y: 200 },
      { x: 150, y: 300 },
      { x: 320, y: 250 },
      { x: 180, y: 400 },
    ];
    return positions[index % positions.length];
  };

  const handleClinicPress = (clinic: ClinicWithDistance): void => {
    if (onNavigateClinicDetails) {
      onNavigateClinicDetails(clinic.id);
    } else {
      Alert.alert('Chi tiết phòng khám', `${clinic.name}\n${clinic.address}`);
    }
  };

  const [activeTab, setActiveTab] = useState<'home' | 'location' | 'appointment' | 'profile'>('location');

  const handleNavigateHome = (): void => {
    if (onNavigateHome) {
      onNavigateHome();
    }
  };

  const handleNavigateAppointment = (): void => {
    if (onNavigateAppointment) {
      onNavigateAppointment();
    }
  };

  const handleNavigateProfile = (): void => {
    if (onNavigateProfile) {
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

  const LocationPin = ({ clinic }: { clinic: ClinicWithDistance }) => (
    <TouchableOpacity
      style={[
        styles.locationPin,
        {
          left: clinic.mapPosition?.x || 200,
          top: clinic.mapPosition?.y || 200
        }
      ]}
      onPress={() => handleClinicPress(clinic)}
    >
      <View style={styles.pinIcon}>
        <MaterialIcons name="location-on" size={24} color="#1C2A3A" />
      </View>
      <View style={styles.clinicAvatar}>
        <MaterialIcons name="local-hospital" size={20} color="#FFFFFF" />
      </View>
    </TouchableOpacity>
  );

  const ClinicCard = ({ clinic }: { clinic: ClinicWithDistance }) => (
    <TouchableOpacity
      style={styles.clinicCard}
      onPress={() => handleClinicPress(clinic)}
    >
      <View style={styles.cardImageContainer}>
        {clinic.images && clinic.images.length > 0 ? (
          <Image
            source={{ uri: clinic.images[0] }}
            style={styles.cardImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.placeholderImage}>
            <MaterialIcons name="local-hospital" size={40} color="#9CA3AF" />
          </View>
        )}
        <TouchableOpacity style={styles.favoriteButton}>
          <MaterialIcons name="favorite-border" size={15} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
      <View style={styles.cardContent}>
        <View style={styles.cardInfo}>
          <Text style={styles.clinicName}>{clinic.name}</Text>
          <View style={styles.addressRow}>
            <MaterialIcons name="location-on" size={14} color="#6B7280" />
            <Text style={styles.addressText} numberOfLines={2}>{clinic.address}</Text>
          </View>
        </View>

        <View style={styles.clinicInfoRow}>
          <View style={styles.timeContainer}>
            <MaterialIcons name="access-time" size={16} color="#9CA3AF" />
            <Text style={styles.timeText}>{clinic.openTime} - {clinic.closeTime}</Text>
          </View>
        </View>

        <View style={styles.separator} />

        <View style={styles.locationInfoRow}>
          <View style={styles.distanceContainer}>
            <MaterialIcons name="directions" size={16} color="#9CA3AF" />
            <Text style={styles.distanceText}>{clinic.displayDistance || 'N/A'}</Text>
          </View>
          <View style={styles.typeContainer}>
            <MaterialIcons name="local-hospital" size={16} color="#9CA3AF" />
            <Text style={styles.typeText}>Phòng khám</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );


  const renderBottomNavigation = () => (
    <View style={styles.bottomNavigation}>
      <TouchableOpacity style={styles.navItem} onPress={onNavigateHome}>
        <MaterialIcons name="home" size={24} color="#9CA3AF" />
      </TouchableOpacity>
      
      <TouchableOpacity style={[styles.navItem, styles.activeNavItem]}>
        <View style={styles.locationIconContainer}>
          <MaterialIcons name="location-on" size={24} color="#4B5563" />
        </View>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.navItem} onPress={onNavigateAppointment}>
        <MaterialIcons name="event" size={24} color="#9CA3AF" />
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.navItem} onPress={onNavigateProfile}>
        <MaterialIcons name="person" size={24} color="#9CA3AF" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      <View style={styles.content}>
        {/* Map Background */}
        <View style={styles.mapContainer}>
          <View style={styles.mapBackground}>
            {/* Simulated Map Grid */}
            <View style={styles.mapGrid}>
              {Array.from({ length: 20 }, (_, i) => (
                <View key={`h-${i}`} style={[styles.gridLineHorizontal, { top: i * 40 }]} />
              ))}
              {Array.from({ length: 15 }, (_, i) => (
                <View key={`v-${i}`} style={[styles.gridLineVertical, { left: i * 26 }]} />
              ))}
            </View>
            
            {/* Streets Simulation */}
            <View style={styles.streetsContainer}>
              <View style={[styles.street, { top: 200, left: 50, width: 290 }]} />
              <View style={[styles.street, { top: 350, left: 30, width: 330 }]} />
              <View style={[styles.streetVertical, { left: 150, top: 100, height: 400 }]} />
              <View style={[styles.streetVertical, { left: 280, top: 150, height: 300 }]} />
            </View>
            
            <View style={styles.mapOverlay} />
            
            {/* Location Pins */}
            {clinics.map(clinic => (
              <LocationPin key={clinic.id} clinic={clinic} />
            ))}
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchBarContainer}>
          <View style={styles.searchBar}>
            <MaterialIcons name="search" size={24} color="#9CA3AF" />
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm phòng khám, bệnh viện..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={handleSearch}
            />
          </View>
        </View>

        {/* Loading/Error States */}
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Đang tải...</Text>
          </View>
        )}

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity
              onPress={userLocation ? fetchNearbyClinics : fetchAllClinics}
              style={styles.retryButton}
            >
              <Text style={styles.retryText}>Thử lại</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Bottom Cards */}
        {!isLoading && !error && (
          <View style={styles.bottomCards}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.clinicsScroll}
            >
              {clinics.map(clinic => (
                <ClinicCard key={clinic.id} clinic={clinic} />
              ))}
            </ScrollView>
          </View>
        )}
      </View>

      {/* Bottom Navigation */}
      {renderBottomNavigation()}
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
    position: 'relative',
  },
  
  // Map Section
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  mapBackground: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#E8F5E8',
    position: 'relative',
  },
  mapGrid: {
    ...StyleSheet.absoluteFillObject,
  },
  gridLineHorizontal: {
    position: 'absolute',
    width: '100%',
    height: 1,
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
  },
  gridLineVertical: {
    position: 'absolute',
    height: '100%',
    width: 1,
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
  },
  streetsContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  street: {
    position: 'absolute',
    height: 8,
    backgroundColor: 'rgba(107, 114, 128, 0.3)',
    borderRadius: 4,
  },
  streetVertical: {
    position: 'absolute',
    width: 8,
    backgroundColor: 'rgba(107, 114, 128, 0.3)',
    borderRadius: 4,
  },
  mapOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },

  // Location Pins
  locationPin: {
    position: 'absolute',
    alignItems: 'center',
    zIndex: 10,
  },
  pinIcon: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 4,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  doctorAvatar: {
    width: 32.56,
    height: 32.56,
    borderRadius: 91,
    borderWidth: 1,
    borderColor: '#FFFFFF',
    overflow: 'hidden',
    marginTop: -8,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },

  // Search Bar
  searchBarContainer: {
    position: 'absolute',
    top: 75,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    zIndex: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 12,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 4,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'Inter',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 21,
    color: '#000000',
  },

  // Bottom Cards
  bottomCards: {
    position: 'absolute',
    bottom: 76, // Above bottom navigation
    left: 24,
    right: 0,
    zIndex: 20,
  },
  // Note: doctorsScroll and doctorCard are kept for backward compatibility
  // but clinicsScroll and clinicCard are the new preferred styles
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
  locationInfoRow: {
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

  // Loading and Error States
  loadingContainer: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingVertical: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#6B7280',
  },
  errorContainer: {
    position: 'absolute',
    top: '50%',
    left: 20,
    right: 20,
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    padding: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 10,
  },
  retryButton: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },

  // Clinic-specific styles
  clinicCard: {
    width: 280,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  clinicName: {
    fontFamily: 'Inter',
    fontWeight: '600',
    fontSize: 16,
    lineHeight: 24,
    color: '#1F2937',
    marginBottom: 4,
  },
  clinicAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderImage: {
    width: '100%',
    height: 120,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  clinicInfoRow: {
    marginBottom: 8,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontFamily: 'Inter',
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 18,
    color: '#6B7280',
  },
  clinicsScroll: {
    paddingLeft: 24,
  },

  // Bottom Navigation
  bottomNavigation: {
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
  locationIconContainer: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 38,
    backgroundColor: '#F3F4F6',
  },
});
