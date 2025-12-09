// Patient OT Allocations API service
import { apiRequest, ENABLE_STUB_DATA } from './base';
import { PatientOTAllocation } from '../types';

// API Response types
interface PatientOTAllocationResponseItem {
  PatientOTAllocationId: number;
  PatientId: string;
  PatientAppointmentId?: number | null;
  EmergencyBedSlotId?: number | null;
  OTId: number;
  OTSlotId?: number | null;
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

// Stub data
const stubPatientOTAllocations: PatientOTAllocationResponseItem[] = [
  {
    PatientOTAllocationId: 1,
    PatientId: '00000000-0000-0000-0000-000000000001',
    OTId: 1,
    LeadSurgeonId: 1,
    OTAllocationDate: '2025-01-15',
    OTStartTime: '08:00',
    OTEndTime: '10:00',
    OperationStatus: 'Scheduled',
    Status: 'Active',
  },
  {
    PatientOTAllocationId: 2,
    PatientId: '00000000-0000-0000-0000-000000000002',
    OTId: 2,
    LeadSurgeonId: 2,
    AssistantDoctorId: 3,
    AnaesthetistId: 4,
    OTAllocationDate: '2025-01-16',
    OTStartTime: '09:00',
    OTEndTime: '12:00',
    OperationDescription: 'Cardiac Bypass Surgery',
    OperationStatus: 'In Progress',
    PreOperationNotes: 'ICU bed reserved post-surgery',
    Status: 'Active',
  },
  {
    PatientOTAllocationId: 3,
    PatientId: '00000000-0000-0000-0000-000000000003',
    PatientAppointmentId: 1,
    OTId: 3,
    LeadSurgeonId: 1,
    OTAllocationDate: '2025-01-17',
    OTStartTime: '10:00',
    OTEndTime: '12:30',
    OperationDescription: 'Knee Replacement',
    OperationStatus: 'Completed',
    OTActualStartTime: '10:05',
    OTActualEndTime: '12:25',
    PostOperationNotes: 'Patient stable, recovery in progress',
    Status: 'Active',
  },
];

// Helper function to delay execution (for stub data simulation)
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Map backend response to frontend format
function mapPatientOTAllocationFromBackend(backendData: PatientOTAllocationResponseItem): PatientOTAllocation {
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
    otSlotId: backendData.OTSlotId,
    surgeryId: backendData.SurgeryId,
    leadSurgeonId: backendData.LeadSurgeonId,
    assistantDoctorId: backendData.AssistantDoctorId,
    anaesthetistId: backendData.AnaesthetistId,
    nurseId: backendData.NurseId,
    otAllocationDate: typeof backendData.OTAllocationDate === 'string' 
      ? backendData.OTAllocationDate.split('T')[0] 
      : new Date(backendData.OTAllocationDate).toISOString().split('T')[0],
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
  };
}

// Frontend DTOs
export interface CreatePatientOTAllocationDto {
  patientId: string; // Required (UUID)
  roomAdmissionId?: number | null;
  patientAppointmentId?: number | null;
  emergencyBedSlotId?: number | null;
  otId: number; // Required
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
  otSlotId?: number | null;
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
    let apiData: PatientOTAllocation[] = [];
    
    try {
      console.log('Fetching patient OT allocations from API endpoint: /patient-ot-allocations', status);
      
      const params = new URLSearchParams();
      if (status) {
        params.append('status', status);
      }
      
      const queryString = params.toString();
      const endpoint = `/patient-ot-allocations${queryString ? `?${queryString}` : ''}`;
      
      const response = await apiRequest<PatientOTAllocationAPIResponse>(endpoint);
      console.log('Patient OT allocations API response:', response);
      
      if (response.success && Array.isArray(response.data)) {
        apiData = response.data.map(mapPatientOTAllocationFromBackend);
        console.log(`Mapped ${apiData.length} patient OT allocations`);
      }
    } catch (error) {
      console.error('Error fetching patient OT allocations:', error);
      if (!ENABLE_STUB_DATA) {
        throw error;
      }
    }
    
    // Append stub data if enabled
    if (ENABLE_STUB_DATA) {
      const apiIds = new Set(apiData.map(a => a.patientOTAllocationId.toString()));
      let filteredStubData = stubPatientOTAllocations.filter(a => {
        const stubId = a.PatientOTAllocationId.toString();
        return !apiIds.has(stubId);
      });
      
      if (status) {
        const statusLower = status.toLowerCase();
        filteredStubData = filteredStubData.filter(a => {
          const aStatus = String(a.Status || '').toLowerCase();
          return aStatus === statusLower;
        });
      }
      
      if (filteredStubData.length > 0) {
        console.log(`Appending ${filteredStubData.length} stub patient OT allocations to ${apiData.length} API records`);
      }
      
      if (apiData.length === 0) {
        console.warn('No patient OT allocations data received from API, using stub data');
        await delay(300);
        return filteredStubData.length > 0 
          ? filteredStubData.map(mapPatientOTAllocationFromBackend) 
          : stubPatientOTAllocations.map(mapPatientOTAllocationFromBackend);
      }
      
      return [...apiData, ...filteredStubData.map(mapPatientOTAllocationFromBackend)];
    }
    
