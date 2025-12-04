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

  async create(data: CreateAppointmentDto): Promise<Appointment> {
    // Replace with: return apiRequest<Appointment>('/appointments', { method: 'POST', body: JSON.stringify(data) });
    await delay(400);
    const newAppointment: Appointment = {
      id: stubAppointments.length + 1,
      ...data,
      status: 'Pending',
    };
    stubAppointments.push(newAppointment);
    return Promise.resolve(newAppointment);
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

