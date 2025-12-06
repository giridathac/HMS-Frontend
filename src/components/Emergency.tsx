import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Siren, Plus, Ambulance, AlertTriangle, BedDouble, ArrowRight, Clock, Edit, Trash2, CheckCircle2, XCircle } from 'lucide-react';
import { useEmergencyBeds } from '../hooks/useEmergencyBeds';
import { EmergencyBed } from '../types';

interface EmergencyPatient {
  id: number;
  emergencyId: string;
  patientName: string;
  age: number;
  gender: string;
  phone: string;
  arrivalTime: string;
  arrivalMode: 'Walk-in' | 'Ambulance' | 'Referred';
  chiefComplaint: string;
  triageLevel: 'Red' | 'Yellow' | 'Green';
  vitalSigns: {
    bloodPressure: string;
    heartRate: number;
    temperature: number;
    oxygenSaturation: number;
  };
  status: 'Waiting' | 'Under Treatment' | 'Admitted' | 'Discharged' | 'Transferred';
  assignedDoctor?: string;
  bedNumber?: string;
  admittedTo?: string;
  notes?: string;
}

const mockEmergencyPatients: EmergencyPatient[] = [
  {
    id: 1,
    emergencyId: 'ER-2025-001',
    patientName: 'Michael Rodriguez',
    age: 52,
    gender: 'Male',
    phone: '555-9001',
    arrivalTime: '08:15 AM',
    arrivalMode: 'Ambulance',
    chiefComplaint: 'Severe chest pain, difficulty breathing',
    triageLevel: 'Red',
    vitalSigns: {
      bloodPressure: '160/100',
      heartRate: 105,
      temperature: 37.2,
      oxygenSaturation: 91,
    },
    status: 'Under Treatment',
    assignedDoctor: 'Dr. Sarah Johnson',
    bedNumber: 'ER-01',
    notes: 'Suspected cardiac emergency, ECG ordered',
  },
  {
    id: 2,
    emergencyId: 'ER-2025-002',
    patientName: 'Sarah Williams',
    age: 28,
    gender: 'Female',
    phone: '555-9002',
    arrivalTime: '09:30 AM',
    arrivalMode: 'Walk-in',
    chiefComplaint: 'Severe abdominal pain',
    triageLevel: 'Yellow',
    vitalSigns: {
      bloodPressure: '125/80',
      heartRate: 88,
      temperature: 37.8,
      oxygenSaturation: 97,
    },
    status: 'Waiting',
    bedNumber: 'ER-03',
  },
  {
    id: 3,
    emergencyId: 'ER-2025-003',
    patientName: 'James Patterson',
    age: 35,
    gender: 'Male',
    phone: '555-9003',
    arrivalTime: '10:00 AM',
    arrivalMode: 'Ambulance',
    chiefComplaint: 'Motor vehicle accident - multiple injuries',
    triageLevel: 'Red',
    vitalSigns: {
      bloodPressure: '110/70',
      heartRate: 110,
      temperature: 36.9,
      oxygenSaturation: 94,
    },
    status: 'Under Treatment',
    assignedDoctor: 'Dr. Michael Chen',
    bedNumber: 'ER-02',
    notes: 'Trauma case, orthopedic consult requested',
  },
  {
    id: 4,
    emergencyId: 'ER-2025-004',
    patientName: 'Emily Thompson',
    age: 6,
    gender: 'Female',
    phone: '555-9004',
    arrivalTime: '10:45 AM',
    arrivalMode: 'Walk-in',
    chiefComplaint: 'High fever, difficulty breathing',
    triageLevel: 'Yellow',
    vitalSigns: {
      bloodPressure: '90/60',
      heartRate: 120,
      temperature: 39.5,
      oxygenSaturation: 93,
    },
    status: 'Under Treatment',
    assignedDoctor: 'Dr. Robert Lee',
    bedNumber: 'ER-05',
  },
  {
    id: 5,
    emergencyId: 'ER-2025-005',
    patientName: 'Robert Chang',
    age: 42,
    gender: 'Male',
    phone: '555-9005',
    arrivalTime: '11:15 AM',
    arrivalMode: 'Walk-in',
    chiefComplaint: 'Minor cut on hand',
    triageLevel: 'Green',
    vitalSigns: {
      bloodPressure: '120/75',
      heartRate: 75,
      temperature: 36.8,
      oxygenSaturation: 98,
    },
    status: 'Waiting',
    bedNumber: 'ER-08',
  },
];