    return apiData;
  },

  async getById(id: number): Promise<PatientOTAllocation> {
    try {
      const response = await apiRequest<PatientOTAllocationGetByIdResponse>(`/patient-ot-allocations/${id}`);
      if (response.success && response.data) {
        return mapPatientOTAllocationFromBackend(response.data);
      }
      throw new Error('Patient OT allocation not found');
    } catch (error) {
      console.error('Error fetching patient OT allocation by ID:', error);
      if (ENABLE_STUB_DATA) {
        await delay(200);
        const stub = stubPatientOTAllocations.find(a => a.PatientOTAllocationId === id);
        if (stub) {
          return mapPatientOTAllocationFromBackend(stub);
        }
      }
      throw error;
    }
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
      
      if (ENABLE_STUB_DATA) {
        console.warn('API create failed, using stub data fallback');
        await delay(400);
        let operationStatus = data.operationStatus || 'Scheduled';
        if (operationStatus === 'InProgress') {
          operationStatus = 'In Progress';
        }
        const newStub: PatientOTAllocationResponseItem = {
          PatientOTAllocationId: stubPatientOTAllocations.length + 1,
          PatientId: data.patientId,
          PatientAppointmentId: data.patientAppointmentId ?? null,
          EmergencyBedSlotId: data.emergencyBedSlotId ?? null,
          OTId: data.otId,
          SurgeryId: data.surgeryId ?? null,
          LeadSurgeonId: data.leadSurgeonId,
          AssistantDoctorId: data.assistantDoctorId ?? null,
          AnaesthetistId: data.anaesthetistId ?? null,
          NurseId: data.nurseId ?? null,
          OTAllocationDate: data.otAllocationDate,
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
        stubPatientOTAllocations.push(newStub);
        return mapPatientOTAllocationFromBackend(newStub);
      }
      
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
      if (data.otSlotId !== undefined) backendRequest.OTSlotId = data.otSlotId ?? null;
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
      
      if (ENABLE_STUB_DATA) {
        console.warn('API update failed, using stub data fallback');
        await delay(400);
        const index = stubPatientOTAllocations.findIndex(a => a.PatientOTAllocationId === data.id);
        if (index === -1) {
          throw new Error(`Patient OT allocation with id ${data.id} not found`);
        }
        
        const updated = { ...stubPatientOTAllocations[index] };
        if (data.patientId !== undefined) updated.PatientId = data.patientId;
        if (data.patientAppointmentId !== undefined) updated.PatientAppointmentId = data.patientAppointmentId ?? null;
        if (data.emergencyBedSlotId !== undefined) updated.EmergencyBedSlotId = data.emergencyBedSlotId ?? null;
        if (data.otId !== undefined) updated.OTId = data.otId;
        if (data.otSlotId !== undefined) updated.OTSlotId = data.otSlotId ?? null;
        if (data.surgeryId !== undefined) updated.SurgeryId = data.surgeryId ?? null;
        if (data.leadSurgeonId !== undefined) updated.LeadSurgeonId = data.leadSurgeonId;
        if (data.assistantDoctorId !== undefined) updated.AssistantDoctorId = data.assistantDoctorId ?? null;
        if (data.anaesthetistId !== undefined) updated.AnaesthetistId = data.anaesthetistId ?? null;
        if (data.nurseId !== undefined) updated.NurseId = data.nurseId ?? null;
        if (data.otAllocationDate !== undefined) updated.OTAllocationDate = data.otAllocationDate;
        if (data.duration !== undefined) updated.Duration = data.duration ?? null;
        if (data.otStartTime !== undefined) updated.OTStartTime = data.otStartTime ?? null;
        if (data.otEndTime !== undefined) updated.OTEndTime = data.otEndTime ?? null;
        if (data.otActualStartTime !== undefined) updated.OTActualStartTime = data.otActualStartTime ?? null;
        if (data.otActualEndTime !== undefined) updated.OTActualEndTime = data.otActualEndTime ?? null;
        if (data.operationDescription !== undefined) updated.OperationDescription = data.operationDescription ?? null;
        if (data.operationStatus !== undefined) {
          let operationStatus = data.operationStatus;
          if (operationStatus === 'InProgress') {
            operationStatus = 'In Progress';
          }
          updated.OperationStatus = operationStatus;
        }
        if (data.preOperationNotes !== undefined) updated.PreOperationNotes = data.preOperationNotes ?? null;
        if (data.postOperationNotes !== undefined) updated.PostOperationNotes = data.postOperationNotes ?? null;
        if (data.otDocuments !== undefined) updated.OTDocuments = data.otDocuments ?? null;
        if (data.billId !== undefined) updated.BillId = data.billId ?? null;
        if (data.otAllocationCreatedBy !== undefined) updated.OTAllocationCreatedBy = data.otAllocationCreatedBy ?? null;
        if (data.status !== undefined) updated.Status = data.status;
        
        stubPatientOTAllocations[index] = updated;
        return mapPatientOTAllocationFromBackend(updated);
      }
      
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
      if (ENABLE_STUB_DATA) {
        await delay(300);
        const index = stubPatientOTAllocations.findIndex(a => a.PatientOTAllocationId === id);
        if (index !== -1) {
          stubPatientOTAllocations.splice(index, 1);
        }
        return;
      }
      throw error;
    }
  },
};
