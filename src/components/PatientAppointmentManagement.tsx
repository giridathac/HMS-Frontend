import React, { useState, useCallback, useMemo } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Badge } from './ui/badge';
import { Calendar, Plus, Edit, Trash2, CheckCircle2, XCircle, Clock, Stethoscope, FileText, Hospital, Check, Maximize2, Minimize2 } from 'lucide-react';
import { usePatientAppointments } from '../hooks/usePatientAppointments';
import { PatientAppointment } from '../types';
import { CreatePatientAppointmentDto } from '../api/patientAppointments';
import { patientsApi } from '../api/patients';
import { doctorsApi, AttendanceRecord } from '../api/doctors';
import { Patient, Doctor } from '../types';
import { useStaff } from '../hooks/useStaff';
import { useRoles } from '../hooks/useRoles';
import { useDepartments } from '../hooks/useDepartments';

export function PatientAppointmentManagement() {
  const { patientAppointments, loading, error, createPatientAppointment, updatePatientAppointment, deletePatientAppointment } = usePatientAppointments();
  const { staff } = useStaff();
  const { roles } = useRoles();
  const { departments } = useDepartments();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<PatientAppointment | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [isDialogExpanded, setIsDialogExpanded] = useState(false);
  const [formData, setFormData] = useState({
    patientId: '',
    doctorId: '',
    appointmentDate: new Date().toISOString().split('T')[0],
    appointmentTime: new Date().toTimeString().slice(0, 5),
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
  const doctors = useMemo(() => {
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

  // Fetch patients and attendance
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const today = new Date().toISOString().split('T')[0];
        const [patientsData, attendanceData] = await Promise.all([
          patientsApi.getAll(),
          doctorsApi.getAttendance(undefined, today),
        ]);
        setPatients(patientsData);
        setAttendance(attendanceData);
        
        // Log if no patients are registered
        if (patientsData.length === 0) {
          console.log('No patients registered. Using dummy patient for testing purposes.');
        }
      } catch (err) {
        console.error('Failed to fetch patients or attendance:', err);
      }
    };
    fetchData();
  }, []);

  const handleCreateAppointment = useCallback(async (data: CreatePatientAppointmentDto) => {
    try {
      const doctor = doctors.find(d => d.id.toString() === data.doctorId);
      const doctorName = doctor?.name || 'Doctor';
      const appointment = await createPatientAppointment(data, doctorName);
      
      // If ReferToAnotherDoctor is Yes, create an appointment for the referred doctor
      if (data.referToAnotherDoctor && data.referredDoctorId) {
        const referredDoctor = doctors.find(d => d.id.toString() === data.referredDoctorId);
        const referredDoctorName = referredDoctor?.name || 'Doctor';
        await createPatientAppointment({
          ...data,
          doctorId: data.referredDoctorId,
        }, referredDoctorName);
      }
      
      return true;
    } catch (err) {
      console.error('Failed to create appointment:', err);
      throw err;
    }
  }, [createPatientAppointment, doctors]);

  const handleUpdateAppointment = useCallback(async (id: number, data: Partial<CreatePatientAppointmentDto>) => {
    try {
      await updatePatientAppointment({ id, ...data });
      return true;
    } catch (err) {
      console.error('Failed to update appointment:', err);
      throw err;
    }
  }, [updatePatientAppointment]);

  const handleDeleteAppointment = useCallback(async (id: number) => {
    if (confirm('Are you sure you want to delete this appointment? This action cannot be undone.')) {
      try {
        await deletePatientAppointment(id);
      } catch (err) {
        console.error('Failed to delete appointment:', err);
      }
    }
  }, [deletePatientAppointment]);

  const handleAddSubmit = async () => {
    if (!formData.patientId || !formData.doctorId || !formData.appointmentDate || !formData.appointmentTime) {
      alert('Please fill in all required fields.');
      return;
    }
    if (formData.referToAnotherDoctor && !formData.referredDoctorId) {
      alert('Please select a referred doctor when "Refer To Another Doctor" is checked.');
      return;
    }
    if (formData.transferToIPDOTICU && !formData.transferTo) {
      alert('Please select a transfer destination when "Transfer To IPD/OT/ICU" is checked.');
      return;
    }
    try {
      await handleCreateAppointment({
        patientId: formData.patientId,
        doctorId: formData.doctorId,
        appointmentDate: formData.appointmentDate,
        appointmentTime: formData.appointmentTime,
        appointmentStatus: formData.appointmentStatus,
        consultationCharge: formData.consultationCharge,
        diagnosis: formData.diagnosis || undefined,
        followUpDetails: formData.followUpDetails || undefined,
        prescriptionsUrl: formData.prescriptionsUrl || undefined,
        toBeAdmitted: formData.toBeAdmitted,
        referToAnotherDoctor: formData.referToAnotherDoctor,
        referredDoctorId: formData.referToAnotherDoctor ? formData.referredDoctorId : undefined,
        transferToIPDOTICU: formData.transferToIPDOTICU,
        transferTo: formData.transferToIPDOTICU ? formData.transferTo : undefined,
        transferDetails: formData.transferDetails || undefined,
        billId: formData.billId || undefined,
      });
      setIsAddDialogOpen(false);
      setFormData({
        patientId: '',
        doctorId: '',
        appointmentDate: new Date().toISOString().split('T')[0],
        appointmentTime: new Date().toTimeString().slice(0, 5),
        appointmentStatus: 'Waiting',
        consultationCharge: 0,
        diagnosis: '',
        followUpDetails: '',
        prescriptionsUrl: '',
        toBeAdmitted: false,
        referToAnotherDoctor: false,
        referredDoctorId: '',
        transferToIPDOTICU: false,
        transferTo: undefined,
        transferDetails: '',
        billId: '',
      });
    } catch (err) {
      // Error handled in parent
    }
  };

  const handleEditSubmit = async () => {
    if (!selectedAppointment) return;
    if (!formData.patientId || !formData.doctorId || !formData.appointmentDate || !formData.appointmentTime) {
      alert('Please fill in all required fields.');
      return;
    }
    if (formData.referToAnotherDoctor && !formData.referredDoctorId) {
      alert('Please select a referred doctor when "Refer To Another Doctor" is checked.');
      return;
    }
    if (formData.transferToIPDOTICU && !formData.transferTo) {
      alert('Please select a transfer destination when "Transfer To IPD/OT/ICU" is checked.');
      return;
    }
    try {
      await handleUpdateAppointment(selectedAppointment.id, {
        patientId: formData.patientId,
        doctorId: formData.doctorId,
        appointmentDate: formData.appointmentDate,
        appointmentTime: formData.appointmentTime,
        appointmentStatus: formData.appointmentStatus,
        consultationCharge: formData.consultationCharge,
        diagnosis: formData.diagnosis || undefined,
        followUpDetails: formData.followUpDetails || undefined,
        prescriptionsUrl: formData.prescriptionsUrl || undefined,
        toBeAdmitted: formData.toBeAdmitted,
        referToAnotherDoctor: formData.referToAnotherDoctor,
        referredDoctorId: formData.referToAnotherDoctor ? formData.referredDoctorId : undefined,
        transferToIPDOTICU: formData.transferToIPDOTICU,
        transferTo: formData.transferToIPDOTICU ? formData.transferTo : undefined,
        transferDetails: formData.transferDetails || undefined,
        billId: formData.billId || undefined,
      });
      setIsEditDialogOpen(false);
      setSelectedAppointment(null);
      setFormData({
        patientId: '',
        doctorId: '',
        appointmentDate: new Date().toISOString().split('T')[0],
        appointmentTime: new Date().toTimeString().slice(0, 5),
        appointmentStatus: 'Waiting',
        consultationCharge: 0,
        diagnosis: '',
        followUpDetails: '',
        prescriptionsUrl: '',
        toBeAdmitted: false,
        referToAnotherDoctor: false,
        referredDoctorId: '',
        transferToIPDOTICU: false,
        transferTo: undefined,
        transferDetails: '',
        billId: '',
      });
    } catch (err) {
      // Error handled in parent
    }
  };

  const handleEdit = (appointment: PatientAppointment) => {
    setSelectedAppointment(appointment);
    setFormData({
      patientId: appointment.patientId,
      doctorId: appointment.doctorId,
      appointmentDate: appointment.appointmentDate,
      appointmentTime: appointment.appointmentTime,
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
  };

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

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center py-12 text-blue-600">Loading patient appointments...</div>
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
    <>
      <div className="px-4 pt-4 pb-2 bg-blue-100 h-screen flex flex-col overflow-hidden">
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
          <div>
            <h1 className="text-gray-900 mb-0 text-xl">Patient Appointments</h1>
            <p className="text-gray-500 text-sm">Manage patient appointments and consultations</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="size-4" />
              Add Appointment
            </Button>
          </DialogTrigger>
          <DialogContent 
            className="p-0 gap-0 large-dialog"
          >
            <DialogHeader className="px-6 pt-4 pb-3 flex-shrink-0">
              <DialogTitle>Add New Patient Appointment</DialogTitle>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto px-6 pb-1 patient-list-scrollable min-h-0">
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="patientId">Patient *</Label>
                    <select
                      id="patientId"
                      aria-label="Patient"
                      className="w-full px-3 py-2 border border-gray-200 rounded-md"
                      value={formData.patientId}
                      onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                    >
                      <option value="">Select Patient</option>
                      {patients.length > 0 ? (
                        patients.map(patient => {
                          const patientId = (patient as any).patientId || (patient as any).PatientId || '';
                          const patientName = (patient as any).patientName || (patient as any).PatientName || '';
                          const lastName = (patient as any).lastName || (patient as any).LastName || '';
                          return (
                            <option key={patientId} value={patientId}>
                              {patientName} {lastName} - {patientId}
                            </option>
                          );
                        })
                      ) : (
                        <>
                          <option value="00000000-0000-0000-0000-000000000001">Dummy Patient Name - 00000000-0000-0000-0000-000000000001</option>
                        </>
                      )}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="doctorId">Doctor *</Label>
                    <select
                      id="doctorId"
                      aria-label="Doctor"
                      className="w-full px-3 py-2 border border-gray-200 rounded-md"
                      value={formData.doctorId}
                      onChange={(e) => setFormData({ ...formData, doctorId: e.target.value })}
                    >
                      <option value="">Select Doctor</option>
                      {doctors.length > 0 ? (
                        doctors.map(doctor => (
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
                    <Label htmlFor="appointmentDate">Appointment Date *</Label>
                    <Input
                      id="appointmentDate"
                      type="date"
                      value={formData.appointmentDate}
                      onChange={(e) => setFormData({ ...formData, appointmentDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="appointmentTime">Appointment Time *</Label>
                    <Input
                      id="appointmentTime"
                      type="time"
                      value={formData.appointmentTime}
                      onChange={(e) => setFormData({ ...formData, appointmentTime: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="appointmentStatus">Appointment Status</Label>
                    <select
                      id="appointmentStatus"
                      aria-label="Appointment Status"
                      className="w-full px-3 py-2 border border-gray-200 rounded-md"
                      value={formData.appointmentStatus}
                      onChange={(e) => setFormData({ ...formData, appointmentStatus: e.target.value as PatientAppointment['appointmentStatus'] })}
                    >
                      <option value="Waiting">Waiting</option>
                      <option value="Consulting">Consulting</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="consultationCharge">Consultation Charge (₹) *</Label>
                    <Input
                      id="consultationCharge"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="e.g., 500"
                      value={formData.consultationCharge}
                      onChange={(e) => setFormData({ ...formData, consultationCharge: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="diagnosis">Diagnosis</Label>
                  <Textarea
                    id="diagnosis"
                    placeholder="Enter diagnosis..."
                    value={formData.diagnosis}
                    onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="followUpDetails">Follow Up Details</Label>
                  <Textarea
                    id="followUpDetails"
                    placeholder="Enter follow up details..."
                    value={formData.followUpDetails}
                    onChange={(e) => setFormData({ ...formData, followUpDetails: e.target.value })}
                    rows={2}
                  />
                </div>
                <div>
                  <Label htmlFor="prescriptionsUrl">Prescriptions URL</Label>
                  <Input
                    id="prescriptionsUrl"
                    type="url"
                    placeholder="https://prescriptions.example.com/..."
                    value={formData.prescriptionsUrl}
                    onChange={(e) => setFormData({ ...formData, prescriptionsUrl: e.target.value })}
                  />
                  <p className="text-xs text-gray-500 mt-1">Folder URL - multiple prescriptions should be saved</p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="toBeAdmitted"
                    aria-label="To Be Admitted (Yes - converted to IPD)"
                    checked={formData.toBeAdmitted}
                    onChange={(e) => setFormData({ ...formData, toBeAdmitted: e.target.checked })}
                    className="rounded"
                  />
                  <Label htmlFor="toBeAdmitted" className="cursor-pointer">To Be Admitted (Yes - converted to IPD)</Label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="referToAnotherDoctor"
                    aria-label="Refer to Another Doctor"
                    checked={formData.referToAnotherDoctor}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      referToAnotherDoctor: e.target.checked, 
                      referredDoctorId: e.target.checked ? formData.referredDoctorId : '',
                      appointmentStatus: e.target.checked ? 'Completed' : 'Waiting'
                    })}
                    className="rounded"
                  />
                  <Label htmlFor="referToAnotherDoctor" className="cursor-pointer">Refer To Another Doctor</Label>
                </div>
                {formData.referToAnotherDoctor && (
                  <div>
                    <Label htmlFor="referredDoctorId">Referred Doctor *</Label>
                    <select
                      id="referredDoctorId"
                      aria-label="Referred Doctor"
                      className="w-full px-3 py-2 border border-gray-200 rounded-md"
                      value={formData.referredDoctorId}
                      onChange={(e) => setFormData({ ...formData, referredDoctorId: e.target.value })}
                    >
                      <option value="">Select Referred Doctor</option>
                      {doctors.length > 0 ? (
                        doctors.map(doctor => (
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
                    id="transferToIPDOTICU"
                    aria-label="Transfer to IPD/OT/ICU"
                    checked={formData.transferToIPDOTICU}
                    onChange={(e) => setFormData({ ...formData, transferToIPDOTICU: e.target.checked, transferTo: e.target.checked ? formData.transferTo : undefined })}
                    className="rounded"
                  />
                  <Label htmlFor="transferToIPDOTICU" className="cursor-pointer">Transfer To IPD/OT/ICU</Label>
                </div>
                {formData.transferToIPDOTICU && (
                  <div>
                    <Label htmlFor="transferTo">Transfer To *</Label>
                    <select
                      id="transferTo"
                      aria-label="Transfer To"
                      className="w-full px-3 py-2 border border-gray-200 rounded-md"
                      value={formData.transferTo || ''}
                      onChange={(e) => setFormData({ ...formData, transferTo: e.target.value as 'IPD Room Admission' | 'ICU' | 'OT' })}
                    >
                      <option value="">Select Transfer Destination</option>
                      <option value="IPD Room Admission">IPD Room Admission</option>
                      <option value="ICU">ICU</option>
                      <option value="OT">OT</option>
                    </select>
                  </div>
                )}
                {formData.transferToIPDOTICU && (
                  <div>
                    <Label htmlFor="transferDetails">Transfer Details</Label>
                    <Textarea
                      id="transferDetails"
                      placeholder="Enter transfer details..."
                      value={formData.transferDetails}
                      onChange={(e) => setFormData({ ...formData, transferDetails: e.target.value })}
                      rows={2}
                    />
                  </div>
                )}
                <div>
                  <Label htmlFor="billId">Bill ID</Label>
                  <Input
                    id="billId"
                    type="text"
                    placeholder="e.g., BILL001"
                    value={formData.billId}
                    onChange={(e) => setFormData({ ...formData, billId: e.target.value })}
                  />
                  <p className="text-xs text-gray-500 mt-1">Foreign Key to BillId</p>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 px-6 py-2 border-t bg-gray-50 flex-shrink-0">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="py-1">Cancel</Button>
              <Button onClick={handleAddSubmit} className="py-1">Add Appointment</Button>
            </div>
          </DialogContent>
        </Dialog>
        </div>

        <Card className="flex-1 flex flex-col overflow-hidden min-h-0 mb-2">
          <CardContent className="p-0 flex-1 overflow-hidden flex flex-col min-h-0">
            <div className="overflow-x-auto overflow-y-scroll border border-gray-200 rounded flex-1" style={{ maxHeight: 'calc(100vh - 100px)' }}>
              <table className="w-full">
                <thead className="sticky top-0 bg-white z-10 shadow-sm">
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-0.5 px-4 text-gray-700 bg-white whitespace-nowrap">Appointment ID</th>
                    <th className="text-left py-0.5 px-4 text-gray-700 bg-white whitespace-nowrap">Patient Name</th>
                    <th className="text-left py-0.5 px-4 text-gray-700 bg-white whitespace-nowrap">Doctor Name</th>
                    <th className="text-left py-0.5 px-4 text-gray-700 bg-white whitespace-nowrap">Date</th>
                    <th className="text-left py-0.5 px-4 text-gray-700 bg-white whitespace-nowrap">Time</th>
                    <th className="text-left py-0.5 px-4 text-gray-700 bg-white whitespace-nowrap">Token No</th>
                    <th className="text-left py-0.5 px-4 text-gray-700 bg-white whitespace-nowrap">Status</th>
                    <th className="text-left py-0.5 px-4 text-gray-700 bg-white whitespace-nowrap">Charge (₹)</th>
                    <th className="text-left py-0.5 px-4 text-gray-700 bg-white whitespace-nowrap">Diagnosis</th>
                    <th className="text-left py-0.5 px-4 text-gray-700 bg-white whitespace-nowrap">To Be Admitted</th>
                    <th className="text-left py-0.5 px-4 text-gray-700 bg-white whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {patientAppointments.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="text-center py-8 text-gray-500">
                        No appointments found. Add a new appointment to get started.
                      </td>
                    </tr>
                  ) : (
                    patientAppointments.map((appointment) => {
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
                      
                      return (
                        <tr key={appointment.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-1 px-4 text-gray-900 font-mono font-medium whitespace-nowrap">{appointment.patientAppointmentId}</td>
                          <td className="py-1 px-4 text-gray-600 whitespace-nowrap">{patientName}</td>
                          <td className="py-1 px-4 text-gray-600 whitespace-nowrap">{doctorName}</td>
                          <td className="py-1 px-4 text-gray-600">{new Date(appointment.appointmentDate).toLocaleDateString()}</td>
                          <td className="py-1 px-4 text-gray-600">{appointment.appointmentTime}</td>
                          <td className="py-1 px-4 text-gray-900 font-mono font-medium">{appointment.tokenNo}</td>
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
                                onClick={() => handleEdit(appointment)}
                                className="h-8 w-8 p-0"
                              >
                                <Edit className="size-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteAppointment(appointment.id)}
                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="size-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                  <tr>
                    <td className="py-1 px-4" colSpan={11}></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent 
          className="p-0 gap-0 large-dialog"
        >
          <DialogHeader className="px-6 pt-4 pb-3 flex-shrink-0">
            <DialogTitle>Edit Patient Appointment</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto px-6 pb-1 patient-list-scrollable min-h-0">
          <div className="space-y-4 py-4">
            {selectedAppointment && (
              <div>
                <Label>Patient Appointment ID</Label>
                <Input
                  value={selectedAppointment.patientAppointmentId}
                  disabled
                  className="bg-gray-50 text-gray-500"
                />
                <p className="text-xs text-gray-500 mt-1">Patient Appointment ID is auto-generated and cannot be changed</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-patientId">Patient *</Label>
                <select
                  id="edit-patientId"
                  aria-label="Patient"
                  className="w-full px-3 py-2 border border-gray-200 rounded-md"
                  value={formData.patientId}
                  onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                >
                  <option value="">Select Patient</option>
                  {patients.length > 0 ? (
                    patients.map(patient => {
                      const patientId = (patient as any).patientId || (patient as any).PatientId || '';
                      const patientName = (patient as any).patientName || (patient as any).PatientName || '';
                      const lastName = (patient as any).lastName || (patient as any).LastName || '';
                      return (
                        <option key={patientId} value={patientId}>
                          {patientName} {lastName} - {patientId}
                        </option>
                      );
                    })
                  ) : (
                    <>
                      <option value="00000000-0000-0000-0000-000000000001">Dummy Patient Name - 00000000-0000-0000-0000-000000000001</option>
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
                    value={formData.doctorId}
                    onChange={(e) => setFormData({ ...formData, doctorId: e.target.value })}
                  >
                    <option value="">Select Doctor</option>
                    {doctors.length > 0 ? (
                      doctors.map(doctor => (
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
                <Label htmlFor="edit-appointmentDate">Appointment Date *</Label>
                <Input
                  id="edit-appointmentDate"
                  type="date"
                  value={formData.appointmentDate}
                  onChange={(e) => setFormData({ ...formData, appointmentDate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-appointmentTime">Appointment Time *</Label>
                <Input
                  id="edit-appointmentTime"
                  type="time"
                  value={formData.appointmentTime}
                  onChange={(e) => setFormData({ ...formData, appointmentTime: e.target.value })}
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
                  value={formData.appointmentStatus}
                  onChange={(e) => setFormData({ ...formData, appointmentStatus: e.target.value as PatientAppointment['appointmentStatus'] })}
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
                  value={formData.consultationCharge}
                  onChange={(e) => setFormData({ ...formData, consultationCharge: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit-diagnosis">Diagnosis</Label>
              <Textarea
                id="edit-diagnosis"
                placeholder="Enter diagnosis..."
                value={formData.diagnosis}
                onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="edit-followUpDetails">Follow Up Details</Label>
              <Textarea
                id="edit-followUpDetails"
                placeholder="Enter follow up details..."
                value={formData.followUpDetails}
                onChange={(e) => setFormData({ ...formData, followUpDetails: e.target.value })}
                rows={2}
              />
            </div>
            <div>
              <Label htmlFor="edit-prescriptionsUrl">Prescriptions URL</Label>
              <Input
                id="edit-prescriptionsUrl"
                type="url"
                placeholder="https://prescriptions.example.com/..."
                value={formData.prescriptionsUrl}
                onChange={(e) => setFormData({ ...formData, prescriptionsUrl: e.target.value })}
              />
              <p className="text-xs text-gray-500 mt-1">Folder URL - multiple prescriptions should be saved</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="edit-toBeAdmitted"
                aria-label="To Be Admitted (Yes - converted to IPD)"
                checked={formData.toBeAdmitted}
                onChange={(e) => setFormData({ ...formData, toBeAdmitted: e.target.checked })}
                className="rounded"
              />
              <Label htmlFor="edit-toBeAdmitted" className="cursor-pointer">To Be Admitted (Yes - converted to IPD)</Label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="edit-referToAnotherDoctor"
                aria-label="Refer to Another Doctor"
                checked={formData.referToAnotherDoctor}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  referToAnotherDoctor: e.target.checked, 
                  referredDoctorId: e.target.checked ? formData.referredDoctorId : '',
                  appointmentStatus: e.target.checked ? 'Completed' : formData.appointmentStatus
                })}
                className="rounded"
              />
              <Label htmlFor="edit-referToAnotherDoctor" className="cursor-pointer">Refer To Another Doctor</Label>
            </div>
            {formData.referToAnotherDoctor && (
              <div>
                <Label htmlFor="edit-referredDoctorId">Referred Doctor *</Label>
                <select
                  id="edit-referredDoctorId"
                  aria-label="Referred Doctor"
                  className="w-full px-3 py-2 border border-gray-200 rounded-md"
                  value={formData.referredDoctorId}
                  onChange={(e) => setFormData({ ...formData, referredDoctorId: e.target.value })}
                >
                  <option value="">Select Referred Doctor</option>
                  {doctors.length > 0 ? (
                    doctors.map(doctor => (
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
                checked={formData.transferToIPDOTICU}
                onChange={(e) => setFormData({ ...formData, transferToIPDOTICU: e.target.checked, transferTo: e.target.checked ? formData.transferTo : undefined })}
                className="rounded"
              />
              <Label htmlFor="edit-transferToIPDOTICU" className="cursor-pointer">Transfer To IPD/OT/ICU</Label>
            </div>
            {formData.transferToIPDOTICU && (
              <div>
                <Label htmlFor="edit-transferTo">Transfer To *</Label>
                <select
                  id="edit-transferTo"
                  aria-label="Transfer To"
                  className="w-full px-3 py-2 border border-gray-200 rounded-md"
                  value={formData.transferTo || ''}
                  onChange={(e) => setFormData({ ...formData, transferTo: e.target.value as 'IPD Room Admission' | 'ICU' | 'OT' })}
                >
                  <option value="">Select Transfer Destination</option>
                  <option value="IPD Room Admission">IPD Room Admission</option>
                  <option value="ICU">ICU</option>
                  <option value="OT">OT</option>
                </select>
              </div>
            )}
            {formData.transferToIPDOTICU && (
              <div>
                <Label htmlFor="edit-transferDetails">Transfer Details</Label>
                <Textarea
                  id="edit-transferDetails"
                  placeholder="Enter transfer details..."
                  value={formData.transferDetails}
                  onChange={(e) => setFormData({ ...formData, transferDetails: e.target.value })}
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
                value={formData.billId}
                onChange={(e) => setFormData({ ...formData, billId: e.target.value })}
              />
              <p className="text-xs text-gray-500 mt-1">Foreign Key to BillId</p>
            </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 px-6 py-2 border-t bg-gray-50 flex-shrink-0">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="py-1">Cancel</Button>
            <Button onClick={handleEditSubmit} className="py-1">Update Appointment</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

