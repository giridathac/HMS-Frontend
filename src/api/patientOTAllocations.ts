// Patient OT Allocations API service
import { apiRequest } from './base';
import { PatientOTAllocation } from '../types';
import { formatDateIST } from '../utils/timeUtils';

// API Response types
interface PatientOTAllocationResponseItem {
  PatientOTAllocationId: number;
  PatientId: string;
  PatientAppointmentId?: number | null;
  EmergencyBedSlotId?: number | null;
  OTId: number;
  SurgeryId?: number | null;
  LeadSurgeonId: number;
  AssistantDoctorId?: number | null;
  AnaesthetistId?: number | null;
  NurseId?: number | null;
  OTAllocationDate: string | Date;
  Duration?: number | null;
  OTStartTime?: string | null;
  OTEndTime?: string | null;
  OTActualStartTime?: string | null;
  OTActualEndTime?: string | null;
  OperationDescription?: string | null;
  OperationStatus: string; // "Scheduled" | "In Progress" | "Completed" | "Cancelled" | "Postponed"
  PreOperationNotes?: string | null;
  PostOperationNotes?: string | null;
  OTDocuments?: string | null;
  BillId?: number | null;
  OTAllocationCreatedBy?: number | null;
  OTAllocationCreatedAt?: string | Date;
  Status: string; // "Active" | "Inactive"
  // Additional response fields
  PatientName?: string | null;
  PatientNo?: string | null;
  OTNo?: string | null;
  SurgeryName?: string | null;
  LeadSurgeonName?: string | null;
  AssistantDoctorName?: string | null;
  AnaesthetistName?: string | null;
  NurseName?: string | null;
  BillNo?: string | null;
  CreatedByName?: string | null;
  // OT Slot fields (from GET by ID endpoint)
  OTSlotNo?: number | null;
  SlotStartTime?: string | null;
  SlotEndTime?: string | null;
  OTSlotStatus?: string | null; // "Active" | "InActive"
  // Array of slot IDs for this allocation
  OTSlotIds?: number[] | null;
}

interface PatientOTAllocationAPIResponse {
  success: boolean;
  count: number;
  data: PatientOTAllocationResponseItem[];
}

interface PatientOTAllocationCreateResponse {
  success: boolean;
  message: string;
  data: PatientOTAllocationResponseItem;
}

interface PatientOTAllocationGetByIdResponse {
  success: boolean;
  data: PatientOTAllocationResponseItem;
}


// Map backend response to frontend format
function mapPatientOTAllocationFromBackend(backendData: PatientOTAllocationResponseItem): PatientOTAllocation {
  try {
    // Map OperationStatus: "In Progress" -> "InProgress" for frontend compatibility
    let operationStatus: 'Scheduled' | 'InProgress' | 'Completed' | 'Cancelled' | 'Postponed' = 'Scheduled';
    if (backendData.OperationStatus) {
      const status = backendData.OperationStatus.trim();
      if (status === 'In Progress') {
        operationStatus = 'InProgress';
      } else if (status === 'Scheduled' || status === 'Completed' || status === 'Cancelled' || status === 'Postponed') {
        operationStatus = status as 'Scheduled' | 'Completed' | 'Cancelled' | 'Postponed';
      } else if (status === 'InProgress') {
        operationStatus = 'InProgress';
      }
    }

    return {
      id: backendData.PatientOTAllocationId,
      patientOTAllocationId: backendData.PatientOTAllocationId,
      patientId: backendData.PatientId,
      patientAppointmentId: backendData.PatientAppointmentId?.toString(),
      emergencyBedSlotId: backendData.EmergencyBedSlotId,
      otId: backendData.OTId,
      surgeryId: backendData.SurgeryId,
      leadSurgeonId: backendData.LeadSurgeonId,
      assistantDoctorId: backendData.AssistantDoctorId,
      anaesthetistId: backendData.AnaesthetistId,
      nurseId: backendData.NurseId,
      otAllocationDate: formatDateIST(backendData.OTAllocationDate),
      duration: backendData.Duration?.toString(),
      otStartTime: backendData.OTStartTime || '',
      otEndTime: backendData.OTEndTime || '',
      otActualStartTime: backendData.OTActualStartTime,
      otActualEndTime: backendData.OTActualEndTime,
      operationDescription: backendData.OperationDescription,
      operationStatus,
      preOperationNotes: backendData.PreOperationNotes,
      postOperationNotes: backendData.PostOperationNotes,
      otDocuments: backendData.OTDocuments,
      billId: backendData.BillId,
      otAllocationCreatedBy: backendData.OTAllocationCreatedBy,
      otAllocationCreatedAt: typeof backendData.OTAllocationCreatedAt === 'string' 
        ? backendData.OTAllocationCreatedAt 
        : backendData.OTAllocationCreatedAt 
          ? new Date(backendData.OTAllocationCreatedAt).toISOString() 
          : undefined,
      status: (backendData.Status === 'Active' ? 'Active' : 'InActive') as 'Active' | 'InActive',
      otSlotIds: Array.isArray(backendData.OTSlotIds) ? backendData.OTSlotIds : [],
    };
  } catch (error) {
    console.error('Error mapping PatientOTAllocation from backend:', error, backendData);
    throw error;
  }
}

