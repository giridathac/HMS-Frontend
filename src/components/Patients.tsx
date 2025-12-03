// Patients Component - Separated UI from logic
import React, { useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { Search, Plus, Eye, Edit, Trash2 } from 'lucide-react';
import { usePatients } from '../hooks';
import { Patient } from '../types';

interface PatientsViewProps {
  patients: Patient[];
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onCreatePatient: (data: {
    name: string;
    age: number;
    gender: string;
    phone: string;
    email: string;
    bloodType: string;
    condition: string;
  }) => Promise<void>;
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

export function Patients() {
  const { patients, loading, error, createPatient, deletePatient } = usePatients();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreatePatient = async (data: {
    name: string;
    age: number;
    gender: string;
    phone: string;
    email: string;
    bloodType: string;
    condition: string;
  }) => {
    try {
      await createPatient(data);
    } catch (err) {
      console.error('Failed to create patient:', err);
      throw err;
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this patient?')) {
      try {
        await deletePatient(id);
      } catch (err) {
        console.error('Failed to delete patient:', err);
      }
    }
  };

  if (loading) {
    return (
      <div className="p-8 bg-blue-100 min-h-full">
        <div className="text-center py-12 text-blue-600">Loading patients...</div>
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
    <PatientsView
      patients={filteredPatients}
      searchTerm={searchTerm}
      onSearchChange={setSearchTerm}
      onCreatePatient={handleCreatePatient}
      onView={(id) => console.log('View patient:', id)}
      onEdit={(id) => console.log('Edit patient:', id)}
      onDelete={handleDelete}
    />
  );
}

function PatientsView({ 
  patients, 
  searchTerm, 
  onSearchChange, 
  onCreatePatient, 
  onView, 
  onEdit, 
  onDelete 
}: PatientsViewProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: '',
    phone: '',
    email: '',
    bloodType: '',
    condition: '',
  });

  const handleSubmit = async () => {
    try {
      await onCreatePatient({
        name: formData.name,
        age: parseInt(formData.age) || 0,
        gender: formData.gender,
        phone: formData.phone,
        email: formData.email,
        bloodType: formData.bloodType,
        condition: formData.condition,
      });
      setIsAddDialogOpen(false);
      setFormData({
        name: '',
        age: '',
        gender: '',
        phone: '',
        email: '',
        bloodType: '',
        condition: '',
      });
    } catch (err) {
      // Error handling is done in the parent
    }
  };

  return (
    <div className="p-8 bg-blue-100 min-h-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-gray-900 mb-2">Patients</h1>
          <p className="text-gray-500">Manage patient records and information</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="size-4" />
              Add Patient
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Patient</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input 
                  id="name" 
                  placeholder="Enter full name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="age">Age</Label>
                <Input 
                  id="age" 
                  type="number" 
                  placeholder="Enter age"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="gender">Gender</Label>
                <Input 
                  id="gender" 
                  placeholder="Enter gender"
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="bloodType">Blood Type</Label>
                <Input 
                  id="bloodType" 
                  placeholder="e.g., O+"
                  value={formData.bloodType}
                  onChange={(e) => setFormData({ ...formData, bloodType: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input 
                  id="phone" 
                  placeholder="Enter phone number"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="Enter email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="condition">Medical Condition</Label>
                <Input 
                  id="condition" 
                  placeholder="Enter medical condition"
                  value={formData.condition}
                  onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSubmit}>Add Patient</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-6">
          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
              <Input
                placeholder="Search patients by name or email..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-gray-700">Patient Name</th>
                      <th className="text-left py-3 px-4 text-gray-700">Age</th>
                      <th className="text-left py-3 px-4 text-gray-700">Gender</th>
                      <th className="text-left py-3 px-4 text-gray-700">Phone</th>
                      <th className="text-left py-3 px-4 text-gray-700">Blood Type</th>
                      <th className="text-left py-3 px-4 text-gray-700">Last Visit</th>
                      <th className="text-left py-3 px-4 text-gray-700">Follow-ups</th>
                      <th className="text-left py-3 px-4 text-gray-700">Condition</th>
                      <th className="text-left py-3 px-4 text-gray-700">Actions</th>
                    </tr>
                  </thead>
              <tbody>
                {patients.map((patient) => (
                  <tr key={patient.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-gray-900">{patient.name}</td>
                    <td className="py-3 px-4 text-gray-600">{patient.age}</td>
                    <td className="py-3 px-4 text-gray-600">{patient.gender}</td>
                    <td className="py-3 px-4 text-gray-600">{patient.phone}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-sm">
                        {patient.bloodType}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{patient.lastVisit}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-sm">
                        {patient.followUpCount || 0}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{patient.condition}</td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => onView(patient.id)}>
                          <Eye className="size-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => onEdit(patient.id)}>
                          <Edit className="size-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => onDelete(patient.id)}>
                          <Trash2 className="size-4 text-red-600" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {patients.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No patients found matching your search.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
