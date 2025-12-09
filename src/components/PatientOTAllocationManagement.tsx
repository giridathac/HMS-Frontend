import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Badge } from './ui/badge';
import { Scissors, Plus, Edit, Trash2, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { usePatientOTAllocations } from '../hooks/usePatientOTAllocations';
import { useAdmissions } from '../hooks/useAdmissions';
import { useEmergencyBeds } from '../hooks/useEmergencyBeds';
import { useEmergencyBedSlots } from '../hooks/useEmergencyBedSlots';
import { usePatientAppointments } from '../hooks/usePatientAppointments';
import { useStaff } from '../hooks/useStaff';
import { useRoles } from '../hooks/useRoles';
import { useDepartments } from '../hooks/useDepartments';
import { patientsApi } from '../api/patients';
import { billsApi } from '../api/bills';
import { otRoomsApi } from '../api/otRooms';
import { PatientOTAllocation, Patient, OTRoom, OTSlot, EmergencyBed, EmergencyBedSlot, PatientAppointment, Bill } from '../types';
import { Admission } from '../api/admissions';
import { CreatePatientOTAllocationDto, UpdatePatientOTAllocationDto } from '../api/patientOTAllocations';

export function PatientOTAllocationManagement() {
  const { patientOTAllocations, loading, error, createPatientOTAllocation, updatePatientOTAllocation, deletePatientOTAllocation, fetchPatientOTAllocations } = usePatientOTAllocations();
  const { staff } = useStaff();
  const { roles } = useRoles();
  const { departments } = useDepartments();
  const { admissions } = useAdmissions();
  const { emergencyBeds } = useEmergencyBeds();
  const { patientAppointments } = usePatientAppointments();
  const [bills, setBills] = useState<Bill[]>([]);
  const [otRooms, setOTRooms] = useState<OTRoom[]>([]);
  const [otRoomsLoading, setOTRoomsLoading] = useState(true);
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedAllocation, setSelectedAllocation] = useState<PatientOTAllocation | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedOTId, setSelectedOTId] = useState<string>('');
  const [otSlots, setOTSlots] = useState<OTSlot[]>([]);
  const [selectedEmergencyBedId, setSelectedEmergencyBedId] = useState<number | null>(null);
  const [emergencyBedSlots, setEmergencyBedSlots] = useState<EmergencyBedSlot[]>([]);
  
  const [formData, setFormData] = useState({
    patientId: '',
    roomAdmissionId: '',
    patientAppointmentId: '',
    emergencyBedSlotId: '',
    otId: '',
    otSlotId: '',
    surgeryId: '',
    leadSurgeonId: '',
    assistantDoctorId: '',
    anaesthetistId: '',
    nurseId: '',
    otAllocationDate: new Date().toISOString().split('T')[0],
    duration: '',
    otStartTime: '',
    otEndTime: '',
    otActualStartTime: '',
    otActualEndTime: '',
    operationDescription: '',
    operationStatus: 'Scheduled' as PatientOTAllocation['operationStatus'],
    preOperationNotes: '',
    postOperationNotes: '',
    otDocuments: '',
    billId: '',
    status: 'Active' as PatientOTAllocation['status'],
  });

  // Filter staff to get doctors, surgeons, anaesthetists, and nurses
  const doctors = useMemo(() => {
    if (!staff || !roles || !departments) return [];
    return staff
      .filter((member) => {
        if (!member.RoleId) return false;
        const role = roles.find(r => r.id === member.RoleId);
        if (!role || !role.name) return false;
        const roleNameLower = role.name.toLowerCase();
        return roleNameLower.includes('doctor') || roleNameLower.includes('surgeon') || roleNameLower.includes('anaesthetist');
      })
      .map((member) => ({
        id: member.UserId || 0,
        name: member.UserName || 'Unknown',
        role: roles.find(r => r.id === member.RoleId)?.name || 'Unknown',
      }));
  }, [staff, roles, departments]);

  const nurses = useMemo(() => {
    if (!staff || !roles) return [];
    return staff
      .filter((member) => {
        if (!member.RoleId) return false;
        const role = roles.find(r => r.id === member.RoleId);
        if (!role || !role.name) return false;
        return role.name.toLowerCase().includes('nurse');
      })
      .map((member) => ({
        id: member.UserId || 0,
        name: member.UserName || 'Unknown',
      }));
  }, [staff, roles]);

  // Fetch OT rooms using the same API as OT Rooms Management
  useEffect(() => {
    const fetchOTRooms = async () => {
      try {
        setOTRoomsLoading(true);
        // Use getAllLegacy to fetch all OT rooms from all pages (same API endpoint as OT Rooms Management)
        const allOTRooms = await otRoomsApi.getAllLegacy();
        setOTRooms(allOTRooms);
      } catch (err) {
        console.error('Failed to fetch OT rooms:', err);
      } finally {
        setOTRoomsLoading(false);
      }
    };
    fetchOTRooms();
  }, []);

  // Fetch patients and bills
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [patientsData, billsData] = await Promise.all([
          patientsApi.getAll(),
          billsApi.getAll(),
        ]);
        setPatients(patientsData);
        setBills(billsData);
      } catch (err) {
        console.error('Failed to fetch patients or bills:', err);
      }
    };
    fetchData();
  }, []);

  // Fetch OT slots when OT ID changes
  useEffect(() => {
    if (selectedOTId) {
      const fetchSlots = async () => {
        try {
          const { otSlotsApi } = await import('../api/otSlots');
          const slots = await otSlotsApi.getByOTId(selectedOTId);
          setOTSlots(slots);
        } catch (err) {
          console.error('Failed to fetch OT slots:', err);
          setOTSlots([]);
        }
      };
      fetchSlots();
    } else {
      setOTSlots([]);
    }
  }, [selectedOTId]);

  // Fetch all emergency bed slots on component load
  useEffect(() => {
    const fetchEmergencyBedSlots = async () => {
        try {
          const { emergencyBedSlotsApi } = await import('../api/emergencyBedSlots');
        // Fetch all emergency bed slots
        const allSlots = await emergencyBedSlotsApi.getAll();
        setEmergencyBedSlots(allSlots);
        } catch (err) {
          console.error('Failed to fetch emergency bed slots:', err);
          setEmergencyBedSlots([]);
        }
      };
    fetchEmergencyBedSlots();
  }, []);

  const handleCreate = async (data: CreatePatientOTAllocationDto) => {
    try {
      await createPatientOTAllocation(data);
      return true;
    } catch (err) {
      console.error('Failed to create patient OT allocation:', err);
      throw err;
    }
  };

  const handleUpdate = async (id: number, data: Partial<UpdatePatientOTAllocationDto>) => {
    try {
      // Ensure we're using the PatientOTAllocationId as the id
      const updateId = typeof id === 'number' ? id : Number(id);
      if (isNaN(updateId) || !Number.isInteger(updateId) || updateId <= 0) {
        throw new Error(`Invalid PatientOTAllocationId: ${id}. Must be a positive integer.`);
      }
      console.log('Updating Patient OT Allocation with ID:', updateId);
      await updatePatientOTAllocation({ id: updateId, ...data });
      return true;
    } catch (err) {
      console.error('Failed to update patient OT allocation:', err);
      throw err;
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this patient OT allocation? This action cannot be undone.')) {
      try {
        await deletePatientOTAllocation(id);
      } catch (err) {
        console.error('Failed to delete patient OT allocation:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to delete patient OT allocation';
        alert(errorMessage);
      }
    }
  };

  const handleAddSubmit = async () => {
    // PatientId is required - must come from one of: patientId, roomAdmissionId, patientAppointmentId, or emergencyBedSlotId
    if (!formData.patientId && !formData.roomAdmissionId && !formData.patientAppointmentId && !formData.emergencyBedSlotId) {
      alert('Please select a patient source (Patient, Room Admission, Patient Appointment, or Emergency Bed Slot).');
      return;
    }
    
    // Get patientId from the selected source
    let patientIdValue = formData.patientId;
    if (!patientIdValue && formData.roomAdmissionId) {
      // For room admission, we need to get the patientId from the admission
      const admission = admissions.find(a => 
        (a.roomAdmissionId || a.admissionId || a.id)?.toString() === formData.roomAdmissionId
      );
      if (admission && (admission as any).patientId) {
        patientIdValue = (admission as any).patientId;
      } else {
        alert('Could not find patient ID for the selected room admission.');
        return;
      }
    } else if (!patientIdValue && formData.patientAppointmentId) {
      // For patient appointment, we need to get the patientId from the appointment
      // formData.patientAppointmentId contains the numeric ID
      const appointmentId = Number(formData.patientAppointmentId);
      const appointment = patientAppointments.find(a => a.id === appointmentId || a.patientAppointmentId === formData.patientAppointmentId);
      if (appointment && appointment.patientId) {
        patientIdValue = appointment.patientId;
      } else {
        alert('Could not find patient ID for the selected patient appointment.');
        return;
      }
    } else if (!patientIdValue && formData.emergencyBedSlotId) {
      // For emergency bed slot, we need to get the patientId from the bed slot
      const bedSlot = emergencyBedSlots.find(s => s.id.toString() === formData.emergencyBedSlotId);
      if (bedSlot && (bedSlot as any).patientId) {
        patientIdValue = (bedSlot as any).patientId;
      } else {
        alert('Could not find patient ID for the selected emergency bed slot.');
        return;
      }
    }
    
    if (!patientIdValue) {
      alert('Please select a patient source.');
      return;
    }
    
    if (!formData.otId || !formData.leadSurgeonId || !formData.otAllocationDate) {
      alert('Please fill in all required fields (OT, Lead Surgeon, Date).');
      return;
    }
    
    try {
      await handleCreate({
        patientId: patientIdValue, // Required
        roomAdmissionId: formData.roomAdmissionId ? Number(formData.roomAdmissionId) : null,
        patientAppointmentId: formData.patientAppointmentId ? Number(formData.patientAppointmentId) : null,
        emergencyBedSlotId: formData.emergencyBedSlotId ? Number(formData.emergencyBedSlotId) : null,
        otId: Number(formData.otId),
        surgeryId: formData.surgeryId ? Number(formData.surgeryId) : null,
        leadSurgeonId: Number(formData.leadSurgeonId),
        assistantDoctorId: formData.assistantDoctorId ? Number(formData.assistantDoctorId) : null,
        anaesthetistId: formData.anaesthetistId ? Number(formData.anaesthetistId) : null,
        nurseId: formData.nurseId ? Number(formData.nurseId) : null,
        otAllocationDate: formData.otAllocationDate,
        duration: formData.duration ? Number(formData.duration) : null,
        otStartTime: formData.otStartTime || null,
        otEndTime: formData.otEndTime || null,
        otActualStartTime: formData.otActualStartTime || null,
        otActualEndTime: formData.otActualEndTime || null,
        operationDescription: formData.operationDescription || null,
        operationStatus: formData.operationStatus === 'InProgress' ? 'In Progress' : formData.operationStatus,
        preOperationNotes: formData.preOperationNotes || null,
        postOperationNotes: formData.postOperationNotes || null,
        otDocuments: formData.otDocuments || null,
        billId: formData.billId ? Number(formData.billId) : null,
        status: formData.status,
      });
      setIsAddDialogOpen(false);
      setFormData({
        patientId: '',
        roomAdmissionId: '',
        patientAppointmentId: '',
        emergencyBedSlotId: '',
        otId: '',
        surgeryId: '',
        leadSurgeonId: '',
        assistantDoctorId: '',
        anaesthetistId: '',
        nurseId: '',
        otAllocationDate: new Date().toISOString().split('T')[0],
        duration: '',
        otStartTime: '',
        otEndTime: '',
        otActualStartTime: '',
        otActualEndTime: '',
        operationDescription: '',
        operationStatus: 'Scheduled',
        preOperationNotes: '',
        postOperationNotes: '',
        otDocuments: '',
        billId: '',
        status: 'Active',
      });
      setSelectedOTId('');
      setSelectedEmergencyBedId(null);
    } catch (err) {
      // Error handled in parent
    }
  };

  const handleEditSubmit = async () => {
    if (!selectedAllocation) return;
    
    // PatientId is required
    if (!formData.patientId && !formData.roomAdmissionId && !formData.patientAppointmentId && !formData.emergencyBedSlotId) {
      alert('Please select a patient source (Patient, Room Admission, Patient Appointment, or Emergency Bed Slot).');
      return;
    }
    
    // Get patientId from the selected source
    let patientIdValue = formData.patientId;
    if (!patientIdValue && formData.roomAdmissionId) {
      const admission = admissions.find(a => 
        (a.roomAdmissionId || a.admissionId || a.id)?.toString() === formData.roomAdmissionId
      );
      if (admission && (admission as any).patientId) {
        patientIdValue = (admission as any).patientId;
      }
    } else if (!patientIdValue && formData.patientAppointmentId) {
      const appointmentId = Number(formData.patientAppointmentId);
      const appointment = patientAppointments.find(a => a.id === appointmentId || a.patientAppointmentId === formData.patientAppointmentId);
      if (appointment && appointment.patientId) {
        patientIdValue = appointment.patientId;
      }
    } else if (!patientIdValue && formData.emergencyBedSlotId) {
      const bedSlot = emergencyBedSlots.find(s => s.id.toString() === formData.emergencyBedSlotId);
      if (bedSlot && (bedSlot as any).patientId) {
        patientIdValue = (bedSlot as any).patientId;
      }
    }
    
    if (!patientIdValue) {
      patientIdValue = selectedAllocation.patientId; // Use existing patientId if no new source selected
    }
    
    if (!formData.otId || !formData.leadSurgeonId || !formData.otAllocationDate) {
      alert('Please fill in all required fields (OT, Lead Surgeon, Date).');
      return;
    }
    
    try {
      // Use PatientOTAllocationId as the id for update (this is the ID returned from create)
      const updateId = selectedAllocation.id || selectedAllocation.patientOTAllocationId;
      if (!updateId) {
        alert('Cannot update: Patient OT Allocation ID is missing.');
        return;
      }
      console.log('Updating allocation with ID:', updateId, 'from selectedAllocation:', selectedAllocation);
      const updateData: Partial<UpdatePatientOTAllocationDto> = {
        patientId: patientIdValue,
        patientAppointmentId: formData.patientAppointmentId ? Number(formData.patientAppointmentId) : null,
        emergencyBedSlotId: formData.emergencyBedSlotId ? Number(formData.emergencyBedSlotId) : null,
        otId: Number(formData.otId),
        otSlotId: formData.otSlotId ? Number(formData.otSlotId) : null,
        surgeryId: formData.surgeryId ? Number(formData.surgeryId) : null,
        leadSurgeonId: Number(formData.leadSurgeonId),
        assistantDoctorId: formData.assistantDoctorId ? Number(formData.assistantDoctorId) : null,
        anaesthetistId: formData.anaesthetistId ? Number(formData.anaesthetistId) : null,
        nurseId: formData.nurseId ? Number(formData.nurseId) : null,
        otAllocationDate: formData.otAllocationDate,
        duration: formData.duration ? Number(formData.duration) : null,
        otStartTime: formData.otStartTime || null,
        otEndTime: formData.otEndTime || null,
        otActualStartTime: formData.otActualStartTime || null,
        otActualEndTime: formData.otActualEndTime || null,
        operationDescription: formData.operationDescription || null,
        operationStatus: formData.operationStatus === 'InProgress' ? 'In Progress' : formData.operationStatus,
        preOperationNotes: formData.preOperationNotes || null,
        postOperationNotes: formData.postOperationNotes || null,
        otDocuments: formData.otDocuments || null,
        billId: formData.billId ? Number(formData.billId) : null,
        status: formData.status,
      };
      await handleUpdate(updateId, updateData);
      setIsEditDialogOpen(false);
      setSelectedAllocation(null);
      setFormData({
        patientId: '',
        roomAdmissionId: '',
        patientAppointmentId: '',
        emergencyBedSlotId: '',
        otId: '',
        otSlotId: '',
        surgeryId: '',
        leadSurgeonId: '',
        assistantDoctorId: '',
        anaesthetistId: '',
        nurseId: '',
        otAllocationDate: new Date().toISOString().split('T')[0],
        duration: '',
        otStartTime: '',
        otEndTime: '',
        otActualStartTime: '',
        otActualEndTime: '',
        operationDescription: '',
        operationStatus: 'Scheduled',
        preOperationNotes: '',
        postOperationNotes: '',
        otDocuments: '',
        billId: '',
        status: 'Active',
      });
      setSelectedOTId('');
      setSelectedEmergencyBedId(null);
    } catch (err) {
      // Error handled in parent
    }
  };

  const handleEdit = (allocation: PatientOTAllocation) => {
    setSelectedAllocation(allocation);
    setFormData({
      patientId: allocation.patientId || '',
      roomAdmissionId: allocation.roomAdmissionId?.toString() || '',
      patientAppointmentId: allocation.patientAppointmentId ? (() => {
        // Find the appointment by patientAppointmentId and use its numeric id
        const appointment = patientAppointments.find(a => a.patientAppointmentId === allocation.patientAppointmentId);
        return appointment ? appointment.id.toString() : '';
      })() : '',
      emergencyBedSlotId: allocation.emergencyBedSlotId?.toString() || '',
      otId: allocation.otId.toString(),
      otSlotId: allocation.otSlotId?.toString() || '',
      surgeryId: allocation.surgeryId?.toString() || '',
      leadSurgeonId: allocation.leadSurgeonId.toString(),
      assistantDoctorId: allocation.assistantDoctorId?.toString() || '',
      anaesthetistId: allocation.anaesthetistId?.toString() || '',
      nurseId: allocation.nurseId?.toString() || '',
      otAllocationDate: allocation.otAllocationDate,
      duration: allocation.duration || '',
      otStartTime: allocation.otStartTime || '',
      otEndTime: allocation.otEndTime || '',
      otActualStartTime: allocation.otActualStartTime || '',
      otActualEndTime: allocation.otActualEndTime || '',
      operationDescription: allocation.operationDescription || '',
      operationStatus: allocation.operationStatus,
      preOperationNotes: allocation.preOperationNotes || '',
      postOperationNotes: allocation.postOperationNotes || '',
      otDocuments: allocation.otDocuments || '',
      billId: allocation.billId?.toString() || '',
      status: allocation.status,
    });
    setSelectedOTId(allocation.otId.toString());
    // Set emergency bed slot if available
    if (allocation.emergencyBedSlotId) {
      // Find the emergency bed from the slot
      const bedSlot = emergencyBedSlots.find(s => s.id === allocation.emergencyBedSlotId);
      if (bedSlot && (bedSlot as any).emergencyBedId) {
        setSelectedEmergencyBedId((bedSlot as any).emergencyBedId);
      }
    } else {
      setSelectedEmergencyBedId(null);
    }
    setIsEditDialogOpen(true);
  };

  const getStatusBadge = (status: PatientOTAllocation['operationStatus']) => {
    switch (status) {
      case 'Scheduled':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-700 border-yellow-300 text-sm"><Clock className="size-3 mr-1" />Scheduled</Badge>;
      case 'InProgress':
        return <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300 text-sm"><Scissors className="size-3 mr-1" />In Progress</Badge>;
      case 'Completed':
        return <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300 text-sm"><CheckCircle2 className="size-3 mr-1" />Completed</Badge>;
      default:
        return <Badge variant="outline" className="text-sm">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center py-12 text-blue-600">Loading patient OT allocations...</div>
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
      <div className="px-4 pt-4 pb-4 bg-blue-100 h-screen flex flex-col overflow-hidden">
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
          <div>
            <h1 className="text-gray-900 mb-0 text-xl">Patient OT Allocation Management</h1>
            <p className="text-gray-500 text-sm">Manage patient operating theater allocations</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="size-4" />
                Add OT Allocation
              </Button>
            </DialogTrigger>
            <DialogContent className="p-0 gap-0 large-dialog max-h-[90vh]">
              <DialogHeader className="px-6 pt-4 pb-3 flex-shrink-0">
                <DialogTitle>Add New Patient OT Allocation</DialogTitle>
              </DialogHeader>
              <div className="flex-1 overflow-y-auto px-6 pb-1 patient-list-scrollable min-h-0">
                <div className="space-y-4 py-4">
                  <div className="text-sm text-gray-600 p-3 bg-blue-50 rounded-md">
                    <p className="font-medium mb-1">Patient Source (Select one):</p>
                    <p className="text-xs">Choose either Patient (Direct OT), Room Admission (IPD), Patient Appointment (OPD), or Emergency Bed</p>
                  </div>
                  
                  <div>
                    <Label htmlFor="add-patientId">Patient (Direct OT - Optional)</Label>
                    <select
                      id="add-patientId"
                      aria-label="Patient"
                      className="w-full px-3 py-2 border border-gray-200 rounded-md"
                      value={formData.patientId}
                      onChange={(e) => setFormData({ ...formData, patientId: e.target.value, roomAdmissionId: '', patientAppointmentId: '', emergencyBedSlotId: '' })}
                    >
                      <option value="">Select Patient (Direct OT)</option>
                      {patients.map(patient => {
                        const patientId = (patient as any).patientId || (patient as any).PatientId || '';
                        const patientNo = (patient as any).PatientNo || (patient as any).patientNo || patientId.substring(0, 8);
                        const patientName = (patient as any).patientName || (patient as any).PatientName || '';
                        const lastName = (patient as any).lastName || (patient as any).LastName || '';
                        const fullName = `${patientName} ${lastName}`.trim();
                        return (
                          <option key={patientId} value={patientId}>
                            {patientNo} - {fullName || 'Unknown'}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="add-roomAdmissionId">Room Admission (IPD - Optional)</Label>
                    <select
                      id="add-roomAdmissionId"
                      aria-label="Room Admission"
                      className="w-full px-3 py-2 border border-gray-200 rounded-md"
                      value={formData.roomAdmissionId}
                      onChange={(e) => setFormData({ ...formData, roomAdmissionId: e.target.value, patientId: '', patientAppointmentId: '', emergencyBedSlotId: '' })}
                    >
                      <option value="">Select Room Admission (IPD)</option>
                      {admissions.map(admission => (
                        <option key={admission.roomAdmissionId || admission.admissionId || admission.id} value={(admission.roomAdmissionId || admission.admissionId || admission.id)?.toString()}>
                          {admission.patientName} - {admission.bedNumber} ({admission.roomType})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="add-patientAppointmentId">Patient Appointment (OPD - Optional)</Label>
                    <select
                      id="add-patientAppointmentId"
                      aria-label="Patient Appointment"
                      className="w-full px-3 py-2 border border-gray-200 rounded-md"
                      value={formData.patientAppointmentId}
                      onChange={(e) => setFormData({ ...formData, patientAppointmentId: e.target.value, patientId: '', roomAdmissionId: '', emergencyBedSlotId: '' })}
                    >
                      <option value="">Select Patient Appointment (OPD)</option>
                      {patientAppointments.map(appointment => {
                        // Find the patient for this appointment
                        const patient = patients.find(p => 
                          (p as any).patientId === appointment.patientId || 
                          (p as any).PatientId === appointment.patientId
                        );
                        const patientNo = patient 
                          ? ((patient as any).PatientNo || (patient as any).patientNo || appointment.patientId.substring(0, 8))
                          : appointment.patientId.substring(0, 8);
                        // Use numeric ID for the API
                        return (
                          <option key={appointment.patientAppointmentId} value={appointment.id.toString()}>
                            {appointment.patientAppointmentId} - {appointment.tokenNo} (Patient ID: {patientNo})
                        </option>
                        );
                      })}
                    </select>
                  </div>

                    <div>
                      <Label htmlFor="add-emergencyBedSlotId">Emergency Bed Slot (Optional)</Label>
                      <select
                        id="add-emergencyBedSlotId"
                        aria-label="Emergency Bed Slot"
                        className="w-full px-3 py-2 border border-gray-200 rounded-md"
                        value={formData.emergencyBedSlotId}
                      onChange={(e) => {
                        setFormData({ ...formData, emergencyBedSlotId: e.target.value, patientId: '', roomAdmissionId: '', patientAppointmentId: '' });
                        // Set emergency bed ID from the selected slot for reference
                        const slot = emergencyBedSlots.find(s => s.id.toString() === e.target.value);
                        if (slot && (slot as any).emergencyBedId) {
                          setSelectedEmergencyBedId((slot as any).emergencyBedId);
                        }
                      }}
                      >
                        <option value="">Select Emergency Bed Slot</option>
                      {emergencyBedSlots.map(slot => {
                        const bed = emergencyBeds.find(b => b.id === ((slot as any).emergencyBedId || slot.id));
                        return (
                          <option key={slot.id} value={slot.id.toString()}>
                            {bed ? `${bed.emergencyBedNo} - ` : ''}{slot.eBedSlotNo} - {slot.eSlotStartTime} to {slot.eSlotEndTime}
                          </option>
                        );
                      })}
                      </select>
                    </div>

                  <div className="border-t pt-4">
                      <div>
                        <Label htmlFor="add-otId">OT *</Label>
                        <select
                          id="add-otId"
                          aria-label="OT"
                          className="w-full px-3 py-2 border border-gray-200 rounded-md"
                          value={formData.otId}
                          onChange={(e) => {
                            setSelectedOTId(e.target.value);
                          setFormData({ ...formData, otId: e.target.value });
                          }}
                        >
                          <option value="">Select OT</option>
                          {otRooms.map(ot => (
                            <option key={ot.id} value={ot.id.toString()}>
                              {ot.otNo} - {ot.otName} ({ot.otType})
                            </option>
                          ))}
                        </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="add-leadSurgeonId">Lead Surgeon *</Label>
                      <select
                        id="add-leadSurgeonId"
                        aria-label="Lead Surgeon"
                        className="w-full px-3 py-2 border border-gray-200 rounded-md"
                        value={formData.leadSurgeonId}
                        onChange={(e) => setFormData({ ...formData, leadSurgeonId: e.target.value })}
                      >
                        <option value="">Select Lead Surgeon</option>
                        {doctors.map(doctor => (
                          <option key={doctor.id} value={doctor.id.toString()}>
                            {doctor.name} - {doctor.role}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="add-assistantDoctorId">Assistant Doctor (Optional)</Label>
                      <select
                        id="add-assistantDoctorId"
                        aria-label="Assistant Doctor"
                        className="w-full px-3 py-2 border border-gray-200 rounded-md"
                        value={formData.assistantDoctorId}
                        onChange={(e) => setFormData({ ...formData, assistantDoctorId: e.target.value })}
                      >
                        <option value="">Select Assistant Doctor</option>
                        {doctors.map(doctor => (
                          <option key={doctor.id} value={doctor.id.toString()}>
                            {doctor.name} - {doctor.role}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="add-anaesthetistId">Anaesthetist (Optional)</Label>
                      <select
                        id="add-anaesthetistId"
                        aria-label="Anaesthetist"
                        className="w-full px-3 py-2 border border-gray-200 rounded-md"
                        value={formData.anaesthetistId}
                        onChange={(e) => setFormData({ ...formData, anaesthetistId: e.target.value })}
                      >
                        <option value="">Select Anaesthetist</option>
                        {doctors.map(doctor => (
                          <option key={doctor.id} value={doctor.id.toString()}>
                            {doctor.name} - {doctor.role}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="add-nurseId">Nurse (Optional)</Label>
                      <select
                        id="add-nurseId"
                        aria-label="Nurse"
                        className="w-full px-3 py-2 border border-gray-200 rounded-md"
                        value={formData.nurseId}
                        onChange={(e) => setFormData({ ...formData, nurseId: e.target.value })}
                      >
                        <option value="">Select Nurse</option>
                        {nurses.map(nurse => (
                          <option key={nurse.id} value={nurse.id.toString()}>
                            {nurse.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="add-otAllocationDate">OT Allocation Date *</Label>
                      <Input
                        id="add-otAllocationDate"
                        type="date"
                        value={formData.otAllocationDate}
                        onChange={(e) => setFormData({ ...formData, otAllocationDate: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="add-duration">Duration (Optional, in minutes)</Label>
                      <Input
                        id="add-duration"
                        type="number"
                        placeholder="e.g., 120"
                        value={formData.duration}
                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="add-otStartTime">OT Start Time (Optional)</Label>
                      <Input
                        id="add-otStartTime"
                        type="time"
                        value={formData.otStartTime}
                        onChange={(e) => setFormData({ ...formData, otStartTime: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="add-otEndTime">OT End Time (Optional)</Label>
                      <Input
                        id="add-otEndTime"
                        type="time"
                        value={formData.otEndTime}
                        onChange={(e) => setFormData({ ...formData, otEndTime: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="add-otActualStartTime">OT Actual Start Time (Optional)</Label>
                      <Input
                        id="add-otActualStartTime"
                        type="time"
                        value={formData.otActualStartTime}
                        onChange={(e) => setFormData({ ...formData, otActualStartTime: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="add-otActualEndTime">OT Actual End Time (Optional)</Label>
                      <Input
                        id="add-otActualEndTime"
                        type="time"
                        value={formData.otActualEndTime}
                        onChange={(e) => setFormData({ ...formData, otActualEndTime: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="add-operationDescription">Operation Description (Optional)</Label>
                    <Textarea
                      id="add-operationDescription"
                      placeholder="Enter operation description..."
                      value={formData.operationDescription}
                      onChange={(e) => setFormData({ ...formData, operationDescription: e.target.value })}
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="add-operationStatus">Operation Status</Label>
                    <select
                      id="add-operationStatus"
                      aria-label="Operation Status"
                      className="w-full px-3 py-2 border border-gray-200 rounded-md"
                      value={formData.operationStatus}
                      onChange={(e) => setFormData({ ...formData, operationStatus: e.target.value as PatientOTAllocation['operationStatus'] })}
                    >
                      <option value="Scheduled">Scheduled</option>
                      <option value="InProgress">In Progress</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                      <option value="Postponed">Postponed</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="add-preOperationNotes">Pre Operation Notes (Optional)</Label>
                    <Textarea
                      id="add-preOperationNotes"
                      placeholder="e.g., ICU bed reserved post-surgery"
                      value={formData.preOperationNotes}
                      onChange={(e) => setFormData({ ...formData, preOperationNotes: e.target.value })}
                      rows={2}
                    />
                  </div>

                  <div>
                    <Label htmlFor="add-postOperationNotes">Post Operation Notes (Optional)</Label>
                    <Textarea
                      id="add-postOperationNotes"
                      placeholder="Enter post operation notes..."
                      value={formData.postOperationNotes}
                      onChange={(e) => setFormData({ ...formData, postOperationNotes: e.target.value })}
                      rows={2}
                    />
                  </div>

                  <div>
                    <Label htmlFor="add-otDocuments">OT Documents URL (Optional)</Label>
                    <Input
                      id="add-otDocuments"
                      type="url"
                      placeholder="https://documents.example.com/..."
                      value={formData.otDocuments}
                      onChange={(e) => setFormData({ ...formData, otDocuments: e.target.value })}
                    />
                    <p className="text-xs text-gray-500 mt-1">To be uploaded</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="add-billId">Bill ID (Optional)</Label>
                      <select
                        id="add-billId"
                        aria-label="Bill ID"
                        className="w-full px-3 py-2 border border-gray-200 rounded-md"
                        value={formData.billId}
                        onChange={(e) => setFormData({ ...formData, billId: e.target.value })}
                      >
                        <option value="">Select Bill</option>
                        {bills.map(bill => (
                          <option key={bill.id} value={bill.id.toString()}>
                            {bill.billNo} - ₹{bill.amount}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="add-status">Status</Label>
                      <select
                        id="add-status"
                        aria-label="Status"
                        className="w-full px-3 py-2 border border-gray-200 rounded-md"
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value as PatientOTAllocation['status'] })}
                      >
                        <option value="Active">Active</option>
                        <option value="InActive">InActive</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2 px-6 py-2 border-t bg-gray-50 flex-shrink-0">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="py-1">Cancel</Button>
                <Button onClick={handleAddSubmit} className="py-1">Add OT Allocation</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="flex-1 flex flex-col overflow-hidden min-h-0 mb-4">
          <CardContent className="p-0 flex-1 overflow-hidden flex flex-col min-h-0">
            <div className="overflow-x-auto overflow-y-scroll border border-gray-200 rounded flex-1" style={{ maxHeight: 'calc(100vh - 100px)' }}>
              <table className="w-full">
                <thead className="sticky top-0 bg-white z-10 shadow-sm">
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left py-2 px-3 text-sm font-bold text-gray-700" colSpan={15}>
                      <div className="flex items-center gap-2">
                        <Scissors className="size-4" />
                        <span>Patient OT Allocations List ({patientOTAllocations.length})</span>
                      </div>
                    </th>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 px-3 text-sm text-gray-700 font-bold">ID</th>
                    <th className="text-left py-2 px-3 text-sm text-gray-700 font-bold">Patient Source</th>
                    <th className="text-left py-2 px-3 text-sm text-gray-700 font-bold">OT</th>
                    <th className="text-left py-2 px-3 text-sm text-gray-700 font-bold">OT Slot</th>
                    <th className="text-left py-2 px-3 text-sm text-gray-700 font-bold">Lead Surgeon</th>
                    <th className="text-left py-2 px-3 text-sm text-gray-700 font-bold">Date</th>
                    <th className="text-left py-2 px-3 text-sm text-gray-700 font-bold">Start Time</th>
                    <th className="text-left py-2 px-3 text-sm text-gray-700 font-bold">End Time</th>
                    <th className="text-left py-2 px-3 text-sm text-gray-700 font-bold">Operation</th>
                    <th className="text-left py-2 px-3 text-sm text-gray-700 font-bold">Status</th>
                    <th className="text-left py-2 px-3 text-sm text-gray-700 font-bold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {patientOTAllocations.length === 0 ? (
                    <tr>
                      <td colSpan={15} className="text-center py-6 text-sm text-gray-500">
                        No OT allocations found. Add a new allocation to get started.
                      </td>
                    </tr>
                  ) : (
                    patientOTAllocations.map((allocation) => {
                      const otRoom = otRooms.find(ot => ot.id === allocation.otId);
                      const leadSurgeon = doctors.find(d => d.id === allocation.leadSurgeonId);
                      const patient = patients.find(p => 
                        (p as any).patientId === allocation.patientId || 
                        (p as any).PatientId === allocation.patientId
                      );
                      const admission = admissions.find(a => 
                        (a.roomAdmissionId || a.admissionId || a.id) === allocation.roomAdmissionId
                      );
                      const appointment = patientAppointments.find(a => a.patientAppointmentId === allocation.patientAppointmentId);
                      const emergencyBed = emergencyBeds.find(b => b.id === allocation.emergencyBedId);
                      
                      let patientSource = '-';
                      if (allocation.patientId) {
                        const patientName = patient 
                          ? `${(patient as any).patientName || (patient as any).PatientName || ''} ${(patient as any).lastName || (patient as any).LastName || ''}`.trim()
                          : 'Unknown';
                        patientSource = `Patient: ${patientName}`;
                      } else if (allocation.roomAdmissionId) {
                        patientSource = `IPD: ${admission?.patientName || 'N/A'} (${admission?.bedNumber || 'N/A'})`;
                      } else if (allocation.patientAppointmentId) {
                        patientSource = `OPD: ${appointment?.patientAppointmentId || 'N/A'}`;
                      } else if (allocation.emergencyBedId) {
                        patientSource = `Emergency: ${emergencyBed?.emergencyBedNo || 'N/A'}`;
                      }

                      return (
                        <tr key={allocation.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-2 px-3 text-sm text-gray-900 font-mono font-medium whitespace-nowrap">{allocation.patientOTAllocationId}</td>
                          <td className="py-2 px-3 text-sm text-gray-600 break-words">{patientSource}</td>
                          <td className="py-2 px-3 text-sm text-gray-600 break-words">{otRoom ? `${otRoom.otNo} - ${otRoom.otName}` : allocation.otId}</td>
                          <td className="py-2 px-3 text-sm text-gray-600 whitespace-nowrap">{allocation.otSlotId || '-'}</td>
                          <td className="py-2 px-3 text-sm text-gray-600 break-words">{leadSurgeon?.name || allocation.leadSurgeonId}</td>
                          <td className="py-2 px-3 text-sm text-gray-600 whitespace-nowrap">{new Date(allocation.otAllocationDate).toLocaleDateString()}</td>
                          <td className="py-2 px-3 text-sm text-gray-600 whitespace-nowrap">{allocation.otStartTime}</td>
                          <td className="py-2 px-3 text-sm text-gray-600 whitespace-nowrap">{allocation.otEndTime}</td>
                          <td className="py-2 px-3 text-sm text-gray-600 break-words">{allocation.operationDescription || '-'}</td>
                          <td className="py-2 px-3">{getStatusBadge(allocation.operationStatus)}</td>
                          <td className="py-2 px-3">
                            <div className="flex items-center gap-1.5">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(allocation)}
                                className="h-7 w-7 p-0"
                              >
                                <Edit className="size-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(allocation.id)}
                                className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="size-3.5" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                  <tr>
                    <td className="py-2 px-3" colSpan={15}></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="p-0 gap-0 large-dialog max-h-[90vh]">
          <DialogHeader className="px-6 pt-4 pb-3 flex-shrink-0">
            <DialogTitle>Edit Patient OT Allocation</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto px-6 pb-1 patient-list-scrollable min-h-0">
            <div className="space-y-4 py-4">
              <div className="text-sm text-gray-600 p-3 bg-blue-50 rounded-md">
                <p className="font-medium mb-1">Patient Source (Select one):</p>
                <p className="text-xs">Choose either Patient (Direct OT), Room Admission (IPD), Patient Appointment (OPD), or Emergency Bed</p>
              </div>
              
              <div>
                <Label htmlFor="edit-patientId">Patient (Direct OT - Optional)</Label>
                <select
                  id="edit-patientId"
                  aria-label="Patient"
                  className="w-full px-3 py-2 border border-gray-200 rounded-md"
                  value={formData.patientId}
                  onChange={(e) => setFormData({ ...formData, patientId: e.target.value, roomAdmissionId: '', patientAppointmentId: '', emergencyBedSlotId: '' })}
                >
                  <option value="">Select Patient (Direct OT)</option>
                  {patients.map(patient => {
                    const patientId = (patient as any).patientId || (patient as any).PatientId || '';
                    const patientNo = (patient as any).PatientNo || (patient as any).patientNo || patientId.substring(0, 8);
                    const patientName = (patient as any).patientName || (patient as any).PatientName || '';
                    const lastName = (patient as any).lastName || (patient as any).LastName || '';
                    const fullName = `${patientName} ${lastName}`.trim();
                    return (
                      <option key={patientId} value={patientId}>
                        {patientNo} - {fullName || 'Unknown'}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <Label htmlFor="edit-roomAdmissionId">Room Admission (IPD - Optional)</Label>
                <select
                  id="edit-roomAdmissionId"
                  aria-label="Room Admission"
                  className="w-full px-3 py-2 border border-gray-200 rounded-md"
                  value={formData.roomAdmissionId}
                  onChange={(e) => setFormData({ ...formData, roomAdmissionId: e.target.value, patientId: '', patientAppointmentId: '', emergencyBedSlotId: '' })}
                >
                  <option value="">Select Room Admission (IPD)</option>
                  {admissions.map(admission => (
                    <option key={admission.roomAdmissionId || admission.admissionId || admission.id} value={(admission.roomAdmissionId || admission.admissionId || admission.id)?.toString()}>
                      {admission.patientName} - {admission.bedNumber} ({admission.roomType})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="edit-patientAppointmentId">Patient Appointment (OPD - Optional)</Label>
                <select
                  id="edit-patientAppointmentId"
                  aria-label="Patient Appointment"
                  className="w-full px-3 py-2 border border-gray-200 rounded-md"
                  value={formData.patientAppointmentId}
                  onChange={(e) => setFormData({ ...formData, patientAppointmentId: e.target.value, patientId: '', roomAdmissionId: '', emergencyBedSlotId: '' })}
                >
                  <option value="">Select Patient Appointment (OPD)</option>
                  {patientAppointments.map(appointment => {
                    // Find the patient for this appointment
                    const patient = patients.find(p => 
                      (p as any).patientId === appointment.patientId || 
                      (p as any).PatientId === appointment.patientId
                    );
                    const patientNo = patient 
                      ? ((patient as any).PatientNo || (patient as any).patientNo || appointment.patientId.substring(0, 8))
                      : appointment.patientId.substring(0, 8);
                    return (
                      <option key={appointment.patientAppointmentId} value={appointment.id.toString()}>
                        {appointment.patientAppointmentId} - {appointment.tokenNo} (Patient ID: {patientNo})
                    </option>
                    );
                  })}
                </select>
              </div>

                <div>
                  <Label htmlFor="edit-emergencyBedSlotId">Emergency Bed Slot (Optional)</Label>
                  <select
                    id="edit-emergencyBedSlotId"
                    aria-label="Emergency Bed Slot"
                    className="w-full px-3 py-2 border border-gray-200 rounded-md"
                    value={formData.emergencyBedSlotId}
                  onChange={(e) => {
                    setFormData({ ...formData, emergencyBedSlotId: e.target.value, patientId: '', roomAdmissionId: '', patientAppointmentId: '' });
                    const slot = emergencyBedSlots.find(s => s.id.toString() === e.target.value);
                    if (slot && (slot as any).emergencyBedId) {
                      setSelectedEmergencyBedId((slot as any).emergencyBedId);
                    }
                  }}
                  >
                    <option value="">Select Emergency Bed Slot</option>
                  {emergencyBedSlots.map(slot => {
                    const bed = emergencyBeds.find(b => b.id === ((slot as any).emergencyBedId || slot.id));
                    return (
                      <option key={slot.id} value={slot.id.toString()}>
                        {bed ? `${bed.emergencyBedNo} - ` : ''}{slot.eBedSlotNo} - {slot.eSlotStartTime} to {slot.eSlotEndTime}
                      </option>
                    );
                  })}
                  </select>
                </div>

              <div className="border-t pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-otId">OT *</Label>
                    <select
                      id="edit-otId"
                      aria-label="OT"
                      className="w-full px-3 py-2 border border-gray-200 rounded-md"
                      value={formData.otId}
                      onChange={(e) => {
                        setSelectedOTId(e.target.value);
                        setFormData({ ...formData, otId: e.target.value, otSlotId: '' });
                      }}
                    >
                      <option value="">Select OT</option>
                      {otRooms.map(ot => (
                        <option key={ot.id} value={ot.id.toString()}>
                          {ot.otNo} - {ot.otName} ({ot.otType})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="edit-otSlotId">OT Slot (Optional)</Label>
                    <select
                      id="edit-otSlotId"
                      aria-label="OT Slot"
                      className="w-full px-3 py-2 border border-gray-200 rounded-md"
                      value={formData.otSlotId}
                      onChange={(e) => setFormData({ ...formData, otSlotId: e.target.value })}
                      disabled={!formData.otId}
                    >
                      <option value="">Select OT Slot</option>
                      {otSlots.map(slot => (
                        <option key={slot.id} value={slot.id.toString()}>
                          {slot.otSlotNo} - {slot.slotStartTime} to {slot.slotEndTime}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-leadSurgeonId">Lead Surgeon *</Label>
                  <select
                    id="edit-leadSurgeonId"
                    aria-label="Lead Surgeon"
                    className="w-full px-3 py-2 border border-gray-200 rounded-md"
                    value={formData.leadSurgeonId}
                    onChange={(e) => setFormData({ ...formData, leadSurgeonId: e.target.value })}
                  >
                    <option value="">Select Lead Surgeon</option>
                    {doctors.map(doctor => (
                      <option key={doctor.id} value={doctor.id.toString()}>
                        {doctor.name} - {doctor.role}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="edit-assistantDoctorId">Assistant Doctor (Optional)</Label>
                  <select
                    id="edit-assistantDoctorId"
                    aria-label="Assistant Doctor"
                    className="w-full px-3 py-2 border border-gray-200 rounded-md"
                    value={formData.assistantDoctorId}
                    onChange={(e) => setFormData({ ...formData, assistantDoctorId: e.target.value })}
                  >
                    <option value="">Select Assistant Doctor</option>
                    {doctors.map(doctor => (
                      <option key={doctor.id} value={doctor.id.toString()}>
                        {doctor.name} - {doctor.role}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-anaesthetistId">Anaesthetist (Optional)</Label>
                  <select
                    id="edit-anaesthetistId"
                    aria-label="Anaesthetist"
                    className="w-full px-3 py-2 border border-gray-200 rounded-md"
                    value={formData.anaesthetistId}
                    onChange={(e) => setFormData({ ...formData, anaesthetistId: e.target.value })}
                  >
                    <option value="">Select Anaesthetist</option>
                    {doctors.map(doctor => (
                      <option key={doctor.id} value={doctor.id.toString()}>
                        {doctor.name} - {doctor.role}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="edit-nurseId">Nurse (Optional)</Label>
                  <select
                    id="edit-nurseId"
                    aria-label="Nurse"
                    className="w-full px-3 py-2 border border-gray-200 rounded-md"
                    value={formData.nurseId}
                    onChange={(e) => setFormData({ ...formData, nurseId: e.target.value })}
                  >
                    <option value="">Select Nurse</option>
                    {nurses.map(nurse => (
                      <option key={nurse.id} value={nurse.id.toString()}>
                        {nurse.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-otAllocationDate">OT Allocation Date *</Label>
                  <Input
                    id="edit-otAllocationDate"
                    type="date"
                    value={formData.otAllocationDate}
                    onChange={(e) => setFormData({ ...formData, otAllocationDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-duration">Duration (Optional, in minutes)</Label>
                  <Input
                    id="edit-duration"
                    type="number"
                    placeholder="e.g., 120"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-otStartTime">OT Start Time (Optional)</Label>
                  <Input
                    id="edit-otStartTime"
                    type="time"
                    value={formData.otStartTime}
                    onChange={(e) => setFormData({ ...formData, otStartTime: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-otEndTime">OT End Time (Optional)</Label>
                  <Input
                    id="edit-otEndTime"
                    type="time"
                    value={formData.otEndTime}
                    onChange={(e) => setFormData({ ...formData, otEndTime: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-otActualStartTime">OT Actual Start Time (Optional)</Label>
                  <Input
                    id="edit-otActualStartTime"
                    type="time"
                    value={formData.otActualStartTime}
                    onChange={(e) => setFormData({ ...formData, otActualStartTime: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-otActualEndTime">OT Actual End Time (Optional)</Label>
                  <Input
                    id="edit-otActualEndTime"
                    type="time"
                    value={formData.otActualEndTime}
                    onChange={(e) => setFormData({ ...formData, otActualEndTime: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="edit-operationDescription">Operation Description (Optional)</Label>
                <Textarea
                  id="edit-operationDescription"
                  placeholder="Enter operation description..."
                  value={formData.operationDescription}
                  onChange={(e) => setFormData({ ...formData, operationDescription: e.target.value })}
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="edit-operationStatus">Operation Status</Label>
                <select
                  id="edit-operationStatus"
                  aria-label="Operation Status"
                  className="w-full px-3 py-2 border border-gray-200 rounded-md"
                  value={formData.operationStatus}
                  onChange={(e) => setFormData({ ...formData, operationStatus: e.target.value as PatientOTAllocation['operationStatus'] })}
                >
                  <option value="Scheduled">Scheduled</option>
                  <option value="InProgress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                  <option value="Postponed">Postponed</option>
                </select>
              </div>

              <div>
                <Label htmlFor="edit-preOperationNotes">Pre Operation Notes (Optional)</Label>
                <Textarea
                  id="edit-preOperationNotes"
                  placeholder="e.g., ICU bed reserved post-surgery"
                  value={formData.preOperationNotes}
                  onChange={(e) => setFormData({ ...formData, preOperationNotes: e.target.value })}
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="edit-postOperationNotes">Post Operation Notes (Optional)</Label>
                <Textarea
                  id="edit-postOperationNotes"
                  placeholder="Enter post operation notes..."
                  value={formData.postOperationNotes}
                  onChange={(e) => setFormData({ ...formData, postOperationNotes: e.target.value })}
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="edit-otDocuments">OT Documents URL (Optional)</Label>
                <Input
                  id="edit-otDocuments"
                  type="url"
                  placeholder="https://documents.example.com/..."
                  value={formData.otDocuments}
                  onChange={(e) => setFormData({ ...formData, otDocuments: e.target.value })}
                />
                <p className="text-xs text-gray-500 mt-1">To be uploaded</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-billId">Bill ID (Optional)</Label>
                  <select
                    id="edit-billId"
                    aria-label="Bill ID"
                    className="w-full px-3 py-2 border border-gray-200 rounded-md"
                    value={formData.billId}
                    onChange={(e) => setFormData({ ...formData, billId: e.target.value })}
                  >
                    <option value="">Select Bill</option>
                    {bills.map(bill => (
                      <option key={bill.id} value={bill.id.toString()}>
                        {bill.billNo} - ₹{bill.amount}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="edit-status">Status</Label>
                  <select
                    id="edit-status"
                    aria-label="Status"
                    className="w-full px-3 py-2 border border-gray-200 rounded-md"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as PatientOTAllocation['status'] })}
                  >
                    <option value="Active">Active</option>
                    <option value="InActive">InActive</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 px-6 py-2 border-t bg-gray-50 flex-shrink-0">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="py-1">Cancel</Button>
            <Button onClick={handleEditSubmit} className="py-1">Update OT Allocation</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
