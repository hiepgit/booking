import { api } from '../lib/apiClient';

// Types matching backend exactly
export interface Clinic {
  id: string;
  name: string;
  address: string;
  phone: string;
  email?: string;
  latitude?: number;
  longitude?: number;
  openTime: string; // HH:mm format
  closeTime: string; // HH:mm format
  images: string[]; // Array of image URLs
  description?: string;
  createdAt: string;
  updatedAt: string;
  // For nearby search results
  distance?: number; // Distance in kilometers
}

export interface ClinicWithDoctors extends Clinic {
  clinicDoctors: Array<{
    id: string;
    clinicId: string;
    doctorId: string;
    workingDays: string[]; // ['MONDAY', 'TUESDAY', ...]
    startTime: string; // HH:mm format
    endTime: string; // HH:mm format
    doctor: {
      id: string;
      userId: string;
      licenseNumber: string;
      specialtyId: string;
      experience: number;
      biography?: string;
      consultationFee: number;
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
        description?: string;
        icon?: string;
      };
    };
  }>;
}

export interface ClinicsResponse {
  data: Clinic[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface NearbyClinicsParams {
  lat: number; // Latitude
  lng: number; // Longitude
  radius?: number; // Radius in km (default: 5, max: 50)
  page?: number;
  limit?: number;
}

export interface SearchClinicsParams {
  city?: string;
  district?: string;
  name?: string;
  page?: number;
  limit?: number;
}

export interface ClinicsError {
  message: string;
  code?: string;
  details?: any;
}

/**
 * Get all clinics with pagination
 */
export async function getClinics(params?: {
  page?: number;
  limit?: number;
}): Promise<{
  success: boolean;
  data?: ClinicsResponse;
  error?: ClinicsError;
}> {
  try {
    console.log('🏥 Fetching clinics with params:', params);
    
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const url = `/clinics${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await api.get(url);
    
    if (response.status === 200) {
      console.log('✅ Clinics fetched successfully:', response.data.data.length, 'clinics found');
      return {
        success: true,
        data: response.data
      };
    } else {
      console.log('❌ Failed to fetch clinics - invalid response');
      return {
        success: false,
        error: { message: 'Invalid response from server' }
      };
    }
  } catch (error: any) {
    console.error('❌ Get clinics error:', error);
    
    if (error.response) {
      const errorData = error.response.data?.error || {};
      return {
        success: false,
        error: {
          message: errorData.message || 'Failed to fetch clinics',
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
 * Get clinic by ID
 */
export async function getClinicById(clinicId: string): Promise<{
  success: boolean;
  data?: Clinic;
  error?: ClinicsError;
}> {
  try {
    console.log('🏥 Fetching clinic by ID:', clinicId);
    
    const response = await api.get(`/clinics/${clinicId}`);
    
    if (response.status === 200) {
      console.log('✅ Clinic fetched successfully:', response.data.data.name);
      return {
        success: true,
        data: response.data.data
      };
    } else {
      console.log('❌ Failed to fetch clinic - invalid response');
      return {
        success: false,
        error: { message: 'Invalid response from server' }
      };
    }
  } catch (error: any) {
    console.error('❌ Get clinic by ID error:', error);
    
    if (error.response) {
      const errorData = error.response.data?.error || {};
      return {
        success: false,
        error: {
          message: errorData.message || 'Failed to fetch clinic',
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
 * Get nearby clinics based on location
 */
export async function getClinicsNearby(params: NearbyClinicsParams): Promise<{
  success: boolean;
  data?: ClinicsResponse;
  error?: ClinicsError;
}> {
  try {
    console.log('📍 Fetching nearby clinics with params:', params);
    
    const queryParams = new URLSearchParams();
    queryParams.append('lat', params.lat.toString());
    queryParams.append('lng', params.lng.toString());
    if (params.radius) queryParams.append('radius', params.radius.toString());
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());

    const response = await api.get(`/clinics/nearby?${queryParams.toString()}`);
    
    if (response.status === 200) {
      console.log('✅ Nearby clinics fetched successfully:', response.data.data.length, 'clinics found');
      return {
        success: true,
        data: response.data
      };
    } else {
      console.log('❌ Failed to fetch nearby clinics - invalid response');
      return {
        success: false,
        error: { message: 'Invalid response from server' }
      };
    }
  } catch (error: any) {
    console.error('❌ Get nearby clinics error:', error);
    
    if (error.response) {
      const errorData = error.response.data?.error || {};
      return {
        success: false,
        error: {
          message: errorData.message || 'Failed to fetch nearby clinics',
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
 * Search clinics with filters
 */
export async function searchClinics(params: SearchClinicsParams): Promise<{
  success: boolean;
  data?: ClinicsResponse;
  error?: ClinicsError;
}> {
  try {
    console.log('🔍 Searching clinics with params:', params);
    
    const queryParams = new URLSearchParams();
    if (params.city) queryParams.append('city', params.city);
    if (params.district) queryParams.append('district', params.district);
    if (params.name) queryParams.append('name', params.name);
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());

    const url = `/clinics/search${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await api.get(url);
    
    if (response.status === 200) {
      console.log('✅ Clinics search completed successfully:', response.data.data.length, 'clinics found');
      return {
        success: true,
        data: response.data
      };
    } else {
      console.log('❌ Failed to search clinics - invalid response');
      return {
        success: false,
        error: { message: 'Invalid response from server' }
      };
    }
  } catch (error: any) {
    console.error('❌ Search clinics error:', error);
    
    if (error.response) {
      const errorData = error.response.data?.error || {};
      return {
        success: false,
        error: {
          message: errorData.message || 'Failed to search clinics',
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
 * Get doctors at a specific clinic
 */
export async function getClinicDoctors(clinicId: string, params?: {
  page?: number;
  limit?: number;
}): Promise<{
  success: boolean;
  data?: {
    data: ClinicWithDoctors['clinicDoctors'];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
  error?: ClinicsError;
}> {
  try {
    console.log('👨‍⚕️ Fetching doctors at clinic:', clinicId);

    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const url = `/clinics/${clinicId}/doctors${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await api.get(url);

    if (response.status === 200) {
      console.log('✅ Clinic doctors fetched successfully:', response.data.data.length, 'doctors found');
      return {
        success: true,
        data: response.data
      };
    } else {
      console.log('❌ Failed to fetch clinic doctors - invalid response');
      return {
        success: false,
        error: { message: 'Invalid response from server' }
      };
    }
  } catch (error: any) {
    console.error('❌ Get clinic doctors error:', error);

    if (error.response) {
      const errorData = error.response.data?.error || {};
      return {
        success: false,
        error: {
          message: errorData.message || 'Failed to fetch clinic doctors',
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
