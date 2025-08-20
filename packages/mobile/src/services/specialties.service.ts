import { api } from '../lib/apiClient';

// Types for specialties
export interface Specialty {
  id: string;
  name: string;
  description: string;
  icon: string;
  doctorCount: number;
}

export interface SpecialtiesError {
  message: string;
  code?: string;
  details?: any;
}

/**
 * Fetch danh sách specialties
 */
export async function getSpecialties(): Promise<{
  success: boolean;
  data?: Specialty[];
  error?: SpecialtiesError;
}> {
  try {
    console.log('🏥 Fetching specialties');
    
    const response = await api.get('/specialties');
    
    if (response.status === 200) {
      console.log('✅ Specialties fetched successfully:', response.data.length, 'specialties');
      return {
        success: true,
        data: response.data
      };
    } else {
      console.log('❌ Failed to fetch specialties - invalid response');
      return {
        success: false,
        error: { message: 'Invalid response from server' }
      };
    }
  } catch (error: any) {
    console.error('❌ Specialties fetch error:', error);
    
    if (error.response) {
      const errorData = error.response.data?.error || {};
      return {
        success: false,
        error: {
          message: errorData.message || 'Failed to fetch specialties',
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
 * Fetch specialty details by ID
 */
export async function getSpecialtyById(specialtyId: string): Promise<{
  success: boolean;
  data?: Specialty;
  error?: SpecialtiesError;
}> {
  try {
    console.log('🏥 Fetching specialty details for ID:', specialtyId);
    
    const response = await api.get(`/specialties/${specialtyId}`);
    
    if (response.status === 200) {
      console.log('✅ Specialty details fetched successfully');
      return {
        success: true,
        data: response.data
      };
    } else {
      console.log('❌ Failed to fetch specialty details - invalid response');
      return {
        success: false,
        error: { message: 'Invalid response from server' }
      };
    }
  } catch (error: any) {
    console.error('❌ Specialty details fetch error:', error);
    
    if (error.response) {
      const errorData = error.response.data?.error || {};
      return {
        success: false,
        error: {
          message: errorData.message || 'Failed to fetch specialty details',
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
