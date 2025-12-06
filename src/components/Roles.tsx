// Role Management Component - Separated UI from logic
import React, { useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Plus, Trash2, Edit, Shield } from 'lucide-react';
import { useRoles } from '../hooks/useRoles';
import { Role } from '../types/roles';

interface RolesViewProps {
  roles: Role[];
  onCreateRole: (data: {
    RoleName: string;
    RoleDescription?: string;
    CreatedBy?: number;
  }) => Promise<void>;
  onUpdateRole: (id: number, data: Partial<{
    RoleName?: string;
    RoleDescription?: string;
  }>) => Promise<void>;
  onDeleteRole: (id: string) => Promise<void>;
}


export function Roles() {
  const { roles, loading, error, createRole, updateRole, deleteRole } = useRoles();

  const handleCreateRole = async (data: {
    RoleName: string;
    RoleDescription?: string;
    CreatedBy?: number;
  }) => {
    try {
      await createRole(data);
    } catch (err) {
      console.error('Failed to create role:', err);
      throw err;
    }
  };

  const handleUpdateRole = async (id: string, data: Partial<{
    RoleName?: string;
    RoleDescription?: string;
  }>) => {
    try {
      await updateRole({ id, ...data });
    } catch (err) {
      console.error('Failed to update role:', err);
      throw err;
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this role? This action cannot be undone.')) {
      try {
        await deleteRole(id);
      } catch (err) {
        console.error('Failed to delete role:', err);
      }
    }
  };

  if (loading) {
    return (
      <div className="p-8 bg-blue-100 min-h-full">
        <div className="text-center py-12 text-blue-600">Loading roles...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 bg-blue-100 min-h-full">
        <div className="text-center py-12 text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <RolesView
      roles={roles}
      onCreateRole={handleCreateRole}
      onUpdateRole={handleUpdateRole}
      onDeleteRole={handleDelete}
    />
  );
}

function RolesView({
  roles,
  onCreateRole,
  onUpdateRole,
  onDeleteRole,
}: RolesViewProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [formData, setFormData] = useState({
    RoleName: '',
    RoleDescription: '',
    permissions: [] as string[],
  });
  const [newPermission, setNewPermission] = useState('');

  const handleAddSubmit = async () => {
    try {
      await onCreateRole({
        RoleName: formData.RoleName,
        RoleDescription: formData.RoleDescription || undefined,
        // CreatedBy can be added later from auth context if needed
        // Permissions will be filled in later, not sent during creation
      });
      setIsAddDialogOpen(false);
      setFormData({
        RoleName: '',
        RoleDescription: '',
        permissions: [],
      });
      setNewPermission('');
    } catch (err) {
      // Error handled in parent
    }
  };

  const handleEditSubmit = async () => {
    if (!selectedRole) return;
    try {
      await onUpdateRole(selectedRole.id, {
        RoleName: formData.RoleName,
        RoleDescription: formData.RoleDescription || undefined,
        // Permissions will be handled separately, not in update for now
      });
      setIsEditDialogOpen(false);
      setSelectedRole(null);
      setFormData({
        RoleName: '',
        RoleDescription: '',
        permissions: [],
      });
      setNewPermission('');
    } catch (err) {
      // Error handled in parent
    }
  };

  const handleEdit = (role: Role) => {
    setSelectedRole(role);
    setFormData({
      RoleName: role.name,
      RoleDescription: role.description || '',
      permissions: role.permissions || [],
    });
    setIsEditDialogOpen(true);
  };

  const addPermission = () => {
    if (newPermission.trim() && !formData.permissions.includes(newPermission.trim())) {
      setFormData({
        ...formData,
        permissions: [...formData.permissions, newPermission.trim()],
      });
      setNewPermission('');
    }
  };

  const removePermission = (permission: string) => {
    setFormData({
      ...formData,
      permissions: formData.permissions.filter(p => p !== permission),
    });
  };

  return (
    <>
      <div className="px-4 pt-4 pb-4 bg-blue-100 h-screen flex flex-col overflow-hidden">
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
          <div>
            <h1 className="text-gray-900 mb-0 text-xl">Role Management</h1>
            <p className="text-gray-500 text-sm">Manage user roles and permissions</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="size-4" />
                Add Role
              </Button>
            </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Role</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="name">Role Name</Label>
            <Input
              id="name"
              placeholder="Enter role name (e.g., Superadmin, Doctor, Nurse)"
              value={formData.RoleName}
              onChange={(e) => setFormData({ ...formData, RoleName: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Enter role description..."
              value={formData.RoleDescription}
              onChange={(e) => setFormData({ ...formData, RoleDescription: e.target.value })}
              rows={3}
            />
          </div>
          <div>
            <Label htmlFor="permissions">Permissions</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.permissions.map((permission, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm flex items-center gap-2"
                >
                  {permission}
                  <button
                    onClick={() => removePermission(permission)}
                    className="text-blue-700 hover:text-blue-900"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Enter permission (e.g., 'patients', 'reports')"
                value={newPermission}
                onChange={(e) => setNewPermission(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addPermission();
                  }
                }}
              />
              <Button type="button" onClick={addPermission}>Add</Button>
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAddSubmit}>Add Role</Button>
        </div>
      </DialogContent>
    </Dialog>
        </div>

        <Card className="flex-1 flex flex-col overflow-hidden min-h-0 mb-4">
          <CardContent className="p-0 flex-1 overflow-hidden flex flex-col min-h-0">
            <div className="overflow-x-auto overflow-y-scroll border border-gray-200 rounded flex-1 min-h-0 doctors-scrollable h-full">
              <table className="w-full">
                <thead className="sticky top-0 bg-white z-10 shadow-sm">
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-0.5 px-4 text-gray-700 bg-white whitespace-nowrap">Role Name</th>
                    <th className="text-left py-0.5 px-4 text-gray-700 bg-white whitespace-nowrap">Description</th>
                    <th className="text-left py-0.5 px-4 text-gray-700 bg-white whitespace-nowrap">Permissions</th>
                    <th className="text-left py-0.5 px-4 text-gray-700 bg-white whitespace-nowrap">Created</th>
                    <th className="text-left py-0.5 px-4 text-gray-700 bg-white whitespace-nowrap">Updated</th>
                    <th className="text-left py-0.5 px-4 text-gray-700 bg-white whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {roles.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-gray-500">
                        No roles found
                      </td>
                    </tr>
                  ) : (
                    roles.map((role) => (
                      <tr key={role.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-1 px-4">
                          <div className="flex items-center gap-2">
                            <Shield className="size-4 text-blue-600" />
                            <span className="text-gray-900 font-medium">{role.name}</span>
                            {role.isSuperAdmin && (
                              <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs font-semibold">
                                Super Admin
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-1 px-4 text-gray-600">
                          {role.description || (
                            <span className="text-gray-400 italic">No description</span>
                          )}
                        </td>
                        <td className="py-1 px-4">
                          <div className="flex flex-wrap gap-1">
                            {role.permissions && role.permissions.length > 0 ? (
                              role.permissions.slice(0, 3).map((permission, index) => (
                                <span
                                  key={index}
                                  className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs"
                                >
                                  {permission}
                                </span>
                              ))
                            ) : (
                              <span className="text-gray-400 text-xs">No permissions</span>
                            )}
                            {role.permissions && role.permissions.length > 3 && (
                              <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs">
                                +{role.permissions.length - 3} more
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-1 px-4 text-gray-600 text-sm">
                          {role.createdAt ? new Date(role.createdAt).toLocaleDateString() : '-'}
                        </td>
                        <td className="py-1 px-4 text-gray-600 text-sm">
                          {role.updatedAt ? new Date(role.updatedAt).toLocaleDateString() : '-'}
                        </td>
                        <td className="py-1 px-4">
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm" onClick={() => handleEdit(role)}>
                              <Edit className="size-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => onDeleteRole(role.id)}>
                              <Trash2 className="size-4 text-red-600" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Role</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="edit-name">Role Name</Label>
              <Input
                id="edit-name"
                placeholder="Enter role name (e.g., Superadmin, Doctor, Nurse)"
                value={formData.RoleName}
                onChange={(e) => setFormData({ ...formData, RoleName: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                placeholder="Enter role description..."
                value={formData.RoleDescription}
                onChange={(e) => setFormData({ ...formData, RoleDescription: e.target.value })}
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="edit-permissions">Permissions</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.permissions.map((permission, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm flex items-center gap-2"
                  >
                    {permission}
                    <button
                      onClick={() => removePermission(permission)}
                      className="text-blue-700 hover:text-blue-900"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter permission (e.g., 'patients', 'reports')"
                  value={newPermission}
                  onChange={(e) => setNewPermission(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addPermission();
                    }
                  }}
                />
                <Button type="button" onClick={addPermission}>Add</Button>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleEditSubmit}>Update Role</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

