// Staff Management Component - Separated UI from logic
import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';
import { Plus, Trash2, Edit, Users } from 'lucide-react';
import { useStaff } from '../hooks/useStaff';
import { useDepartments } from '../hooks/useDepartments';
import { useRoles } from '../hooks/useRoles';
import { Staff, CreateUserDto } from '../types/staff';
import { Role } from '../types/roles';
import { Card, CardContent } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface StaffViewProps {
  staff: Staff[];
  roles: Role[];
  departments: Array<{ id: number; name: string; category: string }>;
  onCreateStaff: (data: CreateUserDto) => Promise<void>;
  onUpdateStaff: (data: { UserId: number } & Partial<CreateUserDto>) => Promise<void>;
  onDeleteStaff: (id: number) => Promise<void>;
}

export function StaffManagement() {
  const { staff: allStaff, loading, error, createStaff, updateStaff, deleteStaff } = useStaff();
  const { departments, loading: departmentsLoading, error: departmentsError } = useDepartments();
  const { roles } = useRoles();
  const [selectedStatus, setSelectedStatus] = useState<'Active' | 'InActive' | 'all'>('all');
  
  const staff = allStaff.filter(s => {
    const statusMatch = selectedStatus === 'all' || s.Status === selectedStatus;
    return statusMatch;
  });

  const handleCreateStaff = async (data: CreateUserDto) => {
    try {
      await createStaff(data);
    } catch (err) {
      console.error('Failed to create staff:', err);
      throw err;
    }
  };

  const handleUpdateStaff = async (data: { UserId: number } & Partial<CreateUserDto>) => {
    try {
      await updateStaff(data);
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
  
  if (departmentsError) {
    console.error('Departments fetch error:', departmentsError);
  }

  return (
    <StaffView
      staff={staff}
      roles={roles}
      departments={departments}
      selectedStatus={selectedStatus}
      onStatusFilterChange={setSelectedStatus}
      onCreateStaff={handleCreateStaff}
      onUpdateStaff={handleUpdateStaff}
      onDeleteStaff={handleDelete}
    />
  );
}

function StaffView({
  staff,
  roles,
  departments,
  selectedStatus,
  onStatusFilterChange,
  onCreateStaff,
  onUpdateStaff,
  onDeleteStaff,
}: StaffViewProps & { 
  selectedStatus: 'Active' | 'InActive' | 'all';
  onStatusFilterChange: (status: 'Active' | 'InActive' | 'all') => void;
}) {
  console.log('[StaffView] Rendering with departments:', departments);
  console.log('[StaffView] Departments length:', departments?.length);
  console.log('[StaffView] Departments type:', typeof departments);
  const allStaff = staff;
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [formData, setFormData] = useState<CreateUserDto>({
    RoleId: '',
    UserName: '',
    Password: '',
    PhoneNo: '',
    EmailId: '',
    DoctorDepartmentId: '',
    DoctorQualification: '',
    DoctorType: undefined,
    DoctorOPDCharge: undefined,
    DoctorSurgeryCharge: undefined,
    OPDConsultation: undefined,
    IPDVisit: undefined,
    OTHandle: undefined,
    ICUVisits: undefined,
    Status: 'Active',
  });

  // Check if selected role is a doctor role
  const isDoctorRole = (roleId: string): boolean => {
    if (!roleId || !roles || roles.length === 0) return false;
    const role = roles.find(r => r && r.id === roleId);
    if (!role || !role.name) return false;
    const roleNameLower = role.name.toLowerCase();
    return roleNameLower.includes('doctor') || roleNameLower.includes('surgeon');
  };

  const selectedRoleIsDoctor = formData.RoleId ? isDoctorRole(formData.RoleId) : false;
  console.log('[Add Dialog] selectedRoleIsDoctor:', selectedRoleIsDoctor, 'RoleId:', formData.RoleId);
  console.log('[Add Dialog] Departments available:', departments, 'Length:', departments?.length);

  const handleAddSubmit = async () => {
    try {
      const submitData: CreateUserDto = {
        RoleId: formData.RoleId,
        UserName: formData.UserName,
        Password: formData.Password,
        PhoneNo: formData.PhoneNo || undefined,
        EmailId: formData.EmailId || undefined,
        Status: formData.Status || 'Active',
      };

      // Only include doctor fields if role is doctor
      if (selectedRoleIsDoctor) {
        submitData.DoctorDepartmentId = formData.DoctorDepartmentId || undefined;
        submitData.DoctorQualification = formData.DoctorQualification || undefined;
        submitData.DoctorType = formData.DoctorType;
        submitData.DoctorOPDCharge = formData.DoctorOPDCharge;
        submitData.DoctorSurgeryCharge = formData.DoctorSurgeryCharge;
        submitData.OPDConsultation = formData.OPDConsultation;
        submitData.IPDVisit = formData.IPDVisit;
        submitData.OTHandle = formData.OTHandle;
        submitData.ICUVisits = formData.ICUVisits;
      }

      await onCreateStaff(submitData);
      setIsAddDialogOpen(false);
      setFormData({
        RoleId: '',
        UserName: '',
        Password: '',
        PhoneNo: '',
        EmailId: '',
        DoctorDepartmentId: '',
        DoctorQualification: '',
        DoctorType: undefined,
        DoctorOPDCharge: undefined,
        DoctorSurgeryCharge: undefined,
        OPDConsultation: undefined,
        IPDVisit: undefined,
        OTHandle: undefined,
        ICUVisits: undefined,
        Status: 'Active',
      });
    } catch (err) {
      // Error handled in parent
    }
  };

  const handleEditSubmit = async () => {
    if (!selectedStaff || !selectedStaff.UserId) return;
    try {
      const submitData: Partial<CreateUserDto> = {
        RoleId: formData.RoleId,
        UserName: formData.UserName,
        PhoneNo: formData.PhoneNo || undefined,
        EmailId: formData.EmailId || undefined,
        Status: formData.Status || 'Active',
      };

      // Only include doctor fields if role is doctor
      if (selectedRoleIsDoctor) {
        submitData.DoctorDepartmentId = formData.DoctorDepartmentId || undefined;
        submitData.DoctorQualification = formData.DoctorQualification || undefined;
        submitData.DoctorType = formData.DoctorType;
        submitData.DoctorOPDCharge = formData.DoctorOPDCharge;
        submitData.DoctorSurgeryCharge = formData.DoctorSurgeryCharge;
        submitData.OPDConsultation = formData.OPDConsultation;
        submitData.IPDVisit = formData.IPDVisit;
        submitData.OTHandle = formData.OTHandle;
        submitData.ICUVisits = formData.ICUVisits;
      }

      await onUpdateStaff({ UserId: selectedStaff.UserId, ...submitData });
      setIsEditDialogOpen(false);
      setSelectedStaff(null);
      setFormData({
        RoleId: '',
        UserName: '',
        Password: '',
        PhoneNo: '',
        EmailId: '',
        DoctorDepartmentId: '',
        DoctorQualification: '',
        DoctorType: undefined,
        DoctorOPDCharge: undefined,
        DoctorSurgeryCharge: undefined,
        OPDConsultation: undefined,
        IPDVisit: undefined,
        OTHandle: undefined,
        ICUVisits: undefined,
        Status: 'Active',
      });
    } catch (err) {
      // Error handled in parent
    }
  };

  const handleEdit = (staffMember: Staff) => {
    setSelectedStaff(staffMember);
    const roleIsDoctor = staffMember.RoleId ? isDoctorRole(staffMember.RoleId) : false;
    setFormData({
      RoleId: staffMember.RoleId,
      UserName: staffMember.UserName,
      Password: '', // Don't populate password
      PhoneNo: staffMember.PhoneNo || '',
      EmailId: staffMember.EmailId || '',
      DoctorDepartmentId: staffMember.DoctorDepartmentId || '',
      DoctorQualification: staffMember.DoctorQualification || '',
      DoctorType: staffMember.DoctorType,
      DoctorOPDCharge: staffMember.DoctorOPDCharge,
      DoctorSurgeryCharge: staffMember.DoctorSurgeryCharge,
      OPDConsultation: staffMember.OPDConsultation,
      IPDVisit: staffMember.IPDVisit,
      OTHandle: staffMember.OTHandle,
      ICUVisits: staffMember.ICUVisits,
      Status: staffMember.Status || 'Active',
    });
    setIsEditDialogOpen(true);
  };

  const getStatusBadgeColor = (status?: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-700';
      case 'InActive':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  // Filter staff based on selected status
  const filteredStaff = allStaff.filter(s => {
    const statusMatch = selectedStatus === 'all' || s.Status === selectedStatus;
    return statusMatch;
  });

  const headerActions = (
    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="size-4" />
          Add Staff
        </Button>
      </DialogTrigger>
        <DialogContent className="p-0 gap-0 large-dialog">
          <DialogHeader className="px-6 pt-4 pb-3 flex-shrink-0">
            <DialogTitle>Add New Staff Member</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto px-6 pb-1 patient-list-scrollable min-h-0">
            <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="roleId">Role *</Label>
                <select
                  id="roleId"
                  aria-label="Role"
                  className="w-full px-3 py-2 border border-gray-200 rounded-md"
                  value={formData.RoleId}
                  onChange={(e) => {
                    const newRoleId = e.target.value;
                    setFormData({ 
                      ...formData, 
                      RoleId: newRoleId,
                      // Clear doctor fields if role changes from doctor to non-doctor
                      ...(newRoleId && !isDoctorRole(newRoleId) ? {
                        DoctorDepartmentId: '',
                        DoctorQualification: '',
                        DoctorType: undefined,
                        DoctorOPDCharge: undefined,
                        DoctorSurgeryCharge: undefined,
                        OPDConsultation: undefined,
                        IPDVisit: undefined,
                        OTHandle: undefined,
                        ICUVisits: undefined,
                      } : {})
                    });
                  }}
                  required
                >
                  <option value="">Select a role</option>
                  {roles.filter(r => r && r.id && r.name).map(role => (
                    <option key={role.id} value={role.id}>{role.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="userName">User Name *</Label>
                <Input
                  id="userName"
                  placeholder="Enter user name"
                  value={formData.UserName}
                  onChange={(e) => setFormData({ ...formData, UserName: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter password"
                  value={formData.Password}
                  onChange={(e) => setFormData({ ...formData, Password: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="phoneNo">Phone Number</Label>
                <Input
                  id="phoneNo"
                  placeholder="Enter phone number"
                  value={formData.PhoneNo}
                  onChange={(e) => setFormData({ ...formData, PhoneNo: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="emailId">Email</Label>
                <Input
                  id="emailId"
                  type="email"
                  placeholder="Enter email"
                  value={formData.EmailId}
                  onChange={(e) => setFormData({ ...formData, EmailId: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  aria-label="Status"
                  className="w-full px-3 py-2 border border-gray-200 rounded-md"
                  value={formData.Status}
                  onChange={(e) => setFormData({ ...formData, Status: e.target.value as 'Active' | 'InActive' })}
                >
                  <option value="Active">Active</option>
                  <option value="InActive">InActive</option>
                </select>
              </div>
            </div>

            {/* Doctor-specific fields */}
            {selectedRoleIsDoctor && (
              <>
                <div className="border-t pt-4 mt-4">
                  <h3 className="text-sm font-semibold mb-4 text-gray-700">Doctor Information</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="doctorDepartmentId">Department</Label>
                    <select
                      id="doctorDepartmentId"
                      aria-label="Department"
                      className="w-full px-3 py-2 border border-gray-200 rounded-md"
                      value={formData.DoctorDepartmentId}
                      onChange={(e) => setFormData({ ...formData, DoctorDepartmentId: e.target.value })}
                    >
                      <option value="">Select a department</option>
                      {departments && departments.length > 0 ? (
                        departments.filter(d => d && d.id !== undefined && d.id !== null).map(dept => (
                          <option key={dept.id} value={String(dept.id)}>
                            {dept.name}
                          </option>
                        ))
                      ) : (
                        <option value="" disabled>Loading departments...</option>
                      )}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="doctorQualification">Qualification</Label>
                    <Input
                      id="doctorQualification"
                      placeholder="e.g., MBBS, MD"
                      value={formData.DoctorQualification}
                      onChange={(e) => setFormData({ ...formData, DoctorQualification: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="doctorType">Doctor Type</Label>
                    <select
                      id="doctorType"
                      aria-label="Doctor Type"
                      className="w-full px-3 py-2 border border-gray-200 rounded-md"
                      value={formData.DoctorType || ''}
                      onChange={(e) => setFormData({ ...formData, DoctorType: e.target.value as 'INHOUSE' | 'VISITING' || undefined })}
                    >
                      <option value="">Select type</option>
                      <option value="INHOUSE">INHOUSE</option>
                      <option value="VISITING">VISITING</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="doctorOPDCharge">OPD Charge</Label>
                    <Input
                      id="doctorOPDCharge"
                      type="number"
                      placeholder="Enter OPD charge"
                      value={formData.DoctorOPDCharge || ''}
                      onChange={(e) => setFormData({ ...formData, DoctorOPDCharge: e.target.value ? Number(e.target.value) : undefined })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="doctorSurgeryCharge">Surgery Charge</Label>
                    <Input
                      id="doctorSurgeryCharge"
                      type="number"
                      placeholder="Enter surgery charge"
                      value={formData.DoctorSurgeryCharge || ''}
                      onChange={(e) => setFormData({ ...formData, DoctorSurgeryCharge: e.target.value ? Number(e.target.value) : undefined })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="opdConsultation">OPD Consultation</Label>
                    <select
                      id="opdConsultation"
                      className="w-full px-3 py-2 border border-gray-200 rounded-md"
                      value={formData.OPDConsultation || ''}
                      onChange={(e) => setFormData({ ...formData, OPDConsultation: e.target.value as 'Yes' | 'No' || undefined })}
                    >
                      <option value="">Select</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="ipdVisit">IPD Visit</Label>
                    <select
                      id="ipdVisit"
                      className="w-full px-3 py-2 border border-gray-200 rounded-md"
                      value={formData.IPDVisit || ''}
                      onChange={(e) => setFormData({ ...formData, IPDVisit: e.target.value as 'Yes' | 'No' || undefined })}
                    >
                      <option value="">Select</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="otHandle">OT Handle</Label>
                    <select
                      id="otHandle"
                      className="w-full px-3 py-2 border border-gray-200 rounded-md"
                      value={formData.OTHandle || ''}
                      onChange={(e) => setFormData({ ...formData, OTHandle: e.target.value as 'Yes' | 'No' || undefined })}
                    >
                      <option value="">Select</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="icuVisits">ICU Visits</Label>
                    <select
                      id="icuVisits"
                      className="w-full px-3 py-2 border border-gray-200 rounded-md"
                      value={formData.ICUVisits || ''}
                      onChange={(e) => setFormData({ ...formData, ICUVisits: e.target.value as 'Yes' | 'No' || undefined })}
                    >
                      <option value="">Select</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>
                </div>
              </>
            )}
            </div>
          </div>
          <div className="flex justify-end gap-2 px-6 py-2 border-t bg-gray-50 flex-shrink-0">
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="py-1">Cancel</Button>
            <Button onClick={handleAddSubmit} className="py-1">Add Staff</Button>
          </div>
        </DialogContent>
      </Dialog>
  );

  return (
    <>
      <div className="px-4 pt-4 pb-0 bg-blue-100 h-full flex flex-col overflow-hidden">
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
          <div>
            <h1 className="text-gray-900 mb-0 text-xl">Staff Management</h1>
            <p className="text-gray-500 text-sm">Manage hospital staff members</p>
          </div>
          {headerActions && <div className="flex-shrink-0">{headerActions}</div>}
        </div>

        {/* Status Filter Tabs */}
        <div className="mb-4 flex-shrink-0">
          <Tabs 
            value={selectedStatus} 
            onValueChange={(value) => onStatusFilterChange(value as 'Active' | 'InActive' | 'all')}
            className="w-full"
          >
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="all">
                All ({allStaff.length})
              </TabsTrigger>
              <TabsTrigger value="Active">
                Active ({allStaff.filter(s => s.Status === 'Active').length})
              </TabsTrigger>
              <TabsTrigger value="InActive">
                InActive ({allStaff.filter(s => s.Status === 'InActive').length})
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <Card className="flex-1 flex flex-col overflow-hidden min-h-0">
          <CardContent className="p-0 flex-1 overflow-hidden flex flex-col min-h-0">
            <div className="overflow-x-auto overflow-y-scroll border border-gray-200 rounded flex-1" style={{ maxHeight: 'calc(100vh - 100px)' }}>
              <table className="w-full">
          <thead className="sticky top-0 bg-white z-10 shadow-sm">
            <tr className="border-b border-gray-200">
              <th className="text-left py-0.5 px-4 text-gray-700 bg-white whitespace-nowrap">User Name</th>
              <th className="text-left py-0.5 px-4 text-gray-700 bg-white whitespace-nowrap">Role</th>
              <th className="text-left py-0.5 px-4 text-gray-700 bg-white whitespace-nowrap">Phone</th>
              <th className="text-left py-0.5 px-4 text-gray-700 bg-white whitespace-nowrap">Email</th>
              <th className="text-left py-0.5 px-4 text-gray-700 bg-white whitespace-nowrap">Department</th>
              <th className="text-left py-0.5 px-4 text-gray-700 bg-white whitespace-nowrap">Qualification</th>
              <th className="text-left py-0.5 px-4 text-gray-700 bg-white whitespace-nowrap">Status</th>
              <th className="text-left py-0.5 px-4 text-gray-700 bg-white whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredStaff.map((member) => {
              const role = roles.find(r => r.id === member.RoleId);
              const department = member.DoctorDepartmentId && departments.length > 0
                ? departments.find(d => {
                    if (!d || d.id === undefined || d.id === null) return false;
                    // Try both string and number comparison since DoctorDepartmentId might be UUID string or number
                    return String(d.id) === String(member.DoctorDepartmentId) || 
                           d.id === Number(member.DoctorDepartmentId);
                  })
                : null;
              return (
                <tr key={member.UserId || `staff-${member.UserName}`} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-1 px-4">
                    <div className="flex items-center gap-2">
                      <Users className="size-4 text-blue-600" />
                      <span className="text-gray-900 font-medium">{member.UserName || '-'}</span>
                    </div>
                  </td>
                  <td className="py-1 px-4 text-gray-600">{role?.name || '-'}</td>
                  <td className="py-1 px-4 text-gray-600">{member.PhoneNo || '-'}</td>
                  <td className="py-1 px-4 text-gray-600">{member.EmailId || '-'}</td>
                  <td className="py-1 px-4 text-gray-600">{department?.name || '-'}</td>
                  <td className="py-1 px-4 text-gray-600">{member.DoctorQualification || '-'}</td>
                  <td className="py-1 px-4">
                    <span className={`px-2 py-1 rounded text-xs ${getStatusBadgeColor(member.Status)}`}>
                      {member.Status || 'Active'}
                    </span>
                  </td>
                  <td className="py-1 px-4">
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(member)}>
                        <Edit className="size-4" />
                      </Button>
                      {member.UserId && (
                        <Button variant="ghost" size="sm" onClick={() => onDeleteStaff(member.UserId!)}>
                          <Trash2 className="size-4 text-red-600" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            <tr>
              <td className="py-1 px-4" colSpan={8}></td>
            </tr>
          </tbody>
        </table>
        {filteredStaff.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No staff members found
          </div>
        )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="p-0 gap-0 large-dialog">
          <DialogHeader className="px-6 pt-4 pb-3 flex-shrink-0">
            <DialogTitle>Edit Staff Member</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto px-6 pb-1 patient-list-scrollable min-h-0">
            <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-roleId">Role *</Label>
                <select
                  id="edit-roleId"
                  aria-label="Role"
                  className="w-full px-3 py-2 border border-gray-200 rounded-md"
                  value={formData.RoleId}
                  onChange={(e) => {
                    const newRoleId = e.target.value;
                    setFormData({ 
                      ...formData, 
                      RoleId: newRoleId,
                      // Clear doctor fields if role changes from doctor to non-doctor
                      ...(newRoleId && !isDoctorRole(newRoleId) ? {
                        DoctorDepartmentId: '',
                        DoctorQualification: '',
                        DoctorType: undefined,
                        DoctorOPDCharge: undefined,
                        DoctorSurgeryCharge: undefined,
                        OPDConsultation: undefined,
                        IPDVisit: undefined,
                        OTHandle: undefined,
                        ICUVisits: undefined,
                      } : {})
                    });
                  }}
                  required
                >
                  <option value="">Select a role</option>
                  {roles.filter(r => r && r.id && r.name).map(role => (
                    <option key={role.id} value={role.id}>{role.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="edit-userName">User Name *</Label>
                <Input
                  id="edit-userName"
                  placeholder="Enter user name"
                  value={formData.UserName}
                  onChange={(e) => setFormData({ ...formData, UserName: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-phoneNo">Phone Number</Label>
                <Input
                  id="edit-phoneNo"
                  placeholder="Enter phone number"
                  value={formData.PhoneNo}
                  onChange={(e) => setFormData({ ...formData, PhoneNo: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-emailId">Email</Label>
                <Input
                  id="edit-emailId"
                  type="email"
                  placeholder="Enter email"
                  value={formData.EmailId}
                  onChange={(e) => setFormData({ ...formData, EmailId: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-status">Status</Label>
                <select
                  id="edit-status"
                  aria-label="Status"
                  className="w-full px-3 py-2 border border-gray-200 rounded-md"
                  value={formData.Status}
                  onChange={(e) => setFormData({ ...formData, Status: e.target.value as 'Active' | 'InActive' })}
                >
                  <option value="Active">Active</option>
                  <option value="InActive">InActive</option>
                </select>
              </div>
            </div>

            {/* Doctor-specific fields */}
            {selectedRoleIsDoctor && (
              <>
                <div className="border-t pt-4 mt-4">
                  <h3 className="text-sm font-semibold mb-4 text-gray-700">Doctor Information</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-doctorDepartmentId">Department</Label>
                    <select
                      id="edit-doctorDepartmentId"
                      aria-label="Department"
                      className="w-full px-3 py-2 border border-gray-200 rounded-md"
                      value={formData.DoctorDepartmentId}
                      onChange={(e) => setFormData({ ...formData, DoctorDepartmentId: e.target.value })}
                    >
                      <option value="">Select a department</option>
                      {departments && departments.length > 0 ? (
                        departments.filter(d => d && d.id !== undefined && d.id !== null).map(dept => (
                          <option key={dept.id} value={String(dept.id)}>
                            {dept.name}
                          </option>
                        ))
                      ) : (
                        <option value="" disabled>Loading departments...</option>
                      )}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="edit-doctorQualification">Qualification</Label>
                    <Input
                      id="edit-doctorQualification"
                      placeholder="e.g., MBBS, MD"
                      value={formData.DoctorQualification}
                      onChange={(e) => setFormData({ ...formData, DoctorQualification: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-doctorType">Doctor Type</Label>
                    <select
                      id="edit-doctorType"
                      aria-label="Doctor Type"
                      className="w-full px-3 py-2 border border-gray-200 rounded-md"
                      value={formData.DoctorType || ''}
                      onChange={(e) => setFormData({ ...formData, DoctorType: e.target.value as 'INHOUSE' | 'VISITING' || undefined })}
                    >
                      <option value="">Select type</option>
                      <option value="INHOUSE">INHOUSE</option>
                      <option value="VISITING">VISITING</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="edit-doctorOPDCharge">OPD Charge</Label>
                    <Input
                      id="edit-doctorOPDCharge"
                      type="number"
                      placeholder="Enter OPD charge"
                      value={formData.DoctorOPDCharge || ''}
                      onChange={(e) => setFormData({ ...formData, DoctorOPDCharge: e.target.value ? Number(e.target.value) : undefined })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-doctorSurgeryCharge">Surgery Charge</Label>
                    <Input
                      id="edit-doctorSurgeryCharge"
                      type="number"
                      placeholder="Enter surgery charge"
                      value={formData.DoctorSurgeryCharge || ''}
                      onChange={(e) => setFormData({ ...formData, DoctorSurgeryCharge: e.target.value ? Number(e.target.value) : undefined })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-opdConsultation">OPD Consultation</Label>
                    <select
                      id="edit-opdConsultation"
                      className="w-full px-3 py-2 border border-gray-200 rounded-md"
                      value={formData.OPDConsultation || ''}
                      onChange={(e) => setFormData({ ...formData, OPDConsultation: e.target.value as 'Yes' | 'No' || undefined })}
                    >
                      <option value="">Select</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="edit-ipdVisit">IPD Visit</Label>
                    <select
                      id="edit-ipdVisit"
                      className="w-full px-3 py-2 border border-gray-200 rounded-md"
                      value={formData.IPDVisit || ''}
                      onChange={(e) => setFormData({ ...formData, IPDVisit: e.target.value as 'Yes' | 'No' || undefined })}
                    >
                      <option value="">Select</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-otHandle">OT Handle</Label>
                    <select
                      id="edit-otHandle"
                      className="w-full px-3 py-2 border border-gray-200 rounded-md"
                      value={formData.OTHandle || ''}
                      onChange={(e) => setFormData({ ...formData, OTHandle: e.target.value as 'Yes' | 'No' || undefined })}
                    >
                      <option value="">Select</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="edit-icuVisits">ICU Visits</Label>
                    <select
                      id="edit-icuVisits"
                      className="w-full px-3 py-2 border border-gray-200 rounded-md"
                      value={formData.ICUVisits || ''}
                      onChange={(e) => setFormData({ ...formData, ICUVisits: e.target.value as 'Yes' | 'No' || undefined })}
                    >
                      <option value="">Select</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>
                </div>
              </>
            )}
            </div>
          </div>
          <div className="flex justify-end gap-2 px-6 py-2 border-t bg-gray-50 flex-shrink-0">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="py-1">Cancel</Button>
            <Button onClick={handleEditSubmit} className="py-1">Update Staff</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

