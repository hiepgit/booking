import { api, saveTokens, clearTokens } from '../lib/apiClient';
import { AuthLoginSchema, AuthRegisterSchema, VerifyOtpSchema } from '@healthcare/shared/schemas';
import type { z } from 'zod';

// Types từ shared schemas
type LoginRequest = z.infer<typeof AuthLoginSchema>;
type RegisterRequest = z.infer<typeof AuthRegisterSchema>;
type VerifyOtpRequest = z.infer<typeof VerifyOtpSchema>;

export interface AuthResponse {
  message: string;
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    isVerified: boolean;
    avatar?: string;
    patient?: any;
    doctor?: any;
  };
}

export interface AuthError {
  message: string;
  code?: string;
  details?: any;
}

/**
 * Đăng nhập với email và password
 */
export async function loginWithEmail(email: string, password: string): Promise<{
  success: boolean;
  data?: AuthResponse;
  error?: AuthError;
}> {
  try {
    console.log('🔐 Attempting login with email:', email);
    
    // Validate input với shared schema
    const loginData = AuthLoginSchema.parse({ email, password });
    
    const response = await api.post('/auth/login', loginData);
    
    if (response.status === 200 && response.data.accessToken) {
      console.log('✅ Login successful');
      
      // Lưu tokens vào secure storage
      await saveTokens(response.data.accessToken, response.data.refreshToken);
      
      return {
        success: true,
        data: response.data
      };
    } else {
      console.log('❌ Login failed - invalid response');
      return {
        success: false,
        error: { message: 'Invalid response from server' }
      };
    }
  } catch (error: any) {
    console.error('❌ Login error:', error);
    
    if (error.response) {
      // Server responded with error
      const errorData = error.response.data?.error || {};
      return {
        success: false,
        error: {
          message: errorData.message || 'Login failed',
          code: errorData.code,
          details: errorData.details
        }
      };
    } else if (error.name === 'ZodError') {
      // Validation error
      return {
        success: false,
        error: {
          message: 'Invalid input data',
          code: 'VALIDATION_ERROR',
          details: error.errors
        }
      };
    } else {
      // Network or other error
      return {
        success: false,
        error: {
          message: error.message || 'Network error',
          code: 'NETWORK_ERROR'
        }
      };
    }
  }
}

/**
 * Đăng ký tài khoản mới
 */
export async function registerWithEmail(
  fullName: string, 
  email: string, 
  password: string,
  role: 'PATIENT' | 'DOCTOR' = 'PATIENT'
): Promise<{
  success: boolean;
  data?: { message: string; user: any };
  error?: AuthError;
}> {
  try {
    console.log('📝 Attempting registration with email:', email);
    
    // Validate input với shared schema
    const registerData = AuthRegisterSchema.parse({ 
      fullName, 
      email, 
      password, 
      role 
    });
    
    const response = await api.post('/auth/register', registerData);
    
    if (response.status === 201 || response.status === 200) {
      console.log('✅ Registration successful');
      return {
        success: true,
        data: response.data
      };
    } else {
      console.log('❌ Registration failed - invalid response');
      return {
        success: false,
        error: { message: 'Invalid response from server' }
      };
    }
  } catch (error: any) {
    console.error('❌ Registration error:', error);
    
    if (error.response) {
      const errorData = error.response.data?.error || {};
      return {
        success: false,
        error: {
          message: errorData.message || 'Registration failed',
          code: errorData.code,
          details: errorData.details
        }
      };
    } else if (error.name === 'ZodError') {
      return {
        success: false,
        error: {
          message: 'Invalid input data',
          code: 'VALIDATION_ERROR',
          details: error.errors
        }
      };
    } else {
      return {
        success: false,
        error: {
          message: error.message || 'Network error',
          code: 'NETWORK_ERROR'
        }
      };
    }
  }
}

/**
 * Xác thực OTP
 */
export async function verifyOtp(email: string, otp: string): Promise<{
  success: boolean;
  data?: { message: string; user: any };
  error?: AuthError;
}> {
  try {
    console.log('🔢 Attempting OTP verification for:', email);
    
    // Validate input với shared schema
    const otpData = VerifyOtpSchema.parse({ email, otp });
    
    const response = await api.post('/auth/verify-otp', otpData);
    
    if (response.status === 200) {
      console.log('✅ OTP verification successful');
      return {
        success: true,
        data: response.data
      };
    } else {
      console.log('❌ OTP verification failed - invalid response');
      return {
        success: false,
        error: { message: 'Invalid response from server' }
      };
    }
  } catch (error: any) {
    console.error('❌ OTP verification error:', error);
    
    if (error.response) {
      const errorData = error.response.data?.error || {};
      return {
        success: false,
        error: {
          message: errorData.message || 'OTP verification failed',
          code: errorData.code,
          details: errorData.details
        }
      };
    } else if (error.name === 'ZodError') {
      return {
        success: false,
        error: {
          message: 'Invalid input data',
          code: 'VALIDATION_ERROR',
          details: error.errors
        }
      };
    } else {
      return {
        success: false,
        error: {
          message: error.message || 'Network error',
          code: 'NETWORK_ERROR'
        }
      };
    }
  }
}

/**
 * Đăng xuất
 */
export async function logout(): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    console.log('🚪 Logging out...');
    
    // Xóa tokens khỏi secure storage
    await clearTokens();
    
    // Có thể gọi API logout nếu backend có endpoint này
    // await api.post('/auth/logout');
    
    console.log('✅ Logout successful');
    return { success: true };
  } catch (error: any) {
    console.error('❌ Logout error:', error);
    return {
      success: false,
      error: error.message || 'Logout failed'
    };
  }
}

/**
 * Gửi lại mã OTP
 */
export async function resendOtp(email: string): Promise<{
  success: boolean;
  data?: { message: string };
  error?: AuthError;
}> {
  try {
    console.log('📧 Attempting to resend OTP for:', email);

    const response = await api.post('/auth/resend-otp', { email });

    if (response.status === 200) {
      console.log('✅ OTP resent successfully');
      return {
        success: true,
        data: response.data
      };
    } else {
      console.log('❌ Resend OTP failed - invalid response');
      return {
        success: false,
        error: { message: 'Invalid response from server' }
      };
    }
  } catch (error: any) {
    console.error('❌ Resend OTP error:', error);

    if (error.response) {
      const errorData = error.response.data?.error || {};
      return {
        success: false,
        error: {
          message: errorData.message || 'Failed to resend OTP',
          code: errorData.code,
          details: errorData.details
        }
      };
    } else if (error.name === 'ZodError') {
      return {
        success: false,
        error: {
          message: 'Invalid email format',
          code: 'VALIDATION_ERROR',
          details: error.errors
        }
      };
    } else {
      return {
        success: false,
        error: {
          message: error.message || 'Network error',
          code: 'NETWORK_ERROR'
        }
      };
    }
  }
}
