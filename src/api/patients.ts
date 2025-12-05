// Patient API service
import { apiRequest, ApiError } from './base';
import { Patient } from '../types';

// Stub data - replace with actual API calls
const stubPatients: Patient[] = [
  { id: 1, PatientId: 'PAT-2025-0001', PatientNo: 'P-001', PatientName: 'John', LastName: 'Smith', Age: 45, Gender: 'Male', PhoneNo: '9876543210', AdhaarId: '123456789012', PANCard: 'ABCDE1234F', Address: '123 Main St, City', ChiefComplaint: 'High blood pressure', Status: 'Active', RegisteredBy: 'Dr. Smith', RegisteredDate: '2025-01-15', PatientType: 'OPD' },
  { id: 2, PatientId: 'PAT-2025-0002', PatientNo: 'P-002', PatientName: 'Emma', LastName: 'Wilson', Age: 32, Gender: 'Female', PhoneNo: '9876543211', AdhaarId: '234567890123', PANCard: 'BCDEF2345G', Address: '456 Oak Ave, City', ChiefComplaint: 'Type 2 Diabetes', Status: 'Active', RegisteredBy: 'Dr. Johnson', RegisteredDate: '2025-01-16', PatientType: 'IPD' },
  { id: 3, PatientId: 'PAT-2025-0003', PatientNo: 'P-003', PatientName: 'Robert', LastName: 'Brown', Age: 58, Gender: 'Male', PhoneNo: '9876543212', AdhaarId: '345678901234', PANCard: 'CDEFG3456H', Address: '789 Pine Rd, City', ChiefComplaint: 'Shortness of breath', Status: 'Active', RegisteredBy: 'Dr. Williams', RegisteredDate: '2025-01-17', PatientType: 'OPD' },
  { id: 4, PatientId: 'PAT-2025-0004', PatientNo: 'P-004', PatientName: 'Lisa', LastName: 'Anderson', Age: 41, Gender: 'Female', PhoneNo: '9876543213', AdhaarId: '456789012345', PANCard: 'DEFGH4567I', Address: '321 Elm St, City', ChiefComplaint: 'Severe headaches', Status: 'Active', RegisteredBy: 'Dr. Brown', RegisteredDate: '2025-01-18', PatientType: 'Emergency' },
  { id: 5, PatientId: 'PAT-2025-0005', PatientNo: 'P-005', PatientName: 'David', LastName: 'Taylor', Age: 29, Gender: 'Male', PhoneNo: '9876543214', AdhaarId: '567890123456', PANCard: 'EFGHI5678J', Address: '654 Maple Dr, City', ChiefComplaint: 'Lower back pain', Status: 'Active', RegisteredBy: 'Dr. Davis', RegisteredDate: '2025-01-19', PatientType: 'OPD' },
  { id: 6, PatientId: 'PAT-2025-0006', PatientNo: 'P-006', PatientName: 'Sarah', LastName: 'Martinez', Age: 36, Gender: 'Female', PhoneNo: '9876543215', AdhaarId: '678901234567', PANCard: 'FGHIJ6789K', Address: '987 Cedar Ln, City', ChiefComplaint: 'Seasonal allergies', Status: 'Active', RegisteredBy: 'Dr. Miller', RegisteredDate: '2025-01-20', PatientType: 'Follow-up' },
  { id: 7, PatientId: 'PAT-2025-0007', PatientNo: 'P-007', PatientName: 'Michael', LastName: 'Chen', Age: 52, Gender: 'Male', PhoneNo: '9876543216', AdhaarId: '789012345678', PANCard: 'GHIJK7890L', Address: '147 Birch Way, City', ChiefComplaint: 'Joint pain and stiffness', Status: 'Active', RegisteredBy: 'Dr. Wilson', RegisteredDate: '2025-01-21', PatientType: 'IPD' },
  { id: 8, PatientId: 'PAT-2025-0008', PatientNo: 'P-008', PatientName: 'Priya', LastName: 'Patel', Age: 28, Gender: 'Female', PhoneNo: '9876543217', AdhaarId: '890123456789', PANCard: 'HIJKL8901M', Address: '258 Spruce St, City', ChiefComplaint: 'Fatigue and weakness', Status: 'Active', RegisteredBy: 'Dr. Anderson', RegisteredDate: '2025-01-22', PatientType: 'OPD' },
  { id: 9, PatientId: 'PAT-2025-0009', PatientNo: 'P-009', PatientName: 'James', LastName: 'Rodriguez', Age: 38, Gender: 'Male', PhoneNo: '9876543218', AdhaarId: '901234567890', PANCard: 'IJKLM9012N', Address: '369 Willow Ave, City', ChiefComplaint: 'Chest pain', Status: 'Active', RegisteredBy: 'Dr. Taylor', RegisteredDate: '2025-01-23', PatientType: 'Emergency' },
  { id: 10, PatientId: 'PAT-2025-0010', PatientNo: 'P-010', PatientName: 'Maria', LastName: 'Garcia', Age: 44, Gender: 'Female', PhoneNo: '9876543219', AdhaarId: '012345678901', PANCard: 'JKLMN0123O', Address: '741 Ash Blvd, City', ChiefComplaint: 'Weight gain and fatigue', Status: 'Active', RegisteredBy: 'Dr. Martinez', RegisteredDate: '2025-01-24', PatientType: 'Follow-up' },
];

