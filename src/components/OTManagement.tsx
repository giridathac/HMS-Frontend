import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Textarea } from './ui/textarea';
import { Scissors, Plus, Clock, CheckCircle, AlertCircle, Edit, Trash2, CheckCircle2, XCircle, ArrowLeft, Calendar } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Calendar as CalendarComponent } from './ui/calendar';
import { otRoomsApi } from '../api/otRooms';
import { otSlotsApi } from '../api/otSlots';
import { OTRoom, OTSlot } from '../types';
import { getTodayIST, formatDateIST } from '../utils/timeUtils';

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

// Helper function to convert YYYY-MM-DD to DD-MM-YYYY
const formatDateToDDMMYYYY = (dateStr: string): string => {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  return `${day}-${month}-${year}`;
};

// Helper function to convert DD-MM-YYYY to YYYY-MM-DD
const parseDateFromDDMMYYYY = (dateStr: string): string => {
  if (!dateStr) return '';
  const [day, month, year] = dateStr.split('-');
  return `${year}-${month}-${day}`;
};

export function OTManagement() {
  const [surgeries, setSurgeries] = useState<Surgery[]>(mockSurgeries);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [otRooms, setOTRooms] = useState<OTRoom[]>([]);
  const [otSlotsByRoom, setOTSlotsByRoom] = useState<Map<number, OTSlot[]>>(new Map());
  const [selectedDate, setSelectedDate] = useState<string>(getTodayIST());
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  
  // Convert string date (YYYY-MM-DD) to Date object
  const getDateFromString = (dateStr: string): Date | undefined => {
    if (!dateStr) return undefined;
    try {
      const date = new Date(dateStr + 'T00:00:00+05:30'); // IST timezone
      if (isNaN(date.getTime())) return undefined;
      return date;
    } catch {
      return undefined;
    }
  };
  
  // Convert Date object to string (YYYY-MM-DD)
  const getStringFromDate = (date: Date | undefined): string => {
    if (!date) return getTodayIST();
    try {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch {
      return getTodayIST();
    }
  };
  
  // Format date to DD-MM-YYYY for display
  const formatDateToDDMMYYYY = (dateStr: string): string => {
    if (!dateStr) return '';
    try {
      const istDate = formatDateIST(dateStr);
      if (!istDate) return '';
      const [year, month, day] = istDate.split('-');
      return `${day}-${month}-${year}`;
    } catch {
      return '';
    }
  };

  // Fetch OT rooms on component mount
  useEffect(() => {
    const fetchOTRooms = async () => {
      try {
        setLoading(true);
        const allOTRooms = await otRoomsApi.getAllLegacy();
        setOTRooms(allOTRooms);
      } catch (err) {
        console.error('Failed to fetch OT rooms:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOTRooms();
  }, []);

  // Fetch OT slots for all rooms when date changes
  useEffect(() => {
    const fetchOTSlots = async () => {
      if (otRooms.length === 0) return;
      
      try {
        setLoadingSlots(true);
        const slotsMap = new Map<number, OTSlot[]>();
        
        // Fetch slots for each OT room
        const slotPromises = otRooms.map(async (room) => {
          try {
            const numericOtId = typeof room.otId === 'string' 
              ? parseInt(room.otId.replace('OT-', ''), 10)
              : room.id;
            
            if (isNaN(numericOtId)) return;
            
            // Pass selectedDate (YYYY-MM-DD) - API will convert to DD-MM-YYYY internally
            const slots = await otSlotsApi.getAll(undefined, numericOtId, selectedDate);
            slotsMap.set(numericOtId, slots);
          } catch (err) {
            console.error(`Failed to fetch slots for OT ${room.otId}:`, err);
          }
        });
        
        await Promise.all(slotPromises);
        setOTSlotsByRoom(slotsMap);
      } catch (err) {
        console.error('Failed to fetch OT slots:', err);
      } finally {
        setLoadingSlots(false);
      }
    };
    
    fetchOTSlots();
  }, [selectedDate, otRooms]);


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
          <div className="flex items-center gap-4">
            <CardTitle>OT Room Slot Status</CardTitle>
            <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-40 justify-start text-left font-normal"
                >
                  <Calendar className="mr-2 size-4" />
                  {selectedDate ? formatDateToDDMMYYYY(selectedDate) : 'Pick a date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-white" align="start" style={{ opacity: 1 }}>
                <CalendarComponent
                  mode="single"
                  selected={getDateFromString(selectedDate)}
                  onSelect={(date) => {
                    if (date) {
                      const dateStr = getStringFromDate(date);
                      setSelectedDate(dateStr);
                      setDatePickerOpen(false);
                    }
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading OT rooms...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {otRooms.map((ot) => {
                const numericOtId = typeof ot.otId === 'string' 
                  ? parseInt(ot.otId.replace('OT-', ''), 10)
                  : ot.id;
                const slots = otSlotsByRoom.get(numericOtId) || [];
                // Only consider a slot as occupied if it's actually not available for the selected date
                // A slot is occupied if: isOccupied is true AND isAvailable is false
                // This ensures we don't show available slots as occupied even if they have allocations for other dates
                const occupiedSlots = slots.filter(s => s.isOccupied === true && s.isAvailable === false);
                const availableSlots = slots.filter(s => s.isAvailable === true || (s.isOccupied !== true && s.isAvailable !== false));
                
                let status = 'Available';
                let statusColor = 'green';
                let currentSurgery = null;
                
                if (loadingSlots) {
                  status = 'Loading...';
                  statusColor = 'gray';
                } else if (occupiedSlots.length > 0) {
                  status = 'Occupied';
                  statusColor = 'red';
                  const firstOccupied = occupiedSlots[0];
                  currentSurgery = firstOccupied.patientName 
                    ? `${firstOccupied.patientName} - ${firstOccupied.slotStartTime} to ${firstOccupied.slotEndTime}`
                    : `Slot ${firstOccupied.otSlotNo} - ${firstOccupied.slotStartTime} to ${firstOccupied.slotEndTime}`;
                } else if (slots.length > 0 && availableSlots.length === 0) {
                  status = 'Fully Booked';
                  statusColor = 'orange';
                } else if (slots.length === 0) {
                  status = 'No Slots';
                  statusColor = 'gray';
                }
                
                return (
                  <div
                    key={ot.id}
                    className={`p-4 border-2 rounded-lg ${
                      statusColor === 'red' ? 'border-red-300 bg-red-50' :
                      statusColor === 'orange' ? 'border-orange-300 bg-orange-50' :
                      statusColor === 'green' ? 'border-green-300 bg-green-50' :
                      'border-gray-300 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-gray-900">{ot.otNo || ot.otId}</h4>
                      <span className={`size-3 rounded-full ${
                        statusColor === 'red' ? 'bg-red-500' :
                        statusColor === 'orange' ? 'bg-orange-500' :
                        statusColor === 'green' ? 'bg-green-500' :
                        'bg-gray-500'
                      }`} />
                    </div>
                    <p className={`text-sm mb-1 ${
                      statusColor === 'red' ? 'text-red-700' :
                      statusColor === 'orange' ? 'text-orange-700' :
                      statusColor === 'green' ? 'text-green-700' :
                      'text-gray-700'
                    }`}>
                      {status}
                    </p>
                    {currentSurgery && (
                      <p className="text-xs text-gray-600">{currentSurgery}</p>
                    )}
                    {slots.length > 0 && (
                      <p className="text-xs text-gray-500 mt-1">
                        {occupiedSlots.length} occupied, {availableSlots.length} available
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
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
