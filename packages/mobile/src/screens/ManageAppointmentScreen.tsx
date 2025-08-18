import React, { useState, useRef, useEffect } from 'react';
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
  Animated,
  Easing,
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
    date: '14 Tháng 5, 2023 - 10:00 Sáng',
    time: '10:00 Sáng',
    doctorName: 'Bác sĩ David Patel',
    specialty: 'Bác sĩ Tim mạch',
    location: 'Trung tâm Tim mạch, Hoa Kỳ',
    doctorImage: 'https://example.com/doctor1.jpg',
    status: 'upcoming',
  },
  {
    id: '2',
    date: '15 Tháng 5, 2023 - 2:30 Chiều',
    time: '2:30 Chiều',
    doctorName: 'Bác sĩ Sarah Johnson',
    specialty: 'Bác sĩ Da liễu',
    location: 'Phòng khám Da liễu, Hoa Kỳ',
    doctorImage: 'https://example.com/doctor2.jpg',
    status: 'upcoming',
  },
  {
    id: '3',
    date: '10 Tháng 5, 2023 - 9:00 Sáng',
    time: '9:00 Sáng',
    doctorName: 'Bác sĩ Michael Chen',
    specialty: 'Bác sĩ Thần kinh',
    location: 'Viện Thần kinh, Hoa Kỳ',
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
  const scrollViewRef = useRef<ScrollView>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  
  // Animation values - tất cả hooks phải ở đầu component
  const tabIndicatorPosition = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(1)).current;
  const contentScale = useRef(new Animated.Value(1)).current;
  const swipeFeedback = useRef(new Animated.Value(0)).current;

  const filteredAppointments = mockAppointments.filter(
    appointment => appointment.status === activeTab
  );

  // Animate tab indicator
  useEffect(() => {
    const tabIndex = ['upcoming', 'completed', 'canceled'].indexOf(activeTab);
    // Tính toán vị trí chính xác cho tabIndicator
    const tabWidth = 80; // Width của mỗi tab
    const tabSpacing = 40; // Khoảng cách giữa các tab
    const totalWidth = (tabWidth + tabSpacing) * 2 + tabWidth; // Tổng width của 3 tab
    const startPosition = (width - totalWidth) / 2; // Vị trí bắt đầu của tabs
    const targetPosition = startPosition + tabIndex * (tabWidth + tabSpacing) + (tabWidth - 60) / 2; // 60 là width của indicator
    
    Animated.spring(tabIndicatorPosition, {
      toValue: targetPosition,
      useNativeDriver: false,
      tension: 100,
      friction: 8,
    }).start();
  }, [activeTab]);

  // Animate content transition
  const animateContentTransition = (direction: 'left' | 'right') => {
    // Fade out and scale down
    Animated.parallel([
      Animated.timing(contentOpacity, {
        toValue: 0.7,
        duration: 150,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(contentScale, {
        toValue: 0.95,
        duration: 150,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Fade in and scale up
      Animated.parallel([
        Animated.timing(contentOpacity, {
          toValue: 1,
          duration: 200,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(contentScale, {
          toValue: 1,
          duration: 200,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  // Swipe feedback animation
  const animateSwipeFeedback = (direction: 'left' | 'right') => {
    const startValue = direction === 'left' ? -20 : 20;
    
    Animated.sequence([
      Animated.timing(swipeFeedback, {
        toValue: startValue,
        duration: 100,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(swipeFeedback, {
        toValue: 0,
        duration: 200,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleSwipe = (direction: 'left' | 'right') => {
    const tabs: AppointmentStatus[] = ['upcoming', 'completed', 'canceled'];
    const currentIndex = tabs.indexOf(activeTab);
    
    console.log('Current tab:', activeTab, 'Current index:', currentIndex);
    
    if (direction === 'left' && currentIndex < tabs.length - 1) {
      const newTab = tabs[currentIndex + 1];
      console.log('Switching to next tab:', newTab);
      setActiveTab(newTab);
      animateContentTransition(direction);
      animateSwipeFeedback(direction);
    } else if (direction === 'right' && currentIndex > 0) {
      const newTab = tabs[currentIndex - 1];
      console.log('Switching to previous tab:', newTab);
      setActiveTab(newTab);
      animateContentTransition(direction);
      animateSwipeFeedback(direction);
    }
  };

  const handleTouchStart = (event: any) => {
    setTouchStart(event.nativeEvent.pageX);
  };

  const handleTouchEnd = (event: any) => {
    if (touchStart === null) return;
    
    const touchEnd = event.nativeEvent.pageX;
    const diff = touchStart - touchEnd;
    const swipeThreshold = 50;
    
    console.log('Touch start:', touchStart, 'Touch end:', touchEnd, 'Diff:', diff);
    
    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        // Vuốt trái
        console.log('Swiping left');
        handleSwipe('left');
      } else {
        // Vuốt phải
        console.log('Swiping right');
        handleSwipe('right');
      }
    }
    
    setTouchStart(null);
  };

  const renderTab = (status: AppointmentStatus, label: string) => {
    const handlePress = () => {
      if (activeTab !== status) {
        setActiveTab(status);
        animateContentTransition('left');
      }
    };

    return (
      <TouchableOpacity
        style={[
          styles.tab,
          activeTab === status && styles.activeTab
        ]}
        onPress={handlePress}
      >
        <Text style={[
          styles.tabText,
          activeTab === status && styles.activeTabText
        ]}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderAppointmentCard = (appointment: Appointment, index: number) => {
    return (
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
                <Text style={styles.secondaryButtonText}>Đổi lịch</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.primaryButton}>
                <Text style={styles.primaryButtonText}>Hủy lịch</Text>
              </TouchableOpacity>
            </>
          ) : appointment.status === 'completed' ? (
            <TouchableOpacity style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Đặt lại</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Đặt lại</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

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
      <View 
        style={styles.content}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Title */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>Lịch hẹn của tôi</Text>
        </View>

        {/* Tabs with animated indicator */}
        <View style={styles.tabsContainer}>
          {renderTab('upcoming', 'Sắp tới')}
          {renderTab('completed', 'Đã hoàn thành')}
          {renderTab('canceled', 'Đã hủy')}
          
          {/* Animated tab indicator */}
          <Animated.View 
            style={[
              styles.tabIndicator,
              {
                transform: [{ translateX: tabIndicatorPosition }],
              }
            ]} 
          />
        </View>

        {/* Separator */}
        <View style={styles.tabSeparator} />

        {/* Animated Content */}
        <Animated.View
          style={{
            flex: 1,
            opacity: contentOpacity,
            transform: [
              { scale: contentScale },
              { translateX: swipeFeedback }
            ],
          }}
        >
          {/* Appointments List */}
          <ScrollView 
            ref={scrollViewRef}
            style={styles.appointmentsList} 
            showsVerticalScrollIndicator={false}
            scrollEnabled={true}
          >
            {filteredAppointments.length > 0 ? (
              filteredAppointments.map((appointment, index) => renderAppointmentCard(appointment, index))
            ) : (
              <View style={styles.emptyState}>
                <MaterialIcons name="event-busy" size={64} color="#9CA3AF" />
                <Text style={styles.emptyStateTitle}>
                  Không có lịch hẹn {activeTab === 'upcoming' ? 'sắp tới' : activeTab === 'completed' ? 'đã hoàn thành' : 'đã hủy'}
                </Text>
                <Text style={styles.emptyStateSubtitle}>
                  {activeTab === 'upcoming' 
                    ? 'Bạn chưa có lịch hẹn nào sắp tới'
                    : activeTab === 'completed'
                    ? 'Bạn chưa có lịch hẹn nào đã hoàn thành'
                    : 'Bạn chưa có lịch hẹn nào đã hủy'
                  }
                </Text>
              </View>
            )}
          </ScrollView>
        </Animated.View>
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
    gap: 40, // Khoảng cách giữa các tab
    position: 'relative', // Để tabIndicator có thể định vị tuyệt đối
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  activeTab: {
    // Xóa borderBottomWidth để không có thanh trượt cũ
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
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    width: 60, // Điều chỉnh width cho phù hợp
    height: 3,
    backgroundColor: '#1C2A3A',
    borderRadius: 50,
    zIndex: 1,
  },

});
