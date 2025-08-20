import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import * as Crypto from 'expo-crypto';
import { Platform } from 'react-native';
import { api, saveTokens } from '../lib/apiClient';

// Cấu hình WebBrowser cho authentication
WebBrowser.maybeCompleteAuthSession();

// Types cho social authentication
export interface SocialAuthResult {
  success: boolean;
  accessToken?: string;
  refreshToken?: string;
  user?: any;
  error?: string;
}

export interface SocialUserProfile {
  id: string;
  email: string;
  name: string;
  firstName?: string;
  lastName?: string;
  picture?: string;
  provider: 'google' | 'facebook';
}

// Helper function để tạo random string cho PKCE
function generateRandomString(length: number): string {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return result;
}

// Cấu hình OAuth cho Google
const GOOGLE_CONFIG = {
  clientId: Platform.select({
    ios: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || '',
    android: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || '',
    web: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || '',
  }),
  scopes: ['openid', 'profile', 'email'],
  additionalParameters: {},
  customParameters: {},
};

// Cấu hình OAuth cho Facebook
const FACEBOOK_CONFIG = {
  clientId: process.env.EXPO_PUBLIC_FACEBOOK_APP_ID || '',
  scopes: ['public_profile', 'email'],
  additionalParameters: {},
  customParameters: {},
};

// Validate configuration
function validateConfig() {
  const googleClientId = GOOGLE_CONFIG.clientId;
  const facebookClientId = FACEBOOK_CONFIG.clientId;

  if (!googleClientId || googleClientId === '') {
    console.warn('Google OAuth client ID not configured');
  }

  if (!facebookClientId || facebookClientId === '') {
    console.warn('Facebook OAuth client ID not configured');
  }
}

// Validate config on module load
validateConfig();

// Discovery document cho Google
const GOOGLE_DISCOVERY = {
  authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
  revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
  userInfoEndpoint: 'https://www.googleapis.com/oauth2/v2/userinfo',
};

// Discovery document cho Facebook
const FACEBOOK_DISCOVERY = {
  authorizationEndpoint: 'https://www.facebook.com/v18.0/dialog/oauth',
  tokenEndpoint: 'https://graph.facebook.com/v18.0/oauth/access_token',
  userInfoEndpoint: 'https://graph.facebook.com/me',
};

/**
 * Tạo redirect URI cho OAuth
 */
function makeRedirectUri(provider: 'google' | 'facebook'): string {
  return AuthSession.makeRedirectUri({
    scheme: 'healthpal',
    path: `auth/${provider}`,
  });
}

/**
 * Lấy thông tin user từ Google
 */
async function getGoogleUserInfo(accessToken: string): Promise<SocialUserProfile> {
  try {
    const response = await fetch(`${GOOGLE_DISCOVERY.userInfoEndpoint}?access_token=${accessToken}`);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch Google user info: ${response.status} ${errorText}`);
    }

    const userInfo = await response.json();

    // Validate required fields
    if (!userInfo.id || !userInfo.email) {
      throw new Error('Invalid user info from Google: missing required fields');
    }

    return {
      id: userInfo.id,
      email: userInfo.email,
      name: userInfo.name || `${userInfo.given_name || ''} ${userInfo.family_name || ''}`.trim(),
      firstName: userInfo.given_name,
      lastName: userInfo.family_name,
      picture: userInfo.picture,
      provider: 'google',
    };
  } catch (error) {
    console.error('Error fetching Google user info:', error);
    throw error;
  }
}

/**
 * Lấy thông tin user từ Facebook
 */
async function getFacebookUserInfo(accessToken: string): Promise<SocialUserProfile> {
  try {
    const fields = 'id,name,email,first_name,last_name,picture.type(large)';
    const response = await fetch(
      `${FACEBOOK_DISCOVERY.userInfoEndpoint}?fields=${fields}&access_token=${accessToken}`
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch Facebook user info: ${response.status} ${errorText}`);
    }

    const userInfo = await response.json();

    // Validate required fields
    if (!userInfo.id || !userInfo.email) {
      throw new Error('Invalid user info from Facebook: missing required fields');
    }

    return {
      id: userInfo.id,
      email: userInfo.email,
      name: userInfo.name || `${userInfo.first_name || ''} ${userInfo.last_name || ''}`.trim(),
      firstName: userInfo.first_name,
      lastName: userInfo.last_name,
      picture: userInfo.picture?.data?.url,
      provider: 'facebook',
    };
  } catch (error) {
    console.error('Error fetching Facebook user info:', error);
    throw error;
  }
}

/**
 * Xử lý authentication với backend
 */
async function authenticateWithBackend(
  provider: 'google' | 'facebook',
  userProfile: SocialUserProfile
): Promise<{ accessToken: string; refreshToken: string; user: any }> {
  try {
    const response = await api.post('/auth/social-login', {
      provider: provider.toUpperCase(),
      profile: userProfile,
    });

    return response.data;
  } catch (error: any) {
    console.error('Backend authentication error:', error);
    throw new Error(error.response?.data?.message || 'Authentication failed');
  }
}

