import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Textarea } from './ui/textarea';
import { Scissors, Plus, Clock, CheckCircle, AlertCircle, Edit, Trash2, CheckCircle2, XCircle, ArrowLeft } from 'lucide-react';

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
    <div className="flex-1 bg-blue-100 flex flex-col overflow-hidden min-h-0">
      <div className="px-4 pt-4 pb-0 flex-shrink-0">
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
          <div>
            <h1 className="text-gray-900 mb-0 text-xl">Operation Theater Management</h1>
            <p className="text-gray-500 text-sm">Schedule and monitor surgical procedures</p>
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
      </div>
      <div className="overflow-y-auto overflow-x-hidden px-4 pb-4 ot-scrollable" style={{ maxHeight: 'calc(100vh - 60px)', minHeight: 0 }}>
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
      </Tabs>
      </div>
    </div>
  );
}

function SurgeryList({ surgeries }: { surgeries: Surgery[] }) {
  return (
    <div className="space-y-4">
      {surgeries.map((surgery, index) => (
        <Card key={surgery.id} className={index === surgeries.length - 1 ? "mb-4" : ""}>
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
