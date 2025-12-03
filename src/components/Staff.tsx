// Staff Management Component - Separated UI from logic
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Plus, Trash2, Edit, Users, Filter } from 'lucide-react';
import { useStaff } from '../hooks/useStaff';
import { useDepartments } from '../hooks/useDepartments';
import { Staff, StaffType, StaffRole } from '../types/staff';

interface StaffViewProps {
  staff: Staff[];
  onCreateStaff: (data: {
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
  }) => Promise<void>;
  onUpdateStaff: (id: number, data: Partial<{
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
  }>) => Promise<void>;
  onDeleteStaff: (id: number) => Promise<void>;
}

export function StaffManagement() {
  const { staff: allStaff, loading, error, createStaff, updateStaff, deleteStaff } = useStaff();
  const { departments } = useDepartments(); // Fetch all departments
  const [selectedType, setSelectedType] = useState<StaffType | undefined>(undefined);
  
  const staff = selectedType 
    ? allStaff.filter(s => s.type === selectedType)
    : allStaff;

  const handleCreateStaff = async (data: {
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
  }) => {
    try {
      await createStaff(data);
    } catch (err) {
      console.error('Failed to create staff:', err);
      throw err;
    }
  };

  const handleUpdateStaff = async (id: number, data: Partial<{
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
  }>) => {
    try {
      await updateStaff({ id, ...data });
    } catch (err) {
      console.error('Failed to update staff:', err);
      throw err;
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this staff member? This action cannot be undone.')) {
      try {
        await deleteStaff(id);
      } catch (err) {
        console.error('Failed to delete staff:', err);
      }
    }
  };

  if (loading) {
    return (
      <div className="p-8 bg-blue-100 min-h-full">
        <div className="text-center py-12 text-blue-600">Loading staff...</div>
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
    <StaffView
      staff={allStaff}
      departments={departments}
      selectedType={selectedType}
      onTypeFilterChange={setSelectedType}
      onCreateStaff={handleCreateStaff}
      onUpdateStaff={handleUpdateStaff}
      onDeleteStaff={handleDelete}
    />
  );
}

function StaffView({
  staff,
  departments,
  selectedType,
  onTypeFilterChange,
  onCreateStaff,
  onUpdateStaff,
  onDeleteStaff,
}: StaffViewProps & { 
  departments: Array<{ id: number; name: string; category: string }>;
  selectedType?: StaffType; 
  onTypeFilterChange: (type: StaffType | undefined) => void;
}) {
  const allStaff = staff;
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    employeeId: '',
    type: 'other' as StaffType,
    role: 'other' as StaffRole,
    department: '',
    specialty: '',
    phone: '',
    email: '',
    joinDate: new Date().toISOString().split('T')[0],
    status: 'active' as 'active' | 'inactive' | 'on-leave',
  });

  const handleAddSubmit = async () => {
    try {
      await onCreateStaff({
        ...formData,
        department: formData.department || undefined,
        specialty: formData.specialty || undefined,
      });
      setIsAddDialogOpen(false);
      setFormData({
        name: '',
        employeeId: '',
        type: 'other',
        role: 'other',
        department: '',
        specialty: '',
        phone: '',
        email: '',
        joinDate: new Date().toISOString().split('T')[0],
        status: 'active',
      });
    } catch (err) {
      // Error handled in parent
    }
  };

  const handleEditSubmit = async () => {
    if (!selectedStaff) return;
    try {
      await onUpdateStaff(selectedStaff.id, {
        ...formData,
        department: formData.department || undefined,
        specialty: formData.specialty || undefined,
      });
      setIsEditDialogOpen(false);
      setSelectedStaff(null);
      setFormData({
        name: '',
        employeeId: '',
        type: 'other',
        role: 'other',
        department: '',
        specialty: '',
        phone: '',
        email: '',
        joinDate: new Date().toISOString().split('T')[0],
        status: 'active',
      });
    } catch (err) {
      // Error handled in parent
    }
  };

  const handleEdit = (staff: Staff) => {
    setSelectedStaff(staff);
    const isDoctor = staff.type === 'inhouse-doctor' || staff.type === 'consulting-doctor';
    setFormData({
      name: staff.name,
      employeeId: staff.employeeId,
      type: staff.type,
      role: staff.role,
      department: isDoctor ? (staff.department || '') : '',
      specialty: staff.specialty || '',
      phone: staff.phone,
      email: staff.email,
      joinDate: staff.joinDate,
      status: staff.status,
    });
    setIsEditDialogOpen(true);
  };

  const getTypeBadgeColor = (type: StaffType) => {
    switch (type) {
      case 'inhouse-doctor':
        return 'bg-blue-100 text-blue-700';
      case 'consulting-doctor':
        return 'bg-purple-100 text-purple-700';
      case 'nurse':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700';
      case 'inactive':
        return 'bg-red-100 text-red-700';
      case 'on-leave':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const staffTypeOptions: { value: StaffType; label: string }[] = [
    { value: 'inhouse-doctor', label: 'Inhouse Doctor' },
    { value: 'consulting-doctor', label: 'Consulting Doctor' },
    { value: 'nurse', label: 'Nurse' },
    { value: 'other', label: 'Other' },
  ];

  const roleOptions: { value: StaffRole; label: string }[] = [
    { value: 'doctor', label: 'Doctor' },
    { value: 'nurse', label: 'Nurse' },
    { value: 'receptionist', label: 'Receptionist' },
    { value: 'lab-technician', label: 'Lab Technician' },
    { value: 'pharmacist', label: 'Pharmacist' },
    { value: 'admin', label: 'Admin' },
    { value: 'other', label: 'Other' },
  ];

  return (
    <div className="p-8 bg-blue-100 min-h-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-blue-900 mb-2">Staff Management</h1>
          <p className="text-gray-500">Manage hospital staff members</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="size-4" />
              Add Staff
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Staff Member</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., John Smith"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="employeeId">Employee ID</Label>
                  <Input
                    id="employeeId"
                    placeholder="e.g., EMP-001"
                    value={formData.employeeId}
                    onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">Staff Type</Label>
                  <select
                    id="type"
                    aria-label="Staff Type"
                    className="w-full px-3 py-2 border border-gray-200 rounded-md"
                    value={formData.type}
                    onChange={(e) => {
                      const newType = e.target.value as StaffType;
                      const isDoctor = newType === 'inhouse-doctor' || newType === 'consulting-doctor';
                      setFormData({ 
                        ...formData, 
                        type: newType,
                        department: isDoctor ? formData.department : ''
                      });
                    }}
                  >
                    {staffTypeOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="role">Role</Label>
                  <select
                    id="role"
                    aria-label="Role"
                    className="w-full px-3 py-2 border border-gray-200 rounded-md"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as StaffRole })}
                  >
                    {roleOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="department">Department</Label>
                  <select
                    id="department"
                    aria-label="Department"
                    className={`w-full px-3 py-2 border border-gray-200 rounded-md ${
                      formData.type !== 'inhouse-doctor' && formData.type !== 'consulting-doctor'
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : ''
                    }`}
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    disabled={formData.type !== 'inhouse-doctor' && formData.type !== 'consulting-doctor'}
                  >
                    <option value="">Select a department</option>
                    {['Clinical', 'Surgical', 'Diagnostic', 'Support', 'Administrative'].map(category => {
                      const categoryDepts = departments.filter(d => d.category === category);
                      if (categoryDepts.length === 0) return null;
                      return (
                        <optgroup key={category} label={category}>
                          {categoryDepts.map(dept => (
                            <option key={dept.id} value={dept.name}>
                              {dept.name}
                            </option>
                          ))}
                        </optgroup>
                      );
                    })}
                  </select>
                </div>
                {(formData.type === 'inhouse-doctor' || formData.type === 'consulting-doctor') && (
                  <div>
                    <Label htmlFor="specialty">Specialty</Label>
                    <Input
                      id="specialty"
                      placeholder="e.g., Cardiology"
                      value={formData.specialty}
                      onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                    />
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    placeholder="Enter phone number"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="joinDate">Join Date</Label>
                  <Input
                    id="joinDate"
                    type="date"
                    value={formData.joinDate}
                    onChange={(e) => setFormData({ ...formData, joinDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <select
                    id="status"
                    aria-label="Status"
                    className="w-full px-3 py-2 border border-gray-200 rounded-md"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' | 'on-leave' })}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="on-leave">On Leave</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleAddSubmit}>Add Staff</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filter Tabs */}
      <Tabs defaultValue="all" className="space-y-6" value={selectedType ? 
        selectedType === 'inhouse-doctor' ? 'inhouse-doctors' :
        selectedType === 'consulting-doctor' ? 'consulting-doctors' :
        selectedType === 'nurse' ? 'nurses' : 'other'
        : 'all'
      }>
        <TabsList>
          <TabsTrigger value="all" onClick={() => onTypeFilterChange(undefined)}>
            All Staff ({allStaff.length})
          </TabsTrigger>
          <TabsTrigger value="inhouse-doctors" onClick={() => onTypeFilterChange('inhouse-doctor')}>
            Inhouse Doctors ({allStaff.filter(s => s.type === 'inhouse-doctor').length})
          </TabsTrigger>
          <TabsTrigger value="consulting-doctors" onClick={() => onTypeFilterChange('consulting-doctor')}>
            Consulting Doctors ({allStaff.filter(s => s.type === 'consulting-doctor').length})
          </TabsTrigger>
          <TabsTrigger value="nurses" onClick={() => onTypeFilterChange('nurse')}>
            Nurses ({allStaff.filter(s => s.type === 'nurse').length})
          </TabsTrigger>
          <TabsTrigger value="other" onClick={() => onTypeFilterChange('other')}>
            Other ({allStaff.filter(s => s.type === 'other').length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <StaffTable staff={allStaff} onEdit={handleEdit} onDelete={onDeleteStaff} getTypeBadgeColor={getTypeBadgeColor} getStatusBadgeColor={getStatusBadgeColor} />
        </TabsContent>
        <TabsContent value="inhouse-doctors">
          <StaffTable staff={allStaff.filter(s => s.type === 'inhouse-doctor')} onEdit={handleEdit} onDelete={onDeleteStaff} getTypeBadgeColor={getTypeBadgeColor} getStatusBadgeColor={getStatusBadgeColor} />
        </TabsContent>
        <TabsContent value="consulting-doctors">
          <StaffTable staff={allStaff.filter(s => s.type === 'consulting-doctor')} onEdit={handleEdit} onDelete={onDeleteStaff} getTypeBadgeColor={getTypeBadgeColor} getStatusBadgeColor={getStatusBadgeColor} />
        </TabsContent>
        <TabsContent value="nurses">
          <StaffTable staff={allStaff.filter(s => s.type === 'nurse')} onEdit={handleEdit} onDelete={onDeleteStaff} getTypeBadgeColor={getTypeBadgeColor} getStatusBadgeColor={getStatusBadgeColor} />
        </TabsContent>
        <TabsContent value="other">
          <StaffTable staff={allStaff.filter(s => s.type === 'other')} onEdit={handleEdit} onDelete={onDeleteStaff} getTypeBadgeColor={getTypeBadgeColor} getStatusBadgeColor={getStatusBadgeColor} />
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Staff Member</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-name">Full Name</Label>
                <Input
                  id="edit-name"
                  placeholder="e.g., John Smith"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-employeeId">Employee ID</Label>
                <Input
                  id="edit-employeeId"
                  placeholder="e.g., EMP-001"
                  value={formData.employeeId}
                  onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-type">Staff Type</Label>
                <select
                  id="edit-type"
                  aria-label="Staff Type"
                  className="w-full px-3 py-2 border border-gray-200 rounded-md"
                  value={formData.type}
                  onChange={(e) => {
                    const newType = e.target.value as StaffType;
                    const isDoctor = newType === 'inhouse-doctor' || newType === 'consulting-doctor';
                    setFormData({ 
                      ...formData, 
                      type: newType,
                      department: isDoctor ? formData.department : ''
                    });
                  }}
                >
                  {staffTypeOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="edit-role">Role</Label>
                <select
                  id="edit-role"
                  aria-label="Role"
                  className="w-full px-3 py-2 border border-gray-200 rounded-md"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as StaffRole })}
                >
                  {roleOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-department">Department</Label>
                <select
                  id="edit-department"
                  aria-label="Department"
                  className={`w-full px-3 py-2 border border-gray-200 rounded-md ${
                    formData.type !== 'inhouse-doctor' && formData.type !== 'consulting-doctor'
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : ''
                  }`}
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  disabled={formData.type !== 'inhouse-doctor' && formData.type !== 'consulting-doctor'}
                >
                  <option value="">Select a department</option>
                  {['Clinical', 'Surgical', 'Diagnostic', 'Support', 'Administrative'].map(category => {
                    const categoryDepts = departments.filter(d => d.category === category);
                    if (categoryDepts.length === 0) return null;
                    return (
                      <optgroup key={category} label={category}>
                        {categoryDepts.map(dept => (
                          <option key={dept.id} value={dept.name}>
                            {dept.name}
                          </option>
                        ))}
                      </optgroup>
                    );
                  })}
                </select>
              </div>
              {(formData.type === 'inhouse-doctor' || formData.type === 'consulting-doctor') && (
                <div>
                  <Label htmlFor="edit-specialty">Specialty</Label>
                  <Input
                    id="edit-specialty"
                    placeholder="e.g., Cardiology"
                    value={formData.specialty}
                    onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                  />
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-phone">Phone Number</Label>
                <Input
                  id="edit-phone"
                  placeholder="Enter phone number"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  placeholder="Enter email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-joinDate">Join Date</Label>
                <Input
                  id="edit-joinDate"
                  type="date"
                  value={formData.joinDate}
                  onChange={(e) => setFormData({ ...formData, joinDate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-status">Status</Label>
                <select
                  id="edit-status"
                  aria-label="Status"
                  className="w-full px-3 py-2 border border-gray-200 rounded-md"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' | 'on-leave' })}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="on-leave">On Leave</option>
                </select>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleEditSubmit}>Update Staff</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StaffTable({
  staff,
  onEdit,
  onDelete,
  getTypeBadgeColor,
  getStatusBadgeColor,
}: {
  staff: Staff[];
  onEdit: (staff: Staff) => void;
  onDelete: (id: number) => void;
  getTypeBadgeColor: (type: StaffType) => string;
  getStatusBadgeColor: (status: string) => string;
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-gray-700">Name</th>
                <th className="text-left py-3 px-4 text-gray-700">Employee ID</th>
                <th className="text-left py-3 px-4 text-gray-700">Type</th>
                <th className="text-left py-3 px-4 text-gray-700">Role</th>
                <th className="text-left py-3 px-4 text-gray-700">Department</th>
                <th className="text-left py-3 px-4 text-gray-700">Specialty</th>
                <th className="text-left py-3 px-4 text-gray-700">Phone</th>
                <th className="text-left py-3 px-4 text-gray-700">Status</th>
                <th className="text-left py-3 px-4 text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {staff.map((member) => (
                <tr key={member.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-gray-900">{member.name}</td>
                  <td className="py-3 px-4 text-gray-600">{member.employeeId}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded text-xs ${getTypeBadgeColor(member.type)}`}>
                      {member.type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{member.role.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</td>
                  <td className="py-3 px-4 text-gray-600">{member.department || '-'}</td>
                  <td className="py-3 px-4 text-gray-600">{member.specialty || '-'}</td>
                  <td className="py-3 px-4 text-gray-600">{member.phone}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded text-xs ${getStatusBadgeColor(member.status)}`}>
                      {member.status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => onEdit(member)}>
                        <Edit className="size-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => onDelete(member.id)}>
                        <Trash2 className="size-4 text-red-600" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {staff.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No staff members found
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
