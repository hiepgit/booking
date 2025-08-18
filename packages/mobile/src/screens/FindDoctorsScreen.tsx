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
  Image,
  Dimensions
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

type FindDoctorsScreenProps = {
  onBack?: () => void;
  onDoctorPress?: (doctorId: string) => void;
};

type Doctor = {
  id: string;
  name: string;
  specialty: string;
  location: string;
  rating: number;
  reviews: number;
  image: any;
};

const doctors: Doctor[] = [
  {
    id: '1',
    name: 'Dr. David Patel',
    specialty: 'Cardiologist',
    location: 'Golden Cardiology Center',
    rating: 5.0,
    reviews: 405,
    image: require('../../assets/behnazsabaa_Portrait_of_Smiling_male_Medical_Doctor__Style_of_H_22f8a7ff-a589-4d1b-880a-172332b8a241.jpg')
  },
  {
    id: '2',
    name: 'Dr. Sarah Johnson',
    specialty: 'Cardiologist',
    location: 'Golden Cardiology Center',
    rating: 5.0,
    reviews: 405,
    image: require('../../assets/behnazsabaa_Portrait_of_Smiling_Medical_Doctor__Style_of_Her_Fi_bd099184-b9f1-403f-bc9c-766786d0ee9b.jpg')
  },
  {
    id: '3',
    name: 'Dr. Michael Chen',
    specialty: 'Cardiologist',
    location: 'Golden Cardiology Center',
    rating: 4.5,
    reviews: 405,
    image: require('../../assets/behnazsabaa_Portrait_of_Smiling_Medical_Doctor_male_and_feamale_0a652aa2-f315-4b9e-a050-ab46c6c89db6.jpg')
  },
  {
    id: '4',
    name: 'Dr. Emily Rodriguez',
    specialty: 'Cardiologist',
    location: 'Golden Cardiology Center',
    rating: 5.0,
    reviews: 405,
    image: require('../../assets/behnazsabaa_Smiling_Doctors_Portrait__Style_of_Her_Film_with_it_6453a87e-ad53-4df3-a535-816164cb1b00.jpg')
  },
  {
    id: '5',
    name: 'Dr. Sara Watson',
    specialty: 'Cardiologist',
    location: 'Golden Cardiology Center',
    rating: 5.0,
    reviews: 405,
    image: require('../../assets/behnazsabaa_Smiling_Medical_Doctor__Style_of_Her_Film_with_Soft_b23f1351-dbc2-44fb-b9f1-5d970c02fce4.jpg')
  }
];

const tabs = ['List', 'Map', 'Calendar', 'Filter'];

function isFunction(fn: unknown): fn is Function {
  return typeof fn === 'function';
}

export default function FindDoctorsScreen({ onBack, onDoctorPress }: FindDoctorsScreenProps): ReactElement {
  const [activeTab, setActiveTab] = useState(0);
  const [searchText, setSearchText] = useState('');

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
      <Image source={doctor.image} style={styles.doctorImage} />
      <View style={styles.doctorInfo}>
        <View style={styles.doctorHeader}>
          <Text style={styles.doctorName}>{doctor.name}</Text>
          <MaterialIcons name="favorite-border" size={16} color="#1F2A37" />
        </View>
        <View style={styles.divider} />
        <View style={styles.doctorDetails}>
          <Text style={styles.doctorSpecialty}>{doctor.specialty}</Text>
          <View style={styles.locationContainer}>
            <MaterialIcons name="location-on" size={14} color="#4B5563" />
            <Text style={styles.locationText}>{doctor.location}</Text>
          </View>
          <View style={styles.ratingContainer}>
            <View style={styles.starsContainer}>
              {renderStars(doctor.rating)}
            </View>
            <View style={styles.ratingDivider} />
            <Text style={styles.reviewsText}>{doctor.reviews} Reviews</Text>
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
            <Text style={styles.listTitle}>Bác sĩ</Text>
            <TouchableOpacity style={styles.sortButton}>
              <Text style={styles.sortText}>Sắp xếp</Text>
              <MaterialIcons name="sort" size={14} color="#6B7280" />
            </TouchableOpacity>
          </View>
          
          {doctors.map(renderDoctorCard)}
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
});
