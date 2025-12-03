// OT Slots API service
import { apiRequest } from './base';
import { OTSlot } from '../types';

// Stub data
const stubOTSlots: OTSlot[] = [
  { id: 1, otSlotId: 'OT-01-SLOT001', otId: 'OT-01', otSlotNo: 'SL01', slotStartTime: '9:00 AM', slotEndTime: '10:00 AM', status: 'Active' },
  { id: 2, otSlotId: 'OT-01-SLOT002', otId: 'OT-01', otSlotNo: 'SL02', slotStartTime: '10:00 AM', slotEndTime: '11:00 AM', status: 'Active' },
  { id: 3, otSlotId: 'OT-01-SLOT003', otId: 'OT-01', otSlotNo: 'SL03', slotStartTime: '11:00 AM', slotEndTime: '12:00 PM', status: 'Active' },
  { id: 4, otSlotId: 'OT-02-SLOT001', otId: 'OT-02', otSlotNo: 'SL01', slotStartTime: '9:00 AM', slotEndTime: '10:00 AM', status: 'Active' },
  { id: 5, otSlotId: 'OT-02-SLOT002', otId: 'OT-02', otSlotNo: 'SL02', slotStartTime: '10:00 AM', slotEndTime: '11:00 AM', status: 'Active' },
  { id: 6, otSlotId: 'OT-03-SLOT001', otId: 'OT-03', otSlotNo: 'SL01', slotStartTime: '9:00 AM', slotEndTime: '10:00 AM', status: 'Active' },
  { id: 7, otSlotId: 'OT-03-SLOT002', otId: 'OT-03', otSlotNo: 'SL02', slotStartTime: '10:00 AM', slotEndTime: '11:00 AM', status: 'Inactive' },
];

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Generate OT Slot ID in format OT-XX-SLOTXXX
function generateOTSlotId(otId: string): string {
  // Extract the number from OTId (e.g., OT-01 -> 01)
  const otNumber = otId.replace('OT-', '');
  // Count existing slots for this OT
  const existingSlotsForOT = stubOTSlots.filter(s => s.otId === otId);
  const slotNumber = existingSlotsForOT.length + 1;
  return `OT-${otNumber}-SLOT${slotNumber.toString().padStart(3, '0')}`;
}

export interface CreateOTSlotDto {
  otId: string;
  otSlotNo: string;
  slotStartTime: string;
  slotEndTime: string;
  status?: 'Active' | 'Inactive';
}

export interface UpdateOTSlotDto extends Partial<CreateOTSlotDto> {
  id: number;
}

export const otSlotsApi = {
  async getAll(): Promise<OTSlot[]> {
    // Replace with: return apiRequest<OTSlot[]>('/otslots');
    await delay(300);
    return Promise.resolve([...stubOTSlots]);
  },

  async getByOTId(otId: string): Promise<OTSlot[]> {
    // Replace with: return apiRequest<OTSlot[]>(`/otslots?otId=${otId}`);
    await delay(200);
    return Promise.resolve(stubOTSlots.filter(s => s.otId === otId));
  },

  async getById(id: number): Promise<OTSlot> {
    // Replace with: return apiRequest<OTSlot>(`/otslots/${id}`);
    await delay(200);
    const otSlot = stubOTSlots.find(s => s.id === id);
    if (!otSlot) {
      throw new Error(`OTSlot with id ${id} not found`);
    }
    return Promise.resolve(otSlot);
  },

  async create(data: CreateOTSlotDto): Promise<OTSlot> {
    // Replace with: return apiRequest<OTSlot>('/otslots', { method: 'POST', body: JSON.stringify(data) });
    await delay(400);
    const newOTSlot: OTSlot = {
      id: stubOTSlots.length + 1,
      otSlotId: generateOTSlotId(data.otId),
      status: data.status || 'Active',
      ...data,
    };
    stubOTSlots.push(newOTSlot);
    return Promise.resolve(newOTSlot);
  },

  async update(data: UpdateOTSlotDto): Promise<OTSlot> {
    // Replace with: return apiRequest<OTSlot>(`/otslots/${data.id}`, { method: 'PUT', body: JSON.stringify(data) });
    await delay(400);
    const index = stubOTSlots.findIndex(s => s.id === data.id);
    if (index === -1) {
      throw new Error(`OTSlot with id ${data.id} not found`);
    }
    stubOTSlots[index] = { ...stubOTSlots[index], ...data };
    return Promise.resolve(stubOTSlots[index]);
  },

  async delete(id: number): Promise<void> {
    // Replace with: return apiRequest<void>(`/otslots/${id}`, { method: 'DELETE' });
    await delay(300);
    const index = stubOTSlots.findIndex(s => s.id === id);
    if (index === -1) {
      throw new Error(`OTSlot with id ${id} not found`);
    }
    stubOTSlots.splice(index, 1);
    return Promise.resolve();
  },
};

