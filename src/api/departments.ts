// Departments API service
import { apiRequest } from './base';
import { Department, DepartmentCategory } from '../types/departments';

// Stub data
const stubDepartments: Department[] = [
  // Clinical Departments
  { id: 1, name: 'Medicine', category: 'Clinical', description: 'General medicine and internal medicine', headOfDepartment: 'Dr. Emily Davis', location: 'Building A, Floor 2', phone: '555-2001', email: 'medicine@hospital.com', status: 'active' },
  { id: 2, name: 'Pediatrics', category: 'Clinical', description: 'Child healthcare and pediatrics', headOfDepartment: 'Dr. Robert Lee', location: 'Building A, Floor 3', phone: '555-2002', email: 'pediatrics@hospital.com', status: 'active' },
  { id: 3, name: 'ENT', category: 'Clinical', description: 'Ear, Nose, and Throat department', headOfDepartment: 'Dr. Maria Garcia', location: 'Building A, Floor 2', phone: '555-2003', email: 'ent@hospital.com', status: 'active' },
  { id: 4, name: 'Dermatology', category: 'Clinical', description: 'Skin and dermatological conditions', headOfDepartment: 'Dr. David Wilson', location: 'Building A, Floor 2', phone: '555-2004', email: 'dermatology@hospital.com', status: 'active' },
  { id: 5, name: 'Cardiology', category: 'Clinical', description: 'Heart and cardiovascular care', headOfDepartment: 'Dr. Sarah Johnson', location: 'Building B, Floor 1', phone: '555-2005', email: 'cardiology@hospital.com', status: 'active' },
  { id: 6, name: 'Neurology', category: 'Clinical', description: 'Brain and nervous system disorders', headOfDepartment: 'Dr. James Miller', location: 'Building B, Floor 2', phone: '555-2006', email: 'neurology@hospital.com', status: 'active' },
  
  // Surgical Departments
  { id: 7, name: 'General Surgery', category: 'Surgical', description: 'General surgical procedures', headOfDepartment: 'Dr. Michael Chen', location: 'Building C, Floor 1', phone: '555-3001', email: 'surgery@hospital.com', status: 'active' },
  { id: 8, name: 'Orthopedics', category: 'Surgical', description: 'Bone and joint surgery', headOfDepartment: 'Dr. Michael Chen', location: 'Building C, Floor 2', phone: '555-3002', email: 'orthopedics@hospital.com', status: 'active' },
  { id: 9, name: 'Neurosurgery', category: 'Surgical', description: 'Brain and spine surgery', headOfDepartment: 'Dr. James Miller', location: 'Building C, Floor 3', phone: '555-3003', email: 'neurosurgery@hospital.com', status: 'active' },
  { id: 10, name: 'Cardiac Surgery', category: 'Surgical', description: 'Heart surgery and procedures', headOfDepartment: 'Dr. Sarah Johnson', location: 'Building C, Floor 1', phone: '555-3004', email: 'cardiacsurgery@hospital.com', status: 'active' },
  
  // Diagnostic Departments
  { id: 11, name: 'Radiology', category: 'Diagnostic', description: 'Medical imaging and radiology', headOfDepartment: 'Dr. Lisa Anderson', location: 'Building D, Floor 1', phone: '555-4001', email: 'radiology@hospital.com', status: 'active' },
  { id: 12, name: 'Laboratory', category: 'Diagnostic', description: 'Clinical laboratory and pathology', headOfDepartment: 'Dr. John Smith', location: 'Building D, Floor 2', phone: '555-4002', email: 'laboratory@hospital.com', status: 'active' },
  
  // Support Departments
  { id: 13, name: 'Pharmacy', category: 'Support', description: 'Pharmacy and medication dispensing', headOfDepartment: 'Emma Taylor', location: 'Building E, Floor 1', phone: '555-5001', email: 'pharmacy@hospital.com', status: 'active' },
  { id: 14, name: 'Emergency', category: 'Support', description: 'Emergency and trauma care', headOfDepartment: 'Dr. Robert Brown', location: 'Building A, Ground Floor', phone: '555-5002', email: 'emergency@hospital.com', status: 'active' },
  
  // Administrative Departments
  { id: 15, name: 'Administration', category: 'Administrative', description: 'Hospital administration', headOfDepartment: 'Admin User', location: 'Building E, Floor 3', phone: '555-6001', email: 'admin@hospital.com', status: 'active' },
  { id: 16, name: 'Front Desk', category: 'Administrative', description: 'Front desk and reception', headOfDepartment: 'Lisa Anderson', location: 'Building A, Ground Floor', phone: '555-6002', email: 'frontdesk@hospital.com', status: 'active' },
];

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export interface CreateDepartmentDto {
  name: string;
  category: DepartmentCategory;
  description?: string;
  headOfDepartment?: string;
  location?: string;
  phone?: string;
  email?: string;
  status?: 'active' | 'inactive';
}

export interface UpdateDepartmentDto extends Partial<CreateDepartmentDto> {
  id: number;
}

export const departmentsApi = {
  async getAll(): Promise<Department[]> {
    // Replace with: return apiRequest<Department[]>('/departments');
    await delay(300);
    return Promise.resolve([...stubDepartments]);
  },

  async getByCategory(category: DepartmentCategory): Promise<Department[]> {
    // Replace with: return apiRequest<Department[]>(`/departments?category=${category}`);
    await delay(200);
    return Promise.resolve(stubDepartments.filter(d => d.category === category));
  },

  async getById(id: number): Promise<Department> {
    // Replace with: return apiRequest<Department>(`/departments/${id}`);
    await delay(200);
    const department = stubDepartments.find(d => d.id === id);
    if (!department) {
      throw new Error(`Department with id ${id} not found`);
    }
    return Promise.resolve(department);
  },

  async create(data: CreateDepartmentDto): Promise<Department> {
    // Replace with: return apiRequest<Department>('/departments', { method: 'POST', body: JSON.stringify(data) });
    await delay(400);
    const newDepartment: Department = {
      id: stubDepartments.length + 1,
      status: 'active',
      ...data,
    };
    stubDepartments.push(newDepartment);
    return Promise.resolve(newDepartment);
  },

  async update(data: UpdateDepartmentDto): Promise<Department> {
    // Replace with: return apiRequest<Department>(`/departments/${data.id}`, { method: 'PUT', body: JSON.stringify(data) });
    await delay(400);
    const index = stubDepartments.findIndex(d => d.id === data.id);
    if (index === -1) {
      throw new Error(`Department with id ${data.id} not found`);
    }
    stubDepartments[index] = { ...stubDepartments[index], ...data };
    return Promise.resolve(stubDepartments[index]);
  },

  async delete(id: number): Promise<void> {
    // Replace with: return apiRequest<void>(`/departments/${id}`, { method: 'DELETE' });
    await delay(300);
    const index = stubDepartments.findIndex(d => d.id === id);
    if (index === -1) {
      throw new Error(`Department with id ${id} not found`);
    }
    stubDepartments.splice(index, 1);
    return Promise.resolve();
  },
};

