// Doctors Management Component - Fetch from /api/users and filter doctors/surgeons
import React, { useMemo, useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { UserCheck, Users } from 'lucide-react';
import { useStaff } from '../hooks/useStaff';
import { useRoles } from '../hooks/useRoles';
import { useDepartments } from '../hooks/useDepartments';
import { Staff } from '../types/staff';
import { AttendanceRecord } from '../api/doctors';

interface DoctorsViewProps {
  doctors: Staff[];
  roles: Array<{ id: string; name: string }>;
  departments: Array<{ id: number; name: string }>;
  attendance: AttendanceRecord[];
  selectedStatus: 'Active' | 'InActive' | 'all';
  onStatusFilterChange: (status: 'Active' | 'InActive' | 'all') => void;
  onCreateAttendance: (data: { doctorId: number; date: string; status: 'present' | 'absent' | 'on-leave' | 'half-day'; checkIn?: string; checkOut?: string; notes?: string }) => Promise<void>;
  onUpdateAttendance: (id: number, data: Partial<{ status: 'present' | 'absent' | 'on-leave' | 'half-day'; checkIn?: string; checkOut?: string; notes?: string }>) => Promise<void>;
}

export function Doctors() {
  const { staff, loading, error } = useStaff();
  const { roles } = useRoles();
  const { departments } = useDepartments();
  const [selectedStatus, setSelectedStatus] = useState<'Active' | 'InActive' | 'all'>('all');

  // Filter to show only doctors and surgeons
  const allDoctors = useMemo(() => {
    if (!staff || !roles) return [];
    
    return staff.filter((member) => {
      if (!member.RoleId) return false;
      const role = roles.find(r => r.id === member.RoleId);
      if (!role || !role.name) return false;
      const roleNameLower = role.name.toLowerCase();
      return roleNameLower.includes('doctor') || roleNameLower.includes('surgeon');
    });
  }, [staff, roles]);

  // Filter by status
  const doctors = useMemo(() => {
    return allDoctors.filter(d => {
      const statusMatch = selectedStatus === 'all' || d.Status === selectedStatus;
      return statusMatch;
    });
  }, [allDoctors, selectedStatus]);

  // Mock attendance data - you can replace this with actual attendance API later
  const attendance: AttendanceRecord[] = [];

  if (loading) {
    return (
      <div className="p-8 bg-blue-100 min-h-full">
        <div className="text-center py-12 text-blue-600">Loading doctors...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 bg-blue-100 min-h-full">
        <div className="text-center py-12 text-red-500">Error: {error}</div>
      </div>
    );
  }

  const handleCreateAttendance = async (data: { doctorId: number; date: string; status: 'present' | 'absent' | 'on-leave' | 'half-day'; checkIn?: string; checkOut?: string; notes?: string }) => {
    console.log('Create attendance:', data);
  };

  const handleUpdateAttendance = async (id: number, data: Partial<{ status: 'present' | 'absent' | 'on-leave' | 'half-day'; checkIn?: string; checkOut?: string; notes?: string }>) => {
    console.log('Update attendance:', id, data);
  };

  return (
    <DoctorsView
      doctors={doctors}
      allDoctors={allDoctors}
      roles={roles}
      departments={departments}
      attendance={attendance}
      selectedStatus={selectedStatus}
      onStatusFilterChange={setSelectedStatus}
      onCreateAttendance={handleCreateAttendance}
      onUpdateAttendance={handleUpdateAttendance}
    />
  );
}

function DoctorsView({
  doctors,
  allDoctors,
  roles,
  departments,
  attendance,
  selectedStatus,
  onStatusFilterChange,
  onCreateAttendance,
  onUpdateAttendance,
}: DoctorsViewProps & { allDoctors: Staff[] }) {
  const [selectedDate, setSelectedDate] = React.useState(new Date().toISOString().split('T')[0]);

  const getRoleName = (roleId: string) => {
    const role = roles.find(r => r.id === roleId);
    return role?.name || '-';
  };

  const getDepartmentName = (departmentId?: string) => {
    if (!departmentId) return '-';
    const dept = departments.find(d => d.id.toString() === departmentId);
    return dept?.name || '-';
  };

  const getStatusBadgeColor = (status?: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-700';
      case 'InActive':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getAttendanceForDoctor = (doctorId: number) => {
    return attendance.find(a => a.doctorId === doctorId && a.date === selectedDate);
  };

  const getAttendanceStatusBadge = (status: string) => {
    const styles = {
      present: 'bg-green-100 text-green-700',
      absent: 'bg-red-100 text-red-700',
      'on-leave': 'bg-yellow-100 text-yellow-700',
      'half-day': 'bg-blue-100 text-blue-700',
    };
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-700';
  };

  const todayAttendance = attendance.filter(a => a.date === selectedDate);

  return (
    <>
      <div className="px-4 pt-4 pb-0 bg-blue-100 h-full flex flex-col overflow-hidden">
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
          <div>
            <h1 className="text-gray-900 mb-0 text-xl">Doctors Management</h1>
            <p className="text-gray-500 text-sm">Manage doctors and track attendance</p>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="mb-0 flex-shrink-0">
          <Tabs 
            value={selectedStatus} 
            onValueChange={(value) => onStatusFilterChange(value as 'Active' | 'InActive' | 'all')}
            className="w-full"
          >
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="all">
                All ({allDoctors.length})
              </TabsTrigger>
              <TabsTrigger value="Active">
                Active ({allDoctors.filter(d => d.Status === 'Active').length})
              </TabsTrigger>
              <TabsTrigger value="InActive">
                InActive ({allDoctors.filter(d => d.Status === 'InActive').length})
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <Tabs defaultValue="doctors" className="flex-1 flex flex-col overflow-hidden min-h-0 gap-0">
          <TabsList className="mb-0 flex-shrink-0">
            <TabsTrigger value="doctors">Doctors List</TabsTrigger>
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
          </TabsList>

          <TabsContent value="doctors" className="flex-1 flex flex-col overflow-hidden min-h-0 mt-0">
            <Card className="flex-1 flex flex-col overflow-hidden min-h-0">
              <CardContent className="p-0 flex-1 overflow-hidden flex flex-col min-h-0">
                <div className="overflow-x-auto overflow-y-scroll border border-gray-200 rounded flex-1" style={{ maxHeight: 'calc(100vh - 100px)' }}>
                  <table className="w-full">
                    <thead className="sticky top-0 bg-white z-10 shadow-sm">
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-0.5 px-4 text-gray-700 bg-white whitespace-nowrap">User Name</th>
                        <th className="text-left py-0.5 px-4 text-gray-700 bg-white whitespace-nowrap">Role</th>
                        <th className="text-left py-0.5 px-4 text-gray-700 bg-white whitespace-nowrap">Department</th>
                        <th className="text-left py-0.5 px-4 text-gray-700 bg-white whitespace-nowrap">Qualification</th>
                        <th className="text-left py-0.5 px-4 text-gray-700 bg-white whitespace-nowrap">Type</th>
                        <th className="text-left py-0.5 px-4 text-gray-700 bg-white whitespace-nowrap">Phone</th>
                        <th className="text-left py-0.5 px-4 text-gray-700 bg-white whitespace-nowrap">Email</th>
                        <th className="text-left py-0.5 px-4 text-gray-700 bg-white whitespace-nowrap">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {doctors.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="text-center py-8 text-gray-500">
                            No doctors found
                          </td>
                        </tr>
                      ) : (
                        doctors.map((doctor) => (
                          <tr key={doctor.UserId || `doctor-${Math.random()}`} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-1 px-4">
                              <div className="flex items-center gap-2">
                                <Users className="size-4 text-blue-600" />
                                <span className="text-gray-900 font-medium">{doctor.UserName || '-'}</span>
                              </div>
                            </td>
                            <td className="py-1 px-4 text-gray-600">{getRoleName(doctor.RoleId)}</td>
                            <td className="py-1 px-4 text-gray-600">{getDepartmentName(doctor.DoctorDepartmentId)}</td>
                            <td className="py-1 px-4 text-gray-600">{doctor.DoctorQualification || '-'}</td>
                            <td className="py-1 px-4">
                              <span className={`px-2 py-1 rounded text-xs ${
                                doctor.DoctorType === 'INHOUSE' 
                                  ? 'bg-blue-100 text-blue-700' 
                                  : doctor.DoctorType === 'VISITING'
                                  ? 'bg-purple-100 text-purple-700'
                                  : 'bg-gray-100 text-gray-700'
                              }`}>
                                {doctor.DoctorType === 'INHOUSE' ? 'Inhouse' : doctor.DoctorType === 'VISITING' ? 'Visiting' : '-'}
                              </span>
                            </td>
                            <td className="py-1 px-4 text-gray-600">{doctor.PhoneNo || '-'}</td>
                            <td className="py-1 px-4 text-gray-600">{doctor.EmailId || '-'}</td>
                            <td className="py-1 px-4">
                              <span className={`px-2 py-1 rounded text-xs ${getStatusBadgeColor(doctor.Status)}`}>
                                {doctor.Status || 'Active'}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                      <tr>
                        <td className="py-1 px-4" colSpan={8}></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="attendance" className="flex-1 flex flex-col overflow-hidden min-h-0 mt-0">
            <Card className="flex-1 flex flex-col overflow-hidden min-h-0">
              <CardContent className="p-0 flex-1 overflow-hidden flex flex-col min-h-0">
                <div className="overflow-x-auto overflow-y-scroll border border-gray-200 rounded flex-1" style={{ maxHeight: 'calc(100vh - 100px)' }}>
                  <table className="w-full">
                    <thead className="sticky top-0 bg-white z-10 shadow-sm">
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-0.5 px-4 text-gray-700 bg-white whitespace-nowrap">Doctor</th>
                        <th className="text-left py-0.5 px-4 text-gray-700 bg-white whitespace-nowrap">Qualification</th>
                        <th className="text-left py-0.5 px-4 text-gray-700 bg-white whitespace-nowrap">Status</th>
                        <th className="text-left py-0.5 px-4 text-gray-700 bg-white whitespace-nowrap">Check In</th>
                        <th className="text-left py-0.5 px-4 text-gray-700 bg-white whitespace-nowrap">Check Out</th>
                        <th className="text-left py-0.5 px-4 text-gray-700 bg-white whitespace-nowrap">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {doctors.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center py-8 text-gray-500">
                            No doctors found
                          </td>
                        </tr>
                      ) : (
                        doctors.map((doctor) => {
                          const attendanceRecord = getAttendanceForDoctor(doctor.UserId || 0);
                          return (
                            <tr key={doctor.UserId} className="border-b border-gray-100 hover:bg-gray-50">
                              <td className="py-1 px-4 text-gray-900">{doctor.UserName}</td>
                              <td className="py-1 px-4 text-gray-600">{doctor.DoctorQualification || '-'}</td>
                              <td className="py-1 px-4">
                                {attendanceRecord ? (
                                  <span className={`px-2 py-1 rounded text-xs ${getAttendanceStatusBadge(attendanceRecord.status)}`}>
                                    {attendanceRecord.status.charAt(0).toUpperCase() + attendanceRecord.status.slice(1).replace('-', ' ')}
                                  </span>
                                ) : (
                                  <span className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-700">Not Marked</span>
                                )}
                              </td>
                              <td className="py-1 px-4 text-gray-600">
                                {attendanceRecord?.checkIn || '-'}
                              </td>
                              <td className="py-1 px-4 text-gray-600">
                                {attendanceRecord?.checkOut || '-'}
                              </td>
                              <td className="py-1 px-4">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    const currentStatus = attendanceRecord?.status || 'present';
                                    const statuses: Array<'present' | 'absent' | 'on-leave' | 'half-day'> = ['present', 'absent', 'on-leave', 'half-day'];
                                    const currentIndex = statuses.indexOf(currentStatus);
                                    const nextStatus = statuses[(currentIndex + 1) % statuses.length];
                                    
                                    if (attendanceRecord) {
                                      onUpdateAttendance(attendanceRecord.id, { status: nextStatus });
                                    } else {
                                      // Create new attendance record
                                      const now = new Date();
                                      const checkIn = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                                      onCreateAttendance({
                                        doctorId: doctor.UserId || 0,
                                        date: selectedDate,
                                        status: nextStatus,
                                        checkIn: nextStatus === 'present' || nextStatus === 'half-day' ? checkIn : undefined,
                                      });
                                    }
                                  }}
                                >
                                  <UserCheck className="size-4 mr-2" />
                                  {attendanceRecord ? 'Update' : 'Mark'}
                                </Button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                      <tr>
                        <td className="py-1 px-4" colSpan={6}></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
