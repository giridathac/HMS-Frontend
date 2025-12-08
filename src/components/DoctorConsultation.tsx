import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Search, Clock, Stethoscope, CheckCircle2, Hospital, Eye, Edit } from 'lucide-react';
import { usePatientAppointments } from '../hooks/usePatientAppointments';
import { useStaff } from '../hooks/useStaff';
import { useRoles } from '../hooks/useRoles';
import { useDepartments } from '../hooks/useDepartments';
import { patientsApi } from '../api/patients';
import { PatientAppointment, Patient, Doctor } from '../types';

export function DoctorConsultation() {
  const { patientAppointments, loading, error, updatePatientAppointment, fetchPatientAppointments } = usePatientAppointments();
  const { staff } = useStaff();
  const { roles } = useRoles();
  const { departments } = useDepartments();
  const [searchTerm, setSearchTerm] = useState('');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<PatientAppointment | null>(null);
  const [editFormData, setEditFormData] = useState({
    patientId: '',
    doctorId: '',
    appointmentStatus: 'Waiting' as PatientAppointment['appointmentStatus'],
    consultationCharge: 0,
    diagnosis: '',
    followUpDetails: '',
    prescriptionsUrl: '',
    toBeAdmitted: false,
    referToAnotherDoctor: false,
    referredDoctorId: '',
    transferToIPDOTICU: false,
    transferTo: undefined as 'IPD Room Admission' | 'ICU' | 'OT' | undefined,
    transferDetails: '',
    billId: '',
  });

  // Filter to show only doctors and surgeons from staff
  const appointmentDoctors = useMemo(() => {
    if (!staff || !roles || !departments) return [];
    
    return staff
      .filter((member) => {
        if (!member.RoleId) return false;
        const role = roles.find(r => r.id === member.RoleId);
        if (!role || !role.name) return false;
        const roleNameLower = role.name.toLowerCase();
        return roleNameLower.includes('doctor') || roleNameLower.includes('surgeon');
      })
      .map((member) => {
        const department = member.DoctorDepartmentId 
          ? departments.find(d => 
              d.id.toString() === member.DoctorDepartmentId || 
              d.id === Number(member.DoctorDepartmentId)
            )
          : null;
        
        return {
          id: member.UserId || 0,
          name: member.UserName || 'Unknown',
          specialty: department?.name || 'General',
          type: member.DoctorType === 'INHOUSE' ? 'inhouse' as const : 'consulting' as const,
        } as Doctor;
      });
  }, [staff, roles, departments]);

  // Fetch patients
  useEffect(() => {
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

  const filteredAppointments = patientAppointments.filter(appointment => {
    const patient = patients.find(p => 
      (p as any).patientId === appointment.patientId || 
      (p as any).PatientId === appointment.patientId
    );
    const patientName = patient 
      ? `${(patient as any).patientName || (patient as any).PatientName || ''} ${(patient as any).lastName || (patient as any).LastName || ''}`.trim() 
      : appointment.patientId === '00000000-0000-0000-0000-000000000001' 
        ? 'Dummy Patient Name' 
        : appointment.patientId;
    const doctor = appointmentDoctors.find(d => d.id.toString() === appointment.doctorId);
    const doctorName = doctor ? doctor.name : appointment.doctorId;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      patientName.toLowerCase().includes(searchLower) ||
      doctorName.toLowerCase().includes(searchLower) ||
      (appointment.diagnosis || '').toLowerCase().includes(searchLower)
    );
  });

  const getAppointmentsByStatus = (status: PatientAppointment['appointmentStatus']) => {
    return filteredAppointments.filter(a => a.appointmentStatus === status);
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center py-12 text-gray-500">Loading appointments...</div>
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
    <div className="px-4 pt-4 pb-4 bg-blue-100 h-screen flex flex-col overflow-hidden">
      <div className="flex-shrink-0">
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
          <div>
            <h1 className="text-gray-900 mb-0 text-xl">Doctor Consultation</h1>
            <p className="text-gray-500 text-sm">Manage patient consultations</p>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto overflow-x-hidden doctorconsultation-scrollable min-h-0">
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Total Appointments</p>
                    <h3 className="text-gray-900">{patientAppointments.length}</h3>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Waiting</p>
                    <h3 className="text-gray-900">{getAppointmentsByStatus('Waiting').length}</h3>
                  </div>
                  <div className="size-8 bg-yellow-100 rounded-full flex items-center justify-center">
                    <span className="text-yellow-700">⏳</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Consulting</p>
                    <h3 className="text-gray-900">{getAppointmentsByStatus('Consulting').length}</h3>
                  </div>
                  <div className="size-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-700">👨‍⚕️</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Completed</p>
                    <h3 className="text-gray-900">{getAppointmentsByStatus('Completed').length}</h3>
                  </div>
                  <div className="size-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-700">✓</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                <Input
                  placeholder="Search by patient, doctor, or diagnosis..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Appointments by Status */}
          <Tabs defaultValue="all" className="space-y-6">
            <TabsList>
              <TabsTrigger value="all">All Appointments ({patientAppointments.length})</TabsTrigger>
              <TabsTrigger value="waiting">Waiting ({getAppointmentsByStatus('Waiting').length})</TabsTrigger>
              <TabsTrigger value="consulting">Consulting ({getAppointmentsByStatus('Consulting').length})</TabsTrigger>
              <TabsTrigger value="completed">Completed ({getAppointmentsByStatus('Completed').length})</TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              <AppointmentList 
                appointments={patientAppointments} 
                doctors={appointmentDoctors} 
                patients={patients}
                onView={(appointment) => {
                  setSelectedAppointment(appointment);
                  setIsViewDialogOpen(true);
                }}
                onEdit={(appointment) => {
                  setSelectedAppointment(appointment);
                  setEditFormData({
                    patientId: appointment.patientId,
                    doctorId: appointment.doctorId,
                    appointmentStatus: appointment.appointmentStatus,
                    consultationCharge: appointment.consultationCharge,
                    diagnosis: appointment.diagnosis || '',
                    followUpDetails: appointment.followUpDetails || '',
                    prescriptionsUrl: appointment.prescriptionsUrl || '',
                    toBeAdmitted: appointment.toBeAdmitted,
                    referToAnotherDoctor: appointment.referToAnotherDoctor,
                    referredDoctorId: appointment.referredDoctorId || '',
                    transferToIPDOTICU: appointment.transferToIPDOTICU,
                    transferTo: appointment.transferTo,
                    transferDetails: appointment.transferDetails || '',
                    billId: appointment.billId || '',
                  });
                  setIsEditDialogOpen(true);
                }}
              />
            </TabsContent>
            <TabsContent value="waiting">
              <AppointmentList 
                appointments={getAppointmentsByStatus('Waiting')} 
                doctors={appointmentDoctors} 
                patients={patients}
                onView={(appointment) => {
                  setSelectedAppointment(appointment);
                  setIsViewDialogOpen(true);
                }}
                onEdit={(appointment) => {
                  setSelectedAppointment(appointment);
                  setEditFormData({
                    patientId: appointment.patientId,
                    doctorId: appointment.doctorId,
                    appointmentStatus: appointment.appointmentStatus,
                    consultationCharge: appointment.consultationCharge,
                    diagnosis: appointment.diagnosis || '',
                    followUpDetails: appointment.followUpDetails || '',
                    prescriptionsUrl: appointment.prescriptionsUrl || '',
                    toBeAdmitted: appointment.toBeAdmitted,
                    referToAnotherDoctor: appointment.referToAnotherDoctor,
                    referredDoctorId: appointment.referredDoctorId || '',
                    transferToIPDOTICU: appointment.transferToIPDOTICU,
                    transferTo: appointment.transferTo,
                    transferDetails: appointment.transferDetails || '',
                    billId: appointment.billId || '',
                  });
                  setIsEditDialogOpen(true);
                }}
              />
            </TabsContent>
            <TabsContent value="consulting">
              <AppointmentList 
                appointments={getAppointmentsByStatus('Consulting')} 
                doctors={appointmentDoctors} 
                patients={patients}
                onView={(appointment) => {
                  setSelectedAppointment(appointment);
                  setIsViewDialogOpen(true);
                }}
                onEdit={(appointment) => {
                  setSelectedAppointment(appointment);
                  setEditFormData({
                    patientId: appointment.patientId,
                    doctorId: appointment.doctorId,
                    appointmentStatus: appointment.appointmentStatus,
                    consultationCharge: appointment.consultationCharge,
                    diagnosis: appointment.diagnosis || '',
                    followUpDetails: appointment.followUpDetails || '',
                    prescriptionsUrl: appointment.prescriptionsUrl || '',
                    toBeAdmitted: appointment.toBeAdmitted,
                    referToAnotherDoctor: appointment.referToAnotherDoctor,
                    referredDoctorId: appointment.referredDoctorId || '',
                    transferToIPDOTICU: appointment.transferToIPDOTICU,
                    transferTo: appointment.transferTo,
                    transferDetails: appointment.transferDetails || '',
                    billId: appointment.billId || '',
                  });
                  setIsEditDialogOpen(true);
                }}
              />
            </TabsContent>
            <TabsContent value="completed">
              <AppointmentList 
                appointments={getAppointmentsByStatus('Completed')} 
                doctors={appointmentDoctors} 
                patients={patients}
                onView={(appointment) => {
                  setSelectedAppointment(appointment);
                  setIsViewDialogOpen(true);
                }}
                onEdit={(appointment) => {
                  setSelectedAppointment(appointment);
                  setEditFormData({
                    patientId: appointment.patientId,
                    doctorId: appointment.doctorId,
                    appointmentStatus: appointment.appointmentStatus,
                    consultationCharge: appointment.consultationCharge,
                    diagnosis: appointment.diagnosis || '',
                    followUpDetails: appointment.followUpDetails || '',
                    prescriptionsUrl: appointment.prescriptionsUrl || '',
                    toBeAdmitted: appointment.toBeAdmitted,
                    referToAnotherDoctor: appointment.referToAnotherDoctor,
                    referredDoctorId: appointment.referredDoctorId || '',
                    transferToIPDOTICU: appointment.transferToIPDOTICU,
                    transferTo: appointment.transferTo,
                    transferDetails: appointment.transferDetails || '',
                    billId: appointment.billId || '',
                  });
                  setIsEditDialogOpen(true);
                }}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* View Appointment Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>View Patient Appointment</DialogTitle>
          </DialogHeader>
          {selectedAppointment && (() => {
            const patient = patients.find(p => 
              (p as any).patientId === selectedAppointment.patientId || 
              (p as any).PatientId === selectedAppointment.patientId
            );
            const doctor = appointmentDoctors.find(d => d.id.toString() === selectedAppointment.doctorId);
            const patientName = patient 
              ? `${(patient as any).patientName || (patient as any).PatientName || ''} ${(patient as any).lastName || (patient as any).LastName || ''}`.trim() 
              : selectedAppointment.patientId;
            const doctorName = doctor ? doctor.name : selectedAppointment.doctorId;
            const patientPhone = patient 
              ? (patient as any).PhoneNo || (patient as any).phoneNo || (patient as any).phone || '-'
              : '-';

            const getStatusBadge = (status: PatientAppointment['appointmentStatus']) => {
              switch (status) {
                case 'Waiting':
                  return <Badge variant="outline" className="bg-yellow-100 text-yellow-700 border-yellow-300"><Clock className="size-3 mr-1" />Waiting</Badge>;
                case 'Consulting':
                  return <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300"><Stethoscope className="size-3 mr-1" />Consulting</Badge>;
                case 'Completed':
                  return <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300"><CheckCircle2 className="size-3 mr-1" />Completed</Badge>;
                default:
                  return <Badge variant="outline">{status}</Badge>;
              }
            };

            return (
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Patient</Label>
                    <Input value={patientName} disabled className="bg-gray-50" />
                  </div>
                  <div>
                    <Label>Phone</Label>
                    <Input value={patientPhone} disabled className="bg-gray-50" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Doctor</Label>
                    <Input value={doctorName} disabled className="bg-gray-50" />
                  </div>
                  <div>
                    <Label>Status</Label>
                    <div className="pt-2">{getStatusBadge(selectedAppointment.appointmentStatus)}</div>
                  </div>
                </div>
                <div>
                  <Label>Charges (₹)</Label>
                  <Input value={`₹${selectedAppointment.consultationCharge.toFixed(2)}`} disabled className="bg-gray-50" />
                </div>
                <div>
                  <Label>Diagnosis</Label>
                  <Textarea value={selectedAppointment.diagnosis || '-'} disabled className="bg-gray-50" rows={3} />
                </div>
                {selectedAppointment.followUpDetails && (
                  <div>
                    <Label>Follow Up Details</Label>
                    <Textarea value={selectedAppointment.followUpDetails} disabled className="bg-gray-50" rows={2} />
                  </div>
                )}
                <div>
                  <Label>To Be Admitted</Label>
                  <div className="pt-2">
                    {selectedAppointment.toBeAdmitted ? (
                      <Badge variant="outline" className="bg-red-100 text-red-700 border-red-300">
                        <Hospital className="size-3 mr-1" />Yes
                      </Badge>
                    ) : (
                      <span className="text-gray-500">No</span>
                    )}
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>Close</Button>
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* Edit Appointment Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="p-0 gap-0 large-dialog max-h-[90vh]">
          <DialogHeader className="px-6 pt-4 pb-3 flex-shrink-0">
            <DialogTitle>Edit Patient Appointment</DialogTitle>
          </DialogHeader>
          {selectedAppointment && (
            <>
              <div className="flex-1 overflow-y-auto px-6 pb-1 patient-list-scrollable min-h-0">
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="edit-patientId">Patient *</Label>
                      <select
                        id="edit-patientId"
                        aria-label="Patient"
                        className="w-full px-3 py-2 border border-gray-200 rounded-md"
                        value={editFormData.patientId}
                        onChange={(e) => setEditFormData({ ...editFormData, patientId: e.target.value })}
                      >
                        <option value="">Select Patient</option>
                        {patients.length > 0 ? (
                          patients.map(patient => {
                            const patientId = (patient as any).patientId || (patient as any).PatientId || '';
                            const patientName = (patient as any).patientName || (patient as any).PatientName || '';
                            const lastName = (patient as any).lastName || (patient as any).LastName || '';
                            return (
                              <option key={patientId} value={patientId}>
                                {patientName} {lastName}
                              </option>
                            );
                          })
                        ) : (
                          <>
                            <option value="00000000-0000-0000-0000-000000000001">Dummy Patient Name</option>
                          </>
                        )}
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="edit-doctorId">Doctor *</Label>
                      <select
                        id="edit-doctorId"
                        aria-label="Doctor"
                        className="w-full px-3 py-2 border border-gray-200 rounded-md"
                        value={editFormData.doctorId}
                        onChange={(e) => setEditFormData({ ...editFormData, doctorId: e.target.value })}
                      >
                        <option value="">Select Doctor</option>
                        {appointmentDoctors.length > 0 ? (
                          appointmentDoctors.map(doctor => (
                            <option key={doctor.id} value={doctor.id.toString()}>
                              {doctor.name} - {doctor.specialty}
                            </option>
                          ))
                        ) : (
                          <option value="" disabled>No doctors available</option>
                        )}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="edit-appointmentStatus">Appointment Status</Label>
                      <select
                        id="edit-appointmentStatus"
                        aria-label="Appointment Status"
                        className="w-full px-3 py-2 border border-gray-200 rounded-md"
                        value={editFormData.appointmentStatus}
                        onChange={(e) => setEditFormData({ ...editFormData, appointmentStatus: e.target.value as PatientAppointment['appointmentStatus'] })}
                      >
                        <option value="Waiting">Waiting</option>
                        <option value="Consulting">Consulting</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="edit-consultationCharge">Consultation Charge (₹) *</Label>
                      <Input
                        id="edit-consultationCharge"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="e.g., 500"
                        value={editFormData.consultationCharge}
                        onChange={(e) => setEditFormData({ ...editFormData, consultationCharge: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="edit-diagnosis">Diagnosis</Label>
                    <Textarea
                      id="edit-diagnosis"
                      placeholder="Enter diagnosis..."
                      value={editFormData.diagnosis}
                      onChange={(e) => setEditFormData({ ...editFormData, diagnosis: e.target.value })}
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-followUpDetails">Follow Up Details</Label>
                    <Textarea
                      id="edit-followUpDetails"
                      placeholder="Enter follow up details..."
                      value={editFormData.followUpDetails}
                      onChange={(e) => setEditFormData({ ...editFormData, followUpDetails: e.target.value })}
                      rows={2}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-prescriptionsUrl">Prescriptions URL</Label>
                    <Input
                      id="edit-prescriptionsUrl"
                      type="url"
                      placeholder="https://prescriptions.example.com/..."
                      value={editFormData.prescriptionsUrl}
                      onChange={(e) => setEditFormData({ ...editFormData, prescriptionsUrl: e.target.value })}
                    />
                    <p className="text-xs text-gray-500 mt-1">Folder URL - multiple prescriptions should be saved</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="edit-toBeAdmitted"
                      aria-label="To Be Admitted (Yes - converted to IPD)"
                      checked={editFormData.toBeAdmitted}
                      onChange={(e) => setEditFormData({ ...editFormData, toBeAdmitted: e.target.checked })}
                      className="rounded"
                    />
                    <Label htmlFor="edit-toBeAdmitted" className="cursor-pointer">To Be Admitted (Yes - converted to IPD)</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="edit-referToAnotherDoctor"
                      aria-label="Refer to Another Doctor"
                      checked={editFormData.referToAnotherDoctor}
                      onChange={(e) => setEditFormData({ 
                        ...editFormData, 
                        referToAnotherDoctor: e.target.checked, 
                        referredDoctorId: e.target.checked ? editFormData.referredDoctorId : '',
                        appointmentStatus: e.target.checked ? 'Completed' : editFormData.appointmentStatus
                      })}
                      className="rounded"
                    />
                    <Label htmlFor="edit-referToAnotherDoctor" className="cursor-pointer">Refer To Another Doctor</Label>
                  </div>
                  {editFormData.referToAnotherDoctor && (
                    <div>
                      <Label htmlFor="edit-referredDoctorId">Referred Doctor *</Label>
                      <select
                        id="edit-referredDoctorId"
                        aria-label="Referred Doctor"
                        className="w-full px-3 py-2 border border-gray-200 rounded-md"
                        value={editFormData.referredDoctorId}
                        onChange={(e) => setEditFormData({ ...editFormData, referredDoctorId: e.target.value })}
                      >
                        <option value="">Select Referred Doctor</option>
                        {appointmentDoctors.length > 0 ? (
                          appointmentDoctors.map(doctor => (
                            <option key={doctor.id} value={doctor.id.toString()}>
                              {doctor.name} - {doctor.specialty}
                            </option>
                          ))
                        ) : (
                          <option value="" disabled>No doctors available</option>
                        )}
                      </select>
                      <p className="text-xs text-gray-500 mt-1">Once this is made as Yes, Appointment created for this doctor id</p>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="edit-transferToIPDOTICU"
                      aria-label="Transfer to IPD/OT/ICU"
                      checked={editFormData.transferToIPDOTICU}
                      onChange={(e) => setEditFormData({ ...editFormData, transferToIPDOTICU: e.target.checked, transferTo: e.target.checked ? editFormData.transferTo : undefined })}
                      className="rounded"
                    />
                    <Label htmlFor="edit-transferToIPDOTICU" className="cursor-pointer">Transfer To IPD/OT/ICU</Label>
                  </div>
                  {editFormData.transferToIPDOTICU && (
                    <div>
                      <Label htmlFor="edit-transferTo">Transfer To *</Label>
                      <select
                        id="edit-transferTo"
                        aria-label="Transfer To"
                        className="w-full px-3 py-2 border border-gray-200 rounded-md"
                        value={editFormData.transferTo || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, transferTo: e.target.value as 'IPD Room Admission' | 'ICU' | 'OT' })}
                      >
                        <option value="">Select Transfer Destination</option>
                        <option value="IPD Room Admission">IPD Room Admission</option>
                        <option value="ICU">ICU</option>
                        <option value="OT">OT</option>
                      </select>
                    </div>
                  )}
                  {editFormData.transferToIPDOTICU && (
                    <div>
                      <Label htmlFor="edit-transferDetails">Transfer Details</Label>
                      <Textarea
                        id="edit-transferDetails"
                        placeholder="Enter transfer details..."
                        value={editFormData.transferDetails}
                        onChange={(e) => setEditFormData({ ...editFormData, transferDetails: e.target.value })}
                        rows={2}
                      />
                    </div>
                  )}
                  <div>
                    <Label htmlFor="edit-billId">Bill ID</Label>
                    <Input
                      id="edit-billId"
                      type="text"
                      placeholder="e.g., BILL001"
                      value={editFormData.billId}
                      onChange={(e) => setEditFormData({ ...editFormData, billId: e.target.value })}
                    />
                    <p className="text-xs text-gray-500 mt-1">Foreign Key to BillId</p>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2 px-6 py-2 border-t bg-gray-50 flex-shrink-0">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="py-1">Cancel</Button>
                <Button 
                  onClick={async () => {
                    if (!selectedAppointment) return;
                    if (!editFormData.patientId || !editFormData.doctorId) {
                      alert('Please fill in all required fields.');
                      return;
                    }
                    if (editFormData.referToAnotherDoctor && !editFormData.referredDoctorId) {
                      alert('Please select a referred doctor when "Refer To Another Doctor" is checked.');
                      return;
                    }
                    if (editFormData.transferToIPDOTICU && !editFormData.transferTo) {
                      alert('Please select a transfer destination when "Transfer To IPD/OT/ICU" is checked.');
                      return;
                    }
                    try {
                      await updatePatientAppointment({
                        id: selectedAppointment.id,
                        patientId: editFormData.patientId,
                        doctorId: editFormData.doctorId,
                        appointmentStatus: editFormData.appointmentStatus,
                        consultationCharge: editFormData.consultationCharge,
                        diagnosis: editFormData.diagnosis || undefined,
                        followUpDetails: editFormData.followUpDetails || undefined,
                        prescriptionsUrl: editFormData.prescriptionsUrl || undefined,
                        toBeAdmitted: editFormData.toBeAdmitted,
                        referToAnotherDoctor: editFormData.referToAnotherDoctor,
                        referredDoctorId: editFormData.referToAnotherDoctor ? editFormData.referredDoctorId : undefined,
                        transferToIPDOTICU: editFormData.transferToIPDOTICU,
                        transferTo: editFormData.transferToIPDOTICU ? editFormData.transferTo : undefined,
                        transferDetails: editFormData.transferDetails || undefined,
                        billId: editFormData.billId || undefined,
                      });
                      await fetchPatientAppointments();
                      setIsEditDialogOpen(false);
                      setSelectedAppointment(null);
                    } catch (err) {
                      console.error('Failed to update appointment:', err);
                      alert('Failed to update appointment. Please try again.');
                    }
                  }} 
                  className="py-1"
                >
                  Update Appointment
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AppointmentList({ 
  appointments, 
  doctors, 
  patients,
  onView,
  onEdit
}: { 
  appointments: PatientAppointment[]; 
  doctors: Doctor[]; 
  patients: Patient[];
  onView: (appointment: PatientAppointment) => void;
  onEdit: (appointment: PatientAppointment) => void;
}) {
  const getStatusBadge = (status: PatientAppointment['appointmentStatus']) => {
    switch (status) {
      case 'Waiting':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-700 border-yellow-300"><Clock className="size-3 mr-1" />Waiting</Badge>;
      case 'Consulting':
        return <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300"><Stethoscope className="size-3 mr-1" />Consulting</Badge>;
      case 'Completed':
        return <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300"><CheckCircle2 className="size-3 mr-1" />Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Card className="mb-4">
      <CardContent className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-gray-700 font-bold">Patient</th>
                <th className="text-left py-3 px-4 text-gray-700 font-bold">Phone</th>
                <th className="text-left py-3 px-4 text-gray-700 font-bold">Doctor</th>
                <th className="text-left py-3 px-4 text-gray-700 font-bold">Status</th>
                <th className="text-left py-3 px-4 text-gray-700 font-bold">Charges(₹)</th>
                <th className="text-left py-3 px-4 text-gray-700 font-bold">Diagnosis</th>
                <th className="text-left py-3 px-4 text-gray-700 font-bold">To Be Admitted</th>
                <th className="text-left py-3 px-4 text-gray-700 font-bold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((appointment) => {
                const patient = patients.find(p => 
                  (p as any).patientId === appointment.patientId || 
                  (p as any).PatientId === appointment.patientId
                );
                const doctor = doctors.find(d => d.id.toString() === appointment.doctorId);
                const patientName = patient 
                  ? `${(patient as any).patientName || (patient as any).PatientName || ''} ${(patient as any).lastName || (patient as any).LastName || ''}`.trim() 
                  : appointment.patientId === '00000000-0000-0000-0000-000000000001' 
                    ? 'Dummy Patient Name' 
                    : appointment.patientId;
                const doctorName = doctor ? doctor.name : appointment.doctorId;
                const patientPhone = patient 
                  ? (patient as any).PhoneNo || (patient as any).phoneNo || (patient as any).phone || '-'
                  : '-';
                
                return (
                  <tr key={appointment.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-1 px-4 text-gray-600 whitespace-nowrap">{patientName}</td>
                    <td className="py-1 px-4 text-gray-600 whitespace-nowrap">{patientPhone}</td>
                    <td className="py-1 px-4 text-gray-600 whitespace-nowrap">{doctorName}</td>
                    <td className="py-1 px-4">{getStatusBadge(appointment.appointmentStatus)}</td>
                    <td className="py-1 px-4 text-gray-900 font-semibold">
                      ₹{appointment.consultationCharge.toFixed(2)}
                    </td>
                    <td className="py-1 px-4 text-gray-600 max-w-xs truncate" title={appointment.diagnosis}>{appointment.diagnosis || '-'}</td>
                    <td className="py-1 px-4">
                      {appointment.toBeAdmitted ? (
                        <Badge variant="outline" className="bg-red-100 text-red-700 border-red-300">
                          <Hospital className="size-3 mr-1" />Yes
                        </Badge>
                      ) : (
                        <span className="text-gray-500">No</span>
                      )}
                    </td>
                    <td className="py-1 px-4">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onView(appointment)}
                          className="h-8 w-8 p-0"
                        >
                          <Eye className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit(appointment)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="size-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {appointments.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No appointments found
          </div>
        )}
      </CardContent>
    </Card>
  );
}
