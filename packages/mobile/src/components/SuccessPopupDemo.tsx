import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import SuccessPopup from './SuccessPopup';

export default function SuccessPopupDemo() {
  const [showPopup, setShowPopup] = useState(false);

  const appointmentDetails = {
    date: '19/08/2025',
    startTime: '09:00',
    endTime: '09:30',
    doctorName: 'Dr. Nguyễn Văn A'
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Demo Success Popup</Text>
        <Text style={styles.subtitle}>Nhấn nút bên dưới để test popup</Text>
        
        <TouchableOpacity 
          style={styles.button}
          onPress={() => setShowPopup(true)}
        >
          <Text style={styles.buttonText}>Hiển thị Popup</Text>
        </TouchableOpacity>
      </View>

      <SuccessPopup
        visible={showPopup}
        onClose={() => setShowPopup(false)}
        appointmentDetails={appointmentDetails}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1C2A3A',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 32,
    textAlign: 'center',
    lineHeight: 24,
  },
  button: {
    backgroundColor: '#1C2A3A',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#1C2A3A',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
