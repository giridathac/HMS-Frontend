// Patient API service
import { apiRequest } from './base';
import { Patient } from '../types';

// Stub data - replace with actual API calls
const stubPatients: Patient[] = [
  { id: 1, patientId: 'PAT-2025-0001', patientNo: 'P-001', patientName: 'John', lastName: 'Smith', age: 45, gender: 'Male', phoneNo: '9876543210', phone: '9876543210', name: 'John Smith', email: 'john.smith@email.com', bloodType: 'O+', lastVisit: '2025-11-08', condition: 'Hypertension', followUpCount: 2, patientType: 'OPD', adhaarID: '123456789012', panCard: 'ABCDE1234F', address: '123 Main St, City', chiefComplaint: 'High blood pressure', status: 'Active', registeredBy: 'Dr. Smith', registeredDate: '2025-01-15' },
  { id: 2, patientId: 'PAT-2025-0002', patientNo: 'P-002', patientName: 'Emma', lastName: 'Wilson', age: 32, gender: 'Female', phoneNo: '9876543211', phone: '9876543211', name: 'Emma Wilson', email: 'emma.wilson@email.com', bloodType: 'A+', lastVisit: '2025-11-10', condition: 'Diabetes', followUpCount: 1, patientType: 'IPD', adhaarID: '234567890123', panCard: 'BCDEF2345G', address: '456 Oak Ave, City', chiefComplaint: 'Type 2 Diabetes', status: 'Active', registeredBy: 'Dr. Johnson', registeredDate: '2025-01-16' },
  { id: 3, patientId: 'PAT-2025-0003', patientNo: 'P-003', patientName: 'Robert', lastName: 'Brown', age: 58, gender: 'Male', phoneNo: '9876543212', phone: '9876543212', name: 'Robert Brown', email: 'robert.brown@email.com', bloodType: 'B+', lastVisit: '2025-11-05', condition: 'Asthma', followUpCount: 0, patientType: 'OPD', adhaarID: '345678901234', panCard: 'CDEFG3456H', address: '789 Pine Rd, City', chiefComplaint: 'Shortness of breath', status: 'Active', registeredBy: 'Dr. Williams', registeredDate: '2025-01-17' },
  { id: 4, patientId: 'PAT-2025-0004', patientNo: 'P-004', patientName: 'Lisa', lastName: 'Anderson', age: 41, gender: 'Female', phoneNo: '9876543213', phone: '9876543213', name: 'Lisa Anderson', email: 'lisa.anderson@email.com', bloodType: 'AB+', lastVisit: '2025-11-09', condition: 'Migraine', followUpCount: 3, patientType: 'Emergency', adhaarID: '456789012345', panCard: 'DEFGH4567I', address: '321 Elm St, City', chiefComplaint: 'Severe headaches', status: 'Active', registeredBy: 'Dr. Brown', registeredDate: '2025-01-18' },
  { id: 5, patientId: 'PAT-2025-0005', patientNo: 'P-005', patientName: 'David', lastName: 'Taylor', age: 29, gender: 'Male', phoneNo: '9876543214', phone: '9876543214', name: 'David Taylor', email: 'david.taylor@email.com', bloodType: 'O-', lastVisit: '2025-11-11', condition: 'Back Pain', followUpCount: 0, patientType: 'OPD', adhaarID: '567890123456', panCard: 'EFGHI5678J', address: '654 Maple Dr, City', chiefComplaint: 'Lower back pain', status: 'Active', registeredBy: 'Dr. Davis', registeredDate: '2025-01-19' },
  { id: 6, patientId: 'PAT-2025-0006', patientNo: 'P-006', patientName: 'Sarah', lastName: 'Martinez', age: 36, gender: 'Female', phoneNo: '9876543215', phone: '9876543215', name: 'Sarah Martinez', email: 'sarah.martinez@email.com', bloodType: 'A-', lastVisit: '2025-11-07', condition: 'Allergies', followUpCount: 1, patientType: 'Follow-up', adhaarID: '678901234567', panCard: 'FGHIJ6789K', address: '987 Cedar Ln, City', chiefComplaint: 'Seasonal allergies', status: 'Active', registeredBy: 'Dr. Miller', registeredDate: '2025-01-20' },
  { id: 7, patientId: 'PAT-2025-0007', patientNo: 'P-007', patientName: 'Michael', lastName: 'Chen', age: 52, gender: 'Male', phoneNo: '9876543216', phone: '9876543216', name: 'Michael Chen', email: 'michael.chen@email.com', bloodType: 'B-', lastVisit: '2025-01-12', condition: 'Arthritis', followUpCount: 2, patientType: 'IPD', adhaarID: '789012345678', panCard: 'GHIJK7890L', address: '147 Birch Way, City', chiefComplaint: 'Joint pain and stiffness', status: 'Active', registeredBy: 'Dr. Wilson', registeredDate: '2025-01-21' },
  { id: 8, patientId: 'PAT-2025-0008', patientNo: 'P-008', patientName: 'Priya', lastName: 'Patel', age: 28, gender: 'Female', phoneNo: '9876543217', phone: '9876543217', name: 'Priya Patel', email: 'priya.patel@email.com', bloodType: 'O+', lastVisit: '2025-01-13', condition: 'Anemia', followUpCount: 1, patientType: 'OPD', adhaarID: '890123456789', panCard: 'HIJKL8901M', address: '258 Spruce St, City', chiefComplaint: 'Fatigue and weakness', status: 'Active', registeredBy: 'Dr. Anderson', registeredDate: '2025-01-22' },
  { id: 9, patientId: 'PAT-2025-0009', patientNo: 'P-009', patientName: 'James', lastName: 'Rodriguez', age: 38, gender: 'Male', phoneNo: '9876543218', phone: '9876543218', name: 'James Rodriguez', email: 'james.rodriguez@email.com', bloodType: 'A+', lastVisit: '2025-01-14', condition: 'Hypertension', followUpCount: 0, patientType: 'Emergency', adhaarID: '901234567890', panCard: 'IJKLM9012N', address: '369 Willow Ave, City', chiefComplaint: 'Chest pain', status: 'Active', registeredBy: 'Dr. Taylor', registeredDate: '2025-01-23' },
  { id: 10, patientId: 'PAT-2025-0010', patientNo: 'P-010', patientName: 'Maria', lastName: 'Garcia', age: 44, gender: 'Female', phoneNo: '9876543219', phone: '9876543219', name: 'Maria Garcia', email: 'maria.garcia@email.com', bloodType: 'AB-', lastVisit: '2025-01-15', condition: 'Thyroid', followUpCount: 3, patientType: 'Follow-up', adhaarID: '012345678901', panCard: 'JKLMN0123O', address: '741 Ash Blvd, City', chiefComplaint: 'Weight gain and fatigue', status: 'Active', registeredBy: 'Dr. Martinez', registeredDate: '2025-01-24' },
];

