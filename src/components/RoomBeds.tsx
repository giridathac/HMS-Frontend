// RoomBeds Management Component - Separated UI from logic
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Plus, Trash2, Edit, BedDouble, Home, Tag, CheckCircle2, XCircle, Wrench, User } from 'lucide-react';
import { useRoomBeds } from '../hooks/useRoomBeds';
import { RoomBed } from '../types';

interface RoomBedsViewProps {
  roomBeds: RoomBed[];
  onCreateRoomBed: (data: {
    bedNo: string;
    roomNo: string;
    roomCategory: string;
    roomType: string;
    numberOfBeds: number;
    chargesPerDay: number;
    status?: 'active' | 'inactive' | 'occupied' | 'maintenance';
    createdBy: string;
  }) => Promise<void>;
  onUpdateRoomBed: (id: number, data: Partial<{
    bedNo: string;
    roomNo: string;
    roomCategory: string;
    roomType: string;
    numberOfBeds: number;
    chargesPerDay: number;
    status?: 'active' | 'inactive' | 'occupied' | 'maintenance';
  }>) => Promise<void>;
  onDeleteRoomBed: (id: number) => Promise<void>;
}

const roomCategoryOptions = ['AC', 'Non AC'];
const roomTypeOptions = ['Special', 'Special Shared', 'Regular'];
const statusOptions: RoomBed['status'][] = ['active', 'inactive', 'occupied', 'maintenance'];

