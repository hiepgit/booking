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
  Dimensions,
  Alert
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SuccessPopup } from '../components';

const { width } = Dimensions.get('window');

type SelectTimeScreenProps = {
  onBack?: () => void;
  onConfirm?: (date: string, time: string, endTime: string) => void;
  onNavigateToMyBookings?: () => void;
  doctorId?: string;
};

type TimeSlot = {
  id: string;
  startTime: string;
  endTime: string;
  available: boolean;
  remainingSlots?: number;
  isHeld?: boolean;
  holdTimeLeft?: number;
};

type CalendarDate = {
  date: string;
  day: string;
  hasSlots: boolean;
  isToday: boolean;
  isSelected: boolean;
  isDisabled: boolean;
  slotCount: number;
};

const timeSlots: TimeSlot[] = [
  // Sáng
  { id: '1', startTime: '08:00', endTime: '08:30', available: true, remainingSlots: 3 },
  { id: '2', startTime: '08:30', endTime: '09:00', available: true, remainingSlots: 2 },
  { id: '3', startTime: '09:00', endTime: '09:30', available: true, remainingSlots: 1 },
  { id: '4', startTime: '09:30', endTime: '10:00', available: true, remainingSlots: 4 },
  { id: '5', startTime: '10:00', endTime: '10:30', available: true, remainingSlots: 2 },
  { id: '6', startTime: '10:30', endTime: '11:00', available: true, remainingSlots: 3 },
  { id: '7', startTime: '11:00', endTime: '11:30', available: true, remainingSlots: 1 },
  { id: '8', startTime: '11:30', endTime: '12:00', available: true, remainingSlots: 2 },
  
  // Chiều
  { id: '9', startTime: '13:00', endTime: '13:30', available: true, remainingSlots: 4 },
  { id: '10', startTime: '13:30', endTime: '14:00', available: true, remainingSlots: 3 },
  { id: '11', startTime: '14:00', endTime: '14:30', available: true, remainingSlots: 2 },
  { id: '12', startTime: '14:30', endTime: '15:00', available: true, remainingSlots: 1 },
  { id: '13', startTime: '15:00', endTime: '15:30', available: true, remainingSlots: 3 },
  { id: '14', startTime: '15:30', endTime: '16:00', available: true, remainingSlots: 2 },
  { id: '15', startTime: '16:00', endTime: '16:30', available: true, remainingSlots: 4 },
  { id: '16', startTime: '16:30', endTime: '17:00', available: true, remainingSlots: 1 },
  
  // Tối
  { id: '17', startTime: '17:00', endTime: '17:30', available: true, remainingSlots: 2 },
  { id: '18', startTime: '17:30', endTime: '18:00', available: true, remainingSlots: 3 },
  { id: '19', startTime: '18:00', endTime: '18:30', available: true, remainingSlots: 1 },
  { id: '20', startTime: '18:30', endTime: '19:00', available: true, remainingSlots: 2 },
];

const weekDays = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

function isFunction(fn: unknown): fn is Function {
  return typeof fn === 'function';
}

