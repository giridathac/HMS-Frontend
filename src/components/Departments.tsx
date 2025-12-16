// Departments Management Component - Separated UI from logic
import React, { useState, useMemo } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from './ui/dialog';
import { Switch } from './ui/switch';
import { Plus, Edit, Search } from 'lucide-react';
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
      <div className="dashboard-container">
        <div className="dashboard-scrollable-container">
          <div className="dashboard-header-section">
            <div className="text-center py-12 text-gray-600">Loading departments...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-scrollable-container">
          <div className="dashboard-header-section">
            <div className="text-center py-12 text-red-600">Error: {error}</div>
          </div>
        </div>
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
  const [searchTerm, setSearchTerm] = useState('');
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
      console.log('handleEditSubmit - formData:', formData);
      console.log('handleEditSubmit - description value:', formData.description);
      console.log('handleEditSubmit - description type:', typeof formData.description);
      await onUpdateDepartment(selectedDepartment.id, {
        name: formData.name,
        category: formData.category,
        description: formData.description !== undefined ? formData.description : '', // Always include explicitly
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

  // Filter departments based on category and search term
  const filteredDepartments = useMemo(() => {
    let filtered = departments;
    
    // First filter by category
    if (selectedCategory) {
      filtered = filtered.filter(dept => dept.category === selectedCategory);
    }
    
    // Then filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(dept => {
        const name = (dept.name || '').toLowerCase();
        const category = (dept.category || '').toLowerCase();
        const description = (dept.description || '').toLowerCase();
        const specialisation = (dept.specialisationDetails || '').toLowerCase();
        
        return name.includes(searchLower) ||
               category.includes(searchLower) ||
               description.includes(searchLower) ||
               specialisation.includes(searchLower);
      });
    }
    
    return filtered;
  }, [departments, selectedCategory, searchTerm]);

  return (
    <div className="dashboard-container">
      <div className="dashboard-scrollable-container">
        <div className="dashboard-header-section">
          <div className="dashboard-header-content">
            <div>
              <h1 className="dashboard-header">Departments Management</h1>
              <p className="dashboard-subheader">Manage hospital departments by category</p>
            </div>
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
              <DialogContent className="p-0 gap-0 large-dialog dialog-content-standard">
                <div className="dialog-scrollable-wrapper dialog-content-scrollable">
                  <DialogHeader className="dialog-header-standard">
                    <DialogTitle className="dialog-title-standard-view">Add New Department</DialogTitle>
                  </DialogHeader>
                  <div className="dialog-body-content-wrapper">
                    <div className="dialog-form-container">
                      <div className="dialog-form-field-grid">
                        <div className="dialog-field-single-column">
                          <Label htmlFor="name" className="dialog-label-standard">Department Name</Label>
                          <Input
                            id="name"
                            placeholder="e.g., Medicine"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="dialog-input-standard"
                          />
                        </div>
                        <div className="dialog-field-single-column">
                          <Label htmlFor="category" className="dialog-label-standard">Category</Label>
                          <select
                            id="category"
                            aria-label="Category"
                            className="dialog-select-standard"
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value as DepartmentCategory })}
                          >
                            {categoryOptions.map(cat => (
                              <option key={cat} value={cat}>{cat}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="dialog-form-field">
                        <Label htmlFor="description" className="dialog-label-standard">Description</Label>
                        <Textarea
                          id="description"
                          placeholder="Enter department description..."
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          rows={3}
                          className="dialog-textarea-standard"
                        />
                      </div>
                      <div className="dialog-form-field">
                        <Label htmlFor="specialisationDetails" className="dialog-label-standard">Specialisation Details</Label>
                        <Textarea
                          id="specialisationDetails"
                          placeholder="e.g., Cardiology, Interventional Cardiology, Cardiac Rehabilitation"
                          value={formData.specialisationDetails}
                          onChange={(e) => setFormData({ ...formData, specialisationDetails: e.target.value })}
                          rows={3}
                          className="dialog-textarea-standard"
                        />
                      </div>
                      <div className="dialog-form-field">
                        <Label htmlFor="noOfDoctors" className="dialog-label-standard">Number of Doctors</Label>
                        <Input
                          id="noOfDoctors"
                          type="number"
                          min="0"
                          placeholder="Enter number of doctors"
                          value={formData.noOfDoctors}
                          onChange={(e) => setFormData({ ...formData, noOfDoctors: parseInt(e.target.value) || 0 })}
                          className="dialog-input-standard"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="dialog-footer-standard">
                    <Button variant="outline" onClick={() => {
                      setIsAddDialogOpen(false);
                      setFormData({
                        name: '',
                        category: 'Clinical',
                        description: '',
                        specialisationDetails: '',
                        noOfDoctors: 0,
                        status: 'active',
                      });
                    }} className="dialog-footer-button">Cancel</Button>
                    <Button onClick={handleAddSubmit} className="dialog-footer-button">Add Department</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        <div className="dashboard-main-content">
          {/* Search */}
          <Card className="dashboard-search-card">
            <CardContent className="dashboard-search-card-content">
              <div className="dashboard-search-input-wrapper">
                <Search className="dashboard-search-icon" />
                <Input
                  placeholder="Search by department name, category, description, or specialisation..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="dashboard-search-input"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="dashboard-table-card">
            <CardContent className="dashboard-table-card-content">
              <div className="dashboard-table-wrapper">
                <table className="dashboard-table">
                  <thead>
                    <tr className="dashboard-table-header-row">
                      <th className="dashboard-table-header-cell">Department Name</th>
                      <th className="dashboard-table-header-cell">Category</th>
                      <th className="dashboard-table-header-cell">Description</th>
                      <th className="dashboard-table-header-cell">No. of Doctors</th>
                      <th className="dashboard-table-header-cell">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDepartments.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="dashboard-table-empty-cell">
                          {searchTerm 
                            ? 'No departments found matching your search.'
                            : selectedCategory 
                              ? `No departments found in ${selectedCategory} category`
                              : 'No departments found'
                          }
                        </td>
                      </tr>
                    ) : (
                      filteredDepartments.map((dept) => (
                        <tr key={dept.id} className="dashboard-table-body-row">
                          <td className="dashboard-table-body-cell dashboard-table-body-cell-secondary">
                            {dept.name}
                          </td>
                          <td className="dashboard-table-body-cell dashboard-table-body-cell-secondary">
                            {dept.category}
                          </td>
                          <td className="dashboard-table-body-cell dashboard-table-body-cell-secondary">
                            {dept.description || '-'}
                          </td>
                          <td className="dashboard-table-body-cell dashboard-table-body-cell-secondary">
                            {dept.noOfDoctors !== undefined ? dept.noOfDoctors : 0}
                          </td>
                          <td className="dashboard-table-body-cell">
                            <div className="dashboard-actions-container">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(dept)}
                                className="dashboard-manage-button"
                                title="Manage Department"
                              >
                                <Edit className="size-4" />
                                Manage
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
      </div>
    </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="p-0 gap-0 large-dialog dialog-content-standard">
          <div className="dialog-scrollable-wrapper dialog-content-scrollable">
            <DialogHeader className="dialog-header-standard">
              <DialogTitle className="dialog-title-standard-view">Edit Department</DialogTitle>
            </DialogHeader>
            <div className="dialog-body-content-wrapper">
              <div className="dialog-form-container">
                <div className="dialog-form-field-grid">
                  <div className="dialog-field-single-column">
                    <Label htmlFor="edit-name" className="dialog-label-standard">Department Name</Label>
                    <Input
                      id="edit-name"
                      placeholder="e.g., Medicine"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="dialog-input-standard"
                    />
                  </div>
                  <div className="dialog-field-single-column">
                    <Label htmlFor="edit-category" className="dialog-label-standard">Category</Label>
                    <select
                      id="edit-category"
                      aria-label="Category"
                      className="dialog-select-standard"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value as DepartmentCategory })}
                    >
                      {categoryOptions.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="dialog-form-field">
                  <Label htmlFor="edit-description" className="dialog-label-standard">Description</Label>
                  <Textarea
                    id="edit-description"
                    placeholder="Enter department description..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="dialog-textarea-standard"
                  />
                </div>
                <div className="dialog-form-field">
                  <Label htmlFor="edit-specialisationDetails" className="dialog-label-standard">Specialisation Details</Label>
                  <Textarea
                    id="edit-specialisationDetails"
                    placeholder="e.g., Cardiology, Interventional Cardiology, Cardiac Rehabilitation"
                    value={formData.specialisationDetails}
                    onChange={(e) => setFormData({ ...formData, specialisationDetails: e.target.value })}
                    rows={3}
                    className="dialog-textarea-standard"
                  />
                </div>
                <div className="dialog-form-field">
                  <Label htmlFor="edit-noOfDoctors" className="dialog-label-standard">Number of Doctors</Label>
                  <Input
                    id="edit-noOfDoctors"
                    type="number"
                    min="0"
                    placeholder="Enter number of doctors"
                    value={formData.noOfDoctors}
                    onChange={(e) => setFormData({ ...formData, noOfDoctors: parseInt(e.target.value) || 0 })}
                    className="dialog-input-standard"
                  />
                </div>
                <div className="dialog-form-field">
                  <div className="flex items-center gap-3">
                    <Label htmlFor="edit-status" className="dialog-label-standard">Status</Label>
                    <div className="flex-shrink-0 relative" style={{ zIndex: 1 }}>
                      <Switch
                        id="edit-status"
                        checked={formData.status === 'active'}
                        onCheckedChange={(checked) => {
                          setFormData({ ...formData, status: checked ? 'active' : 'inactive' });
                        }}
                        className="data-[state=checked]:bg-blue-600 data-[state=unchecked]:bg-gray-300 [&_[data-slot=switch-thumb]]:!bg-white [&_[data-slot=switch-thumb]]:!border [&_[data-slot=switch-thumb]]:!border-gray-400 [&_[data-slot=switch-thumb]]:!shadow-sm"
                        style={{
                          width: '2.5rem',
                          height: '1.5rem',
                          minWidth: '2.5rem',
                          minHeight: '1.5rem',
                          display: 'inline-flex',
                          position: 'relative',
                          backgroundColor: formData.status === 'active' ? '#2563eb' : '#d1d5db',
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="dialog-footer-standard">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="dialog-footer-button">Cancel</Button>
              <Button onClick={handleEditSubmit} className="dialog-footer-button">Update Department</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
