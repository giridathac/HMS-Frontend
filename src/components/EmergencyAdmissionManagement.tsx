import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Badge } from './ui/badge';
import { Siren, Plus, Edit, Trash2, Eye, Search } from 'lucide-react';
import { useEmergencyAdmissions } from '../hooks/useEmergencyAdmissions';
import { useEmergencyBedSlots } from '../hooks/useEmergencyBedSlots';
import { useEmergencyBeds } from '../hooks/useEmergencyBeds';
import { useStaff } from '../hooks/useStaff';
import { useRoles } from '../hooks/useRoles';
import { patientsApi } from '../api/patients';
import { EmergencyAdmission, Patient } from '../types';
import { CreateEmergencyAdmissionDto, UpdateEmergencyAdmissionDto } from '../api/emergencyAdmissions';

export function EmergencyAdmissionManagement() {
  const { emergencyAdmissions, loading, error, createEmergencyAdmission, updateEmergencyAdmission, deleteEmergencyAdmission, fetchEmergencyAdmissions } = useEmergencyAdmissions();
  const { staff } = useStaff();
  const { roles } = useRoles();
  const { emergencyBedSlots } = useEmergencyBedSlots();
  const { emergencyBeds } = useEmergencyBeds();
  const [patients, setPatients] = useState<Patient[]>([]);
  
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
  };

  const handleView = (admission: EmergencyAdmission) => {
    setSelectedAdmission(admission);
    setIsViewDialogOpen(true);
  };

  const getStatusBadge = (status: EmergencyAdmission['emergencyStatus']) => {
    switch (status) {
      case 'Admitted':
        return <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300 text-sm">Admitted</Badge>;
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
      return `${doctor.name} - ${doctor.role}`;
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
    
    return `Room: ${roomNameNo} | Bed ID: ${bedId} | Slot: ${slot.eBedSlotNo} (${slot.eSlotStartTime} - ${slot.eSlotEndTime})`;
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center py-12 text-blue-600">Loading emergency admissions...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="text-center py-12 text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
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
          <DialogContent className="p-0 gap-0 large-dialog max-h-[90vh]">
            <DialogHeader className="px-6 pt-4 pb-3 flex-shrink-0">
              <DialogTitle>Add New Emergency Admission</DialogTitle>
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
            <div className="flex-1 overflow-y-auto px-6 pb-1 patient-list-scrollable min-h-0">
              <div className="space-y-4 py-4">
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
                                  className={`border-b border-gray-100 cursor-pointer hover:bg-blue-50 ${isSelected ? 'bg-blue-100' : ''}`}
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
                    <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-sm text-gray-700">
                      Selected: {(() => {
                        const selectedDoctor = doctors.find(d => d.id.toString() === formData.doctorId);
                        return selectedDoctor ? `${selectedDoctor.name} - ${selectedDoctor.role}` : 'Unknown';
                      })()}
                    </div>
                  )}
                </div>

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
                              const isSelected = formData.patientId === patientId;
                              return (
                                <tr
                                  key={patientId}
                                  onClick={() => {
                                    setFormData({ ...formData, patientId });
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
                  {formData.patientId && (
                    <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-sm text-gray-700">
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

                <div>
                  <Label htmlFor="add-emergencyBedSlotId">Emergency Bed Slot *</Label>
                  <select
                    id="add-emergencyBedSlotId"
                    aria-label="Emergency Bed Slot"
                    className="w-full px-3 py-2 border border-gray-200 rounded-md"
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
                            Room: {roomNameNo} | Bed ID: {bedId} | Slot: {slot.eBedSlotNo} ({slot.eSlotStartTime} - {slot.eSlotEndTime})
                          </option>
                        );
                      })}
                  </select>
                </div>

                <div>
                  <Label htmlFor="add-emergencyAdmissionDate">Emergency Admission Date *</Label>
                  <Input
                    id="add-emergencyAdmissionDate"
                    type="date"
                    value={formData.emergencyAdmissionDate}
                    onChange={(e) => setFormData({ ...formData, emergencyAdmissionDate: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="add-emergencyStatus">Emergency Status</Label>
                  <select
                    id="add-emergencyStatus"
                    aria-label="Emergency Status"
                    className="w-full px-3 py-2 border border-gray-200 rounded-md"
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
                  <Label htmlFor="add-diagnosis">Diagnosis</Label>
                  <Textarea
                    id="add-diagnosis"
                    placeholder="Enter diagnosis..."
                    value={formData.diagnosis}
                    onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="add-treatmentDetails">Treatment Details</Label>
                  <Textarea
                    id="add-treatmentDetails"
                    placeholder="Enter treatment details..."
                    value={formData.treatmentDetails}
                    onChange={(e) => setFormData({ ...formData, treatmentDetails: e.target.value })}
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="add-patientCondition">Patient Condition</Label>
                  <select
                    id="add-patientCondition"
                    aria-label="Patient Condition"
                    className="w-full px-3 py-2 border border-gray-200 rounded-md"
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
                    id="add-transferToIPDOTICU"
                    aria-label="Transfer To IPD/OT/ICU"
                    checked={formData.transferToIPDOTICU}
                    onChange={(e) => setFormData({ ...formData, transferToIPDOTICU: e.target.checked, transferTo: e.target.checked ? formData.transferTo : undefined })}
                    className="rounded"
                  />
                  <Label htmlFor="add-transferToIPDOTICU" className="cursor-pointer">Transfer To IPD/OT/ICU</Label>
                </div>

                {formData.transferToIPDOTICU && (
                  <>
                    <div>
                      <Label htmlFor="add-transferTo">Transfer To *</Label>
                      <select
                        id="add-transferTo"
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
                    <div>
                      <Label htmlFor="add-transferDetails">Transfer Details</Label>
                      <Textarea
                        id="add-transferDetails"
                        placeholder="Enter transfer details..."
                        value={formData.transferDetails}
                        onChange={(e) => setFormData({ ...formData, transferDetails: e.target.value })}
                        rows={2}
                      />
                    </div>
                  </>
                )}

                <div>
                  <Label htmlFor="add-status">Status</Label>
                  <select
                    id="add-status"
                    aria-label="Status"
                    className="w-full px-3 py-2 border border-gray-200 rounded-md"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as EmergencyAdmission['status'] })}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 px-6 py-2 border-t bg-gray-50 flex-shrink-0">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleAddSubmit}>Create Emergency Admission</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto overflow-y-scroll">
            <table className="w-full table-auto">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-2 px-2 text-sm text-gray-700 font-bold whitespace-nowrap">ID</th>
                  <th className="text-left py-2 px-2 text-sm text-gray-700 font-bold whitespace-nowrap">Patient</th>
                  <th className="text-left py-2 px-2 text-sm text-gray-700 font-bold break-words min-w-[200px]">Bed Slot</th>
                  <th className="text-left py-2 px-2 text-sm text-gray-700 font-bold whitespace-nowrap">Doctor</th>
                  <th className="text-left py-2 px-2 text-sm text-gray-700 font-bold whitespace-nowrap">Admission Date</th>
                  <th className="text-left py-2 px-2 text-sm text-gray-700 font-bold whitespace-nowrap">Status</th>
                  <th className="text-left py-2 px-2 text-sm text-gray-700 font-bold whitespace-nowrap">Condition</th>
                  <th className="text-left py-2 px-2 text-sm text-gray-700 font-bold whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody>
                {emergencyAdmissions.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-gray-500 text-sm">
                      No emergency admissions found.
                    </td>
                  </tr>
                ) : (
                  emergencyAdmissions.map((admission) => (
                    <tr key={admission.emergencyAdmissionId} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-1 px-2 text-sm text-gray-900 font-mono break-words">{admission.emergencyAdmissionId}</td>
                      <td className="py-1 px-2 text-sm text-gray-600 break-words">{getPatientName(admission)}</td>
                      <td className="py-1 px-2 text-sm text-gray-600 break-words min-w-[200px]">{getBedSlotDetails(admission)}</td>
                      <td className="py-1 px-2 text-sm text-gray-600 break-words">{getDoctorName(admission)}</td>
                      <td className="py-1 px-2 text-sm text-gray-600 break-words whitespace-nowrap">{formatDateTime(admission.emergencyAdmissionDate)}</td>
                      <td className="py-1 px-2 text-sm">{getStatusBadge(admission.emergencyStatus)}</td>
                      <td className="py-1 px-2 text-sm">{getConditionBadge(admission.patientCondition)}</td>
                      <td className="py-1 px-2 text-sm">
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleView(admission)}
                            className="h-7 w-7 p-0"
                          >
                            <Eye className="size-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(admission)}
                            className="h-7 w-7 p-0"
                          >
                            <Edit className="size-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(admission.emergencyAdmissionId)}
                            className="h-7 w-7 p-0 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="size-3" />
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
        <DialogContent className="p-0 gap-0 large-dialog max-h-[90vh]">
          <DialogHeader className="px-6 pt-4 pb-3 flex-shrink-0">
            <DialogTitle>Edit Emergency Admission</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto px-6 pb-1 patient-list-scrollable min-h-0">
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="edit-patientId">Patient *</Label>
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
                <Label htmlFor="edit-doctorId">Doctor *</Label>
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
                <Label htmlFor="edit-emergencyBedSlotId">Emergency Bed Slot</Label>
                <select
                  id="edit-emergencyBedSlotId"
                  aria-label="Emergency Bed Slot"
                  className="w-full px-3 py-2 border border-gray-200 rounded-md"
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

              <div>
                <Label htmlFor="edit-emergencyAdmissionDate">Emergency Admission Date *</Label>
                <Input
                  id="edit-emergencyAdmissionDate"
                  type="date"
                  value={formData.emergencyAdmissionDate}
                  onChange={(e) => setFormData({ ...formData, emergencyAdmissionDate: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="edit-emergencyStatus">Emergency Status</Label>
                <select
                  id="edit-emergencyStatus"
                  aria-label="Emergency Status"
                  className="w-full px-3 py-2 border border-gray-200 rounded-md"
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
                <Label htmlFor="edit-treatmentDetails">Treatment Details</Label>
                <Textarea
                  id="edit-treatmentDetails"
                  placeholder="Enter treatment details..."
                  value={formData.treatmentDetails}
                  onChange={(e) => setFormData({ ...formData, treatmentDetails: e.target.value })}
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="edit-patientCondition">Patient Condition</Label>
                <select
                  id="edit-patientCondition"
                  aria-label="Patient Condition"
                  className="w-full px-3 py-2 border border-gray-200 rounded-md"
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
                </>
              )}

              <div>
                <Label htmlFor="edit-status">Status</Label>
                <select
                  id="edit-status"
                  aria-label="Status"
                  className="w-full px-3 py-2 border border-gray-200 rounded-md"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as EmergencyAdmission['status'] })}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 px-6 py-2 border-t bg-gray-50 flex-shrink-0">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleEditSubmit}>Update Emergency Admission</Button>
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
                        value={new Date(selectedAdmission.admissionCreatedAt).toLocaleString()}
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
    </div>
  );
}