export function RoomBeds() {
  const { roomBeds, loading, error, createRoomBed, updateRoomBed, deleteRoomBed } = useRoomBeds();

  const handleCreateRoomBed = async (data: {
    bedNo: string;
    roomNo: string;
    roomCategory: string;
    roomType: string;
    numberOfBeds: number;
    chargesPerDay: number;
    status?: 'active' | 'inactive' | 'occupied' | 'maintenance';
    createdBy: string;
  }) => {
    try {
      await createRoomBed(data);
    } catch (err) {
      console.error('Failed to create room bed:', err);
      throw err;
    }
  };

  const handleUpdateRoomBed = async (id: number, data: Partial<{
    bedNo: string;
    roomNo: string;
    roomCategory: string;
    roomType: string;
    numberOfBeds: number;
    chargesPerDay: number;
    status?: 'active' | 'inactive' | 'occupied' | 'maintenance';
  }>) => {
    try {
      await updateRoomBed({ id, ...data });
    } catch (err) {
      console.error('Failed to update room bed:', err);
      throw err;
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this room bed? This action cannot be undone.')) {
      try {
        await deleteRoomBed(id);
      } catch (err) {
        console.error('Failed to delete room bed:', err);
      }
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center py-12 text-gray-500">Loading room beds...</div>
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
    <RoomBedsView
      roomBeds={roomBeds}
      onCreateRoomBed={handleCreateRoomBed}
      onUpdateRoomBed={handleUpdateRoomBed}
      onDeleteRoomBed={handleDelete}
    />
  );
}

function RoomBedsView({
  roomBeds,
  onCreateRoomBed,
  onUpdateRoomBed,
  onDeleteRoomBed,
}: RoomBedsViewProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedRoomBed, setSelectedRoomBed] = useState<RoomBed | null>(null);
  const [formData, setFormData] = useState({
    bedNo: '',
    roomNo: '',
    roomCategory: 'AC',
    roomType: 'Regular',
    numberOfBeds: 1,
    chargesPerDay: 0,
    status: 'active' as RoomBed['status'],
    createdBy: 'Admin',
  });

  const handleAddSubmit = async () => {
    if (!formData.bedNo || !formData.roomNo || formData.numberOfBeds <= 0 || formData.chargesPerDay < 0) {
      alert('Please fill in all required fields with valid values.');
      return;
    }
    try {
      await onCreateRoomBed({
        bedNo: formData.bedNo,
        roomNo: formData.roomNo,
        roomCategory: formData.roomCategory,
        roomType: formData.roomType,
        numberOfBeds: formData.numberOfBeds,
        chargesPerDay: formData.chargesPerDay,
        status: formData.status,
        createdBy: formData.createdBy,
      });
      setIsAddDialogOpen(false);
      setFormData({
        bedNo: '',
        roomNo: '',
        roomCategory: 'AC',
        roomType: 'Regular',
        numberOfBeds: 1,
        chargesPerDay: 0,
        status: 'active',
        createdBy: 'Admin',
      });
    } catch (err) {
      // Error handled in parent
    }
  };

  const handleEditSubmit = async () => {
    if (!selectedRoomBed) return;
    if (!formData.bedNo || !formData.roomNo || formData.numberOfBeds <= 0 || formData.chargesPerDay < 0) {
      alert('Please fill in all required fields with valid values.');
      return;
    }
    try {
      await onUpdateRoomBed(selectedRoomBed.id, {
        bedNo: formData.bedNo,
        roomNo: formData.roomNo,
        roomCategory: formData.roomCategory,
        roomType: formData.roomType,
        numberOfBeds: formData.numberOfBeds,
        chargesPerDay: formData.chargesPerDay,
        status: formData.status,
      });
      setIsEditDialogOpen(false);
      setSelectedRoomBed(null);
      setFormData({
        bedNo: '',
        roomNo: '',
        roomCategory: 'AC',
        roomType: 'Regular',
        numberOfBeds: 1,
        chargesPerDay: 0,
        status: 'active',
        createdBy: 'Admin',
      });
    } catch (err) {
      // Error handled in parent
    }
  };

  const handleEdit = (roomBed: RoomBed) => {
    setSelectedRoomBed(roomBed);
    setFormData({
      bedNo: roomBed.bedNo,
      roomNo: roomBed.roomNo,
      roomCategory: roomBed.roomCategory,
      roomType: roomBed.roomType,
      numberOfBeds: roomBed.numberOfBeds,
      chargesPerDay: roomBed.chargesPerDay,
      status: roomBed.status,
      createdBy: roomBed.createdBy,
    });
    setIsEditDialogOpen(true);
  };

  const getStatusBadge = (status: RoomBed['status']) => {
    switch (status) {
      case 'active':
        return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700"><CheckCircle2 className="size-3" />Active</span>;
      case 'occupied':
        return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700"><BedDouble className="size-3" />Occupied</span>;
      case 'maintenance':
        return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700"><Wrench className="size-3" />Maintenance</span>;
      case 'inactive':
        return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700"><XCircle className="size-3" />Inactive</span>;
      default:
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">{status}</span>;
    }
  };

  return (
    <div className="p-8 bg-blue-100 min-h-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-blue-900 mb-2">Room & Beds Management</h1>
          <p className="text-blue-600">Manage hospital rooms and beds</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="size-4" />
              Add Room Bed
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Room Bed</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="bedNo">Bed No</Label>
                  <Input
                    id="bedNo"
                    placeholder="e.g., B101"
                    value={formData.bedNo}
                    onChange={(e) => setFormData({ ...formData, bedNo: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="roomNo">Room No</Label>
                  <Input
                    id="roomNo"
                    placeholder="e.g., R101"
                    value={formData.roomNo}
                    onChange={(e) => setFormData({ ...formData, roomNo: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="roomCategory">Room Category</Label>
                  <select
                    id="roomCategory"
                    aria-label="Room Category"
                    className="w-full px-3 py-2 border border-gray-200 rounded-md"
                    value={formData.roomCategory}
                    onChange={(e) => setFormData({ ...formData, roomCategory: e.target.value })}
                  >
                    {roomCategoryOptions.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="roomType">Room Type</Label>
                  <select
                    id="roomType"
                    aria-label="Room Type"
                    className="w-full px-3 py-2 border border-gray-200 rounded-md"
                    value={formData.roomType}
                    onChange={(e) => setFormData({ ...formData, roomType: e.target.value })}
                  >
                    {roomTypeOptions.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="numberOfBeds">Number of Beds</Label>
                  <Input
                    id="numberOfBeds"
                    type="number"
                    min="1"
                    placeholder="e.g., 1"
                    value={formData.numberOfBeds}
                    onChange={(e) => setFormData({ ...formData, numberOfBeds: parseInt(e.target.value) || 1 })}
                  />
                </div>
                <div>
                  <Label htmlFor="chargesPerDay">Charges Per Day (₹)</Label>
                  <Input
                    id="chargesPerDay"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="e.g., 1500"
                    value={formData.chargesPerDay}
                    onChange={(e) => setFormData({ ...formData, chargesPerDay: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="status">Status</Label>
                  <select
                    id="status"
                    aria-label="Status"
                    className="w-full px-3 py-2 border border-gray-200 rounded-md"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as RoomBed['status'] })}
                  >
                    {statusOptions.map(status => (
                      <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="createdBy">Created By</Label>
                  <Input
                    id="createdBy"
                    placeholder="e.g., Admin"
                    value={formData.createdBy}
                    onChange={(e) => setFormData({ ...formData, createdBy: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleAddSubmit}>Add Room Bed</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Room Beds Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BedDouble className="size-5" />
            Room Beds List ({roomBeds.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Bed No</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Room No</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Category</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Type</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">No. of Beds</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Charges/Day</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Created By</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Created At</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {roomBeds.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="text-center py-8 text-gray-500">
                      No room beds found. Add a new room bed to get started.
                    </td>
                  </tr>
                ) : (
                  roomBeds.map((roomBed) => (
                    <tr key={roomBed.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm text-gray-900 font-medium">{roomBed.bedNo}</td>
                      <td className="py-3 px-4 text-sm text-gray-700">{roomBed.roomNo}</td>
                      <td className="py-3 px-4 text-sm text-gray-700">{roomBed.roomCategory}</td>
                      <td className="py-3 px-4 text-sm text-gray-700">{roomBed.roomType}</td>
                      <td className="py-3 px-4 text-sm text-gray-700">{roomBed.numberOfBeds}</td>
                      <td className="py-3 px-4 text-sm text-gray-700">₹{roomBed.chargesPerDay.toLocaleString()}</td>
                      <td className="py-3 px-4 text-sm">{getStatusBadge(roomBed.status)}</td>
                      <td className="py-3 px-4 text-sm text-gray-700">{roomBed.createdBy}</td>
                      <td className="py-3 px-4 text-sm text-gray-500">{new Date(roomBed.createdAt).toLocaleDateString()}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(roomBed)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDeleteRoomBed(roomBed.id)}
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
            <DialogTitle>Edit Room Bed</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-bedNo">Bed No</Label>
                <Input
                  id="edit-bedNo"
                  placeholder="e.g., B101"
                  value={formData.bedNo}
                  onChange={(e) => setFormData({ ...formData, bedNo: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-roomNo">Room No</Label>
                <Input
                  id="edit-roomNo"
                  placeholder="e.g., R101"
                  value={formData.roomNo}
                  onChange={(e) => setFormData({ ...formData, roomNo: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-roomCategory">Room Category</Label>
                <select
                  id="edit-roomCategory"
                  aria-label="Room Category"
                  className="w-full px-3 py-2 border border-gray-200 rounded-md"
                  value={formData.roomCategory}
                  onChange={(e) => setFormData({ ...formData, roomCategory: e.target.value })}
                >
                  {roomCategoryOptions.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="edit-roomType">Room Type</Label>
                <select
                  id="edit-roomType"
                  aria-label="Room Type"
                  className="w-full px-3 py-2 border border-gray-200 rounded-md"
                  value={formData.roomType}
                  onChange={(e) => setFormData({ ...formData, roomType: e.target.value })}
                >
                  {roomTypeOptions.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-numberOfBeds">Number of Beds</Label>
                <Input
                  id="edit-numberOfBeds"
                  type="number"
                  min="1"
                  placeholder="e.g., 1"
                  value={formData.numberOfBeds}
                  onChange={(e) => setFormData({ ...formData, numberOfBeds: parseInt(e.target.value) || 1 })}
                />
              </div>
              <div>
                <Label htmlFor="edit-chargesPerDay">Charges Per Day (₹)</Label>
                <Input
                  id="edit-chargesPerDay"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="e.g., 1500"
                  value={formData.chargesPerDay}
                  onChange={(e) => setFormData({ ...formData, chargesPerDay: parseFloat(e.target.value) || 0 })}
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
                onChange={(e) => setFormData({ ...formData, status: e.target.value as RoomBed['status'] })}
              >
                {statusOptions.map(status => (
                  <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleEditSubmit}>Update Room Bed</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

