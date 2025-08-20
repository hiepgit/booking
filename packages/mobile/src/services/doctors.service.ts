import { api } from '../lib/apiClient';

// Types for doctors
export interface Doctor {
  id: string;
  userId: string;
  licenseNumber: string;
  specialtyId: string;
  experience: number;
  biography: string;
  consultationFee: string;
  averageRating: number;
  totalReviews: number;
  isAvailable: boolean;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  specialty: {
    id: string;
    name: string;
    icon: string;
  };
  clinicDoctors: Array<{
    id: string;
    clinicId: string;
    doctorId: string;
    workingDays: string[];
    startTime: string;
    endTime: string;
    clinic: {
      id: string;
      name: string;
      address: string;
      latitude: number;
      longitude: number;
    };
  }>;
}

export interface DoctorsResponse {
  data: Doctor[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface DoctorsError {
  message: string;
  code?: string;
  details?: any;
}

/**
 * Fetch danh sách doctors
 */
export async function getDoctors(params?: {
  page?: number;
  limit?: number;
  specialtyId?: string;
  search?: string;
}): Promise<{
  success: boolean;
  data?: DoctorsResponse;
  error?: DoctorsError;
}> {
  try {
    console.log('👨‍⚕️ Fetching doctors with params:', params);
    
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.specialtyId) queryParams.append('specialtyId', params.specialtyId);
    if (params?.search) queryParams.append('search', params.search);

    const url = `/doctors${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await api.get(url);
    
    if (response.status === 200) {
      console.log('✅ Doctors fetched successfully:', response.data.data.length, 'doctors');
      return {
        success: true,
        data: response.data
      };
    } else {
      console.log('❌ Failed to fetch doctors - invalid response');
      return {
        success: false,
        error: { message: 'Invalid response from server' }
      };
    }
  } catch (error: any) {
    console.error('❌ Doctors fetch error:', error);
    
    if (error.response) {
      const errorData = error.response.data?.error || {};
      return {
        success: false,
        error: {
          message: errorData.message || 'Failed to fetch doctors',
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
 * Fetch doctor details by ID
 */
export async function getDoctorById(doctorId: string): Promise<{
  success: boolean;
  data?: Doctor;
  error?: DoctorsError;
}> {
  try {
    console.log('👨‍⚕️ Fetching doctor details for ID:', doctorId);
    
    const response = await api.get(`/doctors/${doctorId}`);
    
    if (response.status === 200) {
      console.log('✅ Doctor details fetched successfully');
      return {
        success: true,
        data: response.data
      };
    } else {
      console.log('❌ Failed to fetch doctor details - invalid response');
      return {
        success: false,
        error: { message: 'Invalid response from server' }
      };
    }
  } catch (error: any) {
    console.error('❌ Doctor details fetch error:', error);
    
    if (error.response) {
      const errorData = error.response.data?.error || {};
      return {
        success: false,
        error: {
          message: errorData.message || 'Failed to fetch doctor details',
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
 * Search doctors
 */
export async function searchDoctors(query: string, params?: {
  page?: number;
  limit?: number;
  specialtyId?: string;
}): Promise<{
  success: boolean;
  data?: DoctorsResponse;
  error?: DoctorsError;
}> {
  try {
    console.log('🔍 Searching doctors with query:', query);
    
    const queryParams = new URLSearchParams();
    queryParams.append('search', query);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.specialtyId) queryParams.append('specialtyId', params.specialtyId);

    const response = await api.get(`/search/doctors?${queryParams.toString()}`);
    
    if (response.status === 200) {
      console.log('✅ Doctor search completed:', response.data.data.length, 'results');
      return {
        success: true,
        data: response.data
      };
    } else {
      console.log('❌ Failed to search doctors - invalid response');
      return {
        success: false,
        error: { message: 'Invalid response from server' }
      };
    }
  } catch (error: any) {
    console.error('❌ Doctor search error:', error);
    
    if (error.response) {
      const errorData = error.response.data?.error || {};
      return {
        success: false,
        error: {
          message: errorData.message || 'Failed to search doctors',
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
