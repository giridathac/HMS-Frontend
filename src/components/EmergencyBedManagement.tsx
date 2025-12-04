import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Badge } from './ui/badge';
import { BedDouble, Plus, Edit, Trash2, CheckCircle2, XCircle } from 'lucide-react';
import { useEmergencyBeds } from '../hooks/useEmergencyBeds';
import { EmergencyBed } from '../types';

export function EmergencyBedManagement() {
  const { emergencyBeds, loading, error, createEmergencyBed, updateEmergencyBed, deleteEmergencyBed } = useEmergencyBeds();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedEmergencyBed, setSelectedEmergencyBed] = useState<EmergencyBed | null>(null);
  const [formData, setFormData] = useState({
    emergencyBedNo: '',
    emergencyRoomDescription: '',
    chargesPerDay: '',
    createdBy: '1',
    status: 'active' as EmergencyBed['status'],
  });

  const handleCreateEmergencyBed = async (data: {
    emergencyBedNo: string;
    emergencyRoomDescription?: string;
    chargesPerDay: number;
    createdBy: string;
    status?: 'active' | 'inactive';
  }) => {
    try {
      await createEmergencyBed(data);
    } catch (err) {
      console.error('Failed to create Emergency bed:', err);
      throw err;
    }
  };

  const handleUpdateEmergencyBed = async (id: number, data: Partial<{
    emergencyBedNo: string;
    emergencyRoomDescription?: string;
    chargesPerDay: number;
    createdBy: string;
    status?: 'active' | 'inactive';
  }>) => {
    try {
      await updateEmergencyBed({ id, ...data });
    } catch (err) {
      console.error('Failed to update Emergency bed:', err);
      throw err;
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this Emergency bed? This action cannot be undone.')) {
      try {
        await deleteEmergencyBed(id);
      } catch (err) {
        console.error('Failed to delete Emergency bed:', err);
      }
    }
  };

  const handleAddSubmit = async () => {
    if (!formData.emergencyBedNo || !formData.chargesPerDay) {
      alert('Please fill in all required fields.');
      return;
    }
    try {
      await handleCreateEmergencyBed({
        emergencyBedNo: formData.emergencyBedNo,
        emergencyRoomDescription: formData.emergencyRoomDescription || undefined,
        chargesPerDay: parseFloat(formData.chargesPerDay),
        createdBy: formData.createdBy,
        status: formData.status,
      });
      setIsAddDialogOpen(false);
      setFormData({
        emergencyBedNo: '',
        emergencyRoomDescription: '',
        chargesPerDay: '',
        createdBy: '1',
        status: 'active',
      });
    } catch (err) {
      // Error handled in parent
    }
  };

  const handleEditSubmit = async () => {
    if (!selectedEmergencyBed) return;
    if (!formData.emergencyBedNo || !formData.chargesPerDay) {
      alert('Please fill in all required fields.');
      return;
    }
    try {
      await handleUpdateEmergencyBed(selectedEmergencyBed.id, {
        emergencyBedNo: formData.emergencyBedNo,
        emergencyRoomDescription: formData.emergencyRoomDescription || undefined,
        chargesPerDay: parseFloat(formData.chargesPerDay),
        createdBy: formData.createdBy,
        status: formData.status,
      });
      setIsEditDialogOpen(false);
      setSelectedEmergencyBed(null);
      setFormData({
        emergencyBedNo: '',
        emergencyRoomDescription: '',
        chargesPerDay: '',
        createdBy: '1',
        status: 'active',
      });
    } catch (err) {
      // Error handled in parent
    }
  };

  const handleEdit = (emergencyBed: EmergencyBed) => {
    setSelectedEmergencyBed(emergencyBed);
    setFormData({
      emergencyBedNo: emergencyBed.emergencyBedNo,
      emergencyRoomDescription: emergencyBed.emergencyRoomDescription || '',
      chargesPerDay: emergencyBed.chargesPerDay.toString(),
      createdBy: emergencyBed.createdBy,
      status: emergencyBed.status,
    });
    setIsEditDialogOpen(true);
  };

  const getStatusBadge = (status: EmergencyBed['status']) => {
    switch (status) {
      case 'active':
        return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700"><CheckCircle2 className="size-3" />Active</span>;
      case 'inactive':
        return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700"><XCircle className="size-3" />Inactive</span>;
      default:
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">{status}</span>;
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center py-12 text-blue-600">Loading Emergency beds...</div>
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
    <div className="p-8 bg-blue-100 min-h-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-gray-900 mb-2">Emergency Bed Management</h1>
          <p className="text-gray-500">Manage emergency beds and their configurations</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="size-4" />
              Add Emergency Bed
            </Button>
          </DialogTrigger>
          <DialogContent className="p-0 gap-0 large-dialog">
            <DialogHeader className="px-6 pt-4 pb-3 flex-shrink-0">
              <DialogTitle>Add New Emergency Bed</DialogTitle>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto px-6 pb-1 patient-list-scrollable min-h-0">
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="emergencyBedNo">Emergency Bed No *</Label>
                <Input
                  id="emergencyBedNo"
                  placeholder="e.g., ER-001"
                  value={formData.emergencyBedNo}
                  onChange={(e) => setFormData({ ...formData, emergencyBedNo: e.target.value })}
                />
                <p className="text-xs text-gray-500 mt-1">Unique identifier for the emergency bed</p>
              </div>
              <div>
                <Label htmlFor="emergencyRoomDescription">Emergency Room Description</Label>
                <Textarea
                  id="emergencyRoomDescription"
                  placeholder="Enter emergency room description..."
                  value={formData.emergencyRoomDescription}
                  onChange={(e) => setFormData({ ...formData, emergencyRoomDescription: e.target.value })}
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="chargesPerDay">
                  Charges Per Day (₹) *
                </Label>
                <Input
                  id="chargesPerDay"
                  type="number"
                  step="0.01"
                  placeholder="e.g., 2500"
                  value={formData.chargesPerDay}
                  onChange={(e) => setFormData({ ...formData, chargesPerDay: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="createdBy">Created By (User ID) *</Label>
                  <Input
                    id="createdBy"
                    type="text"
                    placeholder="e.g., 1"
                    value={formData.createdBy}
                    onChange={(e) => setFormData({ ...formData, createdBy: e.target.value })}
                  />
                  <p className="text-xs text-gray-500 mt-1">Foreign Key to UserId</p>
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <select
                    id="status"
                    aria-label="Status"
                    className="w-full px-3 py-2 border border-gray-200 rounded-md"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as EmergencyBed['status'] })}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>
            </div>
            <div className="flex justify-end gap-2 px-6 py-2 border-t bg-gray-50 flex-shrink-0">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="py-1">Cancel</Button>
              <Button onClick={handleAddSubmit} className="py-1">Add Emergency Bed</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Emergency Beds Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BedDouble className="size-5" />
            Emergency Beds List ({emergencyBeds.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Emergency Bed ID</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Emergency Bed No</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Room Description</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Charges Per Day (₹)</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Created By</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Created At</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {emergencyBeds.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-gray-500">
                      No Emergency beds found. Add a new Emergency bed to get started.
                    </td>
                  </tr>
                ) : (
                  emergencyBeds.map((emergencyBed) => (
                    <tr key={emergencyBed.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm text-gray-900 font-mono font-medium">{emergencyBed.emergencyBedId}</td>
                      <td className="py-3 px-4 text-sm text-gray-900 font-medium">{emergencyBed.emergencyBedNo}</td>
                      <td className="py-3 px-4 text-sm text-gray-700 max-w-xs truncate" title={emergencyBed.emergencyRoomDescription}>{emergencyBed.emergencyRoomDescription || '-'}</td>
                      <td className="py-3 px-4 text-sm text-gray-900 font-semibold">
                        ₹{emergencyBed.chargesPerDay.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-700">{emergencyBed.createdBy}</td>
                      <td className="py-3 px-4 text-sm text-gray-500">{new Date(emergencyBed.createdAt).toLocaleDateString()}</td>
                      <td className="py-3 px-4 text-sm">{getStatusBadge(emergencyBed.status)}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(emergencyBed)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(emergencyBed.id)}
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

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Emergency Bed</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedEmergencyBed && (
              <div>
                <Label>Emergency Bed ID</Label>
                <Input
                  value={selectedEmergencyBed.emergencyBedId}
                  disabled
                  className="bg-gray-50 text-gray-500"
                />
                <p className="text-xs text-gray-500 mt-1">Emergency Bed ID is auto-generated and cannot be changed</p>
              </div>
            )}
            <div>
              <Label htmlFor="edit-emergencyBedNo">Emergency Bed No *</Label>
              <Input
                id="edit-emergencyBedNo"
                placeholder="e.g., ER-001"
                value={formData.emergencyBedNo}
                onChange={(e) => setFormData({ ...formData, emergencyBedNo: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-emergencyRoomDescription">Emergency Room Description</Label>
              <Textarea
                id="edit-emergencyRoomDescription"
                placeholder="Enter emergency room description..."
                value={formData.emergencyRoomDescription}
                onChange={(e) => setFormData({ ...formData, emergencyRoomDescription: e.target.value })}
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="edit-chargesPerDay">
                Charges Per Day (₹) *
              </Label>
              <Input
                id="edit-chargesPerDay"
                type="number"
                step="0.01"
                placeholder="e.g., 2500"
                value={formData.chargesPerDay}
                onChange={(e) => setFormData({ ...formData, chargesPerDay: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-createdBy">Created By (User ID) *</Label>
                <Input
                  id="edit-createdBy"
                  type="text"
                  placeholder="e.g., 1"
                  value={formData.createdBy}
                  onChange={(e) => setFormData({ ...formData, createdBy: e.target.value })}
                />
                <p className="text-xs text-gray-500 mt-1">Foreign Key to UserId</p>
              </div>
              <div>
                <Label htmlFor="edit-status">Status</Label>
                <select
                  id="edit-status"
                  aria-label="Status"
                  className="w-full px-3 py-2 border border-gray-200 rounded-md"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as EmergencyBed['status'] })}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>
          </div>
          <div className="flex justify-end gap-2 px-6 py-2 border-t bg-gray-50 flex-shrink-0">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="py-1">Cancel</Button>
            <Button onClick={handleEditSubmit} className="py-1">Update Emergency Bed</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

