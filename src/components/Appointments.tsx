// Appointments Component - Separated UI from logic
import React, { useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Calendar, Plus, Clock } from 'lucide-react';
import { useAppointments, useDoctors } from '../hooks';
import { Appointment } from '../types';

interface AppointmentsViewProps {
  appointments: Appointment[];
  selectedDate: string;
  onDateChange: (date: string) => void;
  onCreateAppointment: (data: {
    patient: string;
    doctor: string;
    date: string;
    time: string;
    department: string;
  }) => Promise<void>;
  doctors: Array<{ id: number; name: string; specialty: string; type: 'inhouse' | 'consulting' }>;
}

export function Appointments() {
  const { appointments, loading, error, createAppointment } = useAppointments();
  const { doctors } = useDoctors();
  const [selectedDate, setSelectedDate] = useState('2025-11-11');

  const uniqueDates = Array.from(new Set(appointments.map(apt => apt.date))).sort();

  const handleCreateAppointment = async (data: {
    patient: string;
    doctor: string;
    date: string;
    time: string;
    department: string;
  }) => {
    try {
      await createAppointment(data);
    } catch (err) {
      console.error('Failed to create appointment:', err);
      throw err;
    }
  };

  if (loading) {
    return (
      <div className="p-8 bg-blue-100 min-h-full">
        <div className="text-center py-12 text-blue-600">Loading appointments...</div>
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

  return (
    <AppointmentsView
      appointments={appointments}
      selectedDate={selectedDate}
      onDateChange={setSelectedDate}
      onCreateAppointment={handleCreateAppointment}
      doctors={doctors}
    />
  );
}

function AppointmentsView({ 
  appointments, 
  selectedDate, 
  onDateChange, 
  onCreateAppointment,
  doctors
}: AppointmentsViewProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    patient: '',
    doctor: '',
    date: '',
    time: '',
    department: '',
  });

  const filteredAppointments = appointments.filter(apt => apt.date === selectedDate);
  const uniqueDates = Array.from(new Set(appointments.map(apt => apt.date))).sort();

  const handleSubmit = async () => {
    try {
      await onCreateAppointment(formData);
      setIsAddDialogOpen(false);
      setFormData({
        patient: '',
        doctor: '',
        date: '',
        time: '',
        department: '',
      });
    } catch (err) {
      // Error handling is done in the parent
    }
  };

  return (
    <div className="p-8 bg-blue-100 min-h-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-gray-900 mb-2">Appointments</h1>
          <p className="text-gray-500">Schedule and manage patient appointments</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="size-4" />
              Schedule Appointment
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Schedule New Appointment</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="patient">Patient Name</Label>
                <Input 
                  id="patient" 
                  placeholder="Enter patient name"
                  value={formData.patient}
                  onChange={(e) => setFormData({ ...formData, patient: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="doctor">Doctor</Label>
                <select
                  id="doctor"
                  aria-label="Doctor"
                  className="w-full px-3 py-2 border border-gray-200 rounded-md"
                  value={formData.doctor}
                  onChange={(e) => setFormData({ ...formData, doctor: e.target.value })}
                >
                  <option value="">Select a doctor</option>
                  <optgroup label="Inhouse Doctors">
                    {doctors.filter(d => d.type === 'inhouse').map(doc => (
                      <option key={doc.id} value={doc.name}>
                        {doc.name} - {doc.specialty}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Consulting Doctors">
                    {doctors.filter(d => d.type === 'consulting').map(doc => (
                      <option key={doc.id} value={doc.name}>
                        {doc.name} - {doc.specialty}
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>
              <div>
                <Label htmlFor="department">Department</Label>
                <Input 
                  id="department" 
                  placeholder="Select department"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date">Date</Label>
                  <Input 
                    id="date" 
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="time">Time</Label>
                  <Input 
                    id="time" 
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSubmit}>Schedule</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Date Selector */}
        <Card className="lg:col-span-1">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="size-5 text-blue-600" />
              <h3 className="text-gray-900">Select Date</h3>
            </div>
            <div className="space-y-2">
              {uniqueDates.map(date => {
                const dateObj = new Date(date);
                const formattedDate = dateObj.toLocaleDateString('en-US', { 
                  weekday: 'short', 
                  month: 'short', 
                  day: 'numeric' 
                });
                return (
                  <button
                    key={date}
                    onClick={() => onDateChange(date)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                      selectedDate === date
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'hover:bg-gray-50 border border-transparent'
                    }`}
                  >
                    <p className={selectedDate === date ? 'text-blue-700' : 'text-gray-900'}>
                      {formattedDate}
                    </p>
                    <p className="text-sm text-gray-500">
                      {appointments.filter(apt => apt.date === date).length} appointments
                    </p>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Appointments List */}
        <Card className="lg:col-span-3">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-gray-900">
                Appointments for {new Date(selectedDate).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  month: 'long', 
                  day: 'numeric',
                  year: 'numeric'
                })}
              </h3>
              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="size-4" />
                <span className="text-sm">{filteredAppointments.length} appointments</span>
              </div>
            </div>

            <div className="space-y-4">
              {filteredAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-gray-900">{appointment.patient}</h4>
                        <span className={`px-3 py-1 rounded-full text-xs ${
                          appointment.status === 'Confirmed' ? 'bg-green-100 text-green-700' :
                          appointment.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                          appointment.status === 'Completed' ? 'bg-blue-100 text-blue-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {appointment.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Doctor</p>
                          <div className="flex items-center gap-2">
                            <p className="text-gray-900">{appointment.doctor}</p>
                            {(() => {
                              const doctor = doctors.find(d => d.name === appointment.doctor);
                              if (doctor) {
                                return (
                                  <span className={`px-2 py-0.5 rounded text-xs ${
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
                          </div>
                        </div>
                        <div>
                          <p className="text-gray-500">Department</p>
                          <p className="text-gray-900">{appointment.department}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Time</p>
                          <p className="text-gray-900">{appointment.time}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">View</Button>
                      <Button variant="outline" size="sm">Edit</Button>
                    </div>
                  </div>
                </div>
              ))}

              {filteredAppointments.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  No appointments scheduled for this date.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
