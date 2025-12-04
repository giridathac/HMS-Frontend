import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Textarea } from './ui/textarea';
import { Scissors, Plus, Clock, CheckCircle, AlertCircle, Edit, Trash2, CheckCircle2, XCircle, ArrowLeft } from 'lucide-react';
import { useOTRooms } from '../hooks/useOTRooms';
import { useOTSlots } from '../hooks/useOTSlots';
import { OTRoom, OTSlot } from '../types';

interface Surgery {
  id: number;
  patientName: string;
  age: number;
  surgeryType: string;
  surgeon: string;
  assistants: string[];
  otNumber: string;
  scheduledDate: string;
  scheduledTime: string;
  duration: string;
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled';
  priority: 'Emergency' | 'High' | 'Normal';
  preOpNotes?: string;
  postOpStatus?: string;
}

const mockSurgeries: Surgery[] = [
  {
    id: 1,
    patientName: 'Robert Brown',
    age: 58,
    surgeryType: 'Knee Replacement Surgery',
    surgeon: 'Dr. Michael Chen',
    assistants: ['Dr. Emily Davis', 'Nurse Jane Smith'],
    otNumber: 'OT-1',
    scheduledDate: '2025-11-14',
    scheduledTime: '10:00 AM',
    duration: '3 hours',
    status: 'In Progress',
    priority: 'Normal',
    preOpNotes: 'Patient fasted, anesthesia administered'
  },
  {
    id: 2,
    patientName: 'Sarah Martinez',
    age: 42,
    surgeryType: 'Cardiac Bypass Surgery',
    surgeon: 'Dr. Sarah Johnson',
    assistants: ['Dr. Robert Lee', 'Dr. James Miller'],
    otNumber: 'OT-2',
    scheduledDate: '2025-11-14',
    scheduledTime: '02:00 PM',
    duration: '5 hours',
    status: 'Scheduled',
    priority: 'High',
    preOpNotes: 'ICU bed reserved post-surgery'
  },
  {
    id: 3,
    patientName: 'Michael Johnson',
    age: 35,
    surgeryType: 'Appendectomy',
    surgeon: 'Dr. Emily Davis',
    assistants: ['Dr. Robert Lee'],
    otNumber: 'OT-3',
    scheduledDate: '2025-11-14',
    scheduledTime: '11:00 AM',
    duration: '1.5 hours',
    status: 'Scheduled',
    priority: 'Emergency',
    preOpNotes: 'Emergency case, acute appendicitis'
  },
  {
    id: 4,
    patientName: 'Jennifer White',
    age: 28,
    surgeryType: 'C-Section Delivery',
    surgeon: 'Dr. Maria Garcia',
    assistants: ['Dr. Lisa Anderson', 'Nurse Mary Johnson'],
    otNumber: 'OT-4',
    scheduledDate: '2025-11-13',
    scheduledTime: '09:00 AM',
    duration: '2 hours',
    status: 'Completed',
    priority: 'Normal',
    postOpStatus: 'Mother and baby stable, moved to recovery'
  },
];

const otRooms = [
  { number: 'OT-1', status: 'Occupied', currentSurgery: 'Knee Replacement' },
  { number: 'OT-2', status: 'Available', currentSurgery: null },
  { number: 'OT-3', status: 'Scheduled', currentSurgery: 'Appendectomy at 11:00 AM' },
  { number: 'OT-4', status: 'Cleaning', currentSurgery: null },
];

