// Dashboard API service
import { apiRequest } from './base';
import { DashboardStats, ChartData, DoctorQueue } from '../types';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const stubStats: DashboardStats = {
  opdPatientsToday: 124,
  activeTokens: 47,
  ipdAdmissions: 89,
  otScheduled: 8,
  icuOccupied: '12/15',
  totalPatients: 213,
};

const stubOpdData: ChartData[] = [
  { day: 'Mon', patients: 98 },
  { day: 'Tue', patients: 112 },
  { day: 'Wed', patients: 95 },
  { day: 'Thu', patients: 124 },
  { day: 'Fri', patients: 108 },
  { day: 'Sat', patients: 87 },
  { day: 'Sun', patients: 45 },
];

const stubAdmissionData: ChartData[] = [
  { name: 'Regular Ward', value: 45, color: '#3b82f6' },
  { name: 'Special Room', value: 28, color: '#8b5cf6' },
  { name: 'Shared Room', value: 16, color: '#06b6d4' },
];

const stubDoctorQueue: DoctorQueue[] = [
  { doctor: 'Dr. Sarah Johnson', specialty: 'Cardiology', type: 'inhouse', waiting: 8, consulting: 1, completed: 15 },
  { doctor: 'Dr. Michael Chen', specialty: 'Orthopedics', type: 'inhouse', waiting: 12, consulting: 1, completed: 11 },
  { doctor: 'Dr. James Miller', specialty: 'Neurology', type: 'consulting', waiting: 6, consulting: 1, completed: 9 },
  { doctor: 'Dr. Emily Davis', specialty: 'General Medicine', type: 'inhouse', waiting: 15, consulting: 1, completed: 18 },
  { doctor: 'Dr. Robert Lee', specialty: 'Pediatrics', type: 'consulting', waiting: 6, consulting: 1, completed: 12 },
];

export const dashboardApi = {
  async getStats(): Promise<DashboardStats> {
    // Replace with: return apiRequest<DashboardStats>('/dashboard/stats');
    await delay(300);
    return Promise.resolve(stubStats);
  },

  async getOpdData(): Promise<ChartData[]> {
    // Replace with: return apiRequest<ChartData[]>('/dashboard/opd-data');
    await delay(200);
    return Promise.resolve([...stubOpdData]);
  },

  async getAdmissionData(): Promise<ChartData[]> {
    // Replace with: return apiRequest<ChartData[]>('/dashboard/admission-data');
    await delay(200);
    return Promise.resolve([...stubAdmissionData]);
  },

  async getDoctorQueue(): Promise<DoctorQueue[]> {
    // Replace with: return apiRequest<DoctorQueue[]>('/dashboard/doctor-queue');
    await delay(200);
    return Promise.resolve([...stubDoctorQueue]);
  },
};

