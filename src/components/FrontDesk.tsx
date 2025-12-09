// FrontDesk Component - Separated UI from logic
import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Textarea } from './ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Search, Plus, Printer, Users, Clock, Stethoscope, CheckCircle2, Hospital, Eye, Edit, Trash2 } from 'lucide-react';
import { useTokens } from '../hooks';
import { usePatientAppointments } from '../hooks/usePatientAppointments';
import { useStaff } from '../hooks/useStaff';
import { useRoles } from '../hooks/useRoles';
import { useDepartments } from '../hooks/useDepartments';
import { patientsApi } from '../api/patients';
import { Token, PatientAppointment, Patient, Doctor } from '../types';

interface FrontDeskViewProps {
  tokens: Token[];
  doctors: Array<{ id: number; name: string; specialty: string; type: 'inhouse' | 'consulting' }>;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onCreateToken: (data: { patientName: string; patientPhone: string; doctorId: number; isFollowUp?: boolean; patientId?: number }) => Promise<Token>;
  getTokensByStatus: (status: Token['status']) => Token[];
  patientAppointments: PatientAppointment[];
  appointmentDoctors: Doctor[];
  patients: Patient[];
  appointmentSearchTerm: string;
  onAppointmentSearchChange: (value: string) => void;
  getAppointmentsByStatus: (status: PatientAppointment['appointmentStatus']) => PatientAppointment[];
  updatePatientAppointment: (data: { id: number; patientId?: string; doctorId?: string; appointmentDate?: string; appointmentTime?: string; appointmentStatus?: 'Waiting' | 'Consulting' | 'Completed'; consultationCharge?: number; diagnosis?: string; followUpDetails?: string; prescriptionsUrl?: string; toBeAdmitted?: boolean; referToAnotherDoctor?: boolean; referredDoctorId?: string; transferToIPDOTICU?: boolean; transferTo?: 'IPD Room Admission' | 'ICU' | 'OT'; transferDetails?: string; billId?: string }) => Promise<PatientAppointment>;
  fetchPatientAppointments: () => Promise<void>;
  createPatientAppointment: (data: { patientId: string; doctorId: string; appointmentDate: string; appointmentTime: string; appointmentStatus?: 'Waiting' | 'Consulting' | 'Completed'; consultationCharge: number; diagnosis?: string; followUpDetails?: string; prescriptionsUrl?: string; toBeAdmitted?: boolean; referToAnotherDoctor?: boolean; referredDoctorId?: string; transferToIPDOTICU?: boolean; transferTo?: 'IPD Room Admission' | 'ICU' | 'OT'; transferDetails?: string; billId?: string }, doctorName: string) => Promise<PatientAppointment>;
}

