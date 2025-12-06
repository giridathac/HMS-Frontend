// Lab Tests Management Component - Separated UI from logic
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Plus, Trash2, Edit, TestTube, Tag, CheckCircle2, XCircle, FileText } from 'lucide-react';
import { useLabTests } from '../hooks/useLabTests';
import { LabTest } from '../types';

interface LabTestsViewProps {
  labTests: LabTest[];
  onCreateLabTest: (data: {
    testName: string;
    testCategory: string;
    description?: string;
    charges: number;
    status?: 'active' | 'inactive';
  }) => Promise<void>;
  onUpdateLabTest: (labTestId: number, data: Partial<{
    testName: string;
    testCategory: string;
    description?: string;
    charges: number;
    status?: 'active' | 'inactive';
  }>) => Promise<void>;
  onDeleteLabTest: (labTestId: number) => Promise<void>;
}

const testCategoryOptions = ['BloodTest', 'Imaging', 'Radiology', 'UrineTest', 'Ultrasound'];
const statusOptions: LabTest['status'][] = ['active', 'inactive'];

export function LabTests() {
  const { labTests, loading, error, createLabTest, updateLabTest, deleteLabTest } = useLabTests();

  const handleCreateLabTest = async (data: {
    testName: string;
    testCategory: string;
    description?: string;
    charges: number;
    status?: 'active' | 'inactive';
  }) => {
    try {
      await createLabTest(data);
    } catch (err) {
      console.error('Failed to create lab test:', err);
      throw err;
    }
  };

  const handleUpdateLabTest = async (labTestId: number, data: Partial<{
    testName: string;
    testCategory: string;
    description?: string;
    charges: number;
    status?: 'active' | 'inactive';
  }>) => {
    try {
      await updateLabTest({ labTestId, ...data });
    } catch (err) {
      console.error('Failed to update lab test:', err);
      throw err;
    }
  };

  const handleDelete = async (labTestId: number) => {
    if (confirm('Are you sure you want to delete this lab test? This action cannot be undone.')) {
      try {
        await deleteLabTest(labTestId);
      } catch (err) {
        console.error('Failed to delete lab test:', err);
      }
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center py-12 text-blue-600">Loading lab tests...</div>
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
    <LabTestsView
      labTests={labTests}
      onCreateLabTest={handleCreateLabTest}
      onUpdateLabTest={handleUpdateLabTest}
      onDeleteLabTest={handleDelete}
    />
  );
}

function LabTestsView({
  labTests,
  onCreateLabTest,
  onUpdateLabTest,
  onDeleteLabTest,
}: LabTestsViewProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedLabTest, setSelectedLabTest] = useState<LabTest | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    testName: '',
    testCategory: 'BloodTest',
    description: '',
    charges: 0,
    status: 'active' as LabTest['status'],
  });

  const handleAddSubmit = async () => {
    setSubmitError(null);
    if (!formData.testName || formData.charges < 0) {
      setSubmitError('Please fill in all required fields with valid values.');
      return;
    }
    try {
      await onCreateLabTest({
        testName: formData.testName,
        testCategory: formData.testCategory,
        description: formData.description || undefined,
        charges: formData.charges,
        status: formData.status,
      });
      setIsAddDialogOpen(false);
      setSubmitError(null);
      setFormData({
        testName: '',
        testCategory: 'BloodTest',
        description: '',
        charges: 0,
        status: 'active',
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create lab test. Please try again.';
      setSubmitError(errorMessage);
      console.error('Failed to create lab test:', err);
    }
  };

  const handleEditSubmit = async () => {
    if (!selectedLabTest) return;
    setSubmitError(null);
    if (!formData.testName || formData.charges < 0) {
      setSubmitError('Please fill in all required fields with valid values.');
      return;
    }
    try {
      await onUpdateLabTest(selectedLabTest.labTestId, {
        testName: formData.testName,
        testCategory: formData.testCategory,
        description: formData.description || undefined,
        charges: formData.charges,
        status: formData.status,
      });
      setIsEditDialogOpen(false);
      setSelectedLabTest(null);
      setSubmitError(null);
      setFormData({
        testName: '',
        testCategory: 'BloodTest',
        description: '',
        charges: 0,
        status: 'active',
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update lab test. Please try again.';
      setSubmitError(errorMessage);
      console.error('Failed to update lab test:', err);
    }
  };

  const handleEdit = (labTest: LabTest) => {
    setSelectedLabTest(labTest);
    setSubmitError(null);
    setFormData({
      testName: labTest.testName,
      testCategory: labTest.testCategory,
      description: labTest.description || '',
      charges: labTest.charges,
      status: labTest.status,
    });
    setIsEditDialogOpen(true);
  };

  const getStatusBadge = (status: LabTest['status']) => {
    switch (status) {
      case 'active':
        return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700"><CheckCircle2 className="size-3" />Active</span>;
      case 'inactive':
        return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700"><XCircle className="size-3" />Inactive</span>;
      default:
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">{status}</span>;
    }
  };

  const getCategoryBadge = (category: string) => {
    const colors: Record<string, string> = {
      'BloodTest': 'bg-red-100 text-red-700',
      'Imaging': 'bg-blue-100 text-blue-700',
      'Radiology': 'bg-purple-100 text-purple-700',
      'UrineTest': 'bg-yellow-100 text-yellow-700',
      'Ultrasound': 'bg-green-100 text-green-700',
    };
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${colors[category] || 'bg-gray-100 text-gray-700'}`}>
        <Tag className="size-3" />
        {category}
      </span>
    );
  };

  return (
    <div className="flex-1 bg-blue-100 flex flex-col overflow-hidden min-h-0">
      <div className="px-4 pt-4 pb-0 flex-shrink-0">
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
          <div>
            <h1 className="text-gray-900 mb-0 text-xl">Lab Tests</h1>
            <p className="text-gray-500 text-sm">Manage laboratory test catalog</p>
          </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="size-4" />
              Add Lab Test
            </Button>
          </DialogTrigger>
          <DialogContent className="p-0 gap-0 large-dialog">
            <DialogHeader className="px-6 pt-4 pb-3 flex-shrink-0">
              <DialogTitle>Add New Lab Test</DialogTitle>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto px-6 pb-1 patient-list-scrollable min-h-0">
              <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="testName">Test Name</Label>
                <Input
                  id="testName"
                  placeholder="e.g., Complete Blood Count, ECG, Blood Sugar"
                  value={formData.testName}
                  onChange={(e) => setFormData({ ...formData, testName: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="testCategory">Test Category</Label>
                  <select
                    id="testCategory"
                    aria-label="Test Category"
                    className="w-full px-3 py-2 border border-gray-200 rounded-md"
                    value={formData.testCategory}
                    onChange={(e) => setFormData({ ...formData, testCategory: e.target.value })}
                  >
                    {testCategoryOptions.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="charges">Charges (₹)</Label>
                  <Input
                    id="charges"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="e.g., 500"
                    value={formData.charges}
                    onChange={(e) => setFormData({ ...formData, charges: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Enter test description..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="status">Status</Label>
                  <select
                    id="status"
                    aria-label="Status"
                    className="w-full px-3 py-2 border border-gray-200 rounded-md"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as LabTest['status'] })}
                  >
                    {statusOptions.map(status => (
                      <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
                    ))}
                  </select>
                </div>
              </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 px-6 py-2 border-t bg-gray-50 flex-shrink-0">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="py-1">Cancel</Button>
              <Button onClick={handleAddSubmit} className="py-1">Add Lab Test</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Lab Tests Table */}
      <div className="overflow-y-auto overflow-x-hidden px-4 pb-4 labtests-scrollable" style={{ maxHeight: 'calc(100vh - 100px)', minHeight: 0 }}>
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TestTube className="size-5" />
              Lab Tests List ({labTests.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-blue-700">Display Test ID</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-blue-700">Test Name</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-blue-700">Category</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-blue-700">Description</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-blue-700">Charges</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-blue-700">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-blue-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {labTests.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-blue-600">
                        No lab tests found. Add a new lab test to get started.
                      </td>
                    </tr>
                  ) : (
                    labTests.map((labTest) => (
                      <tr key={labTest.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm text-blue-900 font-mono font-medium">{labTest.displayTestId}</td>
                        <td className="py-3 px-4 text-sm text-blue-900 font-medium">{labTest.testName}</td>
                        <td className="py-3 px-4 text-sm">{getCategoryBadge(labTest.testCategory)}</td>
                        <td className="py-3 px-4 text-sm text-blue-700 max-w-xs truncate" title={labTest.description}>{labTest.description || '-'}</td>
                        <td className="py-3 px-4 text-sm text-blue-700">₹{labTest.charges.toLocaleString()}</td>
                        <td className="py-3 px-4 text-sm">{getStatusBadge(labTest.status)}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(labTest)}
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="size-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onDeleteLabTest(labTest.labTestId)}
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="size-4" />
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
        <DialogContent className="p-0 gap-0 large-dialog">
          <DialogHeader className="px-6 pt-4 pb-3 flex-shrink-0">
            <DialogTitle>Edit Lab Test</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto px-6 pb-1 patient-list-scrollable min-h-0">
            <div className="space-y-4 py-4">
            {submitError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                {submitError}
              </div>
            )}
            {selectedLabTest && (
              <div>
                <Label>Display Test ID</Label>
                <Input
                  value={selectedLabTest.displayTestId}
                  disabled
                  className="bg-gray-50 text-gray-500"
                />
                <p className="text-xs text-gray-500 mt-1">Display Test ID is auto-generated and cannot be changed</p>
              </div>
            )}
            <div>
              <Label htmlFor="edit-testName">Test Name</Label>
              <Input
                id="edit-testName"
                placeholder="e.g., Complete Blood Count, ECG, Blood Sugar"
                value={formData.testName}
                onChange={(e) => setFormData({ ...formData, testName: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-testCategory">Test Category</Label>
                <select
                  id="edit-testCategory"
                  aria-label="Test Category"
                  className="w-full px-3 py-2 border border-gray-200 rounded-md"
                  value={formData.testCategory}
                  onChange={(e) => setFormData({ ...formData, testCategory: e.target.value })}
                >
                  {testCategoryOptions.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="edit-charges">Charges (₹)</Label>
                <Input
                  id="edit-charges"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="e.g., 500"
                  value={formData.charges}
                  onChange={(e) => setFormData({ ...formData, charges: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                placeholder="Enter test description..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="edit-status">Status</Label>
              <select
                id="edit-status"
                aria-label="Status"
                className="w-full px-3 py-2 border border-gray-200 rounded-md"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as LabTest['status'] })}
              >
                {statusOptions.map(status => (
                  <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
                ))}
              </select>
            </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 px-6 py-2 border-t bg-gray-50 flex-shrink-0">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="py-1">Cancel</Button>
            <Button onClick={handleEditSubmit} className="py-1">Update Lab Test</Button>
          </div>
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
}

