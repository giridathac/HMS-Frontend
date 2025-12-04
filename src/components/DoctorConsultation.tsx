import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { UserCheck, FileText, TestTube, Pill, BedDouble, Clock } from 'lucide-react';

interface Patient {
  tokenNumber: string;
  name: string;
  age: number;
  gender: string;
  phone: string;
  complaint: string;
}

interface Consultation {
  patientId: string;
  diagnosis: string;
  labTests: string[];
  medicines: { name: string; dosage: string; duration: string }[];
  followUp: string;
  admitAsIPD: boolean;
  roomType?: string;
}

const waitingQueue: Patient[] = [
  { tokenNumber: 'SJ-003', name: 'Robert Brown', age: 45, gender: 'Male', phone: '555-0103', complaint: 'Chest pain' },
  { tokenNumber: 'SJ-004', name: 'Mary Johnson', age: 38, gender: 'Female', phone: '555-0106', complaint: 'Irregular heartbeat' },
  { tokenNumber: 'SJ-005', name: 'James Wilson', age: 52, gender: 'Male', phone: '555-0107', complaint: 'Hypertension follow-up' },
];

const consultingPatient: Patient = {
  tokenNumber: 'SJ-002',
  name: 'Emma Wilson',
  age: 32,
  gender: 'Female',
  phone: '555-0102',
  complaint: 'Heart palpitations'
};

