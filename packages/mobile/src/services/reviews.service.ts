import { api } from '../lib/apiClient';

// Types for reviews
export interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  patient: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  doctor: {
    id: string;
    userId: string;
  };
}

export interface ReviewsResponse {
  data: Review[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ReviewsError {
  message: string;
  code?: string;
  details?: any;
}

/**
 * Fetch reviews for a doctor
 */
export async function getDoctorReviews(doctorId: string, params?: {
  page?: number;
  limit?: number;
}): Promise<{
  success: boolean;
  data?: ReviewsResponse;
  error?: ReviewsError;
}> {
  try {
    console.log('⭐ Fetching reviews for doctor:', doctorId);
    
    const queryParams = new URLSearchParams();
    queryParams.append('doctorId', doctorId);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const response = await api.get(`/reviews?${queryParams.toString()}`);
    
    if (response.status === 200) {
      console.log('✅ Doctor reviews fetched successfully:', response.data.data.length, 'reviews');
      return {
        success: true,
        data: response.data
      };
    } else {
      console.log('❌ Failed to fetch doctor reviews - invalid response');
      return {
        success: false,
        error: { message: 'Invalid response from server' }
      };
    }
  } catch (error: any) {
    console.error('❌ Doctor reviews fetch error:', error);
    
    if (error.response) {
      const errorData = error.response.data?.error || {};
      return {
        success: false,
        error: {
          message: errorData.message || 'Failed to fetch doctor reviews',
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
 * Create a new review for a doctor
 */
export async function createReview(doctorId: string, rating: number, comment: string): Promise<{
  success: boolean;
  data?: Review;
  error?: ReviewsError;
}> {
  try {
    console.log('⭐ Creating review for doctor:', doctorId);
    
    const response = await api.post('/reviews', {
      doctorId,
      rating,
      comment
    });
    
    if (response.status === 201) {
      console.log('✅ Review created successfully');
      return {
        success: true,
        data: response.data
      };
    } else {
      console.log('❌ Failed to create review - invalid response');
      return {
        success: false,
        error: { message: 'Invalid response from server' }
      };
    }
  } catch (error: any) {
    console.error('❌ Create review error:', error);
    
    if (error.response) {
      const errorData = error.response.data?.error || {};
      return {
        success: false,
        error: {
          message: errorData.message || 'Failed to create review',
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
 * Get all reviews (for admin/general purposes)
 */
export async function getAllReviews(params?: {
  page?: number;
  limit?: number;
}): Promise<{
  success: boolean;
  data?: ReviewsResponse;
  error?: ReviewsError;
}> {
  try {
    console.log('⭐ Fetching all reviews');
    
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const url = `/reviews${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await api.get(url);
    
    if (response.status === 200) {
      console.log('✅ All reviews fetched successfully:', response.data.data.length, 'reviews');
      return {
        success: true,
        data: response.data
      };
    } else {
      console.log('❌ Failed to fetch all reviews - invalid response');
      return {
        success: false,
        error: { message: 'Invalid response from server' }
      };
    }
  } catch (error: any) {
    console.error('❌ All reviews fetch error:', error);
    
    if (error.response) {
      const errorData = error.response.data?.error || {};
      return {
        success: false,
        error: {
          message: errorData.message || 'Failed to fetch all reviews',
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
