// Patient Appointments API service
import { apiRequest } from './base';
import { PatientAppointment } from '../types';

// Stub data
const stubPatientAppointments: PatientAppointment[] = [
  {
    id: 1,
    patientAppointmentId: 'PA-2025-001',
    patientId: 'PAT-2025-0001',
    doctorId: '1',
    appointmentDate: '2025-01-15',
    appointmentTime: '10:00',
    tokenNo: 'HP-001',
    appointmentStatus: 'Waiting',
    consultationCharge: 500,
    diagnosis: '',
    followUpDetails: '',
    prescriptionsUrl: '',
    toBeAdmitted: false,
    referToAnotherDoctor: false,
    transferToIPDOTICU: false,
  },
  {
    id: 2,
    patientAppointmentId: 'PA-2025-002',
    patientId: 'PAT-2025-0002',
    doctorId: '2',
    appointmentDate: '2025-01-15',
    appointmentTime: '10:30',
    tokenNo: 'GP-001',
    appointmentStatus: 'Consulting',
    consultationCharge: 300,
    diagnosis: 'Common cold',
    followUpDetails: 'Follow up in 3 days',
    prescriptionsUrl: 'https://prescriptions.example.com/PA-2025-002',
    toBeAdmitted: false,
    referToAnotherDoctor: false,
    transferToIPDOTICU: false,
  },
  {
    id: 3,
    patientAppointmentId: 'PA-2025-003',
    patientId: 'PAT-2025-0003',
    doctorId: '1',
    appointmentDate: '2025-01-15',
    appointmentTime: '11:00',
    tokenNo: 'HP-002',
    appointmentStatus: 'Completed',
    consultationCharge: 500,
    diagnosis: 'Hypertension',
    followUpDetails: 'Follow up in 1 week',
    prescriptionsUrl: 'https://prescriptions.example.com/PA-2025-003',
    toBeAdmitted: true,
    referToAnotherDoctor: false,
    transferToIPDOTICU: false,
  },
];

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Generate Patient Appointment ID in format PA-YYYY-XXX
function generatePatientAppointmentId(): string {
  const year = new Date().getFullYear();
  const count = stubPatientAppointments.length + 1;
  return `PA-${year}-${count.toString().padStart(3, '0')}`;
}

