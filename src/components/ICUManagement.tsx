import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { HeartPulse, Activity, Thermometer, Wind, Droplet, Brain, Plus, Trash2, Edit, CheckCircle2, XCircle, Wrench, Clock } from 'lucide-react';
import { useICUBeds } from '../hooks/useICUBeds';
import { ICUBed } from '../types';

interface ICUPatient {
  id: number;
  bedNumber: string;
  patientName: string;
  age: number;
  gender: string;
  admissionDate: string;
  admissionTime: string;
  condition: string;
  severity: 'Critical' | 'Serious' | 'Stable';
  attendingDoctor: string;
  vitals: {
    heartRate: number;
    bloodPressure: string;
    temperature: number;
    oxygenSaturation: number;
    respiratoryRate: number;
  };
  diagnosis: string;
  treatment: string;
  ventilatorSupport: boolean;
}

const mockICUPatients: ICUPatient[] = [
  {
    id: 1,
    bedNumber: 'ICU-01',
    patientName: 'Lisa Anderson',
    age: 41,
    gender: 'Female',
    admissionDate: '2025-11-13',
    admissionTime: '02:30 PM',
    condition: 'Post-Stroke Recovery',
    severity: 'Serious',
    attendingDoctor: 'Dr. James Miller',
    vitals: {
      heartRate: 88,
      bloodPressure: '130/85',
      temperature: 37.2,
      oxygenSaturation: 94,
      respiratoryRate: 18,
    },
    diagnosis: 'Ischemic Stroke',
    treatment: 'Thrombolytic therapy, monitoring',
    ventilatorSupport: false,
  },
  {
    id: 2,
    bedNumber: 'ICU-03',
    patientName: 'Michael Johnson',
    age: 62,
    gender: 'Male',
    admissionDate: '2025-11-12',
    admissionTime: '08:15 AM',
    condition: 'Post-Cardiac Surgery',
    severity: 'Critical',
    attendingDoctor: 'Dr. Sarah Johnson',
    vitals: {
      heartRate: 95,
      bloodPressure: '120/80',
      temperature: 36.8,
      oxygenSaturation: 92,
      respiratoryRate: 20,
    },
    diagnosis: 'Coronary Artery Disease',
    treatment: 'Post-CABG monitoring, pain management',
    ventilatorSupport: true,
  },
  {
    id: 3,
    bedNumber: 'ICU-05',
    patientName: 'David Martinez',
    age: 54,
    gender: 'Male',
    admissionDate: '2025-11-14',
    admissionTime: '11:00 AM',
    condition: 'Severe Pneumonia',
    severity: 'Critical',
    attendingDoctor: 'Dr. Emily Davis',
    vitals: {
      heartRate: 102,
      bloodPressure: '125/82',
      temperature: 38.5,
      oxygenSaturation: 89,
      respiratoryRate: 24,
    },
    diagnosis: 'Bilateral Pneumonia with Respiratory Distress',
    treatment: 'IV antibiotics, oxygen therapy',
    ventilatorSupport: true,
  },
  {
    id: 4,
    bedNumber: 'ICU-08',
    patientName: 'Jennifer White',
    age: 28,
    gender: 'Female',
    admissionDate: '2025-11-13',
    admissionTime: '11:30 AM',
    condition: 'Post C-Section Complications',
    severity: 'Stable',
    attendingDoctor: 'Dr. Maria Garcia',
    vitals: {
      heartRate: 78,
      bloodPressure: '118/75',
      temperature: 37.0,
      oxygenSaturation: 98,
      respiratoryRate: 16,
    },
    diagnosis: 'Post-operative bleeding, controlled',
    treatment: 'Blood transfusion, monitoring',
    ventilatorSupport: false,
  },
];

const icuBeds = Array.from({ length: 15 }, (_, i) => {
  const bedNumber = `ICU-${(i + 1).toString().padStart(2, '0')}`;
  const patient = mockICUPatients.find(p => p.bedNumber === bedNumber);
  return {
    bedNumber,
    status: patient ? 'Occupied' : 'Available',
    patient,
  };
});

