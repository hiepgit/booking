import { api } from '../lib/apiClient';

// Types matching backend exactly
export type Gender = 'MALE' | 'FEMALE' | 'OTHER';
export type UserRole = 'PATIENT' | 'DOCTOR' | 'ADMIN';

export interface UserProfile {
  id: string;
  email: string;
  phone?: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  avatar?: string;
  dateOfBirth?: string; // ISO date string
  gender?: Gender;
  address?: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
  patient?: {
    id: string;
    bloodType?: string;
    allergies?: string;
    emergencyContact?: string;
    insuranceNumber?: string;
  };
  doctor?: {
    id: string;
    licenseNumber: string;
    specialtyId: string;
    experience: number;
    biography?: string;
    consultationFee: number;
    averageRating: number;
    totalReviews: number;
    isAvailable: boolean;
    specialty?: {
      id: string;
      name: string;
      description?: string;
      icon?: string;
    };
  };
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string; // ISO date string
  gender?: Gender;
  address?: string;
  phone?: string;
}

export interface UpdatePatientProfileRequest {
  bloodType?: string;
  allergies?: string;
  emergencyContact?: string;
  insuranceNumber?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ProfileCompletionStatus {
  isComplete: boolean;
  completionPercentage: number;
  missingFields: string[];
}

export interface MeError {
  message: string;
  code?: string;
  details?: any;
}

/**
 * Get current user profile
 */
export async function getUserProfile(): Promise<{
  success: boolean;
  data?: UserProfile;
  error?: MeError;
}> {
  try {
    console.log('👤 Fetching user profile');
    
    const response = await api.get('/me');
    
    if (response.status === 200) {
      console.log('✅ User profile fetched successfully');
      return {
        success: true,
        data: response.data
      };
    } else {
      console.log('❌ Failed to fetch user profile - invalid response');
      return {
        success: false,
        error: { message: 'Invalid response from server' }
      };
    }
  } catch (error: any) {
    console.error('❌ Get user profile error:', error);
    
    if (error.response) {
      const errorData = error.response.data?.error || {};
      return {
        success: false,
        error: {
          message: errorData.message || 'Failed to fetch user profile',
          code: errorData.code,
          details: errorData.details
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
 * Update user profile
 */
export async function updateUserProfile(data: UpdateProfileRequest): Promise<{
  success: boolean;
  data?: Partial<UserProfile>;
  error?: MeError;
}> {
  try {
    console.log('👤 Updating user profile:', data);
    
    const response = await api.put('/me', data);
    
    if (response.status === 200) {
      console.log('✅ User profile updated successfully');
      return {
        success: true,
        data: response.data
      };
    } else {
      console.log('❌ Failed to update user profile - invalid response');
      return {
        success: false,
        error: { message: 'Invalid response from server' }
      };
    }
  } catch (error: any) {
    console.error('❌ Update user profile error:', error);
    
    if (error.response) {
      const errorData = error.response.data?.error || {};
      return {
        success: false,
        error: {
          message: errorData.message || 'Failed to update user profile',
          code: errorData.code,
          details: errorData.details
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
 * Update patient-specific profile data
 */
export async function updatePatientProfile(data: UpdatePatientProfileRequest): Promise<{
  success: boolean;
  data?: UserProfile;
  error?: MeError;
}> {
  try {
    console.log('🏥 Updating patient profile:', data);
    
    const response = await api.put('/me/patient', data);
    
    if (response.status === 200) {
      console.log('✅ Patient profile updated successfully');
      return {
        success: true,
        data: response.data
      };
    } else {
      console.log('❌ Failed to update patient profile - invalid response');
      return {
        success: false,
        error: { message: 'Invalid response from server' }
      };
    }
  } catch (error: any) {
    console.error('❌ Update patient profile error:', error);
    
    if (error.response) {
      const errorData = error.response.data?.error || {};
      return {
        success: false,
        error: {
          message: errorData.message || 'Failed to update patient profile',
          code: errorData.code,
          details: errorData.details
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
 * Get profile completion status
 */
export async function getProfileCompletion(): Promise<{
  success: boolean;
  data?: ProfileCompletionStatus;
  error?: MeError;
}> {
  try {
    console.log('📊 Fetching profile completion status');
    
    const response = await api.get('/me/completion');
    
    if (response.status === 200) {
      console.log('✅ Profile completion status fetched successfully');
      return {
        success: true,
        data: response.data
      };
    } else {
      console.log('❌ Failed to fetch profile completion - invalid response');
      return {
        success: false,
        error: { message: 'Invalid response from server' }
      };
    }
  } catch (error: any) {
    console.error('❌ Get profile completion error:', error);
    
    if (error.response) {
      const errorData = error.response.data?.error || {};
      return {
        success: false,
        error: {
          message: errorData.message || 'Failed to fetch profile completion',
          code: errorData.code,
          details: errorData.details
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
 * Change user password
 */
export async function changePassword(data: ChangePasswordRequest): Promise<{
  success: boolean;
  data?: { message: string };
  error?: MeError;
}> {
  try {
    console.log('🔒 Changing user password');

    const response = await api.post('/me/change-password', data);

    if (response.status === 200) {
      console.log('✅ Password changed successfully');
      return {
        success: true,
        data: response.data
      };
    } else {
      console.log('❌ Failed to change password - invalid response');
      return {
        success: false,
        error: { message: 'Invalid response from server' }
      };
    }
  } catch (error: any) {
    console.error('❌ Change password error:', error);

    if (error.response) {
      const errorData = error.response.data?.error || {};
      return {
        success: false,
        error: {
          message: errorData.message || 'Failed to change password',
          code: errorData.code,
          details: errorData.details
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
 * Upload user avatar
 */
export async function uploadAvatar(imageUri: string): Promise<{
  success: boolean;
  data?: { avatarUrl: string };
  error?: MeError;
}> {
  try {
    console.log('📷 Uploading user avatar');

    // Create FormData for file upload
    const formData = new FormData();
    formData.append('avatar', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'avatar.jpg',
    } as any);

    const response = await api.post('/me/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (response.status === 200) {
      console.log('✅ Avatar uploaded successfully');
      return {
        success: true,
        data: response.data
      };
    } else {
      console.log('❌ Failed to upload avatar - invalid response');
      return {
        success: false,
        error: { message: 'Invalid response from server' }
      };
    }
  } catch (error: any) {
    console.error('❌ Upload avatar error:', error);

    if (error.response) {
      const errorData = error.response.data?.error || {};
      return {
        success: false,
        error: {
          message: errorData.message || 'Failed to upload avatar',
          code: errorData.code,
          details: errorData.details
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
 * Delete user account
 */
export async function deleteAccount(): Promise<{
  success: boolean;
  data?: { message: string };
  error?: MeError;
}> {
  try {
    console.log('🗑️ Deleting user account');

    const response = await api.delete('/me');

    if (response.status === 200) {
      console.log('✅ Account deleted successfully');
      return {
        success: true,
        data: response.data
      };
    } else {
      console.log('❌ Failed to delete account - invalid response');
      return {
        success: false,
        error: { message: 'Invalid response from server' }
      };
    }
  } catch (error: any) {
    console.error('❌ Delete account error:', error);

    if (error.response) {
      const errorData = error.response.data?.error || {};
      return {
        success: false,
        error: {
          message: errorData.message || 'Failed to delete account',
          code: errorData.code,
          details: errorData.details
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
