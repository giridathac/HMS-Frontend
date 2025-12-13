import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Badge } from './ui/badge';
import { Scissors, Plus, Edit, Trash2, Clock, CheckCircle2, XCircle, Calendar, CalendarX, Square, Copy, Search } from 'lucide-react';
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
import { 
  getTodayIST, 
  formatDateIST, 
  formatDateDisplayIST, 
  formatDateTimeIST, 
  formatTimeIST,
  compareDatesIST,
  isTodayIST
} from '../utils/timeUtils';

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
  const [isDuplicateDialogOpen, setIsDuplicateDialogOpen] = useState(false);
  const [selectedAllocation, setSelectedAllocation] = useState<PatientOTAllocation | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedOTId, setSelectedOTId] = useState<string>('');
  const [otSlots, setOTSlots] = useState<OTSlot[]>([]);
  const [allOTSlots, setAllOTSlots] = useState<OTSlot[]>([]);
  const [selectedEmergencyBedId, setSelectedEmergencyBedId] = useState<number | null>(null);
  const [emergencyBedSlots, setEmergencyBedSlots] = useState<EmergencyBedSlot[]>([]);
  const [fetchedAllocations, setFetchedAllocations] = useState<Map<number, PatientOTAllocation>>(new Map());
  const [slotSearchTerm, setSlotSearchTerm] = useState('');
  const [tableSearchTerm, setTableSearchTerm] = useState('');
  
  const [formData, setFormData] = useState({
    patientId: '',
    roomAdmissionId: '',
    patientAppointmentId: '',
    emergencyBedSlotId: '',
    otId: '',
    otSlotIds: [] as number[],
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

  // Fetch OT rooms using the same API as OT Rooms Management - load immediately
  useEffect(() => {
    const fetchOTRooms = async () => {
      try {
        setOTRoomsLoading(true);
        // Use getAllLegacy to fetch all OT rooms from all pages (same API endpoint as OT Rooms Management)
        // This loads all rooms immediately, no pagination/lazy loading
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
          setOTSlots(slots || []);
          
          // Log slots with patient information (safely)
          if (slots && Array.isArray(slots)) {
            try {
              console.log(`=== OT Slots for OT ID: ${selectedOTId} ===`);
              slots.forEach((slot: any) => {
                try {
                  // Use isOccupied from the mapped slot (which is set based on IsAvailable=false or OccupiedByPatientId)
                  const isOccupied = slot?.isOccupied === true;
                  const slotNo = slot?.otSlotNo || 'N/A';
                  const startTime = slot?.slotStartTime || 'N/A';
                  const endTime = slot?.slotEndTime || 'N/A';
                  
                  if (isOccupied) {
                    const patientNo = slot?.patientNo || '';
                    
                    if (patientNo) {
                      console.log(`Slot ${slotNo} (${startTime} to ${endTime}): OCCUPIED - Patient No: ${patientNo}`);
                    } else {
                      console.log(`Slot ${slotNo} (${startTime} to ${endTime}): OCCUPIED - Patient No: N/A`);
                    }
                  } else {
                    console.log(`Slot ${slotNo} (${startTime} to ${endTime}): UNOCCUPIED/AVAILABLE`);
                  }
                } catch (slotErr) {
                  console.error('Error logging slot:', slotErr);
                }
              });
              console.log(`=== Total Slots: ${slots.length} ===`);
            } catch (logErr) {
              console.error('Error in slot logging:', logErr);
            }
          }
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

  // Fetch all OT slots for all rooms
  useEffect(() => {
    const fetchAllSlots = async () => {
      try {
        const { otSlotsApi } = await import('../api/otSlots');
        const slotPromises = otRooms.map(room => 
          otSlotsApi.getAll(undefined, room.id).catch(err => {
            console.error(`Failed to fetch slots for OT ${room.id}:`, err);
            return [];
          })
        );
        const allSlotsArrays = await Promise.all(slotPromises);
        const allSlots = allSlotsArrays.flat();
        setAllOTSlots(allSlots);
      } catch (err) {
        console.error('Failed to fetch all OT slots:', err);
      }
    };
    if (otRooms.length > 0) {
      fetchAllSlots();
    }
  }, [otRooms]);

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

  // Auto-update status when allocation date or selected slots change
  useEffect(() => {
    const slotIds = formData.otSlotIds || [];
    const allocationDate = formData.otAllocationDate;
    
    if (slotIds.length > 0 && allocationDate && otSlots.length > 0) {
      const selectedSlots = otSlots.filter(s => slotIds.includes(s.id));
      if (selectedSlots.length > 0) {
        // Check the earliest slot for status
        const earliestSlot = selectedSlots.reduce((earliest, current) => {
          if (!earliest.slotStartTime) return current;
          if (!current.slotStartTime) return earliest;
          return current.slotStartTime < earliest.slotStartTime ? current : earliest;
        });
        
        if (earliestSlot.slotStartTime && earliestSlot.slotEndTime) {
          const newStatus = getStatusFromSlotTime(
            earliestSlot.slotStartTime, 
            earliestSlot.slotEndTime,
            allocationDate
          ) as 'Scheduled' | 'InProgress' | 'Completed';
          
          // Only update if status actually changed
          if (formData.operationStatus !== newStatus) {
            setFormData(prev => ({ ...prev, operationStatus: newStatus }));
          }
        }
      }
    }
  }, [formData.otSlotIds?.join(','), formData.otAllocationDate, otSlots.length, formData.operationStatus]);

  // Helper function to check if a slot's end time has passed today
  const isSlotTimePassed = (slotEndTime: string, allocationDate?: string): boolean => {
    if (!slotEndTime) return false;
    
    const today = getTodayIST();
    const slotDate = allocationDate || today;
    
    // If slot date is not today, don't consider it passed
    if (slotDate !== today) return false;
    
    // Get current time in IST
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000;
    const istNow = new Date(now.getTime() + istOffset);
    const currentTime = `${String(istNow.getUTCHours()).padStart(2, '0')}:${String(istNow.getUTCMinutes()).padStart(2, '0')}:${String(istNow.getUTCSeconds()).padStart(2, '0')}`;
    
    // Compare times (HH:MM:SS format)
    return slotEndTime <= currentTime;
  };

  // Helper function to determine status based on slot time
  const getStatusFromSlotTime = (slotStartTime: string, slotEndTime: string, allocationDate?: string): 'Scheduled' | 'InProgress' | 'Completed' => {
    if (!slotStartTime || !slotEndTime) return 'Scheduled';
    
    const today = getTodayIST();
    const slotDate = allocationDate || today;
    
    // If slot date is not today, it's scheduled
    if (slotDate !== today) return 'Scheduled';
    
    // Get current time in IST
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000;
    const istNow = new Date(now.getTime() + istOffset);
    const currentTime = `${String(istNow.getUTCHours()).padStart(2, '0')}:${String(istNow.getUTCMinutes()).padStart(2, '0')}:${String(istNow.getUTCSeconds()).padStart(2, '0')}`;
    
    // If current time is before slot start, it's scheduled
    if (currentTime < slotStartTime) return 'Scheduled';
    
    // If current time is after slot end, it's completed
    if (currentTime >= slotEndTime) return 'Completed';
    
    // If current time is between start and end, it's in progress
    return 'InProgress';
  };

  // Function to refresh both allocations and slots
  const refreshAllData = async () => {
    try {
      // Refresh allocations
      await fetchPatientOTAllocations();
      
      // Refresh all OT slots
      if (otRooms.length > 0) {
        const { otSlotsApi } = await import('../api/otSlots');
        const slotPromises = otRooms.map(room => 
          otSlotsApi.getAll(undefined, room.id).catch(err => {
            console.error(`Failed to fetch slots for OT ${room.id}:`, err);
            return [];
          })
        );
        const allSlotsArrays = await Promise.all(slotPromises);
        const allSlots = allSlotsArrays.flat();
        setAllOTSlots(allSlots);
        console.log('Refreshed OT slots:', allSlots.length);
      }
    } catch (err) {
      console.error('Failed to refresh data:', err);
    }
  };

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
        // Refresh both allocations and slots after successful delete
        await refreshAllData();
      } catch (err) {
        console.error('Failed to delete patient OT allocation:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to delete patient OT allocation';
        alert(errorMessage);
      }
    }
  };

  const handleDuplicate = (allocation: PatientOTAllocation) => {
    setSelectedAllocation(allocation);
    setFormData({
      patientId: allocation.patientId || '',
      roomAdmissionId: allocation.roomAdmissionId?.toString() || '',
      patientAppointmentId: allocation.patientAppointmentId ? (() => {
        const appointment = patientAppointments.find(a => a.patientAppointmentId === allocation.patientAppointmentId);
        return appointment ? appointment.id.toString() : '';
      })() : '',
      emergencyBedSlotId: allocation.emergencyBedSlotId?.toString() || '',
      otId: allocation.otId.toString(),
      otSlotIds: [], // Clear slots for new selection
      surgeryId: allocation.surgeryId?.toString() || '',
      leadSurgeonId: allocation.leadSurgeonId.toString(),
      assistantDoctorId: allocation.assistantDoctorId?.toString() || '',
      anaesthetistId: allocation.anaesthetistId?.toString() || '',
      nurseId: allocation.nurseId?.toString() || '',
      otAllocationDate: formatDateIST(allocation.otAllocationDate),
      duration: allocation.duration || '',
      otStartTime: allocation.otStartTime || '',
      otEndTime: allocation.otEndTime || '',
      otActualStartTime: '', // Clear actual times
      otActualEndTime: '', // Clear actual times
      operationDescription: allocation.operationDescription || '',
      operationStatus: 'Scheduled', // Reset to Scheduled
      preOperationNotes: allocation.preOperationNotes || '',
      postOperationNotes: allocation.postOperationNotes || '',
      otDocuments: allocation.otDocuments || '',
      billId: allocation.billId?.toString() || '',
      status: 'Active',
    });
    setSelectedOTId(allocation.otId.toString());
    if (allocation.emergencyBedSlotId) {
      const bedSlot = emergencyBedSlots.find(s => s.id === allocation.emergencyBedSlotId);
      if (bedSlot && (bedSlot as any).emergencyBedId) {
        setSelectedEmergencyBedId((bedSlot as any).emergencyBedId);
      }
    } else {
      setSelectedEmergencyBedId(null);
    }
    setIsDuplicateDialogOpen(true);
  };

  const handleDuplicateSubmit = async () => {
    if (!selectedAllocation) return;
    
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
      patientIdValue = selectedAllocation.patientId;
    }
    
    if (!formData.otId || !formData.leadSurgeonId || !formData.otAllocationDate) {
      alert('Please fill in all required fields (OT, Lead Surgeon, Date).');
      return;
    }
    
    try {
      await handleCreate({
        patientId: patientIdValue,
        roomAdmissionId: formData.roomAdmissionId ? Number(formData.roomAdmissionId) : null,
        patientAppointmentId: formData.patientAppointmentId ? Number(formData.patientAppointmentId) : null,
        emergencyBedSlotId: formData.emergencyBedSlotId ? Number(formData.emergencyBedSlotId) : null,
        otId: Number(formData.otId),
        otSlotIds: formData.otSlotIds || [],
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
      // Refresh both allocations and slots after successful duplicate create
      await refreshAllData();
      setIsDuplicateDialogOpen(false);
      setSelectedAllocation(null);
      setFormData({
        patientId: '',
        roomAdmissionId: '',
        patientAppointmentId: '',
        emergencyBedSlotId: '',
        otId: '',
        otSlotIds: [],
        surgeryId: '',
        leadSurgeonId: '',
        assistantDoctorId: '',
        anaesthetistId: '',
        nurseId: '',
        otAllocationDate: getTodayIST(),
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
      console.log('Form data otSlotIds before create:', formData.otSlotIds);
      
      // Check if any selected slot has passed its time and auto-update status
      let finalStatus = formData.operationStatus;
      if (formData.otSlotIds && formData.otSlotIds.length > 0) {
        const selectedSlots = otSlots.filter(s => formData.otSlotIds.includes(s.id));
        if (selectedSlots.length > 0) {
          // Check the earliest slot for status
          const earliestSlot = selectedSlots.reduce((earliest, current) => {
            if (!earliest.slotStartTime) return current;
            if (!current.slotStartTime) return earliest;
            return current.slotStartTime < earliest.slotStartTime ? current : earliest;
          });
          
          if (earliestSlot.slotStartTime && earliestSlot.slotEndTime) {
            finalStatus = getStatusFromSlotTime(
              earliestSlot.slotStartTime, 
              earliestSlot.slotEndTime,
              formData.otAllocationDate
            ) as 'Scheduled' | 'InProgress' | 'Completed';
          }
        }
      }
      
      try {
        await handleCreate({
          patientId: patientIdValue, // Required
          roomAdmissionId: formData.roomAdmissionId ? Number(formData.roomAdmissionId) : null,
          patientAppointmentId: formData.patientAppointmentId ? Number(formData.patientAppointmentId) : null,
          emergencyBedSlotId: formData.emergencyBedSlotId ? Number(formData.emergencyBedSlotId) : null,
          otId: Number(formData.otId),
          otSlotIds: formData.otSlotIds && formData.otSlotIds.length > 0 ? formData.otSlotIds : [],
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
          operationStatus: finalStatus === 'InProgress' ? 'In Progress' : finalStatus,
          preOperationNotes: formData.preOperationNotes || null,
          postOperationNotes: formData.postOperationNotes || null,
          otDocuments: formData.otDocuments || null,
          billId: formData.billId ? Number(formData.billId) : null,
          status: formData.status,
        });
        // Refresh both allocations and slots after successful create
        await refreshAllData();
        setIsAddDialogOpen(false);
      } catch (createError) {
        console.error('Create error:', createError);
        alert(`Failed to create: ${createError instanceof Error ? createError.message : 'Unknown error'}`);
        // Don't close dialog on error so user can retry
        return;
      }
      setFormData({
        patientId: '',
        roomAdmissionId: '',
        patientAppointmentId: '',
        emergencyBedSlotId: '',
        otId: '',
        otSlotIds: [],
        surgeryId: '',
        leadSurgeonId: '',
        assistantDoctorId: '',
        anaesthetistId: '',
        nurseId: '',
        otAllocationDate: getTodayIST(),
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
      console.log('Form data otSlotIds before update:', formData.otSlotIds);
      
      // Check if any selected slot has passed its time and auto-update status
      let finalStatus = formData.operationStatus;
      if (formData.otSlotIds && formData.otSlotIds.length > 0) {
        const selectedSlots = otSlots.filter(s => formData.otSlotIds.includes(s.id));
        if (selectedSlots.length > 0) {
          // Check the earliest slot for status
          const earliestSlot = selectedSlots.reduce((earliest, current) => {
            if (!earliest.slotStartTime) return current;
            if (!current.slotStartTime) return earliest;
            return current.slotStartTime < earliest.slotStartTime ? current : earliest;
          });
          
          if (earliestSlot.slotStartTime && earliestSlot.slotEndTime) {
            finalStatus = getStatusFromSlotTime(
              earliestSlot.slotStartTime, 
              earliestSlot.slotEndTime,
              formData.otAllocationDate
            ) as 'Scheduled' | 'InProgress' | 'Completed';
          }
        }
      }
      
      const updateData: Partial<UpdatePatientOTAllocationDto> = {
        patientId: patientIdValue,
        patientAppointmentId: formData.patientAppointmentId ? Number(formData.patientAppointmentId) : null,
        emergencyBedSlotId: formData.emergencyBedSlotId ? Number(formData.emergencyBedSlotId) : null,
        otId: Number(formData.otId),
        otSlotIds: formData.otSlotIds && formData.otSlotIds.length > 0 ? formData.otSlotIds : [],
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
        operationStatus: finalStatus === 'InProgress' ? 'In Progress' : finalStatus,
        preOperationNotes: formData.preOperationNotes || null,
        postOperationNotes: formData.postOperationNotes || null,
        otDocuments: formData.otDocuments || null,
        billId: formData.billId ? Number(formData.billId) : null,
        status: formData.status,
      };
      await handleUpdate(updateId, updateData);
      // Refresh both allocations and slots after successful update
      await refreshAllData();
      setIsEditDialogOpen(false);
      setSelectedAllocation(null);
      setFormData({
        patientId: '',
        roomAdmissionId: '',
        patientAppointmentId: '',
        emergencyBedSlotId: '',
        otId: '',
        otSlotIds: [],
        surgeryId: '',
        leadSurgeonId: '',
        assistantDoctorId: '',
        anaesthetistId: '',
        nurseId: '',
        otAllocationDate: getTodayIST(),
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

  const handleEdit = async (allocation: PatientOTAllocation) => {
    setSelectedAllocation(allocation);
    
    // Set the OT ID to load slots
    const otIdString = allocation.otId.toString();
    setSelectedOTId(otIdString);
    
    // Get slot IDs - first from allocation, then from slots API as fallback
    let slotIds: number[] = allocation.otSlotIds || [];
    
    // If no slot IDs in allocation, find them from slots API
    if (slotIds.length === 0) {
      try {
        const { otSlotsApi } = await import('../api/otSlots');
        const numericOtId = allocation.otId;
        const slots = await otSlotsApi.getAll(undefined, numericOtId);
        // Find slots that belong to this allocation
        const allocatedSlots = slots.filter(slot => 
          slot.patientOTAllocationId === allocation.id || 
          slot.patientOTAllocationId === allocation.patientOTAllocationId
        );
        slotIds = allocatedSlots.map(slot => slot.id);
      } catch (err) {
        console.error('Failed to fetch slots for allocation:', err);
      }
    }
    
    setFormData({
      patientId: allocation.patientId || '',
      roomAdmissionId: allocation.roomAdmissionId?.toString() || '',
      patientAppointmentId: allocation.patientAppointmentId ? (() => {
        // Find the appointment by patientAppointmentId and use its numeric id
        const appointment = patientAppointments.find(a => a.patientAppointmentId === allocation.patientAppointmentId);
        return appointment ? appointment.id.toString() : '';
      })() : '',
      emergencyBedSlotId: allocation.emergencyBedSlotId?.toString() || '',
      otId: otIdString,
      otSlotIds: slotIds,
      surgeryId: allocation.surgeryId?.toString() || '',
      leadSurgeonId: allocation.leadSurgeonId.toString(),
      assistantDoctorId: allocation.assistantDoctorId?.toString() || '',
      anaesthetistId: allocation.anaesthetistId?.toString() || '',
      nurseId: allocation.nurseId?.toString() || '',
      otAllocationDate: formatDateIST(allocation.otAllocationDate),
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
        return <Badge variant="outline" className="bg-red-100 text-red-700 border-red-300 text-sm"><Scissors className="size-3 mr-1" />In Progress</Badge>;
      case 'Completed':
        return <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300 text-sm"><CheckCircle2 className="size-3 mr-1" />Completed</Badge>;
      case 'Cancelled':
        return <Badge variant="outline" className="bg-red-100 text-red-700 border-red-300 text-sm"><XCircle className="size-3 mr-1" />Cancelled</Badge>;
      case 'Postponed':
        return <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-300 text-sm"><CalendarX className="size-3 mr-1" />Postponed</Badge>;
      default:
        return <Badge variant="outline" className="text-sm">{status}</Badge>;
    }
  };

  // Helper functions to filter allocations by status
  const getAllocationsByStatus = (status: PatientOTAllocation['operationStatus']) => {
    return patientOTAllocations.filter(a => a.operationStatus === status);
  };

  // Get today's date in YYYY-MM-DD format (IST)
  const getTodayDate = () => {
    return getTodayIST();
  };


  // Get today's scheduled surgeries (InProgress, Scheduled, Completed)
  const getTodayScheduled = () => {
    const today = getTodayDate();
    return patientOTAllocations.filter(a => {
      const allocationDateIST = formatDateIST(a.otAllocationDate);
      return allocationDateIST === today && 
             (a.operationStatus === 'InProgress' || 
              a.operationStatus === 'Scheduled' || 
              a.operationStatus === 'Completed');
    });
  };

  // Helper function to check if allocation matches slot by ID
  const doesAllocationMatchSlot = (allocation: PatientOTAllocation, slot: OTSlot): boolean => {
    // Check if slot's patientOTAllocationId matches this allocation
    if (slot.patientOTAllocationId && (slot.patientOTAllocationId === allocation.id || slot.patientOTAllocationId === allocation.patientOTAllocationId)) {
      return true;
    }
    const slotNo = (allocation as any).OTSlotNo;
    if (slotNo && slot.otSlotNo && slotNo === slot.otSlotNo) return true;
    return false;
  };

  // Get all rooms with their slots and today's allocations (simplified - just for display)
  const getTodayAllocationsByRoom = useMemo(() => {
    const today = getTodayDate();
    const todayAllocations = patientOTAllocations.filter(a => {
      let allocationDate = a.otAllocationDate;
      if (allocationDate.includes('T')) {
        allocationDate = allocationDate.split('T')[0];
      }
      const dateObj = new Date(allocationDate);
      const normalizedDate = dateObj.toISOString().split('T')[0];
      return normalizedDate === today;
    });

    let result = otRooms.map(room => {
      // Get all slots for this room
      const roomSlots = allOTSlots.filter(slot => {
        if (typeof slot.otId === 'string') {
          const numericId = parseInt(slot.otId.replace(/^OT-?/i, ''), 10);
          return !isNaN(numericId) && numericId === room.id;
        }
        return slot.otId === room.id;
      });

      // Get allocations for this room today
      const roomAllocations = todayAllocations.filter(a => a.otId === room.id);
      
      // Sort slots by start time
      const sortedSlots = [...roomSlots].sort((a, b) => {
        const timeA = a.slotStartTime ? parseInt(a.slotStartTime.replace(':', '')) : 0;
        const timeB = b.slotStartTime ? parseInt(b.slotStartTime.replace(':', '')) : 0;
        return timeA - timeB;
      });
      
      // Categorize allocations by status
      const ongoing = roomAllocations.filter(a => a.operationStatus === 'InProgress');
      const upcoming = roomAllocations.filter(a => a.operationStatus === 'Scheduled');
      const completed = roomAllocations.filter(a => a.operationStatus === 'Completed');

      return {
        room,
        slots: sortedSlots,
        ongoing,
        upcoming,
        completed,
      };
    });

    // Apply search filter if search term exists
    if (slotSearchTerm.trim()) {
      const searchLower = slotSearchTerm.toLowerCase().trim();
      result = result.map(roomData => {
        // Filter slots based on search term
        const filteredSlots = roomData.slots.filter(slot => {
          // Search in OT room info (with null/undefined checks)
          const roomMatch = 
            (roomData.room.otNo ? String(roomData.room.otNo).toLowerCase().includes(searchLower) : false) ||
            (roomData.room.otName ? String(roomData.room.otName).toLowerCase().includes(searchLower) : false) ||
            (roomData.room.otType ? String(roomData.room.otType).toLowerCase().includes(searchLower) : false) ||
            (roomData.room.otId ? String(roomData.room.otId).toLowerCase().includes(searchLower) : false);
          
          // Search in slot info
          const slotMatch = 
            (slot.otSlotNo ? String(slot.otSlotNo).toLowerCase().includes(searchLower) : false) ||
            (slot.slotStartTime ? String(slot.slotStartTime).toLowerCase().includes(searchLower) : false) ||
            (slot.slotEndTime ? String(slot.slotEndTime).toLowerCase().includes(searchLower) : false);
          
          // Search in availability/status
          // Determine status the same way as in card rendering
          const isAvailable = slot.isAvailable ?? true;
          const isOccupied = slot.isOccupied ?? false;
          let operationStatus = slot.operationStatus;
          
          // If slot doesn't have operationStatus, try to get it from allocation
          let allocation = null;
          if (!operationStatus && slot.patientOTAllocationId) {
            allocation = patientOTAllocations.find(a => 
              a.id === slot.patientOTAllocationId || 
              a.patientOTAllocationId === slot.patientOTAllocationId
            );
            if (allocation) {
              operationStatus = allocation.operationStatus;
            }
          }
          
          // Also try to find allocation by OT ID and slot ID if not found yet
          if (!allocation && slot.otIdNumber && slot.id) {
            allocation = patientOTAllocations.find(a => {
              const otIdMatches = a.otId === slot.otIdNumber;
              const slotIdMatches = a.otSlotIds && a.otSlotIds.includes(slot.id);
              return otIdMatches && slotIdMatches;
            });
            if (allocation && !operationStatus) {
              operationStatus = allocation.operationStatus;
            }
          }
          
          // Normalize operationStatus for comparison
          const normalizedStatus = operationStatus ? String(operationStatus).toLowerCase().trim().replace(/\s+/g, ' ') : '';
          const normalizedStatusNoSpace = normalizedStatus.replace(/\s+/g, '');
          
          const isCompleted = normalizedStatus === 'completed' || normalizedStatusNoSpace === 'completed';
          const isScheduled = normalizedStatus === 'scheduled' || normalizedStatusNoSpace === 'scheduled';
          const isInProgress = normalizedStatus === 'inprogress' || 
                               normalizedStatus === 'in progress' || 
                               normalizedStatusNoSpace === 'inprogress';
          const isPostponed = normalizedStatus === 'postponed' || normalizedStatusNoSpace === 'postponed';
          
          // Build status strings to match against (all lowercase for comparison)
          const statusStrings: string[] = [];
          
          if (isOccupied) {
            statusStrings.push('occupied');
          }
          if (isScheduled) {
            statusStrings.push('scheduled', 'upcoming');
          }
          if (isCompleted) {
            statusStrings.push('completed');
          }
          if (isInProgress) {
            statusStrings.push('inprogress', 'in progress', 'in-progress', 'progress', 'in', 'progressing');
          }
          if (isPostponed) {
            statusStrings.push('postponed');
          }
          if (!isAvailable && !isOccupied) {
            statusStrings.push('unavailable');
          }
          if (isAvailable && !isOccupied && !isScheduled && !isCompleted && !isInProgress) {
            statusStrings.push('available', 'free');
          }
          
          // Also add the raw operationStatus if it exists (normalize it)
          if (normalizedStatus) {
            statusStrings.push(normalizedStatus);
            // Also add without spaces for "In Progress" -> "inprogress"
            statusStrings.push(normalizedStatusNoSpace);
          }
          
          // Check if search term matches any status string (partial match)
          // Also check if search term directly matches normalized status
          const statusMatch = statusStrings.some(status => {
            return status.includes(searchLower) || searchLower.includes(status);
          }) || (normalizedStatus && (normalizedStatus.includes(searchLower) || searchLower.includes(normalizedStatus))) ||
              (normalizedStatusNoSpace && (normalizedStatusNoSpace.includes(searchLower) || searchLower.includes(normalizedStatusNoSpace)));
          
          // Search in patient info
          let patientMatch = false;
          if (slot.patientOTAllocationId) {
            const allocation = patientOTAllocations.find(a => 
              a.id === slot.patientOTAllocationId || 
              a.patientOTAllocationId === slot.patientOTAllocationId
            );
            if (allocation) {
              const patient = patients.find(p => p.PatientId === allocation.patientId);
              if (patient) {
                const patientName = `${(patient as any).patientName || (patient as any).PatientName || ''} ${(patient as any).lastName || (patient as any).LastName || ''}`.trim().toLowerCase();
                const patientNo = ((patient as any).PatientNo || (patient as any).patientNo || '').toLowerCase();
                patientMatch = patientName.includes(searchLower) || patientNo.includes(searchLower);
              }
            }
          }
          
          return roomMatch || slotMatch || statusMatch || patientMatch;
        });

        return {
          ...roomData,
          slots: filteredSlots
        };
      }).filter(roomData => roomData.slots.length > 0);
    }

    return result;
  }, [patientOTAllocations, otRooms, allOTSlots, slotSearchTerm, patients]);

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
      <div className="flex-1 bg-gray-50 flex flex-col overflow-hidden min-h-0 dashboard-scrollable" style={{ maxHeight: '100vh', minHeight: 0 }}>
        <div className="overflow-y-auto overflow-x-hidden flex-1 flex flex-col min-h-0">
          <div className="px-6 pt-6 pb-0 flex-shrink-0">
            <div className="flex items-center justify-between mb-4 flex-shrink-0">
              <div>
                <h1 className="text-gray-900 mb-2 text-2xl">Patient OT Allocation Management</h1>
                <p className="text-gray-500 text-base">Manage patient operating theater allocations</p>
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
                            setFormData({ ...formData, otId: e.target.value, otSlotIds: [] });
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
                      <Label>OT Slots (Optional)</Label>
                      <div className="border border-gray-200 rounded-md p-3 max-h-48 overflow-y-auto" style={{ maxHeight: '200px' }}>
                        {!formData.otId ? (
                          <p className="text-sm text-gray-500">Please select an OT first</p>
                        ) : otSlots.length === 0 ? (
                          <p className="text-sm text-gray-500">No slots available for this OT</p>
                        ) : (
                          otSlots.map(slot => {
                            // Get patient number for display
                            let patientNo = slot.patientNo || null;
                            // If not available from slot, try to find from allocation
                            if (!patientNo && slot.patientOTAllocationId) {
                              const allocation = patientOTAllocations.find(a => 
                                a.id === slot.patientOTAllocationId || 
                                a.patientOTAllocationId === slot.patientOTAllocationId
                              );
                              if (allocation?.patientId) {
                                const patient = patients.find(p => p.PatientId === allocation.patientId);
                                patientNo = patient ? (patient.PatientNo || (patient as any).patientNo) : null;
                              }
                            }
                            // If still not available, try from slot.patientId
                            if (!patientNo && slot.patientId) {
                              const patient = patients.find(p => p.PatientId === slot.patientId);
                              patientNo = patient ? (patient.PatientNo || (patient as any).patientNo) : null;
                            }
                            
                            // A slot is occupied if isOccupied is true (which is set based on IsAvailable=false or OccupiedByPatientId)
                            const isSlotOccupied = slot.isOccupied === true;
                            const patientInfo = patientNo ? ` - Patient No: ${patientNo}` : '';
                            
                            // Check if slot time has passed today
                            const slotTimePassed = isSlotTimePassed(slot.slotEndTime || '', formData.otAllocationDate);
                            const isDisabled = slotTimePassed;
                            
                            return (
                              <label 
                                key={slot.id} 
                                className={`flex items-center gap-2 py-1 rounded px-2 ${
                                  isDisabled 
                                    ? 'opacity-50 cursor-not-allowed bg-gray-100' 
                                    : 'cursor-pointer hover:bg-gray-50'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={(formData.otSlotIds || []).includes(slot.id)}
                                  disabled={isDisabled}
                                  onChange={(e) => {
                                    if (isDisabled) return;
                                    const currentSlotIds = formData.otSlotIds || [];
                                    let newSlotIds: number[];
                                    if (e.target.checked) {
                                      newSlotIds = [...currentSlotIds, slot.id];
                                    } else {
                                      newSlotIds = currentSlotIds.filter(id => id !== slot.id);
                                    }
                                    
                                    // Auto-update status based on selected slots
                                    const selectedSlots = otSlots.filter(s => newSlotIds.includes(s.id));
                                    let newStatus = formData.operationStatus;
                                    if (selectedSlots.length > 0) {
                                      // Check the earliest slot for status
                                      const earliestSlot = selectedSlots.reduce((earliest, current) => {
                                        if (!earliest.slotStartTime) return current;
                                        if (!current.slotStartTime) return earliest;
                                        return current.slotStartTime < earliest.slotStartTime ? current : earliest;
                                      });
                                      
                                      if (earliestSlot.slotStartTime && earliestSlot.slotEndTime) {
                                        newStatus = getStatusFromSlotTime(
                                          earliestSlot.slotStartTime, 
                                          earliestSlot.slotEndTime,
                                          formData.otAllocationDate
                                        ) as 'Scheduled' | 'InProgress' | 'Completed';
                                      }
                                    }
                                    
                                    setFormData({ 
                                      ...formData, 
                                      otSlotIds: newSlotIds,
                                      operationStatus: newStatus
                                    });
                                  }}
                                  className="rounded border-gray-300"
                                />
                                <span className={`text-sm ${isDisabled ? 'text-gray-400' : 'text-gray-700'}`}>
                                  {slot.otSlotNo} - {slot.slotStartTime} to {slot.slotEndTime}
                                  {isSlotOccupied && patientInfo && <span className="ml-2 text-xs text-red-600">(Occupied{patientInfo})</span>}
                                  {slot.isAvailable && !isSlotOccupied && !isDisabled && <span className="ml-2 text-xs text-green-600">(Available)</span>}
                                  {isDisabled && <span className="ml-2 text-xs text-gray-500">(Time Passed)</span>}
                                </span>
                              </label>
                            );
                          })
                        )}
                      </div>
                      {formData.otSlotIds && formData.otSlotIds.length > 0 && (
                        <p className="text-xs text-gray-500 mt-1">Selected: {formData.otSlotIds.length} slot(s)</p>
                      )}
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
          </div>
          <div className="px-6 pt-4 pb-4 flex-1">
          {/* Quick Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
            <Card className="bg-white border border-gray-200 shadow-sm rounded-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-blue-500 p-3 rounded-lg shadow-sm flex items-center justify-center">
                    <Calendar className="size-6 text-white" strokeWidth={2} />
                  </div>
                  <span className="text-xs font-medium text-gray-500">Today Scheduled</span>
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-1">{getTodayScheduled().length}</h3>
                <p className="text-sm text-gray-500">Today's Surgeries</p>
              </CardContent>
            </Card>
            <Card className="bg-white border border-gray-200 shadow-sm rounded-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-blue-500 p-3 rounded-lg shadow-sm flex items-center justify-center">
                    <Scissors className="size-6 text-white" strokeWidth={2} />
                  </div>
                  <span className="text-xs font-medium text-gray-500">Ongoing</span>
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-1">{getAllocationsByStatus('InProgress').length}</h3>
                <p className="text-sm text-gray-500">In Progress</p>
              </CardContent>
            </Card>
            <Card className="bg-white border border-gray-200 shadow-sm rounded-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-yellow-500 p-3 rounded-lg shadow-sm flex items-center justify-center">
                    <Clock className="size-6 text-white" strokeWidth={2} />
                  </div>
                  <span className="text-xs font-medium text-gray-500">Upcoming</span>
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-1">{getAllocationsByStatus('Scheduled').length}</h3>
                <p className="text-sm text-gray-500">Scheduled</p>
              </CardContent>
            </Card>
            <Card className="bg-white border border-gray-200 shadow-sm rounded-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-green-500 p-3 rounded-lg shadow-sm flex items-center justify-center">
                    <CheckCircle2 className="size-6 text-white" strokeWidth={2} />
                  </div>
                  <span className="text-xs font-medium text-gray-500">Completed</span>
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-1">{getAllocationsByStatus('Completed').length}</h3>
                <p className="text-sm text-gray-500">Completed</p>
              </CardContent>
            </Card>
            <Card className="bg-white border border-gray-200 shadow-sm rounded-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-red-500 p-3 rounded-lg shadow-sm flex items-center justify-center">
                    <XCircle className="size-6 text-white" strokeWidth={2} />
                  </div>
                  <span className="text-xs font-medium text-gray-500">Cancelled</span>
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-1">{getAllocationsByStatus('Cancelled').length}</h3>
                <p className="text-sm text-gray-500">Cancelled</p>
              </CardContent>
            </Card>
            <Card className="bg-white border border-gray-200 shadow-sm rounded-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-orange-500 p-3 rounded-lg shadow-sm flex items-center justify-center">
                    <CalendarX className="size-6 text-white" strokeWidth={2} />
                  </div>
                  <span className="text-xs font-medium text-gray-500">Postponed</span>
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-1">{getAllocationsByStatus('Postponed').length}</h3>
                <p className="text-sm text-gray-500">Postponed</p>
              </CardContent>
            </Card>
          </div>

          {/* Slot Cards for Today */}
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Today's OT Room/Slot Status</h2>
            
            {/* Search Filter */}
            <Card className="mb-6 bg-white">
              <CardContent className="p-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                  <Input
                    placeholder="Search by OT room, slot number, patient name, time, or status (available, occupied, scheduled, in progress, completed)..."
                    value={slotSearchTerm}
                    onChange={(e) => setSlotSearchTerm(e.target.value)}
                    className="pl-10 bg-gray-50"
                  />
                </div>
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-4">
              {getTodayAllocationsByRoom.length === 0 ? (
                <div className="col-span-full text-center py-8 text-gray-500 text-sm">
                  {slotSearchTerm.trim() 
                    ? `No OT rooms or slots found matching "${slotSearchTerm}"`
                    : "No OT rooms found. Please ensure OT rooms are configured."}
                </div>
              ) : (
                getTodayAllocationsByRoom.flatMap((roomData) => {
                  // Create a card for each slot
                  if (roomData.slots.length === 0) {
                    // If no slots, show room card
                    return (
                      <Card key={roomData.room.id} className="bg-white border border-gray-200 shadow-sm rounded-lg">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <h3 className="text-base font-semibold text-gray-900">{roomData.room.otNo} - {roomData.room.otName}</h3>
                              <p className="text-xs text-gray-500">{roomData.room.otType}</p>
                            </div>
                          </div>
                          <div className="text-xs text-gray-400 italic p-2 bg-gray-50 rounded">
                            No slots configured
                          </div>
                        </CardContent>
                      </Card>
                    );
                  }
                  
                  // Return a card for each slot
                  return roomData.slots.map((slot, slotIdx) => {
                    const slotId = slot.id || parseInt(slot.otSlotId || '0');
                    
                    // Use backend-provided availability/occupancy information
                    const isAvailable = slot.isAvailable ?? true;
                    const isOccupied = slot.isOccupied ?? false;
                    const operationStatus = slot.operationStatus;
                    const isCompleted = operationStatus === 'Completed';
                    const isScheduled = operationStatus === 'Scheduled';
                    const isInProgress = operationStatus === 'InProgress';
                    
                    // Find allocation for this slot
                    // First try by patientOTAllocationId if available
                    let slotAllocation = slot.patientOTAllocationId 
                      ? patientOTAllocations.find(a => 
                          a.id === slot.patientOTAllocationId || 
                          a.patientOTAllocationId === slot.patientOTAllocationId
                        )
                      : null;
                    
                    // If not found, try matching by OT ID and slot ID
                    if (!slotAllocation && slot.otIdNumber && slot.id) {
                      slotAllocation = patientOTAllocations.find(a => {
                        // Match by OT ID
                        const otIdMatches = a.otId === slot.otIdNumber;
                        // Check if slot ID is in the otSlotIds array
                        const slotIdMatches = a.otSlotIds && a.otSlotIds.includes(slot.id);
                        return otIdMatches && slotIdMatches;
                      });
                    }
                    
                    // Get patient number for display
                    let patientNo = slot.patientNo || null;
                    if (!patientNo && slotAllocation?.patientId) {
                      const patient = patients.find(p => p.PatientId === slotAllocation.patientId);
                      patientNo = patient ? (patient.PatientNo || (patient as any).patientNo) : null;
                    }
                    
                    // Debug allocation lookup
                    if (slot.patientOTAllocationId || slot.otIdNumber) {
                      console.log(`[ALLOCATION LOOKUP] Slot ${slot.otSlotNo} (ID: ${slot.id}, OT: ${slot.otIdNumber}) - Found:`, slotAllocation ? 'YES' : 'NO', slotAllocation);
                    }
                    
                    // Handle card click to open edit dialog
                    const handleCardClick = (e: React.MouseEvent) => {
                      console.log('=== CARD CLICK DEBUG ===');
                      console.log('1. Event fired:', e);
                      console.log('2. Slot object:', slot);
                      console.log('3. Slot patientOTAllocationId:', slot.patientOTAllocationId);
                      console.log('4. Slot otIdNumber:', slot.otIdNumber);
                      console.log('5. Slot otSlotNo:', slot.otSlotNo);
                      console.log('6. Found slotAllocation:', slotAllocation);
                      console.log('7. All patientOTAllocations count:', patientOTAllocations.length);
                      console.log('8. Searching for allocation with ID:', slot.patientOTAllocationId);
                      
                      e.stopPropagation();
                      
                      if (slotAllocation) {
                        console.log('9. Opening edit dialog for allocation:', slotAllocation);
                        handleEdit(slotAllocation);
                      } else {
                        console.warn('10. No allocation found! Available allocation IDs:', patientOTAllocations.map(a => a.id || a.patientOTAllocationId));
                        console.warn('11. Slot details:', {
                          slotId: slot.id,
                          patientOTAllocationId: slot.patientOTAllocationId,
                          otIdNumber: slot.otIdNumber,
                          otSlotNo: slot.otSlotNo
                        });
                      }
                      console.log('=== END DEBUG ===');
                    };
                    
                    // Determine border color based on backend status
                    let borderColor = 'border-gray-200';
                    if (isOccupied || isInProgress) {
                      borderColor = 'border-red-300';
                    } else if (isCompleted) {
                      borderColor = 'border-green-300';
                    } else if (isScheduled) {
                      borderColor = 'border-blue-300';
                    } else if (!isAvailable) {
                      borderColor = 'border-orange-300';
                    }
                    
                    const cardClassName = `bg-white border shadow-sm rounded-lg ${borderColor}`;
                    const textClassName = 'text-gray-900';
                    const subtitleClassName = 'text-gray-500';
                    const isClickable = !!slotAllocation;
                    
                    // Debug: Log card rendering (only for slots with allocations or potential matches)
                    if (slotAllocation || slot.patientOTAllocationId || (slot.otIdNumber && slot.id)) {
                      console.log(`[CARD RENDER] Slot ${slot.otSlotNo || slotIdx} (ID: ${slot.id}, OT: ${slot.otIdNumber}) - patientOTAllocationId: ${slot.patientOTAllocationId}, isClickable: ${isClickable}, slotAllocation:`, slotAllocation);
                    }
                    
                    return (
                      <div
                        key={`${roomData.room.id}-${slot.id || slotIdx}`}
                        className="w-full"
                        onClick={(e) => {
                          console.log('[WRAPPER CLICK] Wrapper clicked. isClickable:', isClickable, 'Slot:', slot.otSlotNo);
                          if (isClickable) {
                            handleCardClick(e);
                          } else {
                            console.log('[TEST CLICK] Non-clickable card clicked. Slot:', slot.otSlotNo, 'Allocation:', slotAllocation, 'patientOTAllocationId:', slot.patientOTAllocationId);
                          }
                        }}
                        style={{ pointerEvents: 'auto', cursor: isClickable ? 'pointer' : 'default' }}
                      >
                        <Card 
                          className={`${cardClassName} ${isClickable ? 'hover:shadow-md transition-shadow' : ''} h-full`}
                          onClick={(e) => {
                            console.log('[CARD CLICK] Card element clicked');
                            e.stopPropagation();
                            if (isClickable) {
                              handleCardClick(e);
                            }
                          }}
                        >
                          <CardContent 
                            className="p-4"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (isClickable && slotAllocation) {
                                handleCardClick(e);
                              } else {
                                console.log('[CARDCONTENT CLICK] Card clicked but no allocation found. Slot:', slot.otSlotNo, 'OT:', slot.otIdNumber, 'Slot ID:', slot.id);
                                console.log('[CARDCONTENT CLICK] Available allocations:', patientOTAllocations.map(a => ({ id: a.id, otId: a.otId, otSlotIds: a.otSlotIds })));
                              }
                            }}
                          >
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <h3 className={`text-base font-semibold ${textClassName}`}>{roomData.room.otNo} - {slot.otSlotNo || `Slot ${slotIdx + 1}`}</h3>
                              <p className={`text-xs ${subtitleClassName}`}>{roomData.room.otName} ({roomData.room.otType})</p>
                            </div>
                            {isOccupied && (
                              <div className="px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-700">
                                {patientNo ? `(Occupied - Patient No: ${patientNo})` : 'Occupied'}
                              </div>
                            )}
                            {isScheduled && !isOccupied && (
                              <div className="px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-700">
                                Upcoming
                              </div>
                            )}
                            {isCompleted && (
                              <div className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-700">
                                Completed
                              </div>
                            )}
                            {!isAvailable && !isOccupied && (
                              <div className="px-2 py-1 rounded text-xs font-medium bg-orange-100 text-orange-700">
                                Unavailable
                              </div>
                            )}
                            {isAvailable && !isOccupied && !isScheduled && !isCompleted && (
                              <div className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700">
                                Available
                              </div>
                            )}
                          </div>
                          
                          {/* Slot Time */}
                          {slot.slotStartTime && slot.slotEndTime && (
                            <div className="mb-3 p-2 rounded bg-gray-50">
                              <div className="flex items-center gap-2 text-sm">
                                <Clock className="size-4 text-gray-600" />
                                <span className="font-medium text-gray-700">
                                  {slot.slotStartTime} - {slot.slotEndTime}
                                </span>
                              </div>
                            </div>
                          )}
                          
                          {/* Allocation Details from Backend */}
                          {slot.patientOTAllocationId && slotAllocation && (
                            <div className="space-y-2 mb-3">
                              {isInProgress && (
                                <div className="flex items-center justify-between p-2 bg-red-50 rounded">
                                  <div className="flex items-center gap-2">
                                    <Scissors className="size-4 text-red-600" />
                                    <span className="text-sm font-medium text-red-900">
                                      {patientNo ? `(Occupied - Patient No: ${patientNo})` : 'Occupied'}
                                    </span>
                                  </div>
                                </div>
                              )}
                              {isScheduled && (
                                <div className="flex items-center justify-between p-2 bg-yellow-50 rounded">
                                  <div className="flex items-center gap-2">
                                    <Clock className="size-4 text-yellow-600" />
                                    <span className="text-sm font-medium text-yellow-900">Upcoming</span>
                                  </div>
                                </div>
                              )}
                              {isCompleted && (
                                <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                                  <div className="flex items-center gap-2">
                                    <CheckCircle2 className="size-4 text-green-600" />
                                    <span className="text-sm font-medium text-green-900">Completed</span>
                                  </div>
                                </div>
                              )}
                              {slotAllocation.operationDescription && (
                                <div className="text-xs text-gray-600 p-2 bg-gray-50 rounded">
                                  {slotAllocation.operationDescription}
                                </div>
                              )}
                            </div>
                          )}
                          </CardContent>
                        </Card>
                      </div>
                    );
                  });
                })
              )}
            </div>
          </div>

          {/* Patient OT Allocation Table */}
          <Card className="bg-white border border-gray-200 shadow-sm rounded-lg mb-4">
            <CardContent className="p-6">
              {/* Search Filter */}
              <Card className="mb-6 bg-white">
                <CardContent className="p-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                    <Input
                      placeholder="Search by patient name, patient number, OT room, slot, surgeon, date, time, operation, or status..."
                      value={tableSearchTerm}
                      onChange={(e) => setTableSearchTerm(e.target.value)}
                      className="pl-10 bg-gray-50"
                    />
                  </div>
                </CardContent>
              </Card>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-4 px-6 text-gray-700">ID</th>
                      <th className="text-left py-4 px-6 text-gray-700">Patient Source</th>
                      <th className="text-left py-4 px-6 text-gray-700">OT</th>
                      <th className="text-left py-4 px-6 text-gray-700">OT Slot</th>
                      <th className="text-left py-4 px-6 text-gray-700">Lead Surgeon</th>
                      <th className="text-left py-4 px-6 text-gray-700">Date</th>
                      <th className="text-left py-4 px-6 text-gray-700">Start Time</th>
                      <th className="text-left py-4 px-6 text-gray-700">End Time</th>
                      <th className="text-left py-4 px-6 text-gray-700">Operation</th>
                      <th className="text-left py-4 px-6 text-gray-700">Status</th>
                      <th className="text-left py-4 px-6 text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      // Filter allocations based on search term
                      const filteredAllocations = tableSearchTerm.trim() 
                        ? patientOTAllocations.filter((allocation) => {
                            const searchLower = tableSearchTerm.toLowerCase().trim();
                            
                            // Get related data
                            const otRoom = otRooms.find(ot => ot.id === allocation.otId);
                            const leadSurgeon = doctors.find(d => d.id === allocation.leadSurgeonId);
                            const patient = patients.find(p => 
                              (p as any).patientId === allocation.patientId || 
                              (p as any).PatientId === allocation.patientId
                            );
                            
                            // Get slot numbers
                            const slotNumbers = allocation.otSlotIds?.map(slotId => {
                              const slot = allOTSlots.find(s => s.id === slotId);
                              return slot?.otSlotNo || slotId;
                            }).join(', ') || '';
                            
                            // Patient name and number
                            const patientName = patient ? 
                              `${(patient as any).patientName || (patient as any).PatientName || ''} ${(patient as any).lastName || (patient as any).LastName || ''}`.trim().toLowerCase() : '';
                            const patientNo = patient ? 
                              ((patient as any).PatientNo || (patient as any).patientNo || '').toLowerCase() : '';
                            
                            // OT room info
                            const otRoomNo = otRoom?.otNo ? String(otRoom.otNo).toLowerCase() : '';
                            const otRoomName = otRoom?.otName ? String(otRoom.otName).toLowerCase() : '';
                            
                            // Surgeon name
                            const surgeonName = leadSurgeon ? 
                              `${(leadSurgeon as any).firstName || ''} ${(leadSurgeon as any).lastName || ''}`.trim().toLowerCase() : '';
                            
                            // Date
                            const allocationDate = allocation.otAllocationDate ? 
                              new Date(allocation.otAllocationDate).toLocaleDateString().toLowerCase() : '';
                            
                            // Time
                            const startTime = allocation.otStartTime ? String(allocation.otStartTime).toLowerCase() : '';
                            const endTime = allocation.otEndTime ? String(allocation.otEndTime).toLowerCase() : '';
                            
                            // Operation description
                            const operationDesc = allocation.operationDescription ? 
                              String(allocation.operationDescription).toLowerCase() : '';
                            
                            // Status
                            const status = allocation.operationStatus ? 
                              String(allocation.operationStatus).toLowerCase() : '';
                            
                            // ID
                            const allocationId = allocation.id ? String(allocation.id).toLowerCase() : '';
                            
                            // Check if search term matches any field
                            return patientName.includes(searchLower) ||
                                   patientNo.includes(searchLower) ||
                                   otRoomNo.includes(searchLower) ||
                                   otRoomName.includes(searchLower) ||
                                   slotNumbers.toLowerCase().includes(searchLower) ||
                                   surgeonName.includes(searchLower) ||
                                   allocationDate.includes(searchLower) ||
                                   startTime.includes(searchLower) ||
                                   endTime.includes(searchLower) ||
                                   operationDesc.includes(searchLower) ||
                                   status.includes(searchLower) ||
                                   allocationId.includes(searchLower);
                          })
                        : patientOTAllocations;
                      
                      if (filteredAllocations.length === 0) {
                        return (
                          <tr>
                            <td colSpan={11} className="text-center py-8 text-gray-500 text-sm">
                              {tableSearchTerm.trim() 
                                ? `No OT allocations found matching "${tableSearchTerm}"`
                                : "No OT allocations found. Add a new allocation to get started."}
                            </td>
                          </tr>
                        );
                      }
                      
                      return filteredAllocations.map((allocation) => {
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
                          patientSource = patientName;
                        } else if (allocation.roomAdmissionId) {
                          patientSource = `IPD: ${admission?.patientName || 'N/A'} (${admission?.bedNumber || 'N/A'})`;
                        } else if (allocation.patientAppointmentId) {
                          patientSource = `OPD: ${appointment?.patientAppointmentId || 'N/A'}`;
                        } else if (allocation.emergencyBedId) {
                          patientSource = `Emergency: ${emergencyBed?.emergencyBedNo || 'N/A'}`;
                        }

                        return (
                          <tr key={allocation.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-4 px-6 text-gray-900 font-mono font-medium whitespace-nowrap">{allocation.patientOTAllocationId}</td>
                            <td className="py-4 px-6 text-gray-600 whitespace-nowrap min-w-[120px]">{patientSource}</td>
                            <td className="py-4 px-6 text-gray-600 whitespace-nowrap min-w-[100px]">{otRoom ? `${otRoom.otNo} - ${otRoom.otName}` : allocation.otId}</td>
                            <td className="py-4 px-6 text-gray-600 whitespace-nowrap">
                              {allocation.otSlotIds && allocation.otSlotIds.length > 0 
                                ? allocation.otSlotIds.map((slotId, idx) => {
                                    // Find the slot to get slot number
                                    const slot = allOTSlots.find(s => s.id === slotId);
                                    return (
                                      <span key={slotId}>
                                        {slot ? slot.otSlotNo : slotId}
                                        {idx < allocation.otSlotIds!.length - 1 && ', '}
                                      </span>
                                    );
                                  })
                                : '-'
                              }
                            </td>
                            <td className="py-4 px-6 text-gray-600 whitespace-nowrap min-w-[100px]">{leadSurgeon?.name || allocation.leadSurgeonId}</td>
                            <td className="py-4 px-6 text-gray-600 whitespace-nowrap">{formatDateDisplayIST(allocation.otAllocationDate, 'numeric')}</td>
                            <td className="py-4 px-6 text-gray-600 whitespace-nowrap">{allocation.otStartTime || '-'}</td>
                            <td className="py-4 px-6 text-gray-600 whitespace-nowrap">{allocation.otEndTime || '-'}</td>
                            <td className="py-4 px-6 text-gray-600 whitespace-nowrap min-w-[150px]">{allocation.operationDescription || '-'}</td>
                            <td className="py-4 px-6 whitespace-nowrap">{getStatusBadge(allocation.operationStatus)}</td>
                            <td className="py-4 px-6 whitespace-nowrap">
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEdit(allocation)}
                                  className="h-7 w-7 p-0"
                                  title="Edit Allocation"
                                >
                                  <Edit className="size-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDuplicate(allocation)}
                                  className="h-7 w-7 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                  title="Duplicate Allocation"
                                >
                                  <Copy className="size-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDelete(allocation.id)}
                                  className="h-7 w-7 p-0 text-red-600 hover:text-red-700"
                                  title="Delete Allocation"
                                >
                                  <Trash2 className="size-3" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      });
                    })()}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
          </div>
        </div>
      </div>

      {/* Duplicate Dialog */}
      <Dialog open={isDuplicateDialogOpen} onOpenChange={setIsDuplicateDialogOpen}>
        <DialogContent className="p-0 gap-0 large-dialog max-h-[90vh]">
          <DialogHeader className="px-6 pt-4 pb-3 flex-shrink-0">
            <DialogTitle>Duplicate Patient OT Allocation</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto px-6 pb-1 patient-list-scrollable min-h-0">
            <div className="space-y-4 py-4">
              <div className="text-sm text-gray-600 p-3 bg-blue-50 rounded-md">
                <p className="font-medium mb-1">Patient Source (Select one):</p>
                <p className="text-xs">Choose either Patient (Direct OT), Room Admission (IPD), Patient Appointment (OPD), or Emergency Bed</p>
              </div>
              
              <div>
                <Label htmlFor="duplicate-patientId">Patient (Direct OT - Optional)</Label>
                <select
                  id="duplicate-patientId"
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
                <Label htmlFor="duplicate-roomAdmissionId">Room Admission (IPD - Optional)</Label>
                <select
                  id="duplicate-roomAdmissionId"
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
                <Label htmlFor="duplicate-patientAppointmentId">Patient Appointment (OPD - Optional)</Label>
                <select
                  id="duplicate-patientAppointmentId"
                  aria-label="Patient Appointment"
                  className="w-full px-3 py-2 border border-gray-200 rounded-md"
                  value={formData.patientAppointmentId}
                  onChange={(e) => setFormData({ ...formData, patientAppointmentId: e.target.value, patientId: '', roomAdmissionId: '', emergencyBedSlotId: '' })}
                >
                  <option value="">Select Patient Appointment (OPD)</option>
                  {patientAppointments.map(appointment => {
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
                <Label htmlFor="duplicate-emergencyBedSlotId">Emergency Bed Slot (Optional)</Label>
                <select
                  id="duplicate-emergencyBedSlotId"
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
                    <Label htmlFor="duplicate-otId">OT *</Label>
                    <select
                      id="duplicate-otId"
                      aria-label="OT"
                      className="w-full px-3 py-2 border border-gray-200 rounded-md"
                      value={formData.otId}
                      onChange={(e) => {
                        setSelectedOTId(e.target.value);
                        setFormData({ ...formData, otId: e.target.value, otSlotIds: [] });
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
                    <Label>OT Slots *</Label>
                    <div className="border border-gray-200 rounded-md p-3 max-h-48 overflow-y-auto" style={{ maxHeight: '200px' }}>
                      {!formData.otId ? (
                        <p className="text-sm text-gray-500">Please select an OT first</p>
                      ) : otSlots.length === 0 ? (
                        <p className="text-sm text-gray-500">No slots available for this OT</p>
                      ) : (
                        otSlots.map(slot => {
                          // Get patient number for display
                          let patientNo = slot.patientNo || null;
                          // If not available from slot, try to find from allocation
                          if (!patientNo && slot.patientOTAllocationId) {
                            const allocation = patientOTAllocations.find(a => 
                              a.id === slot.patientOTAllocationId || 
                              a.patientOTAllocationId === slot.patientOTAllocationId
                            );
                            if (allocation?.patientId) {
                              const patient = patients.find(p => p.PatientId === allocation.patientId);
                              patientNo = patient ? (patient.PatientNo || (patient as any).patientNo) : null;
                            }
                          }
                          // If still not available, try from slot.patientId
                          if (!patientNo && slot.patientId) {
                            const patient = patients.find(p => p.PatientId === slot.patientId);
                            patientNo = patient ? (patient.PatientNo || (patient as any).patientNo) : null;
                          }
                          
                          // A slot is occupied if it has isOccupied=true OR has a patientOTAllocationId
                          const isSlotOccupied = slot.isOccupied === true || !!slot.patientOTAllocationId;
                          const patientInfo = patientNo ? ` - Patient No: ${patientNo}` : '';
                          
                          // Check if slot time has passed today
                          const slotTimePassed = isSlotTimePassed(slot.slotEndTime || '', formData.otAllocationDate);
                          const isDisabled = slotTimePassed;
                          
                          return (
                            <label 
                              key={slot.id} 
                              className={`flex items-center gap-2 py-1 rounded px-2 ${
                                isDisabled 
                                  ? 'opacity-50 cursor-not-allowed bg-gray-100' 
                                  : 'cursor-pointer hover:bg-gray-50'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={(formData.otSlotIds || []).includes(slot.id)}
                                disabled={isDisabled}
                                onChange={(e) => {
                                  if (isDisabled) return;
                                  const currentSlotIds = formData.otSlotIds || [];
                                  let newSlotIds: number[];
                                  if (e.target.checked) {
                                    newSlotIds = [...currentSlotIds, slot.id];
                                  } else {
                                    newSlotIds = currentSlotIds.filter(id => id !== slot.id);
                                  }
                                  
                                  // Auto-update status based on selected slots
                                  const selectedSlots = otSlots.filter(s => newSlotIds.includes(s.id));
                                  let newStatus = formData.operationStatus;
                                  if (selectedSlots.length > 0) {
                                    // Check the earliest slot for status
                                    const earliestSlot = selectedSlots.reduce((earliest, current) => {
                                      if (!earliest.slotStartTime) return current;
                                      if (!current.slotStartTime) return earliest;
                                      return current.slotStartTime < earliest.slotStartTime ? current : earliest;
                                    });
                                    
                                    if (earliestSlot.slotStartTime && earliestSlot.slotEndTime) {
                                      newStatus = getStatusFromSlotTime(
                                        earliestSlot.slotStartTime, 
                                        earliestSlot.slotEndTime,
                                        formData.otAllocationDate
                                      ) as 'Scheduled' | 'InProgress' | 'Completed';
                                    }
                                  }
                                  
                                  setFormData({ 
                                    ...formData, 
                                    otSlotIds: newSlotIds,
                                    operationStatus: newStatus
                                  });
                                }}
                                className="rounded border-gray-300"
                              />
                              <span className={`text-sm ${isDisabled ? 'text-gray-400' : 'text-gray-700'}`}>
                                {slot.otSlotNo} - {slot.slotStartTime} to {slot.slotEndTime}
                                {isSlotOccupied && patientInfo && <span className="ml-2 text-xs text-red-600">(Occupied{patientInfo})</span>}
                                {slot.isAvailable && !isSlotOccupied && !isDisabled && <span className="ml-2 text-xs text-green-600">(Available)</span>}
                                {isDisabled && <span className="ml-2 text-xs text-gray-500">(Time Passed)</span>}
                              </span>
                            </label>
                          );
                        })
                      )}
                    </div>
                    {formData.otSlotIds && formData.otSlotIds.length > 0 && (
                      <p className="text-xs text-gray-500 mt-1">Selected: {formData.otSlotIds.length} slot(s)</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="duplicate-leadSurgeonId">Lead Surgeon *</Label>
                  <select
                    id="duplicate-leadSurgeonId"
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
                  <Label htmlFor="duplicate-assistantDoctorId">Assistant Doctor (Optional)</Label>
                  <select
                    id="duplicate-assistantDoctorId"
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
                  <Label htmlFor="duplicate-anaesthetistId">Anaesthetist (Optional)</Label>
                  <select
                    id="duplicate-anaesthetistId"
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
                  <Label htmlFor="duplicate-nurseId">Nurse (Optional)</Label>
                  <select
                    id="duplicate-nurseId"
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
                  <Label htmlFor="duplicate-otAllocationDate">OT Allocation Date *</Label>
                  <Input
                    id="duplicate-otAllocationDate"
                    type="date"
                    value={formData.otAllocationDate}
                    onChange={(e) => setFormData({ ...formData, otAllocationDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="duplicate-duration">Duration (Optional, in minutes)</Label>
                  <Input
                    id="duplicate-duration"
                    type="number"
                    placeholder="e.g., 120"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="duplicate-otStartTime">OT Start Time (Optional)</Label>
                  <Input
                    id="duplicate-otStartTime"
                    type="time"
                    value={formData.otStartTime}
                    onChange={(e) => setFormData({ ...formData, otStartTime: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="duplicate-otEndTime">OT End Time (Optional)</Label>
                  <Input
                    id="duplicate-otEndTime"
                    type="time"
                    value={formData.otEndTime}
                    onChange={(e) => setFormData({ ...formData, otEndTime: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="duplicate-operationDescription">Operation Description (Optional)</Label>
                <Textarea
                  id="duplicate-operationDescription"
                  placeholder="Enter operation description..."
                  value={formData.operationDescription}
                  onChange={(e) => setFormData({ ...formData, operationDescription: e.target.value })}
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="duplicate-operationStatus">Operation Status</Label>
                <select
                  id="duplicate-operationStatus"
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
                <Label htmlFor="duplicate-preOperationNotes">Pre Operation Notes (Optional)</Label>
                <Textarea
                  id="duplicate-preOperationNotes"
                  placeholder="e.g., ICU bed reserved post-surgery"
                  value={formData.preOperationNotes}
                  onChange={(e) => setFormData({ ...formData, preOperationNotes: e.target.value })}
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="duplicate-postOperationNotes">Post Operation Notes (Optional)</Label>
                <Textarea
                  id="duplicate-postOperationNotes"
                  placeholder="Enter post operation notes..."
                  value={formData.postOperationNotes}
                  onChange={(e) => setFormData({ ...formData, postOperationNotes: e.target.value })}
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="duplicate-otDocuments">OT Documents URL (Optional)</Label>
                <Input
                  id="duplicate-otDocuments"
                  type="url"
                  placeholder="https://documents.example.com/..."
                  value={formData.otDocuments}
                  onChange={(e) => setFormData({ ...formData, otDocuments: e.target.value })}
                />
                <p className="text-xs text-gray-500 mt-1">To be uploaded</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="duplicate-billId">Bill ID (Optional)</Label>
                  <select
                    id="duplicate-billId"
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
                  <Label htmlFor="duplicate-status">Status</Label>
                  <select
                    id="duplicate-status"
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
            <Button variant="outline" onClick={() => setIsDuplicateDialogOpen(false)} className="py-1">Cancel</Button>
            <Button onClick={handleDuplicateSubmit} className="py-1">Create Duplicate</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="p-0 gap-0 large-dialog max-h-[90vh]">
          <DialogHeader className="px-6 pt-4 pb-3 flex-shrink-0">
            <DialogTitle>Edit Patient OT Allocation</DialogTitle>
            {selectedAllocation && (() => {
              const patient = selectedAllocation.patientId 
                ? patients.find(p => p.PatientId === selectedAllocation.patientId)
                : null;
              const patientNo = patient ? (patient.PatientNo || (patient as any).patientNo) : null;
              if (patientNo && (selectedAllocation.operationStatus === 'InProgress' || selectedAllocation.operationStatus === 'Scheduled')) {
                return (
                  <p className="text-sm text-gray-700 mt-2 font-medium">
                    (Occupied - Patient No: {patientNo})
                  </p>
                );
              }
              return null;
            })()}
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
                        setFormData({ ...formData, otId: e.target.value, otSlotIds: [] });
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
                    <Label>OT Slots (Optional)</Label>
                    <div className="border border-gray-200 rounded-md p-3 max-h-48 overflow-y-auto" style={{ maxHeight: '200px' }}>
                      {!formData.otId ? (
                        <p className="text-sm text-gray-500">Please select an OT first</p>
                      ) : otSlots.length === 0 ? (
                        <p className="text-sm text-gray-500">No slots available for this OT</p>
                      ) : (
                        otSlots.map(slot => {
                          // Get patient number for display
                          let patientNo = slot.patientNo || null;
                          // If not available from slot, try to find from allocation
                          if (!patientNo && slot.patientOTAllocationId) {
                            const allocation = patientOTAllocations.find(a => 
                              a.id === slot.patientOTAllocationId || 
                              a.patientOTAllocationId === slot.patientOTAllocationId
                            );
                            if (allocation?.patientId) {
                              const patient = patients.find(p => p.PatientId === allocation.patientId);
                              patientNo = patient ? (patient.PatientNo || (patient as any).patientNo) : null;
                            }
                          }
                          // If still not available, try from slot.patientId
                          if (!patientNo && slot.patientId) {
                            const patient = patients.find(p => p.PatientId === slot.patientId);
                            patientNo = patient ? (patient.PatientNo || (patient as any).patientNo) : null;
                          }
                          
                          // A slot is occupied if it has isOccupied=true OR has a patientOTAllocationId
                          const isSlotOccupied = slot.isOccupied === true || !!slot.patientOTAllocationId;
                          const patientInfo = patientNo ? ` - Patient No: ${patientNo}` : '';
                          
                          // Check if slot time has passed today
                          const slotTimePassed = isSlotTimePassed(slot.slotEndTime || '', formData.otAllocationDate);
                          const isDisabled = slotTimePassed;
                          
                          return (
                            <label 
                              key={slot.id} 
                              className={`flex items-center gap-2 py-1 rounded px-2 ${
                                isDisabled 
                                  ? 'opacity-50 cursor-not-allowed bg-gray-100' 
                                  : 'cursor-pointer hover:bg-gray-50'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={(formData.otSlotIds || []).includes(slot.id)}
                                disabled={isDisabled}
                                onChange={(e) => {
                                  if (isDisabled) return;
                                  const currentSlotIds = formData.otSlotIds || [];
                                  let newSlotIds: number[];
                                  if (e.target.checked) {
                                    newSlotIds = [...currentSlotIds, slot.id];
                                  } else {
                                    newSlotIds = currentSlotIds.filter(id => id !== slot.id);
                                  }
                                  
                                  // Auto-update status based on selected slots
                                  const selectedSlots = otSlots.filter(s => newSlotIds.includes(s.id));
                                  let newStatus = formData.operationStatus;
                                  if (selectedSlots.length > 0) {
                                    // Check the earliest slot for status
                                    const earliestSlot = selectedSlots.reduce((earliest, current) => {
                                      if (!earliest.slotStartTime) return current;
                                      if (!current.slotStartTime) return earliest;
                                      return current.slotStartTime < earliest.slotStartTime ? current : earliest;
                                    });
                                    
                                    if (earliestSlot.slotStartTime && earliestSlot.slotEndTime) {
                                      newStatus = getStatusFromSlotTime(
                                        earliestSlot.slotStartTime, 
                                        earliestSlot.slotEndTime,
                                        formData.otAllocationDate
                                      ) as 'Scheduled' | 'InProgress' | 'Completed';
                                    }
                                  }
                                  
                                  setFormData({ 
                                    ...formData, 
                                    otSlotIds: newSlotIds,
                                    operationStatus: newStatus
                                  });
                                }}
                                className="rounded border-gray-300"
                              />
                              <span className={`text-sm ${isDisabled ? 'text-gray-400' : 'text-gray-700'}`}>
                                {slot.otSlotNo} - {slot.slotStartTime} to {slot.slotEndTime}
                                {isSlotOccupied && patientInfo && <span className="ml-2 text-xs text-red-600">(Occupied{patientInfo})</span>}
                                {slot.isAvailable && !isSlotOccupied && !isDisabled && <span className="ml-2 text-xs text-green-600">(Available)</span>}
                                {isDisabled && <span className="ml-2 text-xs text-gray-500">(Time Passed)</span>}
                              </span>
                            </label>
                          );
                        })
                      )}
                    </div>
                    {formData.otSlotIds && formData.otSlotIds.length > 0 && (
                      <p className="text-xs text-gray-500 mt-1">Selected: {formData.otSlotIds.length} slot(s)</p>
                    )}
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