export function FrontDesk() {
  const { tokens, doctors, loading, error, createToken, getTokensByStatus } = useTokens();
  const { patientAppointments, loading: appointmentsLoading, error: appointmentsError, updatePatientAppointment, fetchPatientAppointments, createPatientAppointment, deletePatientAppointment } = usePatientAppointments();
  const { staff } = useStaff();
  const { roles } = useRoles();
  const { departments } = useDepartments();
  const [searchTerm, setSearchTerm] = useState('');
  const [appointmentSearchTerm, setAppointmentSearchTerm] = useState('');
  const [patients, setPatients] = useState<Patient[]>([]);

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

  const filteredTokens = tokens.filter(token =>
    token.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    token.tokenNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredAppointments = patientAppointments.filter(appointment => {
    if (!appointmentSearchTerm) return true;
    
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
    const patientPhone = patient 
      ? (patient as any).PhoneNo || (patient as any).phoneNo || (patient as any).phone || ''
      : '';
    const patientId = patient 
      ? (patient as any).PatientNo || (patient as any).patientNo || appointment.patientId.substring(0, 8)
      : appointment.patientId.substring(0, 8);
    
    const searchLower = appointmentSearchTerm.toLowerCase();
    return (
                  appointment.tokenNo.toLowerCase().includes(searchLower) ||
      patientName.toLowerCase().includes(searchLower) ||
      doctorName.toLowerCase().includes(searchLower) ||
      patientPhone.includes(appointmentSearchTerm) ||
      patientId.toLowerCase().includes(searchLower) ||
      appointment.patientId.toLowerCase().includes(searchLower)
    );
  });

  const getAppointmentsByStatus = (status: PatientAppointment['appointmentStatus']) => {
    return filteredAppointments.filter(a => a.appointmentStatus === status);
  };

  const handleCreateToken = async (data: { patientName: string; patientPhone: string; doctorId: number; isFollowUp?: boolean; patientId?: number }) => {
    try {
      const newToken = await createToken(data);
      
      // If it's a follow-up visit, increment the patient's follow-up count
      if (data.isFollowUp && data.patientId) {
        try {
          const { patientsApi } = await import('../api');
          await patientsApi.incrementFollowUpCount(data.patientId);
        } catch (err) {
          console.error('Failed to increment follow-up count:', err);
        }
      }
      
      const followUpText = newToken.isFollowUp ? '\nType: Follow-up Visit' : '\nType: New Visit';
      alert(`Token Generated!\n\nToken Number: ${newToken.tokenNumber}\nPatient: ${newToken.patientName}\nDoctor: ${newToken.doctorName}\nTime: ${newToken.issueTime}${followUpText}`);
      return newToken;
    } catch (err) {
      console.error('Failed to create token:', err);
      throw err;
    }
  };

  if (loading || appointmentsLoading) {
    return (
      <div className="p-8">
        <div className="text-center py-12 text-gray-700">Loading...</div>
      </div>
    );
  }

  if (error || appointmentsError) {
    return (
      <div className="p-8">
        <div className="text-center py-12 text-red-500">Error: {error || appointmentsError}</div>
      </div>
    );
  }

  return (
    <FrontDeskView
      tokens={filteredTokens}
      doctors={doctors}
      searchTerm={searchTerm}
      onSearchChange={setSearchTerm}
      onCreateToken={handleCreateToken}
      getTokensByStatus={getTokensByStatus}
      patientAppointments={filteredAppointments}
      appointmentDoctors={appointmentDoctors}
      patients={patients}
      appointmentSearchTerm={appointmentSearchTerm}
      onAppointmentSearchChange={setAppointmentSearchTerm}
      getAppointmentsByStatus={getAppointmentsByStatus}
      updatePatientAppointment={updatePatientAppointment}
      fetchPatientAppointments={fetchPatientAppointments}
      createPatientAppointment={createPatientAppointment}
    />
  );
}

function FrontDeskView({ 
  tokens, 
  doctors, 
  searchTerm, 
  onSearchChange, 
  onCreateToken, 
  getTokensByStatus,
  patientAppointments,
  appointmentDoctors,
  patients,
  appointmentSearchTerm,
  onAppointmentSearchChange,
  getAppointmentsByStatus,
  updatePatientAppointment,
  fetchPatientAppointments,
  createPatientAppointment
}: FrontDeskViewProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [isFollowUp, setIsFollowUp] = useState(false);
  const [patientId, setPatientId] = useState<number | undefined>(undefined);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<PatientAppointment | null>(null);
  const [editFormData, setEditFormData] = useState({
    patientId: '',
    doctorId: '',
    appointmentDate: '',
    appointmentTime: '',
    appointmentStatus: 'Waiting' as PatientAppointment['appointmentStatus'],
    consultationCharge: 0,
    followUpDetails: '',
  });
  const [addFormData, setAddFormData] = useState({
    patientId: '',
    doctorId: '',
    appointmentDate: '',
    appointmentTime: '',
    appointmentStatus: 'Waiting' as PatientAppointment['appointmentStatus'],
    consultationCharge: 0,
  });
  const [patientSearchTerm, setPatientSearchTerm] = useState('');
  const [doctorSearchTerm, setDoctorSearchTerm] = useState('');

  const handleGenerateToken = async () => {
    if (!selectedDoctor || !patientName || !patientPhone) {
      alert('Please fill all fields');
      return;
    }

    try {
      await onCreateToken({
        patientName,
        patientPhone,
        doctorId: parseInt(selectedDoctor),
        isFollowUp,
        patientId,
      });
      setIsDialogOpen(false);
      setPatientName('');
      setPatientPhone('');
      setSelectedDoctor('');
      setIsFollowUp(false);
      setPatientId(undefined);
    } catch (err) {
      // Error handling is done in the parent
    }
  };

  const handlePhoneChange = async (phone: string) => {
    setPatientPhone(phone);
    if (phone.length >= 10) {
      // Check if patient exists
      try {
        const { patientsApi } = await import('../api');
        const patient = await patientsApi.findByPhone(phone);
        if (patient) {
          const patientName = (patient as any).patientName || (patient as any).PatientName || '';
          const lastName = (patient as any).lastName || (patient as any).LastName || '';
          const fullName = `${patientName} ${lastName}`.trim();
          setPatientName(fullName || patientName || '');
          setPatientId(patient.id);
          setIsFollowUp(true); // Auto-check if patient exists (likely follow-up)
        } else {
          setPatientId(undefined);
          setIsFollowUp(false);
        }
      } catch (err) {
        // If patient not found, it's a new patient
        setPatientId(undefined);
        setIsFollowUp(false);
      }
    }
  };

  return (
    <div className="px-4 pt-4 pb-4 bg-blue-100 h-screen flex flex-col overflow-hidden">
      <div className="flex-shrink-0">
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
          <div>
            <h1 className="text-gray-900 mb-0 text-xl">Front Desk - Patient Appointments</h1>
            <p className="text-gray-700 text-sm">Manage patient appointments</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="size-4" />
                Add Appointment
              </Button>
            </DialogTrigger>
            <DialogContent className="p-0 gap-0 large-dialog max-h-[90vh]">
              <DialogHeader className="px-6 pt-4 pb-3 flex-shrink-0">
                <DialogTitle>Add New Patient Appointment</DialogTitle>
              </DialogHeader>
              <div className="flex-1 overflow-y-auto px-6 pb-1 patient-list-scrollable min-h-0">
                <div className="space-y-4 py-4">
                  <div>
                    <Label htmlFor="add-patient-search">Patient *</Label>
                    <div className="relative mb-2">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                      <Input
                        id="add-patient-search"
                        placeholder="Search by Patient ID, Name, or Mobile Number..."
                        value={patientSearchTerm}
                        onChange={(e) => setPatientSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    {patientSearchTerm && (
                      <div className="border border-gray-200 rounded-md max-h-60 overflow-y-auto">
                        <table className="w-full">
                          <thead className="sticky top-0 bg-gray-50 border-b border-gray-200">
                            <tr>
                              <th className="text-left py-2 px-3 text-xs text-gray-700 font-bold">Patient ID</th>
                              <th className="text-left py-2 px-3 text-xs text-gray-700 font-bold">Name</th>
                              <th className="text-left py-2 px-3 text-xs text-gray-700 font-bold">Mobile</th>
                            </tr>
                          </thead>
                          <tbody>
                            {patients
                              .filter(patient => {
                                if (!patientSearchTerm) return false;
                                const searchLower = patientSearchTerm.toLowerCase();
                                const patientId = (patient as any).patientId || (patient as any).PatientId || '';
                                const patientNo = (patient as any).patientNo || (patient as any).PatientNo || '';
                                const patientName = (patient as any).patientName || (patient as any).PatientName || '';
                                const lastName = (patient as any).lastName || (patient as any).LastName || '';
                                const fullName = `${patientName} ${lastName}`.trim();
                                const phoneNo = (patient as any).phoneNo || (patient as any).PhoneNo || (patient as any).phone || '';
                                return (
                                  patientId.toLowerCase().includes(searchLower) ||
                                  patientNo.toLowerCase().includes(searchLower) ||
                                  fullName.toLowerCase().includes(searchLower) ||
                                  phoneNo.includes(patientSearchTerm)
                                );
                              })
                              .map(patient => {
                                const patientId = (patient as any).patientId || (patient as any).PatientId || '';
                                const patientNo = (patient as any).patientNo || (patient as any).PatientNo || '';
                                const patientName = (patient as any).patientName || (patient as any).PatientName || '';
                                const lastName = (patient as any).lastName || (patient as any).LastName || '';
                                const fullName = `${patientName} ${lastName}`.trim();
                                const phoneNo = (patient as any).phoneNo || (patient as any).PhoneNo || (patient as any).phone || '';
                                const isSelected = addFormData.patientId === patientId;
                                return (
                                  <tr
                                    key={patientId}
                                    onClick={() => {
                                      setAddFormData({ ...addFormData, patientId });
                                      setPatientSearchTerm(`${patientNo ? `${patientNo} - ` : ''}${fullName || 'Unknown'}`);
                                    }}
                                    className={`border-b border-gray-100 cursor-pointer hover:bg-blue-50 ${isSelected ? 'bg-blue-100' : ''}`}
                                  >
                                    <td className="py-2 px-3 text-sm text-gray-900 font-mono">{patientNo || patientId.substring(0, 8)}</td>
                                    <td className="py-2 px-3 text-sm text-gray-600">{fullName || 'Unknown'}</td>
                                    <td className="py-2 px-3 text-sm text-gray-600">{phoneNo || '-'}</td>
                                  </tr>
                                );
                              })}
                          </tbody>
                        </table>
                        {patients.filter(patient => {
                          if (!patientSearchTerm) return false;
                          const searchLower = patientSearchTerm.toLowerCase();
                          const patientId = (patient as any).patientId || (patient as any).PatientId || '';
                          const patientNo = (patient as any).patientNo || (patient as any).PatientNo || '';
                          const patientName = (patient as any).patientName || (patient as any).PatientName || '';
                          const lastName = (patient as any).lastName || (patient as any).LastName || '';
                          const fullName = `${patientName} ${lastName}`.trim();
                          const phoneNo = (patient as any).phoneNo || (patient as any).PhoneNo || (patient as any).phone || '';
                          return (
                            patientId.toLowerCase().includes(searchLower) ||
                            patientNo.toLowerCase().includes(searchLower) ||
                            fullName.toLowerCase().includes(searchLower) ||
                            phoneNo.includes(patientSearchTerm)
                          );
                        }).length === 0 && (
                          <div className="text-center py-8 text-sm text-gray-700">
                            No patients found. Try a different search term.
                          </div>
                        )}
                      </div>
                    )}
                    {addFormData.patientId && (
                      <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-sm text-gray-700">
                        Selected: {(() => {
                          const selectedPatient = patients.find(p => {
                            const pid = (p as any).patientId || (p as any).PatientId || '';
                            return pid === addFormData.patientId;
                          });
                          if (selectedPatient) {
                            const patientId = (selectedPatient as any).patientId || (selectedPatient as any).PatientId || '';
                            const patientNo = (selectedPatient as any).patientNo || (selectedPatient as any).PatientNo || '';
                            const patientName = (selectedPatient as any).patientName || (selectedPatient as any).PatientName || '';
                            const lastName = (selectedPatient as any).lastName || (selectedPatient as any).LastName || '';
                            const fullName = `${patientName} ${lastName}`.trim();
                            return `${patientNo ? `${patientNo} - ` : ''}${fullName || 'Unknown'} (ID: ${patientId.substring(0, 8)})`;
                          }
                          return `Unknown (ID: ${addFormData.patientId.substring(0, 8)})`;
                        })()}
                      </div>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="add-doctor-search">Doctor *</Label>
                    <div className="relative mb-2">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                      <Input
                        id="add-doctor-search"
                        placeholder="Search by Doctor Name or Specialty..."
                        value={doctorSearchTerm}
                        onChange={(e) => setDoctorSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    {doctorSearchTerm && (
                      <div className="border border-gray-200 rounded-md max-h-60 overflow-y-auto">
                        <table className="w-full">
                          <thead className="sticky top-0 bg-gray-50 border-b border-gray-200">
                            <tr>
                              <th className="text-left py-2 px-3 text-xs text-gray-700 font-bold">Name</th>
                              <th className="text-left py-2 px-3 text-xs text-gray-700 font-bold">Specialty</th>
                              <th className="text-left py-2 px-3 text-xs text-gray-700 font-bold">Type</th>
                            </tr>
                          </thead>
                          <tbody>
                            {appointmentDoctors
                              .filter(doctor => {
                                if (!doctorSearchTerm) return false;
                                const searchLower = doctorSearchTerm.toLowerCase();
                                return (
                                  doctor.name.toLowerCase().includes(searchLower) ||
                                  doctor.specialty.toLowerCase().includes(searchLower)
                                );
                              })
                              .map(doctor => {
                                const isSelected = addFormData.doctorId === doctor.id.toString();
                                return (
                                  <tr
                                    key={doctor.id}
                                    onClick={() => {
                                      setAddFormData({ ...addFormData, doctorId: doctor.id.toString() });
                                      setDoctorSearchTerm(`${doctor.name} - ${doctor.specialty}`);
                                    }}
                                    className={`border-b border-gray-100 cursor-pointer hover:bg-blue-50 ${isSelected ? 'bg-blue-100' : ''}`}
                                  >
                                    <td className="py-2 px-3 text-sm text-gray-900">{doctor.name}</td>
                                    <td className="py-2 px-3 text-sm text-gray-600">{doctor.specialty}</td>
                                    <td className="py-2 px-3 text-sm">
                                      <span className={`px-2 py-0.5 rounded text-xs ${
                                        doctor.type === 'inhouse' 
                                          ? 'bg-blue-100 text-blue-700' 
                                          : 'bg-purple-100 text-purple-700'
                                      }`}>
                                        {doctor.type === 'inhouse' ? 'Inhouse' : 'Consulting'}
                                      </span>
                                    </td>
                                  </tr>
                                );
                              })}
                          </tbody>
                        </table>
                        {appointmentDoctors.filter(doctor => {
                          if (!doctorSearchTerm) return false;
                          const searchLower = doctorSearchTerm.toLowerCase();
                          return (
                            doctor.name.toLowerCase().includes(searchLower) ||
                            doctor.specialty.toLowerCase().includes(searchLower)
                          );
                        }).length === 0 && (
                          <div className="text-center py-8 text-sm text-gray-700">
                            No doctors found. Try a different search term.
                          </div>
                        )}
                      </div>
                    )}
                    {addFormData.doctorId && (
                      <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-sm text-gray-700">
                        Selected: {(() => {
                          const selectedDoctor = appointmentDoctors.find(d => d.id.toString() === addFormData.doctorId);
                          if (selectedDoctor) {
                            return `${selectedDoctor.name} - ${selectedDoctor.specialty}`;
                          }
                          return 'Unknown';
                        })()}
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="add-appointmentDate">Appointment Date *</Label>
                      <Input
                        id="add-appointmentDate"
                        type="date"
                        value={addFormData.appointmentDate}
                        onChange={(e) => setAddFormData({ ...addFormData, appointmentDate: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="add-appointmentTime">Appointment Time *</Label>
                      <Input
                        id="add-appointmentTime"
                        type="time"
                        value={addFormData.appointmentTime}
                        onChange={(e) => setAddFormData({ ...addFormData, appointmentTime: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="add-appointmentStatus">Appointment Status</Label>
                      <select
                        id="add-appointmentStatus"
                        aria-label="Appointment Status"
                        className="w-full px-3 py-2 border border-gray-200 rounded-md"
                        value={addFormData.appointmentStatus}
                        onChange={(e) => setAddFormData({ ...addFormData, appointmentStatus: e.target.value as PatientAppointment['appointmentStatus'] })}
                      >
                        <option value="Waiting">Waiting</option>
                        <option value="Consulting">Consulting</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="add-consultationCharge">Consultation Charge (₹) *</Label>
                      <Input
                        id="add-consultationCharge"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="e.g., 500"
                        value={addFormData.consultationCharge}
                        onChange={(e) => setAddFormData({ ...addFormData, consultationCharge: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2 px-6 py-2 border-t bg-gray-50 flex-shrink-0">
                <Button variant="outline" onClick={() => {
                  setIsAddDialogOpen(false);
                  setAddFormData({
                    patientId: '',
                    doctorId: '',
                    appointmentDate: '',
                    appointmentTime: '',
                    appointmentStatus: 'Waiting',
                    consultationCharge: 0,
                  });
                  setPatientSearchTerm('');
                  setDoctorSearchTerm('');
                }} className="py-1">Cancel</Button>
                <Button 
                  onClick={async () => {
                    if (!addFormData.patientId || !addFormData.doctorId || !addFormData.appointmentDate || !addFormData.appointmentTime) {
                      alert('Please fill in all required fields.');
                      return;
                    }
                    try {
                      const selectedDoctor = appointmentDoctors.find(d => d.id.toString() === addFormData.doctorId);
                      const doctorName = selectedDoctor ? selectedDoctor.name : 'Unknown Doctor';
                      await createPatientAppointment({
                        patientId: addFormData.patientId,
                        doctorId: addFormData.doctorId,
                        appointmentDate: addFormData.appointmentDate,
                        appointmentTime: addFormData.appointmentTime,
                        appointmentStatus: addFormData.appointmentStatus,
                        consultationCharge: addFormData.consultationCharge,
                      }, doctorName);
                      await fetchPatientAppointments();
                      setIsAddDialogOpen(false);
                      setAddFormData({
                        patientId: '',
                        doctorId: '',
                        appointmentDate: '',
                        appointmentTime: '',
                        appointmentStatus: 'Waiting',
                        consultationCharge: 0,
                      });
                      setPatientSearchTerm('');
                      setDoctorSearchTerm('');
                      alert('Appointment created successfully!');
                    } catch (err) {
                      console.error('Failed to create appointment:', err);
                      alert('Failed to create appointment. Please try again.');
                    }
                  }} 
                  className="py-1"
                >
                  Create Appointment
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto overflow-x-hidden frontdesk-scrollable min-h-0">
        <div className="space-y-6">
          {/* Patient Appointments Section */}
          {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-700 mb-1">Total Appointments</p>
                      <h3 className="text-gray-900">{patientAppointments.length}</h3>
                    </div>
                    <Users className="size-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-700 mb-1">Waiting</p>
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
                      <p className="text-sm text-gray-700 mb-1">Consulting</p>
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
                      <p className="text-sm text-gray-700 mb-1">Completed</p>
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
            <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                  <Input
                    placeholder="Search by token no, patient, or doctor..."
                    value={appointmentSearchTerm}
                    onChange={(e) => onAppointmentSearchChange(e.target.value)}
                    className="pl-10"
                  />
                </div>
            </div>

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
                      appointmentDate: appointment.appointmentDate,
                      appointmentTime: appointment.appointmentTime,
                      appointmentStatus: appointment.appointmentStatus,
                      consultationCharge: appointment.consultationCharge,
                      followUpDetails: appointment.followUpDetails || '',
                    });
                    setIsEditDialogOpen(true);
                  }}
                  onDelete={async (appointment) => {
                    if (confirm('Are you sure you want to delete this appointment? This action cannot be undone.')) {
                      try {
                        await deletePatientAppointment(appointment.id);
                        await fetchPatientAppointments();
                      } catch (err) {
                        console.error('Failed to delete appointment:', err);
                        const errorMessage = err instanceof Error ? err.message : 'Failed to delete appointment';
                        alert(errorMessage);
                      }
                    }
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
                      appointmentDate: appointment.appointmentDate,
                      appointmentTime: appointment.appointmentTime,
                      appointmentStatus: appointment.appointmentStatus,
                      consultationCharge: appointment.consultationCharge,
                      followUpDetails: appointment.followUpDetails || '',
                    });
                    setIsEditDialogOpen(true);
                  }}
                  onDelete={async (appointment) => {
                    if (confirm('Are you sure you want to delete this appointment? This action cannot be undone.')) {
                      try {
                        await deletePatientAppointment(appointment.id);
                        await fetchPatientAppointments();
                      } catch (err) {
                        console.error('Failed to delete appointment:', err);
                        const errorMessage = err instanceof Error ? err.message : 'Failed to delete appointment';
                        alert(errorMessage);
                      }
                    }
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
                      appointmentDate: appointment.appointmentDate,
                      appointmentTime: appointment.appointmentTime,
                      appointmentStatus: appointment.appointmentStatus,
                      consultationCharge: appointment.consultationCharge,
                      followUpDetails: appointment.followUpDetails || '',
                    });
                    setIsEditDialogOpen(true);
                  }}
                  onDelete={async (appointment) => {
                    if (confirm('Are you sure you want to delete this appointment? This action cannot be undone.')) {
                      try {
                        await deletePatientAppointment(appointment.id);
                        await fetchPatientAppointments();
                      } catch (err) {
                        console.error('Failed to delete appointment:', err);
                        const errorMessage = err instanceof Error ? err.message : 'Failed to delete appointment';
                        alert(errorMessage);
                      }
                    }
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
                      appointmentDate: appointment.appointmentDate,
                      appointmentTime: appointment.appointmentTime,
                      appointmentStatus: appointment.appointmentStatus,
                      consultationCharge: appointment.consultationCharge,
                      followUpDetails: appointment.followUpDetails || '',
                    });
                    setIsEditDialogOpen(true);
                  }}
                  onDelete={async (appointment) => {
                    if (confirm('Are you sure you want to delete this appointment? This action cannot be undone.')) {
                      try {
                        await deletePatientAppointment(appointment.id);
                        await fetchPatientAppointments();
                      } catch (err) {
                        console.error('Failed to delete appointment:', err);
                        const errorMessage = err instanceof Error ? err.message : 'Failed to delete appointment';
                        alert(errorMessage);
                      }
                    }
                  }}
                />
              </TabsContent>
            </Tabs>
        </div>
      </div>

      {/* View Appointment Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="p-0 gap-0 large-dialog max-h-[90vh]">
          <DialogHeader className="px-6 pt-4 pb-3 flex-shrink-0">
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

            return (
              <>
                <div className="flex-1 overflow-y-auto px-6 pb-1 patient-list-scrollable min-h-0">
              <div className="space-y-4 py-4">
                <div>
                  <Label>Token No</Label>
                      <Input value={selectedAppointment.tokenNo} disabled className="bg-gray-50 text-gray-700" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                        <Label>Patient *</Label>
                        <Input
                          value={(() => {
                            const patient = patients.find(p => 
                              (p as any).patientId === selectedAppointment.patientId || 
                              (p as any).PatientId === selectedAppointment.patientId
                            );
                            if (patient) {
                              const patientId = (patient as any).patientId || (patient as any).PatientId || '';
                              const patientNo = (patient as any).patientNo || (patient as any).PatientNo || '';
                              return `${patientNo ? `${patientNo} - ` : ''}${patientName} (ID: ${patientId.substring(0, 8)})`;
                            }
                            return `${patientName} (ID: ${selectedAppointment.patientId ? selectedAppointment.patientId.substring(0, 8) : 'N/A'})`;
                          })()}
                          disabled
                          className="bg-gray-50 text-gray-700"
                        />
                  </div>
                  <div>
                        <Label>Doctor *</Label>
                        <Input
                          value={doctorName}
                          disabled
                          className="bg-gray-50 text-gray-700"
                        />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                        <Label>Appointment Date *</Label>
                        <Input
                          type="date"
                          value={selectedAppointment.appointmentDate}
                          disabled
                          className="bg-gray-50 text-gray-700"
                        />
                  </div>
                  <div>
                        <Label>Appointment Time *</Label>
                        <Input
                          type="time"
                          value={selectedAppointment.appointmentTime}
                          disabled
                          className="bg-gray-50 text-gray-700"
                        />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                        <Label>Appointment Status</Label>
                        <Input
                          value={selectedAppointment.appointmentStatus}
                          disabled
                          className="bg-gray-50 text-gray-700"
                        />
                  </div>
                  <div>
                        <Label>Consultation Charge (₹) *</Label>
                        <Input
                          type="number"
                          value={selectedAppointment.consultationCharge}
                          disabled
                          className="bg-gray-50 text-gray-700"
                        />
                  </div>
                </div>
                  <div>
                    <Label>Follow Up Details</Label>
                      <Textarea
                        value={selectedAppointment.followUpDetails || ''}
                        disabled
                        className="bg-gray-50 text-gray-700"
                        rows={2}
                      />
                  </div>
                    </div>
                  </div>
                <div className="flex justify-end gap-2 px-6 py-2 border-t bg-gray-50 flex-shrink-0">
                  <Button variant="outline" onClick={() => setIsViewDialogOpen(false)} className="py-1">Close</Button>
                    </div>
              </>
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
                  <div>
                    <Label>Token No</Label>
                    <Input value={selectedAppointment.tokenNo} disabled className="bg-gray-50 text-gray-700" />
                    <p className="text-xs text-gray-700 mt-1">Token No is auto-generated and cannot be changed</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="edit-patientId">Patient *</Label>
                      <Input
                        id="edit-patientId"
                        value={(() => {
                          const patient = patients.find(p => 
                            (p as any).patientId === editFormData.patientId || 
                            (p as any).PatientId === editFormData.patientId
                          );
                          if (patient) {
                            const patientId = (patient as any).patientId || (patient as any).PatientId || '';
                            const patientNo = (patient as any).patientNo || (patient as any).PatientNo || '';
                            const patientName = (patient as any).patientName || (patient as any).PatientName || '';
                            const lastName = (patient as any).lastName || (patient as any).LastName || '';
                            const fullName = `${patientName} ${lastName}`.trim();
                            return `${patientNo ? `${patientNo} - ` : ''}${fullName || 'Unknown'} (ID: ${patientId.substring(0, 8)})`;
                          }
                          return `Unknown (ID: ${editFormData.patientId ? editFormData.patientId.substring(0, 8) : 'N/A'})`;
                        })()}
                        disabled
                        className="bg-gray-50 text-gray-700"
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-doctorId">Doctor *</Label>
                      <Input
                        id="edit-doctorId"
                        value={(() => {
                          const doctor = appointmentDoctors.find(d => d.id.toString() === editFormData.doctorId);
                          if (doctor) {
                            return `${doctor.name} - ${doctor.specialty}`;
                          }
                          return editFormData.doctorId || 'Unknown';
                        })()}
                        disabled
                        className="bg-gray-50 text-gray-700"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="edit-appointmentDate">Appointment Date *</Label>
                      <Input
                        id="edit-appointmentDate"
                        type="date"
                        value={editFormData.appointmentDate}
                        onChange={(e) => setEditFormData({ ...editFormData, appointmentDate: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-appointmentTime">Appointment Time *</Label>
                      <Input
                        id="edit-appointmentTime"
                        type="time"
                        value={editFormData.appointmentTime}
                        onChange={(e) => setEditFormData({ ...editFormData, appointmentTime: e.target.value })}
                      />
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
                    <Label htmlFor="edit-followUpDetails">Follow Up Details</Label>
                    <Textarea
                      id="edit-followUpDetails"
                      placeholder="Enter follow up details..."
                      value={editFormData.followUpDetails}
                      onChange={(e) => setEditFormData({ ...editFormData, followUpDetails: e.target.value })}
                      rows={2}
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2 px-6 py-2 border-t bg-gray-50 flex-shrink-0">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="py-1">Cancel</Button>
                <Button 
                  onClick={async () => {
                    if (!selectedAppointment) return;
                    if (!editFormData.patientId || !editFormData.doctorId || !editFormData.appointmentDate || !editFormData.appointmentTime) {
                      alert('Please fill in all required fields.');
                      return;
                    }
                    try {
                      await updatePatientAppointment({
                        id: selectedAppointment.id,
                        patientId: editFormData.patientId,
                        doctorId: editFormData.doctorId,
                        appointmentDate: editFormData.appointmentDate,
                        appointmentTime: editFormData.appointmentTime,
                        appointmentStatus: editFormData.appointmentStatus,
                        consultationCharge: editFormData.consultationCharge,
                        followUpDetails: editFormData.followUpDetails || undefined,
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

function TokenList({ tokens, doctors }: { tokens: Token[]; doctors: Array<{ id: number; name: string; specialty: string; type: 'inhouse' | 'consulting' }> }) {
  return (
    <Card className="mb-4">
      <CardContent className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-gray-700">Token #</th>
                <th className="text-left py-3 px-4 text-gray-700">Patient Name</th>
                <th className="text-left py-3 px-4 text-gray-700">Phone</th>
                <th className="text-left py-3 px-4 text-gray-700">Doctor</th>
                <th className="text-left py-3 px-4 text-gray-700">Issue Time</th>
                <th className="text-left py-3 px-4 text-gray-700">Status</th>
                <th className="text-left py-3 px-4 text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tokens.map((token) => (
                <tr key={token.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <span className="px-3 py-1 bg-gray-100 text-gray-900 rounded">
                      {token.tokenNumber}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-900">
                    {token.patientName}
                    {token.isFollowUp && (
                      <span className="ml-2 px-2 py-0.5 rounded text-xs bg-green-100 text-green-700">
                        Follow-up
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-gray-600">{token.patientPhone}</td>
                  <td className="py-3 px-4 text-gray-600">
                    {token.doctorName}
                    {(() => {
                      const doctor = doctors.find(d => d.id === token.doctorId);
                      if (doctor) {
                        return (
                          <span className={`ml-2 px-2 py-0.5 rounded text-xs ${
                            doctor.type === 'inhouse' 
                              ? 'bg-blue-100 text-blue-700' 
                              : 'bg-purple-100 text-purple-700'
                          }`}>
                            {doctor.type === 'inhouse' ? 'Inhouse' : 'Consulting'}
                          </span>
                        );
                      }
                      return null;
                    })()}
                  </td>
                  <td className="py-3 px-4 text-gray-600">{token.issueTime}</td>
                  <td className="py-3 px-4">
                    <span className={`px-3 py-1 rounded-full text-xs ${
                      token.status === 'Waiting' ? 'bg-yellow-100 text-yellow-700' :
                      token.status === 'Consulting' ? 'bg-blue-100 text-blue-700' :
                      token.status === 'Completed' ? 'bg-green-100 text-green-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {token.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <Button variant="ghost" size="sm" className="gap-2">
                      <Printer className="size-4" />
                      Reprint
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {tokens.length === 0 && (
          <div className="text-center py-12 text-gray-700">
            No tokens found
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function AppointmentList({ 
  appointments, 
  doctors, 
  patients,
  onView,
  onEdit,
  onDelete
}: { 
  appointments: PatientAppointment[]; 
  doctors: Doctor[]; 
  patients: Patient[];
  onView: (appointment: PatientAppointment) => void;
  onEdit: (appointment: PatientAppointment) => void;
  onDelete: (appointment: PatientAppointment) => void;
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
      <CardContent className="p-4">
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-1.5 px-2 text-gray-700 font-bold text-xs">Token</th>
                <th className="text-left py-1.5 px-2 text-gray-700 font-bold text-xs">Patient ID</th>
                <th className="text-left py-1.5 px-2 text-gray-700 font-bold text-xs">Patient</th>
                <th className="text-left py-1.5 px-2 text-gray-700 font-bold text-xs">Phone</th>
                <th className="text-left py-1.5 px-2 text-gray-700 font-bold text-xs">Doctor</th>
                <th className="text-left py-1.5 px-2 text-gray-700 font-bold text-xs">Time</th>
                <th className="text-left py-1.5 px-2 text-gray-700 font-bold text-xs">Status</th>
                <th className="text-left py-1.5 px-2 text-gray-700 font-bold text-xs">Charges</th>
                <th className="text-left py-1.5 px-2 text-gray-700 font-bold text-xs">Admit</th>
                <th className="text-left py-1.5 px-2 text-gray-700 font-bold text-xs">Actions</th>
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
                const patientId = patient 
                  ? (patient as any).PatientNo || (patient as any).patientNo || appointment.patientId.substring(0, 8)
                  : appointment.patientId.substring(0, 8);
                
                return (
                  <tr key={appointment.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-1.5 px-2 text-gray-900 font-mono font-medium text-sm break-words">{appointment.tokenNo}</td>
                    <td className="py-1.5 px-2 text-gray-600 text-sm font-mono break-words">{patientId}</td>
                    <td className="py-1.5 px-2 text-gray-600 text-sm break-words min-w-[120px]">{patientName}</td>
                    <td className="py-1.5 px-2 text-gray-600 text-sm break-words">{patientPhone}</td>
                    <td className="py-1.5 px-2 text-gray-600 text-sm break-words min-w-[100px]">{doctorName}</td>
                    <td className="py-1.5 px-2 text-gray-600 text-sm break-words">{appointment.appointmentTime}</td>
                    <td className="py-1.5 px-2">{getStatusBadge(appointment.appointmentStatus)}</td>
                    <td className="py-1.5 px-2 text-gray-900 font-semibold text-sm break-words">
                      ₹{appointment.consultationCharge.toFixed(2)}
                    </td>
                    <td className="py-1.5 px-2">
                      {appointment.toBeAdmitted ? (
                        <Badge variant="outline" className="bg-red-100 text-red-700 border-red-300 text-xs">
                          <Hospital className="size-2.5 mr-0.5" />Yes
                        </Badge>
                      ) : (
                        <span className="text-gray-700 text-sm">No</span>
                      )}
                    </td>
                    <td className="py-1.5 px-2">
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onView(appointment)}
                          className="h-6 w-6 p-0"
                        >
                          <Eye className="size-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit(appointment)}
                          className="h-6 w-6 p-0"
                        >
                          <Edit className="size-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDelete(appointment)}
                          className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="size-3" />
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
          <div className="text-center py-12 text-gray-700">
            No appointments found
          </div>
        )}
      </CardContent>
    </Card>
  );
}
