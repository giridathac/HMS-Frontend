// Emergency Beds API service
import { apiRequest } from './base';
import { EmergencyBed } from '../types';

// Stub data
const stubEmergencyBeds: EmergencyBed[] = [
  { id: 1, emergencyBedId: 'ERBED-01', emergencyBedNo: 'ER-001', emergencyRoomDescription: 'Emergency bed with standard monitoring equipment', chargesPerDay: 2500, createdBy: '1', createdAt: '2025-01-01T10:00:00Z', status: 'active' },
  { id: 2, emergencyBedId: 'ERBED-02', emergencyBedNo: 'ER-002', emergencyRoomDescription: 'Emergency bed with advanced life support', chargesPerDay: 3500, createdBy: '1', createdAt: '2025-01-01T10:00:00Z', status: 'active' },
  { id: 3, emergencyBedId: 'ERBED-03', emergencyBedNo: 'ER-003', emergencyRoomDescription: 'Standard emergency bed', chargesPerDay: 2000, createdBy: '1', createdAt: '2025-01-01T10:00:00Z', status: 'active' },
  { id: 4, emergencyBedId: 'ERBED-04', emergencyBedNo: 'ER-004', emergencyRoomDescription: 'Emergency bed with isolation facility', chargesPerDay: 3000, createdBy: '1', createdAt: '2025-01-01T10:00:00Z', status: 'active' },
  { id: 5, emergencyBedId: 'ERBED-05', emergencyBedNo: 'ER-005', emergencyRoomDescription: 'Pediatric emergency bed', chargesPerDay: 2200, createdBy: '1', createdAt: '2025-01-01T10:00:00Z', status: 'active' },
];

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Generate Emergency Bed ID in format ERBED-XX
function generateEmergencyBedId(): string {
  const count = stubEmergencyBeds.length + 1;
  return `ERBED-${count.toString().padStart(2, '0')}`;
}

// Generate Emergency Bed No in format ER-XXX
function generateEmergencyBedNo(): string {
  const count = stubEmergencyBeds.length + 1;
  return `ER-${count.toString().padStart(3, '0')}`;
}

export interface CreateEmergencyBedDto {
  emergencyBedNo: string;
  emergencyRoomDescription?: string;
  chargesPerDay: number;
  createdBy: string;
  status?: 'active' | 'inactive';
}

export interface UpdateEmergencyBedDto extends Partial<CreateEmergencyBedDto> {
  id: number;
}

export const emergencyBedsApi = {
  async getAll(): Promise<EmergencyBed[]> {
    // Replace with: return apiRequest<EmergencyBed[]>('/emergencybeds');
    await delay(300);
    return Promise.resolve([...stubEmergencyBeds]);
  },

  async getById(id: number): Promise<EmergencyBed> {
    // Replace with: return apiRequest<EmergencyBed>(`/emergencybeds/${id}`);
    await delay(200);
    const emergencyBed = stubEmergencyBeds.find(b => b.id === id);
    if (!emergencyBed) {
      throw new Error(`EmergencyBed with id ${id} not found`);
    }
    return Promise.resolve(emergencyBed);
  },

  async create(data: CreateEmergencyBedDto): Promise<EmergencyBed> {
    // Replace with: return apiRequest<EmergencyBed>('/emergencybeds', { method: 'POST', body: JSON.stringify(data) });
    await delay(400);
    const newEmergencyBed: EmergencyBed = {
      id: stubEmergencyBeds.length + 1,
      emergencyBedId: generateEmergencyBedId(),
      emergencyBedNo: data.emergencyBedNo || generateEmergencyBedNo(),
      status: data.status || 'active',
      createdAt: new Date().toISOString(),
      ...data,
    };
    stubEmergencyBeds.push(newEmergencyBed);
    return Promise.resolve(newEmergencyBed);
  },

  async update(data: UpdateEmergencyBedDto): Promise<EmergencyBed> {
    // Replace with: return apiRequest<EmergencyBed>(`/emergencybeds/${data.id}`, { method: 'PUT', body: JSON.stringify(data) });
    await delay(400);
    const index = stubEmergencyBeds.findIndex(b => b.id === data.id);
    if (index === -1) {
      throw new Error(`EmergencyBed with id ${data.id} not found`);
    }
    stubEmergencyBeds[index] = { ...stubEmergencyBeds[index], ...data };
    return Promise.resolve(stubEmergencyBeds[index]);
  },

  async delete(id: number): Promise<void> {
    // Replace with: return apiRequest<void>(`/emergencybeds/${id}`, { method: 'DELETE' });
    await delay(300);
    const index = stubEmergencyBeds.findIndex(b => b.id === id);
    if (index === -1) {
      throw new Error(`EmergencyBed with id ${id} not found`);
    }
    stubEmergencyBeds.splice(index, 1);
    return Promise.resolve();
  },
};

