// Departments Management Component - Separated UI from logic
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Plus, Trash2, Edit, Building2, MapPin, Phone, Mail, User } from 'lucide-react';
import { useDepartments } from '../hooks/useDepartments';
import { Department, DepartmentCategory } from '../types/departments';

interface DepartmentsViewProps {
  departments: Department[];
  selectedCategory: DepartmentCategory | undefined;
  onCategoryChange: (category: DepartmentCategory | undefined) => void;
  onCreateDepartment: (data: {
    name: string;
    category: DepartmentCategory;
    description?: string;
    headOfDepartment?: string;
    location?: string;
    phone?: string;
    email?: string;
    status?: 'active' | 'inactive';
  }) => Promise<void>;
  onUpdateDepartment: (id: number, data: Partial<{
    name: string;
    category: DepartmentCategory;
    description?: string;
    headOfDepartment?: string;
    location?: string;
    phone?: string;
    email?: string;
    status?: 'active' | 'inactive';
  }>) => Promise<void>;
  onDeleteDepartment: (id: number) => Promise<void>;
}

const categoryOptions: DepartmentCategory[] = ['Clinical', 'Surgical', 'Diagnostic', 'Support', 'Administrative'];

export function Departments() {
  const [selectedCategory, setSelectedCategory] = useState<DepartmentCategory | undefined>(undefined);
  const { departments, loading, error, createDepartment, updateDepartment, deleteDepartment } = useDepartments(selectedCategory);

  const handleCreateDepartment = async (data: {
    name: string;
    category: DepartmentCategory;
    description?: string;
    headOfDepartment?: string;
    location?: string;
    phone?: string;
    email?: string;
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
    headOfDepartment?: string;
    location?: string;
    phone?: string;
    email?: string;
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
    headOfDepartment: '',
    location: '',
    phone: '',
    email: '',
    status: 'active' as 'active' | 'inactive',
  });

  const handleAddSubmit = async () => {
    try {
      await onCreateDepartment({
        name: formData.name,
        category: formData.category,
        description: formData.description || undefined,
        headOfDepartment: formData.headOfDepartment || undefined,
        location: formData.location || undefined,
        phone: formData.phone || undefined,
        email: formData.email || undefined,
        status: formData.status,
      });
      setIsAddDialogOpen(false);
      setFormData({
        name: '',
        category: 'Clinical',
        description: '',
        headOfDepartment: '',
        location: '',
        phone: '',
        email: '',
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
        headOfDepartment: formData.headOfDepartment || undefined,
        location: formData.location || undefined,
        phone: formData.phone || undefined,
        email: formData.email || undefined,
        status: formData.status,
      });
      setIsEditDialogOpen(false);
      setSelectedDepartment(null);
      setFormData({
        name: '',
        category: 'Clinical',
        description: '',
        headOfDepartment: '',
        location: '',
        phone: '',
        email: '',
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
      headOfDepartment: department.headOfDepartment || '',
      location: department.location || '',
      phone: department.phone || '',
      email: department.email || '',
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

  return (
    <div className="p-8 bg-blue-100 min-h-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-blue-900 mb-2">Departments Management</h1>
          <p className="text-blue-600">Manage hospital departments by category</p>
        </div>
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="headOfDepartment">Head of Department</Label>
                  <Input
                    id="headOfDepartment"
                    placeholder="e.g., Dr. John Smith"
                    value={formData.headOfDepartment}
                    onChange={(e) => setFormData({ ...formData, headOfDepartment: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    placeholder="e.g., Building A, Floor 2"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Phone</Label>
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

      {/* Category Filter */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <Label htmlFor="categoryFilter" className="text-base font-medium">Filter by Category:</Label>
            <select
              id="categoryFilter"
              aria-label="Filter by Category"
              className="px-4 py-2 border border-gray-200 rounded-md min-w-[200px]"
              value={selectedCategory || ''}
              onChange={(e) => onCategoryChange(e.target.value ? e.target.value as DepartmentCategory : undefined)}
            >
              <option value="">All Categories</option>
              {categoryOptions.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            {selectedCategory && (
              <span className="text-sm text-gray-600">
                Showing {departments.length} department{departments.length !== 1 ? 's' : ''} in {selectedCategory}
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Departments List */}
      <Card>
        <CardContent className="p-6">
          {selectedCategory ? (
            <div>
              <CardHeader className="px-0 pt-0 pb-4">
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="size-5" />
                  {selectedCategory} Departments
                </CardTitle>
              </CardHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {departments.map((dept) => (
                  <Card key={dept.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="text-gray-900 font-semibold mb-1">{dept.name}</h3>
                          <span className={`px-2 py-1 rounded text-xs ${getCategoryColor(dept.category)}`}>
                            {dept.category}
                          </span>
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(dept)}>
                            <Edit className="size-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => onDeleteDepartment(dept.id)}>
                            <Trash2 className="size-4 text-red-600" />
                          </Button>
                        </div>
                      </div>
                      {dept.description && (
                        <p className="text-sm text-gray-600 mb-3">{dept.description}</p>
                      )}
                      <div className="space-y-2 text-sm">
                        {dept.headOfDepartment && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <User className="size-4" />
                            <span>{dept.headOfDepartment}</span>
                          </div>
                        )}
                        {dept.location && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <MapPin className="size-4" />
                            <span>{dept.location}</span>
                          </div>
                        )}
                        {dept.phone && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <Phone className="size-4" />
                            <span>{dept.phone}</span>
                          </div>
                        )}
                        {dept.email && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <Mail className="size-4" />
                            <span className="text-xs">{dept.email}</span>
                          </div>
                        )}
                      </div>
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <span className={`px-2 py-1 rounded text-xs ${
                          dept.status === 'active' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {dept.status === 'active' ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              {departments.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  No departments found in {selectedCategory} category
                </div>
              )}
            </div>
          ) : (
            <div>
              <CardHeader className="px-0 pt-0 pb-4">
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="size-5" />
                  All Departments
                </CardTitle>
              </CardHeader>
              <div className="space-y-4">
                {categoryOptions.map((category) => {
                  const categoryDepts = departments.filter(d => d.category === category);
                  if (categoryDepts.length === 0) return null;
                  
                  return (
                    <div key={category} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                          <span className={`px-3 py-1 rounded text-sm ${getCategoryColor(category)}`}>
                            {category}
                          </span>
                          <span className="text-gray-500 text-sm">({categoryDepts.length} departments)</span>
                        </h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {categoryDepts.map((dept) => (
                          <div
                            key={dept.id}
                            className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                            onClick={() => onCategoryChange(category)}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-gray-900 font-medium">{dept.name}</span>
                              <span className={`px-2 py-0.5 rounded text-xs ${
                                dept.status === 'active' 
                                  ? 'bg-green-100 text-green-700' 
                                  : 'bg-red-100 text-red-700'
                              }`}>
                                {dept.status}
                              </span>
                            </div>
                            {dept.headOfDepartment && (
                              <p className="text-xs text-gray-600 mt-1">{dept.headOfDepartment}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
              {departments.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  No departments found
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-headOfDepartment">Head of Department</Label>
                <Input
                  id="edit-headOfDepartment"
                  placeholder="e.g., Dr. John Smith"
                  value={formData.headOfDepartment}
                  onChange={(e) => setFormData({ ...formData, headOfDepartment: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-location">Location</Label>
                <Input
                  id="edit-location"
                  placeholder="e.g., Building A, Floor 2"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-phone">Phone</Label>
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
    </div>
  );
}
