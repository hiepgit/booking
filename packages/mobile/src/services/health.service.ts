import { api } from '../lib/apiClient';

export interface HealthCheckResponse {
  status: string;
  timestamp: string;
  version: string;
  uptime: number;
  environment: string;
  services: {
    database: string;
    redis: string;
    memory: string;
  };
  metrics: {
    responseTime: number;
    memory: any;
    cpu: any;
  };
}

/**
 * Test kết nối với backend
 */
export async function testBackendConnection(): Promise<{
  success: boolean;
  data?: HealthCheckResponse;
  error?: string;
}> {
  try {
    console.log('Testing backend connection...');
    const response = await api.get('/health');
    
    console.log('Backend connection successful:', response.data);
    return {
      success: true,
      data: response.data
    };
  } catch (error: any) {
    console.error('Backend connection failed:', error);
    
    let errorMessage = 'Unknown error';
    if (error.code === 'NETWORK_ERROR' || error.message?.includes('Network Error')) {
      errorMessage = 'Cannot connect to backend. Make sure backend is running.';
    } else if (error.response) {
      errorMessage = `Backend error: ${error.response.status} ${error.response.statusText}`;
    } else {
      errorMessage = error.message || 'Connection failed';
    }
    
    return {
      success: false,
      error: errorMessage
    };
  }
}

/**
 * Get detailed health information
 */
export async function getDetailedHealth(): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  try {
    const response = await api.get('/health/detailed');
    return {
      success: true,
      data: response.data
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to get detailed health'
    };
  }
}
