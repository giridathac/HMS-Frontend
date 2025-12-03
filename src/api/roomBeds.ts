// RoomBeds API service
import { apiRequest } from './base';
import { RoomBed } from '../types';

// Stub data
const stubRoomBeds: RoomBed[] = [
  { id: 1, bedNo: 'B101', roomNo: 'R101', roomCategory: 'AC', roomType: 'Regular', numberOfBeds: 1, chargesPerDay: 1500, status: 'active', createdBy: 'Admin', createdAt: '2025-01-01T10:00:00Z' },
  { id: 2, bedNo: 'B102', roomNo: 'R101', roomCategory: 'AC', roomType: 'Regular', numberOfBeds: 1, chargesPerDay: 1500, status: 'occupied', createdBy: 'Admin', createdAt: '2025-01-01T10:00:00Z' },
  { id: 3, bedNo: 'B201', roomNo: 'R201', roomCategory: 'AC', roomType: 'Special', numberOfBeds: 1, chargesPerDay: 3000, status: 'active', createdBy: 'Admin', createdAt: '2025-01-01T10:00:00Z' },
  { id: 4, bedNo: 'B202', roomNo: 'R201', roomCategory: 'AC', roomType: 'Special', numberOfBeds: 1, chargesPerDay: 3000, status: 'active', createdBy: 'Admin', createdAt: '2025-01-01T10:00:00Z' },
  { id: 5, bedNo: 'B301', roomNo: 'R301', roomCategory: 'Non AC', roomType: 'Special Shared', numberOfBeds: 2, chargesPerDay: 2500, status: 'active', createdBy: 'Admin', createdAt: '2025-01-01T10:00:00Z' },
  { id: 6, bedNo: 'B401', roomNo: 'R401', roomCategory: 'AC', roomType: 'Special', numberOfBeds: 1, chargesPerDay: 5000, status: 'occupied', createdBy: 'Admin', createdAt: '2025-01-01T10:00:00Z' },
];

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export interface CreateRoomBedDto {
  bedNo: string;
  roomNo: string;
  roomCategory: string;
  roomType: string;
  numberOfBeds: number;
  chargesPerDay: number;
  status?: 'active' | 'inactive' | 'occupied' | 'maintenance';
  createdBy: string;
}

export interface UpdateRoomBedDto extends Partial<CreateRoomBedDto> {
  id: number;
}

export const roomBedsApi = {
  async getAll(): Promise<RoomBed[]> {
    // Replace with: return apiRequest<RoomBed[]>('/roombeds');
    await delay(300);
    return Promise.resolve([...stubRoomBeds]);
  },

  async getById(id: number): Promise<RoomBed> {
    // Replace with: return apiRequest<RoomBed>(`/roombeds/${id}`);
    await delay(200);
    const roomBed = stubRoomBeds.find(r => r.id === id);
    if (!roomBed) {
      throw new Error(`RoomBed with id ${id} not found`);
    }
    return Promise.resolve(roomBed);
  },

  async getByRoomNo(roomNo: string): Promise<RoomBed[]> {
    // Replace with: return apiRequest<RoomBed[]>(`/roombeds?roomNo=${roomNo}`);
    await delay(200);
    return Promise.resolve(stubRoomBeds.filter(r => r.roomNo === roomNo));
  },

  async getByCategory(category: string): Promise<RoomBed[]> {
    // Replace with: return apiRequest<RoomBed[]>(`/roombeds?category=${category}`);
    await delay(200);
    return Promise.resolve(stubRoomBeds.filter(r => r.roomCategory === category));
  },

  async create(data: CreateRoomBedDto): Promise<RoomBed> {
    // Replace with: return apiRequest<RoomBed>('/roombeds', { method: 'POST', body: JSON.stringify(data) });
    await delay(400);
    const newRoomBed: RoomBed = {
      id: stubRoomBeds.length + 1,
      status: data.status || 'active',
      createdAt: new Date().toISOString(),
      ...data,
    };
    stubRoomBeds.push(newRoomBed);
    return Promise.resolve(newRoomBed);
  },

  async update(data: UpdateRoomBedDto): Promise<RoomBed> {
    // Replace with: return apiRequest<RoomBed>(`/roombeds/${data.id}`, { method: 'PUT', body: JSON.stringify(data) });
    await delay(400);
    const index = stubRoomBeds.findIndex(r => r.id === data.id);
    if (index === -1) {
      throw new Error(`RoomBed with id ${data.id} not found`);
    }
    stubRoomBeds[index] = { ...stubRoomBeds[index], ...data };
    return Promise.resolve(stubRoomBeds[index]);
  },

  async delete(id: number): Promise<void> {
    // Replace with: return apiRequest<void>(`/roombeds/${id}`, { method: 'DELETE' });
    await delay(300);
    const index = stubRoomBeds.findIndex(r => r.id === id);
    if (index === -1) {
      throw new Error(`RoomBed with id ${id} not found`);
    }
    stubRoomBeds.splice(index, 1);
    return Promise.resolve();
  },
};