/**
 * Đăng nhập bằng Google
 */
export async function signInWithGoogle(): Promise<SocialAuthResult> {
  try {
    // Validate client ID
    if (!GOOGLE_CONFIG.clientId) {
      return {
        success: false,
        error: 'Google OAuth not configured',
      };
    }

    // Tạo code verifier và challenge cho PKCE
    const codeVerifier = generateRandomString(128);
    const codeChallenge = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      codeVerifier,
      { encoding: Crypto.CryptoEncoding.BASE64 }
    );

    const redirectUri = makeRedirectUri('google');

    // Tạo auth request
    const request = new AuthSession.AuthRequest({
      clientId: GOOGLE_CONFIG.clientId,
      scopes: GOOGLE_CONFIG.scopes,
      redirectUri,
      responseType: AuthSession.ResponseType.Code,
      codeChallenge,
      codeChallengeMethod: AuthSession.CodeChallengeMethod.S256,
      extraParams: GOOGLE_CONFIG.customParameters,
    });

    // Thực hiện authentication
    const result = await request.promptAsync(GOOGLE_DISCOVERY);

    if (result.type !== 'success') {
      return {
        success: false,
        error: result.type === 'cancel' ? 'User cancelled' : 'Authentication failed',
      };
    }

    // Exchange code for token
    const tokenResult = await AuthSession.exchangeCodeAsync(
      {
        clientId: GOOGLE_CONFIG.clientId,
        code: result.params.code,
        redirectUri,
        extraParams: {
          code_verifier: codeVerifier,
        },
      },
      GOOGLE_DISCOVERY
    );

    if (!tokenResult.accessToken) {
      return {
        success: false,
        error: 'Failed to get access token',
      };
    }

    // Lấy thông tin user
    const userProfile = await getGoogleUserInfo(tokenResult.accessToken);

    // Authenticate với backend
    const authResult = await authenticateWithBackend('google', userProfile);

    // Lưu tokens
    await saveTokens(authResult.accessToken, authResult.refreshToken);

    return {
      success: true,
      accessToken: authResult.accessToken,
      refreshToken: authResult.refreshToken,
      user: authResult.user,
    };
  } catch (error: any) {
    console.error('Google sign in error:', error);
    return {
      success: false,
      error: error.message || 'Google sign in failed',
    };
  }
}

/**
 * Đăng nhập bằng Facebook
 */
export async function signInWithFacebook(): Promise<SocialAuthResult> {
  try {
    // Validate client ID
    if (!FACEBOOK_CONFIG.clientId) {
      return {
        success: false,
        error: 'Facebook OAuth not configured',
      };
    }

    const redirectUri = makeRedirectUri('facebook');

    // Tạo auth request
    const request = new AuthSession.AuthRequest({
      clientId: FACEBOOK_CONFIG.clientId,
      scopes: FACEBOOK_CONFIG.scopes,
      redirectUri,
      responseType: AuthSession.ResponseType.Code,
      extraParams: FACEBOOK_CONFIG.customParameters,
    });

    // Thực hiện authentication
    const result = await request.promptAsync(FACEBOOK_DISCOVERY);

    if (result.type !== 'success') {
      return {
        success: false,
        error: result.type === 'cancel' ? 'User cancelled' : 'Authentication failed',
      };
    }

    // Exchange code for token
    const tokenResult = await AuthSession.exchangeCodeAsync(
      {
        clientId: FACEBOOK_CONFIG.clientId,
        code: result.params.code,
        redirectUri,
      },
      FACEBOOK_DISCOVERY
    );

    if (!tokenResult.accessToken) {
      return {
        success: false,
        error: 'Failed to get access token',
      };
    }

    // Lấy thông tin user
    const userProfile = await getFacebookUserInfo(tokenResult.accessToken);

    // Authenticate với backend
    const authResult = await authenticateWithBackend('facebook', userProfile);

    // Lưu tokens
    await saveTokens(authResult.accessToken, authResult.refreshToken);

    return {
      success: true,
      accessToken: authResult.accessToken,
      refreshToken: authResult.refreshToken,
      user: authResult.user,
    };
  } catch (error: any) {
    console.error('Facebook sign in error:', error);
    return {
      success: false,
      error: error.message || 'Facebook sign in failed',
    };
  }
}

/**
 * Đăng ký bằng Google
 */
export async function signUpWithGoogle(): Promise<SocialAuthResult> {
  // Sử dụng cùng logic với sign in vì backend sẽ tự động tạo account nếu chưa tồn tại
  return signInWithGoogle();
}

/**
 * Đăng ký bằng Facebook
 */
export async function signUpWithFacebook(): Promise<SocialAuthResult> {
  // Sử dụng cùng logic với sign in vì backend sẽ tự động tạo account nếu chưa tồn tại
  return signInWithFacebook();
}
