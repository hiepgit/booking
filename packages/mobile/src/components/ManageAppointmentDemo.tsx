import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import ManageAppointmentScreen from '../screens/ManageAppointmentScreen';

export default function ManageAppointmentDemo() {
  const [showScreen, setShowScreen] = useState(false);

  const handleNavigateHome = () => {
    console.log('Navigate to Home');
    setShowScreen(false);
  };

  const handleNavigateLocation = () => {
    console.log('Navigate to Location');
    setShowScreen(false);
  };

  const handleNavigateProfile = () => {
    console.log('Navigate to Profile');
    setShowScreen(false);
  };

  if (showScreen) {
    return (
      <ManageAppointmentScreen
        onNavigateHome={handleNavigateHome}
        onNavigateLocation={handleNavigateLocation}
        onNavigateProfile={handleNavigateProfile}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Demo ManageAppointmentScreen</Text>
        <Text style={styles.subtitle}>Nhấn nút bên dưới để test màn hình quản lý lịch hẹn</Text>
        
        <TouchableOpacity 
          style={styles.button}
          onPress={() => setShowScreen(true)}
        >
          <Text style={styles.buttonText}>Mở ManageAppointmentScreen</Text>
        </TouchableOpacity>
      </View>
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
