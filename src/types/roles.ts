// Role types and interfaces

export type RoleName = 
  | 'Superadmin'
  | 'Frontdeskadmin'
  | 'Doctorinhouse'
  | 'Doctorconsulting'
  | 'Surgeon'
  | 'Labadmin'
  | 'Icuadmin'
  | 'Otadmin'
  | 'Nurse'
  | 'Pharmacyadmin';

export interface Role {
  id: number;
  name: RoleName;
  description?: string;
  permissions?: string[];
  createdAt: string;
  updatedAt: string;
  isSuperAdmin?: boolean; // Flag to identify superadmin roles
}

