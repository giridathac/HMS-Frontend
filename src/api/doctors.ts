// Doctors API service
import { apiRequest } from './base';
import { Doctor } from '../types';

// Stub data
const stubDoctors: Doctor[] = [
  { id: 1, name: 'Dr. Sarah Johnson', specialty: 'Cardiology', type: 'inhouse' },
  { id: 2, name: 'Dr. Michael Chen', specialty: 'Orthopedics', type: 'inhouse' },
  { id: 3, name: 'Dr. James Miller', specialty: 'Neurology', type: 'consulting' },
  { id: 4, name: 'Dr. Emily Davis', specialty: 'General Medicine', type: 'inhouse' },
  { id: 5, name: 'Dr. Robert Lee', specialty: 'Pediatrics', type: 'consulting' },
  { id: 6, name: 'Dr. Maria Garcia', specialty: 'Gynecology', type: 'inhouse' },
  { id: 7, name: 'Dr. David Wilson', specialty: 'Dermatology', type: 'consulting' },
];

// Attendance stub data
interface AttendanceRecord {
  id: number;
  doctorId: number;
  date: string;
  status: 'present' | 'absent' | 'on-leave' | 'half-day';
  checkIn?: string;
  checkOut?: string;
  notes?: string;
}

const stubAttendance: AttendanceRecord[] = [
  { id: 1, doctorId: 1, date: '2025-11-14', status: 'present', checkIn: '08:00 AM', checkOut: '05:00 PM' },
  { id: 2, doctorId: 2, date: '2025-11-14', status: 'present', checkIn: '08:30 AM', checkOut: '04:30 PM' },
  { id: 3, doctorId: 3, date: '2025-11-14', status: 'on-leave' },
  { id: 4, doctorId: 4, date: '2025-11-14', status: 'present', checkIn: '09:00 AM', checkOut: '06:00 PM' },
  { id: 5, doctorId: 5, date: '2025-11-14', status: 'half-day', checkIn: '09:00 AM', checkOut: '01:00 PM' },
  { id: 6, doctorId: 6, date: '2025-11-14', status: 'present', checkIn: '08:00 AM', checkOut: '05:00 PM' },
  { id: 7, doctorId: 7, date: '2025-11-14', status: 'absent' },
];

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export interface CreateDoctorDto {
  name: string;
  specialty: string;
  type: 'inhouse' | 'consulting';
}

export interface UpdateDoctorDto extends Partial<CreateDoctorDto> {
  id: number;
}

export interface CreateAttendanceDto {
  doctorId: number;
  date: string;
  status: 'present' | 'absent' | 'on-leave' | 'half-day';
  checkIn?: string;
  checkOut?: string;
  notes?: string;
}

export interface AttendanceRecord {
  id: number;
  doctorId: number;
  date: string;
  status: 'present' | 'absent' | 'on-leave' | 'half-day';
  checkIn?: string;
  checkOut?: string;
  notes?: string;
}

export const doctorsApi = {
  async getAll(): Promise<Doctor[]> {
    // Replace with: return apiRequest<Doctor[]>('/doctors');
    await delay(300);
    return Promise.resolve([...stubDoctors]);
  },

  async getById(id: number): Promise<Doctor> {
    // Replace with: return apiRequest<Doctor>(`/doctors/${id}`);
    await delay(200);
    const doctor = stubDoctors.find(d => d.id === id);
    if (!doctor) {
      throw new Error(`Doctor with id ${id} not found`);
    }
    return Promise.resolve(doctor);
  },

  async create(data: CreateDoctorDto): Promise<Doctor> {
    // Replace with: return apiRequest<Doctor>('/doctors', { method: 'POST', body: JSON.stringify(data) });
    await delay(400);
    const newDoctor: Doctor = {
      id: stubDoctors.length + 1,
      ...data,
    };
    stubDoctors.push(newDoctor);
    return Promise.resolve(newDoctor);
  },

  async update(data: UpdateDoctorDto): Promise<Doctor> {
    // Replace with: return apiRequest<Doctor>(`/doctors/${data.id}`, { method: 'PUT', body: JSON.stringify(data) });
    await delay(400);
    const index = stubDoctors.findIndex(d => d.id === data.id);
    if (index === -1) {
      throw new Error(`Doctor with id ${data.id} not found`);
    }
    stubDoctors[index] = { ...stubDoctors[index], ...data };
    return Promise.resolve(stubDoctors[index]);
  },

  async delete(id: number): Promise<void> {
    // Replace with: return apiRequest<void>(`/doctors/${id}`, { method: 'DELETE' });
    await delay(300);
    const index = stubDoctors.findIndex(d => d.id === id);
    if (index === -1) {
      throw new Error(`Doctor with id ${id} not found`);
    }
    stubDoctors.splice(index, 1);
    return Promise.resolve();
  },

  // Attendance methods
  async getAttendance(doctorId?: number, date?: string): Promise<AttendanceRecord[]> {
    // Replace with: return apiRequest<AttendanceRecord[]>(`/doctors/attendance${doctorId ? `?doctorId=${doctorId}` : ''}${date ? `&date=${date}` : ''}`);
    await delay(300);
    let filtered = [...stubAttendance];
    if (doctorId) {
      filtered = filtered.filter(a => a.doctorId === doctorId);
    }
    if (date) {
      filtered = filtered.filter(a => a.date === date);
    }
    return Promise.resolve(filtered);
  },

  async createAttendance(data: CreateAttendanceDto): Promise<AttendanceRecord> {
    // Replace with: return apiRequest<AttendanceRecord>('/doctors/attendance', { method: 'POST', body: JSON.stringify(data) });
    await delay(400);
    const newRecord: AttendanceRecord = {
      id: stubAttendance.length + 1,
      ...data,
    };
    stubAttendance.push(newRecord);
    return Promise.resolve(newRecord);
  },

  async updateAttendance(id: number, data: Partial<CreateAttendanceDto>): Promise<AttendanceRecord> {
    // Replace with: return apiRequest<AttendanceRecord>(`/doctors/attendance/${id}`, { method: 'PUT', body: JSON.stringify(data) });
    await delay(400);
    const index = stubAttendance.findIndex(a => a.id === id);
    if (index === -1) {
      throw new Error(`Attendance record with id ${id} not found`);
    }
    stubAttendance[index] = { ...stubAttendance[index], ...data };
    return Promise.resolve(stubAttendance[index]);
  },
};