export interface CreatePatientDto {
  patientNo?: string;
  patientName: string;
  patientType?: string;
  lastName?: string;
  adhaarID?: string;
  panCard?: string;
  phoneNo: string;
  gender: string;
  age: number;
  address?: string;
  chiefComplaint?: string;
  description?: string;
  status?: string;
  registeredBy?: string;
  registeredDate?: string;
  // Legacy fields for backward compatibility
  name?: string;
  phone?: string;
  email?: string;
  bloodType?: string;
  condition?: string;
}

export interface UpdatePatientDto extends Partial<CreatePatientDto> {
  id: number;
}

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Generate unique Patient ID in format PAT-YYYY-XXXX
function generatePatientId(): string {
  const year = new Date().getFullYear();
  const count = stubPatients.length + 1;
  return `PAT-${year}-${count.toString().padStart(4, '0')}`;
}

export const patientsApi = {
  async getAll(): Promise<Patient[]> {
    // Replace with: return apiRequest<Patient[]>('/patients');
    await delay(300);
    return Promise.resolve([...stubPatients]);
  },

  async getById(id: number): Promise<Patient> {
    // Replace with: return apiRequest<Patient>(`/patients/${id}`);
    await delay(200);
    const patient = stubPatients.find(p => p.id === id);
    if (!patient) {
      throw new Error(`Patient with id ${id} not found`);
    }
    return Promise.resolve(patient);
  },

  async create(data: CreatePatientDto): Promise<Patient> {
    // Replace with: return apiRequest<Patient>('/patients', { method: 'POST', body: JSON.stringify(data) });
    await delay(400);
    const newPatient: Patient = {
      id: stubPatients.length + 1,
      patientId: generatePatientId(),
      ...data,
      // Map new fields to legacy fields for backward compatibility
      name: data.patientName || data.name,
      phone: data.phoneNo || data.phone,
      lastVisit: new Date().toISOString().split('T')[0],
      registeredDate: data.registeredDate || new Date().toISOString().split('T')[0],
    };
    stubPatients.push(newPatient);
    return Promise.resolve(newPatient);
  },

  async update(data: UpdatePatientDto): Promise<Patient> {
    // Replace with: return apiRequest<Patient>(`/patients/${data.id}`, { method: 'PUT', body: JSON.stringify(data) });
    await delay(400);
    const index = stubPatients.findIndex(p => p.id === data.id);
    if (index === -1) {
      throw new Error(`Patient with id ${data.id} not found`);
    }
    stubPatients[index] = { ...stubPatients[index], ...data };
    return Promise.resolve(stubPatients[index]);
  },

  async incrementFollowUpCount(patientId: number): Promise<Patient> {
    // Replace with: return apiRequest<Patient>(`/patients/${patientId}/follow-up`, { method: 'POST' });
    await delay(300);
    const index = stubPatients.findIndex(p => p.id === patientId);
    if (index === -1) {
      throw new Error(`Patient with id ${patientId} not found`);
    }
    stubPatients[index].followUpCount = (stubPatients[index].followUpCount || 0) + 1;
    stubPatients[index].lastVisit = new Date().toISOString().split('T')[0];
    return Promise.resolve(stubPatients[index]);
  },

  async findByPhone(phone: string): Promise<Patient | null> {
    // Replace with: return apiRequest<Patient | null>(`/patients?phone=${phone}`);
    await delay(200);
    const patient = stubPatients.find(p => p.phone === phone);
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

