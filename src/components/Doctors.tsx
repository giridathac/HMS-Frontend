// Doctors Management Component - Separated UI from logic
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Plus, Trash2, Edit, UserCheck, Calendar, Clock } from 'lucide-react';
import { useDoctorsManagement } from '../hooks/useDoctorsManagement';
import { Doctor } from '../types';
import { AttendanceRecord } from '../api/doctors';

interface DoctorsViewProps {
  doctors: Doctor[];
  attendance: AttendanceRecord[];
  onCreateDoctor: (data: { name: string; specialty: string; type: 'inhouse' | 'consulting' }) => Promise<void>;
  onUpdateDoctor: (id: number, data: Partial<{ name: string; specialty: string; type: 'inhouse' | 'consulting' }>) => Promise<void>;
  onDeleteDoctor: (id: number) => Promise<void>;
  onCreateAttendance: (data: { doctorId: number; date: string; status: 'present' | 'absent' | 'on-leave' | 'half-day'; checkIn?: string; checkOut?: string; notes?: string }) => Promise<void>;
  onUpdateAttendance: (id: number, data: Partial<{ status: 'present' | 'absent' | 'on-leave' | 'half-day'; checkIn?: string; checkOut?: string; notes?: string }>) => Promise<void>;
}

export function Doctors() {
  const { doctors, attendance, loading, error, createDoctor, updateDoctor, deleteDoctor, createAttendanceRecord, updateAttendanceRecord } = useDoctorsManagement();

  const handleCreateDoctor = async (data: { name: string; specialty: string; type: 'inhouse' | 'consulting' }) => {
    try {
      await createDoctor(data);
    } catch (err) {
      console.error('Failed to create doctor:', err);
      throw err;
    }
  };

  const handleUpdateDoctor = async (id: number, data: Partial<{ name: string; specialty: string; type: 'inhouse' | 'consulting' }>) => {
    try {
      await updateDoctor({ id, ...data });
    } catch (err) {
      console.error('Failed to update doctor:', err);
      throw err;
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this doctor? This action cannot be undone.')) {
      try {
        await deleteDoctor(id);
      } catch (err) {
        console.error('Failed to delete doctor:', err);
      }
    }
  };

  if (loading) {
    return (
      <div className="p-8 bg-blue-100 min-h-full">
        <div className="text-center py-12 text-blue-600">Loading doctors...</div>
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

  const handleCreateAttendance = async (data: { doctorId: number; date: string; status: 'present' | 'absent' | 'on-leave' | 'half-day'; checkIn?: string; checkOut?: string; notes?: string }) => {
    try {
      await createAttendanceRecord(data);
    } catch (err) {
      console.error('Failed to create attendance:', err);
      throw err;
    }
  };

  const handleUpdateAttendance = async (id: number, data: Partial<{ status: 'present' | 'absent' | 'on-leave' | 'half-day'; checkIn?: string; checkOut?: string; notes?: string }>) => {
    try {
      await updateAttendanceRecord(id, data);
    } catch (err) {
      console.error('Failed to update attendance:', err);
      throw err;
    }
  };

  return (
    <DoctorsView
      doctors={doctors}
      attendance={attendance}
      onCreateDoctor={handleCreateDoctor}
      onUpdateDoctor={handleUpdateDoctor}
      onDeleteDoctor={handleDelete}
      onCreateAttendance={handleCreateAttendance}
      onUpdateAttendance={handleUpdateAttendance}
    />
  );
}

function DoctorsView({
  doctors,
  attendance,
  onCreateDoctor,
  onUpdateDoctor,
  onDeleteDoctor,
  onCreateAttendance,
  onUpdateAttendance,
}: DoctorsViewProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    specialty: '',
    type: 'inhouse' as 'inhouse' | 'consulting',
  });
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const handleAddSubmit = async () => {
    try {
      await onCreateDoctor(formData);
      setIsAddDialogOpen(false);
      setFormData({ name: '', specialty: '', type: 'inhouse' });
    } catch (err) {
      // Error handled in parent
    }
  };

  const handleEditSubmit = async () => {
    if (!selectedDoctor) return;
    try {
      await onUpdateDoctor(selectedDoctor.id, formData);
      setIsEditDialogOpen(false);
      setSelectedDoctor(null);
      setFormData({ name: '', specialty: '', type: 'inhouse' });
    } catch (err) {
      // Error handled in parent
    }
  };

  const handleEdit = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setFormData({
      name: doctor.name,
      specialty: doctor.specialty,
      type: doctor.type,
    });
    setIsEditDialogOpen(true);
  };

  const getAttendanceForDoctor = (doctorId: number) => {
    return attendance.find(a => a.doctorId === doctorId && a.date === selectedDate);
  };

  const getAttendanceStatusBadge = (status: string) => {
    const styles = {
      present: 'bg-green-100 text-green-700',
      absent: 'bg-red-100 text-red-700',
      'on-leave': 'bg-yellow-100 text-yellow-700',
      'half-day': 'bg-blue-100 text-blue-700',
    };
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-700';
  };

  const todayAttendance = attendance.filter(a => a.date === selectedDate);

  return (
    <div className="p-8 bg-blue-100 min-h-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-blue-900 mb-2">Doctors Management</h1>
          <p className="text-gray-500">Manage doctors and track attendance</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="size-4" />
              Add Doctor
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Doctor</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="name">Doctor Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Dr. John Smith"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="specialty">Specialty</Label>
                <Input
                  id="specialty"
                  placeholder="e.g., Cardiology"
                  value={formData.specialty}
                  onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="type">Type</Label>
                <select
                  id="type"
                  aria-label="Type"
                  title="Type"
                  className="w-full px-3 py-2 border border-gray-200 rounded-md"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as 'inhouse' | 'consulting' })}
                >
                  <option value="inhouse">Inhouse</option>
                  <option value="consulting">Consulting</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleAddSubmit}>Add Doctor</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="doctors" className="space-y-6">
        <TabsList>
          <TabsTrigger value="doctors">Doctors List</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
        </TabsList>

        <TabsContent value="doctors">
          <Card>
            <CardContent className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-gray-700">Name</th>
                      <th className="text-left py-3 px-4 text-gray-700">Specialty</th>
                      <th className="text-left py-3 px-4 text-gray-700">Type</th>
                      <th className="text-left py-3 px-4 text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {doctors.map((doctor) => (
                      <tr key={doctor.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-gray-900">{doctor.name}</td>
                        <td className="py-3 px-4 text-gray-600">{doctor.specialty}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded text-xs ${
                            doctor.type === 'inhouse' 
                              ? 'bg-blue-100 text-blue-700' 
                              : 'bg-purple-100 text-purple-700'
                          }`}>
                            {doctor.type === 'inhouse' ? 'Inhouse' : 'Consulting'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm" onClick={() => handleEdit(doctor)}>
                              <Edit className="size-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => onDeleteDoctor(doctor.id)}>
                              <Trash2 className="size-4 text-red-600" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendance">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="size-5" />
                    Attendance Management
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="attendanceDate">Date:</Label>
                    <Input
                      id="attendanceDate"
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-auto"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 text-gray-700">Doctor</th>
                        <th className="text-left py-3 px-4 text-gray-700">Specialty</th>
                        <th className="text-left py-3 px-4 text-gray-700">Status</th>
                        <th className="text-left py-3 px-4 text-gray-700">Check In</th>
                        <th className="text-left py-3 px-4 text-gray-700">Check Out</th>
                        <th className="text-left py-3 px-4 text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {doctors.map((doctor) => {
                        const attendanceRecord = getAttendanceForDoctor(doctor.id);
                        return (
                          <tr key={doctor.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 px-4 text-gray-900">{doctor.name}</td>
                            <td className="py-3 px-4 text-gray-600">{doctor.specialty}</td>
                            <td className="py-3 px-4">
                              {attendanceRecord ? (
                                <span className={`px-2 py-1 rounded text-xs ${getAttendanceStatusBadge(attendanceRecord.status)}`}>
                                  {attendanceRecord.status.charAt(0).toUpperCase() + attendanceRecord.status.slice(1).replace('-', ' ')}
                                </span>
                              ) : (
                                <span className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-700">Not Marked</span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-gray-600">
                              {attendanceRecord?.checkIn || '-'}
                            </td>
                            <td className="py-3 px-4 text-gray-600">
                              {attendanceRecord?.checkOut || '-'}
                            </td>
                            <td className="py-3 px-4">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const currentStatus = attendanceRecord?.status || 'present';
                                  const statuses: Array<'present' | 'absent' | 'on-leave' | 'half-day'> = ['present', 'absent', 'on-leave', 'half-day'];
                                  const currentIndex = statuses.indexOf(currentStatus);
                                  const nextStatus = statuses[(currentIndex + 1) % statuses.length];
                                  
                                  if (attendanceRecord) {
                                    onUpdateAttendance(attendanceRecord.id, { status: nextStatus });
                                  } else {
                                    // Create new attendance record
                                    const now = new Date();
                                    const checkIn = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                                    onCreateAttendance({
                                      doctorId: doctor.id,
                                      date: selectedDate,
                                      status: nextStatus,
                                      checkIn: nextStatus === 'present' || nextStatus === 'half-day' ? checkIn : undefined,
                                    });
                                  }
                                }}
                              >
                                <UserCheck className="size-4 mr-2" />
                                {attendanceRecord ? 'Update' : 'Mark'}
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Attendance Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="size-5" />
                  Attendance Summary - {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-gray-500">Present</p>
                    <p className="text-2xl font-bold text-green-700">
                      {todayAttendance.filter(a => a.status === 'present').length}
                    </p>
                  </div>
                  <div className="p-4 bg-red-50 rounded-lg">
                    <p className="text-sm text-gray-500">Absent</p>
                    <p className="text-2xl font-bold text-red-700">
                      {todayAttendance.filter(a => a.status === 'absent').length}
                    </p>
                  </div>
                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <p className="text-sm text-gray-500">On Leave</p>
                    <p className="text-2xl font-bold text-yellow-700">
                      {todayAttendance.filter(a => a.status === 'on-leave').length}
                    </p>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-500">Half Day</p>
                    <p className="text-2xl font-bold text-blue-700">
                      {todayAttendance.filter(a => a.status === 'half-day').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Doctor</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="edit-name">Doctor Name</Label>
              <Input
                id="edit-name"
                placeholder="e.g., Dr. John Smith"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-specialty">Specialty</Label>
              <Input
                id="edit-specialty"
                placeholder="e.g., Cardiology"
                value={formData.specialty}
                onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-type">Type</Label>
              <select
                id="edit-type"
                aria-label="Type"
                title="Type"
                className="w-full px-3 py-2 border border-gray-200 rounded-md"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as 'inhouse' | 'consulting' })}
              >
                <option value="inhouse">Inhouse</option>
                <option value="consulting">Consulting</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleEditSubmit}>Update Doctor</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

