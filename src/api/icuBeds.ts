// ICU Beds API service
import { apiRequest } from './base';
import { ICUBed } from '../types';

// Stub data
const stubICUBeds: ICUBed[] = [
  { id: 1, icuId: 'ICU-01', icuBedNo: 'B01', icuType: 'Medical', icuRoomNameNo: 'R101', icuDescription: 'Medical ICU bed with ventilator support', isVentilatorAttached: true, status: 'active', createdAt: '2025-01-01T10:00:00Z' },
  { id: 2, icuId: 'ICU-02', icuBedNo: 'B02', icuType: 'Surgical', icuRoomNameNo: 'R101', icuDescription: 'Surgical ICU bed', isVentilatorAttached: false, status: 'active', createdAt: '2025-01-01T10:00:00Z' },
  { id: 3, icuId: 'ICU-03', icuBedNo: 'B03', icuType: 'Pediatric', icuRoomNameNo: 'R102', icuDescription: 'Pediatric ICU bed with specialized equipment', isVentilatorAttached: true, status: 'active', createdAt: '2025-01-01T10:00:00Z' },
  { id: 4, icuId: 'ICU-04', icuBedNo: 'B04', icuType: 'Medical', icuRoomNameNo: 'R103', icuDescription: 'Medical ICU bed', isVentilatorAttached: false, status: 'active', createdAt: '2025-01-01T10:00:00Z' },
  { id: 5, icuId: 'ICU-05', icuBedNo: 'B05', icuType: 'Surgical', icuRoomNameNo: 'R103', icuDescription: 'Surgical ICU bed', isVentilatorAttached: true, status: 'active', createdAt: '2025-01-01T10:00:00Z' },
];

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Generate ICU ID in format ICU-XX
function generateICUId(): string {
  const count = stubICUBeds.length + 1;
  return `ICU-${count.toString().padStart(2, '0')}`;
}

export interface CreateICUBedDto {
  icuBedNo: string;
  icuType: string;
  icuRoomNameNo: string;
  icuDescription?: string;
  isVentilatorAttached: boolean;
  status?: 'active' | 'inactive';
}

export interface UpdateICUBedDto extends Partial<CreateICUBedDto> {
  id: number;
}

export const icuBedsApi = {
  async getAll(): Promise<ICUBed[]> {
    // Replace with: return apiRequest<ICUBed[]>('/icubeds');
    await delay(300);
    return Promise.resolve([...stubICUBeds]);
  },

  async getById(id: number): Promise<ICUBed> {
    // Replace with: return apiRequest<ICUBed>(`/icubeds/${id}`);
    await delay(200);
    const icuBed = stubICUBeds.find(b => b.id === id);
    if (!icuBed) {
      throw new Error(`ICUBed with id ${id} not found`);
    }
    return Promise.resolve(icuBed);
  },

  async getByType(type: string): Promise<ICUBed[]> {
    // Replace with: return apiRequest<ICUBed[]>(`/icubeds?type=${type}`);
    await delay(200);
    return Promise.resolve(stubICUBeds.filter(b => b.icuType === type));
  },

  async create(data: CreateICUBedDto): Promise<ICUBed> {
    // Replace with: return apiRequest<ICUBed>('/icubeds', { method: 'POST', body: JSON.stringify(data) });
    await delay(400);
    const newICUBed: ICUBed = {
      id: stubICUBeds.length + 1,
      icuId: generateICUId(),
      status: data.status || 'active',
      createdAt: new Date().toISOString(),
      ...data,
    };
    stubICUBeds.push(newICUBed);
    return Promise.resolve(newICUBed);
  },

  async update(data: UpdateICUBedDto): Promise<ICUBed> {
    // Replace with: return apiRequest<ICUBed>(`/icubeds/${data.id}`, { method: 'PUT', body: JSON.stringify(data) });
    await delay(400);
    const index = stubICUBeds.findIndex(b => b.id === data.id);
    if (index === -1) {
      throw new Error(`ICUBed with id ${data.id} not found`);
    }
    stubICUBeds[index] = { ...stubICUBeds[index], ...data };
    return Promise.resolve(stubICUBeds[index]);
  },

  async delete(id: number): Promise<void> {
    // Replace with: return apiRequest<void>(`/icubeds/${id}`, { method: 'DELETE' });
    await delay(300);
    const index = stubICUBeds.findIndex(b => b.id === id);
    if (index === -1) {
      throw new Error(`ICUBed with id ${id} not found`);
    }
    stubICUBeds.splice(index, 1);
    return Promise.resolve();
  },
};