export default function SelectTimeScreen({ 
  onBack, 
  onConfirm, 
  onNavigateToMyBookings,
  doctorId 
}: SelectTimeScreenProps): ReactElement {
  const [selectedDate, setSelectedDate] = useState('19');
  const [selectedTime, setSelectedTime] = useState('');
  const [currentMonth, setCurrentMonth] = useState('Tháng 8, 2025');
  const [calendarDates, setCalendarDates] = useState<CalendarDate[]>([]);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [appointmentDetails, setAppointmentDetails] = useState({
    date: '',
    startTime: '',
    endTime: '',
    doctorName: 'Dr. Nguyễn Văn A' // Có thể lấy từ props hoặc API
  });

  useEffect(() => {
    generateCalendarDates();
  }, []);

  const generateCalendarDates = () => {
    const dates: CalendarDate[] = [];
    const today = new Date();
    
    // Tạo 28 ngày từ hôm nay
    for (let i = 0; i < 28; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      const dateStr = date.getDate().toString();
      const dayStr = weekDays[date.getDay() === 0 ? 6 : date.getDay() - 1];
      const hasSlots = Math.random() > 0.3; // 70% ngày có slot
      const slotCount = hasSlots ? Math.floor(Math.random() * 10) + 5 : 0;
      
      dates.push({
        date: dateStr,
        day: dayStr,
        hasSlots,
        isToday: i === 0,
        isSelected: dateStr === '19',
        isDisabled: i < 0, // Chỉ cho phép đặt từ hôm nay
        slotCount
      });
    }
    
    setCalendarDates(dates);
  };

  const handleBack = (): void => {
    if (isFunction(onBack)) {
      onBack();
    }
  };

  const handleConfirm = (): void => {
    if (!selectedTime) {
      Alert.alert('Vui lòng chọn giờ', 'Bạn cần chọn một khung giờ để tiếp tục.');
      return;
    }
    
    const selectedSlot = timeSlots.find(slot => `${slot.startTime}-${slot.endTime}` === selectedTime);
    if (selectedSlot) {
      // Cập nhật thông tin lịch hẹn
      setAppointmentDetails({
        date: selectedDate,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        doctorName: 'Dr. Nguyễn Văn A' // Có thể lấy từ props hoặc API
      });
      
      // Hiển thị popup thành công
      setShowSuccessPopup(true);
      
      // Gọi callback nếu có
      if (isFunction(onConfirm)) {
        onConfirm(selectedDate, selectedSlot.startTime, selectedSlot.endTime);
      }
    }
  };

  const handleClosePopup = (): void => {
    setShowSuccessPopup(false);
    // Có thể thêm logic chuyển màn hình hoặc reset form ở đây
  };

  const handleDateSelect = (date: CalendarDate): void => {
    if (date.isDisabled) return;
    
    setCalendarDates(prev => prev.map(d => ({
      ...d,
      isSelected: d.date === date.date
    })));
    setSelectedDate(date.date);
    setSelectedTime(''); // Reset time khi đổi ngày
  };

  const handleTimeSelect = (time: string): void => {
    setSelectedTime(time);
  };

  const findNextAvailableDate = (): void => {
    const nextAvailable = calendarDates.find(d => d.hasSlots && !d.isDisabled);
    if (nextAvailable) {
      handleDateSelect(nextAvailable);
    }
  };

  const handleViewAppointments = (): void => {
    if (isFunction(onNavigateToMyBookings)) {
      onNavigateToMyBookings();
    }
  };

  const renderCalendarDay = (day: string) => (
    <View key={day} style={styles.calendarDay}>
      <Text style={styles.dayText}>{day}</Text>
    </View>
  );

  const renderCalendarDate = (date: CalendarDate) => (
    <TouchableOpacity
      key={date.date}
      style={[
        styles.calendarDate,
        date.isSelected && styles.selectedDate,
        date.isDisabled && styles.disabledDate,
        date.isToday && styles.todayDate
      ]}
      onPress={() => handleDateSelect(date)}
      disabled={date.isDisabled}
    >
      <Text style={[
        styles.dateText,
        date.isSelected && styles.selectedDateText,
        date.isDisabled && styles.disabledDateText,
        date.isToday && styles.todayDateText
      ]}>
        {date.date}
      </Text>
      {date.hasSlots && (
        <View style={styles.slotIndicator}>
          <View style={styles.slotDot} />
        </View>
      )}
      {date.isToday && (
        <Text style={styles.todayLabel}>Hôm nay</Text>
      )}
    </TouchableOpacity>
  );

  const renderTimeSlot = (slot: TimeSlot) => {
    const isSelected = selectedTime === `${slot.startTime}-${slot.endTime}`;
    const isLowStock = slot.remainingSlots && slot.remainingSlots <= 2;
    
    return (
      <TouchableOpacity
        key={slot.id}
        style={[
          styles.timeSlot,
          isSelected && styles.selectedTimeSlot,
          !slot.available && styles.unavailableTimeSlot
        ]}
        onPress={() => slot.available && handleTimeSelect(`${slot.startTime}-${slot.endTime}`)}
        disabled={!slot.available}
      >
        <Text style={[
          styles.timeText,
          isSelected && styles.selectedTimeText,
          !slot.available && styles.unavailableTimeText
        ]}>
          {slot.startTime}
        </Text>
        <Text style={[
          styles.endTimeText,
          isSelected && styles.selectedTimeText,
          !slot.available && styles.unavailableTimeText
        ]}>
          {slot.endTime}
        </Text>
        {slot.remainingSlots && slot.remainingSlots <= 2 && (
          <View style={styles.lowStockBadge}>
            <Text style={styles.lowStockText}>Còn {slot.remainingSlots} chỗ</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderTimeSection = (title: string, slots: TimeSlot[]) => (
    <View style={styles.timeSection}>
      <Text style={styles.timeSectionTitle}>{title}</Text>
      <View style={styles.timeRow}>
        {slots.map(renderTimeSlot)}
      </View>
    </View>
  );

  const morningSlots = timeSlots.slice(0, 8);
  const afternoonSlots = timeSlots.slice(8, 16);
  const eveningSlots = timeSlots.slice(16, 20);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Content */}
      <View style={styles.content}>
        {/* Title/Back-icon */}
        <View style={styles.titleSection}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>
          <Text style={styles.title}>Chọn thời gian</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Container */}
        <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Select Date & Hour */}
          <View style={styles.selectSection}>
            {/* Select Date */}
            <View style={styles.dateSection}>
              <View style={styles.dateHeader}>
                <Text style={styles.sectionTitle}>Chọn ngày</Text>
                <TouchableOpacity style={styles.nextAvailableButton} onPress={findNextAvailableDate}>
                  <Text style={styles.nextAvailableText}>Ngày gần nhất</Text>
                </TouchableOpacity>
              </View>
              
              {/* Datepicker Dropdown */}
              <View style={styles.datepickerContainer}>
                {/* Header */}
                <View style={styles.calendarHeader}>
                  <Text style={styles.monthText}>{currentMonth}</Text>
                  <View style={styles.arrowContainer}>
                    <TouchableOpacity style={styles.arrowButton}>
                      <MaterialIcons name="chevron-left" size={14} color="#9CA3AF" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.arrowButton}>
                      <MaterialIcons name="chevron-right" size={14} color="#1C2A3A" />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Calendar Body */}
                <View style={styles.calendarBody}>
                  {/* Week Days Header */}
                  <View style={styles.weekRow}>
                    {weekDays.map(renderCalendarDay)}
                  </View>

                  {/* Calendar Dates */}
                  <View style={styles.calendarGrid}>
                    {calendarDates.map(renderCalendarDate)}
                  </View>
                </View>
                
                {/* Timezone Info */}
                <View style={styles.timezoneInfo}>
                  <Text style={styles.timezoneText}>
                    Giờ hiển thị theo Asia/Bangkok (UTC+07)
                  </Text>
                </View>
              </View>
            </View>

            {/* Select Hour */}
            <View style={styles.hourSection}>
              <Text style={styles.sectionTitle}>Chọn giờ</Text>
              
              {/* Time Sections */}
              <View style={styles.hoursContainer}>
                {renderTimeSection('Sáng', morningSlots)}
                {renderTimeSection('Chiều', afternoonSlots)}
                {renderTimeSection('Tối', eveningSlots)}
              </View>
              
              {/* Info Text */}
              <View style={styles.infoContainer}>
                <Text style={styles.infoText}>
                  Bạn sẽ được giữ slot 2 phút trong khi điền thông tin.
                </Text>
                <Text style={styles.infoText}>
                  Có thể đổi lịch miễn phí trước 24h.
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>

      {/* Sticky Footer */}
      <View style={styles.stickyFooter}>
        <TouchableOpacity 
          style={[
            styles.confirmButton, 
            !selectedTime && styles.confirmButtonDisabled
          ]} 
          onPress={handleConfirm}
          disabled={!selectedTime}
        >
          <Text style={[
            styles.confirmButtonText,
            !selectedTime && styles.confirmButtonTextDisabled
          ]}>
            Tiếp tục
          </Text>
        </TouchableOpacity>
      </View>

      {/* Success Popup */}
      <SuccessPopup
        visible={showSuccessPopup}
        onClose={handleClosePopup}
        onViewAppointments={handleViewAppointments}
        appointmentDetails={appointmentDetails}
      />
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 10,
    height: 50,
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
  scrollContent: {
    flex: 1,
  },
  selectSection: {
    gap: 32,
    paddingBottom: 100, // Space for sticky footer
  },
  dateSection: {
    paddingHorizontal: 24,
    gap: 8,
  },
  dateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1C2A3A',
  },
  nextAvailableButton: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  nextAvailableText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1C2A3A',
  },
  datepickerContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 2,
    marginBottom: 8,
  },
  monthText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111928',
  },
  arrowContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  arrowButton: {
    width: 14,
    height: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarBody: {
    gap: 8,
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 34,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  calendarDay: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  dayText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4B5563',
  },
  calendarDate: {
    width: (width - 80) / 7,
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    height: 50,
    justifyContent: 'center',
    position: 'relative',
  },
  selectedDate: {
    backgroundColor: '#1C2A3A',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 2,
  },
  disabledDate: {
    opacity: 0.3,
  },
  todayDate: {
    borderWidth: 2,
    borderColor: '#1C2A3A',
    borderRadius: 8,
  },
  dateText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
  },
  selectedDateText: {
    color: '#FFFFFF',
  },
  disabledDateText: {
    color: '#D1D5DB',
  },
  todayDateText: {
    color: '#1C2A3A',
  },
  slotIndicator: {
    position: 'absolute',
    bottom: 2,
  },
  slotDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#10B981',
  },
  todayLabel: {
    position: 'absolute',
    top: -15,
    fontSize: 8,
    fontWeight: '500',
    color: '#1C2A3A',
  },
  timezoneInfo: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  timezoneText: {
    fontSize: 11,
    color: '#6B7280',
    textAlign: 'center',
  },
  hourSection: {
    paddingHorizontal: 24,
    gap: 16,
  },
  hoursContainer: {
    gap: 24,
  },
  timeSection: {
    gap: 12,
  },
  timeSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  timeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  timeSlot: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    minWidth: 80,
  },
  selectedTimeSlot: {
    backgroundColor: '#1C2A3A',
  },
  unavailableTimeSlot: {
    backgroundColor: '#F3F4F6',
    opacity: 0.5,
  },
  timeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  endTimeText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  selectedTimeText: {
    color: '#FFFFFF',
  },
  unavailableTimeText: {
    color: '#9CA3AF',
  },
  lowStockBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#F59E0B',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  lowStockText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  infoContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    gap: 8,
  },
  infoText: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 16,
  },
  stickyFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#F7F7F7',
  },
  confirmButton: {
    backgroundColor: '#1C2A3A',
    borderRadius: 50,
    paddingVertical: 16,
    alignItems: 'center',
  },
  confirmButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  confirmButtonTextDisabled: {
    color: '#9CA3AF',
  },
});
