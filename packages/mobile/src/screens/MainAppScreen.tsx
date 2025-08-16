import React from 'react';
import type { ReactElement } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  SafeAreaView,
  TouchableOpacity
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

type MainAppScreenProps = {
  onLogout?: () => void;
};

function isFunction(fn: unknown): fn is (() => void) {
  return typeof fn === 'function';
}

export default function MainAppScreen({
  onLogout
}: MainAppScreenProps): ReactElement {
  const handleLogout = (): void => {
    if (isFunction(onLogout)) {
      onLogout();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      <View style={styles.content}>
        <View style={styles.successContainer}>
          <MaterialIcons name="check-circle" size={80} color="#10B981" />
          <Text style={styles.title}>Chào mừng đến với HealthPal!</Text>
          <Text style={styles.subtitle}>
            Bạn đã hoàn thành quá trình đăng ký thành công.
          </Text>
        </View>

        <View style={styles.featuresContainer}>
          <Text style={styles.featuresTitle}>Tính năng chính:</Text>
          <View style={styles.featureItem}>
            <MaterialIcons name="calendar-today" size={24} color="#1C2A3A" />
            <Text style={styles.featureText}>Đặt lịch khám</Text>
          </View>
          <View style={styles.featureItem}>
            <MaterialIcons name="local-hospital" size={24} color="#1C2A3A" />
            <Text style={styles.featureText}>Tìm bác sĩ</Text>
          </View>
          <View style={styles.featureItem}>
            <MaterialIcons name="history" size={24} color="#1C2A3A" />
            <Text style={styles.featureText}>Lịch sử khám</Text>
          </View>
          <View style={styles.featureItem}>
            <MaterialIcons name="person" size={24} color="#1C2A3A" />
            <Text style={styles.featureText}>Hồ sơ sức khỏe</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Text style={styles.logoutButtonText}>Đăng xuất (Test)</Text>
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
    paddingHorizontal: 24,
    paddingVertical: 40,
    justifyContent: 'space-between',
  },
  successContainer: {
    alignItems: 'center',
    gap: 16,
    paddingTop: 60,
  },
  title: {
    fontFamily: 'Inter',
    fontWeight: '600',
    fontSize: 24,
    lineHeight: 32,
    color: '#1C2A3A',
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: 'Inter',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    color: '#6B7280',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  featuresContainer: {
    gap: 20,
  },
  featuresTitle: {
    fontFamily: 'Inter',
    fontWeight: '600',
    fontSize: 18,
    lineHeight: 28,
    color: '#1C2A3A',
    marginBottom: 8,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
  },
  featureText: {
    fontFamily: 'Inter',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    color: '#1C2A3A',
  },
  logoutButton: {
    backgroundColor: '#EF4444',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutButtonText: {
    fontFamily: 'Inter',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    color: '#FFFFFF',
  },
});