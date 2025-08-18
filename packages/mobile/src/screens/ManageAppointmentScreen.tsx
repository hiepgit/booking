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
  Dimensions,
  Image,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

type ManageAppointmentScreenProps = {
  onBack?: () => void;
  onNavigateHome?: () => void;
  onNavigateLocation?: () => void;
  onNavigateProfile?: () => void;
};

type AppointmentStatus = 'upcoming' | 'completed' | 'canceled';

type Appointment = {
  id: string;
  date: string;
  time: string;
  doctorName: string;
  specialty: string;
  location: string;
  doctorImage: string;
  status: AppointmentStatus;
};

const mockAppointments: Appointment[] = [
  {
    id: '1',
    date: 'May 14, 2023 - 10.00 AM',
    time: '10:00 AM',
    doctorName: 'Dr. David Patel',
    specialty: 'Cardiologist',
    location: 'Cardiology Center, USA',
    doctorImage: 'https://example.com/doctor1.jpg',
    status: 'upcoming',
  },
  {
    id: '2',
    date: 'May 15, 2023 - 2.30 PM',
    time: '2:30 PM',
    doctorName: 'Dr. Sarah Johnson',
    specialty: 'Dermatologist',
    location: 'Dermatology Clinic, USA',
    doctorImage: 'https://example.com/doctor2.jpg',
    status: 'upcoming',
  },
  {
    id: '3',
    date: 'May 10, 2023 - 9.00 AM',
    time: '9:00 AM',
    doctorName: 'Dr. Michael Chen',
    specialty: 'Neurologist',
    location: 'Neurology Institute, USA',
    doctorImage: 'https://example.com/doctor3.jpg',
    status: 'completed',
  },
];

export default function ManageAppointmentScreen({
  onBack,
  onNavigateHome,
  onNavigateLocation,
  onNavigateProfile,
}: ManageAppointmentScreenProps): ReactElement {
  const [activeTab, setActiveTab] = useState<AppointmentStatus>('upcoming');

  const filteredAppointments = mockAppointments.filter(
    appointment => appointment.status === activeTab
  );

  const renderTab = (status: AppointmentStatus, label: string) => (
    <TouchableOpacity
      style={[
        styles.tab,
        activeTab === status && styles.activeTab
      ]}
      onPress={() => setActiveTab(status)}
    >
      <Text style={[
        styles.tabText,
        activeTab === status && styles.activeTabText
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderAppointmentCard = (appointment: Appointment) => (
    <View key={appointment.id} style={styles.appointmentCard}>
      {/* Date Header */}
      <Text style={styles.dateHeader}>{appointment.date}</Text>
      
      {/* Separator */}
      <View style={styles.separator} />
      
      {/* Doctor Info */}
      <View style={styles.doctorInfo}>
        <View style={styles.doctorImageContainer}>
          <View style={styles.doctorImagePlaceholder}>
            <MaterialIcons name="person" size={40} color="#9CA3AF" />
          </View>
        </View>
        
        <View style={styles.doctorDetails}>
          <Text style={styles.doctorName}>{appointment.doctorName}</Text>
          <Text style={styles.specialty}>{appointment.specialty}</Text>
          
          <View style={styles.locationContainer}>
            <MaterialIcons name="location-on" size={14} color="#4B5563" />
            <Text style={styles.location}>{appointment.location}</Text>
          </View>
        </View>
      </View>
      
      {/* Separator */}
      <View style={styles.separator} />
      
      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        {appointment.status === 'upcoming' ? (
          <>
            <TouchableOpacity style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>Reschedule</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Cancel</Text>
            </TouchableOpacity>
          </>
        ) : appointment.status === 'completed' ? (
          <TouchableOpacity style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Book Again</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Book Again</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderBottomNavigation = () => (
    <View style={styles.bottomNavigation}>
      <TouchableOpacity style={styles.navItem} onPress={onNavigateHome}>
        <MaterialIcons name="home" size={24} color="#9CA3AF" />
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.navItem} onPress={onNavigateLocation}>
        <MaterialIcons name="location-on" size={24} color="#9CA3AF" />
      </TouchableOpacity>
      
      <TouchableOpacity style={[styles.navItem, styles.activeNavItem]}>
        <View style={styles.calendarIconContainer}>
          <MaterialIcons name="event" size={24} color="#4B5563" />
        </View>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.navItem} onPress={onNavigateProfile}>
        <MaterialIcons name="person" size={24} color="#9CA3AF" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Content */}
      <View style={styles.content}>
        {/* Title */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>My Bookings</Text>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          {renderTab('upcoming', 'Upcoming')}
          {renderTab('completed', 'Completed')}
          {renderTab('canceled', 'Canceled')}
        </View>

        {/* Separator */}
        <View style={styles.tabSeparator} />

        {/* Appointments List */}
        <ScrollView style={styles.appointmentsList} showsVerticalScrollIndicator={false}>
          {filteredAppointments.length > 0 ? (
            filteredAppointments.map(renderAppointmentCard)
          ) : (
            <View style={styles.emptyState}>
              <MaterialIcons name="event-busy" size={64} color="#9CA3AF" />
              <Text style={styles.emptyStateTitle}>No {activeTab} appointments</Text>
              <Text style={styles.emptyStateSubtitle}>
                {activeTab === 'upcoming' 
                  ? 'You don\'t have any upcoming appointments'
                  : activeTab === 'completed'
                  ? 'You don\'t have any completed appointments'
                  : 'You don\'t have any canceled appointments'
                }
              </Text>
            </View>
          )}
        </ScrollView>
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
  },
  titleSection: {
    paddingHorizontal: 24,
    paddingVertical: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
    fontFamily: 'Inter',
  },
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 40,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: '#1C2A3A',
    borderRadius: 50,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9CA3AF',
    fontFamily: 'Inter',
  },
  activeTabText: {
    color: '#1C2A3A',
  },
  tabSeparator: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginTop: 8,
  },
  appointmentsList: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  appointmentCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 0.5,
    borderColor: '#F3F4F6',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 5,
  },
  dateHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2A37',
    fontFamily: 'Inter',
  },
  separator: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 12,
  },
  doctorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  doctorImageContainer: {
    width: 109,
    height: 109,
  },
  doctorImagePlaceholder: {
    width: 109,
    height: 109,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  doctorDetails: {
    flex: 1,
    gap: 8,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2A37',
    fontFamily: 'Inter',
  },
  specialty: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563',
    fontFamily: 'Inter',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  location: {
    fontSize: 14,
    color: '#4B5563',
    fontFamily: 'Inter',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  primaryButton: {
    backgroundColor: '#1C2A3A',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 50,
    flex: 1,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'Inter',
  },
  secondaryButton: {
    backgroundColor: '#E5E7EB',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 50,
    flex: 1,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1C2A3A',
    fontFamily: 'Inter',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    fontFamily: 'Inter',
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 20,
    fontFamily: 'Inter',
  },
  bottomNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 48,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F7F7F7',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: -1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 10,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 24,
    height: 24,
  },
  activeNavItem: {
    width: 48,
    height: 48,
  },
  calendarIconContainer: {
    backgroundColor: '#F3F4F6',
    borderRadius: 101,
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
