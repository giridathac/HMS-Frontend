// Department types and interfaces

export type DepartmentCategory = 'Clinical' | 'Surgical' | 'Diagnostic' | 'Support' | 'Administrative';

export interface Department {
  id: number;
  name: string;
  category: DepartmentCategory;
  description?: string;
  headOfDepartment?: string;
  location?: string;
  phone?: string;
  email?: string;
  status: 'active' | 'inactive';
}

