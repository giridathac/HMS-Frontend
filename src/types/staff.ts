// Staff types and interfaces

export type StaffType = 'inhouse-doctor' | 'consulting-doctor' | 'nurse' | 'other';
export type StaffRole = 'doctor' | 'nurse' | 'receptionist' | 'lab-technician' | 'pharmacist' | 'admin' | 'other';

export interface Staff {
  id: number;
  name: string;
  employeeId: string;
  type: StaffType;
  role: StaffRole;
  department?: string;
  specialty?: string; // For doctors
  phone: string;
  email: string;
  joinDate: string;
  status: 'active' | 'inactive' | 'on-leave';
}

