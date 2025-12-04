// Departments API service
import { apiRequest } from './base';
import { Department, DepartmentCategory } from '../types/departments';

// Stub data
const stubDepartments: Department[] = [
  // Clinical Departments
  { id: 1, name: 'Medicine', category: 'Clinical', description: 'General medicine and internal medicine', specialisationDetails: 'General Medicine, Internal Medicine, Family Medicine', noOfDoctors: 12, status: 'active' },
  { id: 2, name: 'Pediatrics', category: 'Clinical', description: 'Child healthcare and pediatrics', specialisationDetails: 'Pediatric Care, Neonatology, Child Development', noOfDoctors: 8, status: 'active' },
  { id: 3, name: 'ENT', category: 'Clinical', description: 'Ear, Nose, and Throat department', specialisationDetails: 'Otolaryngology, Head and Neck Surgery', noOfDoctors: 5, status: 'active' },
  { id: 4, name: 'Dermatology', category: 'Clinical', description: 'Skin and dermatological conditions', specialisationDetails: 'Dermatology, Cosmetic Dermatology, Skin Surgery', noOfDoctors: 4, status: 'active' },
  { id: 5, name: 'Cardiology', category: 'Clinical', description: 'Heart and cardiovascular care', specialisationDetails: 'Cardiology, Interventional Cardiology, Cardiac Rehabilitation', noOfDoctors: 10, status: 'active' },
  { id: 6, name: 'Neurology', category: 'Clinical', description: 'Brain and nervous system disorders', specialisationDetails: 'Neurology, Neurophysiology, Stroke Care', noOfDoctors: 7, status: 'active' },
  
  // Surgical Departments
  { id: 7, name: 'General Surgery', category: 'Surgical', description: 'General surgical procedures', specialisationDetails: 'General Surgery, Laparoscopic Surgery, Trauma Surgery', noOfDoctors: 15, status: 'active' },
  { id: 8, name: 'Orthopedics', category: 'Surgical', description: 'Bone and joint surgery', specialisationDetails: 'Orthopedic Surgery, Joint Replacement, Sports Medicine', noOfDoctors: 12, status: 'active' },
  { id: 9, name: 'Neurosurgery', category: 'Surgical', description: 'Brain and spine surgery', specialisationDetails: 'Neurosurgery, Spine Surgery, Neuro-oncology', noOfDoctors: 6, status: 'active' },
  { id: 10, name: 'Cardiac Surgery', category: 'Surgical', description: 'Heart surgery and procedures', specialisationDetails: 'Cardiac Surgery, Heart Transplant, Vascular Surgery', noOfDoctors: 8, status: 'active' },
  
  // Diagnostic Departments
  { id: 11, name: 'Radiology', category: 'Diagnostic', description: 'Medical imaging and radiology', specialisationDetails: 'Radiology, CT Scan, MRI, Ultrasound, X-Ray', noOfDoctors: 9, status: 'active' },
  { id: 12, name: 'Laboratory', category: 'Diagnostic', description: 'Clinical laboratory and pathology', specialisationDetails: 'Pathology, Clinical Chemistry, Hematology, Microbiology', noOfDoctors: 11, status: 'active' },
  
  // Support Departments
  { id: 13, name: 'Pharmacy', category: 'Support', description: 'Pharmacy and medication dispensing', specialisationDetails: 'Pharmacy Services, Medication Management, Clinical Pharmacy', noOfDoctors: 3, status: 'active' },
  { id: 14, name: 'Emergency', category: 'Support', description: 'Emergency and trauma care', specialisationDetails: 'Emergency Medicine, Trauma Care, Critical Care', noOfDoctors: 20, status: 'active' },
  
  // Administrative Departments
  { id: 15, name: 'Administration', category: 'Administrative', description: 'Hospital administration', specialisationDetails: 'Hospital Administration, Management, Operations', noOfDoctors: 0, status: 'active' },
  { id: 16, name: 'Front Desk', category: 'Administrative', description: 'Front desk and reception', specialisationDetails: 'Patient Registration, Reception Services, Appointment Scheduling', noOfDoctors: 0, status: 'active' },
];

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Frontend DTO (what the component uses)
export interface CreateDepartmentDto {
  name: string;
  category: DepartmentCategory;
  description?: string;
  specialisationDetails?: string;
  noOfDoctors?: number;
  status?: 'active' | 'inactive';
}

// Backend request DTO (what the API expects)
export interface CreateDepartmentRequestDto {
  DepartmentName: string;
  DepartmentCategory?: string;
  SpecialisationDetails?: string;
  NoOfDoctors?: number;
  Status?: string;
  CreatedBy?: number;
}

