// Staff API service
import { apiRequest } from './base';
import { Staff, StaffType, StaffRole } from '../types/staff';

// Stub data
const stubStaff: Staff[] = [
  { id: 1, name: 'Dr. Sarah Johnson', employeeId: 'EMP-001', type: 'inhouse-doctor', role: 'doctor', department: 'Cardiology', specialty: 'Cardiology', phone: '555-1001', email: 'sarah.johnson@hospital.com', joinDate: '2020-01-15', status: 'active' },
  { id: 2, name: 'Dr. Michael Chen', employeeId: 'EMP-002', type: 'inhouse-doctor', role: 'doctor', department: 'Orthopedics', specialty: 'Orthopedics', phone: '555-1002', email: 'michael.chen@hospital.com', joinDate: '2019-03-20', status: 'active' },
  { id: 3, name: 'Dr. James Miller', employeeId: 'EMP-003', type: 'consulting-doctor', role: 'doctor', department: 'Neurology', specialty: 'Neurology', phone: '555-1003', email: 'james.miller@hospital.com', joinDate: '2021-06-10', status: 'active' },
  { id: 4, name: 'Nurse Mary Wilson', employeeId: 'EMP-004', type: 'nurse', role: 'nurse', department: 'Emergency', phone: '555-1004', email: 'mary.wilson@hospital.com', joinDate: '2022-02-01', status: 'active' },
  { id: 5, name: 'Nurse John Davis', employeeId: 'EMP-005', type: 'nurse', role: 'nurse', department: 'ICU', phone: '555-1005', email: 'john.davis@hospital.com', joinDate: '2021-11-15', status: 'active' },
  { id: 6, name: 'Lisa Anderson', employeeId: 'EMP-006', type: 'other', role: 'receptionist', department: 'Front Desk', phone: '555-1006', email: 'lisa.anderson@hospital.com', joinDate: '2023-01-10', status: 'active' },
  { id: 7, name: 'Robert Brown', employeeId: 'EMP-007', type: 'other', role: 'lab-technician', department: 'Laboratory', phone: '555-1007', email: 'robert.brown@hospital.com', joinDate: '2022-05-20', status: 'active' },
  { id: 8, name: 'Emma Taylor', employeeId: 'EMP-008', type: 'other', role: 'pharmacist', department: 'Pharmacy', phone: '555-1008', email: 'emma.taylor@hospital.com', joinDate: '2021-09-05', status: 'active' },
];

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export interface CreateStaffDto {
  name: string;
  employeeId: string;
  type: StaffType;
  role: StaffRole;
  department?: string;
  specialty?: string;
  phone: string;
  email: string;
  joinDate: string;
  status?: 'active' | 'inactive' | 'on-leave';
}

export interface UpdateStaffDto extends Partial<CreateStaffDto> {
  id: number;
}

export const staffApi = {
  async getAll(): Promise<Staff[]> {
    // Replace with: return apiRequest<Staff[]>('/staff');
    await delay(300);
    return Promise.resolve([...stubStaff]);
  },

  async getById(id: number): Promise<Staff> {
    // Replace with: return apiRequest<Staff>(`/staff/${id}`);
    await delay(200);
    const staff = stubStaff.find(s => s.id === id);
    if (!staff) {
      throw new Error(`Staff with id ${id} not found`);
    }
    return Promise.resolve(staff);
  },

  async getByType(type: StaffType): Promise<Staff[]> {
    // Replace with: return apiRequest<Staff[]>(`/staff?type=${type}`);
    await delay(200);
    return Promise.resolve(stubStaff.filter(s => s.type === type));
  },

  async create(data: CreateStaffDto): Promise<Staff> {
    // Replace with: return apiRequest<Staff>('/staff', { method: 'POST', body: JSON.stringify(data) });
    await delay(400);
    const newStaff: Staff = {
      id: stubStaff.length + 1,
      status: 'active',
      ...data,
    };
    stubStaff.push(newStaff);
    return Promise.resolve(newStaff);
  },

  async update(data: UpdateStaffDto): Promise<Staff> {
    // Replace with: return apiRequest<Staff>(`/staff/${data.id}`, { method: 'PUT', body: JSON.stringify(data) });
    await delay(400);
    const index = stubStaff.findIndex(s => s.id === data.id);
    if (index === -1) {
      throw new Error(`Staff with id ${data.id} not found`);
    }
    stubStaff[index] = { ...stubStaff[index], ...data };
    return Promise.resolve(stubStaff[index]);
  },

  async delete(id: number): Promise<void> {
    // Replace with: return apiRequest<void>(`/staff/${id}`, { method: 'DELETE' });
    await delay(300);
    const index = stubStaff.findIndex(s => s.id === id);
    if (index === -1) {
      throw new Error(`Staff with id ${id} not found`);
    }
    stubStaff.splice(index, 1);
    return Promise.resolve();
  },
};

