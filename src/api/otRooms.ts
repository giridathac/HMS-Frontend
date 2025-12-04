// OT Rooms API service
import { apiRequest } from './base';
import { OTRoom } from '../types';

// Stub data
const stubOTRooms: OTRoom[] = [
  { id: 1, otId: 'OT-01', otNo: 'OT001', otType: 'General', otName: 'General Operation Theater 1', otDescription: 'General purpose operation theater with standard equipment', startTimeofDay: '08:00', endTimeofDay: '20:00', createdBy: '1', createdAt: '2025-01-01T10:00:00Z', status: 'active' },
  { id: 2, otId: 'OT-02', otNo: 'OT002', otType: 'Cardiac', otName: 'Cardiac Operation Theater 1', otDescription: 'Specialized cardiac surgery theater with advanced monitoring', startTimeofDay: '08:00', endTimeofDay: '20:00', createdBy: '1', createdAt: '2025-01-01T10:00:00Z', status: 'active' },
  { id: 3, otId: 'OT-03', otNo: 'OT003', otType: 'Orthopedic', otName: 'Orthopedic Operation Theater 1', otDescription: 'Orthopedic surgery theater with specialized equipment', startTimeofDay: '00:00', endTimeofDay: '23:59', createdBy: '1', createdAt: '2025-01-01T10:00:00Z', status: 'active' },
  { id: 4, otId: 'OT-04', otNo: 'OT004', otType: 'General', otName: 'General Operation Theater 2', otDescription: 'General purpose operation theater', startTimeofDay: '08:00', endTimeofDay: '20:00', createdBy: '1', createdAt: '2025-01-01T10:00:00Z', status: 'active' },
  { id: 5, otId: 'OT-05', otNo: 'OT005', otType: 'Emergency', otName: 'Emergency Operation Theater', otDescription: '24/7 emergency operation theater', startTimeofDay: '00:00', endTimeofDay: '23:59', createdBy: '1', createdAt: '2025-01-01T10:00:00Z', status: 'active' },
];

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Generate OT ID in format OT-XX
function generateOTId(): string {
  const count = stubOTRooms.length + 1;
  return `OT-${count.toString().padStart(2, '0')}`;
}

export interface CreateOTRoomDto {
  otNo: string;
  otType: string;
  otName: string;
  otDescription?: string;
  startTimeofDay: string;
  endTimeofDay: string;
  createdBy: string;
  status?: 'active' | 'inactive';
}

export interface UpdateOTRoomDto extends Partial<CreateOTRoomDto> {
  id: number;
}

export const otRoomsApi = {
  async getAll(): Promise<OTRoom[]> {
    // Replace with: return apiRequest<OTRoom[]>('/otrooms');
    await delay(300);
    return Promise.resolve([...stubOTRooms]);
  },

  async getById(id: number): Promise<OTRoom> {
    // Replace with: return apiRequest<OTRoom>(`/otrooms/${id}`);
    await delay(200);
    const otRoom = stubOTRooms.find(r => r.id === id);
    if (!otRoom) {
      throw new Error(`OTRoom with id ${id} not found`);
    }
    return Promise.resolve(otRoom);
  },

  async getByType(type: string): Promise<OTRoom[]> {
    // Replace with: return apiRequest<OTRoom[]>(`/otrooms?type=${type}`);
    await delay(200);
    return Promise.resolve(stubOTRooms.filter(r => r.otType === type));
  },

  async create(data: CreateOTRoomDto): Promise<OTRoom> {
    // Replace with: return apiRequest<OTRoom>('/otrooms', { method: 'POST', body: JSON.stringify(data) });
    await delay(400);
    const newOTRoom: OTRoom = {
      id: stubOTRooms.length + 1,
      otId: generateOTId(),
      status: data.status || 'active',
      createdAt: new Date().toISOString(),
      ...data,
    };
    stubOTRooms.push(newOTRoom);
    return Promise.resolve(newOTRoom);
  },

  async update(data: UpdateOTRoomDto): Promise<OTRoom> {
    // Replace with: return apiRequest<OTRoom>(`/otrooms/${data.id}`, { method: 'PUT', body: JSON.stringify(data) });
    await delay(400);
    const index = stubOTRooms.findIndex(r => r.id === data.id);
    if (index === -1) {
      throw new Error(`OTRoom with id ${data.id} not found`);
    }
    stubOTRooms[index] = { ...stubOTRooms[index], ...data };
    return Promise.resolve(stubOTRooms[index]);
  },

  async delete(id: number): Promise<void> {
    // Replace with: return apiRequest<void>(`/otrooms/${id}`, { method: 'DELETE' });
    await delay(300);
    const index = stubOTRooms.findIndex(r => r.id === id);
    if (index === -1) {
      throw new Error(`OTRoom with id ${id} not found`);
    }
    stubOTRooms.splice(index, 1);
    return Promise.resolve();
  },
};