// Frontend DTOs
export interface CreatePatientOTAllocationDto {
  patientId: string; // Required (UUID)
  roomAdmissionId?: number | null;
  patientAppointmentId?: number | null;
  emergencyBedSlotId?: number | null;
  otId: number; // Required
  otSlotIds?: number[]; // Array of slot IDs
  surgeryId?: number | null;
  leadSurgeonId: number; // Required
  assistantDoctorId?: number | null;
  anaesthetistId?: number | null;
  nurseId?: number | null;
  otAllocationDate: string; // Required (YYYY-MM-DD)
  duration?: number | null;
  otStartTime?: string | null; // HH:MM or HH:MM:SS
  otEndTime?: string | null; // HH:MM or HH:MM:SS
  otActualStartTime?: string | null; // HH:MM or HH:MM:SS
  otActualEndTime?: string | null; // HH:MM or HH:MM:SS
  operationDescription?: string | null;
  operationStatus?: 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled' | 'Postponed';
  preOperationNotes?: string | null;
  postOperationNotes?: string | null;
  otDocuments?: string | null;
  billId?: number | null;
  otAllocationCreatedBy?: number | null;
  status?: 'Active' | 'Inactive';
}

export interface UpdatePatientOTAllocationDto {
  id: number;
  patientId?: string;
  patientAppointmentId?: number | null;
  emergencyBedSlotId?: number | null;
  otId?: number;
  otSlotIds?: number[];
  surgeryId?: number | null;
  leadSurgeonId?: number;
  assistantDoctorId?: number | null;
  anaesthetistId?: number | null;
  nurseId?: number | null;
  otAllocationDate?: string;
  duration?: number | null;
  otStartTime?: string | null;
  otEndTime?: string | null;
  otActualStartTime?: string | null;
  otActualEndTime?: string | null;
  operationDescription?: string | null;
  operationStatus?: 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled' | 'Postponed';
  preOperationNotes?: string | null;
  postOperationNotes?: string | null;
  otDocuments?: string | null;
  billId?: number | null;
  otAllocationCreatedBy?: number | null;
  status?: 'Active' | 'Inactive';
}

