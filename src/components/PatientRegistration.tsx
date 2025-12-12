// Patient Registration Component - Separated UI from logic
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { usePatients } from '../hooks';
import { patientsApi } from '../api';
import { UserPlus, Plus, Eye, Pencil, Search, Trash2 } from 'lucide-react';
import { Patient } from '../types';

export function PatientRegistration() {
  const { patients, createPatient, loading, error, fetchPatients, deletePatient } = usePatients();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [adhaarError, setAdhaarError] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [loadingPatientDetails, setLoadingPatientDetails] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<any>(null);
  const [loadingEditPatient, setLoadingEditPatient] = useState(false);
  const [editFormData, setEditFormData] = useState<any>(null);
  const [updatingPatient, setUpdatingPatient] = useState(false);
  const [editAdhaarError, setEditAdhaarError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    patientNo: '',
    patientName: '',
    patientType: '',
    lastName: '',
    adhaarID: '',
    panCard: '',
    phoneNo: '',
    gender: '',
    age: '',
    address: '',
    chiefComplaint: '',
    description: '',
  });

  const handleAdhaarChange = (value: string) => {
    // Only allow numbers
    const numericValue = value.replace(/\D/g, '');
    // Limit to 12 digits
    const limitedValue = numericValue.slice(0, 12);
    
    setFormData({ ...formData, adhaarID: limitedValue });
    
    // Validate if field has value
    if (limitedValue && limitedValue.length !== 12) {
      setAdhaarError('Aadhaar ID must be exactly 12 digits');
    } else {
      setAdhaarError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate Aadhaar ID if provided
    if (formData.adhaarID && formData.adhaarID.length !== 12) {
      setAdhaarError('Aadhaar ID must be exactly 12 digits');
      return;
    }
    
    try {
      await createPatient({
        patientNo: formData.patientNo || undefined,
        patientName: formData.patientName,
        patientType: formData.patientType || undefined,
        lastName: formData.lastName || undefined,
        adhaarID: formData.adhaarID || undefined,
        panCard: formData.panCard || undefined,
        phoneNo: formData.phoneNo,
        gender: formData.gender,
        age: parseInt(formData.age) || 0,
        address: formData.address || undefined,
        chiefComplaint: formData.chiefComplaint || undefined,
        description: formData.description || undefined,
      });
      setIsSubmitted(true);
      // Refresh patient list
      await fetchPatients();
      // Reset form after 2 seconds
      setTimeout(() => {
        setFormData({
          patientNo: '',
          patientName: '',
          patientType: '',
          lastName: '',
          adhaarID: '',
          panCard: '',
          phoneNo: '',
          gender: '',
          age: '',
          address: '',
          chiefComplaint: '',
          description: '',
        });
        setAdhaarError('');
        setIsSubmitted(false);
        setIsAddDialogOpen(false);
      }, 2000);
    } catch (err) {
      console.error('Failed to register patient:', err);
    }
  };

  useEffect(() => {
    fetchPatients().catch((err) => {
      console.error('Error fetching patients in PatientRegistration:', err);
    });
  }, [fetchPatients]);

  // Filter patients based on search term
  const filteredPatients = patients.filter(patient => {
    const searchLower = searchTerm.toLowerCase();
    const patientName = `${patient.patientName || ''} ${patient.lastName || ''}`.toLowerCase();
    const patientNo = (patient.patientNo || '').toLowerCase();
    const phoneNo = (patient.phoneNo || patient.phone || '').toLowerCase();
    const patientId = (patient.patientId || patient.PatientId || '').toLowerCase();
    const patientType = (patient.patientType || patient.PatientType || '').toLowerCase();
    
    return patientName.includes(searchLower) ||
           patientNo.includes(searchLower) ||
           phoneNo.includes(searchLower) ||
           patientId.includes(searchLower) ||
           patientType.includes(searchLower);
  });

  const handleViewPatient = async (patientId: string) => {
    try {
      setLoadingPatientDetails(true);
      setIsDetailDialogOpen(true);
      console.log('Fetching patient with PatientId:', patientId);
      
      // Call getById with PatientId (string)
      const patient = await patientsApi.getById(patientId);
      console.log('Received patient data:', patient);
      
      // Map the patient to display format (convert PascalCase to camelCase for display)
      // Handle both direct response and wrapped response
      const patientData = (patient as any)?.data || patient;
      
      const mappedPatient = {
        id: patientData.id,
        patientId: patientData.PatientId || patientData.patientId,
        patientNo: patientData.PatientNo || patientData.patientNo,
        patientName: patientData.PatientName || patientData.patientName,
        lastName: patientData.LastName || patientData.lastName,
        patientType: patientData.PatientType || patientData.patientType,
        age: patientData.Age || patientData.age,
        gender: patientData.Gender || patientData.gender,
        phoneNo: patientData.PhoneNo || patientData.phoneNo,
        adhaarID: patientData.AdhaarId || patientData.adhaarID || patientData.AdhaarID,
        panCard: patientData.PANCard || patientData.panCard,
        address: patientData.Address || patientData.address,
        chiefComplaint: patientData.ChiefComplaint || patientData.chiefComplaint,
        description: patientData.Description || patientData.description,
        status: patientData.Status || patientData.status,
        registeredBy: patientData.RegisteredBy || patientData.registeredBy,
        registeredDate: patientData.RegisteredDate || patientData.registeredDate,
      };
      
      console.log('Mapped patient for display:', mappedPatient);
      setSelectedPatient(mappedPatient);
    } catch (err) {
      console.error('Error fetching patient details:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      alert(`Failed to load patient details: ${errorMessage}`);
      setIsDetailDialogOpen(false);
      setSelectedPatient(null);
    } finally {
      setLoadingPatientDetails(false);
    }
  };

  const handleEditPatient = async (patientId: string) => {
    try {
      setLoadingEditPatient(true);
      setIsEditDialogOpen(true);
      console.log('Fetching patient for edit with PatientId:', patientId);
      
      // Call getById with PatientId (string)
      const patient = await patientsApi.getById(patientId);
      console.log('Received patient data for edit:', patient);
      
      // Map the patient to display format (convert PascalCase to camelCase for display)
      // Handle both direct response and wrapped response
      const patientData = (patient as any)?.data || patient;
      
      const mappedPatient = {
        id: patientData.id,
        patientId: patientData.PatientId || patientData.patientId,
        patientNo: patientData.PatientNo || patientData.patientNo,
        patientName: patientData.PatientName || patientData.patientName,
        lastName: patientData.LastName || patientData.lastName,
        patientType: patientData.PatientType || patientData.patientType,
        age: patientData.Age || patientData.age,
        gender: patientData.Gender || patientData.gender,
        phoneNo: patientData.PhoneNo || patientData.phoneNo,
        adhaarID: patientData.AdhaarId || patientData.adhaarID || patientData.AdhaarID,
        panCard: patientData.PANCard || patientData.panCard,
        address: patientData.Address || patientData.address,
        chiefComplaint: patientData.ChiefComplaint || patientData.chiefComplaint,
        description: patientData.Description || patientData.description,
        status: patientData.Status || patientData.status,
        registeredBy: patientData.RegisteredBy || patientData.registeredBy,
        registeredDate: patientData.RegisteredDate || patientData.registeredDate,
      };
      
      console.log('Mapped patient for edit:', mappedPatient);
      setEditingPatient(mappedPatient);
      setEditFormData({
        patientNo: mappedPatient.patientNo || '',
        patientName: mappedPatient.patientName || '',
        patientType: mappedPatient.patientType || '',
        lastName: mappedPatient.lastName || '',
        adhaarID: mappedPatient.adhaarID || '',
        panCard: mappedPatient.panCard || '',
        phoneNo: mappedPatient.phoneNo || '',
        gender: mappedPatient.gender || '',
        age: mappedPatient.age || '',
        address: mappedPatient.address || '',
        chiefComplaint: mappedPatient.chiefComplaint || '',
        description: mappedPatient.description || '',
        status: mappedPatient.status || 'Active',
        registeredBy: mappedPatient.registeredBy || '',
        registeredDate: mappedPatient.registeredDate ? new Date(mappedPatient.registeredDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      });
    } catch (err) {
      console.error('Error fetching patient for edit:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      alert(`Failed to load patient for editing: ${errorMessage}`);
      setIsEditDialogOpen(false);
      setEditingPatient(null);
      setEditFormData(null);
    } finally {
      setLoadingEditPatient(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditDialogOpen(false);
    setEditingPatient(null);
    setEditFormData(null);
    setEditAdhaarError('');
  };

  const handleDeletePatient = async (patientId: string) => {
    if (confirm('Are you sure you want to delete this patient? This action cannot be undone.')) {
      try {
        // Note: deletePatient expects a number, but we have a string PatientId
        // We may need to get the numeric id from the patient object
        const patient = patients.find(p => (p.patientId || p.PatientId) === patientId);
        if (patient && patient.id) {
          await deletePatient(patient.id);
          await fetchPatients();
        } else {
          alert('Unable to delete patient: ID not found');
        }
      } catch (err) {
        console.error('Failed to delete patient:', err);
        alert('Failed to delete patient. Please try again.');
      }
    }
  };

  const handleUpdatePatient = async () => {
    // Get PatientId from editingPatient - ensure it's available
    const patientId = editingPatient?.patientId || editingPatient?.PatientId;
    
    if (!patientId || !editFormData) {
      alert('Patient ID or form data is missing.');
      console.error('Update failed - missing PatientId or form data:', { patientId, editFormData });
      return;
    }

    // Validation
    if (!editFormData.patientName || !editFormData.phoneNo || !editFormData.gender || !editFormData.age) {
      alert('Please fill all required fields: Patient Name, Phone No, Gender, Age.');
      return;
    }

    if (editFormData.adhaarID && editFormData.adhaarID.length !== 12) {
      setEditAdhaarError('Aadhaar ID must be exactly 12 digits');
      return;
    }
    setEditAdhaarError('');

    try {
      setUpdatingPatient(true);
      
      // Prepare update data - PatientId is required and must be in the URL path
      // The API expects PatientId in PascalCase for the DTO
      const updateData = {
        PatientId: patientId, // Explicitly use the PatientId
        patientNo: editFormData.patientNo || undefined,
        patientName: editFormData.patientName,
        patientType: editFormData.patientType || undefined,
        lastName: editFormData.lastName || undefined,
        adhaarID: editFormData.adhaarID || undefined,
        panCard: editFormData.panCard || undefined,
        phoneNo: editFormData.phoneNo,
        gender: editFormData.gender,
        age: parseInt(editFormData.age) || 0,
        address: editFormData.address || undefined,
        chiefComplaint: editFormData.chiefComplaint || undefined,
        description: editFormData.description || undefined,
        status: editFormData.status || undefined,
        registeredBy: editFormData.registeredBy || undefined,
        registeredDate: editFormData.registeredDate || undefined,
      };

      console.log('Updating patient with PatientId:', patientId);
      console.log('Update data being sent:', updateData);
      
      // The API will use updateData.PatientId in the URL: /patients/{PatientId}
      await patientsApi.update(updateData);
      
      console.log('Patient updated successfully for PatientId:', patientId);

      // Refresh the patient list
      await fetchPatients();
      
      // Close the edit dialog
      setIsEditDialogOpen(false);
      setEditingPatient(null);
      setEditFormData(null);
      
      alert('Patient details updated successfully!');
    } catch (err) {
      console.error('Error updating patient:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      alert(`Failed to update patient: ${errorMessage}`);
    } finally {
      setUpdatingPatient(false);
    }
  };

  if (loading) {
    return (
      <div className="px-4 pt-4 pb-0 bg-gray-100 h-full flex flex-col overflow-hidden">
        <div className="text-center py-12 text-gray-600">Loading patients...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 pt-4 pb-0 bg-gray-100 h-full flex flex-col overflow-hidden">
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
                <h1 className="text-gray-900 mb-2 text-2xl">Patient Registration</h1>
                <p className="text-gray-500 text-base">Register and manage patient information</p>
              </div>
              <Button 
                className="gap-2"
                onClick={() => setIsAddDialogOpen(true)}
              >
                <Plus className="size-4" />
                Add New Patient
              </Button>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogContent className="p-0 gap-0 large-dialog bg-white">
              <DialogHeader className="px-6 pt-4 pb-3 flex-shrink-0 bg-white">
                <DialogTitle className="text-gray-700">Add New Patient</DialogTitle>
              </DialogHeader>
              <div className="flex-1 overflow-y-auto px-6 pb-1 patient-list-scrollable min-h-0 bg-white">
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                      {error}
                    </div>
                  )}

                  {/* Row 1: PatientName */}
                  <div>
                    <Label htmlFor="patientName" className="text-gray-600">Patient Name *</Label>
                    <Input
                      id="patientName"
                      required
                      value={formData.patientName}
                      onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                      placeholder="Enter patient's first name"
                      className="bg-gray-50 text-gray-900"
                      
                    />
                  </div>

                  {/* Row 1.5: PatientNo */}
                  <div>
                    <Label htmlFor="patientNo" className="text-gray-600">Patient No (Optional)</Label>
                    <Input
                      id="patientNo"
                      value={formData.patientNo}
                      onChange={(e) => setFormData({ ...formData, patientNo: e.target.value })}
                      placeholder="Optional manual patient number"
                      className="bg-gray-50 text-gray-900"
                      
                    />
                  </div>

                  {/* Row 2: PatientType, LastName */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="patientType" className="text-gray-600">Patient Type</Label>
                      <select
                        id="patientType"
                        aria-label="Patient Type"
                        className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-900"
                        value={formData.patientType}
                        onChange={(e) => setFormData({ ...formData, patientType: e.target.value })}
                        
                      >
                        <option value="">Select type</option>
                        <option value="OPD">OPD</option>
                        <option value="IPD">IPD</option>
                        <option value="Emergency">Emergency</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="lastName" className="text-gray-600">Last Name</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        placeholder="Enter patient's last name"
                        className="bg-gray-50 text-gray-900"
                        
                      />
                    </div>
                  </div>

                  {/* Row 3: AdhaarID (highlighted), PANCard */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="adhaarID" className="flex items-center gap-2 text-gray-600">
                        Adhaar ID
                        <span className="text-xs text-orange-500">(Important)</span>
                      </Label>
                      <Input
                        id="adhaarID"
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={formData.adhaarID}
                        onChange={(e) => handleAdhaarChange(e.target.value)}
                        placeholder="Enter 12-digit Aadhaar number"
                        maxLength={12}
                        className={`bg-gray-50 text-gray-900 ${adhaarError ? 'border-red-300' : ''}`}
                        
                      />
                      {adhaarError && (
                        <p className="text-sm text-red-600 mt-1">{adhaarError}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="panCard" className="text-gray-600">PAN Card</Label>
                      <Input
                        id="panCard"
                        value={formData.panCard}
                        onChange={(e) => setFormData({ ...formData, panCard: e.target.value.toUpperCase() })}
                        placeholder="Enter PAN number"
                        maxLength={10}
                        className="bg-gray-50 text-gray-900"
                        
                      />
                    </div>
                  </div>

                  {/* Row 4: PhoneNo, Gender */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phoneNo" className="text-gray-600">Phone No *</Label>
                      <Input
                        id="phoneNo"
                        required
                        type="tel"
                        value={formData.phoneNo}
                        onChange={(e) => setFormData({ ...formData, phoneNo: e.target.value })}
                        placeholder="Enter phone number"
                        className="bg-gray-50 text-gray-900"
                        
                      />
                    </div>
                    <div>
                      <Label htmlFor="gender" className="text-gray-600">Gender *</Label>
                      <select
                        id="gender"
                        aria-label="Gender"
                        required
                        className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-900"
                        value={formData.gender}
                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                        
                      >
                        <option value="" >Select gender</option>
                        <option value="Male" >Male</option>
                        <option value="Female" >Female</option>
                        <option value="Other" >Other</option>
                      </select>
                    </div>
                  </div>

                  {/* Row 5: Age, Address */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="age" className="text-gray-600">Age *</Label>
                      <Input
                        id="age"
                        required
                        type="number"
                        min="0"
                        max="150"
                        value={formData.age}
                        onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                        placeholder="Enter age"
                        className="bg-gray-50 text-gray-900"
                        
                      />
                    </div>
                    <div>
                      <Label htmlFor="address" className="text-gray-600">Address</Label>
                      <Input
                        id="address"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        placeholder="Enter address"
                        className="bg-gray-50 text-gray-900"
                        
                      />
                    </div>
                  </div>

                  {/* Row 6: ChiefComplaint */}
                  <div>
                    <Label htmlFor="chiefComplaint" className="text-gray-600">Chief Complaint</Label>
                    <Input
                      id="chiefComplaint"
                      value={formData.chiefComplaint}
                      onChange={(e) => setFormData({ ...formData, chiefComplaint: e.target.value })}
                      placeholder="Enter chief complaint"
                      className="bg-gray-50 text-gray-900"
                      
                    />
                  </div>

                  {/* Row 7: Description */}
                  <div>
                    <Label htmlFor="description" className="text-gray-600">Description</Label>
                    <textarea
                      id="description"
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-200 rounded-md resize-none bg-gray-50 text-gray-900"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Enter additional description or notes"
                      
                    />
                  </div>

                  {/* Row 8: Status, RegisteredBy, RegisteredDate */}
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="status" className="text-gray-600">Status</Label>
                      <select
                        id="status"
                        aria-label="Status"
                        className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-900"
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        
                      >
                        <option value="Active" >Active</option>
                        <option value="Inactive" >Inactive</option>
                        <option value="Discharged" >Discharged</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="registeredBy" className="text-gray-600">Registered By</Label>
                      <Input
                        id="registeredBy"
                        value={formData.registeredBy}
                        onChange={(e) => setFormData({ ...formData, registeredBy: e.target.value })}
                        placeholder="Registered by"
                        className="bg-gray-50 text-gray-900"
                        
                      />
                    </div>
                    <div>
                      <Label htmlFor="registeredDate" className="text-gray-600">Registered Date</Label>
                      <Input
                        id="registeredDate"
                        type="date"
                        value={formData.registeredDate}
                        onChange={(e) => setFormData({ ...formData, registeredDate: e.target.value })}
                        className="bg-gray-50 text-gray-900"
                        
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-4 border-t bg-white">
                    <Button 
                      type="button"
                      variant="outline" 
                      onClick={() => {
                        setIsAddDialogOpen(false);
                        setFormData({
                          patientNo: '',
                          patientName: '',
                          patientType: '',
                          lastName: '',
                          adhaarID: '',
                          panCard: '',
                          phoneNo: '',
                          gender: '',
                          age: '',
                          address: '',
                          chiefComplaint: '',
                          description: '',
                        });
                        setAdhaarError('');
                      }} 
                      className="py-1"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit"
                      disabled={loading} 
                      className="py-1"
                    >
                      {loading ? 'Registering...' : 'Register Patient'}
                    </Button>
                  </div>
                </form>
              </div>
            </DialogContent>
          </Dialog>
            </div>
          </div>

          <div className="px-6 pt-4 pb-4 flex-1">
            {/* Search */}
          <Card className="mb-6 bg-white">
            <CardContent className="p-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                <Input
                  placeholder="Search by patient name, patient number, phone number, patient ID, or patient type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-50"
                />
              </div>
            </CardContent>
          </Card>

          {/* Patients Table */}
          <Card className="bg-white border border-gray-200 shadow-sm rounded-lg mb-4">
            <CardContent className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-4 px-6 text-gray-700">Patient No</th>
                      <th className="text-left py-4 px-6 text-gray-700">Patient Name</th>
                      <th className="text-left py-4 px-6 text-gray-700">Type</th>
                      <th className="text-left py-4 px-6 text-gray-700">Age</th>
                      <th className="text-left py-4 px-6 text-gray-700 break-words min-w-[120px]">Chief Complaint</th>
                      <th className="text-left py-4 px-6 text-gray-700">Status</th>
                      <th className="text-left py-4 px-6 text-gray-700">Registered Date</th>
                      <th className="text-left py-4 px-6 text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPatients.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="text-center py-8 text-gray-500 text-sm">
                          {searchTerm ? 'No patients found matching your search.' : 'No patients found. Click "Add New Patient" to register a new patient.'}
                        </td>
                      </tr>
                    ) : (
                      filteredPatients.map((patient, index) => {
                      // Use patientId as primary key, fallback to id, then index
                      const uniqueKey = patient.patientId || patient.PatientId || patient.id || `patient-${index}`;
                      return (
                      <tr key={uniqueKey} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-6 text-gray-900 font-mono font-medium whitespace-nowrap">{patient.patientNo || '-'}</td>
                        <td className="py-4 px-6 text-gray-600 whitespace-nowrap min-w-[120px]">
                          {patient.patientName} {patient.lastName || ''}
                        </td>
                        <td className="py-4 px-6 whitespace-nowrap">
                          <span className="px-1.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                            {patient.patientType || 'N/A'}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-gray-600 whitespace-nowrap">{patient.age}</td>
                        <td className="py-4 px-6 text-gray-600 whitespace-nowrap min-w-[120px]" title={patient.chiefComplaint || patient.condition}>
                          {patient.chiefComplaint || patient.condition || '-'}
                        </td>
                        <td className="py-4 px-6 whitespace-nowrap">
                          <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${
                            patient.status === 'Active' ? 'bg-green-100 text-green-700' :
                            patient.status === 'Inactive' ? 'bg-gray-100 text-gray-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {patient.status || 'Active'}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-gray-600 whitespace-nowrap">
                          {patient.registeredDate ? new Date(patient.registeredDate).toLocaleDateString() : '-'}
                        </td>
                        <td className="py-4 px-6 whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-7 w-7 p-0"
                              onClick={() => {
                                // Use PatientId (string) for the API call
                                // The patient object from getAll is already mapped to camelCase
                                const patientId = patient.patientId || patient.PatientId;
                                if (!patientId) {
                                  console.error('PatientId not found for patient:', patient);
                                  alert('Patient ID not available');
                                  return;
                                }
                                console.log('Viewing patient with PatientId:', patientId);
                                handleViewPatient(patientId);
                              }}
                              title="View Patient Details"
                            >
                              <Eye className="size-3" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-7 w-7 p-0"
                              onClick={() => {
                                // Use PatientId (string) for the API call
                                const patientId = patient.patientId || patient.PatientId;
                                if (!patientId) {
                                  console.error('PatientId not found for patient:', patient);
                                  alert('Patient ID not available');
                                  return;
                                }
                                console.log('Editing patient with PatientId:', patientId);
                                handleEditPatient(patientId);
                              }}
                              title="Edit Patient Details"
                            >
                              <Pencil className="size-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const patientId = patient.patientId || patient.PatientId;
                                if (!patientId) {
                                  console.error('PatientId not found for patient:', patient);
                                  alert('Patient ID not available');
                                  return;
                                }
                                handleDeletePatient(patientId);
                              }}
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                              title="Delete Patient"
                            >
                              <Trash2 className="size-4" />
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
          </div>
        </div>
      </div>

      {/* Patient Details Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="p-0 gap-0 large-dialog max-w-5xl max-h-[90vh]">
          <DialogHeader className="px-6 pt-4 pb-3 flex-shrink-0">
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="size-5" />
              Patient Details
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto px-6 pb-1 patient-list-scrollable min-h-0">
            {loadingPatientDetails ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading patient details...</p>
                </div>
              </div>
            ) : selectedPatient ? (
              <div className="space-y-6 py-4">
                {/* Basic Information Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">Basic Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Patient ID</Label>
                      <p className="text-base font-mono font-semibold mt-1 text-gray-900">{selectedPatient.patientId || '-'}</p>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Patient No</Label>
                      <p className="text-base font-mono font-semibold mt-1 text-gray-900">{selectedPatient.patientNo || '-'}</p>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Patient Name</Label>
                      <p className="text-base font-semibold mt-1 text-gray-900">{selectedPatient.patientName || '-'}</p>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Last Name</Label>
                      <p className="text-base mt-1 text-gray-900">{selectedPatient.lastName || '-'}</p>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Patient Type</Label>
                      <p className="text-base mt-1">
                        <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
                          {selectedPatient.patientType || 'N/A'}
                        </span>
                      </p>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Status</Label>
                      <p className="text-base mt-1">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          selectedPatient.status === 'Active' ? 'bg-green-100 text-green-700' :
                          selectedPatient.status === 'Inactive' ? 'bg-gray-100 text-gray-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {selectedPatient.status || 'Active'}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Personal Details Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">Personal Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Age</Label>
                      <p className="text-base mt-1 text-gray-900">{selectedPatient.age || '-'}</p>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Gender</Label>
                      <p className="text-base mt-1 text-gray-900">{selectedPatient.gender || '-'}</p>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Phone No</Label>
                      <p className="text-base font-mono mt-1 text-gray-900">{selectedPatient.phoneNo || '-'}</p>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Registered Date</Label>
                      <p className="text-base mt-1 text-gray-900">
                        {selectedPatient.registeredDate 
                          ? new Date(selectedPatient.registeredDate).toLocaleDateString('en-US', { 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            }) 
                          : '-'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Identification Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">Identification</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Aadhaar ID</Label>
                      <p className="text-base font-mono mt-1 text-gray-900">{selectedPatient.adhaarID || '-'}</p>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium text-gray-700">PAN Card</Label>
                      <p className="text-base font-mono mt-1 text-gray-900">{selectedPatient.panCard || '-'}</p>
                    </div>
                  </div>
                </div>

                {/* Address Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">Address</h3>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Full Address</Label>
                    <p className="text-base mt-1 text-gray-900 whitespace-pre-wrap">{selectedPatient.address || '-'}</p>
                  </div>
                </div>

                {/* Medical Information Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">Medical Information</h3>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Chief Complaint</Label>
                      <p className="text-base mt-1 text-gray-900">{selectedPatient.chiefComplaint || '-'}</p>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Description</Label>
                      <p className="text-base mt-1 text-gray-900 whitespace-pre-wrap bg-gray-50 p-3 rounded-md border border-gray-200">
                        {selectedPatient.description || '-'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <p className="text-lg">No patient details available</p>
              </div>
            )}
          </div>
          
          <div className="px-6 py-3 flex-shrink-0 border-t border-gray-200 flex justify-end">
            <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Patient Details Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="p-0 gap-0 large-dialog">
          <DialogHeader className="px-6 pt-4 pb-3 flex-shrink-0">
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="size-5" />
              Edit Patient Details
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto px-6 pb-1 patient-list-scrollable min-h-0">
            {loadingEditPatient ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-blue-600">Loading patient details...</p>
                </div>
              </div>
              ) : editingPatient && editFormData ? (
                <form onSubmit={(e) => { e.preventDefault(); handleUpdatePatient(); }} className="space-y-4 py-4">
                  {/* Row 1: PatientName */}
                  <div>
                    <Label htmlFor="editPatientName">Patient Name *</Label>
                    <Input
                      id="editPatientName"
                      required
                      value={editFormData.patientName}
                      onChange={(e) => setEditFormData({ ...editFormData, patientName: e.target.value })}
                      placeholder="Enter patient's first name"
                    />
                  </div>

                  {/* Row 1.5: PatientNo */}
                  <div>
                    <Label htmlFor="editPatientNo">Patient No (Optional)</Label>
                    <Input
                      id="editPatientNo"
                      value={editFormData.patientNo}
                      onChange={(e) => setEditFormData({ ...editFormData, patientNo: e.target.value })}
                      placeholder="Optional manual patient number"
                    />
                  </div>

                  {/* Row 2: PatientType, LastName */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="editPatientType">Patient Type</Label>
                      <select
                        id="editPatientType"
                        aria-label="Patient Type"
                        className="w-full px-3 py-2 border border-gray-200 rounded-md"
                        value={editFormData.patientType}
                        onChange={(e) => setEditFormData({ ...editFormData, patientType: e.target.value })}
                      >
                        <option value="">Select type</option>
                        <option value="OPD">OPD</option>
                        <option value="IPD">IPD</option>
                        <option value="Emergency">Emergency</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="editLastName">Last Name</Label>
                      <Input
                        id="editLastName"
                        value={editFormData.lastName}
                        onChange={(e) => setEditFormData({ ...editFormData, lastName: e.target.value })}
                        placeholder="Enter patient's last name"
                      />
                    </div>
                  </div>

                  {/* Row 3: AdhaarID (highlighted), PANCard */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="editAdhaarID" className="flex items-center gap-2">
                        Adhaar ID
                        <span className="text-xs text-orange-500">(Important)</span>
                      </Label>
                      <Input
                        id="editAdhaarID"
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={editFormData.adhaarID}
                        onChange={(e) => {
                          const numericValue = e.target.value.replace(/\D/g, '');
                          const limitedValue = numericValue.slice(0, 12);
                          setEditFormData({ ...editFormData, adhaarID: limitedValue });
                          if (limitedValue && limitedValue.length !== 12) {
                            setEditAdhaarError('Aadhaar ID must be exactly 12 digits');
                          } else {
                            setEditAdhaarError('');
                          }
                        }}
                        placeholder="Enter 12-digit Aadhaar number"
                        maxLength={12}
                        className={`bg-orange-50 border-orange-200 ${editAdhaarError ? 'border-red-300' : ''}`}
                      />
                      {editAdhaarError && (
                        <p className="text-sm text-red-600 mt-1">{editAdhaarError}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="editPANCard">PAN Card</Label>
                      <Input
                        id="editPANCard"
                        value={editFormData.panCard}
                        onChange={(e) => setEditFormData({ ...editFormData, panCard: e.target.value.toUpperCase() })}
                        placeholder="Enter PAN number"
                        maxLength={10}
                      />
                    </div>
                  </div>

                  {/* Row 4: PhoneNo, Gender */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="editPhoneNo">Phone No *</Label>
                      <Input
                        id="editPhoneNo"
                        required
                        type="tel"
                        value={editFormData.phoneNo}
                        onChange={(e) => setEditFormData({ ...editFormData, phoneNo: e.target.value })}
                        placeholder="Enter phone number"
                      />
                    </div>
                    <div>
                      <Label htmlFor="editGender">Gender *</Label>
                      <select
                        id="editGender"
                        aria-label="Gender"
                        required
                        className="w-full px-3 py-2 border border-gray-200 rounded-md"
                        value={editFormData.gender}
                        onChange={(e) => setEditFormData({ ...editFormData, gender: e.target.value })}
                      >
                        <option value="">Select gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  {/* Row 5: Age, Address */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="editAge">Age *</Label>
                      <Input
                        id="editAge"
                        required
                        type="number"
                        min="0"
                        max="150"
                        value={editFormData.age}
                        onChange={(e) => setEditFormData({ ...editFormData, age: e.target.value })}
                        placeholder="Enter age"
                      />
                    </div>
                    <div>
                      <Label htmlFor="editAddress">Address</Label>
                      <Input
                        id="editAddress"
                        value={editFormData.address}
                        onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                        placeholder="Enter address"
                      />
                    </div>
                  </div>

                  {/* Row 6: ChiefComplaint */}
                  <div>
                    <Label htmlFor="editChiefComplaint">Chief Complaint</Label>
                    <Input
                      id="editChiefComplaint"
                      value={editFormData.chiefComplaint}
                      onChange={(e) => setEditFormData({ ...editFormData, chiefComplaint: e.target.value })}
                      placeholder="Enter chief complaint"
                    />
                  </div>

                  {/* Row 7: Description */}
                  <div>
                    <Label htmlFor="editDescription">Description</Label>
                    <textarea
                      id="editDescription"
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-200 rounded-md resize-none"
                      value={editFormData.description}
                      onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                      placeholder="Enter additional description or notes"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-4 border-t">
                    <Button 
                      type="button"
                      variant="outline" 
                      onClick={handleCancelEdit}
                      disabled={updatingPatient}
                      className="py-1"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit"
                      disabled={updatingPatient} 
                      className="py-1"
                    >
                      {updatingPatient ? 'Updating...' : 'Update Patient'}
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <p className="text-lg">No patient data available for editing</p>
                </div>
              )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

