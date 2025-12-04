// Departments Management Component - Separated UI from logic
import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Plus, Trash2, Edit, Building2, Stethoscope, Users } from 'lucide-react';
import { useDepartments } from '../hooks/useDepartments';
import { Department, DepartmentCategory } from '../types/departments';
import { PageLayout } from './layouts/PageLayout';

interface DepartmentsViewProps {
  departments: Department[];
  selectedCategory: DepartmentCategory | undefined;
  onCategoryChange: (category: DepartmentCategory | undefined) => void;
  onCreateDepartment: (data: {
    name: string;
    category: DepartmentCategory;
    description?: string;
    specialisationDetails?: string;
    noOfDoctors?: number;
    status?: 'active' | 'inactive';
  }) => Promise<void>;
  onUpdateDepartment: (id: number, data: Partial<{
    name: string;
    category: DepartmentCategory;
    description?: string;
    specialisationDetails?: string;
    noOfDoctors?: number;
    status?: 'active' | 'inactive';
  }>) => Promise<void>;
  onDeleteDepartment: (id: number) => Promise<void>;
}

const categoryOptions: DepartmentCategory[] = ['Clinical', 'Surgical', 'Diagnostic', 'Support', 'Administrative'];

export function Departments() {
  const [selectedCategory, setSelectedCategory] = useState<DepartmentCategory | undefined>(undefined);
  // Always fetch all departments, filter client-side
  const { departments, loading, error, createDepartment, updateDepartment, deleteDepartment } = useDepartments();

  const handleCreateDepartment = async (data: {
    name: string;
    category: DepartmentCategory;
    description?: string;
    specialisationDetails?: string;
    noOfDoctors?: number;
    status?: 'active' | 'inactive';
  }) => {
    try {
      await createDepartment(data);
    } catch (err) {
      console.error('Failed to create department:', err);
      throw err;
    }
  };

  const handleUpdateDepartment = async (id: number, data: Partial<{
    name: string;
    category: DepartmentCategory;
    description?: string;
    specialisationDetails?: string;
    noOfDoctors?: number;
    status?: 'active' | 'inactive';
  }>) => {
    try {
      await updateDepartment({ id, ...data });
    } catch (err) {
      console.error('Failed to update department:', err);
      throw err;
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this department? This action cannot be undone.')) {
      try {
        await deleteDepartment(id);
      } catch (err) {
        console.error('Failed to delete department:', err);
      }
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center py-12 text-gray-500">Loading departments...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="text-center py-12 text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <DepartmentsView
      departments={departments}
      selectedCategory={selectedCategory}
      onCategoryChange={setSelectedCategory}
      onCreateDepartment={handleCreateDepartment}
      onUpdateDepartment={handleUpdateDepartment}
      onDeleteDepartment={handleDelete}
    />
  );
}

function DepartmentsView({
  departments,
  selectedCategory,
  onCategoryChange,
  onCreateDepartment,
  onUpdateDepartment,
  onDeleteDepartment,
}: DepartmentsViewProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Clinical' as DepartmentCategory,
    description: '',
    specialisationDetails: '',
    noOfDoctors: 0,
    status: 'active' as 'active' | 'inactive',
  });

  const handleAddSubmit = async () => {
    try {
      await onCreateDepartment({
        name: formData.name,
        category: formData.category,
        description: formData.description || undefined,
        specialisationDetails: formData.specialisationDetails || undefined,
        noOfDoctors: formData.noOfDoctors || undefined,
        status: formData.status,
      });
      setIsAddDialogOpen(false);
      setFormData({
        name: '',
        category: 'Clinical',
        description: '',
        specialisationDetails: '',
        noOfDoctors: 0,
        status: 'active',
      });
    } catch (err) {
      // Error handled in parent
    }
  };

  const handleEditSubmit = async () => {
    if (!selectedDepartment) return;
    try {
      await onUpdateDepartment(selectedDepartment.id, {
        name: formData.name,
        category: formData.category,
        description: formData.description || undefined,
        specialisationDetails: formData.specialisationDetails || undefined,
        noOfDoctors: formData.noOfDoctors || undefined,
        status: formData.status,
      });
      setIsEditDialogOpen(false);
      setSelectedDepartment(null);
      setFormData({
        name: '',
        category: 'Clinical',
        description: '',
        specialisationDetails: '',
        noOfDoctors: 0,
        status: 'active',
      });
    } catch (err) {
      // Error handled in parent
    }
  };

  const handleEdit = (department: Department) => {
    setSelectedDepartment(department);
    setFormData({
      name: department.name,
      category: department.category,
      description: department.description || '',
      specialisationDetails: department.specialisationDetails || '',
      noOfDoctors: department.noOfDoctors || 0,
      status: department.status,
    });
    setIsEditDialogOpen(true);
  };

  const getCategoryColor = (category: DepartmentCategory) => {
    switch (category) {
      case 'Clinical':
        return 'bg-blue-100 text-blue-700';
      case 'Surgical':
        return 'bg-red-100 text-red-700';
      case 'Diagnostic':
        return 'bg-green-100 text-green-700';
      case 'Support':
        return 'bg-yellow-100 text-yellow-700';
      case 'Administrative':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  // Filter departments client-side as fallback if API filtering doesn't work
  const filteredDepartments = selectedCategory
    ? departments.filter(dept => dept.category === selectedCategory)
    : departments;

  const headerActions = (
    <div className="flex items-center gap-4">
      <select
        id="categoryFilter"
        aria-label="Filter by Category"
        className="px-4 py-2 border border-gray-200 rounded-md min-w-[200px] text-sm bg-white"
        value={selectedCategory || ''}
        onChange={(e) => {
          const value = e.target.value;
          onCategoryChange(value ? value as DepartmentCategory : undefined);
        }}
      >
        <option value="">All Categories</option>
        {categoryOptions.map(cat => (
          <option key={cat} value={cat}>{cat}</option>
        ))}
      </select>
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogTrigger asChild>
          <Button className="gap-2">
            <Plus className="size-4" />
            Add Department
          </Button>
        </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Department</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Department Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Medicine"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <select
                    id="category"
                    aria-label="Category"
                    className="w-full px-3 py-2 border border-gray-200 rounded-md"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as DepartmentCategory })}
                  >
                    {categoryOptions.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Enter department description..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="specialisationDetails">Specialisation Details</Label>
                <Textarea
                  id="specialisationDetails"
                  placeholder="e.g., Cardiology, Interventional Cardiology, Cardiac Rehabilitation"
                  value={formData.specialisationDetails}
                  onChange={(e) => setFormData({ ...formData, specialisationDetails: e.target.value })}
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="noOfDoctors">Number of Doctors</Label>
                <Input
                  id="noOfDoctors"
                  type="number"
                  min="0"
                  placeholder="Enter number of doctors"
                  value={formData.noOfDoctors}
                  onChange={(e) => setFormData({ ...formData, noOfDoctors: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  aria-label="Status"
                  className="w-full px-3 py-2 border border-gray-200 rounded-md"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleAddSubmit}>Add Department</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );

  return (
    <>
      <PageLayout
        title="Departments Management"
        description="Manage hospital departments by category"
        headerActions={headerActions}
        scrollableContent={true}
      >
        <table className="w-full">
          <thead className="sticky top-0 bg-white z-10 shadow-sm">
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 text-gray-700 bg-white">Department Name</th>
              <th className="text-left py-3 px-4 text-gray-700 bg-white">Category</th>
              <th className="text-left py-3 px-4 text-gray-700 bg-white">Description</th>
              <th className="text-left py-3 px-4 text-gray-700 bg-white">Specialisation</th>
              <th className="text-left py-3 px-4 text-gray-700 bg-white">No. of Doctors</th>
              <th className="text-left py-3 px-4 text-gray-700 bg-white">Status</th>
              <th className="text-left py-3 px-4 text-gray-700 bg-white">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredDepartments.map((dept) => (
              <tr key={dept.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <Building2 className="size-4 text-blue-600" />
                    <span className="text-gray-900 font-medium">{dept.name}</span>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded text-xs ${getCategoryColor(dept.category)}`}>
                    {dept.category}
                  </span>
                </td>
                <td className="py-3 px-4 text-gray-600">
                  {dept.description || (
                    <span className="text-gray-400 italic">No description</span>
                  )}
                </td>
                <td className="py-3 px-4 text-gray-600 text-sm">
                  {dept.specialisationDetails ? (
                    <div className="flex items-start gap-2">
                      <Stethoscope className="size-4 mt-0.5 flex-shrink-0" />
                      <span className="text-xs">{dept.specialisationDetails}</span>
                    </div>
                  ) : (
                    <span className="text-gray-400 text-xs">Not specified</span>
                  )}
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Users className="size-4" />
                    <span>{dept.noOfDoctors !== undefined ? dept.noOfDoctors : 0}</span>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded text-xs ${
                    dept.status === 'active' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {dept.status === 'active' ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(dept)}>
                      <Edit className="size-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => onDeleteDepartment(dept.id)}>
                      <Trash2 className="size-4 text-red-600" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            <tr>
              <td className="py-3 px-4" colSpan={7}></td>
            </tr>
          </tbody>
        </table>
        {filteredDepartments.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            {selectedCategory 
              ? `No departments found in ${selectedCategory} category`
              : 'No departments found'
            }
          </div>
        )}
      </PageLayout>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Department</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-name">Department Name</Label>
                <Input
                  id="edit-name"
                  placeholder="e.g., Medicine"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-category">Category</Label>
                <select
                  id="edit-category"
                  aria-label="Category"
                  className="w-full px-3 py-2 border border-gray-200 rounded-md"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as DepartmentCategory })}
                >
                  {categoryOptions.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                placeholder="Enter department description..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="edit-specialisationDetails">Specialisation Details</Label>
              <Textarea
                id="edit-specialisationDetails"
                placeholder="e.g., Cardiology, Interventional Cardiology, Cardiac Rehabilitation"
                value={formData.specialisationDetails}
                onChange={(e) => setFormData({ ...formData, specialisationDetails: e.target.value })}
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="edit-noOfDoctors">Number of Doctors</Label>
              <Input
                id="edit-noOfDoctors"
                type="number"
                min="0"
                placeholder="Enter number of doctors"
                value={formData.noOfDoctors}
                onChange={(e) => setFormData({ ...formData, noOfDoctors: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div>
              <Label htmlFor="edit-status">Status</Label>
              <select
                id="edit-status"
                aria-label="Status"
                className="w-full px-3 py-2 border border-gray-200 rounded-md"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleEditSubmit}>Update Department</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
