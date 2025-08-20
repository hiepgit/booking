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
  Image,
  Modal,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { getUserProfile, UserProfile } from '../services/me.service';
import { useAuth } from '../contexts/AuthContext';

const { width } = Dimensions.get('window');

type ProfileScreenProps = {
  onNavigateHome?: () => void;
  onNavigateLocation?: () => void;
  onNavigateAppointments?: () => void;
  onNavigateEditProfile?: () => void;
  onNavigateFavorites?: () => void;
  onNavigateNotifications?: () => void;
  onNavigateSettings?: () => void;
  onNavigateHelp?: () => void;
  onNavigateTerms?: () => void;
  onNavigateChangePassword?: () => void;
  onNavigatePaymentHistory?: () => void;
  onLogout?: () => void;
};

type MenuItem = {
  id: string;
  icon: string;
  title: string;
  onPress: () => void;
  showSeparator?: boolean;
};

export default function ProfileScreen({
  onNavigateHome,
  onNavigateLocation,
  onNavigateAppointments,
  onNavigateEditProfile,
  onNavigateNotifications,
  onNavigateSettings,
  onNavigateHelp,
  onNavigateTerms,
  onLogout,
}: ProfileScreenProps): ReactElement {
  const { user: authUser, logout: authLogout } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(authUser);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Fetch user profile when component mounts
  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await getUserProfile();

      if (result.success && result.data) {
        setUserProfile(result.data);
        console.log('✅ ProfileScreen: User profile loaded successfully');
      } else {
        console.log('❌ ProfileScreen: Failed to load user profile:', result.error);
        setError(result.error?.message || 'Failed to load user profile');
        // Fallback to auth user if available
        if (authUser) {
          setUserProfile(authUser);
        }
      }
    } catch (error: any) {
      console.error('❌ ProfileScreen: Unexpected error loading user profile:', error);
      setError('Unexpected error loading user profile');
      // Fallback to auth user if available
      if (authUser) {
        setUserProfile(authUser);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthLogout = async (): Promise<void> => {
    try {
      await authLogout();
      if (onLogout) {
        onLogout();
      }
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Lỗi', 'Không thể đăng xuất. Vui lòng thử lại.');
    }
  };

  const menuItems: MenuItem[] = [
    {
      id: 'edit-profile',
      icon: 'edit',
      title: 'Chỉnh sửa hồ sơ',
      onPress: onNavigateEditProfile || (() => console.log('Navigate to edit profile')),
      showSeparator: true,
    },
    {
      id: 'notifications',
      icon: 'notifications',
      title: 'Thông báo',
      onPress: onNavigateNotifications || (() => console.log('Navigate to notifications')),
      showSeparator: true,
    },
    {
      id: 'settings',
      icon: 'settings',
      title: 'Cài đặt',
      onPress: onNavigateSettings || (() => console.log('Navigate to settings')),
      showSeparator: true,
    },
    {
      id: 'help',
      icon: 'help',
      title: 'Trợ giúp & Hỗ trợ',
      onPress: onNavigateHelp || (() => console.log('Navigate to help')),
      showSeparator: true,
    },
    {
      id: 'terms',
      icon: 'security',
      title: 'Điều khoản & Điều kiện',
      onPress: onNavigateTerms || (() => console.log('Navigate to terms')),
      showSeparator: true,
    },
    {
      id: 'logout',
      icon: 'logout',
      title: 'Đăng xuất',
      onPress: () => setShowLogoutModal(true),
      showSeparator: false,
    },
  ];

  const handleLogout = async () => {
    setShowLogoutModal(false);
    await handleAuthLogout();
  };

  const handleCancelLogout = () => {
    setShowLogoutModal(false);
  };

  const renderMenuItem = (item: MenuItem) => (
    <View key={item.id}>
      <TouchableOpacity style={styles.menuItem} onPress={item.onPress}>
        <View style={styles.menuItemLeft}>
          <View style={styles.menuIconContainer}>
            <MaterialIcons name={item.icon as any} size={24} color="#1C2A3A" />
          </View>
          <Text style={styles.menuItemTitle}>{item.title}</Text>
        </View>
        <MaterialIcons name="chevron-right" size={20} color="#6B7280" />
      </TouchableOpacity>
      {item.showSeparator && <View style={styles.separator} />}
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
      
      <TouchableOpacity style={styles.navItem} onPress={onNavigateAppointments}>
        <MaterialIcons name="event" size={24} color="#9CA3AF" />
      </TouchableOpacity>
      
      <TouchableOpacity style={[styles.navItem, styles.activeNavItem]}>
        <View style={styles.profileIconContainer}>
          <MaterialIcons name="person" size={24} color="#374151" />
        </View>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Title */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>Hồ sơ</Text>
          {isLoading && (
            <ActivityIndicator size="small" color="#007AFF" style={{ marginLeft: 10 }} />
          )}
        </View>

        {/* Error Message */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={fetchUserProfile} style={styles.retryButton}>
              <Text style={styles.retryText}>Thử lại</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Profile Picture & Info */}
        <View style={styles.profileSection}>
          <View style={styles.profilePictureContainer}>
            <View style={styles.profilePicture}>
              {userProfile?.avatar ? (
                <Image
                  source={{ uri: userProfile.avatar }}
                  style={styles.avatarImage}
                  onError={() => console.log('Failed to load avatar')}
                />
              ) : (
                <MaterialIcons name="person" size={80} color="#9CA3AF" />
              )}
            </View>
            <TouchableOpacity style={styles.editButton}>
              <MaterialIcons name="edit" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>
              {userProfile ? `${userProfile.firstName} ${userProfile.lastName}` : 'Đang tải...'}
            </Text>
            <Text style={styles.profilePhone}>
              {userProfile?.phone || userProfile?.email || 'Chưa có thông tin'}
            </Text>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          {menuItems.map(renderMenuItem)}
        </View>
        
        {/* Bottom spacing để tránh bị đè taskbar */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Bottom Navigation */}
      {renderBottomNavigation()}

      {/* Logout Modal */}
      <Modal
        visible={showLogoutModal}
        transparent
        animationType="slide"
        onRequestClose={handleCancelLogout}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.logoutModal}>
            <View style={styles.modalHeader}>
              <MaterialIcons name="logout" size={32} color="#EF4444" />
              <Text style={styles.modalTitle}>Đăng xuất</Text>
              <Text style={styles.modalDescription}>
                Bạn có chắc chắn muốn đăng xuất khỏi ứng dụng?
              </Text>
            </View>
            
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={handleCancelLogout}
              >
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.logoutButton} 
                onPress={handleLogout}
              >
                <Text style={styles.logoutButtonText}>Đăng xuất</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
    fontFamily: 'Inter',
  },
  errorContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#FEF2F2',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
    marginBottom: 10,
  },
  retryButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: '#DC2626',
    borderRadius: 6,
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  profileSection: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    alignItems: 'center',
    gap: 16,
  },
  profilePictureContainer: {
    position: 'relative',
  },
  profilePicture: {
    width: 202,
    height: 202,
    backgroundColor: '#F3F4F6',
    borderRadius: 101,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  avatarImage: {
    width: 202,
    height: 202,
    borderRadius: 101,
  },
  editButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    width: 34,
    height: 34,
    backgroundColor: '#1C2A3A',
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  profileInfo: {
    alignItems: 'center',
    gap: 4,
  },
  profileName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2A37',
    fontFamily: 'Inter',
  },
  profilePhone: {
    fontSize: 14,
    fontWeight: '400',
    color: '#6B7280',
    fontFamily: 'Inter',
  },
  menuSection: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24, // Thêm padding bottom
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 0,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  menuIconContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuItemTitle: {
    fontSize: 18,
    fontWeight: '400',
    color: '#6B7280',
    fontFamily: 'Inter',
  },
  separator: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginLeft: 40,
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
  profileIconContainer: {
    backgroundColor: '#F3F4F6',
    borderRadius: 24,
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  logoutModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 54,
    padding: 24,
    width: width, // Sử dụng chiều rộng màn hình
    alignItems: 'center',
    gap: 24,
    borderTopLeftRadius: 34,
    borderTopRightRadius: 34,
    borderBottomLeftRadius: 54,
    borderBottomRightRadius: 54,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    alignItems: 'center',
    gap: 16,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2A37',
    fontFamily: 'Inter',
    textAlign: 'center',
  },
  modalDescription: {
    fontSize: 16,
    color: '#6B7280',
    fontFamily: 'Inter',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 16,
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    flex: 1,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cancelButtonText: {
    color: '#1C2A3A',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter',
  },
  logoutButton: {
    backgroundColor: '#EF4444',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    flex: 1,
    alignItems: 'center',
    shadowColor: '#EF4444',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter',
  },
  bottomSpacing: {
    height: 120, // Tăng height để tránh bị đè taskbar
  },
});
