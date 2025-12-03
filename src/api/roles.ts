// Roles API service
import { apiRequest } from './base';
import { Role, RoleName } from '../types/roles';

// Default roles
const defaultRoles: RoleName[] = [
  'Superadmin',
  'Frontdeskadmin',
  'Doctorinhouse',
  'Doctorconsulting',
  'Surgeon',
  'Labadmin',
  'Icuadmin',
  'Otadmin',
  'Nurse',
  'Pharmacyadmin',
];

// Stub data
const stubRoles: Role[] = defaultRoles.map((name, index) => ({
  id: index + 1,
  name,
  description: getDefaultDescription(name),
  permissions: getDefaultPermissions(name),
  createdAt: new Date(2024, 0, 1).toISOString(),
  updatedAt: new Date(2024, 0, 1).toISOString(),
      isSuperAdmin: name === 'Superadmin', // Superadmin role
}));

function getDefaultDescription(name: RoleName): string {
  const descriptions: Record<RoleName, string> = {
    'Superadmin': 'Full administrative access to all hospital systems and data (Super Administrator)',
    'Frontdeskadmin': 'Manage front desk operations, patient registration, and token generation',
    'Doctorinhouse': 'Inhouse doctor with access to patient consultations and medical records',
    'Doctorconsulting': 'Consulting doctor with access to patient consultations',
    'Surgeon': 'Surgeon with access to OT management and surgical procedures',
    'Labadmin': 'Manage laboratory operations, test orders, and results',
    'Icuadmin': 'Manage ICU operations, patient monitoring, and critical care',
    'Otadmin': 'Manage operation theater scheduling, surgeries, and OT resources',
    'Nurse': 'Nursing staff with access to patient care and monitoring',
    'Pharmacyadmin': 'Manage pharmacy operations, medicine inventory, and prescriptions',
  };
  return descriptions[name] || '';
}

function getDefaultPermissions(name: RoleName): string[] {
  const permissions: Record<RoleName, string[]> = {
    'Superadmin': ['all'],
    'Frontdeskadmin': ['frontdesk', 'patients', 'tokens', 'appointments'],
    'Doctorinhouse': ['consultations', 'patients', 'prescriptions', 'lab-orders'],
    'Doctorconsulting': ['consultations', 'patients', 'prescriptions'],
    'Surgeon': ['ot-management', 'surgeries', 'patients', 'consultations'],
    'Labadmin': ['laboratory', 'tests', 'results', 'reports'],
    'Icuadmin': ['icu-management', 'patients', 'monitoring', 'reports'],
    'Otadmin': ['ot-management', 'surgeries', 'scheduling', 'resources'],
    'Nurse': ['patient-care', 'vitals', 'medications', 'reports'],
    'Pharmacyadmin': ['pharmacy', 'inventory', 'prescriptions', 'dispensing'],
  };
  return permissions[name] || [];
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export interface CreateRoleDto {
  name: RoleName;
  description?: string;
  permissions?: string[];
}

export interface UpdateRoleDto extends Partial<CreateRoleDto> {
  id: number;
}

export const rolesApi = {
  async getAll(): Promise<Role[]> {
    // Replace with: return apiRequest<Role[]>('/roles');
    await delay(300);
    return Promise.resolve([...stubRoles]);
  },

  async getById(id: number): Promise<Role> {
    // Replace with: return apiRequest<Role>(`/roles/${id}`);
    await delay(200);
    const role = stubRoles.find(r => r.id === id);
    if (!role) {
      throw new Error(`Role with id ${id} not found`);
    }
    return Promise.resolve(role);
  },

  async create(data: CreateRoleDto): Promise<Role> {
    // Replace with: return apiRequest<Role>('/roles', { method: 'POST', body: JSON.stringify(data) });
    await delay(400);
    const now = new Date().toISOString();
    const newRole: Role = {
      id: stubRoles.length + 1,
      name: data.name,
      description: data.description || getDefaultDescription(data.name),
      permissions: data.permissions || getDefaultPermissions(data.name),
      createdAt: now,
      updatedAt: now,
      isSuperAdmin: data.name === 'Superadmin',
    };
    stubRoles.push(newRole);
    return Promise.resolve(newRole);
  },

  async update(data: UpdateRoleDto): Promise<Role> {
    // Replace with: return apiRequest<Role>(`/roles/${data.id}`, { method: 'PUT', body: JSON.stringify(data) });
    await delay(400);
    const index = stubRoles.findIndex(r => r.id === data.id);
    if (index === -1) {
      throw new Error(`Role with id ${data.id} not found`);
    }
    const roleName = data.name || stubRoles[index].name;
    stubRoles[index] = {
      ...stubRoles[index],
      ...data,
      updatedAt: new Date().toISOString(),
      isSuperAdmin: roleName === 'Superadmin',
    };
    return Promise.resolve(stubRoles[index]);
  },

  async delete(id: number): Promise<void> {
    // Replace with: return apiRequest<void>(`/roles/${id}`, { method: 'DELETE' });
    await delay(300);
    const index = stubRoles.findIndex(r => r.id === id);
    if (index === -1) {
      throw new Error(`Role with id ${id} not found`);
    }
    stubRoles.splice(index, 1);
    return Promise.resolve();
  },
};

