import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { BedDouble, Plus, Search, User, Calendar, Scissors, X, FileText, FlaskConical, Stethoscope, Heart } from 'lucide-react';
import { useAdmissions } from '../hooks/useAdmissions';
import { Admission, RoomCapacityOverview, DashboardMetrics } from '../api/admissions';
import { admissionsApi } from '../api/admissions';
import { roomBedsApi } from '../api/roomBeds';
import { doctorsApi } from '../api/doctors';

// Fallback room capacity data (used when API data is not available)
const fallbackRoomCapacity: RoomCapacityOverview = {
  'Regular Ward': { total: 50, occupied: 35, available: 15 },
  'Special Shared Room': { total: 20, occupied: 14, available: 6 },
  'Special Room': { total: 15, occupied: 8, available: 7 },
};

export function Admissions() {
  const { admissions, roomCapacity, dashboardMetrics, loading, capacityLoading, metricsLoading, fetchRoomCapacityOverview, fetchDashboardMetrics, updateAdmission, fetchAdmissions } = useAdmissions();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [schedulingOT, setSchedulingOT] = useState<number | null>(null); // Track which admission is being scheduled
  const [isManageDialogOpen, setIsManageDialogOpen] = useState(false);
  const [managedAdmission, setManagedAdmission] = useState<Admission | null>(null);
  
  // State for Add New Admission form
  const [patientSearchTerm, setPatientSearchTerm] = useState('');
  const [roomBedSearchTerm, setRoomBedSearchTerm] = useState('');
  const [doctorSearchTerm, setDoctorSearchTerm] = useState('');
  const [patientOptions, setPatientOptions] = useState<any[]>([]);
  const [roomBedOptions, setRoomBedOptions] = useState<any[]>([]);
  const [doctorOptions, setDoctorOptions] = useState<any[]>([]);
  const [addAdmissionForm, setAddAdmissionForm] = useState({
    patientId: '',
    roomBedId: '',
    roomType: '',
    admittedBy: '',
    admittedByDoctorId: '',
    diagnosis: '',
  });
  const [savingAdmission, setSavingAdmission] = useState(false);
  const [admissionError, setAdmissionError] = useState<string | null>(null);

  const handleManageCase = (admission: Admission) => {
    const roomAdmissionId = admission.roomAdmissionId || admission.admissionId;
    if (roomAdmissionId) {
      window.location.hash = `manageipdadmission?roomAdmissionId=${roomAdmissionId}`;
    }
  };

  // Handler to save new admission
  const handleSaveAdmission = async () => {
    try {
      setSavingAdmission(true);
      setAdmissionError(null);

      // Validate required fields
      if (!addAdmissionForm.patientId) {
        throw new Error('Please select a patient');
      }
      if (!addAdmissionForm.roomBedId) {
        throw new Error('Please select a room/bed');
      }
      if (!addAdmissionForm.admittedByDoctorId) {
        throw new Error('Please select a doctor');
      }

      // Get selected patient details
      const selectedPatient = patientOptions.find((p: any) => {
        const pid = (p as any).patientId || (p as any).PatientId || '';
        return pid === addAdmissionForm.patientId;
      });

      if (!selectedPatient) {
        throw new Error('Selected patient not found');
      }

      // Get selected room/bed details
      const selectedBed = roomBedOptions.find((b: any) => {
        const bid = (b as any).roomBedId || (b as any).RoomBedsId || (b as any).id || '';
        return String(bid) === addAdmissionForm.roomBedId;
      });

      if (!selectedBed) {
        throw new Error('Selected room/bed not found');
      }

      // Extract patient details
      const patientId = (selectedPatient as any).patientId || (selectedPatient as any).PatientId || '';
      const patientName = (selectedPatient as any).patientName || (selectedPatient as any).PatientName || '';
      const lastName = (selectedPatient as any).lastName || (selectedPatient as any).LastName || '';
      const fullName = `${patientName} ${lastName}`.trim() || patientName;
      const age = Number((selectedPatient as any).age || (selectedPatient as any).Age || 0);
      const gender = (selectedPatient as any).gender || (selectedPatient as any).Gender || 'Unknown';

      // Extract room/bed details
      const bedNumber = (selectedBed as any).bedNo || (selectedBed as any).BedNo || '';
      const roomType = (selectedBed as any).roomType || (selectedBed as any).RoomType || addAdmissionForm.roomType || 'Regular Ward';

      // Get doctor name
      const doctorName = addAdmissionForm.admittedBy || '';

      // Prepare admission data
      const admissionData = {
        patientId: patientId,
        patientName: fullName,
        age: age,
        gender: gender,
        admissionDate: new Date().toISOString().split('T')[0], // Today's date
        roomType: roomType as 'Regular Ward' | 'Special Shared Room' | 'Special Room',
        bedNumber: bedNumber,
        admittedBy: doctorName,
        diagnosis: addAdmissionForm.diagnosis || '',
        status: 'Active' as const,
      };

      console.log('Creating admission with data:', admissionData);

      // Call the API to create admission
      await admissionsApi.create(admissionData);

      console.log('Admission created successfully');

      // Refresh admissions list
      await fetchAdmissions();
      
      // Refresh room capacity and metrics
      await fetchRoomCapacityOverview();
      await fetchDashboardMetrics();

      // Close dialog and reset form
      setIsDialogOpen(false);
      setPatientSearchTerm('');
      setRoomBedSearchTerm('');
      setDoctorSearchTerm('');
      setAddAdmissionForm({
        patientId: '',
        roomBedId: '',
        roomType: '',
        admittedBy: '',
        admittedByDoctorId: '',
        diagnosis: '',
      });
      setAdmissionError(null);
    } catch (error: any) {
      console.error('Error saving admission:', error);
      setAdmissionError(error?.message || 'Failed to save admission. Please try again.');
    } finally {
      setSavingAdmission(false);
    }
  };

  // Fetch room capacity overview and dashboard metrics on component mount
  useEffect(() => {
    fetchRoomCapacityOverview();
    fetchDashboardMetrics();
  }, [fetchRoomCapacityOverview, fetchDashboardMetrics]);

  // Load patient, room bed, and doctor options when dialog opens
  useEffect(() => {
    if (isDialogOpen) {
      const loadOptions = async () => {
        try {
          // Load patients
          const patientsList = await admissionsApi.getPatientRegistrations();
          setPatientOptions(patientsList || []);
          
          // Load room beds
          const roomBedsList = await roomBedsApi.getAll();
          setRoomBedOptions(roomBedsList || []);
          
          // Load doctors
          const doctorsList = await doctorsApi.getAll();
          setDoctorOptions(doctorsList || []);
        } catch (error) {
          console.error('Error loading options for new admission:', error);
        }
      };
      loadOptions();
      // Reset form when dialog opens
      setPatientSearchTerm('');
      setRoomBedSearchTerm('');
      setDoctorSearchTerm('');
      setAdmissionError(null);
      setSavingAdmission(false);
      setAddAdmissionForm({
        patientId: '',
        roomBedId: '',
        roomType: '',
        admittedBy: '',
        admittedByDoctorId: '',
        diagnosis: '',
      });
    }
  }, [isDialogOpen]);

  const filteredAdmissions = admissions.filter(admission =>
    admission.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admission.bedNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getAdmissionsByStatus = (status: string) => {
    // Filter by exact status match, using admissionStatus field from API
    return filteredAdmissions.filter(a => {
      const targetStatus = String(status || '').trim().toLowerCase();
      const admissionStatusValue = String(a.admissionStatus || '').trim().toLowerCase();
      
      // For "Surgery Scheduled", check if admissionStatus from API equals "Surgery Scheduled"
      if (targetStatus === 'surgery scheduled') {
        return admissionStatusValue === 'surgery scheduled' || 
               admissionStatusValue === 'surgeryscheduled' ||
               admissionStatusValue === 'surgery_scheduled' ||
               (admissionStatusValue.includes('surgery') && admissionStatusValue.includes('scheduled'));
      }
      
      // For "Moved To ICU", check if admissionStatus from API equals "Moved To ICU"
      if (targetStatus === 'moved to icu') {
        return admissionStatusValue === 'moved to icu' || 
               admissionStatusValue === 'movedtoicu' ||
               admissionStatusValue === 'moved_to_icu' ||
               admissionStatusValue === 'transferred to icu' ||
               admissionStatusValue === 'transferredtoicu' ||
               admissionStatusValue === 'transferred_to_icu' ||
               (admissionStatusValue.includes('moved') && admissionStatusValue.includes('icu')) ||
               (admissionStatusValue.includes('transferred') && admissionStatusValue.includes('icu'));
      }
      
      // For "Active", check if admissionStatus from API equals "Active" or use normalized status
      if (targetStatus === 'active') {
        return admissionStatusValue === 'active' || 
               admissionStatusValue === 'admitted' ||
               admissionStatusValue === 'inpatient' ||
               String(a.status || '').trim().toLowerCase() === 'active';
      }
      
      // For other statuses, use normalized status field as fallback
      const normalizedStatusValue = String(a.status || '').trim().toLowerCase();
      return normalizedStatusValue === targetStatus;
    });
  };

  // Use room capacity from API or fallback to default
  const currentRoomCapacity: RoomCapacityOverview = roomCapacity || fallbackRoomCapacity;
  
  // Use dashboard metrics from API if available, otherwise calculate from room capacity
  const totalAdmissions = dashboardMetrics?.totalAdmissions ?? admissions.length;
  const activePatients = dashboardMetrics?.activePatients ?? admissions.filter(a => a.status === 'Active').length;
  const bedOccupancy = dashboardMetrics?.bedOccupancy ?? (() => {
    const totalOccupied = dashboardMetrics?.totalOccupied ?? Object.values(currentRoomCapacity).reduce((sum, room) => sum + room.occupied, 0);
    const totalCapacity = dashboardMetrics?.totalCapacity ?? Object.values(currentRoomCapacity).reduce((sum, room) => sum + room.total, 0);
    return totalCapacity > 0 ? Math.round((totalOccupied / totalCapacity) * 100) : 0;
  })();
  const totalOccupied = dashboardMetrics?.totalOccupied ?? Object.values(currentRoomCapacity).reduce((sum, room) => sum + room.occupied, 0);
  const totalCapacity = dashboardMetrics?.totalCapacity ?? Object.values(currentRoomCapacity).reduce((sum, room) => sum + room.total, 0);
  const availableBeds = dashboardMetrics?.availableBeds ?? (totalCapacity - totalOccupied);
  const avgStay = dashboardMetrics?.avgStay ?? 5.2;

  const handleScheduleOT = async (admission: Admission) => {
    // Use roomAdmissionId as primary identifier
    if (!admission.roomAdmissionId) {
      console.error('Cannot schedule OT: Room Admission ID is missing');
      return;
    }

    try {
      setSchedulingOT(admission.roomAdmissionId);
      await updateAdmission({
        roomAdmissionId: admission.roomAdmissionId,
        scheduleOT: true, // or 'Yes' - the API will convert it
      });
      // Refresh the admissions list to show updated status
      await fetchAdmissions();
    } catch (error) {
      console.error('Failed to schedule OT:', error);
      alert(error instanceof Error ? error.message : 'Failed to schedule OT. Please try again.');
    } finally {
      setSchedulingOT(null);
    }
  };

  return (
    <div className="flex-1 bg-gray-50 flex flex-col overflow-hidden min-h-0 dashboard-scrollable" style={{ maxHeight: '100vh', minHeight: 0 }}>
      <div className="overflow-y-auto overflow-x-hidden flex-1 flex flex-col min-h-0">
        <div className="px-6 pt-6 pb-0 flex-shrink-0">
          <div className="flex items-center justify-between mb-4 flex-shrink-0">
            <div>
              <h1 className="text-gray-900 mb-2 text-2xl">IPD Admissions Management</h1>
              <p className="text-gray-500 text-base">Manage in-patient admissions and bed allocation</p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="size-4" />
                New Admission
              </Button>
            </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Register New Admission</DialogTitle>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto px-6 pb-1 patient-list-scrollable min-h-0">
              <div className="space-y-4 py-4">
                {/* Patient Selection - Same pattern as Front Desk */}
                <div>
                  <Label htmlFor="patient-search">Patient *</Label>
                  <div className="relative mb-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                    <Input
                      id="patient-search"
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
                          {patientOptions
                            .filter((patient: any) => {
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
                            .map((patient: any) => {
                              const patientId = (patient as any).patientId || (patient as any).PatientId || '';
                              const patientNo = (patient as any).patientNo || (patient as any).PatientNo || '';
                              const patientName = (patient as any).patientName || (patient as any).PatientName || '';
                              const lastName = (patient as any).lastName || (patient as any).LastName || '';
                              const fullName = `${patientName} ${lastName}`.trim();
                              const phoneNo = (patient as any).phoneNo || (patient as any).PhoneNo || (patient as any).phone || '';
                              const isSelected = addAdmissionForm.patientId === patientId;
                              return (
                                <tr
                                  key={patientId}
                                  onClick={() => {
                                    setAddAdmissionForm({ ...addAdmissionForm, patientId });
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
                      {patientOptions.filter((patient: any) => {
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
                  {addAdmissionForm.patientId && (
                    <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-sm text-gray-700">
                      Selected: {(() => {
                        const selectedPatient = patientOptions.find((p: any) => {
                          const pid = (p as any).patientId || (p as any).PatientId || '';
                          return pid === addAdmissionForm.patientId;
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
                </div>

                {/* Room/Bed Selection - Same pattern as Patient selection */}
                <div>
                  <Label htmlFor="room-bed-search">Room/Bed *</Label>
                  <div className="relative mb-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                    <Input
                      id="room-bed-search"
                      placeholder="Search by Room No, Bed No, Room Type, or Category..."
                      value={roomBedSearchTerm}
                      onChange={(e) => setRoomBedSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  {roomBedSearchTerm && (
                    <div className="border border-gray-200 rounded-md max-h-60 overflow-y-auto">
                      <table className="w-full">
                        <thead className="sticky top-0 bg-gray-50 border-b border-gray-200">
                          <tr>
                            <th className="text-left py-2 px-3 text-xs text-gray-700 font-bold">Room No</th>
                            <th className="text-left py-2 px-3 text-xs text-gray-700 font-bold">Bed No</th>
                            <th className="text-left py-2 px-3 text-xs text-gray-700 font-bold">Room Type</th>
                            <th className="text-left py-2 px-3 text-xs text-gray-700 font-bold">Category</th>
                            <th className="text-left py-2 px-3 text-xs text-gray-700 font-bold">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {roomBedOptions
                            .filter((bed: any) => {
                              if (!roomBedSearchTerm) return false;
                              const searchLower = roomBedSearchTerm.toLowerCase();
                              const roomNo = (bed as any).roomNo || (bed as any).RoomNo || '';
                              const bedNo = (bed as any).bedNo || (bed as any).BedNo || '';
                              const roomType = (bed as any).roomType || (bed as any).RoomType || '';
                              const roomCategory = (bed as any).roomCategory || (bed as any).RoomCategory || '';
                              return (
                                roomNo.toLowerCase().includes(searchLower) ||
                                bedNo.toLowerCase().includes(searchLower) ||
                                roomType.toLowerCase().includes(searchLower) ||
                                roomCategory.toLowerCase().includes(searchLower)
                              );
                            })
                            .map((bed: any) => {
                              const roomBedId = (bed as any).roomBedId || (bed as any).RoomBedsId || (bed as any).id || '';
                              const roomNo = (bed as any).roomNo || (bed as any).RoomNo || '';
                              const bedNo = (bed as any).bedNo || (bed as any).BedNo || '';
                              const roomType = (bed as any).roomType || (bed as any).RoomType || '';
                              const roomCategory = (bed as any).roomCategory || (bed as any).RoomCategory || '';
                              const status = (bed as any).status || (bed as any).Status || '';
                              const isSelected = addAdmissionForm.roomBedId === String(roomBedId);
                              return (
                                <tr
                                  key={roomBedId}
                                  onClick={() => {
                                    setAddAdmissionForm({ 
                                      ...addAdmissionForm, 
                                      roomBedId: String(roomBedId),
                                      roomType: roomType
                                    });
                                    setRoomBedSearchTerm(`${roomNo} - ${bedNo} (${roomType})`);
                                  }}
                                  className={`border-b border-gray-100 cursor-pointer hover:bg-blue-50 ${isSelected ? 'bg-blue-100' : ''}`}
                                >
                                  <td className="py-2 px-3 text-sm text-gray-900 font-mono">{roomNo || '-'}</td>
                                  <td className="py-2 px-3 text-sm text-gray-600">{bedNo || '-'}</td>
                                  <td className="py-2 px-3 text-sm text-gray-600">{roomType || '-'}</td>
                                  <td className="py-2 px-3 text-sm text-gray-600">{roomCategory || '-'}</td>
                                  <td className="py-2 px-3 text-sm">
                                    <Badge variant={status === 'Active' ? 'default' : 'outline'}>
                                      {status || 'N/A'}
                                    </Badge>
                                  </td>
                                </tr>
                              );
                            })}
                        </tbody>
                      </table>
                      {roomBedOptions.filter((bed: any) => {
                        if (!roomBedSearchTerm) return false;
                        const searchLower = roomBedSearchTerm.toLowerCase();
                        const roomNo = (bed as any).roomNo || (bed as any).RoomNo || '';
                        const bedNo = (bed as any).bedNo || (bed as any).BedNo || '';
                        const roomType = (bed as any).roomType || (bed as any).RoomType || '';
                        const roomCategory = (bed as any).roomCategory || (bed as any).RoomCategory || '';
                        return (
                          roomNo.toLowerCase().includes(searchLower) ||
                          bedNo.toLowerCase().includes(searchLower) ||
                          roomType.toLowerCase().includes(searchLower) ||
                          roomCategory.toLowerCase().includes(searchLower)
                        );
                      }).length === 0 && (
                        <div className="text-center py-8 text-sm text-gray-700">
                          No room beds found. Try a different search term.
                        </div>
                      )}
                    </div>
                  )}
                  {addAdmissionForm.roomBedId && (
                    <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-sm text-gray-700">
                      Selected: {(() => {
                        const selectedBed = roomBedOptions.find((b: any) => {
                          const bid = (b as any).roomBedId || (b as any).RoomBedsId || (b as any).id || '';
                          return String(bid) === addAdmissionForm.roomBedId;
                        });
                        if (selectedBed) {
                          const roomNo = (selectedBed as any).roomNo || (selectedBed as any).RoomNo || '';
                          const bedNo = (selectedBed as any).bedNo || (selectedBed as any).BedNo || '';
                          const roomType = (selectedBed as any).roomType || (selectedBed as any).RoomType || '';
                          return `${roomNo} - ${bedNo} (${roomType})`;
                        }
                        return 'Unknown';
                      })()}
                    </div>
                  )}
                </div>

                {/* Doctor Selection - Same pattern as Patient selection */}
                <div>
                  <Label htmlFor="doctor-search">Admitted By (Doctor) *</Label>
                  <div className="relative mb-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                    <Input
                      id="doctor-search"
                      placeholder="Search by Doctor Name, ID, or Specialty..."
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
                            <th className="text-left py-2 px-3 text-xs text-gray-700 font-bold">Doctor ID</th>
                            <th className="text-left py-2 px-3 text-xs text-gray-700 font-bold">Name</th>
                            <th className="text-left py-2 px-3 text-xs text-gray-700 font-bold">Specialty</th>
                            <th className="text-left py-2 px-3 text-xs text-gray-700 font-bold">Type</th>
                          </tr>
                        </thead>
                        <tbody>
                          {doctorOptions
                            .filter((doctor: any) => {
                              if (!doctorSearchTerm) return false;
                              const searchLower = doctorSearchTerm.toLowerCase();
                              const doctorId = String((doctor as any).id || (doctor as any).Id || (doctor as any).UserId || '');
                              const doctorName = (doctor as any).name || (doctor as any).Name || (doctor as any).UserName || '';
                              const specialty = (doctor as any).specialty || (doctor as any).Specialty || (doctor as any).DoctorDepartmentName || '';
                              return (
                                doctorId.toLowerCase().includes(searchLower) ||
                                doctorName.toLowerCase().includes(searchLower) ||
                                specialty.toLowerCase().includes(searchLower)
                              );
                            })
                            .map((doctor: any) => {
                              const doctorId = String((doctor as any).id || (doctor as any).Id || (doctor as any).UserId || '');
                              const doctorName = (doctor as any).name || (doctor as any).Name || (doctor as any).UserName || '';
                              const specialty = (doctor as any).specialty || (doctor as any).Specialty || (doctor as any).DoctorDepartmentName || 'General';
                              const doctorType = (doctor as any).type || (doctor as any).Type || (doctor as any).DoctorType || '';
                              const isSelected = addAdmissionForm.admittedByDoctorId === doctorId;
                              return (
                                <tr
                                  key={doctorId}
                                  onClick={() => {
                                    setAddAdmissionForm({ 
                                      ...addAdmissionForm, 
                                      admittedByDoctorId: doctorId,
                                      admittedBy: doctorName
                                    });
                                    setDoctorSearchTerm(`${doctorName} - ${specialty}`);
                                  }}
                                  className={`border-b border-gray-100 cursor-pointer hover:bg-blue-50 ${isSelected ? 'bg-blue-100' : ''}`}
                                >
                                  <td className="py-2 px-3 text-sm text-gray-900 font-mono">{doctorId || '-'}</td>
                                  <td className="py-2 px-3 text-sm text-gray-600">{doctorName || 'Unknown'}</td>
                                  <td className="py-2 px-3 text-sm text-gray-600">{specialty || '-'}</td>
                                  <td className="py-2 px-3 text-sm text-gray-600">
                                    <Badge variant={doctorType === 'inhouse' ? 'default' : 'outline'}>
                                      {doctorType || 'N/A'}
                                    </Badge>
                                  </td>
                                </tr>
                              );
                            })}
                        </tbody>
                      </table>
                      {doctorOptions.filter((doctor: any) => {
                        if (!doctorSearchTerm) return false;
                        const searchLower = doctorSearchTerm.toLowerCase();
                        const doctorId = String((doctor as any).id || (doctor as any).Id || (doctor as any).UserId || '');
                        const doctorName = (doctor as any).name || (doctor as any).Name || (doctor as any).UserName || '';
                        const specialty = (doctor as any).specialty || (doctor as any).Specialty || (doctor as any).DoctorDepartmentName || '';
                        return (
                          doctorId.toLowerCase().includes(searchLower) ||
                          doctorName.toLowerCase().includes(searchLower) ||
                          specialty.toLowerCase().includes(searchLower)
                        );
                      }).length === 0 && (
                        <div className="text-center py-8 text-sm text-gray-700">
                          No doctors found. Try a different search term.
                        </div>
                      )}
                    </div>
                  )}
                  {addAdmissionForm.admittedByDoctorId && (
                    <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-sm text-gray-700">
                      Selected: {(() => {
                        const selectedDoctor = doctorOptions.find((d: any) => {
                          const did = String((d as any).id || (d as any).Id || (d as any).UserId || '');
                          return did === addAdmissionForm.admittedByDoctorId;
                        });
                        if (selectedDoctor) {
                          const doctorName = (selectedDoctor as any).name || (selectedDoctor as any).Name || (selectedDoctor as any).UserName || '';
                          const specialty = (selectedDoctor as any).specialty || (selectedDoctor as any).Specialty || (selectedDoctor as any).DoctorDepartmentName || '';
                          return `${doctorName}${specialty ? ` - ${specialty}` : ''}`;
                        }
                        return 'Unknown';
                      })()}
                    </div>
                  )}
                </div>
                <div>
                  <Label htmlFor="diagnosis">Diagnosis</Label>
                  <Input 
                    id="diagnosis" 
                    placeholder="Enter diagnosis" 
                    value={addAdmissionForm.diagnosis}
                    onChange={(e) => setAddAdmissionForm({ ...addAdmissionForm, diagnosis: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <div className="px-6 pb-4 flex-shrink-0 flex flex-col gap-2">
              {admissionError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                  {admissionError}
                </div>
              )}
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={savingAdmission}>
                  Cancel
                </Button>
                <Button onClick={handleSaveAdmission} disabled={savingAdmission}>
                  {savingAdmission ? 'Saving...' : 'Admit Patient'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
          </div>
        </div>

        <div className="px-6 pt-4 pb-4 flex-1">
          {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-500">Total Admissions</p>
              <BedDouble className="size-5 text-blue-600" />
            </div>
            <h3 className="text-gray-900">{metricsLoading ? '...' : totalAdmissions}</h3>
            <p className="text-xs text-gray-500">Active patients</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-500">Bed Occupancy</p>
              <Badge variant={bedOccupancy > 80 ? 'destructive' : 'default'}>{metricsLoading ? '...' : `${bedOccupancy}%`}</Badge>
            </div>
            <h3 className="text-gray-900">{metricsLoading ? '...' : `${totalOccupied}/${totalCapacity}`}</h3>
            <p className="text-xs text-gray-500">Occupied beds</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-500">Available Beds</p>
              <span className="text-green-600">●</span>
            </div>
            <h3 className="text-gray-900">{metricsLoading ? '...' : availableBeds}</h3>
            <p className="text-xs text-gray-500">Ready for admission</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-500">Avg. Stay</p>
              <Calendar className="size-5 text-purple-600" />
            </div>
            <h3 className="text-gray-900">{metricsLoading ? '...' : `${avgStay.toFixed(1)} days`}</h3>
            <p className="text-xs text-gray-500">Average duration</p>
          </CardContent>
        </Card>
      </div>

      {/* Room Capacity */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Room Capacity Overview</CardTitle>
        </CardHeader>
        <CardContent>
          {capacityLoading ? (
            <div className="text-center py-8 text-gray-500">Loading room capacity...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Object.entries(currentRoomCapacity).map(([type, capacity]) => {
              const occupancy = Math.round((capacity.occupied / capacity.total) * 100);
              return (
                <div key={type} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-gray-900">{type}</h4>
                    <Badge variant={occupancy > 80 ? 'destructive' : 'default'}>{occupancy}%</Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Total Beds:</span>
                      <span className="text-gray-900">{capacity.total}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Occupied:</span>
                      <span className="text-gray-900">{capacity.occupied}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Available:</span>
                      <span className="text-green-600">{capacity.available}</span>
                    </div>
                  </div>
                  <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                    {/* Dynamic width requires inline style - occupancy value is computed at runtime */}
                    {/* eslint-disable-next-line react/forbid-dom-props */}
                    <div
                      className={`h-2 rounded-full transition-all ${occupancy > 80 ? 'bg-red-500' : 'bg-blue-500'}`}
                      style={{ width: `${occupancy}%` }}
                    />
                  </div>
                </div>
              );
            })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Search */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
            <Input
              placeholder="Search by patient name or bed number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Admissions List */}
      {loading ? (
        <Card className="mb-4">
          <CardContent className="p-6">
            <div className="text-center py-12 text-gray-500">Loading admissions...</div>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList>
            <TabsTrigger value="all">All Admissions ({filteredAdmissions.length})</TabsTrigger>
            <TabsTrigger value="active">Active ({getAdmissionsByStatus('Active').length})</TabsTrigger>
            <TabsTrigger value="surgery">Surgery Scheduled ({getAdmissionsByStatus('Surgery Scheduled').length})</TabsTrigger>
            <TabsTrigger value="icu">Moved to ICU ({getAdmissionsByStatus('Moved to ICU').length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <AdmissionsList 
              admissions={filteredAdmissions} 
              onScheduleOT={handleScheduleOT}
              onManage={(admission) => {
                setManagedAdmission(admission);
                setIsManageDialogOpen(true);
              }}
              onManageCase={handleManageCase}
              schedulingOT={schedulingOT}
            />
          </TabsContent>
          <TabsContent value="active">
            <AdmissionsList 
              admissions={getAdmissionsByStatus('Active')} 
              onScheduleOT={handleScheduleOT}
              onManage={(admission) => {
                setManagedAdmission(admission);
                setIsManageDialogOpen(true);
              }}
              onManageCase={handleManageCase}
              schedulingOT={schedulingOT}
            />
          </TabsContent>
          <TabsContent value="surgery">
            <AdmissionsList 
              admissions={getAdmissionsByStatus('Surgery Scheduled')} 
              onScheduleOT={handleScheduleOT}
              onManage={(admission) => {
                setManagedAdmission(admission);
                setIsManageDialogOpen(true);
              }}
              onManageCase={handleManageCase}
              schedulingOT={schedulingOT}
            />
          </TabsContent>
          <TabsContent value="icu">
            <AdmissionsList 
              admissions={getAdmissionsByStatus('Moved to ICU')} 
              onScheduleOT={handleScheduleOT}
              onManage={(admission) => {
                setManagedAdmission(admission);
                setIsManageDialogOpen(true);
              }}
              onManageCase={handleManageCase}
              schedulingOT={schedulingOT}
            />
          </TabsContent>
        </Tabs>
      )}
          </div>
        </div>

      {/* Manage Patient Admission Dialog */}
      <Dialog open={isManageDialogOpen} onOpenChange={setIsManageDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage Patient Admission</DialogTitle>
          </DialogHeader>
          {managedAdmission && (
            <PatientAdmissionManagement admission={managedAdmission} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AdmissionsList({ 
  admissions, 
  onScheduleOT,
  onManage,
  onManageCase,
  schedulingOT 
}: { 
  admissions: Admission[]; 
  onScheduleOT: (admission: Admission) => void;
  onManage: (admission: Admission) => void;
  onManageCase: (admission: Admission) => void;
  schedulingOT: number | null;
}) {
  return (
    <Card className="mb-4">
      <CardContent className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-gray-700">Bed #</th>
                <th className="text-left py-3 px-4 text-gray-700">Patient</th>
                <th className="text-left py-3 px-4 text-gray-700">Age/Gender</th>
                <th className="text-left py-3 px-4 text-gray-700">Room Type</th>
                <th className="text-left py-3 px-4 text-gray-700">Admission Date</th>
                <th className="text-left py-3 px-4 text-gray-700">Admitted By</th>
                <th className="text-left py-3 px-4 text-gray-700">Diagnosis</th>
                <th className="text-left py-3 px-4 text-gray-700">Admission Status</th>
                <th className="text-left py-3 px-4 text-gray-700">Schedule OT</th>
                <th className="text-left py-3 px-4 text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {admissions.map((admission) => (
                <tr key={admission.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <Badge>{admission.bedNumber}</Badge>
                  </td>
                  <td className="py-3 px-4 text-gray-900">{admission.patientName}</td>
                  <td className="py-3 px-4 text-gray-600">{admission.age}Y / {admission.gender}</td>
                  <td className="py-3 px-4 text-gray-600">{admission.roomType}</td>
                  <td className="py-3 px-4 text-gray-600">{admission.admissionDate}</td>
                  <td className="py-3 px-4 text-gray-600">{admission.admittedBy}</td>
                  <td className="py-3 px-4 text-gray-600">{admission.diagnosis}</td>
                  <td className="py-3 px-4">
                    <span className={`px-3 py-1 rounded-full text-xs ${
                      admission.status === 'Active' ? 'bg-green-100 text-green-700' :
                      admission.status === 'Surgery Scheduled' ? 'bg-orange-100 text-orange-700' :
                      admission.status === 'Moved to ICU' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {admission.admissionStatus || admission.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {(() => {
                      const scheduleOTValue = admission.scheduleOT;
                      if (!scheduleOTValue) {
                        return <span className="text-gray-400 text-sm">-</span>;
                      }
                      const isScheduled = String(scheduleOTValue).toLowerCase() === 'yes' || scheduleOTValue === true;
                      return (
                        <Badge variant={isScheduled ? 'default' : 'outline'} className={isScheduled ? 'bg-green-100 text-green-700 border-green-300' : ''}>
                          {isScheduled ? 'Yes' : String(scheduleOTValue)}
                        </Badge>
                      );
                    })()}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      {admission.status === 'Active' && (
                        <>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="gap-1"
                            onClick={() => onScheduleOT(admission)}
                            disabled={schedulingOT === (admission.roomAdmissionId || admission.admissionId)}
                          >
                            <Scissors className="size-3" />
                            {schedulingOT === (admission.roomAdmissionId || admission.admissionId) ? 'Scheduling...' : 'Schedule OT'}
                          </Button>
                         
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="gap-1"
                            onClick={() => onManageCase(admission)}
                          >
                            <FileText className="size-3" />
                            Manage Case
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {admissions.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No admissions found
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Patient Admission Management Component
function PatientAdmissionManagement({ admission }: { admission: Admission }) {
  const [admissionDetails, setAdmissionDetails] = useState<Admission | null>(admission);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load admission details if needed
    if (admission.roomAdmissionId) {
      // You can fetch fresh details here if needed
      setAdmissionDetails(admission);
    }
  }, [admission]);

  return (
    <div className="space-y-6">
      {/* Room Admission Details */}
      <Card>
        <CardHeader>
          <CardTitle>Room Admission Details</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading admission details...</div>
          ) : admissionDetails ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <Label className="text-sm text-gray-500">Patient Name</Label>
                <p className="text-gray-900 font-medium mt-1">{admissionDetails.patientName}</p>
              </div>
              <div>
                <Label className="text-sm text-gray-500">Patient ID</Label>
                <p className="text-gray-900 font-medium mt-1">{admissionDetails.patientId || 'N/A'}</p>
              </div>
              <div>
                <Label className="text-sm text-gray-500">Bed Number</Label>
                <p className="text-gray-900 font-medium mt-1">
                  <Badge variant="outline">{admissionDetails.bedNumber}</Badge>
                </p>
              </div>
              <div>
                <Label className="text-sm text-gray-500">Room Type</Label>
                <p className="text-gray-900 font-medium mt-1">{admissionDetails.roomType}</p>
              </div>
              <div>
                <Label className="text-sm text-gray-500">Age</Label>
                <p className="text-gray-900 font-medium mt-1">{admissionDetails.age} years</p>
              </div>
              <div>
                <Label className="text-sm text-gray-500">Gender</Label>
                <p className="text-gray-900 font-medium mt-1">{admissionDetails.gender}</p>
              </div>
              <div>
                <Label className="text-sm text-gray-500">Admission Date</Label>
                <p className="text-gray-900 font-medium mt-1">{admissionDetails.admissionDate}</p>
              </div>
              <div>
                <Label className="text-sm text-gray-500">Admitted By</Label>
                <p className="text-gray-900 font-medium mt-1">{admissionDetails.admittedBy}</p>
              </div>
              <div className="col-span-2">
                <Label className="text-sm text-gray-500">Diagnosis</Label>
                <p className="text-gray-900 font-medium mt-1">{admissionDetails.diagnosis || 'N/A'}</p>
              </div>
              <div>
                <Label className="text-sm text-gray-500">Admission Status</Label>
                <p className="mt-1">
                  <span className={`px-3 py-1 rounded-full text-xs inline-block ${
                    admissionDetails.status === 'Active' ? 'bg-green-100 text-green-700' :
                    admissionDetails.status === 'Surgery Scheduled' ? 'bg-orange-100 text-orange-700' :
                    admissionDetails.status === 'Moved to ICU' ? 'bg-red-100 text-red-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {admissionDetails.admissionStatus || admissionDetails.status}
                  </span>
                </p>
              </div>
              {admissionDetails.scheduleOT && (
                <div>
                  <Label className="text-sm text-gray-500">Schedule OT</Label>
                  <p className="mt-1">
                    <Badge variant={String(admissionDetails.scheduleOT).toLowerCase() === 'yes' ? 'default' : 'outline'}>
                      {String(admissionDetails.scheduleOT)}
                    </Badge>
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">No admission details available</div>
          )}
        </CardContent>
      </Card>

      {/* Tabs for Case Details, Lab Tests, Doctor Visits, Nurse Visits */}
      <Tabs defaultValue="case-details" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="case-details" className="gap-2">
            <FileText className="size-4" />
            Case Details
          </TabsTrigger>
          <TabsTrigger value="lab-tests" className="gap-2">
            <FlaskConical className="size-4" />
            Lab Tests
          </TabsTrigger>
          <TabsTrigger value="doctor-visits" className="gap-2">
            <Stethoscope className="size-4" />
            Doctor Visits
          </TabsTrigger>
          <TabsTrigger value="nurse-visits" className="gap-2">
            <Heart className="size-4" />
            Nurse Visits
          </TabsTrigger>
        </TabsList>

        <TabsContent value="case-details" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Case Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label className="text-sm text-gray-500">Diagnosis</Label>
                  <p className="text-gray-900 font-medium mt-1">{admissionDetails?.diagnosis || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">Admission Notes</Label>
                  <p className="text-gray-900 mt-1">Case details and notes will be displayed here.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lab-tests" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Lab Tests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                Lab tests for this admission will be displayed here.
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="doctor-visits" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Patient's Doctor Visits</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                Doctor visit records for this admission will be displayed here.
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="nurse-visits" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Nurse Visits</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                Nurse visit records for this admission will be displayed here.
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