// Backend response DTO (what the API returns)
export interface DepartmentDto {
  DepartmentId: number;
  DepartmentName: string;
  DepartmentCategory: string;
  Description?: string | null;
  SpecialisationDetails?: string | null;
  NoOfDoctors?: number;
  Status: string;
  CreatedAt?: string;
  CreatedBy?: number | null;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// Backend update request DTO
export interface UpdateDepartmentRequestDto {
  DepartmentName?: string;
  DepartmentCategory?: string;
  Description?: string;
  SpecialisationDetails?: string;
  NoOfDoctors?: number;
  Status?: string;
}

export interface GetDepartmentsResponse {
  success: boolean;
  count?: number;
  data: DepartmentDto[];
}

export interface GetDepartmentResponse {
  success: boolean;
  data: DepartmentDto;
}

export interface UpdateDepartmentDto extends Partial<CreateDepartmentDto> {
  id: number;
}

// Helper function to map backend DTO to frontend Department
function mapDepartmentDtoToDepartment(dto: DepartmentDto): Department {
  return {
    id: dto.DepartmentId,
    name: dto.DepartmentName,
    category: dto.DepartmentCategory as DepartmentCategory,
    description: dto.Description || undefined,
    specialisationDetails: dto.SpecialisationDetails || undefined,
    noOfDoctors: dto.NoOfDoctors,
    status: dto.Status.toLowerCase() === 'active' ? 'active' : 'inactive',
  };
}

export const departmentsApi = {
  async getAll(): Promise<Department[]> {
    const response = await apiRequest<GetDepartmentsResponse>('/doctor-departments', {
      method: 'GET',
    });

    if (!response.success) {
      throw new Error('Failed to fetch departments');
    }

    return response.data.map(mapDepartmentDtoToDepartment);
  },

  async getByCategory(category: DepartmentCategory): Promise<Department[]> {
    const response = await apiRequest<GetDepartmentsResponse>(`/doctor-departments?category=${category}`, {
      method: 'GET',
    });

    if (!response.success) {
      throw new Error('Failed to fetch departments by category');
    }

    return response.data.map(mapDepartmentDtoToDepartment);
  },

  async getById(id: number): Promise<Department> {
    const response = await apiRequest<GetDepartmentResponse>(`/doctor-departments/${id}`, {
      method: 'GET',
    });

    if (!response.success) {
      throw new Error('Failed to fetch department');
    }

    return mapDepartmentDtoToDepartment(response.data);
  },

  async create(data: CreateDepartmentDto): Promise<Department> {
    // Map frontend DTO to backend DTO
    const requestBody: CreateDepartmentRequestDto = {
      DepartmentName: data.name,
      DepartmentCategory: data.category,
      SpecialisationDetails: data.specialisationDetails,
      NoOfDoctors: data.noOfDoctors,
      Status: data.status === 'active' ? 'Active' : 'Inactive',
      // CreatedBy can be added later if user context is available
    };

    const response = await apiRequest<ApiResponse<DepartmentDto>>('/doctor-departments', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });

    if (!response.success) {
      throw new Error(response.message || 'Failed to create department');
    }

    // Map backend DTO to frontend Department interface
    return mapDepartmentDtoToDepartment(response.data);
  },

  async update(data: UpdateDepartmentDto): Promise<Department> {
    const { id, ...updateData } = data;
    
    // Map frontend DTO to backend DTO (only include fields that are present)
    const requestBody: UpdateDepartmentRequestDto = {};
    if (updateData.name !== undefined) {
      requestBody.DepartmentName = updateData.name;
    }
    if (updateData.category !== undefined) {
      requestBody.DepartmentCategory = updateData.category;
    }
    if (updateData.description !== undefined) {
      requestBody.Description = updateData.description;
    }
    if (updateData.specialisationDetails !== undefined) {
      requestBody.SpecialisationDetails = updateData.specialisationDetails;
    }
    if (updateData.noOfDoctors !== undefined) {
      requestBody.NoOfDoctors = updateData.noOfDoctors;
    }
    if (updateData.status !== undefined) {
      requestBody.Status = updateData.status === 'active' ? 'Active' : 'Inactive';
    }

    const response = await apiRequest<ApiResponse<DepartmentDto>>(`/doctor-departments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(requestBody),
    });

    if (!response.success) {
      throw new Error(response.message || 'Failed to update department');
    }

    return mapDepartmentDtoToDepartment(response.data);
  },

  async delete(id: number): Promise<void> {
    const response = await apiRequest<ApiResponse<DepartmentDto>>(`/doctor-departments/${id}`, {
      method: 'DELETE',
    });

    if (!response.success) {
      throw new Error(response.message || 'Failed to delete department');
    }

    // DELETE endpoint returns the deleted department in response.data, but we don't need it
    return;
  },
};

