import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Badge } from './ui/badge';
import { BedDouble, Plus, Edit, Trash2, CheckCircle2, XCircle, ArrowLeft, Clock } from 'lucide-react';
import { useEmergencyBeds } from '../hooks/useEmergencyBeds';
import { useEmergencyBedSlots } from '../hooks/useEmergencyBedSlots';
import { EmergencyBed, EmergencyBedSlot } from '../types';

export function EmergencyBedManagement() {
  const { emergencyBeds, loading, error, createEmergencyBed, updateEmergencyBed, deleteEmergencyBed } = useEmergencyBeds();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedEmergencyBed, setSelectedEmergencyBed] = useState<EmergencyBed | null>(null);
  const [selectedEmergencyBedId, setSelectedEmergencyBedId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    emergencyBedNo: '',
    emergencyRoomNameNo: '',
    emergencyRoomDescription: '',
    chargesPerDay: '',
    createdBy: '1',
    status: 'active' as EmergencyBed['status'],
  });

  const handleCreateEmergencyBed = async (data: {
    emergencyBedNo?: string;
    emergencyRoomNameNo?: string;
    emergencyRoomDescription?: string;
    chargesPerDay?: number;
    createdBy?: number;
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
    emergencyBedNo?: string;
    emergencyRoomNameNo?: string;
    emergencyRoomDescription?: string;
    chargesPerDay?: number;
    createdBy?: number;
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
        emergencyBedNo: formData.emergencyBedNo || undefined,
        emergencyRoomNameNo: formData.emergencyRoomNameNo || undefined,
        emergencyRoomDescription: formData.emergencyRoomDescription || undefined,
        chargesPerDay: parseFloat(formData.chargesPerDay),
        createdBy: formData.createdBy ? parseInt(formData.createdBy, 10) : undefined,
        status: formData.status,
      });
      setIsAddDialogOpen(false);
      setFormData({
        emergencyBedNo: '',
        emergencyRoomNameNo: '',
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
        emergencyBedNo: formData.emergencyBedNo || undefined,
        emergencyRoomNameNo: formData.emergencyRoomNameNo || undefined,
        emergencyRoomDescription: formData.emergencyRoomDescription || undefined,
        chargesPerDay: parseFloat(formData.chargesPerDay),
        createdBy: formData.createdBy ? parseInt(formData.createdBy, 10) : undefined,
        status: formData.status,
      });
      setIsEditDialogOpen(false);
      setSelectedEmergencyBed(null);
      setFormData({
        emergencyBedNo: '',
        emergencyRoomNameNo: '',
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
      emergencyBedNo: emergencyBed.emergencyBedNo || '',
      emergencyRoomNameNo: emergencyBed.emergencyRoomNameNo || '',
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
      <div className="px-4 pt-4 pb-0 bg-blue-100 h-full flex flex-col overflow-hidden">
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
          <div>
            <h1 className="text-gray-900 mb-0 text-xl">Emergency Bed Management</h1>
            <p className="text-gray-500 text-sm">Manage emergency beds and their configurations</p>
          </div>
        </div>
        <div className="p-8">
          <div className="text-center py-12 text-blue-600">Loading Emergency beds...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 pt-4 pb-0 bg-blue-100 h-full flex flex-col overflow-hidden">
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
          <div>
            <h1 className="text-gray-900 mb-0 text-xl">Emergency Bed Management</h1>
            <p className="text-gray-500 text-sm">Manage emergency beds and their configurations</p>
          </div>
        </div>
        <div className="p-8">
          <div className="text-center py-12 text-red-500">Error: {error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 pt-4 pb-4 bg-blue-100 h-screen flex flex-col overflow-hidden">
      <div className="flex-shrink-0">
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
          <div>
            <h1 className="text-gray-900 mb-0 text-xl">Emergency Bed Management</h1>
            <p className="text-gray-500 text-sm">Manage emergency beds and their configurations</p>
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
                  required
                />
              </div>
              <div>
                <Label htmlFor="emergencyRoomNameNo">Emergency Room Name/No</Label>
                <Input
                  id="emergencyRoomNameNo"
                  placeholder="e.g., ER-Room-101"
                  value={formData.emergencyRoomNameNo}
                  onChange={(e) => setFormData({ ...formData, emergencyRoomNameNo: e.target.value })}
                />
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
      </div>

      <div className="flex-1 flex flex-col overflow-hidden min-h-0">
        {/* Emergency Beds Table */}
        <Card className="flex-1 flex flex-col overflow-hidden min-h-0 mb-4">
          <CardContent className="p-0 flex-1 overflow-hidden flex flex-col min-h-0">
            <div className="overflow-x-auto overflow-y-scroll border border-gray-200 rounded flex-1 min-h-0 emergency-beds-scrollable doctors-scrollable" style={{ maxHeight: 'calc(100vh - 160px)' }}>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700" colSpan={9}>
                      <div className="flex items-center gap-2">
                        <BedDouble className="size-5" />
                        <span>Emergency Beds List ({emergencyBeds.length})</span>
                      </div>
                    </th>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-bold text-gray-700">Emergency Bed ID</th>
                    <th className="text-left py-3 px-4 text-sm font-bold text-gray-700">Emergency Bed No</th>
                    <th className="text-left py-3 px-4 text-sm font-bold text-gray-700">Room Name/No</th>
                    <th className="text-left py-3 px-4 text-sm font-bold text-gray-700">Room Description</th>
                    <th className="text-left py-3 px-4 text-sm font-bold text-gray-700">Charges Per Day (₹)</th>
                    <th className="text-left py-3 px-4 text-sm font-bold text-gray-700">Created By</th>
                    <th className="text-left py-3 px-4 text-sm font-bold text-gray-700">Created At</th>
                    <th className="text-left py-3 px-4 text-sm font-bold text-gray-700">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-bold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {emergencyBeds.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-center py-8 text-gray-500">
                        No Emergency beds found. Add a new Emergency bed to get started.
                      </td>
                    </tr>
                  ) : (
                    emergencyBeds.map((emergencyBed) => (
                      <tr key={emergencyBed.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm text-gray-900 font-mono font-medium">{emergencyBed.emergencyBedId}</td>
                        <td className="py-3 px-4 text-sm font-medium">
                          <a
                            href={`#emergencybeds?emergencyBedId=${emergencyBed.id}`}
                            onClick={(e) => {
                              e.preventDefault();
                              setSelectedEmergencyBedId(emergencyBed.id);
                            }}
                            className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                          >
                            {emergencyBed.emergencyBedNo}
                          </a>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-700">{emergencyBed.emergencyRoomNameNo || '-'}</td>
                        <td className="py-3 px-4 text-sm text-gray-700 max-w-xs break-words whitespace-normal">{emergencyBed.emergencyRoomDescription || '-'}</td>
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
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="p-0 gap-0 large-dialog max-w-2xl">
          <DialogHeader className="px-6 pt-4 pb-3 flex-shrink-0">
            <DialogTitle>Edit Emergency Bed</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto px-6 pb-1 patient-list-scrollable min-h-0">
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
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-emergencyRoomNameNo">Emergency Room Name/No</Label>
              <Input
                id="edit-emergencyRoomNameNo"
                placeholder="e.g., ER-Room-101"
                value={formData.emergencyRoomNameNo}
                onChange={(e) => setFormData({ ...formData, emergencyRoomNameNo: e.target.value })}
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

      {/* Emergency Bed Slots Dialog */}
      {selectedEmergencyBedId !== null && (
        <EmergencyBedSlotsManagement 
          emergencyBedId={selectedEmergencyBedId}
          emergencyBed={emergencyBeds.find(b => b.id === selectedEmergencyBedId) || null}
          onClose={() => setSelectedEmergencyBedId(null)} 
        />
      )}
    </div>
  );
}

function EmergencyBedSlotsManagement({ emergencyBedId, emergencyBed, onClose }: { emergencyBedId: number; emergencyBed: EmergencyBed | null; onClose: () => void }) {
  const { emergencyBedSlots, loading, error, createEmergencyBedSlot, updateEmergencyBedSlot, deleteEmergencyBedSlot } = useEmergencyBedSlots(emergencyBedId);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<EmergencyBedSlot | null>(null);
  const [formData, setFormData] = useState({
    eBedSlotNo: '',
    eSlotStartTime: '',
    eSlotEndTime: '',
    status: 'Active' as EmergencyBedSlot['status'],
  });

  const handleCreateSlot = async (data: {
    emergencyBedId: number;
    eSlotStartTime: string;
    eSlotEndTime: string;
    status?: 'Active' | 'Inactive';
  }) => {
    try {
      await createEmergencyBedSlot(data);
    } catch (err) {
      console.error('Failed to create emergency bed slot:', err);
      throw err;
    }
  };

  const handleUpdateSlot = async (id: number, data: Partial<{
    eSlotStartTime: string;
    eSlotEndTime: string;
    status?: 'Active' | 'Inactive';
  }>) => {
    try {
      await updateEmergencyBedSlot({ id, ...data });
    } catch (err) {
      console.error('Failed to update emergency bed slot:', err);
      throw err;
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this emergency bed slot? This action cannot be undone.')) {
      try {
        await deleteEmergencyBedSlot(id);
      } catch (err) {
        console.error('Failed to delete emergency bed slot:', err);
      }
    }
  };

  const handleAddSubmit = async () => {
    if (!formData.eSlotStartTime || !formData.eSlotEndTime) {
      alert('Please fill in all required fields.');
      return;
    }
    try {
      await handleCreateSlot({
        emergencyBedId: emergencyBedId,
        eSlotStartTime: formData.eSlotStartTime,
        eSlotEndTime: formData.eSlotEndTime,
        status: formData.status,
      });
      setIsAddDialogOpen(false);
      setFormData({
        eBedSlotNo: '',
        eSlotStartTime: '',
        eSlotEndTime: '',
        status: 'Active',
      });
    } catch (err) {
      // Error handled in parent
    }
  };

  const handleEditSubmit = async () => {
    if (!selectedSlot) return;
    if (!formData.eSlotStartTime || !formData.eSlotEndTime) {
      alert('Please fill in all required fields.');
      return;
    }
    try {
      await handleUpdateSlot(selectedSlot.id, {
        eSlotStartTime: formData.eSlotStartTime,
        eSlotEndTime: formData.eSlotEndTime,
        status: formData.status,
      });
      setIsEditDialogOpen(false);
      setSelectedSlot(null);
      setFormData({
        eBedSlotNo: '',
        eSlotStartTime: '',
        eSlotEndTime: '',
        status: 'Active',
      });
    } catch (err) {
      // Error handled in parent
    }
  };

  const handleEdit = (slot: EmergencyBedSlot) => {
    setSelectedSlot(slot);
    setFormData({
      eBedSlotNo: slot.eBedSlotNo,
      eSlotStartTime: slot.eSlotStartTime,
      eSlotEndTime: slot.eSlotEndTime,
      status: slot.status,
    });
    setIsEditDialogOpen(true);
  };

  const getStatusBadge = (status: EmergencyBedSlot['status']) => {
    switch (status) {
      case 'Active':
        return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700"><CheckCircle2 className="size-3" />Active</span>;
      case 'Inactive':
        return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700"><XCircle className="size-3" />Inactive</span>;
      default:
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">{status}</span>;
    }
  };

  if (loading) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="p-0 gap-0 large-dialog max-w-4xl">
          <DialogHeader className="px-6 pt-4 pb-3 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
                  <ArrowLeft className="size-4" />
                </Button>
                <DialogTitle>
                  {emergencyBed ? `Emergency Bed Slots for ${emergencyBed.emergencyBedNo}` : `Emergency Bed Slots`}
                </DialogTitle>
              </div>
              <Button className="gap-2" onClick={(e) => {
                e.stopPropagation();
                setIsAddDialogOpen(true);
              }}>
                <Plus className="size-4" />
                Add Slot
              </Button>
            </div>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto px-6 pb-1 patient-list-scrollable min-h-0">
            <div className="text-center py-12 text-blue-600">Loading emergency bed slots...</div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="p-0 gap-0 large-dialog max-w-4xl">
        <DialogHeader className="px-6 pt-4 pb-3 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
                <ArrowLeft className="size-4" />
              </Button>
              <DialogTitle>
                {emergencyBed ? `Emergency Bed Slots for ${emergencyBed.emergencyBedNo}` : `Emergency Bed Slots`}
              </DialogTitle>
            </div>
            <Button className="gap-2" onClick={(e) => {
              e.stopPropagation();
              setIsAddDialogOpen(true);
            }}>
              <Plus className="size-4" />
              Add Slot
            </Button>
          </div>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto px-6 pb-1 patient-list-scrollable min-h-0">
          <div className="space-y-4 py-4">
          {/* Show table only if no error and not loading */}
          {!error && !loading && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="size-5" />
                  Emergency Bed Slots List ({emergencyBedSlots.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Emergency Bed Slot ID</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Emergency Bed ID</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">EBed Slot No</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">ESlot Start Time</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">ESlot End Time</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Status</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {emergencyBedSlots.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="text-center py-8 text-gray-500">
                            No emergency bed slots found. Add a new slot to get started.
                          </td>
                        </tr>
                      ) : (
                        emergencyBedSlots.map((slot) => (
                          <tr key={slot.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 px-4 text-sm text-gray-900 font-mono font-medium whitespace-nowrap">{slot.emergencyBedSlotId}</td>
                            <td className="py-3 px-4 text-sm text-gray-900 font-mono font-medium whitespace-nowrap">{slot.emergencyBedId}</td>
                            <td className="py-3 px-4 text-sm text-gray-900 font-medium">{slot.eBedSlotNo}</td>
                            <td className="py-3 px-4 text-sm text-gray-700">{slot.eSlotStartTime}</td>
                            <td className="py-3 px-4 text-sm text-gray-700">{slot.eSlotEndTime}</td>
                            <td className="py-3 px-4 text-sm">{getStatusBadge(slot.status)}</td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEdit(slot)}
                                  className="h-8 w-8 p-0"
                                >
                                  <Edit className="size-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDelete(slot.id)}
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
          )}
          </div>
        </div>

        {/* Add Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="p-0 gap-0 large-dialog max-w-2xl">
            <DialogHeader className="px-6 pt-4 pb-3 flex-shrink-0">
              <DialogTitle>Add New Emergency Bed Slot</DialogTitle>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto px-6 pb-1 patient-list-scrollable min-h-0">
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="eSlotStartTime" className="flex items-center gap-2">
                      <Clock className="size-4" />
                      ESlot Start Time *
                    </Label>
                    <Input
                      id="eSlotStartTime"
                      placeholder="e.g., 9:00 AM"
                      value={formData.eSlotStartTime}
                      onChange={(e) => setFormData({ ...formData, eSlotStartTime: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="eSlotEndTime" className="flex items-center gap-2">
                      <Clock className="size-4" />
                      ESlot End Time *
                    </Label>
                    <Input
                      id="eSlotEndTime"
                      placeholder="e.g., 10:00 AM"
                      value={formData.eSlotEndTime}
                      onChange={(e) => setFormData({ ...formData, eSlotEndTime: e.target.value })}
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
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as EmergencyBedSlot['status'] })}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 px-6 py-2 border-t bg-gray-50 flex-shrink-0">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="py-1">Cancel</Button>
              <Button onClick={handleAddSubmit} className="py-1">Add Slot</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="p-0 gap-0 large-dialog max-w-2xl">
            <DialogHeader className="px-6 pt-4 pb-3 flex-shrink-0">
              <DialogTitle>Edit Emergency Bed Slot</DialogTitle>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto px-6 pb-1 patient-list-scrollable min-h-0">
              <div className="space-y-4 py-4">
                {selectedSlot && (
                  <div>
                    <Label>Emergency Bed Slot ID</Label>
                    <Input
                      value={selectedSlot.emergencyBedSlotId}
                      disabled
                      className="bg-gray-50 text-gray-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Emergency Bed Slot ID is auto-generated and cannot be changed</p>
                  </div>
                )}
                {selectedSlot && (
                  <div>
                    <Label htmlFor="edit-eBedSlotNo">EBed Slot No</Label>
                    <Input
                      id="edit-eBedSlotNo"
                      value={selectedSlot.eBedSlotNo}
                      disabled
                      className="bg-gray-50 text-gray-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">EBed Slot No cannot be modified</p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-eSlotStartTime" className="flex items-center gap-2">
                      <Clock className="size-4" />
                      ESlot Start Time *
                    </Label>
                    <Input
                      id="edit-eSlotStartTime"
                      placeholder="e.g., 9:00 AM"
                      value={formData.eSlotStartTime}
                      onChange={(e) => setFormData({ ...formData, eSlotStartTime: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-eSlotEndTime" className="flex items-center gap-2">
                      <Clock className="size-4" />
                      ESlot End Time *
                    </Label>
                    <Input
                      id="edit-eSlotEndTime"
                      placeholder="e.g., 10:00 AM"
                      value={formData.eSlotEndTime}
                      onChange={(e) => setFormData({ ...formData, eSlotEndTime: e.target.value })}
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
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as EmergencyBedSlot['status'] })}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 px-6 py-2 border-t bg-gray-50 flex-shrink-0">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="py-1">Cancel</Button>
              <Button onClick={handleEditSubmit} className="py-1">Update Slot</Button>
            </div>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
}

