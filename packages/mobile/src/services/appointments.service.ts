import { api } from '../lib/apiClient';

// Types for appointments
export type AppointmentStatus = 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
export type AppointmentType = 'ONLINE' | 'OFFLINE';

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  clinicId?: string;
  scheduleId?: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  type: AppointmentType;
  status: AppointmentStatus;
  symptoms?: string;
  notes?: string;
  meetingUrl?: string;
  meetingId?: string;
  createdAt: string;
  updatedAt: string;
  patient: {
    id: string;
    user: {
      id: string;
      firstName: string;
      lastName: string;
      avatar?: string;
    };
  };
  doctor: {
    id: string;
    user: {
      id: string;
      firstName: string;
      lastName: string;
      avatar?: string;
    };
    specialty: {
      id: string;
      name: string;
      icon?: string;
    };
  };
  clinic?: {
    id: string;
    name: string;
    address: string;
    phone: string;
  };
}

export interface CreateAppointmentRequest {
  doctorId: string;
  clinicId?: string;
  appointmentDate: string; // ISO datetime string (YYYY-MM-DDTHH:mm:ss.sssZ)
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  type?: AppointmentType; // Default to 'OFFLINE' if not provided
  symptoms?: string;
  notes?: string;
}

export interface UpdateAppointmentRequest {
  status?: AppointmentStatus;
  symptoms?: string;
  notes?: string;
  meetingUrl?: string;
  meetingId?: string;
}