export function OTManagement() {
  const [surgeries, setSurgeries] = useState<Surgery[]>(mockSurgeries);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const todaySurgeries = surgeries.filter(s => s.scheduledDate === '2025-11-14');
  const inProgress = surgeries.filter(s => s.status === 'In Progress');
  const scheduled = surgeries.filter(s => s.status === 'Scheduled');
  const completed = surgeries.filter(s => s.status === 'Completed');

  return (
    <div className="p-8 bg-blue-100 min-h-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-gray-900 mb-2">Operation Theater Management</h1>
          <p className="text-gray-500">Schedule and monitor surgical procedures</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="size-4" />
              Schedule Surgery
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Schedule New Surgery</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div>
                <Label htmlFor="patientName">Patient Name</Label>
                <Input id="patientName" placeholder="Enter patient name" />
              </div>
              <div>
                <Label htmlFor="age">Age</Label>
                <Input id="age" type="number" placeholder="Age" />
              </div>
              <div className="col-span-2">
                <Label htmlFor="surgeryType">Surgery Type</Label>
                <Input id="surgeryType" placeholder="Enter surgery type" />
              </div>
              <div>
                <Label htmlFor="surgeon">Lead Surgeon</Label>
                <Input id="surgeon" placeholder="Select surgeon" />
              </div>
              <div>
                <Label htmlFor="otNumber">OT Number</Label>
                <select id="otNumber" aria-label="OT Number" className="w-full px-3 py-2 border border-gray-200 rounded-md">
                  <option value="">Select OT</option>
                  {otRooms.filter(ot => ot.status === 'Available').map(ot => (
                    <option key={ot.number} value={ot.number}>{ot.number}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="date">Date</Label>
                <Input id="date" type="date" />
              </div>
              <div>
                <Label htmlFor="time">Time</Label>
                <Input id="time" type="time" />
              </div>
              <div>
                <Label htmlFor="duration">Estimated Duration</Label>
                <Input id="duration" placeholder="e.g., 3 hours" />
              </div>
              <div>
                <Label htmlFor="priority">Priority</Label>
                <select id="priority" aria-label="Priority" className="w-full px-3 py-2 border border-gray-200 rounded-md">
                  <option value="Normal">Normal</option>
                  <option value="High">High</option>
                  <option value="Emergency">Emergency</option>
                </select>
              </div>
              <div className="col-span-2">
                <Label htmlFor="preOpNotes">Pre-Operative Notes</Label>
                <textarea
                  id="preOpNotes"
                  className="w-full px-3 py-2 border border-gray-200 rounded-md"
                  rows={3}
                  placeholder="Enter pre-operative notes..."
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button onClick={() => setIsDialogOpen(false)}>Schedule Surgery</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-500">Today's Surgeries</p>
              <Scissors className="size-5 text-blue-600" />
            </div>
            <h3 className="text-gray-900">{todaySurgeries.length}</h3>
            <p className="text-xs text-gray-500">Scheduled for today</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-500">In Progress</p>
              <Badge variant="default">{inProgress.length}</Badge>
            </div>
            <h3 className="text-gray-900">{inProgress.length}</h3>
            <p className="text-xs text-gray-500">Currently ongoing</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-500">Scheduled</p>
              <Clock className="size-5 text-orange-600" />
            </div>
            <h3 className="text-gray-900">{scheduled.length}</h3>
            <p className="text-xs text-gray-500">Upcoming surgeries</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-500">Completed</p>
              <CheckCircle className="size-5 text-green-600" />
            </div>
            <h3 className="text-gray-900">{completed.length}</h3>
            <p className="text-xs text-gray-500">This week</p>
          </CardContent>
        </Card>
      </div>

      {/* OT Room Status */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>OT Room Status - Live</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {otRooms.map((ot) => (
              <div
                key={ot.number}
                className={`p-4 border-2 rounded-lg ${
                  ot.status === 'Occupied' ? 'border-red-300 bg-red-50' :
                  ot.status === 'Scheduled' ? 'border-orange-300 bg-orange-50' :
                  ot.status === 'Available' ? 'border-green-300 bg-green-50' :
                  'border-gray-300 bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-gray-900">{ot.number}</h4>
                  <span className={`size-3 rounded-full ${
                    ot.status === 'Occupied' ? 'bg-red-500' :
                    ot.status === 'Scheduled' ? 'bg-orange-500' :
                    ot.status === 'Available' ? 'bg-green-500' :
                    'bg-gray-500'
                  }`} />
                </div>
                <p className={`text-sm mb-1 ${
                  ot.status === 'Occupied' ? 'text-red-700' :
                  ot.status === 'Scheduled' ? 'text-orange-700' :
                  ot.status === 'Available' ? 'text-green-700' :
                  'text-gray-700'
                }`}>
                  {ot.status}
                </p>
                {ot.currentSurgery && (
                  <p className="text-xs text-gray-600">{ot.currentSurgery}</p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Surgeries List */}
      <Tabs defaultValue="today" className="space-y-6">
        <TabsList>
          <TabsTrigger value="today">Today's Surgeries ({todaySurgeries.length})</TabsTrigger>
          <TabsTrigger value="progress">In Progress ({inProgress.length})</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled ({scheduled.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completed.length})</TabsTrigger>
          <TabsTrigger value="otrooms">OT Rooms</TabsTrigger>
        </TabsList>

        <TabsContent value="today">
          <SurgeryList surgeries={todaySurgeries} />
        </TabsContent>
        <TabsContent value="progress">
          <SurgeryList surgeries={inProgress} />
        </TabsContent>
        <TabsContent value="scheduled">
          <SurgeryList surgeries={scheduled} />
        </TabsContent>
        <TabsContent value="completed">
          <SurgeryList surgeries={completed} />
        </TabsContent>
        <TabsContent value="otrooms">
          <OTRoomsManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function SurgeryList({ surgeries }: { surgeries: Surgery[] }) {
  return (
    <div className="space-y-4">
      {surgeries.map((surgery) => (
        <Card key={surgery.id}>
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <Badge className="text-base">{surgery.otNumber}</Badge>
                  <h3 className="text-gray-900">{surgery.surgeryType}</h3>
                  <Badge variant={
                    surgery.priority === 'Emergency' ? 'destructive' :
                    surgery.priority === 'High' ? 'default' : 'secondary'
                  }>
                    {surgery.priority}
                  </Badge>
                  <span className={`px-3 py-1 rounded-full text-xs ${
                    surgery.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                    surgery.status === 'Scheduled' ? 'bg-orange-100 text-orange-700' :
                    surgery.status === 'Completed' ? 'bg-green-100 text-green-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {surgery.status}
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-500">Patient</p>
                    <p className="text-gray-900">{surgery.patientName}, {surgery.age}Y</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Lead Surgeon</p>
                    <p className="text-gray-900">{surgery.surgeon}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Date & Time</p>
                    <p className="text-gray-900">{surgery.scheduledDate} at {surgery.scheduledTime}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Duration</p>
                    <p className="text-gray-900">{surgery.duration}</p>
                  </div>
                </div>
                {surgery.assistants.length > 0 && (
                  <div className="mb-3">
                    <p className="text-sm text-gray-500 mb-1">Assistants</p>
                    <div className="flex flex-wrap gap-2">
                      {surgery.assistants.map((assistant, i) => (
                        <Badge key={i} variant="outline">{assistant}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                {surgery.preOpNotes && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">Pre-Op Notes</p>
                    <p className="text-sm text-gray-900">{surgery.preOpNotes}</p>
                  </div>
                )}
                {surgery.postOpStatus && (
                  <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-sm text-green-700 mb-1">Post-Op Status</p>
                    <p className="text-sm text-green-900">{surgery.postOpStatus}</p>
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-2 ml-4">
                <Button variant="outline" size="sm">View Details</Button>
                {surgery.status === 'Scheduled' && (
                  <Button size="sm" variant="default">Start Surgery</Button>
                )}
                {surgery.status === 'In Progress' && (
                  <Button size="sm" variant="default" className="bg-green-600 hover:bg-green-700">
                    Complete Surgery
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      {surgeries.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center text-gray-500">
            No surgeries found
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function OTRoomsManagement() {
  const { otRooms, loading, error, createOTRoom, updateOTRoom, deleteOTRoom } = useOTRooms();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedOTRoom, setSelectedOTRoom] = useState<OTRoom | null>(null);
  const [selectedOTId, setSelectedOTId] = useState<string | null>(null);

  // Check URL for otId parameter (for opening in new tab)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const otIdFromUrl = urlParams.get('otId');
    if (otIdFromUrl) {
      setSelectedOTId(otIdFromUrl);
    }
  }, []);
  const [formData, setFormData] = useState({
    otNo: '',
    otType: 'General',
    otName: '',
    otDescription: '',
    startTimeofDay: '08:00',
    endTimeofDay: '20:00',
    createdBy: '1',
    status: 'active' as OTRoom['status'],
  });

  const otTypeOptions = ['General', 'Cardiac', 'Orthopedic', 'Emergency', 'Neurosurgery', 'Pediatric'];

  const handleCreateOTRoom = async (data: {
    otNo: string;
    otType: string;
    otName: string;
    otDescription?: string;
    startTimeofDay: string;
    endTimeofDay: string;
    createdBy: string;
    status?: 'active' | 'inactive';
  }) => {
    try {
      await createOTRoom(data);
    } catch (err) {
      console.error('Failed to create OT room:', err);
      throw err;
    }
  };

  const handleUpdateOTRoom = async (id: number, data: Partial<{
    otNo: string;
    otType: string;
    otName: string;
    otDescription?: string;
    startTimeofDay: string;
    endTimeofDay: string;
    createdBy: string;
    status?: 'active' | 'inactive';
  }>) => {
    try {
      await updateOTRoom({ id, ...data });
    } catch (err) {
      console.error('Failed to update OT room:', err);
      throw err;
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this OT room? This action cannot be undone.')) {
      try {
        await deleteOTRoom(id);
      } catch (err) {
        console.error('Failed to delete OT room:', err);
      }
    }
  };

  const handleAddSubmit = async () => {
    if (!formData.otNo || !formData.otName || !formData.startTimeofDay || !formData.endTimeofDay) {
      alert('Please fill in all required fields.');
      return;
    }
    try {
      await handleCreateOTRoom({
        otNo: formData.otNo,
        otType: formData.otType,
        otName: formData.otName,
        otDescription: formData.otDescription || undefined,
        startTimeofDay: formData.startTimeofDay,
        endTimeofDay: formData.endTimeofDay,
        createdBy: formData.createdBy,
        status: formData.status,
      });
      setIsAddDialogOpen(false);
      setFormData({
        otNo: '',
        otType: 'General',
        otName: '',
        otDescription: '',
        startTimeofDay: '08:00',
        endTimeofDay: '20:00',
        createdBy: '1',
        status: 'active',
      });
    } catch (err) {
      // Error handled in parent
    }
  };

  const handleEditSubmit = async () => {
    if (!selectedOTRoom) return;
    if (!formData.otNo || !formData.otName || !formData.startTimeofDay || !formData.endTimeofDay) {
      alert('Please fill in all required fields.');
      return;
    }
    try {
      await handleUpdateOTRoom(selectedOTRoom.id, {
        otNo: formData.otNo,
        otType: formData.otType,
        otName: formData.otName,
        otDescription: formData.otDescription || undefined,
        startTimeofDay: formData.startTimeofDay,
        endTimeofDay: formData.endTimeofDay,
        createdBy: formData.createdBy,
        status: formData.status,
      });
      setIsEditDialogOpen(false);
      setSelectedOTRoom(null);
      setFormData({
        otNo: '',
        otType: 'General',
        otName: '',
        otDescription: '',
        startTimeofDay: '08:00',
        endTimeofDay: '20:00',
        createdBy: '1',
        status: 'active',
      });
    } catch (err) {
      // Error handled in parent
    }
  };

  const handleEdit = (otRoom: OTRoom) => {
    setSelectedOTRoom(otRoom);
    setFormData({
      otNo: otRoom.otNo,
      otType: otRoom.otType,
      otName: otRoom.otName,
      otDescription: otRoom.otDescription || '',
      startTimeofDay: otRoom.startTimeofDay,
      endTimeofDay: otRoom.endTimeofDay,
      createdBy: otRoom.createdBy,
      status: otRoom.status,
    });
    setIsEditDialogOpen(true);
  };

  const getStatusBadge = (status: OTRoom['status']) => {
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
        <div className="text-center py-12 text-blue-600">Loading OT rooms...</div>
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
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-blue-900 mb-2">OT Room Management</h2>
          <p className="text-blue-600">Manage operation theater rooms and their configurations</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="size-4" />
              Add OT Room
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New OT Room</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="otNo">OT No</Label>
                  <Input
                    id="otNo"
                    placeholder="e.g., OT001"
                    value={formData.otNo}
                    onChange={(e) => setFormData({ ...formData, otNo: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="otType">OT Type</Label>
                  <select
                    id="otType"
                    aria-label="OT Type"
                    className="w-full px-3 py-2 border border-gray-200 rounded-md"
                    value={formData.otType}
                    onChange={(e) => setFormData({ ...formData, otType: e.target.value })}
                  >
                    {otTypeOptions.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <Label htmlFor="otName">OT Name</Label>
                <Input
                  id="otName"
                  placeholder="e.g., General Operation Theater 1"
                  value={formData.otName}
                  onChange={(e) => setFormData({ ...formData, otName: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="otDescription">OT Description</Label>
                <Textarea
                  id="otDescription"
                  placeholder="Enter OT room description..."
                  value={formData.otDescription}
                  onChange={(e) => setFormData({ ...formData, otDescription: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4 bg-orange-50 p-4 rounded-lg border border-orange-200">
                <div>
                  <Label htmlFor="startTimeofDay" className="flex items-center gap-2">
                    <Clock className="size-4" />
                    Start Time of Day
                  </Label>
                  <Input
                    id="startTimeofDay"
                    type="time"
                    value={formData.startTimeofDay}
                    onChange={(e) => setFormData({ ...formData, startTimeofDay: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="endTimeofDay" className="flex items-center gap-2">
                    <Clock className="size-4" />
                    End Time of Day
                  </Label>
                  <Input
                    id="endTimeofDay"
                    type="time"
                    value={formData.endTimeofDay}
                    onChange={(e) => setFormData({ ...formData, endTimeofDay: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="createdBy">Created By (User ID)</Label>
                  <Input
                    id="createdBy"
                    type="text"
                    placeholder="e.g., 1"
                    value={formData.createdBy}
                    onChange={(e) => setFormData({ ...formData, createdBy: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <select
                    id="status"
                    aria-label="Status"
                    className="w-full px-3 py-2 border border-gray-200 rounded-md"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as OTRoom['status'] })}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleAddSubmit}>Add OT Room</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* OT Rooms Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scissors className="size-5" />
            OT Rooms List ({otRooms.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">OT ID</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">OT No</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Type</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">OT Name</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Description</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Start Time</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">End Time</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Created By</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Created At</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {otRooms.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="text-center py-8 text-gray-500">
                      No OT rooms found. Add a new OT room to get started.
                    </td>
                  </tr>
                ) : (
                  otRooms.map((otRoom) => (
                    <tr key={otRoom.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm font-mono font-medium whitespace-nowrap">
                        <a
                          href={`#ot?otId=${encodeURIComponent(otRoom.otId)}`}
                          onClick={(e) => {
                            e.preventDefault();
                            setSelectedOTId(otRoom.otId);
                          }}
                          className="text-blue-600 hover:text-blue-800 hover:underline font-medium cursor-pointer"
                        >
                          {otRoom.otId}
                        </a>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-900 font-medium">{otRoom.otNo}</td>
                      <td className="py-3 px-4 text-sm text-gray-700">{otRoom.otType}</td>
                      <td className="py-3 px-4 text-sm text-gray-700">{otRoom.otName}</td>
                      <td className="py-3 px-4 text-sm text-gray-700 max-w-xs truncate" title={otRoom.otDescription}>{otRoom.otDescription || '-'}</td>
                      <td className="py-3 px-4 text-sm text-gray-700">{otRoom.startTimeofDay}</td>
                      <td className="py-3 px-4 text-sm text-gray-700">{otRoom.endTimeofDay}</td>
                      <td className="py-3 px-4 text-sm text-gray-700">{otRoom.createdBy}</td>
                      <td className="py-3 px-4 text-sm text-gray-500">{new Date(otRoom.createdAt).toLocaleDateString()}</td>
                      <td className="py-3 px-4 text-sm">{getStatusBadge(otRoom.status)}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(otRoom)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(otRoom.id)}
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
            <DialogTitle>Edit OT Room</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedOTRoom && (
              <div>
                <Label>OT ID</Label>
                <Input
                  value={selectedOTRoom.otId}
                  disabled
                  className="bg-gray-50 text-gray-500"
                />
                <p className="text-xs text-gray-500 mt-1">OT ID is auto-generated and cannot be changed</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-otNo">OT No</Label>
                <Input
                  id="edit-otNo"
                  placeholder="e.g., OT001"
                  value={formData.otNo}
                  onChange={(e) => setFormData({ ...formData, otNo: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-otType">OT Type</Label>
                <select
                  id="edit-otType"
                  aria-label="OT Type"
                  className="w-full px-3 py-2 border border-gray-200 rounded-md"
                  value={formData.otType}
                  onChange={(e) => setFormData({ ...formData, otType: e.target.value })}
                >
                  {otTypeOptions.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <Label htmlFor="edit-otName">OT Name</Label>
              <Input
                id="edit-otName"
                placeholder="e.g., General Operation Theater 1"
                value={formData.otName}
                onChange={(e) => setFormData({ ...formData, otName: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-otDescription">OT Description</Label>
              <Textarea
                id="edit-otDescription"
                placeholder="Enter OT room description..."
                value={formData.otDescription}
                onChange={(e) => setFormData({ ...formData, otDescription: e.target.value })}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4 bg-orange-50 p-4 rounded-lg border border-orange-200">
              <div>
                <Label htmlFor="edit-startTimeofDay" className="flex items-center gap-2">
                  <Clock className="size-4" />
                  Start Time of Day
                </Label>
                <Input
                  id="edit-startTimeofDay"
                  type="time"
                  value={formData.startTimeofDay}
                  onChange={(e) => setFormData({ ...formData, startTimeofDay: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-endTimeofDay" className="flex items-center gap-2">
                  <Clock className="size-4" />
                  End Time of Day
                </Label>
                <Input
                  id="edit-endTimeofDay"
                  type="time"
                  value={formData.endTimeofDay}
                  onChange={(e) => setFormData({ ...formData, endTimeofDay: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-createdBy">Created By (User ID)</Label>
                <Input
                  id="edit-createdBy"
                  type="text"
                  placeholder="e.g., 1"
                  value={formData.createdBy}
                  onChange={(e) => setFormData({ ...formData, createdBy: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-status">Status</Label>
                <select
                  id="edit-status"
                  aria-label="Status"
                  className="w-full px-3 py-2 border border-gray-200 rounded-md"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as OTRoom['status'] })}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleEditSubmit}>Update OT Room</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* OT Slots Dialog */}
      {selectedOTId && (
        <OTSlotsManagement 
          otId={selectedOTId} 
          onClose={() => setSelectedOTId(null)} 
        />
      )}
    </div>
  );
}

function OTSlotsManagement({ otId, onClose }: { otId: string; onClose: () => void }) {
  const { otSlots, loading, error, createOTSlot, updateOTSlot, deleteOTSlot } = useOTSlots(otId);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedOTSlot, setSelectedOTSlot] = useState<OTSlot | null>(null);
  const [formData, setFormData] = useState({
    otSlotNo: '',
    slotStartTime: '',
    slotEndTime: '',
    status: 'Active' as OTSlot['status'],
  });

  const handleCreateOTSlot = async (data: {
    otId: string;
    otSlotNo: string;
    slotStartTime: string;
    slotEndTime: string;
    status?: 'Active' | 'Inactive';
  }) => {
    try {
      await createOTSlot(data);
    } catch (err) {
      console.error('Failed to create OT slot:', err);
      throw err;
    }
  };

  const handleUpdateOTSlot = async (id: number, data: Partial<{
    otSlotNo: string;
    slotStartTime: string;
    slotEndTime: string;
    status?: 'Active' | 'Inactive';
  }>) => {
    try {
      await updateOTSlot({ id, ...data });
    } catch (err) {
      console.error('Failed to update OT slot:', err);
      throw err;
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this OT slot? This action cannot be undone.')) {
      try {
        await deleteOTSlot(id);
      } catch (err) {
        console.error('Failed to delete OT slot:', err);
      }
    }
  };

  const handleAddSubmit = async () => {
    if (!formData.otSlotNo || !formData.slotStartTime || !formData.slotEndTime) {
      alert('Please fill in all required fields.');
      return;
    }
    try {
      await handleCreateOTSlot({
        otId: otId,
        otSlotNo: formData.otSlotNo,
        slotStartTime: formData.slotStartTime,
        slotEndTime: formData.slotEndTime,
        status: formData.status,
      });
      setIsAddDialogOpen(false);
      setFormData({
        otSlotNo: '',
        slotStartTime: '',
        slotEndTime: '',
        status: 'Active',
      });
    } catch (err) {
      // Error handled in parent
    }
  };

  const handleEditSubmit = async () => {
    if (!selectedOTSlot) return;
    if (!formData.otSlotNo || !formData.slotStartTime || !formData.slotEndTime) {
      alert('Please fill in all required fields.');
      return;
    }
    try {
      await handleUpdateOTSlot(selectedOTSlot.id, {
        otSlotNo: formData.otSlotNo,
        slotStartTime: formData.slotStartTime,
        slotEndTime: formData.slotEndTime,
        status: formData.status,
      });
      setIsEditDialogOpen(false);
      setSelectedOTSlot(null);
      setFormData({
        otSlotNo: '',
        slotStartTime: '',
        slotEndTime: '',
        status: 'Active',
      });
    } catch (err) {
      // Error handled in parent
    }
  };

  const handleEdit = (otSlot: OTSlot) => {
    setSelectedOTSlot(otSlot);
    setFormData({
      otSlotNo: otSlot.otSlotNo,
      slotStartTime: otSlot.slotStartTime,
      slotEndTime: otSlot.slotEndTime,
      status: otSlot.status,
    });
    setIsEditDialogOpen(true);
  };

  const getStatusBadge = (status: OTSlot['status']) => {
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
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="text-center py-12 text-blue-600">Loading OT slots...</div>
        </DialogContent>
      </Dialog>
    );
  }

  if (error) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="text-center py-12 text-red-500">Error: {error}</div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
                <ArrowLeft className="size-4" />
              </Button>
              <DialogTitle>OT Slots for {otId}</DialogTitle>
            </div>
            <DialogTrigger asChild>
              <Button className="gap-2" onClick={(e) => {
                e.stopPropagation();
                setIsAddDialogOpen(true);
              }}>
                <Plus className="size-4" />
                Add OT Slot
              </Button>
            </DialogTrigger>
          </div>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {/* OT Slots Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="size-5" />
                OT Slots List ({otSlots.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">OT Slot ID</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">OT ID</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">OT Slot No</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Slot Start Time</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Slot End Time</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Status</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {otSlots.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-8 text-gray-500">
                          No OT slots found. Add a new OT slot to get started.
                        </td>
                      </tr>
                    ) : (
                      otSlots.map((otSlot) => (
                        <tr key={otSlot.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4 text-sm text-gray-900 font-mono font-medium whitespace-nowrap">{otSlot.otSlotId}</td>
                          <td className="py-3 px-4 text-sm text-gray-900 font-mono font-medium whitespace-nowrap">{otSlot.otId}</td>
                          <td className="py-3 px-4 text-sm text-gray-900 font-medium">{otSlot.otSlotNo}</td>
                          <td className="py-3 px-4 text-sm text-gray-700">{otSlot.slotStartTime}</td>
                          <td className="py-3 px-4 text-sm text-gray-700">{otSlot.slotEndTime}</td>
                          <td className="py-3 px-4 text-sm">{getStatusBadge(otSlot.status)}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(otSlot)}
                                className="h-8 w-8 p-0"
                              >
                                <Edit className="size-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(otSlot.id)}
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

        {/* Add Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New OT Slot</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="otSlotNo">OT Slot No *</Label>
                <Input
                  id="otSlotNo"
                  placeholder="e.g., SL01"
                  value={formData.otSlotNo}
                  onChange={(e) => setFormData({ ...formData, otSlotNo: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="slotStartTime" className="flex items-center gap-2">
                    <Clock className="size-4" />
                    Slot Start Time *
                  </Label>
                  <Input
                    id="slotStartTime"
                    placeholder="e.g., 9:00 AM"
                    value={formData.slotStartTime}
                    onChange={(e) => setFormData({ ...formData, slotStartTime: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="slotEndTime" className="flex items-center gap-2">
                    <Clock className="size-4" />
                    Slot End Time *
                  </Label>
                  <Input
                    id="slotEndTime"
                    placeholder="e.g., 10:00 AM"
                    value={formData.slotEndTime}
                    onChange={(e) => setFormData({ ...formData, slotEndTime: e.target.value })}
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
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as OTSlot['status'] })}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleAddSubmit}>Add OT Slot</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit OT Slot</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {selectedOTSlot && (
                <div>
                  <Label>OT Slot ID</Label>
                  <Input
                    value={selectedOTSlot.otSlotId}
                    disabled
                    className="bg-gray-50 text-gray-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">OT Slot ID is auto-generated and cannot be changed</p>
                </div>
              )}
              <div>
                <Label htmlFor="edit-otSlotNo">OT Slot No *</Label>
                <Input
                  id="edit-otSlotNo"
                  placeholder="e.g., SL01"
                  value={formData.otSlotNo}
                  onChange={(e) => setFormData({ ...formData, otSlotNo: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-slotStartTime" className="flex items-center gap-2">
                    <Clock className="size-4" />
                    Slot Start Time *
                  </Label>
                  <Input
                    id="edit-slotStartTime"
                    placeholder="e.g., 9:00 AM"
                    value={formData.slotStartTime}
                    onChange={(e) => setFormData({ ...formData, slotStartTime: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-slotEndTime" className="flex items-center gap-2">
                    <Clock className="size-4" />
                    Slot End Time *
                  </Label>
                  <Input
                    id="edit-slotEndTime"
                    placeholder="e.g., 10:00 AM"
                    value={formData.slotEndTime}
                    onChange={(e) => setFormData({ ...formData, slotEndTime: e.target.value })}
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
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as OTSlot['status'] })}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleEditSubmit}>Update OT Slot</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
}