export const patientOTAllocationsApi = {
  async getAll(status?: string): Promise<PatientOTAllocation[]> {
    const params = new URLSearchParams();
    if (status) {
      params.append('status', status);
    }
    
    const queryString = params.toString();
    const endpoint = `/patient-ot-allocations${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiRequest<PatientOTAllocationAPIResponse>(endpoint);
    
    if (response.success && Array.isArray(response.data)) {
      return response.data.map(mapPatientOTAllocationFromBackend);
    }
    
    return [];
  },

  async getById(id: number): Promise<PatientOTAllocation> {
    const response = await apiRequest<PatientOTAllocationGetByIdResponse>(`/patient-ot-allocations/${id}`);
    if (response.success && response.data) {
      return mapPatientOTAllocationFromBackend(response.data);
    }
    throw new Error('Patient OT allocation not found');
  },

  async create(data: CreatePatientOTAllocationDto): Promise<PatientOTAllocation> {
    try {
      console.log('Creating patient OT allocation via API:', data);
      
      // Convert frontend DTO (camelCase) to backend request (PascalCase)
      // Map OperationStatus: "InProgress" -> "In Progress" for backend
      let operationStatus = data.operationStatus || 'Scheduled';
      if (operationStatus === 'InProgress') {
        operationStatus = 'In Progress';
      }
      
      const backendRequest: any = {
        PatientId: data.patientId, // Required
        RoomAdmissionId: data.roomAdmissionId ?? null,
        PatientAppointmentId: data.patientAppointmentId ?? null,
        EmergencyBedSlotId: data.emergencyBedSlotId ?? null,
        OTId: data.otId, // Required
        OTSlotIds: data.otSlotIds ?? [],
        SurgeryId: data.surgeryId ?? null,
        LeadSurgeonId: data.leadSurgeonId, // Required
        AssistantDoctorId: data.assistantDoctorId ?? null,
        AnaesthetistId: data.anaesthetistId ?? null,
        NurseId: data.nurseId ?? null,
        OTAllocationDate: data.otAllocationDate, // Required (YYYY-MM-DD)
        Duration: data.duration ?? null,
        OTStartTime: data.otStartTime ?? null,
        OTEndTime: data.otEndTime ?? null,
        OTActualStartTime: data.otActualStartTime ?? null,
        OTActualEndTime: data.otActualEndTime ?? null,
        OperationDescription: data.operationDescription ?? null,
        OperationStatus: operationStatus,
        PreOperationNotes: data.preOperationNotes ?? null,
        PostOperationNotes: data.postOperationNotes ?? null,
        OTDocuments: data.otDocuments ?? null,
        BillId: data.billId ?? null,
        OTAllocationCreatedBy: data.otAllocationCreatedBy ?? null,
        Status: data.status || 'Active',
      };
      
      console.log('Backend create request:', backendRequest);
      
      const response = await apiRequest<PatientOTAllocationCreateResponse>('/patient-ot-allocations', {
        method: 'POST',
        body: JSON.stringify(backendRequest),
      });
      
      console.log('Patient OT allocation create response:', response);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to create patient OT allocation');
      }
      
      const allocation = mapPatientOTAllocationFromBackend(response.data);
      console.log('Mapped created patient OT allocation:', allocation);
      console.log('PatientOTAllocationId from response:', response.data.PatientOTAllocationId);
      console.log('ID field in mapped allocation:', allocation.id);
      console.log('patientOTAllocationId field in mapped allocation:', allocation.patientOTAllocationId);
      
      // Ensure id is set from PatientOTAllocationId
      if (allocation.id !== response.data.PatientOTAllocationId) {
        console.warn('ID mismatch! Setting id from PatientOTAllocationId');
        allocation.id = response.data.PatientOTAllocationId;
        allocation.patientOTAllocationId = response.data.PatientOTAllocationId;
      }
      
      return allocation;
    } catch (error) {
      console.error('Error creating patient OT allocation:', error);
      throw error;
    }
  },

  async update(data: UpdatePatientOTAllocationDto): Promise<PatientOTAllocation> {
    try {
      console.log('Updating patient OT allocation via API:', data);
      console.log('Using ID for update:', data.id);
      console.log('ID type:', typeof data.id);
      
      // Ensure id is a number (PatientOTAllocationId)
      const updateId = typeof data.id === 'number' ? data.id : Number(data.id);
      if (isNaN(updateId) || !Number.isInteger(updateId) || updateId <= 0) {
        throw new Error(`Invalid PatientOTAllocationId: ${data.id}. Must be a positive integer.`);
      }
      
      console.log('Using PatientOTAllocationId for PUT request:', updateId);
      
      // Convert frontend DTO (camelCase) to backend request (PascalCase)
      const backendRequest: any = {};
      
      if (data.patientId !== undefined) backendRequest.PatientId = data.patientId;
      if (data.patientAppointmentId !== undefined) backendRequest.PatientAppointmentId = data.patientAppointmentId ?? null;
      if (data.emergencyBedSlotId !== undefined) backendRequest.EmergencyBedSlotId = data.emergencyBedSlotId ?? null;
      if (data.otId !== undefined) backendRequest.OTId = data.otId;
      // Always include OTSlotIds as an array (non-null requirement)
      // Include it even if undefined to ensure it's always sent
      backendRequest.OTSlotIds = (data.otSlotIds !== undefined) ? data.otSlotIds : [];
      if (data.surgeryId !== undefined) backendRequest.SurgeryId = data.surgeryId ?? null;
      if (data.leadSurgeonId !== undefined) backendRequest.LeadSurgeonId = data.leadSurgeonId;
      if (data.assistantDoctorId !== undefined) backendRequest.AssistantDoctorId = data.assistantDoctorId ?? null;
      if (data.anaesthetistId !== undefined) backendRequest.AnaesthetistId = data.anaesthetistId ?? null;
      if (data.nurseId !== undefined) backendRequest.NurseId = data.nurseId ?? null;
      if (data.otAllocationDate !== undefined) backendRequest.OTAllocationDate = data.otAllocationDate;
      if (data.duration !== undefined) backendRequest.Duration = data.duration ?? null;
      if (data.otStartTime !== undefined) backendRequest.OTStartTime = data.otStartTime ?? null;
      if (data.otEndTime !== undefined) backendRequest.OTEndTime = data.otEndTime ?? null;
      if (data.otActualStartTime !== undefined) backendRequest.OTActualStartTime = data.otActualStartTime ?? null;
      if (data.otActualEndTime !== undefined) backendRequest.OTActualEndTime = data.otActualEndTime ?? null;
      if (data.operationDescription !== undefined) backendRequest.OperationDescription = data.operationDescription ?? null;
      if (data.operationStatus !== undefined) {
        // Map OperationStatus: "InProgress" -> "In Progress" for backend
        let operationStatus = data.operationStatus;
        if (operationStatus === 'InProgress') {
          operationStatus = 'In Progress';
        }
        backendRequest.OperationStatus = operationStatus;
      }
      if (data.preOperationNotes !== undefined) backendRequest.PreOperationNotes = data.preOperationNotes ?? null;
      if (data.postOperationNotes !== undefined) backendRequest.PostOperationNotes = data.postOperationNotes ?? null;
      if (data.otDocuments !== undefined) backendRequest.OTDocuments = data.otDocuments ?? null;
      if (data.billId !== undefined) backendRequest.BillId = data.billId ?? null;
      if (data.otAllocationCreatedBy !== undefined) backendRequest.OTAllocationCreatedBy = data.otAllocationCreatedBy ?? null;
      if (data.status !== undefined) backendRequest.Status = data.status;
      
      console.log('Backend update request:', backendRequest);
      console.log('PUT endpoint:', `/patient-ot-allocations/${updateId}`);
      
      const response = await apiRequest<PatientOTAllocationCreateResponse>(`/patient-ot-allocations/${updateId}`, {
        method: 'PUT',
        body: JSON.stringify(backendRequest),
      });
      
      console.log('Patient OT allocation update response:', response);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to update patient OT allocation');
      }
      
      const allocation = mapPatientOTAllocationFromBackend(response.data);
      console.log('Mapped updated patient OT allocation:', allocation);
      return allocation;
    } catch (error) {
      console.error('Error updating patient OT allocation:', error);
      throw error;
    }
  },

  async delete(id: number): Promise<void> {
    try {
      const appointmentId = Number(id);
      if (isNaN(appointmentId) || !Number.isInteger(appointmentId) || appointmentId <= 0) {
        throw new Error(`Invalid PatientOTAllocationId: ${id}. Must be a positive integer.`);
      }
      
      console.log('Deleting patient OT allocation via API:', appointmentId);
      
      const response = await apiRequest<{ success: boolean; message: string }>(`/patient-ot-allocations/${appointmentId}`, {
        method: 'DELETE',
      });
      
      console.log('Patient OT allocation deletion response:', response);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to delete patient OT allocation');
      }
      
      return;
    } catch (error) {
      console.error('Error deleting patient OT allocation:', error);
      throw error;
    }
  },
};
