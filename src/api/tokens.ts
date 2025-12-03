// Token API service
import { apiRequest } from './base';
import { Token, Doctor } from '../types';

// Stub data
const stubDoctors: Doctor[] = [
  { id: 1, name: 'Dr. Sarah Johnson', specialty: 'Cardiology', type: 'inhouse' },
  { id: 2, name: 'Dr. Michael Chen', specialty: 'Orthopedics', type: 'inhouse' },
  { id: 3, name: 'Dr. James Miller', specialty: 'Neurology', type: 'consulting' },
  { id: 4, name: 'Dr. Emily Davis', specialty: 'General Medicine', type: 'inhouse' },
  { id: 5, name: 'Dr. Robert Lee', specialty: 'Pediatrics', type: 'consulting' },
];

const stubTokens: Token[] = [
  { id: 1, tokenNumber: 'SJ-001', patientName: 'John Smith', patientPhone: '555-0101', doctorId: 1, doctorName: 'Dr. Sarah Johnson', status: 'Completed', issueTime: '08:30 AM', consultTime: '08:45 AM' },
  { id: 2, tokenNumber: 'SJ-002', patientName: 'Emma Wilson', patientPhone: '555-0102', doctorId: 1, doctorName: 'Dr. Sarah Johnson', status: 'Consulting', issueTime: '09:00 AM', consultTime: '09:20 AM' },
  { id: 3, tokenNumber: 'SJ-003', patientName: 'Robert Brown', patientPhone: '555-0103', doctorId: 1, doctorName: 'Dr. Sarah Johnson', status: 'Waiting', issueTime: '09:15 AM' },
  { id: 4, tokenNumber: 'MC-001', patientName: 'Lisa Anderson', patientPhone: '555-0104', doctorId: 2, doctorName: 'Dr. Michael Chen', status: 'Consulting', issueTime: '08:45 AM', consultTime: '09:05 AM' },
  { id: 5, tokenNumber: 'MC-002', patientName: 'David Taylor', patientPhone: '555-0105', doctorId: 2, doctorName: 'Dr. Michael Chen', status: 'Waiting', issueTime: '09:10 AM' },
];

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export interface CreateTokenDto {
  patientName: string;
  patientPhone: string;
  doctorId: number;
  isFollowUp?: boolean;
  patientId?: number;
}

export interface UpdateTokenStatusDto {
  id: number;
  status: Token['status'];
}

export const tokensApi = {
  async getAll(): Promise<Token[]> {
    // Replace with: return apiRequest<Token[]>('/tokens');
    await delay(300);
    return Promise.resolve([...stubTokens]);
  },

  async getByDoctor(doctorId: number): Promise<Token[]> {
    // Replace with: return apiRequest<Token[]>(`/tokens?doctorId=${doctorId}`);
    await delay(200);
    return Promise.resolve(stubTokens.filter(t => t.doctorId === doctorId));
  },

  async getByStatus(status: Token['status']): Promise<Token[]> {
    // Replace with: return apiRequest<Token[]>(`/tokens?status=${status}`);
    await delay(200);
    return Promise.resolve(stubTokens.filter(t => t.status === status));
  },

  async create(data: CreateTokenDto): Promise<Token> {
    // Replace with: return apiRequest<Token>('/tokens', { method: 'POST', body: JSON.stringify(data) });
    await delay(400);
    const doctor = stubDoctors.find(d => d.id === data.doctorId);
    if (!doctor) {
      throw new Error(`Doctor with id ${data.doctorId} not found`);
    }

    const doctorPrefix = doctor.name.split(' ')[1].substring(0, 2).toUpperCase();
    const existingTokens = stubTokens.filter(t => t.doctorId === data.doctorId);
    const tokenCount = existingTokens.length + 1;
    const prefix = data.isFollowUp ? 'FU' : '';
    const tokenNumber = `${doctorPrefix}${prefix ? '-' + prefix + '-' : '-'}${tokenCount.toString().padStart(3, '0')}`;

    const newToken: Token = {
      id: stubTokens.length + 1,
      tokenNumber,
      patientName: data.patientName,
      patientPhone: data.patientPhone,
      doctorId: data.doctorId,
      doctorName: doctor.name,
      status: 'Waiting',
      issueTime: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      isFollowUp: data.isFollowUp || false,
      patientId: data.patientId,
    };

    stubTokens.push(newToken);
    return Promise.resolve(newToken);
  },

  async updateStatus(data: UpdateTokenStatusDto): Promise<Token> {
    // Replace with: return apiRequest<Token>(`/tokens/${data.id}/status`, { method: 'PATCH', body: JSON.stringify({ status: data.status }) });
    await delay(300);
    const index = stubTokens.findIndex(t => t.id === data.id);
    if (index === -1) {
      throw new Error(`Token with id ${data.id} not found`);
    }
    stubTokens[index] = { ...stubTokens[index], status: data.status };
    if (data.status === 'Consulting' && !stubTokens[index].consultTime) {
      stubTokens[index].consultTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    }
    return Promise.resolve(stubTokens[index]);
  },

  async getDoctors(type?: 'inhouse' | 'consulting'): Promise<Doctor[]> {
    // Replace with: return apiRequest<Doctor[]>(`/doctors${type ? `?type=${type}` : ''}`);
    await delay(200);
    if (type) {
      return Promise.resolve(stubDoctors.filter(d => d.type === type));
    }
    return Promise.resolve([...stubDoctors]);
  },
};