export interface CreatePatientDto {
  PatientNo?: string;
  PatientName: string;
  PatientType?: string;
  LastName?: string;
  AdhaarID?: string;
  PANCard?: string;
  PhoneNo: string;
  Gender: string;
  Age: number;
  Address?: string;
  ChiefComplaint?: string;
  Description?: string;
  Status?: string;
  RegisteredBy?: number;
  RegisteredDate?: string;
}

export interface UpdatePatientDto extends Partial<CreatePatientDto> {
  PatientId: string;
}

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Generate unique Patient ID in format PAT-YYYY-XXXX
function generatePatientId(): string {
  const year = new Date().getFullYear();
  const count = stubPatients.length + 1;
  return `PAT-${year}-${count.toString().padStart(4, '0')}`;
}

// Map backend PascalCase response to frontend camelCase format
function mapPatientFromBackend(backendPatient: any, index: number): any {
  // Use PatientId as the primary identifier, fallback to index if missing
  const patientId = backendPatient.PatientId || backendPatient.patientId || `PAT-TEMP-${index}`;
  // Generate a unique id - use existing id if present and unique, otherwise use PatientId hash or index
  // If id exists, use it; otherwise create a unique identifier from PatientId
  const id = backendPatient.id !== undefined && backendPatient.id !== null 
    ? backendPatient.id 
    : (patientId ? `hash-${patientId}-${index}` : index);
  
  return {
    id: id,
    patientId: patientId,
    patientNo: backendPatient.PatientNo || backendPatient.patientNo,
    patientName: backendPatient.PatientName || backendPatient.patientName,
    patientType: backendPatient.PatientType || backendPatient.patientType,
    lastName: backendPatient.LastName || backendPatient.lastName,
    adhaarID: backendPatient.AdhaarId || backendPatient.adhaarID || backendPatient.AdhaarID,
    panCard: backendPatient.PANCard || backendPatient.panCard,
    phoneNo: backendPatient.PhoneNo || backendPatient.phoneNo,
    phone: backendPatient.PhoneNo || backendPatient.phoneNo || backendPatient.phone,
    gender: backendPatient.Gender || backendPatient.gender,
    age: backendPatient.Age || backendPatient.age,
    address: backendPatient.Address || backendPatient.address,
    chiefComplaint: backendPatient.ChiefComplaint || backendPatient.chiefComplaint,
    description: backendPatient.Description || backendPatient.description,
    status: backendPatient.Status || backendPatient.status || 'Active',
    registeredBy: backendPatient.RegisteredBy || backendPatient.registeredBy,
    registeredDate: backendPatient.RegisteredDate || backendPatient.registeredDate,
    // Legacy fields for backward compatibility
    name: backendPatient.PatientName || backendPatient.patientName || backendPatient.name,
    email: backendPatient.email,
    bloodType: backendPatient.bloodType,
    lastVisit: backendPatient.lastVisit,
    condition: backendPatient.condition,
    followUpCount: backendPatient.followUpCount,
  };
}

