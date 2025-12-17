import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Badge } from './ui/badge';
import { BedDouble, Plus, Edit, Trash2, CheckCircle2, XCircle, ArrowLeft, Clock, Search, Users } from 'lucide-react';
import { Switch } from './ui/switch';
import { useEmergencyBeds } from '../hooks/useEmergencyBeds';
import { useEmergencyBedSlots } from '../hooks/useEmergencyBedSlots';
import { EmergencyBed, EmergencyBedSlot } from '../types';

export function EmergencyBedManagement() {
  const { emergencyBeds, loading, error, createEmergencyBed, updateEmergencyBed, deleteEmergencyBed } = useEmergencyBeds();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedEmergencyBed, setSelectedEmergencyBed] = useState<EmergencyBed | null>(null);
  const [selectedEmergencyBedId, setSelectedEmergencyBedId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
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

  const handleDelete = async (emergencyBedId: number) => {
    if (confirm('Are you sure you want to delete this Emergency bed? This action cannot be undone.')) {
      try {
        await deleteEmergencyBed(emergencyBedId);
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

  // Filter emergency beds based on search term
  const filteredEmergencyBeds = emergencyBeds.filter(bed => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      bed.emergencyBedNo?.toLowerCase().includes(searchLower) ||
      bed.emergencyRoomNameNo?.toLowerCase().includes(searchLower) ||
      bed.emergencyRoomDescription?.toLowerCase().includes(searchLower) ||
      bed.emergencyBedId?.toString().includes(searchTerm) ||
      bed.createdBy?.toString().includes(searchTerm)
    );
  });

  // Calculate stats
  const totalBeds = emergencyBeds.length;
  const activeBeds = emergencyBeds.filter(bed => bed.status === 'active').length;
  const inactiveBeds = emergencyBeds.filter(bed => bed.status === 'inactive').length;

  if (loading) {
    return (
      <div className="flex-1 bg-gray-50 flex flex-col overflow-hidden min-h-0 dashboard-scrollable" style={{ maxHeight: '100vh', minHeight: 0 }}>
        <div className="overflow-y-auto overflow-x-hidden flex-1 flex flex-col min-h-0">
          <div className="px-6 pt-6 pb-0 flex-shrink-0">
            <div className="flex items-center justify-between mb-4 flex-shrink-0">
              <div>
                <h1 className="text-gray-900 mb-2 text-2xl">Emergency Bed Management</h1>
                <p className="text-gray-500 text-base">Manage emergency beds and their configurations</p>
              </div>
            </div>
          </div>
          <div className="px-6 pt-4 pb-4 flex-1">
            <div className="text-center py-12 text-gray-600">Loading Emergency beds...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 bg-gray-50 flex flex-col overflow-hidden min-h-0 dashboard-scrollable" style={{ maxHeight: '100vh', minHeight: 0 }}>
        <div className="overflow-y-auto overflow-x-hidden flex-1 flex flex-col min-h-0">
          <div className="px-6 pt-6 pb-0 flex-shrink-0">
            <div className="flex items-center justify-between mb-4 flex-shrink-0">
              <div>
                <h1 className="text-gray-900 mb-2 text-2xl">Emergency Bed Management</h1>
                <p className="text-gray-500 text-base">Manage emergency beds and their configurations</p>
              </div>
            </div>
          </div>
          <div className="px-6 pt-4 pb-4 flex-1">
            <div className="text-center py-12 text-red-500">Error: {error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gray-50 flex flex-col overflow-hidden min-h-0 dashboard-scrollable" style={{ maxHeight: '100vh', minHeight: 0 }}>
      <div className="overflow-y-auto overflow-x-hidden flex-1 flex flex-col min-h-0">
        <div className="px-6 pt-6 pb-0 flex-shrink-0">
          <div className="flex items-center justify-between mb-4 flex-shrink-0">
            <div>
              <h1 className="text-gray-900 mb-2 text-2xl">Emergency Bed Management</h1>
              <p className="text-gray-500 text-base">Manage emergency beds and their configurations</p>
            </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="size-4" />
                Add Emergency Bed
              </Button>
            </DialogTrigger>
          <DialogContent className="p-0 gap-0 large-dialog dialog-content-standard">
            <div className="dialog-scrollable-wrapper dialog-content-scrollable">
              <DialogHeader className="dialog-header-standard">
                <DialogTitle className="dialog-title-standard">Add New Emergency Bed</DialogTitle>
              </DialogHeader>
              <div className="dialog-body-content-wrapper">
                <div className="dialog-form-container space-y-4">
                  <div className="dialog-form-field">
                    <Label htmlFor="emergencyBedNo" className="dialog-label-standard">Emergency Bed No *</Label>
                    <Input
                      id="emergencyBedNo"
                      placeholder="e.g., ER-001"
                      value={formData.emergencyBedNo}
                      onChange={(e) => setFormData({ ...formData, emergencyBedNo: e.target.value })}
                      required
                      className="dialog-input-standard"
                    />
                  </div>
                  <div className="dialog-form-field">
                    <Label htmlFor="emergencyRoomNameNo" className="dialog-label-standard">Emergency Room Name/No</Label>
                    <Input
                      id="emergencyRoomNameNo"
                      placeholder="e.g., ER-Room-101"
                      value={formData.emergencyRoomNameNo}
                      onChange={(e) => setFormData({ ...formData, emergencyRoomNameNo: e.target.value })}
                      className="dialog-input-standard"
                    />
                  </div>
                  <div className="dialog-form-field">
                    <Label htmlFor="emergencyRoomDescription" className="dialog-label-standard">Emergency Room Description</Label>
                    <Textarea
                      id="emergencyRoomDescription"
                      placeholder="Enter emergency room description..."
                      value={formData.emergencyRoomDescription}
                      onChange={(e) => setFormData({ ...formData, emergencyRoomDescription: e.target.value })}
                      rows={3}
                      className="dialog-textarea-standard"
                    />
                  </div>
                  <div className="dialog-form-field">
                    <Label htmlFor="chargesPerDay" className="dialog-label-standard">
                      Charges Per Day (₹) *
                    </Label>
                    <Input
                      id="chargesPerDay"
                      type="number"
                      step="0.01"
                      placeholder="e.g., 2500"
                      value={formData.chargesPerDay}
                      onChange={(e) => setFormData({ ...formData, chargesPerDay: e.target.value })}
                      className="dialog-input-standard"
                    />
                  </div>
                  <div className="dialog-form-field">
                    <Label htmlFor="createdBy" className="dialog-label-standard">Created By (User ID) *</Label>
                    <Input
                      id="createdBy"
                      type="text"
                      placeholder="e.g., 1"
                      value={formData.createdBy}
                      onChange={(e) => setFormData({ ...formData, createdBy: e.target.value })}
                      className="dialog-input-standard"
                    />
                    <p className="text-xs text-gray-500 mt-1">Foreign Key to UserId</p>
                  </div>
                </div>
              </div>
              <div className="dialog-footer-standard">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="dialog-footer-button">Cancel</Button>
                <Button onClick={handleAddSubmit} className="dialog-footer-button">Add Emergency Bed</Button>
              </div>
            </div>
          </DialogContent>
          </Dialog>
            </div>
          </div>
        <div className="px-6 pt-4 pb-4 flex-1">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-white border border-gray-200 shadow-sm rounded-lg">
              <CardContent className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="bg-gray-500 p-4 rounded-lg shadow-sm flex items-center justify-center">
                    <BedDouble className="size-7 text-white" strokeWidth={2} />
                  </div>
                  <span className="text-sm font-medium text-gray-500">Total</span>
                </div>
                <h3 className="text-4xl font-bold text-gray-900 mb-2">{totalBeds}</h3>
                <p className="text-base text-gray-500">Total Beds</p>
              </CardContent>
            </Card>
            <Card className="bg-white border border-gray-200 shadow-sm rounded-lg">
              <CardContent className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="bg-green-500 p-4 rounded-lg shadow-sm flex items-center justify-center">
                    <CheckCircle2 className="size-7 text-white" strokeWidth={2} />
                  </div>
                  <span className="text-sm font-medium text-gray-500">Active</span>
                </div>
                <h3 className="text-4xl font-bold text-gray-900 mb-2">{activeBeds}</h3>
                <p className="text-base text-gray-500">Active Beds</p>
              </CardContent>
            </Card>
            <Card className="bg-white border border-gray-200 shadow-sm rounded-lg">
              <CardContent className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="bg-gray-500 p-4 rounded-lg shadow-sm flex items-center justify-center">
                    <XCircle className="size-7 text-white" strokeWidth={2} />
                  </div>
                  <span className="text-sm font-medium text-gray-500">Inactive</span>
                </div>
                <h3 className="text-4xl font-bold text-gray-900 mb-2">{inactiveBeds}</h3>
                <p className="text-base text-gray-500">Inactive Beds</p>
              </CardContent>
            </Card>
          </div>

          {/* Search */}
          <Card className="mb-6 bg-white">
            <CardContent className="p-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                <Input
                  placeholder="Search by bed no, room no, room description, bed ID, or created by..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-50"
                />
              </div>
            </CardContent>
          </Card>

          {/* Emergency Beds Table */}
          <Card className="bg-white border border-gray-200 shadow-sm rounded-lg mb-4">
            <CardContent className="p-0">
              <div className="overflow-x-auto border border-gray-200 rounded">
                <table className="w-full">
                  <thead className="sticky top-0 bg-white z-10 shadow-sm">
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-4 px-6 text-gray-700 bg-white whitespace-nowrap">Bed ID</th>
                      <th className="text-left py-4 px-6 text-gray-700 bg-white whitespace-nowrap">Bed No</th>
                      <th className="text-left py-4 px-6 text-gray-700 bg-white whitespace-nowrap">Room No</th>
                      <th className="text-left py-4 px-6 text-gray-700 bg-white whitespace-nowrap">Room Description</th>
                      <th className="text-left py-4 px-6 text-gray-700 bg-white whitespace-nowrap">Status</th>
                      <th className="text-left py-4 px-6 text-gray-700 bg-white whitespace-nowrap">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEmergencyBeds.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="text-center py-8 text-gray-500">
                          {searchTerm ? 'No emergency beds found matching your search.' : 'No Emergency beds found. Add a new Emergency bed to get started.'}
                        </td>
                      </tr>
                    ) : (
                      filteredEmergencyBeds.map((emergencyBed) => (
                        <tr key={emergencyBed.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-4 px-6 text-gray-900 font-mono font-medium whitespace-nowrap">{emergencyBed.emergencyBedId}</td>
                          <td className="py-4 px-6 text-gray-600 whitespace-nowrap">
                            <a
                              href={`#emergencybeds?emergencyBedId=${emergencyBed.id}`}
                              onClick={(e) => {
                                e.preventDefault();
                                setSelectedEmergencyBedId(emergencyBed.id);
                              }}
                              className="text-gray-600 hover:text-gray-800 hover:underline cursor-pointer"
                            >
                              {emergencyBed.emergencyBedNo}
                            </a>
                          </td>
                          <td className="py-4 px-6 text-gray-600 whitespace-nowrap">{emergencyBed.emergencyRoomNameNo || '-'}</td>
                          <td className="py-4 px-6 text-gray-600 whitespace-nowrap">{emergencyBed.emergencyRoomDescription || '-'}</td>
                          <td className="py-4 px-6 whitespace-nowrap">{getStatusBadge(emergencyBed.status)}</td>
                          <td className="py-4 px-6 whitespace-nowrap">
                            <div className="dashboard-actions-container">
                              <Button
                                size="sm"
                                onClick={() => handleEdit(emergencyBed)}
                                className="dashboard-manage-button"
                                title="Manage Emergency Bed"
                              >
                                Manage
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                  )}
                  <tr>
                    <td className="py-1 px-4" colSpan={8}></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="p-0 gap-0 large-dialog dialog-content-standard max-w-2xl">
          <div className="dialog-scrollable-wrapper dialog-content-scrollable">
            <DialogHeader className="dialog-header-standard">
              <DialogTitle className="dialog-title-standard">Edit Emergency Bed</DialogTitle>
            </DialogHeader>
            <div className="dialog-body-content-wrapper">
              <div className="dialog-form-container space-y-4">
                {selectedEmergencyBed && (
                  <div className="dialog-form-field">
                    <Label className="dialog-label-standard">Emergency Bed ID</Label>
                    <Input
                      value={selectedEmergencyBed.emergencyBedId}
                      disabled
                      className="dialog-input-standard dialog-input-disabled"
                    />
                    <p className="text-xs text-gray-500 mt-1">Emergency Bed ID is auto-generated and cannot be changed</p>
                  </div>
                )}
                <div className="dialog-form-field">
                  <Label htmlFor="edit-emergencyBedNo" className="dialog-label-standard">Emergency Bed No *</Label>
                  <Input
                    id="edit-emergencyBedNo"
                    placeholder="e.g., ER-001"
                    value={formData.emergencyBedNo}
                    onChange={(e) => setFormData({ ...formData, emergencyBedNo: e.target.value })}
                    required
                    className="dialog-input-standard"
                  />
                </div>
                <div className="dialog-form-field">
                  <Label htmlFor="edit-emergencyRoomNameNo" className="dialog-label-standard">Emergency Room Name/No</Label>
                  <Input
                    id="edit-emergencyRoomNameNo"
                    placeholder="e.g., ER-Room-101"
                    value={formData.emergencyRoomNameNo}
                    onChange={(e) => setFormData({ ...formData, emergencyRoomNameNo: e.target.value })}
                    className="dialog-input-standard"
                  />
                </div>
                <div className="dialog-form-field">
                  <Label htmlFor="edit-emergencyRoomDescription" className="dialog-label-standard">Emergency Room Description</Label>
                  <Textarea
                    id="edit-emergencyRoomDescription"
                    placeholder="Enter emergency room description..."
                    value={formData.emergencyRoomDescription}
                    onChange={(e) => setFormData({ ...formData, emergencyRoomDescription: e.target.value })}
                    rows={3}
                    className="dialog-textarea-standard"
                  />
                </div>
                <div className="dialog-form-field">
                  <Label htmlFor="edit-chargesPerDay" className="dialog-label-standard">
                    Charges Per Day (₹) *
                  </Label>
                  <Input
                    id="edit-chargesPerDay"
                    type="number"
                    step="0.01"
                    placeholder="e.g., 2500"
                    value={formData.chargesPerDay}
                    onChange={(e) => setFormData({ ...formData, chargesPerDay: e.target.value })}
                    className="dialog-input-standard"
                  />
                </div>
                <div className="dialog-form-field">
                  <Label htmlFor="edit-createdBy" className="dialog-label-standard">Created By (User ID) *</Label>
                  <Input
                    id="edit-createdBy"
                    type="text"
                    placeholder="e.g., 1"
                    value={formData.createdBy}
                    onChange={(e) => setFormData({ ...formData, createdBy: e.target.value })}
                    className="dialog-input-standard"
                  />
                  <p className="text-xs text-gray-500 mt-1">Foreign Key to UserId</p>
                </div>
                <div className="dialog-form-field">
                  <div className="flex items-center gap-3">
                    <Label htmlFor="edit-status" className="dialog-label-standard">Status</Label>
                    <div className="flex-shrink-0 relative" style={{ zIndex: 1 }}>
                      <Switch
                        id="edit-status"
                        checked={formData.status === 'active'}
                        onCheckedChange={(checked) => setFormData({ ...formData, status: checked ? 'active' : 'inactive' })}
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
              <Button onClick={handleEditSubmit} className="dialog-footer-button">Update Emergency Bed</Button>
            </div>
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
            <div className="text-center py-12 text-gray-600">Loading emergency bed slots...</div>
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
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Room Name/No</th>
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
                          <td colSpan={8} className="text-center py-8 text-gray-500">
                            No emergency bed slots found. Add a new slot to get started.
                          </td>
                        </tr>
                      ) : (
                        emergencyBedSlots.map((slot) => (
                          <tr key={slot.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 px-4 text-sm text-gray-900 font-mono font-medium whitespace-nowrap">{slot.emergencyBedSlotId}</td>
                            <td className="py-3 px-4 text-sm text-gray-900 font-mono font-medium whitespace-nowrap">{slot.emergencyBedId}</td>
                            <td className="py-3 px-4 text-sm text-gray-700">{emergencyBed?.emergencyRoomNameNo || '-'}</td>
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

