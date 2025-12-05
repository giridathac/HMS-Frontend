// Appointments API service
import { apiRequest } from './base';
import { Appointment } from '../types';

const stubAppointments: Appointment[] = [
  { id: 1, patient: 'John Smith', doctor: 'Dr. Sarah Johnson', date: '2025-11-11', time: '09:00 AM', department: 'Cardiology', status: 'Confirmed' },
  { id: 2, patient: 'Emma Wilson', doctor: 'Dr. Michael Chen', date: '2025-11-11', time: '10:30 AM', department: 'Endocrinology', status: 'Confirmed' },
  { id: 3, patient: 'Robert Brown', doctor: 'Dr. Sarah Johnson', date: '2025-11-11', time: '11:00 AM', department: 'Cardiology', status: 'Pending' },
  { id: 4, patient: 'Lisa Anderson', doctor: 'Dr. James Miller', date: '2025-11-11', time: '02:00 PM', department: 'Neurology', status: 'Confirmed' },
  { id: 5, patient: 'David Taylor', doctor: 'Dr. Emily Davis', date: '2025-11-12', time: '09:30 AM', department: 'Orthopedics', status: 'Confirmed' },
  { id: 6, patient: 'Sarah Martinez', doctor: 'Dr. Robert Lee', date: '2025-11-12', time: '11:00 AM', department: 'Dermatology', status: 'Pending' },
  { id: 7, patient: 'Michael Johnson', doctor: 'Dr. Sarah Johnson', date: '2025-11-13', time: '10:00 AM', department: 'Cardiology', status: 'Confirmed' },
];

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Backend request DTO (PascalCase) - matches API specification
export interface CreateAppointmentRequestDto {
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
interface CreateAppointmentResponseDto {
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

// API response wrapper
interface ApiResponse {
  success: boolean;
  message: string;
  data: CreateAppointmentResponseDto;
}

// Frontend DTO (camelCase) - for backward compatibility
export interface CreateAppointmentDto {
  patient: string;
  doctor: string;
  date: string;
  time: string;
  department: string;
}

export interface UpdateAppointmentDto extends Partial<CreateAppointmentDto> {
  id: number;
  status?: Appointment['status'];
}

export const appointmentsApi = {
  async getAll(): Promise<Appointment[]> {
    // Replace with: return apiRequest<Appointment[]>('/appointments');
    await delay(300);
    return Promise.resolve([...stubAppointments]);
  },

  async getByDate(date: string): Promise<Appointment[]> {
    // Replace with: return apiRequest<Appointment[]>(`/appointments?date=${date}`);
    await delay(200);
    return Promise.resolve(stubAppointments.filter(a => a.date === date));
  },

  async create(data: CreateAppointmentRequestDto): Promise<Appointment> {
    try {
      console.log('Creating appointment via API:', data);
      
      const response = await apiRequest<ApiResponse>('/patient-appointments', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      
      console.log('Appointment creation response:', response);
      
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to create appointment');
      }
      
      const backendData = response.data;
      
      // Map backend response (PascalCase) to frontend Appointment type (camelCase)
      const appointment: Appointment = {
        id: backendData.PatientAppointmentId,
        patient: backendData.PatientName || 'Unknown Patient',
        doctor: backendData.DoctorName || 'Unknown Doctor',
        date: typeof backendData.AppointmentDate === 'string' 
          ? backendData.AppointmentDate.split('T')[0] 
          : new Date(backendData.AppointmentDate).toISOString().split('T')[0],
        time: backendData.AppointmentTime,
        department: '', // Not provided in response, would need to fetch from doctor
        status: backendData.AppointmentStatus === 'Completed' 
          ? 'Completed' 
          : backendData.AppointmentStatus === 'Consulting' 
          ? 'Confirmed' 
          : backendData.AppointmentStatus === 'Waiting' 
          ? 'Pending' 
          : 'Pending' as Appointment['status'],
      };
      
      console.log('Mapped appointment:', appointment);
      return appointment;
    } catch (error) {
      console.error('Error creating appointment:', error);
      throw error;
    }
  },

  async update(data: UpdateAppointmentDto): Promise<Appointment> {
    // Replace with: return apiRequest<Appointment>(`/appointments/${data.id}`, { method: 'PUT', body: JSON.stringify(data) });
    await delay(400);
    const index = stubAppointments.findIndex(a => a.id === data.id);
    if (index === -1) {
      throw new Error(`Appointment with id ${data.id} not found`);
    }
    stubAppointments[index] = { ...stubAppointments[index], ...data };
    return Promise.resolve(stubAppointments[index]);
  },

  async delete(id: number): Promise<void> {
    // Replace with: return apiRequest<void>(`/appointments/${id}`, { method: 'DELETE' });
    await delay(300);
    const index = stubAppointments.findIndex(a => a.id === id);
    if (index === -1) {
      throw new Error(`Appointment with id ${id} not found`);
    }
    stubAppointments.splice(index, 1);
    return Promise.resolve();
  },
};

