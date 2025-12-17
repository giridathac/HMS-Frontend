import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Siren, Plus, Edit, Trash2, Eye, Search, Activity, Users, AlertCircle, Heart, BedDouble, ChevronDown, ChevronUp } from 'lucide-react';
import { Switch } from './ui/switch';
import { useEmergencyAdmissions } from '../hooks/useEmergencyAdmissions';
import { useEmergencyBedSlots } from '../hooks/useEmergencyBedSlots';
import { useEmergencyBeds } from '../hooks/useEmergencyBeds';
import { useStaff } from '../hooks/useStaff';
import { useRoles } from '../hooks/useRoles';
import { patientsApi } from '../api/patients';
import { EmergencyAdmission, EmergencyAdmissionVitals, Patient } from '../types';
import { CreateEmergencyAdmissionDto, UpdateEmergencyAdmissionDto, emergencyAdmissionVitalsApi, CreateEmergencyAdmissionVitalsDto, UpdateEmergencyAdmissionVitalsDto } from '../api/emergencyAdmissions';
import { formatDateTimeIST } from '../utils/timeUtils';

export function EmergencyAdmissionManagement() {
  console.log('EmergencyAdmissionManagement component rendering');
  const { emergencyAdmissions, loading, error, createEmergencyAdmission, updateEmergencyAdmission, deleteEmergencyAdmission, fetchEmergencyAdmissions } = useEmergencyAdmissions();
  console.log('EmergencyAdmissionManagement - loading:', loading, 'error:', error, 'admissions count:', emergencyAdmissions.length);
  const { staff } = useStaff();
  const { roles } = useRoles();
  const { emergencyBedSlots } = useEmergencyBedSlots();
  const { emergencyBeds } = useEmergencyBeds();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [showAvailableBeds, setShowAvailableBeds] = useState(false);
  
  // Get all active emergency bed slots with their bed and admission info
  const bedSlotsWithInfo = useMemo(() => {
    return emergencyBedSlots
      .filter(slot => slot.status === 'Active')
      .map(slot => {
        const bed = emergencyBeds.find(b => b.id === slot.emergencyBedId);
        const admission = emergencyAdmissions.find(a => a.emergencyBedSlotId === slot.id);
        return {
          slot,
          bed,
          admission,
          roomNameNo: bed?.emergencyRoomNameNo || '-',
          bedId: bed?.emergencyBedId || '-',
          slotNo: slot.eBedSlotNo || '-',
        };
      });
  }, [emergencyBedSlots, emergencyBeds, emergencyAdmissions]);

  const occupiedBeds = bedSlotsWithInfo.filter(b => b.admission);
  const availableBeds = bedSlotsWithInfo.filter(b => !b.admission);

  // Sort admissions: Critical first, then Stable, then by date (newest first)
  const sortedAdmissions = useMemo(() => {
    return [...emergencyAdmissions].sort((a, b) => {
      // First sort by condition: Critical comes before Stable
      const conditionOrder = { 'Critical': 0, 'Stable': 1 };
      const conditionDiff = (conditionOrder[a.patientCondition] ?? 2) - (conditionOrder[b.patientCondition] ?? 2);
      if (conditionDiff !== 0) return conditionDiff;
      
      // Then sort by date (newest first)
      const dateA = new Date(a.emergencyAdmissionDate).getTime();
      const dateB = new Date(b.emergencyAdmissionDate).getTime();
      return dateB - dateA; // Newest first
    });
  }, [emergencyAdmissions]);
  
  // Check if there's a stored admission ID to auto-open edit dialog
  useEffect(() => {
    const editAdmissionId = sessionStorage.getItem('editEmergencyAdmissionId');
    if (editAdmissionId && emergencyAdmissions.length > 0) {
      const admission = emergencyAdmissions.find(a => a.emergencyAdmissionId.toString() === editAdmissionId);
      if (admission) {
        setSelectedAdmission(admission);
        setFormData({
          doctorId: admission.doctorId.toString(),
          patientId: admission.patientId,
          emergencyBedSlotId: admission.emergencyBedSlotId?.toString() || '',
          emergencyAdmissionDate: admission.emergencyAdmissionDate,
          emergencyStatus: admission.emergencyStatus,
          diagnosis: admission.diagnosis || '',
          treatmentDetails: admission.treatmentDetails || '',
          patientCondition: admission.patientCondition,
          transferToIPDOTICU: admission.transferToIPD || admission.transferToOT || admission.transferToICU || false,
          transferTo: admission.transferToIPD ? 'IPD Room Admission' : admission.transferToOT ? 'OT' : admission.transferToICU ? 'ICU' : undefined,
          transferDetails: admission.transferDetails || '',
          status: admission.status,
        });
        setIsEditDialogOpen(true);
        sessionStorage.removeItem('editEmergencyAdmissionId');
      }
    }
  }, [emergencyAdmissions]);
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedAdmission, setSelectedAdmission] = useState<EmergencyAdmission | null>(null);
  const [patientSearchTerm, setPatientSearchTerm] = useState('');
  const [doctorSearchTerm, setDoctorSearchTerm] = useState('');
  
  // Vitals management state
  const [vitals, setVitals] = useState<EmergencyAdmissionVitals[]>([]);
  const [vitalsLoading, setVitalsLoading] = useState(false);
  const [isVitalsDialogOpen, setIsVitalsDialogOpen] = useState(false);
  const [isAddVitalsDialogOpen, setIsAddVitalsDialogOpen] = useState(false);
  const [isEditVitalsDialogOpen, setIsEditVitalsDialogOpen] = useState(false);
  const [isViewVitalsDialogOpen, setIsViewVitalsDialogOpen] = useState(false);
  const [selectedVitals, setSelectedVitals] = useState<EmergencyAdmissionVitals | null>(null);
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
    status: 'Active',
  });
  
  const [formData, setFormData] = useState({
    doctorId: '',
    patientId: '',
    emergencyBedSlotId: '',
    emergencyAdmissionDate: new Date().toISOString().split('T')[0],
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

  const handleCreate = async (data: CreateEmergencyAdmissionDto) => {
    try {
      await createEmergencyAdmission(data);
      return true;
    } catch (err) {
      console.error('Failed to create emergency admission:', err);
      throw err;
    }
  };

  const handleUpdate = async (data: UpdateEmergencyAdmissionDto) => {
    try {
      await updateEmergencyAdmission(data);
      return true;
    } catch (err) {
      console.error('Failed to update emergency admission:', err);
      throw err;
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this emergency admission? This action cannot be undone.')) {
      try {
        await deleteEmergencyAdmission(id);
      } catch (err) {
        console.error('Failed to delete emergency admission:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to delete emergency admission';
        alert(errorMessage);
      }
    }
  };

  const handleAddSubmit = async () => {
    if (!formData.patientId || !formData.doctorId || !formData.emergencyAdmissionDate || !formData.emergencyBedSlotId) {
      alert('Please fill in all required fields (Patient, Doctor, Admission Date, Emergency Bed Slot).');
      return;
    }
    
    if (formData.transferToIPDOTICU && !formData.transferTo) {
      alert('Please select a transfer destination when "Transfer To IPD/OT/ICU" is checked.');
      return;
    }
    
    // Determine TransferToIPD, TransferToOT, TransferToICU from transferTo
    let transferToIPD: 'Yes' | 'No' = 'No';
    let transferToOT: 'Yes' | 'No' = 'No';
    let transferToICU: 'Yes' | 'No' = 'No';
    
    if (formData.transferToIPDOTICU && formData.transferTo) {
      if (formData.transferTo === 'IPD Room Admission') {
        transferToIPD = 'Yes';
      } else if (formData.transferTo === 'OT') {
        transferToOT = 'Yes';
      } else if (formData.transferTo === 'ICU') {
        transferToICU = 'Yes';
      }
    }
    
    try {
      await handleCreate({
        doctorId: Number(formData.doctorId),
        patientId: formData.patientId,
        emergencyBedSlotId: Number(formData.emergencyBedSlotId), // Required
        emergencyAdmissionDate: formData.emergencyAdmissionDate,
        emergencyStatus: formData.emergencyStatus,
        diagnosis: formData.diagnosis || null,
        treatmentDetails: formData.treatmentDetails || null,
        patientCondition: formData.patientCondition,
        transferToIPD: transferToIPD,
        transferToOT: transferToOT,
        transferToICU: transferToICU,
        transferTo: formData.transferToIPDOTICU ? formData.transferTo : null,
        transferDetails: formData.transferToIPDOTICU ? formData.transferDetails || null : null,
        status: formData.status,
      });
      setIsAddDialogOpen(false);
      setFormData({
        doctorId: '',
        patientId: '',
        emergencyBedSlotId: '',
        emergencyAdmissionDate: new Date().toISOString().split('T')[0],
        emergencyStatus: 'Admitted',
        diagnosis: '',
        treatmentDetails: '',
        patientCondition: 'Stable',
        transferToIPDOTICU: false,
        transferTo: undefined,
        transferDetails: '',
        status: 'Active',
      });
      setPatientSearchTerm('');
      setDoctorSearchTerm('');
    } catch (err) {
      // Error handled in parent
    }
  };

  const handleEditSubmit = async () => {
    if (!selectedAdmission) return;
    
    if (!formData.patientId || !formData.doctorId || !formData.emergencyAdmissionDate) {
      alert('Please fill in all required fields (Patient, Doctor, Admission Date).');
      return;
    }
    
    if (formData.transferToIPDOTICU && !formData.transferTo) {
      alert('Please select a transfer destination when "Transfer To IPD/OT/ICU" is checked.');
      return;
    }
    
    try {
      const updateId = selectedAdmission.id || selectedAdmission.emergencyAdmissionId;
      if (!updateId) {
        alert('Cannot update: Emergency Admission ID is missing.');
        return;
      }
      // Determine TransferToIPD, TransferToOT, TransferToICU from transferTo
      let transferToIPD: 'Yes' | 'No' = 'No';
      let transferToOT: 'Yes' | 'No' = 'No';
      let transferToICU: 'Yes' | 'No' = 'No';
      
      if (formData.transferToIPDOTICU && formData.transferTo) {
        if (formData.transferTo === 'IPD Room Admission') {
          transferToIPD = 'Yes';
        } else if (formData.transferTo === 'OT') {
          transferToOT = 'Yes';
        } else if (formData.transferTo === 'ICU') {
          transferToICU = 'Yes';
        }
      }
      
      await handleUpdate({
        id: updateId,
        doctorId: Number(formData.doctorId),
        patientId: formData.patientId,
        emergencyBedSlotId: formData.emergencyBedSlotId ? Number(formData.emergencyBedSlotId) : null,
        emergencyAdmissionDate: formData.emergencyAdmissionDate,
        emergencyStatus: formData.emergencyStatus,
        diagnosis: formData.diagnosis || null,
        treatmentDetails: formData.treatmentDetails || null,
        patientCondition: formData.patientCondition,
        transferToIPD: transferToIPD,
        transferToOT: transferToOT,
        transferToICU: transferToICU,
        transferTo: formData.transferToIPDOTICU ? formData.transferTo : null,
        transferDetails: formData.transferToIPDOTICU ? formData.transferDetails || null : null,
        status: formData.status,
      });
      setIsEditDialogOpen(false);
      setSelectedAdmission(null);
      setFormData({
        doctorId: '',
        patientId: '',
        emergencyBedSlotId: '',
        emergencyAdmissionDate: new Date().toISOString().split('T')[0],
        emergencyStatus: 'Admitted',
        diagnosis: '',
        treatmentDetails: '',
        patientCondition: 'Stable',
        transferToIPDOTICU: false,
        transferTo: undefined,
        transferDetails: '',
        status: 'Active',
      });
      setPatientSearchTerm('');
      setDoctorSearchTerm('');
    } catch (err) {
      // Error handled in parent
    }
  };

  const handleManage = (admission: EmergencyAdmission) => {
    if (admission.emergencyAdmissionId) {
      const hash = `manageemergencyadmission?emergencyAdmissionId=${admission.emergencyAdmissionId}`;
      console.log('Navigating to:', hash);
      // Directly set hash - browser will fire hashchange event automatically
      window.location.hash = hash;
      // Manually trigger hashchange event to ensure it fires
      // This is needed because sometimes the event doesn't fire if React is batching updates
      setTimeout(() => {
        const event = new Event('hashchange');
        window.dispatchEvent(event);
        console.log('Manually triggered hashchange event');
      }, 0);
    }
  };

  const handleEdit = (admission: EmergencyAdmission) => {
    setSelectedAdmission(admission);
    setFormData({
      doctorId: admission.doctorId.toString(),
      patientId: admission.patientId,
      emergencyBedSlotId: admission.emergencyBedSlotId?.toString() || '',
      emergencyAdmissionDate: admission.emergencyAdmissionDate,
      emergencyStatus: admission.emergencyStatus,
      diagnosis: admission.diagnosis || '',
      treatmentDetails: admission.treatmentDetails || '',
      patientCondition: admission.patientCondition,
      transferToIPDOTICU: admission.transferToIPDOTICU,
      transferTo: admission.transferTo,
      transferDetails: admission.transferDetails || '',
      status: admission.status,
    });
    // Set search terms for display
    const patient = patients.find(p => {
      const pid = (p as any).patientId || (p as any).PatientId || '';
      return pid === admission.patientId;
    });
    if (patient) {
      const patientNo = (patient as any).patientNo || (patient as any).PatientNo || '';
      const patientName = (patient as any).patientName || (patient as any).PatientName || '';
      const lastName = (patient as any).lastName || (patient as any).LastName || '';
      const fullName = `${patientName} ${lastName}`.trim();
      setPatientSearchTerm(`${patientNo ? `${patientNo} - ` : ''}${fullName || 'Unknown'}`);
    }
    const doctor = doctors.find(d => d.id === admission.doctorId);
    if (doctor) {
      setDoctorSearchTerm(`${doctor.name} - ${doctor.role}`);
    }
    setIsEditDialogOpen(true);
    
    // Fetch vitals for this admission
    fetchVitals(admission.emergencyAdmissionId);
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

  const handleView = (admission: EmergencyAdmission) => {
    setSelectedAdmission(admission);
    setIsViewDialogOpen(true);
  };

  const getStatusBadge = (status: EmergencyAdmission['emergencyStatus']) => {
    switch (status) {
      case 'Admitted':
        return <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-300 text-sm">Admitted</Badge>;
      case 'IPD':
        return <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300 text-sm">IPD</Badge>;
      case 'OT':
        return <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-300 text-sm">OT</Badge>;
      case 'ICU':
        return <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-300 text-sm">ICU</Badge>;
      case 'Discharged':
        return <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-300 text-sm">Discharged</Badge>;
      default:
        return <Badge variant="outline" className="text-sm">{status}</Badge>;
    }
  };

  const getConditionBadge = (condition: EmergencyAdmission['patientCondition']) => {
    switch (condition) {
      case 'Critical':
        return <Badge variant="outline" className="bg-red-100 text-red-700 border-red-300 text-sm">Critical</Badge>;
      case 'Stable':
        return <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300 text-sm">Stable</Badge>;
      default:
        return <Badge variant="outline" className="text-sm">{condition}</Badge>;
    }
  };

  // Helper function to get patient name
  const getPatientName = (admission: EmergencyAdmission): string => {
    if (admission.patientName) {
      return `${admission.patientName}${admission.patientNo ? ` (${admission.patientNo})` : ''}`;
    }
    const patient = patients.find(p => {
      const pid = (p as any).patientId || (p as any).PatientId || '';
      return pid === admission.patientId;
    });
    if (patient) {
      const patientName = (patient as any).patientName || (patient as any).PatientName || '';
      const lastName = (patient as any).lastName || (patient as any).LastName || '';
      const fullName = `${patientName} ${lastName}`.trim();
      const patientNo = (patient as any).patientNo || (patient as any).PatientNo || '';
      return `${fullName || 'Unknown'}${patientNo ? ` (${patientNo})` : ''}`;
    }
    return 'Unknown';
  };

  // Helper function to get doctor name
  const getDoctorName = (admission: EmergencyAdmission): string => {
    if (admission.doctorName) {
      return admission.doctorName;
    }
    const doctor = doctors.find(d => d.id === admission.doctorId);
    if (doctor) {
      return doctor.name;
    }
    return 'Unknown';
  };

  // Helper function to format date/time in dd-mm-yy hh:mm format
  const formatDateTime = (dateTimeString: string): string => {
    if (!dateTimeString) return '-';
    try {
      const date = new Date(dateTimeString);
      if (isNaN(date.getTime())) return dateTimeString;
      
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = String(date.getFullYear()).slice(-2);
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      
      return `${day}-${month}-${year} ${hours}:${minutes}`;
    } catch (error) {
      return dateTimeString;
    }
  };

  // Helper function to get bed slot details
  const getBedSlotDetails = (admission: EmergencyAdmission): string => {
    if (!admission.emergencyBedSlotId) return '-';
    
    const slot = emergencyBedSlots.find(s => s.id === admission.emergencyBedSlotId);
    if (!slot) return admission.emergencyBedSlotNo || '-';
    
    const bed = emergencyBeds.find(b => b.id === slot.emergencyBedId);
    const roomNameNo = bed?.emergencyRoomNameNo || '-';
    const bedId = bed?.emergencyBedId || '-';
    
    return `Slot ${slot.eBedSlotNo}(${roomNameNo}, Bed Id ${bedId})`;
  };

  if (loading) {
    return (
      <div className="flex-1 bg-gray-50 flex flex-col overflow-hidden min-h-0 dashboard-scrollable" style={{ maxHeight: '100vh', minHeight: 0 }}>
        <div className="overflow-y-auto overflow-x-hidden flex-1 flex flex-col min-h-0">
          <div className="px-6 pt-6 pb-0 flex-shrink-0">
            <div className="text-center py-12 text-gray-600">Loading emergency admissions...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 bg-gray-50 flex flex-col overflow-hidden min-h-0 dashboard-scrollable" style={{ maxHeight: '100vh', minHeight: 0 }}>
        <div className="overflow-y-auto overflow-x-hidden flex-1 flex flex-col min-h-0">
          <div className="px-6 pt-6 pb-0 flex-shrink-0">
            <div className="text-center py-12 text-red-600">Error: {error}</div>
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
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Siren className="size-6" />
                Emergency Admission Management
              </h1>
              <p className="text-gray-600 mt-1">Manage emergency patient admissions</p>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="size-4" />
                  Add Emergency Admission
                </Button>
              </DialogTrigger>
              <DialogContent className="p-0 gap-0 large-dialog dialog-content-standard max-h-[90vh]">
                <div className="dialog-scrollable-wrapper dialog-content-scrollable">
                  <DialogHeader className="dialog-header-standard">
                    <DialogTitle className="dialog-title-standard">Add New Emergency Admission</DialogTitle>
                    {formData.patientId && (
                      <div className="mt-2 text-sm font-semibold text-gray-700">
                        Patient: {(() => {
                          const selectedPatient = patients.find(p => {
                            const pid = (p as any).patientId || (p as any).PatientId || '';
                            return pid === formData.patientId;
                          });
                          if (selectedPatient) {
                            const patientNo = (selectedPatient as any).patientNo || (selectedPatient as any).PatientNo || '';
                            const patientName = (selectedPatient as any).patientName || (selectedPatient as any).PatientName || '';
                            const lastName = (selectedPatient as any).lastName || (selectedPatient as any).LastName || '';
                            const fullName = `${patientName} ${lastName}`.trim();
                            return `${patientNo ? `${patientNo} - ` : ''}${fullName || 'Unknown'}`;
                          }
                          return 'Unknown';
                        })()}
                      </div>
                    )}
                  </DialogHeader>
                  <div className="dialog-body-content-wrapper">
                    <div className="dialog-form-container space-y-4">
                      <div className="dialog-form-field">
                        <Label htmlFor="add-doctor-search" className="dialog-label-standard">Doctor *</Label>
                        <div className="relative mb-2">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                          <Input
                            id="add-doctor-search"
                            placeholder="Search by Doctor Name or Specialty..."
                            value={doctorSearchTerm}
                            onChange={(e) => setDoctorSearchTerm(e.target.value)}
                            className="dialog-input-standard pl-10"
                          />
                        </div>
                        {doctorSearchTerm && (
                          <div className="border border-gray-200 rounded-md max-h-60 overflow-y-auto">
                            <table className="w-full">
                              <thead className="sticky top-0 bg-gray-50 border-b border-gray-200">
                                <tr>
                                  <th className="text-left py-2 px-3 text-xs text-gray-700 font-bold">Name</th>
                                  <th className="text-left py-2 px-3 text-xs text-gray-700 font-bold">Role</th>
                                </tr>
                              </thead>
                              <tbody>
                                {doctors
                                  .filter(doctor => {
                                    if (!doctorSearchTerm) return false;
                                    const searchLower = doctorSearchTerm.toLowerCase();
                                    return (
                                      doctor.name.toLowerCase().includes(searchLower) ||
                                      doctor.role.toLowerCase().includes(searchLower)
                                    );
                                  })
                                  .map(doctor => {
                                    const isSelected = formData.doctorId === doctor.id.toString();
                                    return (
                                      <tr
                                        key={doctor.id}
                                        onClick={() => {
                                          setFormData({ ...formData, doctorId: doctor.id.toString() });
                                          setDoctorSearchTerm(`${doctor.name} - ${doctor.role}`);
                                        }}
                                        className={`border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${isSelected ? 'bg-gray-100' : ''}`}
                                      >
                                        <td className="py-2 px-3 text-sm text-gray-900">{doctor.name}</td>
                                        <td className="py-2 px-3 text-sm text-gray-600">{doctor.role}</td>
                                      </tr>
                                    );
                                  })}
                              </tbody>
                            </table>
                            {doctors.filter(doctor => {
                              if (!doctorSearchTerm) return false;
                              const searchLower = doctorSearchTerm.toLowerCase();
                              return (
                                doctor.name.toLowerCase().includes(searchLower) ||
                                doctor.role.toLowerCase().includes(searchLower)
                              );
                            }).length === 0 && (
                              <div className="text-center py-8 text-sm text-gray-700">
                                No doctors found. Try a different search term.
                              </div>
                            )}
                          </div>
                        )}
                        {formData.doctorId && (
                          <div className="mt-2 p-2 bg-gray-50 border border-gray-200 rounded text-sm text-gray-700">
                            Selected: {(() => {
                              const selectedDoctor = doctors.find(d => d.id.toString() === formData.doctorId);
                              return selectedDoctor ? `${selectedDoctor.name} - ${selectedDoctor.role}` : 'Unknown';
                            })()}
                          </div>
                        )}
                      </div>

                      <div className="dialog-form-field">
                        <Label htmlFor="add-patient-search" className="dialog-label-standard">Patient *</Label>
                        <div className="relative mb-2">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                          <Input
                            id="add-patient-search"
                            placeholder="Search by Patient ID, Name, or Mobile Number..."
                            value={patientSearchTerm}
                            onChange={(e) => setPatientSearchTerm(e.target.value)}
                            className="dialog-input-standard pl-10"
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
                                    const isSelected = formData.patientId === patientId;
                                    return (
                                      <tr
                                        key={patientId}
                                        onClick={() => {
                                          setFormData({ ...formData, patientId });
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
                        {formData.patientId && (
                          <div className="mt-2 p-2 bg-gray-50 border border-gray-200 rounded text-sm text-gray-700">
                            Selected: {(() => {
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
                              return `Unknown (ID: ${formData.patientId.substring(0, 8)})`;
                            })()}
                          </div>
                        )}
                      </div>

                      <div className="dialog-form-field">
                        <Label htmlFor="add-emergencyBedSlotId" className="dialog-label-standard">Emergency Bed Slot *</Label>
                        <select
                          id="add-emergencyBedSlotId"
                          aria-label="Emergency Bed Slot"
                          className="dialog-select-standard"
                          value={formData.emergencyBedSlotId}
                          onChange={(e) => setFormData({ ...formData, emergencyBedSlotId: e.target.value })}
                        >
                          <option value="">Select Emergency Bed Slot *</option>
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

                      <div className="dialog-form-field">
                        <Label htmlFor="add-emergencyAdmissionDate" className="dialog-label-standard">Emergency Admission Date *</Label>
                        <Input
                          id="add-emergencyAdmissionDate"
                          type="date"
                          value={formData.emergencyAdmissionDate}
                          onChange={(e) => setFormData({ ...formData, emergencyAdmissionDate: e.target.value })}
                          className="dialog-input-standard"
                        />
                      </div>

                      <div className="dialog-form-field">
                        <Label htmlFor="add-emergencyStatus" className="dialog-label-standard">Emergency Status</Label>
                        <select
                          id="add-emergencyStatus"
                          aria-label="Emergency Status"
                          className="dialog-select-standard"
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

                      <div className="dialog-form-field">
                        <Label htmlFor="add-diagnosis" className="dialog-label-standard">Diagnosis</Label>
                        <Textarea
                          id="add-diagnosis"
                          placeholder="Enter diagnosis..."
                          value={formData.diagnosis}
                          onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                          rows={3}
                          className="dialog-textarea-standard"
                        />
                      </div>

                      <div className="dialog-form-field">
                        <Label htmlFor="add-treatmentDetails" className="dialog-label-standard">Treatment Details</Label>
                        <Textarea
                          id="add-treatmentDetails"
                          placeholder="Enter treatment details..."
                          value={formData.treatmentDetails}
                          onChange={(e) => setFormData({ ...formData, treatmentDetails: e.target.value })}
                          rows={3}
                          className="dialog-textarea-standard"
                        />
                      </div>

                      <div className="dialog-form-field">
                        <Label htmlFor="add-patientCondition" className="dialog-label-standard">Patient Condition</Label>
                        <select
                          id="add-patientCondition"
                          aria-label="Patient Condition"
                          className="dialog-select-standard"
                          value={formData.patientCondition}
                          onChange={(e) => setFormData({ ...formData, patientCondition: e.target.value as EmergencyAdmission['patientCondition'] })}
                        >
                          <option value="Stable">Stable</option>
                          <option value="Critical">Critical</option>
                        </select>
                      </div>

                      <div className="dialog-form-field">
                        <div className="dialog-checkbox-container">
                          <input
                            type="checkbox"
                            id="add-transferToIPDOTICU"
                            aria-label="Transfer To IPD/OT/ICU"
                            checked={formData.transferToIPDOTICU}
                            onChange={(e) => setFormData({ ...formData, transferToIPDOTICU: e.target.checked, transferTo: e.target.checked ? formData.transferTo : undefined })}
                            className="rounded"
                          />
                          <Label htmlFor="add-transferToIPDOTICU" className="dialog-checkbox-label-standard cursor-pointer">Transfer To IPD/OT/ICU</Label>
                        </div>
                      </div>

                      {formData.transferToIPDOTICU && (
                        <>
                          <div className="dialog-form-field">
                            <Label htmlFor="add-transferTo" className="dialog-label-standard">Transfer To *</Label>
                            <select
                              id="add-transferTo"
                              aria-label="Transfer To"
                              className="dialog-select-standard"
                              value={formData.transferTo || ''}
                              onChange={(e) => setFormData({ ...formData, transferTo: e.target.value as 'IPD Room Admission' | 'ICU' | 'OT' })}
                            >
                              <option value="">Select Transfer Destination</option>
                              <option value="IPD Room Admission">IPD Room Admission</option>
                              <option value="ICU">ICU</option>
                              <option value="OT">OT</option>
                            </select>
                          </div>
                          <div className="dialog-form-field">
                            <Label htmlFor="add-transferDetails" className="dialog-label-standard">Transfer Details</Label>
                            <Textarea
                              id="add-transferDetails"
                              placeholder="Enter transfer details..."
                              value={formData.transferDetails}
                              onChange={(e) => setFormData({ ...formData, transferDetails: e.target.value })}
                              rows={2}
                              className="dialog-textarea-standard"
                            />
                          </div>
                        </>
                      )}

                    </div>
                  </div>
                  <div className="dialog-footer-standard">
                    <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="dialog-footer-button">Cancel</Button>
                    <Button onClick={handleAddSubmit} className="dialog-footer-button">Create Emergency Admission</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        <div className="px-6 pt-4 pb-4 flex-1">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {/* Total Patients */}
            <Card className="bg-white border border-gray-200 shadow-sm rounded-lg">
              <CardContent className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="bg-blue-500 p-4 rounded-lg shadow-sm flex items-center justify-center">
                    <Users className="size-7 text-white" strokeWidth={2} />
                  </div>
                </div>
                <h3 className="text-4xl font-bold text-gray-900 mb-2">{emergencyAdmissions.length}</h3>
                <p className="text-base text-gray-500">Total Patients</p>
              </CardContent>
            </Card>

            {/* Critical Patients */}
            <Card className="bg-white border border-gray-200 shadow-sm rounded-lg">
              <CardContent className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="bg-red-500 p-4 rounded-lg shadow-sm flex items-center justify-center">
                    <AlertCircle className="size-7 text-white" strokeWidth={2} />
                  </div>
                </div>
                <h3 className="text-4xl font-bold text-gray-900 mb-2">
                  {emergencyAdmissions.filter(a => a.patientCondition === 'Critical').length}
                </h3>
                <p className="text-base text-gray-500">Critical</p>
              </CardContent>
            </Card>

            {/* Stable Patients */}
            <Card className="bg-white border border-gray-200 shadow-sm rounded-lg">
              <CardContent className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="bg-yellow-500 p-4 rounded-lg shadow-sm flex items-center justify-center">
                    <Heart className="size-7 text-white" strokeWidth={2} />
                  </div>
                </div>
                <h3 className="text-4xl font-bold text-gray-900 mb-2">
                  {emergencyAdmissions.filter(a => a.patientCondition === 'Stable').length}
                </h3>
                <p className="text-base text-gray-500">Stable</p>
              </CardContent>
            </Card>

            {/* Beds Occupied */}
            <Card className="bg-white border border-gray-200 shadow-sm rounded-lg">
              <CardContent className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="bg-gray-500 p-4 rounded-lg shadow-sm flex items-center justify-center">
                    <BedDouble className="size-7 text-white" strokeWidth={2} />
                  </div>
                </div>
                <h3 className="text-4xl font-bold text-gray-900 mb-2">
                  {emergencyAdmissions.filter(a => a.emergencyBedSlotId !== null && a.emergencyBedSlotId !== undefined).length}
                </h3>
                <p className="text-base text-gray-500">Beds Occupied</p>
              </CardContent>
            </Card>
          </div>

          {/* Emergency Room Bed Status */}
          <Card className="bg-white border border-gray-200 shadow-sm rounded-lg mb-4">
            <CardHeader>
              <CardTitle>Emergency Room Bed Status</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Occupied Beds */}
              {occupiedBeds.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Occupied ({occupiedBeds.length})</h3>
                  <div className="grid grid-cols-5 gap-3">
                    {occupiedBeds.map((slotInfo) => {
                      const isCritical = slotInfo.admission?.patientCondition === 'Critical';
                      const isStable = slotInfo.admission?.patientCondition === 'Stable';
                      return (
                        <button
                          key={slotInfo.slot.id}
                          onClick={() => {
                            if (slotInfo.admission) {
                              window.location.hash = `manageemergencyadmission?emergencyAdmissionId=${slotInfo.admission.emergencyAdmissionId}`;
                            }
                          }}
                          className={`p-3 border-2 rounded-lg text-center transition-all cursor-pointer ${
                            isCritical
                              ? 'border-red-300 bg-red-50 hover:border-red-400 hover:bg-red-100'
                              : isStable
                              ? 'border-yellow-300 bg-yellow-50 hover:border-yellow-400 hover:bg-yellow-100'
                              : 'border-blue-300 bg-blue-50 hover:border-blue-400 hover:bg-blue-100'
                          }`}
                        >
                          <p className="text-xs text-gray-600 mb-1">Room: {slotInfo.roomNameNo}</p>
                          <p className="text-xs text-gray-600 mb-1">Bed: {slotInfo.bedId}</p>
                          <p className="text-sm font-medium text-gray-900 mb-1">Slot: {slotInfo.slotNo}</p>
                          <div className="flex items-center justify-center gap-1">
                            <span className={`size-2 rounded-full ${
                              isCritical
                                ? 'bg-red-600'
                                : isStable
                                ? 'bg-yellow-600'
                                : 'bg-blue-600'
                            }`} />
                          </div>
                          {slotInfo.admission && (
                            <p className="text-xs text-gray-600 mt-1 truncate">
                              {getPatientName(slotInfo.admission) || 'Occupied'}
                            </p>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Available Beds - Collapsible */}
              {availableBeds.length > 0 && (
                <div>
                  <button
                    onClick={() => setShowAvailableBeds(!showAvailableBeds)}
                    className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3 hover:text-gray-900"
                  >
                    {showAvailableBeds ? (
                      <>
                        <ChevronUp className="size-4" />
                        Hide Available ({availableBeds.length})
                      </>
                    ) : (
                      <>
                        <ChevronDown className="size-4" />
                        Show Available ({availableBeds.length})
                      </>
                    )}
                  </button>
                  {showAvailableBeds && (
                    <div className="grid grid-cols-5 gap-3">
                      {availableBeds.map((slotInfo) => (
                        <div
                          key={slotInfo.slot.id}
                          className="p-3 border-2 rounded-lg text-center border-gray-200 bg-gray-50"
                        >
                          <p className="text-xs text-gray-600 mb-1">Room: {slotInfo.roomNameNo}</p>
                          <p className="text-xs text-gray-600 mb-1">Bed: {slotInfo.bedId}</p>
                          <p className="text-sm font-medium text-gray-900 mb-1">Slot: {slotInfo.slotNo}</p>
                          <div className="flex items-center justify-center gap-1">
                            <span className="size-2 rounded-full bg-gray-300" />
                          </div>
                          <p className="text-xs text-gray-500 mt-1">Available</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Legend */}
              <div className="mt-6 flex items-center justify-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <span className="size-3 rounded-full bg-blue-600" />
                  <span className="text-gray-600">Occupied</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="size-3 rounded-full bg-gray-300" />
                  <span className="text-gray-600">Available</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 shadow-sm rounded-lg mb-4">
        <CardContent className="p-0">
          <div className="overflow-x-auto overflow-y-scroll">
            <table className="w-full table-auto">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-2 px-2 text-sm text-gray-700 font-bold whitespace-nowrap">ID</th>
                  <th className="text-left py-2 px-2 text-sm text-gray-700 font-bold whitespace-nowrap">Patient</th>
                  <th className="text-left py-2 px-2 text-sm text-gray-700 font-bold whitespace-nowrap">Bed Slot</th>
                  <th className="text-left py-2 px-2 text-sm text-gray-700 font-bold whitespace-nowrap">Doctor</th>
                  <th className="text-left py-2 px-2 text-sm text-gray-700 font-bold whitespace-nowrap">Admission Date</th>
                  <th className="text-left py-2 px-2 text-sm text-gray-700 font-bold whitespace-nowrap">Status</th>
                  <th className="text-left py-2 px-2 text-sm text-gray-700 font-bold whitespace-nowrap">Condition</th>
                  <th className="text-left py-2 px-2 text-sm text-gray-700 font-bold whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedAdmissions.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-gray-500 text-sm">
                      No emergency admissions found.
                    </td>
                  </tr>
                ) : (
                  sortedAdmissions.map((admission) => (
                    <tr key={admission.emergencyAdmissionId} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-1 px-2 text-sm text-gray-900 font-mono whitespace-nowrap">{admission.emergencyAdmissionId}</td>
                      <td className="py-1 px-2 text-sm text-gray-600 whitespace-nowrap">{getPatientName(admission)}</td>
                      <td className="py-1 px-2 text-sm text-gray-600 whitespace-nowrap">{getBedSlotDetails(admission)}</td>
                      <td className="py-1 px-2 text-sm text-gray-600 whitespace-nowrap">{getDoctorName(admission)}</td>
                      <td className="py-1 px-2 text-sm text-gray-600 whitespace-nowrap">{formatDateTime(admission.emergencyAdmissionDate)}</td>
                      <td className="py-1 px-2 text-sm whitespace-nowrap">{getStatusBadge(admission.emergencyStatus)}</td>
                      <td className="py-1 px-2 text-sm whitespace-nowrap">{getConditionBadge(admission.patientCondition)}</td>
                      <td className="py-1 px-2 text-sm whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleManage(admission);
                            }}
                            className="h-8 px-3 text-sm bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200 hover:text-gray-800"
                            title="Manage Emergency Admission"
                          >
                            Manage
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
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="p-0 gap-0 large-dialog dialog-content-standard max-h-[90vh]">
          <div className="dialog-scrollable-wrapper dialog-content-scrollable">
            <DialogHeader className="dialog-header-standard">
              <DialogTitle className="dialog-title-standard">Edit Emergency Admission</DialogTitle>
            </DialogHeader>
            <div className="dialog-body-content-wrapper">
              <Tabs defaultValue="admission" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="admission">Admission Details</TabsTrigger>
                  <TabsTrigger value="vitals">Vitals</TabsTrigger>
                </TabsList>
                
                <TabsContent value="admission" className="dialog-form-container space-y-4">
                  <div className="dialog-form-field">
                    <Label htmlFor="edit-patientId" className="dialog-label-standard">Patient *</Label>
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
                      className="dialog-input-standard dialog-input-disabled"
                    />
                  </div>

                  <div className="dialog-form-field">
                    <Label htmlFor="edit-doctorId" className="dialog-label-standard">Doctor *</Label>
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
                      className="dialog-input-standard dialog-input-disabled"
                    />
                  </div>

                  <div className="dialog-form-field">
                    <Label htmlFor="edit-emergencyBedSlotId" className="dialog-label-standard">Emergency Bed Slot</Label>
                    <select
                      id="edit-emergencyBedSlotId"
                      aria-label="Emergency Bed Slot"
                      className="dialog-select-standard"
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
                              Room: {roomNameNo} | Bed ID: {bedId} | Slot: {slot.eBedSlotNo} ({slot.eSlotStartTime} - {slot.eSlotEndTime})
                            </option>
                          );
                        })}
                    </select>
                  </div>

                  <div className="dialog-form-field">
                    <Label htmlFor="edit-emergencyAdmissionDate" className="dialog-label-standard">Emergency Admission Date *</Label>
                    <Input
                      id="edit-emergencyAdmissionDate"
                      type="date"
                      value={formData.emergencyAdmissionDate}
                      onChange={(e) => setFormData({ ...formData, emergencyAdmissionDate: e.target.value })}
                      className="dialog-input-standard"
                    />
                  </div>

                  <div className="dialog-form-field">
                    <Label htmlFor="edit-emergencyStatus" className="dialog-label-standard">Emergency Status</Label>
                    <select
                      id="edit-emergencyStatus"
                      aria-label="Emergency Status"
                      className="dialog-select-standard"
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

                  <div className="dialog-form-field">
                    <Label htmlFor="edit-diagnosis" className="dialog-label-standard">Diagnosis</Label>
                    <Textarea
                      id="edit-diagnosis"
                      placeholder="Enter diagnosis..."
                      value={formData.diagnosis}
                      onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                      rows={3}
                      className="dialog-textarea-standard"
                    />
                  </div>

                  <div className="dialog-form-field">
                    <Label htmlFor="edit-treatmentDetails" className="dialog-label-standard">Treatment Details</Label>
                    <Textarea
                      id="edit-treatmentDetails"
                      placeholder="Enter treatment details..."
                      value={formData.treatmentDetails}
                      onChange={(e) => setFormData({ ...formData, treatmentDetails: e.target.value })}
                      rows={3}
                      className="dialog-textarea-standard"
                    />
                  </div>

                  <div className="dialog-form-field">
                    <Label htmlFor="edit-patientCondition" className="dialog-label-standard">Patient Condition</Label>
                    <select
                      id="edit-patientCondition"
                      aria-label="Patient Condition"
                      className="dialog-select-standard"
                      value={formData.patientCondition}
                      onChange={(e) => setFormData({ ...formData, patientCondition: e.target.value as EmergencyAdmission['patientCondition'] })}
                    >
                      <option value="Stable">Stable</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </div>

                  <div className="dialog-form-field">
                    <div className="dialog-checkbox-container">
                      <input
                        type="checkbox"
                        id="edit-transferToIPDOTICU"
                        aria-label="Transfer To IPD/OT/ICU"
                        checked={formData.transferToIPDOTICU}
                        onChange={(e) => setFormData({ ...formData, transferToIPDOTICU: e.target.checked, transferTo: e.target.checked ? formData.transferTo : undefined })}
                        className="rounded"
                      />
                      <Label htmlFor="edit-transferToIPDOTICU" className="dialog-checkbox-label-standard cursor-pointer">Transfer To IPD/OT/ICU</Label>
                    </div>
                  </div>

                  {formData.transferToIPDOTICU && (
                    <>
                      <div className="dialog-form-field">
                        <Label htmlFor="edit-transferTo" className="dialog-label-standard">Transfer To *</Label>
                        <select
                          id="edit-transferTo"
                          aria-label="Transfer To"
                          className="dialog-select-standard"
                          value={formData.transferTo || ''}
                          onChange={(e) => setFormData({ ...formData, transferTo: e.target.value as 'IPD Room Admission' | 'ICU' | 'OT' })}
                        >
                          <option value="">Select Transfer Destination</option>
                          <option value="IPD Room Admission">IPD Room Admission</option>
                          <option value="ICU">ICU</option>
                          <option value="OT">OT</option>
                        </select>
                      </div>
                      <div className="dialog-form-field">
                        <Label htmlFor="edit-transferDetails" className="dialog-label-standard">Transfer Details</Label>
                        <Textarea
                          id="edit-transferDetails"
                          placeholder="Enter transfer details..."
                          value={formData.transferDetails}
                          onChange={(e) => setFormData({ ...formData, transferDetails: e.target.value })}
                          rows={2}
                          className="dialog-textarea-standard"
                        />
                      </div>
                    </>
                  )}

                  <div className="dialog-form-field">
                    <div className="flex items-center gap-3">
                      <Label htmlFor="edit-status" className="dialog-label-standard">Status</Label>
                      <div className="flex-shrink-0 relative" style={{ zIndex: 1 }}>
                        <Switch
                          id="edit-status"
                          checked={formData.status === 'Active'}
                          onCheckedChange={(checked) => setFormData({ ...formData, status: checked ? 'Active' : 'Inactive' })}
                          className="data-[state=checked]:bg-blue-600 data-[state=unchecked]:bg-gray-300 [&_[data-slot=switch-thumb]]:!bg-white [&_[data-slot=switch-thumb]]:!border [&_[data-slot=switch-thumb]]:!border-gray-400 [&_[data-slot=switch-thumb]]:!shadow-sm"
                          style={{
                            width: '2.5rem',
                            height: '1.5rem',
                            minWidth: '2.5rem',
                            minHeight: '1.5rem',
                            display: 'inline-flex',
                            position: 'relative',
                            backgroundColor: formData.status === 'Active' ? '#2563eb' : '#d1d5db',
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="vitals" className="space-y-4 py-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Vitals Records</h3>
                    <Button 
                      onClick={() => {
                        if (selectedAdmission) {
                          setVitalsFormData({
                            emergencyAdmissionId: selectedAdmission.emergencyAdmissionId,
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
                        <Card key={vital.emergencyAdmissionVitalsId} className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant={vital.vitalsStatus === 'Critical' ? 'destructive' : 'default'}>
                                  {vital.vitalsStatus}
                                </Badge>
                                <span className="text-sm text-gray-600">
                                  {new Date(vital.recordedDateTime).toLocaleString()}
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
                                  setSelectedVitals(vital);
                                  setIsViewVitalsDialogOpen(true);
                                }}
                                className="h-8 w-8 p-0"
                              >
                                <Eye className="size-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedVitals(vital);
                                  setVitalsFormData({
                                    emergencyAdmissionId: vital.emergencyAdmissionId,
                                    nurseId: vital.nurseId,
                                    recordedDateTime: new Date(vital.recordedDateTime).toISOString().slice(0, 16),
                                    heartRate: vital.heartRate,
                                    bloodPressure: vital.bloodPressure || '',
                                    temperature: vital.temperature,
                                    o2Saturation: vital.o2Saturation,
                                    respiratoryRate: vital.respiratoryRate,
                                    pulseRate: vital.pulseRate,
                                    vitalsStatus: vital.vitalsStatus,
                                    vitalsRemarks: vital.vitalsRemarks || '',
                                    status: vital.status || 'Active',
                                  });
                                  setIsEditVitalsDialogOpen(true);
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
                                      if (selectedAdmission) {
                                        await emergencyAdmissionVitalsApi.delete(selectedAdmission.emergencyAdmissionId, vital.emergencyAdmissionVitalsId);
                                        await fetchVitals(selectedAdmission.emergencyAdmissionId);
                                      }
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
            </div>
            <div className="dialog-footer-standard">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="dialog-footer-button">Cancel</Button>
              <Button onClick={handleEditSubmit} className="dialog-footer-button">Update Emergency Admission</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="p-0 gap-0 large-dialog max-h-[90vh]">
          <DialogHeader className="px-6 pt-4 pb-3 flex-shrink-0">
            <DialogTitle>View Emergency Admission</DialogTitle>
            {selectedAdmission && (
              <div className="mt-2 text-sm font-semibold text-gray-700">
                Patient: {(() => {
                  const patient = patients.find(p => {
                    const pid = (p as any).patientId || (p as any).PatientId || '';
                    return pid === selectedAdmission.patientId;
                  });
                  if (patient) {
                    const patientNo = (patient as any).patientNo || (patient as any).PatientNo || '';
                    const patientName = (patient as any).patientName || (patient as any).PatientName || '';
                    const lastName = (patient as any).lastName || (patient as any).LastName || '';
                    const fullName = `${patientName} ${lastName}`.trim();
                    return `${patientNo ? `${patientNo} - ` : ''}${fullName || 'Unknown'}`;
                  }
                  return selectedAdmission.patientName || 'Unknown';
                })()}
              </div>
            )}
          </DialogHeader>
          {selectedAdmission && (
            <>
              <div className="flex-1 overflow-y-auto px-6 pb-1 patient-list-scrollable min-h-0">
                <div className="space-y-4 py-4">
                  <div>
                    <Label>Emergency Admission ID</Label>
                    <Input value={selectedAdmission.emergencyAdmissionId} disabled className="bg-gray-50 text-gray-700" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Doctor *</Label>
                      <Input
                        value={getDoctorName(selectedAdmission)}
                        disabled
                        className="bg-gray-50 text-gray-700"
                      />
                    </div>
                    <div>
                      <Label>Patient *</Label>
                      <Input
                        value={(() => {
                          const patient = patients.find(p => {
                            const pid = (p as any).patientId || (p as any).PatientId || '';
                            return pid === selectedAdmission.patientId;
                          });
                          if (patient) {
                            const patientId = (patient as any).patientId || (patient as any).PatientId || '';
                            const patientNo = (patient as any).patientNo || (patient as any).PatientNo || '';
                            const patientName = (patient as any).patientName || (patient as any).PatientName || '';
                            const lastName = (patient as any).lastName || (patient as any).LastName || '';
                            const fullName = `${patientName} ${lastName}`.trim();
                            return `${patientNo ? `${patientNo} - ` : ''}${fullName || 'Unknown'} (ID: ${patientId.substring(0, 8)})`;
                          }
                          return `${selectedAdmission.patientName || 'Unknown'} (ID: ${selectedAdmission.patientId ? selectedAdmission.patientId.substring(0, 8) : 'N/A'})`;
                        })()}
                        disabled
                        className="bg-gray-50 text-gray-700"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Emergency Bed Slot</Label>
                      <Input
                        value={selectedAdmission.emergencyBedSlotNo || '-'}
                        disabled
                        className="bg-gray-50 text-gray-700"
                      />
                    </div>
                    <div>
                      <Label>Emergency Admission Date *</Label>
                      <Input
                        type="date"
                        value={selectedAdmission.emergencyAdmissionDate}
                        disabled
                        className="bg-gray-50 text-gray-700"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Emergency Status</Label>
                      <Input
                        value={selectedAdmission.emergencyStatus}
                        disabled
                        className="bg-gray-50 text-gray-700"
                      />
                    </div>
                    <div>
                      <Label>Patient Condition</Label>
                      <Input
                        value={selectedAdmission.patientCondition}
                        disabled
                        className="bg-gray-50 text-gray-700"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Diagnosis</Label>
                    <Textarea
                      value={selectedAdmission.diagnosis || ''}
                      disabled
                      className="bg-gray-50 text-gray-700"
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label>Treatment Details</Label>
                    <Textarea
                      value={selectedAdmission.treatmentDetails || ''}
                      disabled
                      className="bg-gray-50 text-gray-700"
                      rows={3}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      aria-label="Transfer To IPD/OT/ICU"
                      checked={selectedAdmission.transferToIPDOTICU}
                      disabled
                      className="rounded"
                    />
                    <Label>Transfer To IPD/OT/ICU</Label>
                  </div>
                  {selectedAdmission.transferToIPDOTICU && (
                    <>
                      <div>
                        <Label>Transfer To</Label>
                        <Input
                          value={selectedAdmission.transferTo || ''}
                          disabled
                          className="bg-gray-50 text-gray-700"
                        />
                      </div>
                      <div>
                        <Label>Transfer Details</Label>
                        <Textarea
                          value={selectedAdmission.transferDetails || ''}
                          disabled
                          className="bg-gray-50 text-gray-700"
                          rows={2}
                        />
                      </div>
                    </>
                  )}
                  <div>
                    <Label>Status</Label>
                    <Input
                      value={selectedAdmission.status}
                      disabled
                      className="bg-gray-50 text-gray-700"
                    />
                  </div>
                  {selectedAdmission.admissionCreatedAt && (
                    <div>
                      <Label>Created At</Label>
                      <Input
                        value={formatDateTimeIST(selectedAdmission.admissionCreatedAt)}
                        disabled
                        className="bg-gray-50 text-gray-700"
                      />
                    </div>
                  )}
                  {selectedAdmission.createdByName && (
                    <div>
                      <Label>Created By</Label>
                      <Input
                        value={selectedAdmission.createdByName}
                        disabled
                        className="bg-gray-50 text-gray-700"
                      />
                    </div>
                  )}
                </div>
              </div>
              <div className="flex justify-end gap-2 px-6 py-2 border-t bg-gray-50 flex-shrink-0">
                <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>Close</Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Vitals Dialog */}
      <Dialog open={isAddVitalsDialogOpen} onOpenChange={setIsAddVitalsDialogOpen}>
        <DialogContent className="p-0 gap-0 large-dialog max-h-[90vh]">
          <DialogHeader className="px-6 pt-4 pb-3 flex-shrink-0">
            <DialogTitle>Add Vitals Record</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto px-6 pb-1 patient-list-scrollable min-h-0">
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="add-nurseId">Nurse *</Label>
                <select
                  id="add-nurseId"
                  aria-label="Nurse"
                  className="w-full px-3 py-2 border border-gray-200 rounded-md"
                  value={vitalsFormData.nurseId}
                  onChange={(e) => setVitalsFormData({ ...vitalsFormData, nurseId: Number(e.target.value) })}
                >
                  <option value="0">Select Nurse</option>
                  {staff
                    .filter(s => {
                      const role = roles.find(r => r.id === s.roleId);
                      return role?.roleName?.toLowerCase().includes('nurse');
                    })
                    .map(nurse => (
                      <option key={nurse.id} value={nurse.id}>
                        {nurse.name} - {roles.find(r => r.id === nurse.roleId)?.roleName || ''}
                      </option>
                    ))}
                </select>
              </div>
              
              <div>
                <Label htmlFor="add-recordedDateTime">Recorded Date & Time *</Label>
                <Input
                  id="add-recordedDateTime"
                  type="datetime-local"
                  value={vitalsFormData.recordedDateTime}
                  onChange={(e) => setVitalsFormData({ ...vitalsFormData, recordedDateTime: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="add-heartRate">Heart Rate (bpm)</Label>
                  <Input
                    id="add-heartRate"
                    type="number"
                    placeholder="e.g., 72"
                    value={vitalsFormData.heartRate || ''}
                    onChange={(e) => setVitalsFormData({ ...vitalsFormData, heartRate: e.target.value ? Number(e.target.value) : undefined })}
                  />
                </div>
                <div>
                  <Label htmlFor="add-bloodPressure">Blood Pressure</Label>
                  <Input
                    id="add-bloodPressure"
                    placeholder="e.g., 120/80"
                    value={vitalsFormData.bloodPressure}
                    onChange={(e) => setVitalsFormData({ ...vitalsFormData, bloodPressure: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="add-temperature">Temperature (°C)</Label>
                  <Input
                    id="add-temperature"
                    type="number"
                    step="0.1"
                    placeholder="e.g., 36.5"
                    value={vitalsFormData.temperature || ''}
                    onChange={(e) => setVitalsFormData({ ...vitalsFormData, temperature: e.target.value ? Number(e.target.value) : undefined })}
                  />
                </div>
                <div>
                  <Label htmlFor="add-o2Saturation">O2 Saturation (%)</Label>
                  <Input
                    id="add-o2Saturation"
                    type="number"
                    placeholder="e.g., 98"
                    value={vitalsFormData.o2Saturation || ''}
                    onChange={(e) => setVitalsFormData({ ...vitalsFormData, o2Saturation: e.target.value ? Number(e.target.value) : undefined })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="add-respiratoryRate">Respiratory Rate</Label>
                  <Input
                    id="add-respiratoryRate"
                    type="number"
                    placeholder="e.g., 16"
                    value={vitalsFormData.respiratoryRate || ''}
                    onChange={(e) => setVitalsFormData({ ...vitalsFormData, respiratoryRate: e.target.value ? Number(e.target.value) : undefined })}
                  />
                </div>
                <div>
                  <Label htmlFor="add-pulseRate">Pulse Rate (bpm)</Label>
                  <Input
                    id="add-pulseRate"
                    type="number"
                    placeholder="e.g., 72"
                    value={vitalsFormData.pulseRate || ''}
                    onChange={(e) => setVitalsFormData({ ...vitalsFormData, pulseRate: e.target.value ? Number(e.target.value) : undefined })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="add-vitalsStatus">Vitals Status *</Label>
                <select
                  id="add-vitalsStatus"
                  aria-label="Vitals Status"
                  className="w-full px-3 py-2 border border-gray-200 rounded-md"
                  value={vitalsFormData.vitalsStatus}
                  onChange={(e) => setVitalsFormData({ ...vitalsFormData, vitalsStatus: e.target.value as 'Critical' | 'Stable' })}
                >
                  <option value="Stable">Stable</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>

              <div>
                <Label htmlFor="add-vitalsRemarks">Remarks</Label>
                <Textarea
                  id="add-vitalsRemarks"
                  placeholder="Enter any remarks or notes..."
                  value={vitalsFormData.vitalsRemarks}
                  onChange={(e) => setVitalsFormData({ ...vitalsFormData, vitalsRemarks: e.target.value })}
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="add-vitalsStatus-field">Status</Label>
                <select
                  id="add-vitalsStatus-field"
                  aria-label="Status"
                  className="w-full px-3 py-2 border border-gray-200 rounded-md"
                  value={vitalsFormData.status || 'Active'}
                  onChange={(e) => setVitalsFormData({ ...vitalsFormData, status: e.target.value })}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 px-6 py-2 border-t bg-gray-50 flex-shrink-0">
            <Button variant="outline" onClick={() => setIsAddVitalsDialogOpen(false)}>Cancel</Button>
            <Button onClick={async () => {
              if (!vitalsFormData.nurseId || !vitalsFormData.recordedDateTime) {
                alert('Please fill in all required fields (Nurse, Recorded Date & Time).');
                return;
              }
              try {
                if (selectedAdmission) {
                  await emergencyAdmissionVitalsApi.create(selectedAdmission.emergencyAdmissionId, vitalsFormData);
                  await fetchVitals(selectedAdmission.emergencyAdmissionId);
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

      {/* Edit Vitals Dialog */}
      <Dialog open={isEditVitalsDialogOpen} onOpenChange={setIsEditVitalsDialogOpen}>
        <DialogContent className="p-0 gap-0 large-dialog max-h-[90vh]">
          <DialogHeader className="px-6 pt-4 pb-3 flex-shrink-0">
            <DialogTitle>Edit Vitals Record</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto px-6 pb-1 patient-list-scrollable min-h-0">
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="edit-vitals-nurseId">Nurse *</Label>
                <select
                  id="edit-vitals-nurseId"
                  aria-label="Nurse"
                  className="w-full px-3 py-2 border border-gray-200 rounded-md"
                  value={vitalsFormData.nurseId}
                  onChange={(e) => setVitalsFormData({ ...vitalsFormData, nurseId: Number(e.target.value) })}
                >
                  <option value="0">Select Nurse</option>
                  {staff
                    .filter(s => {
                      const role = roles.find(r => r.id === s.roleId);
                      return role?.roleName?.toLowerCase().includes('nurse');
                    })
                    .map(nurse => (
                      <option key={nurse.id} value={nurse.id}>
                        {nurse.name} - {roles.find(r => r.id === nurse.roleId)?.roleName || ''}
                      </option>
                    ))}
                </select>
              </div>
              
              <div>
                <Label htmlFor="edit-vitals-recordedDateTime">Recorded Date & Time *</Label>
                <Input
                  id="edit-vitals-recordedDateTime"
                  type="datetime-local"
                  value={vitalsFormData.recordedDateTime}
                  onChange={(e) => setVitalsFormData({ ...vitalsFormData, recordedDateTime: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-vitals-heartRate">Heart Rate (bpm)</Label>
                  <Input
                    id="edit-vitals-heartRate"
                    type="number"
                    placeholder="e.g., 72"
                    value={vitalsFormData.heartRate || ''}
                    onChange={(e) => setVitalsFormData({ ...vitalsFormData, heartRate: e.target.value ? Number(e.target.value) : undefined })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-vitals-bloodPressure">Blood Pressure</Label>
                  <Input
                    id="edit-vitals-bloodPressure"
                    placeholder="e.g., 120/80"
                    value={vitalsFormData.bloodPressure}
                    onChange={(e) => setVitalsFormData({ ...vitalsFormData, bloodPressure: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-vitals-temperature">Temperature (°C)</Label>
                  <Input
                    id="edit-vitals-temperature"
                    type="number"
                    step="0.1"
                    placeholder="e.g., 36.5"
                    value={vitalsFormData.temperature || ''}
                    onChange={(e) => setVitalsFormData({ ...vitalsFormData, temperature: e.target.value ? Number(e.target.value) : undefined })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-vitals-o2Saturation">O2 Saturation (%)</Label>
                  <Input
                    id="edit-vitals-o2Saturation"
                    type="number"
                    placeholder="e.g., 98"
                    value={vitalsFormData.o2Saturation || ''}
                    onChange={(e) => setVitalsFormData({ ...vitalsFormData, o2Saturation: e.target.value ? Number(e.target.value) : undefined })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-vitals-respiratoryRate">Respiratory Rate</Label>
                  <Input
                    id="edit-vitals-respiratoryRate"
                    type="number"
                    placeholder="e.g., 16"
                    value={vitalsFormData.respiratoryRate || ''}
                    onChange={(e) => setVitalsFormData({ ...vitalsFormData, respiratoryRate: e.target.value ? Number(e.target.value) : undefined })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-vitals-pulseRate">Pulse Rate (bpm)</Label>
                  <Input
                    id="edit-vitals-pulseRate"
                    type="number"
                    placeholder="e.g., 72"
                    value={vitalsFormData.pulseRate || ''}
                    onChange={(e) => setVitalsFormData({ ...vitalsFormData, pulseRate: e.target.value ? Number(e.target.value) : undefined })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="edit-vitals-status">Vitals Status *</Label>
                <select
                  id="edit-vitals-status"
                  aria-label="Vitals Status"
                  className="w-full px-3 py-2 border border-gray-200 rounded-md"
                  value={vitalsFormData.vitalsStatus}
                  onChange={(e) => setVitalsFormData({ ...vitalsFormData, vitalsStatus: e.target.value as 'Critical' | 'Stable' })}
                >
                  <option value="Stable">Stable</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>

              <div>
                <Label htmlFor="edit-vitals-remarks">Remarks</Label>
                <Textarea
                  id="edit-vitals-remarks"
                  placeholder="Enter any remarks or notes..."
                  value={vitalsFormData.vitalsRemarks}
                  onChange={(e) => setVitalsFormData({ ...vitalsFormData, vitalsRemarks: e.target.value })}
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="edit-vitals-status-field">Status</Label>
                <select
                  id="edit-vitals-status-field"
                  aria-label="Status"
                  className="w-full px-3 py-2 border border-gray-200 rounded-md"
                  value={vitalsFormData.status || 'Active'}
                  onChange={(e) => setVitalsFormData({ ...vitalsFormData, status: e.target.value })}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 px-6 py-2 border-t bg-gray-50 flex-shrink-0">
            <Button variant="outline" onClick={() => setIsEditVitalsDialogOpen(false)}>Cancel</Button>
            <Button onClick={async () => {
              if (!vitalsFormData.nurseId || !vitalsFormData.recordedDateTime) {
                alert('Please fill in all required fields (Nurse, Recorded Date & Time).');
                return;
              }
              try {
                if (selectedAdmission && selectedVitals) {
                  const updateData: UpdateEmergencyAdmissionVitalsDto = {
                    nurseId: vitalsFormData.nurseId,
                    recordedDateTime: vitalsFormData.recordedDateTime,
                    heartRate: vitalsFormData.heartRate,
                    bloodPressure: vitalsFormData.bloodPressure || undefined,
                    temperature: vitalsFormData.temperature,
                    o2Saturation: vitalsFormData.o2Saturation,
                    respiratoryRate: vitalsFormData.respiratoryRate,
                    pulseRate: vitalsFormData.pulseRate,
                    vitalsStatus: vitalsFormData.vitalsStatus,
                    vitalsRemarks: vitalsFormData.vitalsRemarks || undefined,
                    status: vitalsFormData.status,
                  };
                  await emergencyAdmissionVitalsApi.update(selectedAdmission.emergencyAdmissionId, selectedVitals.emergencyAdmissionVitalsId, updateData);
                  await fetchVitals(selectedAdmission.emergencyAdmissionId);
                  setIsEditVitalsDialogOpen(false);
                  setSelectedVitals(null);
                }
              } catch (err) {
                console.error('Error updating vitals:', err);
                alert('Failed to update vitals record. Please try again.');
              }
            }}>Update Vitals Record</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Vitals Dialog */}
      <Dialog open={isViewVitalsDialogOpen} onOpenChange={setIsViewVitalsDialogOpen}>
        <DialogContent className="p-0 gap-0 large-dialog max-h-[90vh]">
          <DialogHeader className="px-6 pt-4 pb-3 flex-shrink-0">
            <DialogTitle>View Vitals Record</DialogTitle>
          </DialogHeader>
          {selectedVitals && (
            <div className="flex-1 overflow-y-auto px-6 pb-1 patient-list-scrollable min-h-0">
              <div className="space-y-4 py-4">
                <div>
                  <Label>Vitals ID</Label>
                  <Input value={selectedVitals.emergencyAdmissionVitalsId} disabled className="bg-gray-50 text-gray-700" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Nurse</Label>
                    <Input
                      value={selectedVitals.nurseName || `ID: ${selectedVitals.nurseId}`}
                      disabled
                      className="bg-gray-50 text-gray-700"
                    />
                  </div>
                  <div>
                    <Label>Recorded Date & Time</Label>
                    <Input
                      value={formatDateTimeIST(selectedVitals.recordedDateTime)}
                      disabled
                      className="bg-gray-50 text-gray-700"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {selectedVitals.heartRate !== undefined && (
                    <div>
                      <Label>Heart Rate (bpm)</Label>
                      <Input value={selectedVitals.heartRate} disabled className="bg-gray-50 text-gray-700" />
                    </div>
                  )}
                  {selectedVitals.bloodPressure && (
                    <div>
                      <Label>Blood Pressure</Label>
                      <Input value={selectedVitals.bloodPressure} disabled className="bg-gray-50 text-gray-700" />
                    </div>
                  )}
                  {selectedVitals.temperature !== undefined && (
                    <div>
                      <Label>Temperature (°C)</Label>
                      <Input value={selectedVitals.temperature} disabled className="bg-gray-50 text-gray-700" />
                    </div>
                  )}
                  {selectedVitals.o2Saturation !== undefined && (
                    <div>
                      <Label>O2 Saturation (%)</Label>
                      <Input value={selectedVitals.o2Saturation} disabled className="bg-gray-50 text-gray-700" />
                    </div>
                  )}
                  {selectedVitals.respiratoryRate !== undefined && (
                    <div>
                      <Label>Respiratory Rate</Label>
                      <Input value={selectedVitals.respiratoryRate} disabled className="bg-gray-50 text-gray-700" />
                    </div>
                  )}
                  {selectedVitals.pulseRate !== undefined && (
                    <div>
                      <Label>Pulse Rate (bpm)</Label>
                      <Input value={selectedVitals.pulseRate} disabled className="bg-gray-50 text-gray-700" />
                    </div>
                  )}
                </div>

                <div>
                  <Label>Vitals Status</Label>
                  <Input value={selectedVitals.vitalsStatus} disabled className="bg-gray-50 text-gray-700" />
                </div>

                {selectedVitals.vitalsRemarks && (
                  <div>
                    <Label>Remarks</Label>
                    <Textarea
                      value={selectedVitals.vitalsRemarks}
                      disabled
                      className="bg-gray-50 text-gray-700"
                      rows={3}
                    />
                  </div>
                )}

                {selectedVitals.vitalsCreatedAt && (
                  <div>
                    <Label>Created At</Label>
                    <Input
                      value={formatDateTimeIST(selectedVitals.vitalsCreatedAt)}
                      disabled
                      className="bg-gray-50 text-gray-700"
                    />
                  </div>
                )}

                {selectedVitals.createdByName && (
                  <div>
                    <Label>Created By</Label>
                    <Input value={selectedVitals.createdByName} disabled className="bg-gray-50 text-gray-700" />
                  </div>
                )}
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2 px-6 py-2 border-t bg-gray-50 flex-shrink-0">
            <Button variant="outline" onClick={() => setIsViewVitalsDialogOpen(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