// Generate Token No in format DoctorName-XXX (e.g., HP-001, GP-001)
function generateTokenNo(doctorName: string): string {
  // Extract first letter of first name and first letter of last name
  const nameParts = doctorName.trim().split(/\s+/);
  let prefix = '';
  if (nameParts.length >= 2) {
    // If doctor has first and last name, use first letter of each
    prefix = (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase();
  } else if (nameParts.length === 1) {
    // If only one name, use first two letters
    prefix = nameParts[0].substring(0, 2).toUpperCase();
  } else {
    // Fallback
    prefix = 'DR';
  }
  
  // Find existing tokens with the same prefix
  const existingTokens = stubPatientAppointments
    .filter(apt => apt.tokenNo.startsWith(prefix + '-'))
    .map(apt => {
      const parts = apt.tokenNo.split('-');
      if (parts.length >= 2) {
        const num = parseInt(parts[parts.length - 1]);
        return isNaN(num) ? 0 : num;
      }
      return 0;
    });
  
  const nextNum = existingTokens.length > 0 ? Math.max(...existingTokens) + 1 : 1;
  return `${prefix}-${nextNum.toString().padStart(3, '0')}`;
}

// Backend request DTO (PascalCase) - matches API specification
export interface CreatePatientAppointmentRequestDto {
  PatientId: string; // UUID (required)
  DoctorId: number; // (required)
  AppointmentDate: string; // YYYY-MM-DD format (required)
  AppointmentTime: string; // HH:MM or HH:MM:SS format (required)
  AppointmentStatus?: string; // "Waiting" | "Consulting" | "Completed", defaults to "Waiting"
  ConsultationCharge?: number;
  Diagnosis?: string;
  FollowUpDetails?: string;
  PrescriptionsUrl?: string;
  ToBeAdmitted?: string; // "Yes" | "No", defaults to "No"
  ReferToAnotherDoctor?: string; // "Yes" | "No", defaults to "No"
  ReferredDoctorId?: number; // Required if ReferToAnotherDoctor is "Yes"
  TransferToIPDOTICU?: string; // "Yes" | "No", defaults to "No"
  TransferTo?: string; // "IPD Room Admission" | "ICU" | "OT"
  TransferDetails?: string;
  BillId?: number;
  Status?: string; // "Active" | "InActive", defaults to "Active"
  CreatedBy?: number;
}

// Backend response DTO (PascalCase)
interface CreatePatientAppointmentResponseDto {
  PatientAppointmentId: number;
  PatientId: string; // UUID
  DoctorId: number;
  AppointmentDate: Date | string;
  AppointmentTime: string;
  TokenNo: string; // Auto-generated (T-0001, T-0002, etc.)
  AppointmentStatus: string;
  ConsultationCharge: number | null;
  Diagnosis: string | null;
  FollowUpDetails: string | null;
  PrescriptionsUrl: string | null;
  ToBeAdmitted: string;
  ReferToAnotherDoctor: string;
  ReferredDoctorId: number | null;
  ReferredDoctorName: string | null;
  TransferToIPDOTICU: string;
  TransferTo: string | null;
  TransferDetails: string | null;
  BillId: number | null;
  BillNo: string | null;
  Status: string;
  CreatedBy: number | null;
  CreatedDate: Date | string;
  PatientName: string | null;
  PatientNo: string | null;
  DoctorName: string | null;
  CreatedByName: string | null;
}

// API response wrapper for create
interface ApiResponse {
  success: boolean;
  message: string;
  data: CreatePatientAppointmentResponseDto;
}

// API response wrapper for getAll
interface GetAllPatientAppointmentsResponse {
  success: boolean;
  count: number;
  data: CreatePatientAppointmentResponseDto[];
}

// Query parameters for getAll
export interface GetAllPatientAppointmentsParams {
  status?: string; // "Active" | "InActive"
  appointmentStatus?: string; // "Waiting" | "Consulting" | "Completed"
  patientId?: string; // UUID
  doctorId?: number;
  appointmentDate?: string; // YYYY-MM-DD format
}

// Frontend DTO (camelCase) - for backward compatibility
export interface CreatePatientAppointmentDto {
  patientId: string;
  doctorId: string;
  appointmentDate: string;
  appointmentTime: string;
  appointmentStatus?: 'Waiting' | 'Consulting' | 'Completed';
  consultationCharge: number;
  diagnosis?: string;
  followUpDetails?: string;
  prescriptionsUrl?: string;
  toBeAdmitted?: boolean;
  referToAnotherDoctor?: boolean;
  referredDoctorId?: string;
  transferToIPDOTICU?: boolean;
  transferTo?: 'IPD Room Admission' | 'ICU' | 'OT';
  transferDetails?: string;
  billId?: string;
}

export interface UpdatePatientAppointmentDto extends Partial<CreatePatientAppointmentDto> {
  id: number;
}

// Map backend response (PascalCase) to frontend PatientAppointment (camelCase)
function mapPatientAppointmentFromBackend(backendData: CreatePatientAppointmentResponseDto): PatientAppointment {
  return {
    id: backendData.PatientAppointmentId,
    patientAppointmentId: `PA-${backendData.PatientAppointmentId}`, // Format as string ID
    patientId: backendData.PatientId,
    doctorId: backendData.DoctorId.toString(), // Convert number to string
    appointmentDate: typeof backendData.AppointmentDate === 'string' 
      ? backendData.AppointmentDate.split('T')[0] 
      : new Date(backendData.AppointmentDate).toISOString().split('T')[0],
    appointmentTime: backendData.AppointmentTime,
    tokenNo: backendData.TokenNo,
    appointmentStatus: backendData.AppointmentStatus as 'Waiting' | 'Consulting' | 'Completed',
    consultationCharge: backendData.ConsultationCharge || 0,
    diagnosis: backendData.Diagnosis || undefined,
    followUpDetails: backendData.FollowUpDetails || undefined,
    prescriptionsUrl: backendData.PrescriptionsUrl || undefined,
    toBeAdmitted: backendData.ToBeAdmitted === 'Yes',
    referToAnotherDoctor: backendData.ReferToAnotherDoctor === 'Yes',
    referredDoctorId: backendData.ReferredDoctorId ? backendData.ReferredDoctorId.toString() : undefined,
    transferToIPDOTICU: backendData.TransferToIPDOTICU === 'Yes',
    transferTo: backendData.TransferTo as 'IPD Room Admission' | 'ICU' | 'OT' | undefined,
    transferDetails: backendData.TransferDetails || undefined,
    billId: backendData.BillId ? backendData.BillId.toString() : undefined,
  };
}

export const patientAppointmentsApi = {
  async getAll(params?: GetAllPatientAppointmentsParams): Promise<PatientAppointment[]> {
    try {
      console.log('Fetching patient appointments from API endpoint: /patient-appointments', params);
      
      // Build query string from params
      const queryParams = new URLSearchParams();
      if (params?.status) {
        queryParams.append('status', params.status);
      }
      if (params?.appointmentStatus) {
        queryParams.append('appointmentStatus', params.appointmentStatus);
      }
      if (params?.patientId) {
        queryParams.append('patientId', params.patientId);
      }
      if (params?.doctorId !== undefined) {
        queryParams.append('doctorId', params.doctorId.toString());
      }
      if (params?.appointmentDate) {
        queryParams.append('appointmentDate', params.appointmentDate);
      }
      
      const queryString = queryParams.toString();
      const endpoint = `/patient-appointments${queryString ? `?${queryString}` : ''}`;
      
      const response = await apiRequest<GetAllPatientAppointmentsResponse>(endpoint);
      console.log('Patient appointments API response:', response);
      
      if (!response.success || !Array.isArray(response.data)) {
        console.warn('Unexpected response structure:', response);
        return [];
      }
      
      if (response.data.length === 0) {
        console.log('API returned empty array');
        return [];
      }
      
      // Map each appointment from backend format to frontend format
      const mappedAppointments = response.data.map((appointment) => {
        try {
          return mapPatientAppointmentFromBackend(appointment);
        } catch (err) {
          console.error('Error mapping patient appointment:', err, appointment);
          // Return a minimal appointment object to prevent crashes
          return {
            id: appointment.PatientAppointmentId || 0,
            patientAppointmentId: `PA-${appointment.PatientAppointmentId || 0}`,
            patientId: appointment.PatientId || '',
            doctorId: appointment.DoctorId?.toString() || '',
            appointmentDate: typeof appointment.AppointmentDate === 'string' 
              ? appointment.AppointmentDate.split('T')[0] 
              : new Date().toISOString().split('T')[0],
            appointmentTime: appointment.AppointmentTime || '',
            tokenNo: appointment.TokenNo || '',
            appointmentStatus: (appointment.AppointmentStatus as 'Waiting' | 'Consulting' | 'Completed') || 'Waiting',
            consultationCharge: appointment.ConsultationCharge || 0,
            toBeAdmitted: appointment.ToBeAdmitted === 'Yes',
            referToAnotherDoctor: appointment.ReferToAnotherDoctor === 'Yes',
            transferToIPDOTICU: appointment.TransferToIPDOTICU === 'Yes',
          } as PatientAppointment;
        }
      });
      
      console.log(`Mapped ${mappedAppointments.length} patient appointments`);
      return mappedAppointments;
    } catch (error) {
      console.error('Error fetching patient appointments:', error);
      // Return empty array on error instead of throwing, to prevent UI crashes
      return [];
    }
  },

  async getById(id: number): Promise<PatientAppointment> {
    // Replace with: return apiRequest<PatientAppointment>(`/patientappointments/${id}`);
    await delay(200);
    const appointment = stubPatientAppointments.find(a => a.id === id);
    if (!appointment) {
      throw new Error(`PatientAppointment with id ${id} not found`);
    }
    return Promise.resolve(appointment);
  },

  async getByPatientId(patientId: string): Promise<PatientAppointment[]> {
    // Replace with: return apiRequest<PatientAppointment[]>(`/patientappointments?patientId=${patientId}`);
    await delay(200);
    return Promise.resolve(stubPatientAppointments.filter(a => a.patientId === patientId));
  },

  async getByDoctorId(doctorId: string): Promise<PatientAppointment[]> {
    // Replace with: return apiRequest<PatientAppointment[]>(`/patientappointments?doctorId=${doctorId}`);
    await delay(200);
    return Promise.resolve(stubPatientAppointments.filter(a => a.doctorId === doctorId));
  },

  async create(data: CreatePatientAppointmentDto, doctorName: string): Promise<PatientAppointment> {
    try {
      console.log('Creating patient appointment via API:', data);
      
      // Convert frontend DTO (camelCase) to backend request (PascalCase)
      const backendRequest: CreatePatientAppointmentRequestDto = {
        PatientId: data.patientId,
        DoctorId: Number(data.doctorId), // Convert string to number
        AppointmentDate: data.appointmentDate,
        AppointmentTime: data.appointmentTime,
        AppointmentStatus: data.appointmentStatus || 'Waiting',
        ConsultationCharge: data.consultationCharge,
        Diagnosis: data.diagnosis,
        FollowUpDetails: data.followUpDetails,
        PrescriptionsUrl: data.prescriptionsUrl,
        ToBeAdmitted: data.toBeAdmitted ? 'Yes' : 'No',
        ReferToAnotherDoctor: data.referToAnotherDoctor ? 'Yes' : 'No',
        ReferredDoctorId: data.referToAnotherDoctor && data.referredDoctorId 
          ? Number(data.referredDoctorId) 
          : undefined,
        TransferToIPDOTICU: data.transferToIPDOTICU ? 'Yes' : 'No',
        TransferTo: data.transferToIPDOTICU ? data.transferTo : undefined,
        TransferDetails: data.transferDetails,
        BillId: data.billId ? Number(data.billId) : undefined,
        Status: 'Active', // Default to Active
      };
      
      console.log('Backend request (PascalCase):', backendRequest);
      
      const response = await apiRequest<ApiResponse>('/patient-appointments', {
        method: 'POST',
        body: JSON.stringify(backendRequest),
      });
      
      console.log('Patient appointment creation response:', response);
      
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to create patient appointment');
      }
      
      const backendData = response.data;
      
      // Map backend response (PascalCase) to frontend PatientAppointment type (camelCase)
      const appointment: PatientAppointment = {
        id: backendData.PatientAppointmentId,
        patientAppointmentId: `PA-${backendData.PatientAppointmentId}`, // Format as string ID
        patientId: backendData.PatientId,
        doctorId: backendData.DoctorId.toString(), // Convert number to string
        appointmentDate: typeof backendData.AppointmentDate === 'string' 
          ? backendData.AppointmentDate.split('T')[0] 
          : new Date(backendData.AppointmentDate).toISOString().split('T')[0],
        appointmentTime: backendData.AppointmentTime,
        tokenNo: backendData.TokenNo,
        appointmentStatus: backendData.AppointmentStatus as 'Waiting' | 'Consulting' | 'Completed',
        consultationCharge: backendData.ConsultationCharge || 0,
        diagnosis: backendData.Diagnosis || undefined,
        followUpDetails: backendData.FollowUpDetails || undefined,
        prescriptionsUrl: backendData.PrescriptionsUrl || undefined,
        toBeAdmitted: backendData.ToBeAdmitted === 'Yes',
        referToAnotherDoctor: backendData.ReferToAnotherDoctor === 'Yes',
        referredDoctorId: backendData.ReferredDoctorId ? backendData.ReferredDoctorId.toString() : undefined,
        transferToIPDOTICU: backendData.TransferToIPDOTICU === 'Yes',
        transferTo: backendData.TransferTo as 'IPD Room Admission' | 'ICU' | 'OT' | undefined,
        transferDetails: backendData.TransferDetails || undefined,
        billId: backendData.BillId ? backendData.BillId.toString() : undefined,
      };
      
      console.log('Mapped patient appointment:', appointment);
      return appointment;
    } catch (error) {
      console.error('Error creating patient appointment:', error);
      throw error;
    }
  },

  async update(data: UpdatePatientAppointmentDto): Promise<PatientAppointment> {
    // Replace with: return apiRequest<PatientAppointment>(`/patientappointments/${data.id}`, { method: 'PUT', body: JSON.stringify(data) });
    await delay(400);
    const index = stubPatientAppointments.findIndex(a => a.id === data.id);
    if (index === -1) {
      throw new Error(`PatientAppointment with id ${data.id} not found`);
    }
    stubPatientAppointments[index] = { ...stubPatientAppointments[index], ...data };
    return Promise.resolve(stubPatientAppointments[index]);
  },

  async delete(id: number): Promise<void> {
    try {
      console.log('Deleting patient appointment via API:', id);
      
      const response = await apiRequest<ApiResponse>(`/patient-appointments/${id}`, {
        method: 'DELETE',
      });
      
      console.log('Patient appointment deletion response:', response);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to delete patient appointment');
      }
      
      // Return void on success
      return;
    } catch (error) {
      console.error('Error deleting patient appointment:', error);
      throw error;
    }
  },
};