export const patientsApi = {
  async getAll(): Promise<Patient[]> {
    try {
      console.log('Fetching patients from API endpoint: /patients');
      const response = await apiRequest<any>('/patients');
      console.log('Raw API response:', response);
      
      // Handle different response structures:
      // 1. { success: true, data: [...] } - standard API response
      // 2. { data: [...] } - data wrapper
      // 3. [...] - direct array
      let patientsData: any[] = [];
      
      if (response?.success && Array.isArray(response.data)) {
        patientsData = response.data;
        console.log('Found patients in response.data:', patientsData.length);
      } else if (Array.isArray(response?.data)) {
        patientsData = response.data;
        console.log('Found patients in response.data (no success field):', patientsData.length);
      } else if (Array.isArray(response)) {
        patientsData = response;
        console.log('Found patients as direct array:', patientsData.length);
      } else {
        console.warn('Unexpected response structure:', response);
        return [];
      }
      
      if (patientsData.length === 0) {
        console.log('API returned empty array');
        return [];
      }
      
      // Map each patient from backend format to frontend format
      const mappedPatients = patientsData.map((patient, index) => {
        try {
          return mapPatientFromBackend(patient, index);
        } catch (err) {
          console.error(`Error mapping patient at index ${index}:`, err, patient);
          // Return a minimal patient object to prevent crashes
          return {
            id: `error-${index}`,
            patientId: `PAT-ERROR-${index}`,
            patientName: 'Error loading patient',
            status: 'Error',
          };
        }
      });
      
      // Check for duplicate IDs and warn
      const idCounts = new Map();
      mappedPatients.forEach((p, idx) => {
        const key = p.id || p.patientId || idx;
        if (idCounts.has(key)) {
          console.warn(`Duplicate key detected: ${key} at indices ${idCounts.get(key)} and ${idx}`);
          // Make the ID unique by appending index
          p.id = `${key}-${idx}`;
        } else {
          idCounts.set(key, idx);
        }
      });
      
      console.log(`Successfully mapped ${mappedPatients.length} patients`);
      return mappedPatients as any;
    } catch (error) {
      console.error('Error fetching patients:', error);
      // Return empty array to show "No patients found" message instead of crashing
      return [];
    }
  },

  async getById(patientId: string): Promise<Patient> {
    try {
      console.log('Calling getById with PatientId:', patientId);
      const response = await apiRequest<any>(`/patients/${encodeURIComponent(patientId)}`);
      console.log('getById response:', response);
      
      // Handle different response structures: { data: {...} } or direct object
      const patientData = response?.data || response;
      
      if (!patientData) {
        throw new Error(`Patient with PatientId ${patientId} not found`);
      }
      
      // Return the patient data (should match Patient type with PascalCase)
      return patientData as Patient;
    } catch (error) {
      console.error('Error fetching patient by PatientId:', error);
      throw error;
    }
  },

  async create(data: CreatePatientDto | any): Promise<Patient> {
    try {
      // Convert camelCase to PascalCase for backend API
      const backendData: any = {};
      
      // Helper function to clean and add values (removes empty strings, null, undefined)
      const addIfValid = (key: string, value: any) => {
        // Only add if value is not empty string, null, or undefined
        if (value !== undefined && value !== null && value !== '') {
          // Trim strings
          if (typeof value === 'string') {
            const trimmed = value.trim();
            if (trimmed !== '') {
              backendData[key] = trimmed;
            }
          } else {
            backendData[key] = value;
          }
        }
      };
      
      // Map camelCase fields to PascalCase for backend
      // Required fields - these must be present
      const patientName = data.PatientName || data.patientName;
      const phoneNo = data.PhoneNo || data.phoneNo;
      const gender = data.Gender || data.gender;
      const ageValue = data.Age !== undefined ? data.Age : (data.age !== undefined ? data.age : undefined);
      
      // Validate required fields
      if (!patientName || (typeof patientName === 'string' && patientName.trim() === '')) {
        throw new Error('Patient Name is required');
      }
      if (!phoneNo || (typeof phoneNo === 'string' && phoneNo.trim() === '')) {
        throw new Error('Phone Number is required');
      }
      if (!gender || (typeof gender === 'string' && gender.trim() === '')) {
        throw new Error('Gender is required');
      }
      if (ageValue === undefined || ageValue === null || isNaN(Number(ageValue)) || Number(ageValue) <= 0) {
        throw new Error('Age must be a valid positive number');
      }
      
      // Set required fields (always include these)
      backendData.PatientName = typeof patientName === 'string' ? patientName.trim() : patientName;
      backendData.PhoneNo = typeof phoneNo === 'string' ? phoneNo.trim() : phoneNo;
      backendData.Gender = typeof gender === 'string' ? gender.trim() : gender;
      backendData.Age = Number(ageValue);
      
      // Optional fields - only add if they have valid values
      addIfValid('PatientNo', data.PatientNo || data.patientNo);
      addIfValid('PatientType', data.PatientType || data.patientType);
      addIfValid('LastName', data.LastName || data.lastName);
      // AdhaarID - handle both camelCase (adhaarID) and PascalCase (AdhaarID/AdhaarId)
      // Check explicitly for all possible cases to ensure we capture the value
      const adhaarID = data.AdhaarID !== undefined && data.AdhaarID !== null 
        ? data.AdhaarID 
        : (data.AdhaarId !== undefined && data.AdhaarId !== null 
          ? data.AdhaarId 
          : (data.adhaarID !== undefined && data.adhaarID !== null ? data.adhaarID : undefined));
      
      if (adhaarID !== undefined && adhaarID !== null) {
        const trimmedAdhaarID = typeof adhaarID === 'string' ? adhaarID.trim() : String(adhaarID).trim();
        if (trimmedAdhaarID !== '') {
          // Backend expects AdhaarId (with lowercase 'd') based on stub data
          backendData.AdhaarID = trimmedAdhaarID;
          console.log('AdhaarID captured from form and added as AdhaarId:', trimmedAdhaarID);
        } else {
          console.log('AdhaarID was empty after trim, not adding');
        }
      } else {
        console.log('AdhaarID not provided in data:', { 
          AdhaarID: data.AdhaarID, 
          AdhaarId: data.AdhaarId,
          adhaarID: data.adhaarID 
        });
      }
       
      addIfValid('PANCard', data.PANCard || data.panCard);
      addIfValid('Address', data.Address || data.address);
      addIfValid('ChiefComplaint', data.ChiefComplaint || data.chiefComplaint);
      addIfValid('Description', data.Description || data.description);
      
      // RegisteredBy - send as integer (default to 1 if not provided, or get from auth context)
      // TODO: Replace with actual user ID from authentication context
      const registeredBy = data.RegisteredBy !== undefined ? data.RegisteredBy : (data.registeredBy !== undefined ? data.registeredBy : 1);
      // Ensure it's a number
      const registeredById = typeof registeredBy === 'number' ? registeredBy : (typeof registeredBy === 'string' ? parseInt(registeredBy) || 1 : 1);
      backendData.RegisteredBy = registeredById;
      
      // Status and RegisteredDate are not sent - backend will set defaults

      // Final validation - ensure all required fields are present
      if (!backendData.PatientName || !backendData.PhoneNo || !backendData.Gender || !backendData.Age) {
        throw new Error('Missing required fields: PatientName, PhoneNo, Gender, and Age are required');
      }
      console.log('Creating patient with data:', JSON.stringify(backendData, null, 2));
      console.log('Request payload size:', JSON.stringify(backendData).length, 'bytes');
      
      // Call the actual API endpoint
      const response = await apiRequest<any>('/patients', {
        method: 'POST',
        body: JSON.stringify(backendData),
      });
      
      console.log('Create patient API response:', response);
      
      // Handle different response structures: { data: {...} } or direct object
      const patientData = response?.data || response;
      console.log('Patient data***************:', patientData);
      if (!patientData) {
        throw new Error('No patient data received from API');
      }
      
      // Map the response back to Patient type
      return mapPatientFromBackend(patientData, 0);
    } catch (error: any) {
      console.error('Error creating patient:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.status,
        data: error.data,
        stack: error.stack
      });
      
      // Re-throw API errors with detailed message
      if (error instanceof ApiError) {
        // Extract error message from API response
        const errorData = error.data as any;
        const errorMessage = errorData?.message || errorData?.error || error.message || 'Failed to create patient';
        const errorDetails = errorData?.errors || errorData?.details;
        
        let fullErrorMessage = errorMessage;
        if (errorDetails) {
          if (Array.isArray(errorDetails)) {
            fullErrorMessage += ': ' + errorDetails.join(', ');
          } else if (typeof errorDetails === 'object') {
            fullErrorMessage += ': ' + JSON.stringify(errorDetails);
          } else {
            fullErrorMessage += ': ' + errorDetails;
          }
        }
        
        throw new Error(fullErrorMessage);
      }
      
      // Re-throw validation errors
      if (error instanceof Error) {
        throw error;
      }
      
      // Fallback error
      throw new Error('Failed to create patient. Please check the console for details.');
    }
  },

  async update(data: UpdatePatientDto | any): Promise<Patient> {
    try {
      // Validate that PatientId is provided
      const patientId = data.PatientId;
      if (!patientId) {
        throw new Error('PatientId is required for update operation');
      }

      console.log('Updating patient with PatientId:', patientId);
      console.log('Update data being sent (raw):', data);
      
      // Convert camelCase to PascalCase for backend
      // The backend expects PascalCase in the request body
      const backendData: any = {
        PatientId: patientId,
      };
      
      // Map camelCase fields to PascalCase for backend
      // Handle both camelCase (from component) and PascalCase (from DTO) inputs
      if (data.patientNo !== undefined || data.PatientNo !== undefined) {
        backendData.PatientNo = data.PatientNo || data.patientNo;
      }
      if (data.patientName !== undefined || data.PatientName !== undefined) {
        backendData.PatientName = data.PatientName || data.patientName;
      }
      if (data.patientType !== undefined || data.PatientType !== undefined) {
        backendData.PatientType = data.PatientType || data.patientType;
      }
      if (data.lastName !== undefined || data.LastName !== undefined) {
        backendData.LastName = data.LastName || data.lastName;
      }
      if (data.adhaarID !== undefined || data.AdhaarID !== undefined) {
        backendData.AdhaarID = data.AdhaarID || data.adhaarID;
      }
      if (data.panCard !== undefined || data.PANCard !== undefined) {
        backendData.PANCard = data.PANCard || data.panCard;
      }
      if (data.phoneNo !== undefined || data.PhoneNo !== undefined) {
        backendData.PhoneNo = data.PhoneNo || data.phoneNo;
      }
      if (data.gender !== undefined || data.Gender !== undefined) {
        backendData.Gender = data.Gender || data.gender;
      }
      if (data.age !== undefined || data.Age !== undefined) {
        backendData.Age = data.Age || data.age;
      }
      if (data.address !== undefined || data.Address !== undefined) {
        backendData.Address = data.Address || data.address;
      }
      if (data.chiefComplaint !== undefined || data.ChiefComplaint !== undefined) {
        backendData.ChiefComplaint = data.ChiefComplaint || data.chiefComplaint;
      }
      if (data.description !== undefined || data.Description !== undefined) {
        backendData.Description = data.Description || data.description;
      }
      if (data.status !== undefined || data.Status !== undefined) {
        backendData.Status = data.Status || data.status;
      }
      if (data.registeredBy !== undefined || data.RegisteredBy !== undefined) {
        backendData.RegisteredBy = data.RegisteredBy || data.registeredBy;
      }
      if (data.registeredDate !== undefined || data.RegisteredDate !== undefined) {
        backendData.RegisteredDate = data.RegisteredDate || data.registeredDate;
      }
      
      console.log('Backend data format (PascalCase):', backendData);
      
      // The PatientId is used in the URL path: PUT /patients/{PatientId}
      const response = await apiRequest<any>(
        `/patients/${encodeURIComponent(patientId)}`,
        {
          method: 'PUT',
          body: JSON.stringify(backendData),
        }
      );
      
      console.log('Raw API response:', response);
      
      // Handle different response structures
      let patientData: any;
      if (response?.data) {
        patientData = response.data;
      } else if (response?.success && response?.data) {
        patientData = response.data;
      } else if (Array.isArray(response)) {
        // If response is an array, take first item (shouldn't happen for update)
        patientData = response[0];
      } else {
        patientData = response;
      }
      
      console.log('Extracted patientData:', patientData);
            
      // Map the response back to Patient type if needed
      return mapPatientFromBackend(patientData, 0);
    } catch (error) {
      console.error('Error updating patient:', error);
      throw error;
    }
  },

  async incrementFollowUpCount(patientId: number): Promise<Patient> {
    // Replace with: return apiRequest<Patient>(`/patients/${patientId}/follow-up`, { method: 'POST' });
    await delay(300);
    const index = stubPatients.findIndex(p => p.id === patientId);
    if (index === -1) {
      throw new Error(`Patient with id ${patientId} not found`);
    }
    // Note: followUpCount and lastVisit are not in Patient type, so we can't update them here
    // This method should be updated to use real API call
    return Promise.resolve(stubPatients[index]);
  },

  async findByPhone(phone: string): Promise<Patient | null> {
    // Replace with: return apiRequest<Patient | null>(`/patients?phone=${phone}`);
    await delay(200);
    const patient = stubPatients.find(p => p.PhoneNo === phone);
    return Promise.resolve(patient || null);
  },

  async delete(id: number): Promise<void> {
    // Replace with: return apiRequest<void>(`/patients/${id}`, { method: 'DELETE' });
    await delay(300);
    const index = stubPatients.findIndex(p => p.id === id);
    if (index === -1) {
      throw new Error(`Patient with id ${id} not found`);
    }
    stubPatients.splice(index, 1);
    return Promise.resolve();
  },
};