const icuTypeOptions = ['Medical', 'Surgical', 'Pediatric', 'Cardiac', 'Neurological', 'Trauma'];
const statusOptions: ICUBed['status'][] = ['active', 'inactive'];

export function ICUManagement() {
  const [patients] = useState<ICUPatient[]>(mockICUPatients);
  const [selectedBed, setSelectedBed] = useState<string | null>(null);

  const occupiedBeds = icuBeds.filter(bed => bed.status === 'Occupied').length;
  const availableBeds = icuBeds.filter(bed => bed.status === 'Available').length;
  const criticalPatients = patients.filter(p => p.severity === 'Critical').length;
  const onVentilator = patients.filter(p => p.ventilatorSupport).length;

  const selectedPatient = icuBeds.find(bed => bed.bedNumber === selectedBed)?.patient;

  return (
    <div className="flex-1 bg-blue-100 flex flex-col overflow-hidden min-h-0">
      <div className="px-4 pt-4 pb-0 flex-shrink-0">
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
          <div>
            <h1 className="text-gray-900 mb-0 text-xl">ICU Management</h1>
            <p className="text-gray-500 text-sm">Intensive Care Unit monitoring and management</p>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 pb-8 icu-scrollable min-h-0">
      <Tabs defaultValue="patients" className="space-y-6">
        <TabsList>
          <TabsTrigger value="patients">Patient Management</TabsTrigger>
          <TabsTrigger value="beds">Bed Management</TabsTrigger>
        </TabsList>

        <TabsContent value="patients" className="space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-blue-600">Total Patients</p>
                  <HeartPulse className="size-5 text-red-600" />
                </div>
                <h3 className="text-blue-900">{occupiedBeds}/15</h3>
                <p className="text-xs text-blue-600">Occupied beds</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-blue-600">Critical Patients</p>
                  <Badge variant="destructive">{criticalPatients}</Badge>
                </div>
                <h3 className="text-blue-900">{criticalPatients}</h3>
                <p className="text-xs text-blue-600">Require immediate attention</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-blue-600">On Ventilator</p>
                  <Wind className="size-5 text-blue-600" />
                </div>
                <h3 className="text-blue-900">{onVentilator}</h3>
                <p className="text-xs text-blue-600">Ventilator support</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-blue-600">Available Beds</p>
                  <span className="text-green-600">●</span>
                </div>
                <h3 className="text-blue-900">{availableBeds}</h3>
                <p className="text-xs text-blue-600">Ready for admission</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* ICU Bed Layout */}
            <Card>
              <CardHeader>
                <CardTitle>ICU Bed Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-3">
                  {icuBeds.map((bed) => (
                    <button
                      key={bed.bedNumber}
                      onClick={() => setSelectedBed(bed.bedNumber)}
                      className={`p-4 border-2 rounded-lg text-center transition-all ${
                        selectedBed === bed.bedNumber
                          ? 'border-blue-500 bg-blue-50 scale-105'
                          : bed.status === 'Occupied'
                          ? bed.patient?.severity === 'Critical'
                            ? 'border-red-300 bg-red-50 hover:border-red-400'
                            : bed.patient?.severity === 'Serious'
                            ? 'border-orange-300 bg-orange-50 hover:border-orange-400'
                            : 'border-yellow-300 bg-yellow-50 hover:border-yellow-400'
                          : 'border-green-300 bg-green-50 hover:border-green-400'
                      }`}
                    >
                      <p className="text-gray-900 mb-1">{bed.bedNumber}</p>
                      <div className="flex items-center justify-center gap-1">
                        <span className={`size-2 rounded-full ${
                          bed.status === 'Occupied'
                            ? bed.patient?.severity === 'Critical'
                              ? 'bg-red-500'
                              : bed.patient?.severity === 'Serious'
                              ? 'bg-orange-500'
                              : 'bg-yellow-500'
                            : 'bg-green-500'
                        }`} />
                        <span className="text-xs text-gray-600">
                          {bed.status === 'Occupied' ? bed.patient?.severity : 'Available'}
                        </span>
                      </div>
                      {bed.patient?.ventilatorSupport && (
                        <div className="mt-1">
                          <Badge variant="secondary" className="text-xs">
                            <Wind className="size-3 mr-1" />
                            Ventilator
                          </Badge>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
                <div className="mt-6 flex items-center justify-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="size-3 rounded-full bg-red-500" />
                    <span className="text-gray-600">Critical</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="size-3 rounded-full bg-orange-500" />
                    <span className="text-gray-600">Serious</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="size-3 rounded-full bg-yellow-500" />
                    <span className="text-gray-600">Stable</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="size-3 rounded-full bg-green-500" />
                    <span className="text-gray-600">Available</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Patient Details */}
            <Card>
              <CardHeader>
                <CardTitle>Patient Details</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedPatient ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h3 className="text-gray-900 mb-1">{selectedPatient.patientName}</h3>
                        <p className="text-sm text-gray-600">{selectedPatient.age}Y / {selectedPatient.gender}</p>
                      </div>
                      <Badge variant={
                        selectedPatient.severity === 'Critical' ? 'destructive' :
                        selectedPatient.severity === 'Serious' ? 'default' : 'secondary'
                      }>
                        {selectedPatient.severity}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Bed Number</p>
                        <p className="text-gray-900">{selectedPatient.bedNumber}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Admission</p>
                        <p className="text-gray-900">{selectedPatient.admissionDate}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Attending Doctor</p>
                        <p className="text-gray-900">{selectedPatient.attendingDoctor}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Ventilator</p>
                        <p className="text-gray-900">{selectedPatient.ventilatorSupport ? 'Yes' : 'No'}</p>
                      </div>
                    </div>

                    <div className="p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm text-gray-500 mb-1">Condition</p>
                      <p className="text-gray-900">{selectedPatient.condition}</p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500 mb-1">Diagnosis</p>
                      <p className="text-gray-900">{selectedPatient.diagnosis}</p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500 mb-1">Treatment</p>
                      <p className="text-gray-900">{selectedPatient.treatment}</p>
                    </div>

                    {/* Vital Signs */}
                    <div className="border-t border-gray-200 pt-4">
                      <h4 className="text-gray-900 mb-3 flex items-center gap-2">
                        <Activity className="size-5 text-blue-600" />
                        Vital Signs
                      </h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-2 mb-1">
                            <HeartPulse className="size-4 text-red-600" />
                            <p className="text-xs text-gray-500">Heart Rate</p>
                          </div>
                          <p className="text-lg text-gray-900">{selectedPatient.vitals.heartRate} bpm</p>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-2 mb-1">
                            <Activity className="size-4 text-blue-600" />
                            <p className="text-xs text-gray-500">Blood Pressure</p>
                          </div>
                          <p className="text-lg text-gray-900">{selectedPatient.vitals.bloodPressure}</p>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-2 mb-1">
                            <Thermometer className="size-4 text-orange-600" />
                            <p className="text-xs text-gray-500">Temperature</p>
                          </div>
                          <p className="text-lg text-gray-900">{selectedPatient.vitals.temperature}°C</p>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-2 mb-1">
                            <Droplet className="size-4 text-cyan-600" />
                            <p className="text-xs text-gray-500">O₂ Saturation</p>
                          </div>
                          <p className="text-lg text-gray-900">{selectedPatient.vitals.oxygenSaturation}%</p>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg col-span-2">
                          <div className="flex items-center gap-2 mb-1">
                            <Wind className="size-4 text-teal-600" />
                            <p className="text-xs text-gray-500">Respiratory Rate</p>
                          </div>
                          <p className="text-lg text-gray-900">{selectedPatient.vitals.respiratoryRate} /min</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" className="flex-1">Update Vitals</Button>
                      <Button variant="outline" className="flex-1">View History</Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    Select a bed to view patient details
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* All ICU Patients List */}
          <Card>
            <CardHeader>
              <CardTitle>All ICU Patients</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-gray-700">Bed</th>
                      <th className="text-left py-3 px-4 text-gray-700">Patient</th>
                      <th className="text-left py-3 px-4 text-gray-700">Condition</th>
                      <th className="text-left py-3 px-4 text-gray-700">Severity</th>
                      <th className="text-left py-3 px-4 text-gray-700">Doctor</th>
                      <th className="text-left py-3 px-4 text-gray-700">Ventilator</th>
                      <th className="text-left py-3 px-4 text-gray-700">Heart Rate</th>
                      <th className="text-left py-3 px-4 text-gray-700">O₂ Sat</th>
                      <th className="text-left py-3 px-4 text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {patients.map((patient) => (
                      <tr key={patient.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <Badge>{patient.bedNumber}</Badge>
                        </td>
                        <td className="py-3 px-4">
                          <p className="text-gray-900">{patient.patientName}</p>
                          <p className="text-xs text-gray-500">{patient.age}Y / {patient.gender}</p>
                        </td>
                        <td className="py-3 px-4 text-gray-600">{patient.condition}</td>
                        <td className="py-3 px-4">
                          <Badge variant={
                            patient.severity === 'Critical' ? 'destructive' :
                            patient.severity === 'Serious' ? 'default' : 'secondary'
                          }>
                            {patient.severity}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-gray-600">{patient.attendingDoctor}</td>
                        <td className="py-3 px-4">
                          {patient.ventilatorSupport ? (
                            <Badge variant="secondary">
                              <Wind className="size-3 mr-1" />
                              Yes
                            </Badge>
                          ) : (
                            <span className="text-gray-500">No</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-gray-900">{patient.vitals.heartRate} bpm</td>
                        <td className="py-3 px-4">
                          <span className={patient.vitals.oxygenSaturation < 90 ? 'text-red-600' : 'text-gray-900'}>
                            {patient.vitals.oxygenSaturation}%
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedBed(patient.bedNumber)}
                          >
                            View
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="beds">
          <ICUBedsManagement />
        </TabsContent>
      </Tabs>
      </div>
    </div>
  );
}

function ICUBedsManagement() {
  const { icuBeds, loading, error, createICUBed, updateICUBed, deleteICUBed } = useICUBeds();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedICUBed, setSelectedICUBed] = useState<ICUBed | null>(null);
  const [formData, setFormData] = useState({
    icuBedNo: '',
    icuType: 'Medical',
    icuRoomNameNo: '',
    icuDescription: '',
    isVentilatorAttached: false,
    status: 'active' as ICUBed['status'],
  });

  const handleCreateICUBed = async (data: {
    icuBedNo: string;
    icuType: string;
    icuRoomNameNo: string;
    icuDescription?: string;
    isVentilatorAttached: boolean;
    status?: 'active' | 'inactive';
  }) => {
    try {
      await createICUBed(data);
    } catch (err) {
      console.error('Failed to create ICU bed:', err);
      throw err;
    }
  };

  const handleUpdateICUBed = async (id: number, data: Partial<{
    icuBedNo: string;
    icuType: string;
    icuRoomNameNo: string;
    icuDescription?: string;
    isVentilatorAttached: boolean;
    status?: 'active' | 'inactive';
  }>) => {
    try {
      await updateICUBed({ id, ...data });
    } catch (err) {
      console.error('Failed to update ICU bed:', err);
      throw err;
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this ICU bed? This action cannot be undone.')) {
      try {
        await deleteICUBed(id);
      } catch (err) {
        console.error('Failed to delete ICU bed:', err);
      }
    }
  };

  const handleAddSubmit = async () => {
    if (!formData.icuBedNo || !formData.icuRoomNameNo) {
      alert('Please fill in all required fields.');
      return;
    }
    try {
      await handleCreateICUBed({
        icuBedNo: formData.icuBedNo,
        icuType: formData.icuType,
        icuRoomNameNo: formData.icuRoomNameNo,
        icuDescription: formData.icuDescription || undefined,
        isVentilatorAttached: formData.isVentilatorAttached,
        status: formData.status,
      });
      setIsAddDialogOpen(false);
      setFormData({
        icuBedNo: '',
        icuType: 'Medical',
        icuRoomNameNo: '',
        icuDescription: '',
        isVentilatorAttached: false,
        status: 'active',
      });
    } catch (err) {
      // Error handled in parent
    }
  };

  const handleEditSubmit = async () => {
    if (!selectedICUBed) return;
    if (!formData.icuBedNo || !formData.icuRoomNameNo) {
      alert('Please fill in all required fields.');
      return;
    }
    try {
      await handleUpdateICUBed(selectedICUBed.id, {
        icuBedNo: formData.icuBedNo,
        icuType: formData.icuType,
        icuRoomNameNo: formData.icuRoomNameNo,
        icuDescription: formData.icuDescription || undefined,
        isVentilatorAttached: formData.isVentilatorAttached,
        status: formData.status,
      });
      setIsEditDialogOpen(false);
      setSelectedICUBed(null);
      setFormData({
        icuBedNo: '',
        icuType: 'Medical',
        icuRoomNameNo: '',
        icuDescription: '',
        isVentilatorAttached: false,
        status: 'active',
      });
    } catch (err) {
      // Error handled in parent
    }
  };

  const handleEdit = (icuBed: ICUBed) => {
    setSelectedICUBed(icuBed);
    setFormData({
      icuBedNo: icuBed.icuBedNo,
      icuType: icuBed.icuType,
      icuRoomNameNo: icuBed.icuRoomNameNo,
      icuDescription: icuBed.icuDescription || '',
      isVentilatorAttached: icuBed.isVentilatorAttached,
      status: icuBed.status,
    });
    setIsEditDialogOpen(true);
  };

  const getStatusBadge = (status: ICUBed['status']) => {
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
        <div className="text-center py-12 text-blue-600">Loading ICU beds...</div>
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
          <h2 className="text-blue-900 mb-2">ICU Bed Management</h2>
          <p className="text-blue-600">Manage ICU beds and their configurations</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="size-4" />
              Add ICU Bed
            </Button>
          </DialogTrigger>
          <DialogContent className="p-0 gap-0 large-dialog">
            <DialogHeader className="px-6 pt-4 pb-3 flex-shrink-0">
              <DialogTitle>Add New ICU Bed</DialogTitle>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto px-6 pb-1 patient-list-scrollable min-h-0">
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="icuBedNo">ICU Bed No</Label>
                  <Input
                    id="icuBedNo"
                    placeholder="e.g., B01"
                    value={formData.icuBedNo}
                    onChange={(e) => setFormData({ ...formData, icuBedNo: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="icuType">ICU Type</Label>
                  <select
                    id="icuType"
                    aria-label="ICU Type"
                    className="w-full px-3 py-2 border border-gray-200 rounded-md"
                    value={formData.icuType}
                    onChange={(e) => setFormData({ ...formData, icuType: e.target.value })}
                  >
                    {icuTypeOptions.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <Label htmlFor="icuRoomNameNo">ICU Room Name/No</Label>
                <Input
                  id="icuRoomNameNo"
                  placeholder="e.g., R101"
                  value={formData.icuRoomNameNo}
                  onChange={(e) => setFormData({ ...formData, icuRoomNameNo: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="icuDescription">ICU Description</Label>
                <Textarea
                  id="icuDescription"
                  placeholder="Enter ICU bed description..."
                  value={formData.icuDescription}
                  onChange={(e) => setFormData({ ...formData, icuDescription: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="isVentilatorAttached">Is Ventilator Attached</Label>
                  <select
                    id="isVentilatorAttached"
                    aria-label="Is Ventilator Attached"
                    className="w-full px-3 py-2 border border-gray-200 rounded-md"
                    value={formData.isVentilatorAttached ? 'Yes' : 'No'}
                    onChange={(e) => setFormData({ ...formData, isVentilatorAttached: e.target.value === 'Yes' })}
                  >
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <select
                    id="status"
                    aria-label="Status"
                    className="w-full px-3 py-2 border border-gray-200 rounded-md"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as ICUBed['status'] })}
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
              <Button onClick={handleAddSubmit} className="py-1">Add ICU Bed</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* ICU Beds Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HeartPulse className="size-5" />
            ICU Beds List ({icuBeds.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">ICU ID</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Bed No</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Type</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Room Name/No</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Description</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Ventilator</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Created At</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {icuBeds.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-8 text-gray-500">
                      No ICU beds found. Add a new ICU bed to get started.
                    </td>
                  </tr>
                ) : (
                  icuBeds.map((icuBed) => (
                    <tr key={icuBed.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm text-gray-900 font-mono font-medium whitespace-nowrap">{icuBed.icuId}</td>
                      <td className="py-3 px-4 text-sm text-gray-900 font-medium">{icuBed.icuBedNo}</td>
                      <td className="py-3 px-4 text-sm text-gray-700">{icuBed.icuType}</td>
                      <td className="py-3 px-4 text-sm text-gray-700">{icuBed.icuRoomNameNo}</td>
                      <td className="py-3 px-4 text-sm text-gray-700 max-w-xs truncate" title={icuBed.icuDescription}>{icuBed.icuDescription || '-'}</td>
                      <td className="py-3 px-4 text-sm text-gray-700">{icuBed.isVentilatorAttached ? 'Yes' : 'No'}</td>
                      <td className="py-3 px-4 text-sm">{getStatusBadge(icuBed.status)}</td>
                      <td className="py-3 px-4 text-sm text-gray-500">{new Date(icuBed.createdAt).toLocaleDateString()}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(icuBed)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(icuBed.id)}
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
        <DialogContent className="p-0 gap-0 large-dialog">
          <DialogHeader className="px-6 pt-4 pb-3 flex-shrink-0">
            <DialogTitle>Edit ICU Bed</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto px-6 pb-1 patient-list-scrollable min-h-0">
          <div className="space-y-4 py-4">
            {selectedICUBed && (
              <div>
                <Label>ICU ID</Label>
                <Input
                  value={selectedICUBed.icuId}
                  disabled
                  className="bg-gray-50 text-gray-500"
                />
                <p className="text-xs text-gray-500 mt-1">ICU ID is auto-generated and cannot be changed</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-icuBedNo">ICU Bed No</Label>
                <Input
                  id="edit-icuBedNo"
                  placeholder="e.g., B01"
                  value={formData.icuBedNo}
                  onChange={(e) => setFormData({ ...formData, icuBedNo: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-icuType">ICU Type</Label>
                <select
                  id="edit-icuType"
                  aria-label="ICU Type"
                  className="w-full px-3 py-2 border border-gray-200 rounded-md"
                  value={formData.icuType}
                  onChange={(e) => setFormData({ ...formData, icuType: e.target.value })}
                >
                  {icuTypeOptions.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <Label htmlFor="edit-icuRoomNameNo">ICU Room Name/No</Label>
              <Input
                id="edit-icuRoomNameNo"
                placeholder="e.g., R101"
                value={formData.icuRoomNameNo}
                onChange={(e) => setFormData({ ...formData, icuRoomNameNo: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-icuDescription">ICU Description</Label>
              <Textarea
                id="edit-icuDescription"
                placeholder="Enter ICU bed description..."
                value={formData.icuDescription}
                onChange={(e) => setFormData({ ...formData, icuDescription: e.target.value })}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-isVentilatorAttached">Is Ventilator Attached</Label>
                <select
                  id="edit-isVentilatorAttached"
                  aria-label="Is Ventilator Attached"
                  className="w-full px-3 py-2 border border-gray-200 rounded-md"
                  value={formData.isVentilatorAttached ? 'Yes' : 'No'}
                  onChange={(e) => setFormData({ ...formData, isVentilatorAttached: e.target.value === 'Yes' })}
                >
                  <option value="No">No</option>
                  <option value="Yes">Yes</option>
                </select>
              </div>
              <div>
                <Label htmlFor="edit-status">Status</Label>
                <select
                  id="edit-status"
                  aria-label="Status"
                  className="w-full px-3 py-2 border border-gray-200 rounded-md"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as ICUBed['status'] })}
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
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="py-1">Cancel</Button>
            <Button onClick={handleEditSubmit} className="py-1">Update ICU Bed</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