export function DoctorConsultation() {
  const [currentPatient, setCurrentPatient] = useState<Patient | null>(consultingPatient);
  const [queue, setQueue] = useState<Patient[]>(waitingQueue);
  const [showPrescriptionDialog, setShowPrescriptionDialog] = useState(false);
  
  // Consultation form states
  const [diagnosis, setDiagnosis] = useState('');
  const [labTests, setLabTests] = useState<string[]>([]);
  const [medicines, setMedicines] = useState<{ name: string; dosage: string; duration: string }[]>([]);
  const [followUp, setFollowUp] = useState('');
  const [admitAsIPD, setAdmitAsIPD] = useState(false);
  const [roomType, setRoomType] = useState('');
  const [newLabTest, setNewLabTest] = useState('');
  const [newMedicine, setNewMedicine] = useState({ name: '', dosage: '', duration: '' });

  const commonLabTests = ['Blood Test (CBC)', 'ECG', 'X-Ray', 'Ultrasound', 'MRI', 'CT Scan', 'Urine Test', 'Blood Sugar', 'Lipid Profile', 'Thyroid Test'];
  
  const addLabTest = (test: string) => {
    if (test && !labTests.includes(test)) {
      setLabTests([...labTests, test]);
    }
  };

  const addMedicine = () => {
    if (newMedicine.name && newMedicine.dosage && newMedicine.duration) {
      setMedicines([...medicines, newMedicine]);
      setNewMedicine({ name: '', dosage: '', duration: '' });
    }
  };

  const completeConsultation = () => {
    if (!diagnosis) {
      alert('Please enter diagnosis');
      return;
    }

    if (admitAsIPD && !roomType) {
      alert('Please select room type for IPD admission');
      return;
    }

    setShowPrescriptionDialog(true);
  };

  const callNextPatient = () => {
    if (queue.length > 0) {
      const [nextPatient, ...remainingQueue] = queue;
      setCurrentPatient(nextPatient);
      setQueue(remainingQueue);
      
      // Reset form
      setDiagnosis('');
      setLabTests([]);
      setMedicines([]);
      setFollowUp('');
      setAdmitAsIPD(false);
      setRoomType('');
      setShowPrescriptionDialog(false);
    } else {
      setCurrentPatient(null);
      alert('No more patients in queue');
    }
  };

  return (
    <div className="p-8 bg-blue-100 min-h-full">
      <div className="mb-8">
        <h1 className="text-blue-900 mb-2">Doctor Consultation - Dr. Sarah Johnson</h1>
        <p className="text-gray-500">Cardiology Department</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Current Patient */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="size-5 text-blue-600" />
              Current Patient
            </CardTitle>
          </CardHeader>
          <CardContent>
            {currentPatient ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <Badge className="text-lg">{currentPatient.tokenNumber}</Badge>
                      <h3 className="text-gray-900">{currentPatient.name}</h3>
                    </div>
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Age</p>
                        <p className="text-gray-900">{currentPatient.age}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Gender</p>
                        <p className="text-gray-900">{currentPatient.gender}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Phone</p>
                        <p className="text-gray-900">{currentPatient.phone}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">Chief Complaint</p>
                  <p className="text-gray-900">{currentPatient.complaint}</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                No patient currently consulting
              </div>
            )}
          </CardContent>
        </Card>

        {/* Waiting Queue */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="size-5 text-orange-600" />
              Waiting Queue ({queue.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {queue.map((patient, index) => (
                <div key={patient.tokenNumber} className="p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-gray-500">#{index + 1}</span>
                    <Badge variant="outline">{patient.tokenNumber}</Badge>
                  </div>
                  <p className="text-sm text-gray-900">{patient.name}</p>
                  <p className="text-xs text-gray-500">{patient.complaint}</p>
                </div>
              ))}
              {queue.length === 0 && (
                <div className="text-center py-8 text-gray-500 text-sm">
                  No patients waiting
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Consultation Form */}
      {currentPatient && (
        <Card>
          <CardHeader>
            <CardTitle>Consultation Details</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="diagnosis" className="space-y-6">
              <TabsList className="grid grid-cols-4 w-full">
                <TabsTrigger value="diagnosis">Diagnosis</TabsTrigger>
                <TabsTrigger value="labtests">Lab Tests</TabsTrigger>
                <TabsTrigger value="medicines">Medicines</TabsTrigger>
                <TabsTrigger value="followup">Follow-up & Admission</TabsTrigger>
              </TabsList>

              <TabsContent value="diagnosis" className="space-y-4">
                <div>
                  <Label htmlFor="diagnosis">Diagnosis</Label>
                  <Textarea
                    id="diagnosis"
                    placeholder="Enter diagnosis details..."
                    value={diagnosis}
                    onChange={(e) => setDiagnosis(e.target.value)}
                    rows={4}
                  />
                </div>
              </TabsContent>

              <TabsContent value="labtests" className="space-y-4">
                <div>
                  <Label>Prescribed Lab Tests</Label>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {labTests.map((test, index) => (
                      <Badge key={index} variant="secondary" className="gap-2">
                        {test}
                        <button onClick={() => setLabTests(labTests.filter((_, i) => i !== index))}>×</button>
                      </Badge>
                    ))}
                  </div>
                  <Label>Select Common Tests</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {commonLabTests.map((test) => (
                      <Button
                        key={test}
                        variant="outline"
                        size="sm"
                        onClick={() => addLabTest(test)}
                        disabled={labTests.includes(test)}
                      >
                        <TestTube className="size-4 mr-2" />
                        {test}
                      </Button>
                    ))}
                  </div>
                  <div className="mt-4">
                    <Label htmlFor="customTest">Or Add Custom Test</Label>
                    <div className="flex gap-2">
                      <Input
                        id="customTest"
                        placeholder="Enter test name"
                        value={newLabTest}
                        onChange={(e) => setNewLabTest(e.target.value)}
                      />
                      <Button onClick={() => { addLabTest(newLabTest); setNewLabTest(''); }}>Add</Button>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="medicines" className="space-y-4">
                <div>
                  <Label>Prescribed Medicines</Label>
                  {medicines.length > 0 && (
                    <div className="mb-4 border border-gray-200 rounded-lg overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="text-left py-2 px-4 text-sm text-gray-700">Medicine</th>
                            <th className="text-left py-2 px-4 text-sm text-gray-700">Dosage</th>
                            <th className="text-left py-2 px-4 text-sm text-gray-700">Duration</th>
                            <th className="text-left py-2 px-4 text-sm text-gray-700">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {medicines.map((med, index) => (
                            <tr key={index} className="border-t border-gray-100">
                              <td className="py-2 px-4 text-sm">{med.name}</td>
                              <td className="py-2 px-4 text-sm">{med.dosage}</td>
                              <td className="py-2 px-4 text-sm">{med.duration}</td>
                              <td className="py-2 px-4">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setMedicines(medicines.filter((_, i) => i !== index))}
                                >
                                  Remove
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div>
                      <Label htmlFor="medName">Medicine Name</Label>
                      <Input
                        id="medName"
                        placeholder="Medicine name"
                        value={newMedicine.name}
                        onChange={(e) => setNewMedicine({ ...newMedicine, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="dosage">Dosage</Label>
                      <Input
                        id="dosage"
                        placeholder="e.g., 1-0-1"
                        value={newMedicine.dosage}
                        onChange={(e) => setNewMedicine({ ...newMedicine, dosage: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="duration">Duration</Label>
                      <Input
                        id="duration"
                        placeholder="e.g., 7 days"
                        value={newMedicine.duration}
                        onChange={(e) => setNewMedicine({ ...newMedicine, duration: e.target.value })}
                      />
                    </div>
                  </div>
                  <Button onClick={addMedicine}>
                    <Pill className="size-4 mr-2" />
                    Add Medicine
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="followup" className="space-y-4">
                <div>
                  <Label htmlFor="followup">Follow-up Instructions</Label>
                  <Textarea
                    id="followup"
                    placeholder="Enter follow-up instructions (e.g., Next visit after 1 week)"
                    value={followUp}
                    onChange={(e) => setFollowUp(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <div className="flex items-center gap-3 mb-4">
                    <input
                      type="checkbox"
                      id="admitIPD"
                      aria-label="Admit to IPD"
                      checked={admitAsIPD}
                      onChange={(e) => setAdmitAsIPD(e.target.checked)}
                      className="size-4"
                    />
                    <Label htmlFor="admitIPD" className="text-lg flex items-center gap-2">
                      <BedDouble className="size-5 text-purple-600" />
                      Admit as In-Patient (IPD)
                    </Label>
                  </div>

                  {admitAsIPD && (
                    <div className="ml-7 space-y-3">
                      <Label>Select Room Type</Label>
                      <div className="grid grid-cols-3 gap-4">
                        <button
                          onClick={() => setRoomType('Regular Ward')}
                          className={`p-4 border-2 rounded-lg text-center transition-colors ${
                            roomType === 'Regular Ward'
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <p className="text-gray-900">Regular Ward</p>
                          <p className="text-sm text-gray-500">₹1,000/day</p>
                        </button>
                        <button
                          onClick={() => setRoomType('Special Shared Room')}
                          className={`p-4 border-2 rounded-lg text-center transition-colors ${
                            roomType === 'Special Shared Room'
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <p className="text-gray-900">Special Shared</p>
                          <p className="text-sm text-gray-500">₹2,500/day</p>
                        </button>
                        <button
                          onClick={() => setRoomType('Special Room')}
                          className={`p-4 border-2 rounded-lg text-center transition-colors ${
                            roomType === 'Special Room'
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <p className="text-gray-900">Special Room</p>
                          <p className="text-sm text-gray-500">₹5,000/day</p>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end gap-4 mt-6 pt-6 border-t border-gray-200">
              <Button variant="outline" onClick={() => setCurrentPatient(null)}>
                Cancel
              </Button>
              <Button onClick={completeConsultation} className="gap-2">
                <FileText className="size-4" />
                Complete Consultation
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Prescription Summary Dialog */}
      <Dialog open={showPrescriptionDialog} onOpenChange={setShowPrescriptionDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Consultation Summary</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-500">Patient</p>
              <p className="text-gray-900">{currentPatient?.name} ({currentPatient?.tokenNumber})</p>
            </div>

            {diagnosis && (
              <div>
                <p className="text-sm text-gray-500 mb-1">Diagnosis</p>
                <p className="text-gray-900">{diagnosis}</p>
              </div>
            )}

            {labTests.length > 0 && (
              <div>
                <p className="text-sm text-gray-500 mb-2">Lab Tests Prescribed</p>
                <div className="flex flex-wrap gap-2">
                  {labTests.map((test, i) => (
                    <Badge key={i} variant="secondary">{test}</Badge>
                  ))}
                </div>
              </div>
            )}

            {medicines.length > 0 && (
              <div>
                <p className="text-sm text-gray-500 mb-2">Medicines Prescribed</p>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left py-2 px-4">Medicine</th>
                        <th className="text-left py-2 px-4">Dosage</th>
                        <th className="text-left py-2 px-4">Duration</th>
                      </tr>
                    </thead>
                    <tbody>
                      {medicines.map((med, i) => (
                        <tr key={i} className="border-t border-gray-100">
                          <td className="py-2 px-4">{med.name}</td>
                          <td className="py-2 px-4">{med.dosage}</td>
                          <td className="py-2 px-4">{med.duration}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {followUp && (
              <div>
                <p className="text-sm text-gray-500 mb-1">Follow-up Instructions</p>
                <p className="text-gray-900">{followUp}</p>
              </div>
            )}

            {admitAsIPD && (
              <div className="p-4 bg-purple-50 rounded-lg border-2 border-purple-200">
                <p className="text-purple-900">✓ Patient will be admitted as In-Patient</p>
                <p className="text-sm text-purple-700">Room Type: {roomType}</p>
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowPrescriptionDialog(false)}>
              Edit
            </Button>
            <Button onClick={callNextPatient}>
              Confirm & Call Next Patient
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