const emergencyBeds = Array.from({ length: 10 }, (_, i) => {
  const bedNumber = `ER-${(i + 1).toString().padStart(2, '0')}`;
  const patient = mockEmergencyPatients.find(p => p.bedNumber === bedNumber);
  return {
    bedNumber,
    status: patient ? 'Occupied' : 'Available',
    patient,
  };
});

export function Emergency() {
  const [patients, setPatients] = useState<EmergencyPatient[]>(mockEmergencyPatients);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<EmergencyPatient | null>(null);

  const redPatients = patients.filter(p => p.triageLevel === 'Red');
  const yellowPatients = patients.filter(p => p.triageLevel === 'Yellow');
  const greenPatients = patients.filter(p => p.triageLevel === 'Green');
  const occupiedBeds = emergencyBeds.filter(b => b.status === 'Occupied').length;
  const ambulanceArrivals = patients.filter(p => p.arrivalMode === 'Ambulance').length;

  return (
    <div className="px-4 pt-4 pb-4 bg-blue-100 h-screen flex flex-col overflow-hidden">
      <div className="flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-red-100 rounded-lg">
            <Siren className="size-8 text-red-600" />
          </div>
          <div>
            <h1 className="text-gray-900 mb-1">Emergency Department</h1>
            <p className="text-gray-500">Manage emergency cases and triage</p>
          </div>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-red-600 hover:bg-red-700">
              <Plus className="size-4" />
              Register Emergency Patient
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Register Emergency Patient</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="patientName">Patient Name</Label>
                  <Input id="patientName" placeholder="Enter patient name" />
                </div>
                <div>
                  <Label htmlFor="age">Age</Label>
                  <Input id="age" type="number" placeholder="Age" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="gender">Gender</Label>
                  <select id="gender" aria-label="Gender" className="w-full px-3 py-2 border border-gray-200 rounded-md">
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" placeholder="Enter phone number" />
                </div>
              </div>
              <div>
                <Label htmlFor="arrivalMode">Arrival Mode</Label>
                <select id="arrivalMode" aria-label="Arrival Mode" className="w-full px-3 py-2 border border-gray-200 rounded-md">
                  <option value="Walk-in">Walk-in</option>
                  <option value="Ambulance">Ambulance</option>
                  <option value="Referred">Referred</option>
                </select>
              </div>
              <div>
                <Label htmlFor="complaint">Chief Complaint</Label>
                <Textarea id="complaint" placeholder="Describe the emergency condition..." rows={3} />
              </div>
              <div>
                <Label>Triage Level (Emergency Priority)</Label>
                <div className="grid grid-cols-3 gap-4 mt-2">
                  <button className="p-4 border-2 border-red-300 bg-red-50 rounded-lg hover:border-red-500 text-center">
                    <div className="size-4 bg-red-600 rounded-full mx-auto mb-2" />
                    <p className="text-red-900">Red</p>
                    <p className="text-xs text-red-700">Life Threatening</p>
                  </button>
                  <button className="p-4 border-2 border-yellow-300 bg-yellow-50 rounded-lg hover:border-yellow-500 text-center">
                    <div className="size-4 bg-yellow-600 rounded-full mx-auto mb-2" />
                    <p className="text-yellow-900">Yellow</p>
                    <p className="text-xs text-yellow-700">Urgent</p>
                  </button>
                  <button className="p-4 border-2 border-green-300 bg-green-50 rounded-lg hover:border-green-500 text-center">
                    <div className="size-4 bg-green-600 rounded-full mx-auto mb-2" />
                    <p className="text-green-900">Green</p>
                    <p className="text-xs text-green-700">Non-Urgent</p>
                  </button>
                </div>
              </div>
              <div className="border-t border-gray-200 pt-4">
                <Label className="mb-3 block">Vital Signs</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="bp" className="text-sm">Blood Pressure</Label>
                    <Input id="bp" placeholder="e.g., 120/80" />
                  </div>
                  <div>
                    <Label htmlFor="hr" className="text-sm">Heart Rate (bpm)</Label>
                    <Input id="hr" type="number" placeholder="e.g., 75" />
                  </div>
                  <div>
                    <Label htmlFor="temp" className="text-sm">Temperature (°C)</Label>
                    <Input id="temp" type="number" step="0.1" placeholder="e.g., 37.0" />
                  </div>
                  <div>
                    <Label htmlFor="o2" className="text-sm">O₂ Saturation (%)</Label>
                    <Input id="o2" type="number" placeholder="e.g., 98" />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
              <Button className="bg-red-600 hover:bg-red-700" onClick={() => setIsAddDialogOpen(false)}>
                Register Patient
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-500">Total Patients</p>
              <Badge>{patients.length}</Badge>
            </div>
            <h3 className="text-gray-900">{patients.length}</h3>
            <p className="text-xs text-gray-500">Currently in ER</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-500">Critical (Red)</p>
              <div className="size-3 bg-red-600 rounded-full" />
            </div>
            <h3 className="text-red-900">{redPatients.length}</h3>
            <p className="text-xs text-red-600">Life threatening</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-500">Urgent (Yellow)</p>
              <div className="size-3 bg-yellow-600 rounded-full" />
            </div>
            <h3 className="text-yellow-900">{yellowPatients.length}</h3>
            <p className="text-xs text-yellow-600">Needs attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-500">Beds Occupied</p>
              <BedDouble className="size-5 text-blue-600" />
            </div>
            <h3 className="text-gray-900">{occupiedBeds}/10</h3>
            <p className="text-xs text-gray-500">{10 - occupiedBeds} available</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-500">Ambulance</p>
              <Ambulance className="size-5 text-orange-600" />
            </div>
            <h3 className="text-gray-900">{ambulanceArrivals}</h3>
            <p className="text-xs text-gray-500">Arrivals today</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* ER Bed Layout */}
        <Card className="lg:col-span-2 mb-4">
          <CardHeader>
            <CardTitle>Emergency Room Bed Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 gap-3">
              {emergencyBeds.map((bed) => (
                <button
                  key={bed.bedNumber}
                  onClick={() => bed.patient && setSelectedPatient(bed.patient)}
                  className={`p-4 border-2 rounded-lg text-center transition-all ${
                    bed.status === 'Occupied'
                      ? bed.patient?.triageLevel === 'Red'
                        ? 'border-red-300 bg-red-50 hover:border-red-400'
                        : bed.patient?.triageLevel === 'Yellow'
                        ? 'border-yellow-300 bg-yellow-50 hover:border-yellow-400'
                        : 'border-green-300 bg-green-50 hover:border-green-400'
                      : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                  }`}
                >
                  <p className="text-sm text-gray-900 mb-1">{bed.bedNumber}</p>
                  <div className="flex items-center justify-center gap-1">
                    <span className={`size-2 rounded-full ${
                      bed.status === 'Occupied'
                        ? bed.patient?.triageLevel === 'Red'
                          ? 'bg-red-600'
                          : bed.patient?.triageLevel === 'Yellow'
                          ? 'bg-yellow-600'
                          : 'bg-green-600'
                        : 'bg-gray-300'
                    }`} />
                  </div>
                  {bed.patient && (
                    <p className="text-xs text-gray-600 mt-1 truncate">{bed.patient.patientName}</p>
                  )}
                </button>
              ))}
            </div>
            <div className="mt-6 flex items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <span className="size-3 rounded-full bg-red-600" />
                <span className="text-gray-600">Critical</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="size-3 rounded-full bg-yellow-600" />
                <span className="text-gray-600">Urgent</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="size-3 rounded-full bg-green-600" />
                <span className="text-gray-600">Non-Urgent</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="size-3 rounded-full bg-gray-300" />
                <span className="text-gray-600">Available</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Triage Queue */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="size-5 text-orange-600" />
              Triage Priority Queue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[...patients]
                .sort((a, b) => {
                  const priority = { Red: 0, Yellow: 1, Green: 2 };
                  return priority[a.triageLevel] - priority[b.triageLevel];
                })
                .filter(p => p.status === 'Waiting' || p.status === 'Under Treatment')
                .map((patient, index) => (
                  <div
                    key={patient.id}
                    className={`p-3 border-2 rounded-lg ${
                      patient.triageLevel === 'Red'
                        ? 'border-red-300 bg-red-50'
                        : patient.triageLevel === 'Yellow'
                        ? 'border-yellow-300 bg-yellow-50'
                        : 'border-green-300 bg-green-50'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-gray-500">#{index + 1}</span>
                      <div className={`size-2 rounded-full ${
                        patient.triageLevel === 'Red'
                          ? 'bg-red-600'
                          : patient.triageLevel === 'Yellow'
                          ? 'bg-yellow-600'
                          : 'bg-green-600'
                      }`} />
                      <Badge variant="outline" className="text-xs">{patient.bedNumber}</Badge>
                    </div>
                    <p className="text-sm text-gray-900 mb-1">{patient.patientName}</p>
                    <p className="text-xs text-gray-600">{patient.chiefComplaint}</p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                      <Clock className="size-3" />
                      <span>{patient.arrivalTime}</span>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
        </div>

      {/* Patients List */}
      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">All Patients ({patients.length})</TabsTrigger>
          <TabsTrigger value="red">Critical - Red ({redPatients.length})</TabsTrigger>
          <TabsTrigger value="yellow">Urgent - Yellow ({yellowPatients.length})</TabsTrigger>
          <TabsTrigger value="green">Non-Urgent - Green ({greenPatients.length})</TabsTrigger>
          <TabsTrigger value="beds">Emergency Beds</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <PatientsList patients={patients} onSelectPatient={setSelectedPatient} />
        </TabsContent>
        <TabsContent value="red">
          <PatientsList patients={redPatients} onSelectPatient={setSelectedPatient} />
        </TabsContent>
        <TabsContent value="yellow">
          <PatientsList patients={yellowPatients} onSelectPatient={setSelectedPatient} />
        </TabsContent>
        <TabsContent value="green">
          <PatientsList patients={greenPatients} onSelectPatient={setSelectedPatient} />
        </TabsContent>
        <TabsContent value="beds">
          <EmergencyBedsManagement />
        </TabsContent>
      </Tabs>

      {/* Patient Details Dialog */}
      <Dialog open={!!selectedPatient} onOpenChange={() => setSelectedPatient(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Emergency Patient Details</DialogTitle>
          </DialogHeader>
          {selectedPatient && (
            <div className="space-y-4 py-4">
              <div className={`flex items-center justify-between p-4 rounded-lg ${
                selectedPatient.triageLevel === 'Red' ? 'bg-red-50 border-2 border-red-200' :
                selectedPatient.triageLevel === 'Yellow' ? 'bg-yellow-50 border-2 border-yellow-200' :
                'bg-green-50 border-2 border-green-200'
              }`}>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <div className={`size-3 rounded-full ${
                      selectedPatient.triageLevel === 'Red' ? 'bg-red-600' :
                      selectedPatient.triageLevel === 'Yellow' ? 'bg-yellow-600' : 'bg-green-600'
                    }`} />
                    <h3 className="text-gray-900">{selectedPatient.patientName}</h3>
                    <Badge>{selectedPatient.emergencyId}</Badge>
                  </div>
                  <p className="text-sm text-gray-600">{selectedPatient.age}Y / {selectedPatient.gender}</p>
                </div>
                <Badge variant={
                  selectedPatient.triageLevel === 'Red' ? 'destructive' :
                  selectedPatient.triageLevel === 'Yellow' ? 'default' : 'secondary'
                }>
                  {selectedPatient.triageLevel} - {
                    selectedPatient.triageLevel === 'Red' ? 'Life Threatening' :
                    selectedPatient.triageLevel === 'Yellow' ? 'Urgent' : 'Non-Urgent'
                  }
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Arrival Time</p>
                  <p className="text-gray-900">{selectedPatient.arrivalTime}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Arrival Mode</p>
                  <Badge variant="outline">{selectedPatient.arrivalMode}</Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Bed Number</p>
                  <p className="text-gray-900">{selectedPatient.bedNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <Badge>{selectedPatient.status}</Badge>
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">Chief Complaint</p>
                <p className="text-gray-900">{selectedPatient.chiefComplaint}</p>
              </div>

              {selectedPatient.assignedDoctor && (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-500">Assigned Doctor</p>
                  <p className="text-gray-900">{selectedPatient.assignedDoctor}</p>
                </div>
              )}

              <div className="border-t border-gray-200 pt-4">
                <h4 className="text-gray-900 mb-3">Vital Signs</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">Blood Pressure</p>
                    <p className="text-gray-900">{selectedPatient.vitalSigns.bloodPressure}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">Heart Rate</p>
                    <p className="text-gray-900">{selectedPatient.vitalSigns.heartRate} bpm</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">Temperature</p>
                    <p className="text-gray-900">{selectedPatient.vitalSigns.temperature}°C</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">O₂ Saturation</p>
                    <p className="text-gray-900">{selectedPatient.vitalSigns.oxygenSaturation}%</p>
                  </div>
                </div>
              </div>

              {selectedPatient.notes && (
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-gray-500 mb-1">Clinical Notes</p>
                  <p className="text-gray-900">{selectedPatient.notes}</p>
                </div>
              )}

              <div className="flex justify-end gap-2">
                {selectedPatient.status === 'Waiting' && (
                  <Button>Assign Doctor</Button>
                )}
                {selectedPatient.status === 'Under Treatment' && (
                  <Button className="gap-2">
                    <ArrowRight className="size-4" />
                    Admit to IPD
                  </Button>
                )}
                <Button variant="outline">Update Vitals</Button>
                <Button variant="outline">Discharge</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
}

function PatientsList({ patients, onSelectPatient }: { patients: EmergencyPatient[]; onSelectPatient: (patient: EmergencyPatient) => void }) {
  return (
    <Card className="mb-4">
      <CardContent className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-gray-700">ER ID</th>
                <th className="text-left py-3 px-4 text-gray-700">Patient</th>
                <th className="text-left py-3 px-4 text-gray-700">Triage</th>
                <th className="text-left py-3 px-4 text-gray-700">Complaint</th>
                <th className="text-left py-3 px-4 text-gray-700">Arrival</th>
                <th className="text-left py-3 px-4 text-gray-700">Mode</th>
                <th className="text-left py-3 px-4 text-gray-700">Bed</th>
                <th className="text-left py-3 px-4 text-gray-700">Status</th>
                <th className="text-left py-3 px-4 text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((patient) => (
                <tr key={patient.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <span className="text-sm text-gray-900">{patient.emergencyId}</span>
                  </td>
                  <td className="py-3 px-4">
                    <p className="text-gray-900">{patient.patientName}</p>
                    <p className="text-xs text-gray-500">{patient.age}Y / {patient.gender}</p>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className={`size-3 rounded-full ${
                        patient.triageLevel === 'Red' ? 'bg-red-600' :
                        patient.triageLevel === 'Yellow' ? 'bg-yellow-600' : 'bg-green-600'
                      }`} />
                      <Badge variant={
                        patient.triageLevel === 'Red' ? 'destructive' :
                        patient.triageLevel === 'Yellow' ? 'default' : 'secondary'
                      }>
                        {patient.triageLevel}
                      </Badge>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-600 max-w-xs truncate">{patient.chiefComplaint}</td>
                  <td className="py-3 px-4 text-gray-600">{patient.arrivalTime}</td>
                  <td className="py-3 px-4">
                    <Badge variant="outline">{patient.arrivalMode}</Badge>
                  </td>
                  <td className="py-3 px-4">
                    <Badge>{patient.bedNumber}</Badge>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-3 py-1 rounded-full text-xs ${
                      patient.status === 'Under Treatment' ? 'bg-blue-100 text-blue-700' :
                      patient.status === 'Waiting' ? 'bg-yellow-100 text-yellow-700' :
                      patient.status === 'Admitted' ? 'bg-purple-100 text-purple-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {patient.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <Button variant="outline" size="sm" onClick={() => onSelectPatient(patient)}>
                      View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {patients.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No emergency patients found
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function EmergencyBedsManagement() {
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
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-gray-900 mb-2">Emergency Bed Management</h2>
          <p className="text-gray-500">Manage emergency beds and their configurations</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="size-4" />
              Add Emergency Bed
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Emergency Bed</DialogTitle>
            </DialogHeader>
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
                  Charges Per Day (₹) *</Label>
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
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleAddSubmit}>Add Emergency Bed</Button>
              </div>
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
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleEditSubmit}>Update Emergency Bed</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
