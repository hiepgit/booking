import { Linking } from 'react-native';
import { api, saveTokens } from '../lib/apiClient';

// Types cho social authentication
export interface SocialAuthResult {
  success: boolean;
  accessToken?: string;
  refreshToken?: string;
  user?: any;
  error?: string;
}

const API_BASE = process.env.EXPO_PUBLIC_API_BASE || 'http://localhost:3001';

/**
 * Đăng nhập bằng Google sử dụng WebView approach
 */
export async function signInWithGoogle(): Promise<SocialAuthResult> {
  try {
    console.log('🔍 Starting Google sign in with WebView approach');
    
    // Tạo Google OAuth URL thông qua backend
    const googleAuthUrl = `${API_BASE}/auth/google`;
    
    // Mở browser để user authenticate
    const supported = await Linking.canOpenURL(googleAuthUrl);
    
    if (!supported) {
      return {
        success: false,
        error: 'Cannot open Google authentication URL',
      };
    }

    // Mở URL trong browser
    await Linking.openURL(googleAuthUrl);
    
    // Trong thực tế, chúng ta cần implement deep linking để handle callback
    // Tạm thời return success để test
    return {
      success: true,
      error: 'Google authentication opened in browser. Deep linking callback not implemented yet.',
    };
    
  } catch (error: any) {
    console.error('❌ Google sign in error:', error);
    return {
      success: false,
      error: error.message || 'Google sign in failed',
    };
  }
}

/**
 * Đăng nhập bằng Facebook sử dụng WebView approach
 */
export async function signInWithFacebook(): Promise<SocialAuthResult> {
  try {
    console.log('📘 Starting Facebook sign in with WebView approach');
    
    // Tạo Facebook OAuth URL thông qua backend
    const facebookAuthUrl = `${API_BASE}/auth/facebook`;
    
    // Mở browser để user authenticate
    const supported = await Linking.canOpenURL(facebookAuthUrl);
    
    if (!supported) {
      return {
        success: false,
        error: 'Cannot open Facebook authentication URL',
      };
    }

    // Mở URL trong browser
    await Linking.openURL(facebookAuthUrl);
    
    // Trong thực tế, chúng ta cần implement deep linking để handle callback
    // Tạm thời return success để test
    return {
      success: true,
      error: 'Facebook authentication opened in browser. Deep linking callback not implemented yet.',
    };
    
  } catch (error: any) {
    console.error('❌ Facebook sign in error:', error);
    return {
      success: false,
      error: error.message || 'Facebook sign in failed',
    };
  }
}

/**
 * Alternative approach: Sử dụng mock social login cho development
 * Tạo mock user profile và gọi backend social-login endpoint
 */
export async function mockGoogleSignIn(): Promise<SocialAuthResult> {
  try {
    console.log('🔍 Mock Google sign in for development');
    
    // Mock Google user profile
    const mockProfile = {
      id: 'google_123456789',
      email: 'testuser@gmail.com',
      name: 'Test User Google',
      firstName: 'Test',
      lastName: 'User',
      picture: 'https://lh3.googleusercontent.com/a/default-user=s96-c',
      provider: 'google' as const,
    };

    // Call backend social-login endpoint
    const response = await api.post('/auth/social-login', {
      provider: 'GOOGLE',
      profile: mockProfile,
    });

    if (response.status === 200) {
      // Lưu tokens
      await saveTokens(response.data.accessToken, response.data.refreshToken);
      
      return {
        success: true,
        accessToken: response.data.accessToken,
        refreshToken: response.data.refreshToken,
        user: response.data.user,
      };
    } else {
      return {
        success: false,
        error: 'Mock Google sign in failed',
      };
    }
  } catch (error: any) {
    console.error('❌ Mock Google sign in error:', error);
    return {
      success: false,
      error: error.response?.data?.error?.message || 'Mock Google sign in failed',
    };
  }
}

/**
 * Alternative approach: Sử dụng mock social login cho development
 * Tạo mock user profile và gọi backend social-login endpoint
 */
export async function mockFacebookSignIn(): Promise<SocialAuthResult> {
  try {
    console.log('📘 Mock Facebook sign in for development');
    
    // Mock Facebook user profile
    const mockProfile = {
      id: 'facebook_123456789',
      email: 'testuser@facebook.com',
      name: 'Test User Facebook',
      firstName: 'Test',
      lastName: 'User',
      picture: 'https://graph.facebook.com/123456789/picture?type=large',
      provider: 'facebook' as const,
    };

    // Call backend social-login endpoint
    const response = await api.post('/auth/social-login', {
      provider: 'FACEBOOK',
      profile: mockProfile,
    });

    if (response.status === 200) {
      // Lưu tokens
      await saveTokens(response.data.accessToken, response.data.refreshToken);
      
      return {
        success: true,
        accessToken: response.data.accessToken,
        refreshToken: response.data.refreshToken,
        user: response.data.user,
      };
    } else {
      return {
        success: false,
        error: 'Mock Facebook sign in failed',
      };
    }
  } catch (error: any) {
    console.error('❌ Mock Facebook sign in error:', error);
    return {
      success: false,
      error: error.response?.data?.error?.message || 'Mock Facebook sign in failed',
    };
  }
}
