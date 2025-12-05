// OT Slots API service
import { apiRequest } from './base';
import { OTSlot } from '../types';

// API Response types
interface OTSlotResponseItem {
  OTSlotId: number;
  OTId: number;
  OTSlotNo: string;
  SlotStartTime: string;
  SlotEndTime: string;
  Status: string;
  CreatedAt: string | Date;
  OTNo: string | null;
  OTName: string | null;
  OTType: string | null;
}

interface OTSlotAPIResponse {
  success: boolean;
  count: number;
  data: OTSlotResponseItem[];
}

interface OTSlotCreateResponse {
  success: boolean;
  message: string;
  data: OTSlotResponseItem;
}

// Map API response to OTSlot type
function mapOTSlotResponseToOTSlot(item: OTSlotResponseItem): OTSlot {
  // Convert OTId number to string format (e.g., 1 -> "OT-01")
  const otIdString = `OT-${item.OTId.toString().padStart(2, '0')}`;
  // Generate otSlotId string from OTSlotId number
  const otSlotIdString = `OT-${item.OTId.toString().padStart(2, '0')}-SLOT${item.OTSlotId.toString().padStart(3, '0')}`;
  
  return {
    id: item.OTSlotId,
    otSlotId: otSlotIdString,
    otId: otIdString,
    otSlotNo: item.OTSlotNo,
    slotStartTime: item.SlotStartTime,
    slotEndTime: item.SlotEndTime,
    status: item.Status?.toLowerCase() === 'active' ? 'Active' : 'Inactive',
  };
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
  async getAll(status?: string, otId?: number): Promise<OTSlot[]> {
    try {
      // Build query parameters
      const params = new URLSearchParams();
      if (status) {
        params.append('status', status);
      }
      if (otId !== undefined) {
        params.append('otId', otId.toString());
      }

      const queryString = params.toString();
      const endpoint = queryString ? `/ot-slots?${queryString}` : '/ot-slots';
      
      const response = await apiRequest<OTSlotAPIResponse>(endpoint);
      
      if (!response.success) {
        throw new Error('API request failed');
      }

      // Map API response to our format
      return response.data.map(mapOTSlotResponseToOTSlot);
    } catch (error) {
      console.error('Error fetching OT slots:', error);
      throw error;
    }
  },

  async getByOTId(otId: string): Promise<OTSlot[]> {
    try {
      // Extract numeric ID from string format (e.g., "OT-01" -> 1)
      const numericOtId = parseInt(otId.replace('OT-', ''), 10);
      if (isNaN(numericOtId)) {
        throw new Error(`Invalid OT ID format: ${otId}`);
      }
      
      return this.getAll(undefined, numericOtId);
    } catch (error) {
      console.error('Error fetching OT slots by OT ID:', error);
      throw error;
    }
  },

  async getById(id: number): Promise<OTSlot> {
    // Fetch all slots and find by id
    const allSlots = await this.getAll();
    const otSlot = allSlots.find(s => s.id === id);
    if (!otSlot) {
      throw new Error(`OTSlot with id ${id} not found`);
    }
    return otSlot;
  },

  async create(data: CreateOTSlotDto): Promise<OTSlot> {
    try {
      // Extract numeric ID from string format (e.g., "OT-01" -> 1)
      const numericOtId = parseInt(data.otId.replace('OT-', ''), 10);
      if (isNaN(numericOtId)) {
        throw new Error(`Invalid OT ID format: ${data.otId}`);
      }

      // Map our DTO to API request format
      const requestBody = {
        OTId: numericOtId,
        SlotStartTime: data.slotStartTime,
        SlotEndTime: data.slotEndTime,
        Status: data.status || 'Active',
      };

      const response = await apiRequest<OTSlotCreateResponse>('/ot-slots', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      if (!response.success) {
        throw new Error(response.message || 'Failed to create OT slot');
      }

      // Map API response to our format
      return mapOTSlotResponseToOTSlot(response.data);
    } catch (error) {
      console.error('Error creating OT slot:', error);
      throw error;
    }
  },

  async update(data: UpdateOTSlotDto): Promise<OTSlot> {
    try {
      // Build request body with only provided fields
      const requestBody: Record<string, unknown> = {};
      
      if (data.otId !== undefined) {
        // Extract numeric ID from string format (e.g., "OT-01" -> 1)
        const numericOtId = parseInt(data.otId.replace('OT-', ''), 10);
        if (isNaN(numericOtId)) {
          throw new Error(`Invalid OT ID format: ${data.otId}`);
        }
        requestBody.OTId = numericOtId;
      }
      if (data.slotStartTime !== undefined) {
        requestBody.SlotStartTime = data.slotStartTime;
      }
      if (data.slotEndTime !== undefined) {
        requestBody.SlotEndTime = data.slotEndTime;
      }
      if (data.status !== undefined) {
        requestBody.Status = data.status;
      }

      const response = await apiRequest<OTSlotCreateResponse>(`/ot-slots/${data.id}`, {
        method: 'PUT',
        body: JSON.stringify(requestBody),
      });

      if (!response.success) {
        throw new Error(response.message || 'Failed to update OT slot');
      }

      // Map API response to our format
      return mapOTSlotResponseToOTSlot(response.data);
    } catch (error) {
      console.error('Error updating OT slot:', error);
      throw error;
    }
  },

  async delete(id: number): Promise<void> {
    try {
      const response = await apiRequest<OTSlotCreateResponse>(`/ot-slots/${id}`, {
        method: 'DELETE',
      });

      if (!response.success) {
        throw new Error(response.message || 'Failed to delete OT slot');
      }

      // Delete endpoint returns the deleted item in data, but we don't need to return it
      // The method signature is Promise<void>
    } catch (error) {
      console.error('Error deleting OT slot:', error);
      throw error;
    }
  },
};

