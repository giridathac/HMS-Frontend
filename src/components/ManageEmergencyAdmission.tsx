import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { ArrowLeft, Plus, Edit, Trash2, Eye } from 'lucide-react';
import { useEmergencyAdmissions } from '../hooks/useEmergencyAdmissions';
import { useEmergencyBedSlots } from '../hooks/useEmergencyBedSlots';
import { useEmergencyBeds } from '../hooks/useEmergencyBeds';
import { useStaff } from '../hooks/useStaff';
import { useRoles } from '../hooks/useRoles';
import { patientsApi } from '../api/patients';
import { EmergencyAdmission, EmergencyAdmissionVitals, Patient } from '../types';
import { UpdateEmergencyAdmissionDto, emergencyAdmissionVitalsApi, CreateEmergencyAdmissionVitalsDto } from '../api/emergencyAdmissions';
import { formatDateTimeIST } from '../utils/timeUtils';

export function ManageEmergencyAdmission() {
  const [admission, setAdmission] = useState<EmergencyAdmission | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { emergencyAdmissions, updateEmergencyAdmission, fetchEmergencyAdmissions } = useEmergencyAdmissions();
  const { staff } = useStaff();
  const { roles } = useRoles();
  const { emergencyBedSlots } = useEmergencyBedSlots();
  const { emergencyBeds } = useEmergencyBeds();
  const [patients, setPatients] = useState<Patient[]>([]);
  
  // Vitals management state
  const [vitals, setVitals] = useState<EmergencyAdmissionVitals[]>([]);
  const [vitalsLoading, setVitalsLoading] = useState(false);
  const [isAddVitalsDialogOpen, setIsAddVitalsDialogOpen] = useState(false);
  const [vitalsFormData, setVitalsFormData] = useState<CreateEmergencyAdmissionVitalsDto>({
    emergencyAdmissionId: 0,
    nurseId: 0,
    recordedDateTime: new Date().toISOString().slice(0, 16),
    heartRate: undefined,
    bloodPressure: '',
    temperature: undefined,
    o2Saturation: undefined,
    respiratoryRate: undefined,
    pulseRate: undefined,
    vitalsStatus: 'Stable',
    vitalsRemarks: '',
    vitalsCreatedBy: undefined,
    status: 'Active',
  });

  const [formData, setFormData] = useState({
    doctorId: '',
    patientId: '',
    emergencyBedSlotId: '',
    emergencyAdmissionDate: '',
    emergencyStatus: 'Admitted' as EmergencyAdmission['emergencyStatus'],
    diagnosis: '',
    treatmentDetails: '',
    patientCondition: 'Stable' as EmergencyAdmission['patientCondition'],
    transferToIPDOTICU: false,
    transferTo: undefined as 'IPD Room Admission' | 'ICU' | 'OT' | undefined,
    transferDetails: '',
    status: 'Active' as EmergencyAdmission['status'],
  });

  // Filter staff to get doctors
  const doctors = useMemo(() => {
    if (!staff || !roles) return [];
    return staff
      .filter((member) => {
        if (!member.RoleId) return false;
        const role = roles.find(r => r.id === member.RoleId);
        if (!role || !role.name) return false;
        const roleNameLower = role.name.toLowerCase();
        return roleNameLower.includes('doctor') || roleNameLower.includes('surgeon');
      })
      .map((member) => ({
        id: member.UserId || 0,
        name: member.UserName || 'Unknown',
        role: roles.find(r => r.id === member.RoleId)?.name || 'Unknown',
      }));
  }, [staff, roles]);


  useEffect(() => {
    // Get emergencyAdmissionId from URL hash
    const hash = window.location.hash.slice(1);
    console.log('ManageEmergencyAdmission: useEffect triggered, hash:', hash);
    const params = new URLSearchParams(hash.split('?')[1] || '');
    const emergencyAdmissionId = params.get('emergencyAdmissionId');
    console.log('ManageEmergencyAdmission: emergencyAdmissionId:', emergencyAdmissionId);
    
    if (emergencyAdmissionId) {
      fetchAdmissionDetails(Number(emergencyAdmissionId));
      fetchVitals(Number(emergencyAdmissionId));
    } else {
      console.error('ManageEmergencyAdmission: Emergency Admission ID is missing from URL');
      setError('Emergency Admission ID is missing from URL');
      setLoading(false);
    }

    // Fetch patients
    const fetchPatients = async () => {
      try {
        const patientsData = await patientsApi.getAll();
        setPatients(patientsData);
      } catch (err) {
        console.error('Failed to fetch patients:', err);
      }
    };
    fetchPatients();
  }, []);

  // Update admission when emergencyAdmissions changes
  useEffect(() => {
    if (emergencyAdmissions.length > 0 && !admission) {
      const hash = window.location.hash.slice(1);
      const params = new URLSearchParams(hash.split('?')[1] || '');
      const emergencyAdmissionId = params.get('emergencyAdmissionId');
      if (emergencyAdmissionId) {
        const admissionData = emergencyAdmissions.find(a => a.emergencyAdmissionId === Number(emergencyAdmissionId));
        if (admissionData) {
          setAdmission(admissionData);
          setFormData({
            doctorId: admissionData.doctorId.toString(),
            patientId: admissionData.patientId,
            emergencyBedSlotId: admissionData.emergencyBedSlotId?.toString() || '',
            emergencyAdmissionDate: admissionData.emergencyAdmissionDate,
            emergencyStatus: admissionData.emergencyStatus,
            diagnosis: admissionData.diagnosis || '',
            treatmentDetails: admissionData.treatmentDetails || '',
            patientCondition: admissionData.patientCondition,
            transferToIPDOTICU: admissionData.transferToIPDOTICU,
            transferTo: admissionData.transferTo,
            transferDetails: admissionData.transferDetails || '',
            status: admissionData.status,
          });
          // Fetch vitals for this admission
          fetchVitals(Number(emergencyAdmissionId));
          setLoading(false);
        }
      }
    }
  }, [emergencyAdmissions]);

  const fetchAdmissionDetails = async (emergencyAdmissionId: number) => {
    setLoading(true);
    setError(null);
    try {
      await fetchEmergencyAdmissions();
      // The useEffect will handle setting the admission when emergencyAdmissions updates
    } catch (err) {
      console.error('Error fetching admission details:', err);
      setError('Failed to load emergency admission details');
      setLoading(false);
    }
  };

  const fetchVitals = async (emergencyAdmissionId: number) => {
    setVitalsLoading(true);
    try {
      const vitalsData = await emergencyAdmissionVitalsApi.getAll(emergencyAdmissionId);
      setVitals(vitalsData);
    } catch (err) {
      console.error('Error fetching vitals:', err);
      setVitals([]);
    } finally {
      setVitalsLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!admission) return;
    
    try {
      const updateData: UpdateEmergencyAdmissionDto = {
        doctorId: Number(formData.doctorId),
        emergencyBedSlotId: formData.emergencyBedSlotId ? Number(formData.emergencyBedSlotId) : undefined,
        emergencyAdmissionDate: formData.emergencyAdmissionDate,
        emergencyStatus: formData.emergencyStatus,
        diagnosis: formData.diagnosis || undefined,
        treatmentDetails: formData.treatmentDetails || undefined,
        patientCondition: formData.patientCondition,
        transferToIPD: formData.transferTo === 'IPD Room Admission',
        transferToOT: formData.transferTo === 'OT',
        transferToICU: formData.transferTo === 'ICU',
        transferDetails: formData.transferDetails || undefined,
        status: formData.status,
      };

      await updateEmergencyAdmission(admission.emergencyAdmissionId, updateData);
      alert('Emergency admission updated successfully!');
      // Refresh the data
      await fetchAdmissionDetails(admission.emergencyAdmissionId);
    } catch (err) {
      console.error('Error updating admission:', err);
      alert('Failed to update emergency admission. Please try again.');
    }
  };

  const handleBack = () => {
    window.location.hash = '#emergencyadmission';
  };

  const getPatientName = (admission: EmergencyAdmission): string => {
    const patient = patients.find(p => {
      const pid = (p as any).patientId || (p as any).PatientId || '';
      return pid === admission.patientId;
    });
    if (patient) {
      const patientNo = (patient as any).patientNo || (patient as any).PatientNo || '';
      const patientName = (patient as any).patientName || (patient as any).PatientName || '';
      const lastName = (patient as any).lastName || (patient as any).LastName || '';
      const fullName = `${patientName} ${lastName}`.trim();
      return `${patientNo ? `${patientNo} - ` : ''}${fullName || 'Unknown'}`;
    }
    return admission.patientName || 'Unknown';
  };

  const getDoctorName = (admission: EmergencyAdmission): string => {
    const doctor = doctors.find(d => d.id === admission.doctorId);
    if (doctor) {
      return `${doctor.name} - ${doctor.role}`;
    }
    return admission.doctorName || 'Unknown';
  };

  if (loading) {
    return (
      <div className="flex-1 bg-gray-50 flex flex-col overflow-hidden min-h-0">
        <div className="px-6 pt-6 pb-0 flex-shrink-0">
          <div className="text-center py-12 text-gray-600">Loading emergency admission details...</div>
        </div>
      </div>
    );
  }

  if (error || !admission) {
    return (
      <div className="flex-1 bg-gray-50 flex flex-col overflow-hidden min-h-0">
        <div className="px-6 pt-6 pb-0 flex-shrink-0">
          <Button variant="ghost" onClick={handleBack} className="mb-4">
            <ArrowLeft className="size-4 mr-2" />
            Back
          </Button>
          <div className="text-center py-12 text-red-500">Error: {error || 'Emergency admission not found'}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gray-50 flex flex-col overflow-hidden min-h-0">
      <div className="px-6 pt-6 pb-0 flex-shrink-0">
        <Button variant="ghost" onClick={handleBack} className="mb-4">
          <ArrowLeft className="size-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-gray-900 mb-2 text-2xl">Manage Emergency Admission</h1>
          <p className="text-gray-500 text-base">
            {getPatientName(admission)} - Admission ID: {admission.emergencyAdmissionId}
          </p>
        </div>
      </div>
      <div className="overflow-y-auto overflow-x-hidden px-6 pt-4 pb-4" style={{ maxHeight: 'calc(100vh - 150px)', minHeight: 0 }}>
        <Card className="bg-white border border-gray-200 shadow-sm rounded-lg">
          <CardContent className="p-6">
              <Tabs defaultValue="admission" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="admission">Admission Details</TabsTrigger>
                  <TabsTrigger value="vitals">Vitals</TabsTrigger>
                </TabsList>
                
                <TabsContent value="admission" className="space-y-4 py-4">
                  <div>
                    <Label htmlFor="edit-emergencyAdmissionId" className="text-gray-600">Emergency Admission ID</Label>
                    <Input
                      id="edit-emergencyAdmissionId"
                      value={admission.emergencyAdmissionId}
                      disabled
                      className="bg-gray-50 text-gray-700"
                    />
                  </div>

                  <div>
                    <Label htmlFor="edit-patientId" className="text-gray-600">Patient *</Label>
                    <Input
                      id="edit-patientId"
                      value={(() => {
                        const selectedPatient = patients.find(p => {
                          const pid = (p as any).patientId || (p as any).PatientId || '';
                          return pid === formData.patientId;
                        });
                        if (selectedPatient) {
                          const patientId = (selectedPatient as any).patientId || (selectedPatient as any).PatientId || '';
                          const patientNo = (selectedPatient as any).patientNo || (selectedPatient as any).PatientNo || '';
                          const patientName = (selectedPatient as any).patientName || (selectedPatient as any).PatientName || '';
                          const lastName = (selectedPatient as any).lastName || (selectedPatient as any).LastName || '';
                          const fullName = `${patientName} ${lastName}`.trim();
                          return `${patientNo ? `${patientNo} - ` : ''}${fullName || 'Unknown'} (ID: ${patientId.substring(0, 8)})`;
                        }
                        return `Unknown (ID: ${formData.patientId ? formData.patientId.substring(0, 8) : 'N/A'})`;
                      })()}
                      disabled
                      className="bg-gray-50 text-gray-700"
                    />
                  </div>

                  <div>
                    <Label htmlFor="edit-doctorId" className="text-gray-600">Doctor *</Label>
                    <Input
                      id="edit-doctorId"
                      value={(() => {
                        const doctor = doctors.find(d => d.id.toString() === formData.doctorId);
                        if (doctor) {
                          return `${doctor.name} - ${doctor.role}`;
                        }
                        return formData.doctorId || 'Unknown';
                      })()}
                      disabled
                      className="bg-gray-50 text-gray-700"
                    />
                  </div>

                  <div>
                    <Label htmlFor="edit-emergencyBedSlotId" className="text-gray-600">Emergency Bed Slot</Label>
                    <select
                      id="edit-emergencyBedSlotId"
                      aria-label="Emergency Bed Slot"
                      className="w-full px-3 py-2 border border-gray-200 rounded-md text-gray-700"
                      value={formData.emergencyBedSlotId}
                      onChange={(e) => setFormData({ ...formData, emergencyBedSlotId: e.target.value })}
                    >
                      <option value="">Select Emergency Bed Slot (Optional)</option>
                      {emergencyBedSlots
                        .filter(slot => slot.status === 'Active')
                        .map(slot => {
                          const bed = emergencyBeds.find(b => b.id === slot.emergencyBedId);
                          const roomNameNo = bed?.emergencyRoomNameNo || '-';
                          const bedId = bed?.emergencyBedId || '-';
                          return (
                            <option key={slot.id} value={slot.id.toString()}>
                              Slot {slot.eBedSlotNo}({roomNameNo}, Bed Id {bedId})
                            </option>
                          );
                        })}
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="edit-emergencyAdmissionDate" className="text-gray-600">Emergency Admission Date *</Label>
                    <Input
                      id="edit-emergencyAdmissionDate"
                      type="date"
                      value={formData.emergencyAdmissionDate}
                      onChange={(e) => setFormData({ ...formData, emergencyAdmissionDate: e.target.value })}
                      className="text-gray-700"
                    />
                  </div>

                  <div>
                    <Label htmlFor="edit-emergencyStatus" className="text-gray-600">Emergency Status</Label>
                    <select
                      id="edit-emergencyStatus"
                      aria-label="Emergency Status"
                      className="w-full px-3 py-2 border border-gray-200 rounded-md text-gray-700"
                      value={formData.emergencyStatus}
                      onChange={(e) => setFormData({ ...formData, emergencyStatus: e.target.value as EmergencyAdmission['emergencyStatus'] })}
                    >
                      <option value="Admitted">Admitted</option>
                      <option value="IPD">IPD</option>
                      <option value="OT">OT</option>
                      <option value="ICU">ICU</option>
                      <option value="Discharged">Discharged</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="edit-diagnosis" className="text-gray-600">Diagnosis</Label>
                    <Textarea
                      id="edit-diagnosis"
                      placeholder="Enter diagnosis..."
                      value={formData.diagnosis}
                      onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                      rows={3}
                      className="text-gray-700"
                    />
                  </div>

                  <div>
                    <Label htmlFor="edit-treatmentDetails" className="text-gray-600">Treatment Details</Label>
                    <Textarea
                      id="edit-treatmentDetails"
                      placeholder="Enter treatment details..."
                      value={formData.treatmentDetails}
                      onChange={(e) => setFormData({ ...formData, treatmentDetails: e.target.value })}
                      rows={3}
                      className="text-gray-700"
                    />
                  </div>

                  <div>
                    <Label htmlFor="edit-patientCondition" className="text-gray-600">Patient Condition</Label>
                    <select
                      id="edit-patientCondition"
                      aria-label="Patient Condition"
                      className="w-full px-3 py-2 border border-gray-200 rounded-md text-gray-700"
                      value={formData.patientCondition}
                      onChange={(e) => setFormData({ ...formData, patientCondition: e.target.value as EmergencyAdmission['patientCondition'] })}
                    >
                      <option value="Stable">Stable</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="edit-transferToIPDOTICU"
                      aria-label="Transfer To IPD/OT/ICU"
                      checked={formData.transferToIPDOTICU}
                      onChange={(e) => setFormData({ ...formData, transferToIPDOTICU: e.target.checked, transferTo: e.target.checked ? formData.transferTo : undefined })}
                      className="rounded"
                    />
                    <Label htmlFor="edit-transferToIPDOTICU" className="cursor-pointer">Transfer To IPD/OT/ICU</Label>
                  </div>

                  {formData.transferToIPDOTICU && (
                    <>
                    <div>
                      <Label htmlFor="edit-transferTo" className="text-gray-600">Transfer To *</Label>
                      <select
                        id="edit-transferTo"
                        aria-label="Transfer To"
                        className="w-full px-3 py-2 border border-gray-200 rounded-md text-gray-700"
                        value={formData.transferTo || ''}
                        onChange={(e) => setFormData({ ...formData, transferTo: e.target.value as 'IPD Room Admission' | 'ICU' | 'OT' })}
                      >
                        <option value="">Select Transfer Destination</option>
                        <option value="IPD Room Admission">IPD Room Admission</option>
                        <option value="ICU">ICU</option>
                        <option value="OT">OT</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="edit-transferDetails" className="text-gray-600">Transfer Details</Label>
                      <Textarea
                        id="edit-transferDetails"
                        placeholder="Enter transfer details..."
                        value={formData.transferDetails}
                        onChange={(e) => setFormData({ ...formData, transferDetails: e.target.value })}
                        rows={2}
                        className="text-gray-700"
                      />
                    </div>
                  </>
                )}

                <div>
                  <Label htmlFor="edit-status" className="text-gray-600">Status</Label>
                  <select
                    id="edit-status"
                    aria-label="Status"
                    className="w-full px-3 py-2 border border-gray-200 rounded-md text-gray-700"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as EmergencyAdmission['status'] })}
                  >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>

                  {/* Latest Vitals Record */}
                  {(() => {
                    const latestVital = vitals.length > 0 
                      ? vitals.reduce((latest, current) => {
                          const latestDate = new Date(latest.recordedDateTime);
                          const currentDate = new Date(current.recordedDateTime);
                          return currentDate > latestDate ? current : latest;
                        })
                      : null;

                    if (latestVital) {
                      return (
                        <div className="mt-6 pt-6 border-t border-gray-200">
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">Latest Vitals Record</h3>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {latestVital.heartRate !== undefined && (
                              <div>
                                <Label className="text-xs text-gray-500">Heart Rate</Label>
                                <div className="text-sm font-medium text-gray-900">{latestVital.heartRate} bpm</div>
                              </div>
                            )}
                            {latestVital.bloodPressure && (
                              <div>
                                <Label className="text-xs text-gray-500">Blood Pressure</Label>
                                <div className="text-sm font-medium text-gray-900">{latestVital.bloodPressure}</div>
                              </div>
                            )}
                            {latestVital.temperature !== undefined && (
                              <div>
                                <Label className="text-xs text-gray-500">Temperature</Label>
                                <div className="text-sm font-medium text-gray-900">{latestVital.temperature}°C</div>
                              </div>
                            )}
                            {latestVital.o2Saturation !== undefined && (
                              <div>
                                <Label className="text-xs text-gray-500">O2 Saturation</Label>
                                <div className="text-sm font-medium text-gray-900">{latestVital.o2Saturation}%</div>
                              </div>
                            )}
                            {latestVital.respiratoryRate !== undefined && (
                              <div>
                                <Label className="text-xs text-gray-500">Respiratory Rate</Label>
                                <div className="text-sm font-medium text-gray-900">{latestVital.respiratoryRate}</div>
                              </div>
                            )}
                            {latestVital.pulseRate !== undefined && (
                              <div>
                                <Label className="text-xs text-gray-500">Pulse Rate</Label>
                                <div className="text-sm font-medium text-gray-900">{latestVital.pulseRate} bpm</div>
                              </div>
                            )}
                          </div>
                          <div className="mt-4 flex items-center gap-4">
                            <div>
                              <Label className="text-xs text-gray-500">Vitals Status</Label>
                              <div className="mt-1">
                                <Badge variant={latestVital.vitalsStatus === 'Critical' ? 'destructive' : 'default'}>
                                  {latestVital.vitalsStatus}
                                </Badge>
                              </div>
                            </div>
                            <div>
                              <Label className="text-xs text-gray-500">Recorded Date/Time</Label>
                              <div className="text-sm font-medium text-gray-900">
                                {formatDateTimeIST(latestVital.recordedDateTime)}
                              </div>
                            </div>
                            {latestVital.nurseName && (
                              <div>
                                <Label className="text-xs text-gray-500">Recorded By</Label>
                                <div className="text-sm font-medium text-gray-900">{latestVital.nurseName}</div>
                              </div>
                            )}
                          </div>
                          {latestVital.vitalsRemarks && (
                            <div className="mt-4">
                              <Label className="text-xs text-gray-500">Remarks</Label>
                              <div className="text-sm text-gray-700 mt-1">{latestVital.vitalsRemarks}</div>
                            </div>
                          )}
                        </div>
                      );
                    }
                    return null;
                  })()}

                  <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={handleBack}>Cancel</Button>
                    <Button onClick={handleUpdate}>Update Emergency Admission</Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="vitals" className="space-y-4 py-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Vitals Records</h3>
                    <Button 
                      onClick={() => {
                        if (admission) {
                          setVitalsFormData({
                            emergencyAdmissionId: admission.emergencyAdmissionId,
                            nurseId: 0,
                            recordedDateTime: new Date().toISOString().slice(0, 16),
                            heartRate: undefined,
                            bloodPressure: '',
                            temperature: undefined,
                            o2Saturation: undefined,
                            respiratoryRate: undefined,
                            pulseRate: undefined,
                            vitalsStatus: 'Stable',
                            vitalsRemarks: '',
                            vitalsCreatedBy: undefined,
                            status: 'Active',
                          });
                          setIsAddVitalsDialogOpen(true);
                        }
                      }}
                      className="flex items-center gap-2"
                    >
                      <Plus className="size-4" />
                      Add Vitals
                    </Button>
                  </div>
                  
                  {vitalsLoading ? (
                    <div className="text-center py-8 text-gray-500">Loading vitals...</div>
                  ) : vitals.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">No vitals records found. Click "Add Vitals" to create one.</div>
                  ) : (
                    <div className="space-y-2">
                      {vitals.map((vital) => (
                        <Card key={vital.emergencyAdmissionVitalsId} className="p-4 bg-gray-50">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant={vital.vitalsStatus === 'Critical' ? 'destructive' : 'default'}>
                                  {vital.vitalsStatus}
                                </Badge>
                                <span className="text-sm text-gray-600">
                                  {formatDateTimeIST(vital.recordedDateTime)}
                                </span>
                                {vital.nurseName && (
                                  <span className="text-sm text-gray-500">by {vital.nurseName}</span>
                                )}
                              </div>
                              <div className="grid grid-cols-3 gap-2 text-sm">
                                {vital.heartRate !== undefined && (
                                  <div><span className="text-gray-600">HR:</span> {vital.heartRate} bpm</div>
                                )}
                                {vital.bloodPressure && (
                                  <div><span className="text-gray-600">BP:</span> {vital.bloodPressure}</div>
                                )}
                                {vital.temperature !== undefined && (
                                  <div><span className="text-gray-600">Temp:</span> {vital.temperature}°C</div>
                                )}
                                {vital.o2Saturation !== undefined && (
                                  <div><span className="text-gray-600">O2 Sat:</span> {vital.o2Saturation}%</div>
                                )}
                                {vital.respiratoryRate !== undefined && (
                                  <div><span className="text-gray-600">RR:</span> {vital.respiratoryRate}</div>
                                )}
                                {vital.pulseRate !== undefined && (
                                  <div><span className="text-gray-600">Pulse:</span> {vital.pulseRate} bpm</div>
                                )}
                              </div>
                              {vital.vitalsRemarks && (
                                <div className="mt-2 text-sm text-gray-600">
                                  <span className="font-medium">Remarks:</span> {vital.vitalsRemarks}
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  window.location.hash = `#manageemergencyadmissionvitals?emergencyAdmissionId=${admission.emergencyAdmissionId}&vitalsId=${vital.emergencyAdmissionVitalsId}`;
                                }}
                                className="h-8 w-8 p-0"
                              >
                                <Eye className="size-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  window.location.hash = `#manageemergencyadmissionvitals?emergencyAdmissionId=${admission.emergencyAdmissionId}&vitalsId=${vital.emergencyAdmissionVitalsId}`;
                                }}
                                className="h-8 w-8 p-0"
                              >
                                <Edit className="size-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={async () => {
                                  if (confirm('Are you sure you want to delete this vitals record?')) {
                                    try {
                                      await emergencyAdmissionVitalsApi.delete(admission.emergencyAdmissionId, vital.emergencyAdmissionVitalsId);
                                      await fetchVitals(admission.emergencyAdmissionId);
                                    } catch (err) {
                                      console.error('Error deleting vitals:', err);
                                      alert('Failed to delete vitals record. Please try again.');
                                    }
                                  }
                                }}
                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="size-4" />
                              </Button>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
      </div>

      {/* Add Vitals Dialog */}
      <Dialog open={isAddVitalsDialogOpen} onOpenChange={setIsAddVitalsDialogOpen}>
        <DialogContent className="p-0 gap-0 large-dialog max-h-[90vh] bg-white">
          <DialogHeader className="px-6 pt-4 pb-3 flex-shrink-0 bg-white">
            <DialogTitle className="text-gray-700">Add Vitals Record</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto px-6 pb-1 patient-list-scrollable min-h-0 bg-white">
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="add-nurseId" className="text-gray-600">Nurse *</Label>
                <select
                  id="add-nurseId"
                  aria-label="Nurse"
                  className="w-full px-3 py-2 border border-gray-200 rounded-md text-gray-700"
                  value={vitalsFormData.nurseId}
                  onChange={(e) => setVitalsFormData({ ...vitalsFormData, nurseId: Number(e.target.value) })}
                >
                  <option value="0">Select Nurse</option>
                  {staff
                    .filter(s => {
                      if (!s.RoleId) return false;
                      const role = roles.find(r => r.id === s.RoleId);
                      return role?.name?.toLowerCase().includes('nurse');
                    })
                    .map(nurse => {
                      const role = roles.find(r => r.id === nurse.RoleId);
                      return (
                        <option key={nurse.UserId} value={nurse.UserId}>
                          {nurse.UserName} - {role?.name || ''}
                        </option>
                      );
                    })}
                </select>
              </div>
              
              <div>
                <Label htmlFor="add-recordedDateTime" className="text-gray-600">Recorded Date & Time *</Label>
                <Input
                  id="add-recordedDateTime"
                  type="datetime-local"
                  value={vitalsFormData.recordedDateTime}
                  onChange={(e) => setVitalsFormData({ ...vitalsFormData, recordedDateTime: e.target.value })}
                  className="text-gray-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="add-heartRate" className="text-gray-600">Heart Rate (bpm)</Label>
                  <Input
                    id="add-heartRate"
                    type="number"
                    placeholder="e.g., 72"
                    value={vitalsFormData.heartRate || ''}
                    onChange={(e) => setVitalsFormData({ ...vitalsFormData, heartRate: e.target.value ? Number(e.target.value) : undefined })}
                    className="text-gray-700"
                  />
                </div>
                <div>
                  <Label htmlFor="add-bloodPressure" className="text-gray-600">Blood Pressure</Label>
                  <Input
                    id="add-bloodPressure"
                    placeholder="e.g., 120/80"
                    value={vitalsFormData.bloodPressure}
                    onChange={(e) => setVitalsFormData({ ...vitalsFormData, bloodPressure: e.target.value })}
                    className="text-gray-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="add-temperature" className="text-gray-600">Temperature (°C)</Label>
                  <Input
                    id="add-temperature"
                    type="number"
                    step="0.1"
                    placeholder="e.g., 36.5"
                    value={vitalsFormData.temperature || ''}
                    onChange={(e) => setVitalsFormData({ ...vitalsFormData, temperature: e.target.value ? Number(e.target.value) : undefined })}
                    className="text-gray-700"
                  />
                </div>
                <div>
                  <Label htmlFor="add-o2Saturation" className="text-gray-600">O2 Saturation (%)</Label>
                  <Input
                    id="add-o2Saturation"
                    type="number"
                    placeholder="e.g., 98"
                    value={vitalsFormData.o2Saturation || ''}
                    onChange={(e) => setVitalsFormData({ ...vitalsFormData, o2Saturation: e.target.value ? Number(e.target.value) : undefined })}
                    className="text-gray-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="add-respiratoryRate" className="text-gray-600">Respiratory Rate</Label>
                  <Input
                    id="add-respiratoryRate"
                    type="number"
                    placeholder="e.g., 16"
                    value={vitalsFormData.respiratoryRate || ''}
                    onChange={(e) => setVitalsFormData({ ...vitalsFormData, respiratoryRate: e.target.value ? Number(e.target.value) : undefined })}
                    className="text-gray-700"
                  />
                </div>
                <div>
                  <Label htmlFor="add-pulseRate" className="text-gray-600">Pulse Rate (bpm)</Label>
                  <Input
                    id="add-pulseRate"
                    type="number"
                    placeholder="e.g., 72"
                    value={vitalsFormData.pulseRate || ''}
                    onChange={(e) => setVitalsFormData({ ...vitalsFormData, pulseRate: e.target.value ? Number(e.target.value) : undefined })}
                    className="text-gray-700"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="add-vitalsStatus" className="text-gray-600">Vitals Status *</Label>
                <select
                  id="add-vitalsStatus"
                  aria-label="Vitals Status"
                  className="w-full px-3 py-2 border border-gray-200 rounded-md text-gray-700"
                  value={vitalsFormData.vitalsStatus}
                  onChange={(e) => setVitalsFormData({ ...vitalsFormData, vitalsStatus: e.target.value as 'Critical' | 'Stable' })}
                >
                  <option value="Stable">Stable</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>

              <div>
                <Label htmlFor="add-vitalsRemarks" className="text-gray-600">Remarks</Label>
                <Textarea
                  id="add-vitalsRemarks"
                  placeholder="Enter any remarks or notes..."
                  value={vitalsFormData.vitalsRemarks}
                  onChange={(e) => setVitalsFormData({ ...vitalsFormData, vitalsRemarks: e.target.value })}
                  rows={3}
                  className="text-gray-700"
                />
              </div>

              <div>
                <Label htmlFor="add-vitalsCreatedBy" className="text-gray-600">Created By</Label>
                <select
                  id="add-vitalsCreatedBy"
                  aria-label="Created By"
                  className="w-full px-3 py-2 border border-gray-200 rounded-md text-gray-700"
                  value={vitalsFormData.vitalsCreatedBy || 0}
                  onChange={(e) => setVitalsFormData({ ...vitalsFormData, vitalsCreatedBy: e.target.value ? Number(e.target.value) : undefined })}
                >
                  <option value="0">Select User</option>
                  {staff.map(user => {
                    const role = roles.find(r => r.id === user.RoleId);
                    return (
                      <option key={user.UserId} value={user.UserId}>
                        {user.UserName} - {role?.name || ''}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <Label htmlFor="add-vitalsStatus-field" className="text-gray-600">Status</Label>
                <select
                  id="add-vitalsStatus-field"
                  aria-label="Status"
                  className="w-full px-3 py-2 border border-gray-200 rounded-md text-gray-700"
                  value={vitalsFormData.status || 'Active'}
                  onChange={(e) => setVitalsFormData({ ...vitalsFormData, status: e.target.value })}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 px-6 py-2 border-t bg-white flex-shrink-0">
            <Button variant="outline" onClick={() => setIsAddVitalsDialogOpen(false)}>Cancel</Button>
            <Button onClick={async () => {
              if (!vitalsFormData.nurseId || !vitalsFormData.recordedDateTime) {
                alert('Please fill in all required fields (Nurse, Recorded Date & Time).');
                return;
              }
              try {
                if (admission) {
                  await emergencyAdmissionVitalsApi.create(admission.emergencyAdmissionId, vitalsFormData);
                  await fetchVitals(admission.emergencyAdmissionId);
                  setIsAddVitalsDialogOpen(false);
                  setVitalsFormData({
                    emergencyAdmissionId: 0,
                    nurseId: 0,
                    recordedDateTime: new Date().toISOString().slice(0, 16),
                    heartRate: undefined,
                    bloodPressure: '',
                    temperature: undefined,
                    o2Saturation: undefined,
                    respiratoryRate: undefined,
                    pulseRate: undefined,
                    vitalsStatus: 'Stable',
                    vitalsRemarks: '',
                    vitalsCreatedBy: undefined,
                    status: 'Active',
                  });
                }
              } catch (err) {
                console.error('Error creating vitals:', err);
                alert('Failed to create vitals record. Please try again.');
              }
            }}>Create Vitals Record</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