export interface AppointmentFilters {
  status?: AppointmentStatus;
  type?: AppointmentType;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

export interface AppointmentsResponse {
  data: Appointment[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AvailableSlot {
  startTime: string;
  endTime: string;
  clinicId: string;
  clinicName: string;
}

export interface AvailableSlotsResponse {
  data: AvailableSlot[];
  meta: {
    doctorId: string;
    date: string;
    totalSlots: number;
  };
}

export interface AppointmentsError {
  message: string;
  code?: string;
  details?: any;
}

/**
 * Create a new appointment
 */
export async function createAppointment(data: CreateAppointmentRequest): Promise<{
  success: boolean;
  data?: Appointment;
  error?: AppointmentsError;
}> {
  try {
    console.log('📅 Creating appointment:', data);

    // Ensure appointmentDate is in ISO datetime format
    const requestData = {
      ...data,
      type: data.type || 'OFFLINE', // Set default type to match backend
      appointmentDate: data.appointmentDate.includes('T')
        ? data.appointmentDate
        : `${data.appointmentDate}T00:00:00.000Z` // Convert date to datetime if needed
    };

    const response = await api.post('/appointments', requestData);
    
    if (response.status === 201) {
      console.log('✅ Appointment created successfully');
      return {
        success: true,
        data: response.data
      };
    } else {
      console.log('❌ Failed to create appointment - invalid response');
      return {
        success: false,
        error: { message: 'Invalid response from server' }
      };
    }
  } catch (error: any) {
    console.error('❌ Create appointment error:', error);
    
    if (error.response) {
      const errorData = error.response.data?.error || {};
      return {
        success: false,
        error: {
          message: errorData.message || 'Failed to create appointment',
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
 * Get patient's appointments
 */
export async function getMyAppointments(params?: AppointmentFilters): Promise<{
  success: boolean;
  data?: AppointmentsResponse;
  error?: AppointmentsError;
}> {
  try {
    console.log('📅 Fetching my appointments with params:', params);
    
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.type) queryParams.append('type', params.type);
    if (params?.dateFrom) queryParams.append('dateFrom', params.dateFrom);
    if (params?.dateTo) queryParams.append('dateTo', params.dateTo);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const url = `/appointments/patient/my${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await api.get(url);
    
    if (response.status === 200) {
      console.log('✅ My appointments fetched successfully:', response.data.data.length, 'appointments');
      return {
        success: true,
        data: response.data
      };
    } else {
      console.log('❌ Failed to fetch my appointments - invalid response');
      return {
        success: false,
        error: { message: 'Invalid response from server' }
      };
    }
  } catch (error: any) {
    console.error('❌ My appointments fetch error:', error);
    
    if (error.response) {
      const errorData = error.response.data?.error || {};
      return {
        success: false,
        error: {
          message: errorData.message || 'Failed to fetch appointments',
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
 * Update an appointment
 */
export async function updateAppointment(id: string, data: UpdateAppointmentRequest): Promise<{
  success: boolean;
  data?: Appointment;
  error?: AppointmentsError;
}> {
  try {
    console.log('📅 Updating appointment:', id, data);
    
    const response = await api.put(`/appointments/${id}`, data);
    
    if (response.status === 200) {
      console.log('✅ Appointment updated successfully');
      return {
        success: true,
        data: response.data
      };
    } else {
      console.log('❌ Failed to update appointment - invalid response');
      return {
        success: false,
        error: { message: 'Invalid response from server' }
      };
    }
  } catch (error: any) {
    console.error('❌ Update appointment error:', error);
    
    if (error.response) {
      const errorData = error.response.data?.error || {};
      return {
        success: false,
        error: {
          message: errorData.message || 'Failed to update appointment',
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
 * Cancel an appointment
 */
export async function cancelAppointment(id: string): Promise<{
  success: boolean;
  data?: Appointment;
  error?: AppointmentsError;
}> {
  try {
    console.log('📅 Cancelling appointment:', id);

    const response = await api.put(`/appointments/${id}`, { status: 'CANCELLED' });

    if (response.status === 200) {
      console.log('✅ Appointment cancelled successfully');
      return {
        success: true,
        data: response.data
      };
    } else {
      console.log('❌ Failed to cancel appointment - invalid response');
      return {
        success: false,
        error: { message: 'Invalid response from server' }
      };
    }
  } catch (error: any) {
    console.error('❌ Cancel appointment error:', error);

    if (error.response) {
      const errorData = error.response.data?.error || {};
      return {
        success: false,
        error: {
          message: errorData.message || 'Failed to cancel appointment',
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
 * Get available time slots for a doctor on a specific date
 */
export async function getAvailableSlots(doctorId: string, date: string): Promise<{
  success: boolean;
  data?: AvailableSlotsResponse;
  error?: AppointmentsError;
}> {
  try {
    console.log('📅 Fetching available slots for doctor:', doctorId, 'on date:', date);

    // Ensure date is in ISO datetime format for backend validation
    const isoDate = date.includes('T') ? date : `${date}T00:00:00.000Z`;

    const queryParams = new URLSearchParams();
    queryParams.append('doctorId', doctorId);
    queryParams.append('date', isoDate);

    const response = await api.get(`/appointments/available-slots?${queryParams.toString()}`);

    if (response.status === 200) {
      console.log('✅ Available slots fetched successfully:', response.data.data.length, 'slots');
      return {
        success: true,
        data: response.data
      };
    } else {
      console.log('❌ Failed to fetch available slots - invalid response');
      return {
        success: false,
        error: { message: 'Invalid response from server' }
      };
    }
  } catch (error: any) {
    console.error('❌ Available slots fetch error:', error);

    if (error.response) {
      const errorData = error.response.data?.error || {};
      return {
        success: false,
        error: {
          message: errorData.message || 'Failed to fetch available slots',
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
 * Get appointment by ID
 */
export async function getAppointmentById(id: string): Promise<{
  success: boolean;
  data?: Appointment;
  error?: AppointmentsError;
}> {
  try {
    console.log('📅 Fetching appointment by ID:', id);

    const response = await api.get(`/appointments/${id}`);

    if (response.status === 200) {
      console.log('✅ Appointment fetched successfully');
      return {
        success: true,
        data: response.data
      };
    } else {
      console.log('❌ Failed to fetch appointment - invalid response');
      return {
        success: false,
        error: { message: 'Invalid response from server' }
      };
    }
  } catch (error: any) {
    console.error('❌ Appointment fetch error:', error);

    if (error.response) {
      const errorData = error.response.data?.error || {};
      return {
        success: false,
        error: {
          message: errorData.message || 'Failed to fetch appointment',
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
