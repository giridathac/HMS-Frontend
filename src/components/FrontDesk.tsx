// Front Desk Component - Displays FrontDesk appointment data in PR table format
import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Textarea } from './ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Search, Eye, Edit, Trash2, Clock, Stethoscope, CheckCircle2, Hospital, Plus, Users } from 'lucide-react';
import { usePatientAppointments } from '../hooks/usePatientAppointments';
import { useStaff } from '../hooks/useStaff';
import { useRoles } from '../hooks/useRoles';
import { useDepartments } from '../hooks/useDepartments';
import { patientsApi } from '../api/patients';
import { Patient, PatientAppointment, Doctor } from '../types';

export function FrontDesk() {
  const { patientAppointments, loading: appointmentsLoading, error: appointmentsError, fetchPatientAppointments, createPatientAppointment, updatePatientAppointment, deletePatientAppointment } = usePatientAppointments();
  const { staff } = useStaff();
  const { roles } = useRoles();
  const { departments } = useDepartments();
  const [searchTerm, setSearchTerm] = useState('');
  const [patients, setPatients] = useState<Patient[]>([]);
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
    fetchPatientAppointments().catch((err) => {
      console.error('Error fetching appointments:', err);
    });
  }, [fetchPatientAppointments]);

  // Filter appointments based on search term (same logic as FrontDesk)
  const filteredAppointments = useMemo(() => {
    if (!patientAppointments || patientAppointments.length === 0) return [];
    
    return patientAppointments.filter(appointment => {
      if (!searchTerm) return true;
      
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
      
      const searchLower = searchTerm.toLowerCase();
      return (
        appointment.tokenNo?.toLowerCase().includes(searchLower) ||
        patientName.toLowerCase().includes(searchLower) ||
        doctorName.toLowerCase().includes(searchLower) ||
        patientPhone.includes(searchTerm) ||
        patientId.toLowerCase().includes(searchLower) ||
        appointment.patientId.toLowerCase().includes(searchLower)
      );
    });
  }, [patientAppointments, searchTerm, patients, appointmentDoctors]);

  const getAppointmentsByStatus = (status: PatientAppointment['appointmentStatus']) => {
    return filteredAppointments.filter(a => a.appointmentStatus === status);
  };

  const getStatusBadge = (status: PatientAppointment['appointmentStatus']) => {
    switch (status) {
      case 'Waiting':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-700 border-yellow-300"><Clock className="size-3 mr-1" />Waiting</Badge>;
      case 'Consulting':
        return <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-300"><Stethoscope className="size-3 mr-1" />Consulting</Badge>;
      case 'Completed':
        return <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300"><CheckCircle2 className="size-3 mr-1" />Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleViewAppointment = (appointment: PatientAppointment) => {
    setSelectedAppointment(appointment);
    setIsViewDialogOpen(true);
  };

  const handleEditAppointment = (appointment: PatientAppointment) => {
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
  };

  const handleDeleteAppointment = async (appointment: PatientAppointment) => {
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
  };

  // Helper function to render appointments table
  const renderAppointmentsTable = (appointments: PatientAppointment[]) => {
    return (
      <Card className="dashboard-table-card">
        <CardContent className="dashboard-table-card-content">
          <div className="dashboard-table-wrapper">
            <table className="dashboard-table">
              <thead>
                <tr className="dashboard-table-header-row">
                  <th className="dashboard-table-header-cell">Token</th>
                  <th className="dashboard-table-header-cell">Patient</th>
                  <th className="dashboard-table-header-cell">Phone</th>
                  <th className="dashboard-table-header-cell">Doctor</th>
                  <th className="dashboard-table-header-cell">Time</th>
                  <th className="dashboard-table-header-cell">Status</th>
                  <th className="dashboard-table-header-cell">Admit</th>
                  <th className="dashboard-table-header-cell">Actions</th>
                </tr>
              </thead>
              <tbody>
                {appointments.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="dashboard-table-empty-cell">
                      {searchTerm ? 'No appointments found matching your search.' : 'No appointments found.'}
                    </td>
                  </tr>
                ) : (
                  appointments.map((appointment) => {
                    const patient = patients.find(p => 
                      (p as any).patientId === appointment.patientId || 
                      (p as any).PatientId === appointment.patientId
                    );
                    const doctor = appointmentDoctors.find(d => d.id.toString() === appointment.doctorId);
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
                      <tr key={appointment.id} className="dashboard-table-body-row">
                        <td className="dashboard-table-body-cell dashboard-table-body-cell-primary">{appointment.tokenNo}</td>
                        <td className="dashboard-table-body-cell dashboard-table-body-cell-secondary dashboard-table-cell-min-width">{patientName}</td>
                        <td className="dashboard-table-body-cell dashboard-table-body-cell-secondary">{patientPhone}</td>
                        <td className="dashboard-table-body-cell dashboard-table-body-cell-secondary">{doctorName}</td>
                        <td className="dashboard-table-body-cell dashboard-table-body-cell-secondary">{appointment.appointmentTime}</td>
                        <td className="dashboard-table-body-cell">{getStatusBadge(appointment.appointmentStatus)}</td>
                        <td className="dashboard-table-body-cell">
                          {appointment.toBeAdmitted ? (
                            <Badge variant="outline" className="bg-red-100 text-red-700 border-red-300 text-xs">
                              <Hospital className="size-2.5 mr-0.5" />Yes
                            </Badge>
                          ) : (
                            <span className="text-gray-700" style={{ fontSize: '1.125rem' }}>No</span>
                          )}
                        </td>
                        <td className="dashboard-table-body-cell">
                          <div className="dashboard-actions-container">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewAppointment(appointment)}
                              className="dashboard-action-button"
                              title="View Appointment"
                            >
                              <Eye className="dashboard-action-button-icon" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditAppointment(appointment)}
                              className="dashboard-action-button"
                              title="Edit Appointment"
                            >
                              <Edit className="dashboard-action-button-icon" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteAppointment(appointment)}
                              className="dashboard-action-button dashboard-action-button-delete"
                              title="Delete Appointment"
                            >
                              <Trash2 className="dashboard-action-button-icon" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (appointmentsLoading) {
    return (
      <div className="flex-1 bg-gray-50 flex flex-col overflow-hidden min-h-0 dashboard-scrollable" style={{ maxHeight: '100vh', minHeight: 0 }}>
        <div className="overflow-y-auto overflow-x-hidden flex-1 flex flex-col min-h-0">
          <div className="px-6 pt-6 pb-0 flex-shrink-0">
            <div className="text-center py-12 text-gray-600">Loading appointments...</div>
          </div>
        </div>
      </div>
    );
  }

  if (appointmentsError) {
    return (
      <div className="flex-1 bg-gray-50 flex flex-col overflow-hidden min-h-0 dashboard-scrollable" style={{ maxHeight: '100vh', minHeight: 0 }}>
        <div className="overflow-y-auto overflow-x-hidden flex-1 flex flex-col min-h-0">
          <div className="px-6 pt-6 pb-0 flex-shrink-0">
            <div className="text-center py-12 text-red-600">Error: {appointmentsError}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gray-50 flex flex-col overflow-hidden min-h-0 dashboard-scrollable" style={{ maxHeight: '100vh', minHeight: 0 }}>
      <div className="overflow-y-auto overflow-x-hidden flex-1 flex flex-col min-h-0">
        <div className="px-6 pt-6 pb-0 flex-shrink-0">
          <div className="flex items-center justify-between mb-4 flex-shrink-0">
            <div>
              <h1 className="dashboard-header">Front Desk - Patient Appointments</h1>
              <p className="dashboard-subheader">Manage patient appointments</p>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="size-4" />
                Add Appointment
              </Button>
            </DialogTrigger>
            <DialogContent className="p-0 gap-0 large-dialog dialog-content-standard">
              <div className="dialog-scrollable-wrapper dialog-content-scrollable">
                <DialogHeader className="dialog-header-standard">
                  <DialogTitle className="dialog-title-standard-view">Add New Patient Appointment</DialogTitle>
                </DialogHeader>
                <div className="dialog-body-content-wrapper">
                  <div className="dialog-form-container">
                  <div className="dialog-form-field">
                    <Label htmlFor="add-patient-search" className="dialog-label-standard">Patient *</Label>
                    <div className="relative mb-2">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                      <Input
                        id="add-patient-search"
                        placeholder="Search by Patient ID, Name, or Mobile Number..."
                        value={patientSearchTerm}
                        onChange={(e) => setPatientSearchTerm(e.target.value)}
                        className="pl-10 dialog-input-standard"
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
                                    className={`border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${isSelected ? 'bg-gray-100' : ''}`}
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
                      <div className="mt-2 p-2 bg-gray-50 border border-gray-200 rounded text-sm text-gray-700">
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
                  <div className="dialog-form-field">
                    <Label htmlFor="add-doctor-search" className="dialog-label-standard">Doctor *</Label>
                    <div className="relative mb-2">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                      <Input
                        id="add-doctor-search"
                        placeholder="Search by Doctor Name or Specialty..."
                        value={doctorSearchTerm}
                        onChange={(e) => setDoctorSearchTerm(e.target.value)}
                        className="pl-10 dialog-input-standard"
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
                                    className={`border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${isSelected ? 'bg-gray-100' : ''}`}
                                  >
                                    <td className="py-2 px-3 text-sm text-gray-900">{doctor.name}</td>
                                    <td className="py-2 px-3 text-sm text-gray-600">{doctor.specialty}</td>
                                    <td className="py-2 px-3 text-sm">
                                      <span className={`px-2 py-0.5 rounded text-xs ${
                                        doctor.type === 'inhouse' 
                                          ? 'bg-gray-100 text-gray-700' 
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
                      <div className="mt-2 p-2 bg-gray-50 border border-gray-200 rounded text-sm text-gray-700">
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
                  <div className="dialog-form-field-grid">
                    <div className="dialog-field-single-column">
                      <Label htmlFor="add-appointmentDate" className="dialog-label-standard">Appointment Date *</Label>
                      <Input
                        id="add-appointmentDate"
                        type="date"
                        value={addFormData.appointmentDate}
                        onChange={(e) => setAddFormData({ ...addFormData, appointmentDate: e.target.value })}
                        className="dialog-input-standard"
                      />
                    </div>
                    <div className="dialog-field-single-column">
                      <Label htmlFor="add-appointmentTime" className="dialog-label-standard">Appointment Time *</Label>
                      <Input
                        id="add-appointmentTime"
                        type="time"
                        value={addFormData.appointmentTime}
                        onChange={(e) => setAddFormData({ ...addFormData, appointmentTime: e.target.value })}
                        className="dialog-input-standard"
                      />
                    </div>
                  </div>
                  <div className="dialog-form-field-grid">
                    <div className="dialog-field-single-column">
                      <Label htmlFor="add-appointmentStatus" className="dialog-label-standard">Appointment Status</Label>
                      <select
                        id="add-appointmentStatus"
                        aria-label="Appointment Status"
                        className="dialog-select-standard"
                        value={addFormData.appointmentStatus}
                        onChange={(e) => setAddFormData({ ...addFormData, appointmentStatus: e.target.value as PatientAppointment['appointmentStatus'] })}
                      >
                        <option value="Waiting">Waiting</option>
                        <option value="Consulting">Consulting</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </div>
                    <div className="dialog-field-single-column">
                      <Label htmlFor="add-consultationCharge" className="dialog-label-standard">Consultation Charge (₹) *</Label>
                      <Input
                        id="add-consultationCharge"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="e.g., 500"
                        value={addFormData.consultationCharge}
                        onChange={(e) => setAddFormData({ ...addFormData, consultationCharge: parseFloat(e.target.value) || 0 })}
                        className="dialog-input-standard"
                      />
                    </div>
                  </div>
                </div>
                </div>
                <div className="dialog-footer-standard">
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
                  }} className="dialog-footer-button">Cancel</Button>
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
                    className="dialog-footer-button"
                  >
                    Create Appointment
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          </div>
        </div>
        <div className="px-6 pt-4 pb-4 flex-1">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="dashboard-stats-card">
            <CardContent className="dashboard-stats-card-content">
              <div className="dashboard-stats-icon-container">
                <div className="bg-gray-500 dashboard-stats-icon-bg">
                  <Users className="size-7 text-white" strokeWidth={2} />
                </div>
              </div>
              <h3 className="dashboard-stats-number">{patientAppointments.length}</h3>
              <p className="dashboard-stats-label">Total Appointments</p>
            </CardContent>
          </Card>
          <Card className="dashboard-stats-card">
            <CardContent className="dashboard-stats-card-content">
              <div className="dashboard-stats-icon-container">
                <div className="bg-orange-500 dashboard-stats-icon-bg">
                  <Clock className="size-7 text-white" strokeWidth={2} />
                </div>
              </div>
              <h3 className="dashboard-stats-number">{getAppointmentsByStatus('Waiting').length}</h3>
              <p className="dashboard-stats-label">Waiting</p>
            </CardContent>
          </Card>
          <Card className="dashboard-stats-card">
            <CardContent className="dashboard-stats-card-content">
              <div className="dashboard-stats-icon-container">
                <div className="bg-purple-500 dashboard-stats-icon-bg">
                  <Stethoscope className="size-7 text-white" strokeWidth={2} />
                </div>
              </div>
              <h3 className="dashboard-stats-number">{getAppointmentsByStatus('Consulting').length}</h3>
              <p className="dashboard-stats-label">Consulting</p>
            </CardContent>
          </Card>
          <Card className="dashboard-stats-card">
            <CardContent className="dashboard-stats-card-content">
              <div className="dashboard-stats-icon-container">
                <div className="bg-green-500 dashboard-stats-icon-bg">
                  <CheckCircle2 className="size-7 text-white" strokeWidth={2} />
                </div>
              </div>
              <h3 className="dashboard-stats-number">{getAppointmentsByStatus('Completed').length}</h3>
              <p className="dashboard-stats-label">Completed</p>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card className="mb-6 bg-white">
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
              <Input
                placeholder="Search by token no, patient, or doctor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-50"
              />
            </div>
          </CardContent>
        </Card>

        {/* Appointments Table with Tabs */}
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList>
            <TabsTrigger value="all">All Appointments ({filteredAppointments.length})</TabsTrigger>
            <TabsTrigger value="waiting">Waiting ({getAppointmentsByStatus('Waiting').length})</TabsTrigger>
            <TabsTrigger value="consulting">Consulting ({getAppointmentsByStatus('Consulting').length})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({getAppointmentsByStatus('Completed').length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            {renderAppointmentsTable(filteredAppointments)}
          </TabsContent>

          <TabsContent value="waiting">
            {renderAppointmentsTable(getAppointmentsByStatus('Waiting'))}
          </TabsContent>

          <TabsContent value="consulting">
            {renderAppointmentsTable(getAppointmentsByStatus('Consulting'))}
          </TabsContent>

          <TabsContent value="completed">
            {renderAppointmentsTable(getAppointmentsByStatus('Completed'))}
          </TabsContent>
        </Tabs>
      </div>

      {/* View Appointment Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="p-0 gap-0 large-dialog dialog-content-standard">
          <div className="dialog-scrollable-wrapper dialog-content-scrollable">
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
                  <DialogHeader className="dialog-header-standard">
                    <DialogTitle className="dialog-title-standard-view">View Patient Appointment</DialogTitle>
                  </DialogHeader>
                  <div className="dialog-body-content-wrapper">
                  <div className="dialog-form-container">
                    <div className="dialog-form-field">
                      <Label className="dialog-label-standard">Token No</Label>
                      <Input value={selectedAppointment.tokenNo} disabled className="dialog-input-disabled" />
                    </div>
                    <div className="dialog-form-field-grid">
                      <div className="dialog-field-single-column">
                        <Label className="dialog-label-standard">Patient *</Label>
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
                          className="dialog-input-disabled"
                        />
                      </div>
                      <div className="dialog-field-single-column">
                        <Label className="dialog-label-standard">Doctor *</Label>
                        <Input
                          value={doctorName}
                          disabled
                          className="dialog-input-disabled"
                        />
                      </div>
                    </div>
                    <div className="dialog-form-field-grid">
                      <div className="dialog-field-single-column">
                        <Label className="dialog-label-standard">Appointment Date *</Label>
                        <Input
                          type="date"
                          value={selectedAppointment.appointmentDate}
                          disabled
                          className="dialog-input-disabled"
                        />
                      </div>
                      <div className="dialog-field-single-column">
                        <Label className="dialog-label-standard">Appointment Time *</Label>
                        <Input
                          type="time"
                          value={selectedAppointment.appointmentTime}
                          disabled
                          className="dialog-input-disabled"
                        />
                      </div>
                    </div>
                    <div className="dialog-form-field-grid">
                      <div className="dialog-field-single-column">
                        <Label className="dialog-label-standard">Appointment Status</Label>
                        <Input
                          value={selectedAppointment.appointmentStatus}
                          disabled
                          className="dialog-input-disabled"
                        />
                      </div>
                      <div className="dialog-field-single-column">
                        <Label className="dialog-label-standard">Consultation Charge (₹) *</Label>
                        <Input
                          type="number"
                          value={selectedAppointment.consultationCharge}
                          disabled
                          className="dialog-input-disabled"
                        />
                      </div>
                    </div>
                    <div className="dialog-form-field">
                      <Label className="dialog-label-standard">Follow Up Details</Label>
                      <Textarea
                        value={selectedAppointment.followUpDetails || ''}
                        disabled
                        className="dialog-textarea-standard"
                        style={{ fontSize: '1.125rem' }}
                        rows={2}
                      />
                    </div>
                  </div>
                  </div>
                  <div className="dialog-footer-standard">
                    <Button variant="outline" onClick={() => setIsViewDialogOpen(false)} className="dialog-footer-button">Close</Button>
                  </div>
                </>
              );
            })()}
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Appointment Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="p-0 gap-0 large-dialog bg-white">
          <div className="flex-1 overflow-y-auto dialog-content-scrollable min-h-0 bg-white">
            {selectedAppointment && (
              <>
                <DialogHeader className="px-6 pt-4 pb-3 bg-white">
                  <DialogTitle className="text-gray-700" style={{ fontSize: '1.25rem' }}>Edit Patient Appointment</DialogTitle>
                </DialogHeader>
                <div className="px-6 pb-1">
                  <div className="space-y-4 py-4">
                  <div>
                    <Label className="text-gray-600" style={{ fontSize: '1.125rem' }}>Token No</Label>
                    <Input value={selectedAppointment.tokenNo} disabled className="bg-gray-50 text-gray-700" style={{ fontSize: '1.125rem' }} />
                    <p className="text-xs text-gray-700 mt-1">Token No is auto-generated and cannot be changed</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="edit-patientId" className="text-gray-600" style={{ fontSize: '1.125rem' }}>Patient *</Label>
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
                        style={{ fontSize: '1.125rem' }}
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-doctorId" className="text-gray-600" style={{ fontSize: '1.125rem' }}>Doctor *</Label>
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
                        style={{ fontSize: '1.125rem' }}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="edit-appointmentDate" className="text-gray-600" style={{ fontSize: '1.125rem' }}>Appointment Date *</Label>
                      <Input
                        id="edit-appointmentDate"
                        type="date"
                        value={editFormData.appointmentDate}
                        onChange={(e) => setEditFormData({ ...editFormData, appointmentDate: e.target.value })}
                        className="text-gray-700 bg-gray-100"
                        style={{ fontSize: '1.125rem' }}
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-appointmentTime" className="text-gray-600" style={{ fontSize: '1.125rem' }}>Appointment Time *</Label>
                      <Input
                        id="edit-appointmentTime"
                        type="time"
                        value={editFormData.appointmentTime}
                        onChange={(e) => setEditFormData({ ...editFormData, appointmentTime: e.target.value })}
                        className="text-gray-700 bg-gray-100"
                        style={{ fontSize: '1.125rem' }}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="edit-appointmentStatus" className="text-gray-600" style={{ fontSize: '1.125rem' }}>Appointment Status</Label>
                      <select
                        id="edit-appointmentStatus"
                        aria-label="Appointment Status"
                        className="w-full px-3 py-2 border border-gray-200 rounded-md text-gray-700 bg-gray-100"
                        value={editFormData.appointmentStatus}
                        onChange={(e) => setEditFormData({ ...editFormData, appointmentStatus: e.target.value as PatientAppointment['appointmentStatus'] })}
                        style={{ fontSize: '1.125rem' }}
                      >
                        <option value="Waiting">Waiting</option>
                        <option value="Consulting">Consulting</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="edit-consultationCharge" className="text-gray-600" style={{ fontSize: '1.125rem' }}>Consultation Charge (₹) *</Label>
                      <Input
                        id="edit-consultationCharge"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="e.g., 500"
                        value={editFormData.consultationCharge}
                        onChange={(e) => setEditFormData({ ...editFormData, consultationCharge: parseFloat(e.target.value) || 0 })}
                        className="text-gray-700 bg-gray-100"
                        style={{ fontSize: '1.125rem' }}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="edit-followUpDetails" className="text-gray-600" style={{ fontSize: '1.125rem' }}>Follow Up Details</Label>
                    <Textarea
                      id="edit-followUpDetails"
                      placeholder="Enter follow up details..."
                      value={editFormData.followUpDetails}
                      onChange={(e) => setEditFormData({ ...editFormData, followUpDetails: e.target.value })}
                      rows={2}
                      className="text-gray-700 bg-gray-100"
                      style={{ fontSize: '1.125rem' }}
                    />
                  </div>
                </div>
                </div>
                <div className="flex justify-end gap-2 px-6 py-2 border-t bg-white flex-shrink-0">
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
          </div>
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
}
