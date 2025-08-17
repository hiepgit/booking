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
  Image
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

type LocationScreenProps = {
  onNavigateHome?: () => void;
  onNavigateAppointment?: () => void;
  onNavigateProfile?: () => void;
};

type Doctor = {
  id: string;
  name: string;
  address: string;
  rating: number;
  reviews: number;
  distance: string;
  type: string;
  image: any;
  mapPosition: { x: number; y: number };
};

const doctors: Doctor[] = [
  {
    id: '1',
    name: 'Phòng khám Sunrise Health',
    address: '123 Đường Duy Tân, Cầu Giấy, Hà Nội',
    rating: 5.0,
    reviews: 58,
    distance: '2.5 km/40 phút',
    type: 'Bệnh viện',
    image: require('../../assets/25030.jpg'),
    mapPosition: { x: 288, y: 179 }
  },
  {
    id: '2',
    name: 'Trung tâm Tim mạch Golden',
    address: '555 Đường Lê Lợi, Quận 1, TP.HCM',
    rating: 4.9,
    reviews: 108,
    distance: '3.2 km/25 phút',
    type: 'Phòng khám',
    image: require('../../assets/interior-reanimation-room-modern-clinic.jpg'),
    mapPosition: { x: 272, y: 358 }
  },
  {
    id: '3',
    name: 'Phòng khám Đa khoa Medic',
    address: '789 Đường Nguyễn Trãi, Thanh Xuân, Hà Nội',
    rating: 4.8,
    reviews: 95,
    distance: '1.8 km/30 phút',
    type: 'Phòng khám',
    image: require('../../assets/behnazsabaa_Smiling_Medical_Doctor__Style_of_Her_Film_with_Soft_7a04bd15-0067-406d-87f7-c3f253dbefb9.jpg'),
    mapPosition: { x: 105, y: 246 }
  },
  {
    id: '4',
    name: 'Bệnh viện Quốc tế City',
    address: '456 Đường Trần Hưng Đạo, Hoàn Kiếm, Hà Nội',
    rating: 4.7,
    reviews: 127,
    distance: '4.1 km/35 phút',
    type: 'Bệnh viện',
    image: require('../../assets/behnazsabaa_Portrait_of_Smiling_Medical_Doctor__Style_of_Her_Fi_bd099184-b9f1-403f-bc9c-766786d0ee9b.jpg'),
    mapPosition: { x: 100, y: 384 }
  }
];

function isFunction(fn: unknown): fn is (() => void) {
  return typeof fn === 'function';
}

export default function LocationScreen({ 
  onNavigateHome,
  onNavigateAppointment,
  onNavigateProfile 
}: LocationScreenProps): ReactElement {
  const [activeTab, setActiveTab] = useState<'home' | 'location' | 'appointment' | 'profile'>('location');

  const handleNavigateHome = (): void => {
    if (isFunction(onNavigateHome)) {
      onNavigateHome();
    }
  };

  const handleNavigateAppointment = (): void => {
    if (isFunction(onNavigateAppointment)) {
      onNavigateAppointment();
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

  const LocationPin = ({ doctor }: { doctor: Doctor }) => (
    <TouchableOpacity 
      style={[
        styles.locationPin, 
        { left: doctor.mapPosition.x, top: doctor.mapPosition.y }
      ]}
    >
      <View style={styles.pinIcon}>
        <MaterialIcons name="location-on" size={24} color="#1C2A3A" />
      </View>
      <View style={styles.doctorAvatar}>
        <Image 
          source={doctor.image}
          style={styles.avatarImage}
          resizeMode="cover"
        />
      </View>
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

        <View style={styles.locationInfoRow}>
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
            {doctors.map(doctor => (
              <LocationPin key={doctor.id} doctor={doctor} />
            ))}
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchBarContainer}>
          <View style={styles.searchBar}>
            <MaterialIcons name="search" size={24} color="#9CA3AF" />
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm bác sĩ, bệnh viện..."
              placeholderTextColor="#9CA3AF"
            />
          </View>
        </View>

        {/* Bottom Cards */}
        <View style={styles.bottomCards}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.doctorsScroll}
          >
            {doctors.map(doctor => (
              <DoctorCard key={doctor.id} doctor={doctor} />
            ))}
          </ScrollView>
        </View>
      </View>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={handleNavigateHome}
        >
          <MaterialIcons name="home" size={24} color="#9CA3AF" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.navItem, styles.activeNavItem]}
          onPress={() => setActiveTab('location')}
        >
          <MaterialIcons name="location-on" size={24} color="#4B5563" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navItem}
          onPress={handleNavigateAppointment}
        >
          <MaterialIcons name="event" size={24} color="#9CA3AF" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navItem}
          onPress={handleNavigateProfile}
        >
          <MaterialIcons name="person-outline" size={24} color="#9CA3AF" />
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
});
