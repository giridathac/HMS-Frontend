// Staff types and interfaces

export type StaffType = 'inhouse-doctor' | 'consulting-doctor' | 'nurse' | 'other';
export type StaffRole = 'doctor' | 'nurse' | 'receptionist' | 'lab-technician' | 'pharmacist' | 'admin' | 'other';

export interface Staff {
  UserId: number;
  EmployeeId: string;
  RoleId: StaffRole;
  UserName: string;
  Password: string;
  PhoneNo: string;  
  EmailId: string;
  type: StaffType;
  
  DoctorDepartment?: string;
  specialty?: string; // For doctors
  
  
  joinDate: string;
  status: 'active' | 'inactive' | 'on-leave';
}

