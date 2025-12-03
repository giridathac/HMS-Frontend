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

export const patientAppointmentsApi = {
  async getAll(): Promise<PatientAppointment[]> {
    // Replace with: return apiRequest<PatientAppointment[]>('/patientappointments');
    await delay(300);
    return Promise.resolve([...stubPatientAppointments]);
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
    // Replace with: return apiRequest<PatientAppointment>('/patientappointments', { method: 'POST', body: JSON.stringify(data) });
    await delay(400);
    const newAppointment: PatientAppointment = {
      id: stubPatientAppointments.length + 1,
      patientAppointmentId: generatePatientAppointmentId(),
      tokenNo: generateTokenNo(doctorName),
      appointmentStatus: data.appointmentStatus || 'Waiting',
      toBeAdmitted: data.toBeAdmitted || false,
      referToAnotherDoctor: data.referToAnotherDoctor || false,
      referredDoctorId: data.referredDoctorId,
      transferToIPDOTICU: data.transferToIPDOTICU || false,
      transferTo: data.transferTo,
      transferDetails: data.transferDetails,
      billId: data.billId,
      patientId: data.patientId,
      doctorId: data.doctorId,
      appointmentDate: data.appointmentDate,
      appointmentTime: data.appointmentTime,
      consultationCharge: data.consultationCharge,
      diagnosis: data.diagnosis,
      followUpDetails: data.followUpDetails,
      prescriptionsUrl: data.prescriptionsUrl,
    };
    stubPatientAppointments.push(newAppointment);
    return Promise.resolve(newAppointment);
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
    // Replace with: return apiRequest<void>(`/patientappointments/${id}`, { method: 'DELETE' });
    await delay(300);
    const index = stubPatientAppointments.findIndex(a => a.id === id);
    if (index === -1) {
      throw new Error(`PatientAppointment with id ${id} not found`);
    }
    stubPatientAppointments.splice(index, 1);
    return Promise.resolve();
  },
};

