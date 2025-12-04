// Patient Registration Component - Separated UI from logic
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { usePatients } from '../hooks';
import { patientsApi } from '../api';
import { UserPlus, CheckCircle2, Plus, Eye, Pencil } from 'lucide-react';
import { Patient } from '../types';

export function PatientRegistration() {
  const { patients, createPatient, loading, error, fetchPatients } = usePatients();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [adhaarError, setAdhaarError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [loadingPatientDetails, setLoadingPatientDetails] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<any>(null);
  const [loadingEditPatient, setLoadingEditPatient] = useState(false);
  const [editFormData, setEditFormData] = useState<any>(null);
  const [updatingPatient, setUpdatingPatient] = useState(false);
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
    status: 'Active',
    registeredBy: 'Admin User', // This could come from auth context
    registeredDate: new Date().toISOString().split('T')[0],
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
        status: formData.status || undefined,
        registeredBy: formData.registeredBy || undefined,
        registeredDate: formData.registeredDate || undefined,
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
          status: 'Active',
          registeredBy: 'Admin User',
          registeredDate: new Date().toISOString().split('T')[0],
        });
        setAdhaarError('');
        setIsSubmitted(false);
        setShowForm(false);
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
      alert('Aadhaar ID must be exactly 12 digits.');
      return;
    }

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

  if (isSubmitted) {
    return (
      <div className="p-8 bg-blue-100 min-h-full">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <CheckCircle2 className="size-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Patient Registered Successfully!</h2>
              <p className="text-gray-500">The patient details have been saved.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showForm) {
    return (
      <div className="p-8 bg-blue-100 min-h-full">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <UserPlus className="size-6 text-blue-600" />
                <CardTitle className="text-2xl">Patient Registration</CardTitle>
              </div>
              <Button variant="outline" onClick={() => setShowForm(false)}>
                Back to List
              </Button>
            </div>
          </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                {error}
              </div>
            )}

            {/* Row 1: PatientId (Auto-generated), PatientName */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="patientId">Patient ID</Label>
                <Input
                  id="patientId"
                  value="Auto-generated on save"
                  disabled
                  className="bg-gray-50 text-gray-500"
                />
                <p className="text-xs text-gray-500 mt-1">Unique Patient ID will be auto-generated</p>
              </div>
              <div>
                <Label htmlFor="patientName">Patient Name *</Label>
                <Input
                  id="patientName"
                  required
                  value={formData.patientName}
                  onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                  placeholder="Enter patient's first name"
                />
              </div>
            </div>

            {/* Row 1.5: PatientNo */}
            <div>
              <Label htmlFor="patientNo">Patient No (Optional)</Label>
              <Input
                id="patientNo"
                value={formData.patientNo}
                onChange={(e) => setFormData({ ...formData, patientNo: e.target.value })}
                placeholder="Optional manual patient number"
              />
            </div>

            {/* Row 2: PatientType, LastName */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="patientType">Patient Type</Label>
                <select
                  id="patientType"
                  aria-label="Patient Type"
                  className="w-full px-3 py-2 border border-gray-200 rounded-md"
                  value={formData.patientType}
                  onChange={(e) => setFormData({ ...formData, patientType: e.target.value })}
                >
                  <option value="">Select type</option>
                  <option value="OPD">OPD</option>
                  <option value="IPD">IPD</option>
                  <option value="Emergency">Emergency</option>
                  <option value="Follow-up">Follow-up</option>
                </select>
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  placeholder="Enter patient's last name"
                />
              </div>
            </div>

            {/* Row 3: AdhaarID (highlighted), PANCard */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="adhaarID" className="flex items-center gap-2">
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
                  className={`bg-orange-50 border-orange-200 ${adhaarError ? 'border-red-300' : ''}`}
                />
                {adhaarError && (
                  <p className="text-sm text-red-600 mt-1">{adhaarError}</p>
                )}
              </div>
              <div>
                <Label htmlFor="panCard">PAN Card</Label>
                <Input
                  id="panCard"
                  value={formData.panCard}
                  onChange={(e) => setFormData({ ...formData, panCard: e.target.value.toUpperCase() })}
                  placeholder="Enter PAN number"
                  maxLength={10}
                />
              </div>
            </div>

            {/* Row 4: PhoneNo, Gender */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phoneNo">Phone No *</Label>
                <Input
                  id="phoneNo"
                  required
                  type="tel"
                  value={formData.phoneNo}
                  onChange={(e) => setFormData({ ...formData, phoneNo: e.target.value })}
                  placeholder="Enter phone number"
                />
              </div>
              <div>
                <Label htmlFor="gender">Gender *</Label>
                <select
                  id="gender"
                  aria-label="Gender"
                  required
                  className="w-full px-3 py-2 border border-gray-200 rounded-md"
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
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
                <Label htmlFor="age">Age *</Label>
                <Input
                  id="age"
                  required
                  type="number"
                  min="0"
                  max="150"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  placeholder="Enter age"
                />
              </div>
              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Enter address"
                />
              </div>
            </div>

            {/* Row 6: ChiefComplaint */}
            <div>
              <Label htmlFor="chiefComplaint">Chief Complaint</Label>
              <Input
                id="chiefComplaint"
                value={formData.chiefComplaint}
                onChange={(e) => setFormData({ ...formData, chiefComplaint: e.target.value })}
                placeholder="Enter chief complaint"
              />
            </div>

            {/* Row 7: Description */}
            <div>
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                rows={4}
                className="w-full px-3 py-2 border border-gray-200 rounded-md resize-none"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter additional description or notes"
              />
            </div>

            {/* Row 8: Status, RegisteredBy, RegisteredDate */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  aria-label="Status"
                  className="w-full px-3 py-2 border border-gray-200 rounded-md"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Discharged">Discharged</option>
                </select>
              </div>
              <div>
                <Label htmlFor="registeredBy">Registered By</Label>
                <Input
                  id="registeredBy"
                  value={formData.registeredBy}
                  onChange={(e) => setFormData({ ...formData, registeredBy: e.target.value })}
                  placeholder="Registered by"
                />
              </div>
              <div>
                <Label htmlFor="registeredDate">Registered Date</Label>
                <Input
                  id="registeredDate"
                  type="date"
                  value={formData.registeredDate}
                  onChange={(e) => setFormData({ ...formData, registeredDate: e.target.value })}
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-4 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
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
                    status: 'Active',
                    registeredBy: 'Admin User',
                    registeredDate: new Date().toISOString().split('T')[0],
                  });
                  setAdhaarError('');
                }}
              >
                Reset
              </Button>
              <Button type="submit" disabled={loading} className="gap-2">
                <UserPlus className="size-4" />
                {loading ? 'Registering...' : 'Register Patient'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
    );
  }

  return (
    <div className="p-8 bg-blue-100 min-h-full">
      <Card className="max-w-6xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <UserPlus className="size-6 text-blue-600" />
              <CardTitle className="text-2xl">Patient Registration</CardTitle>
            </div>
            <Button className="gap-2" onClick={() => setShowForm(true)}>
              <Plus className="size-4" />
              Add New Patient
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12 text-blue-600">Loading patients...</div>
          ) : error ? (
            <div className="text-center py-12 text-red-500">Error: {error}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Patient ID</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Patient No</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Patient Name</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Type</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Age</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Gender</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Phone No</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Aadhaar ID</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Chief Complaint</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Registered Date</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 w-32">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {patients.length === 0 ? (
                    <tr>
                      <td colSpan={12} className="text-center py-8 text-gray-500">
                        No patients found. Click "Add New Patient" to register a new patient.
                      </td>
                    </tr>
                  ) : (
                    patients.map((patient, index) => {
                      // Use patientId as primary key, fallback to id, then index
                      const uniqueKey = patient.patientId || patient.PatientId || patient.id || `patient-${index}`;
                      return (
                      <tr key={uniqueKey} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm text-gray-900 font-mono font-medium whitespace-nowrap">{patient.patientId || '-'}</td>
                        <td className="py-3 px-4 text-sm text-gray-900 font-mono font-medium whitespace-nowrap">{patient.patientNo || '-'}</td>
                        <td className="py-3 px-4 text-sm text-gray-900 font-medium">
                          {patient.patientName} {patient.lastName || ''}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-700">
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                            {patient.patientType || 'N/A'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-700">{patient.age}</td>
                        <td className="py-3 px-4 text-sm text-gray-700">{patient.gender}</td>
                        <td className="py-3 px-4 text-sm text-gray-700">{patient.phoneNo || patient.phone || '-'}</td>
                        <td className="py-3 px-4 text-sm text-gray-700 font-mono">{patient.adhaarID || '-'}</td>
                        <td className="py-3 px-4 text-sm text-gray-700 max-w-xs truncate" title={patient.chiefComplaint || patient.condition}>
                          {patient.chiefComplaint || patient.condition || '-'}
                        </td>
                        <td className="py-3 px-4 text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            patient.status === 'Active' ? 'bg-green-100 text-green-700' :
                            patient.status === 'Inactive' ? 'bg-gray-100 text-gray-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {patient.status || 'Active'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-500">
                          {patient.registeredDate ? new Date(patient.registeredDate).toLocaleDateString() : '-'}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="h-8 w-8 p-0 border-blue-200 hover:bg-blue-50 hover:border-blue-300"
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
                              <Eye className="size-4 text-blue-600" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="h-8 w-8 p-0 border-green-200 hover:bg-green-50 hover:border-green-300"
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
                              <Pencil className="size-4 text-green-600" />
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
          )}
        </CardContent>
      </Card>

      {/* Patient Details Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-3xl p-0 gap-0">
          <div className="flex flex-col h-[70vh] max-h-[70vh] overflow-hidden">
            <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-200 flex-shrink-0 bg-white">
              <DialogTitle className="flex items-center gap-2">
                <UserPlus className="size-5" />
                Patient Details
              </DialogTitle>
              <DialogDescription>
                View complete patient information
              </DialogDescription>
            </DialogHeader>
            
            <div className="flex-1 overflow-y-auto px-6 py-4">
            {loadingPatientDetails ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-blue-600">Loading patient details...</p>
                </div>
              </div>
            ) : selectedPatient ? (
              <div className="grid grid-cols-2 gap-4">
              {/* Patient ID - Read Only */}
              <div>
                <Label className="text-xs text-gray-500">Patient ID</Label>
                <p className="text-sm font-mono font-medium">{selectedPatient.patientId || '-'}</p>
              </div>
              
              {/* Patient No */}
              <div>
                <Label className="text-xs text-gray-500">Patient No</Label>
                <p className="text-sm font-mono font-medium">{selectedPatient.patientNo || '-'}</p>
              </div>
              
              {/* Patient Name */}
              <div>
                <Label className="text-xs text-gray-500">Patient Name</Label>
                <p className="text-sm font-medium">{selectedPatient.patientName || '-'}</p>
              </div>
              
              {/* Last Name */}
              <div>
                <Label className="text-xs text-gray-500">Last Name</Label>
                <p className="text-sm">{selectedPatient.lastName || '-'}</p>
              </div>
              
              {/* Patient Type */}
              <div>
                <Label className="text-xs text-gray-500">Patient Type</Label>
                <p className="text-sm">
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                    {selectedPatient.patientType || 'N/A'}
                  </span>
                </p>
              </div>
              
              {/* Status */}
              <div>
                <Label className="text-xs text-gray-500">Status</Label>
                <p className="text-sm">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    selectedPatient.status === 'Active' ? 'bg-green-100 text-green-700' :
                    selectedPatient.status === 'Inactive' ? 'bg-gray-100 text-gray-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {selectedPatient.status || 'Active'}
                  </span>
                </p>
              </div>
              
              {/* Age */}
              <div>
                <Label className="text-xs text-gray-500">Age</Label>
                <p className="text-sm">{selectedPatient.age || '-'}</p>
              </div>
              
              {/* Gender */}
              <div>
                <Label className="text-xs text-gray-500">Gender</Label>
                <p className="text-sm">{selectedPatient.gender || '-'}</p>
              </div>
              
              {/* Phone No */}
              <div>
                <Label className="text-xs text-gray-500">Phone No</Label>
                <p className="text-sm">{selectedPatient.phoneNo || '-'}</p>
              </div>
              
              {/* Aadhaar ID */}
              <div>
                <Label className="text-xs text-gray-500">Aadhaar ID</Label>
                <p className="text-sm font-mono">{selectedPatient.adhaarID || '-'}</p>
              </div>
              
              {/* PAN Card */}
              <div>
                <Label className="text-xs text-gray-500">PAN Card</Label>
                <p className="text-sm font-mono">{selectedPatient.panCard || '-'}</p>
              </div>
              
              {/* Registered Date */}
              <div>
                <Label className="text-xs text-gray-500">Registered Date</Label>
                <p className="text-sm">
                  {selectedPatient.registeredDate 
                    ? new Date(selectedPatient.registeredDate).toLocaleDateString() 
                    : '-'}
                </p>
              </div>
              
              {/* Address */}
              <div className="col-span-2">
                <Label className="text-xs text-gray-500">Address</Label>
                <p className="text-sm">{selectedPatient.address || '-'}</p>
              </div>
              
              {/* Chief Complaint */}
              <div className="col-span-2">
                <Label className="text-xs text-gray-500">Chief Complaint</Label>
                <p className="text-sm">{selectedPatient.chiefComplaint || '-'}</p>
              </div>
              
              {/* Description */}
              <div className="col-span-2">
                <Label className="text-xs text-gray-500">Description</Label>
                <p className="text-sm whitespace-pre-wrap">{selectedPatient.description || '-'}</p>
              </div>
              
              {/* Registered By */}
              <div>
                <Label className="text-xs text-gray-500">Registered By</Label>
                <p className="text-sm">{selectedPatient.registeredBy || '-'}</p>
              </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No patient details available
              </div>
            )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Patient Details Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-3xl p-0 gap-0">
          <div className="flex flex-col h-[70vh] max-h-[70vh] overflow-hidden">
            <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-200 flex-shrink-0 bg-white">
              <DialogTitle className="flex items-center gap-2">
                <Pencil className="size-5" />
                Edit Patient Details
              </DialogTitle>
              <DialogDescription>
                Modify patient information
              </DialogDescription>
            </DialogHeader>
            
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {loadingEditPatient ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-blue-600">Loading patient details...</p>
                  </div>
                </div>
              ) : editingPatient && editFormData ? (
                <form onSubmit={(e) => { e.preventDefault(); handleUpdatePatient(); }} className="grid grid-cols-2 gap-4">
                  {/* Patient ID (Read-only) */}
                  <div>
                    <Label className="text-xs text-gray-500">Patient ID</Label>
                    <p className="text-sm font-mono font-medium">{editingPatient.patientId || '-'}</p>
                  </div>
                  
                  {/* Patient No */}
                  <div>
                    <Label htmlFor="editPatientNo">Patient No</Label>
                    <Input
                      id="editPatientNo"
                      value={editFormData.patientNo}
                      onChange={(e) => setEditFormData({ ...editFormData, patientNo: e.target.value })}
                      placeholder="Enter patient number"
                    />
                  </div>
                  
                  {/* Patient Name */}
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
                  
                  {/* Last Name */}
                  <div>
                    <Label htmlFor="editLastName">Last Name</Label>
                    <Input
                      id="editLastName"
                      value={editFormData.lastName}
                      onChange={(e) => setEditFormData({ ...editFormData, lastName: e.target.value })}
                      placeholder="Enter patient's last name"
                    />
                  </div>
                  
                  {/* Patient Type */}
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
                      <option value="Follow-up">Follow-up</option>
                    </select>
                  </div>
                  
                  {/* Status */}
                  <div>
                    <Label htmlFor="editStatus">Status</Label>
                    <select
                      id="editStatus"
                      aria-label="Status"
                      className="w-full px-3 py-2 border border-gray-200 rounded-md"
                      value={editFormData.status}
                      onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                      <option value="Discharged">Discharged</option>
                    </select>
                  </div>
                  
                  {/* Age */}
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
                  
                  {/* Gender */}
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
                  
                  {/* Phone No */}
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
                  
                  {/* Aadhaar ID */}
                  <div>
                    <Label htmlFor="editAdhaarID">Aadhaar ID</Label>
                    <Input
                      id="editAdhaarID"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={editFormData.adhaarID}
                      onChange={(e) => setEditFormData({ ...editFormData, adhaarID: e.target.value.replace(/\D/g, '').slice(0, 12) })}
                      placeholder="Enter 12-digit Aadhaar number"
                      maxLength={12}
                    />
                  </div>
                  
                  {/* PAN Card */}
                  <div>
                    <Label htmlFor="editPANCard">PAN Card</Label>
                    <Input
                      id="editPANCard"
                      value={editFormData.panCard}
                      onChange={(e) => setEditFormData({ ...editFormData, panCard: e.target.value.toUpperCase().slice(0, 10) })}
                      placeholder="Enter PAN number"
                      maxLength={10}
                    />
                  </div>
                  
                  {/* Registered Date */}
                  <div>
                    <Label htmlFor="editRegisteredDate">Registered Date</Label>
                    <Input
                      id="editRegisteredDate"
                      type="date"
                      value={editFormData.registeredDate}
                      onChange={(e) => setEditFormData({ ...editFormData, registeredDate: e.target.value })}
                    />
                  </div>
                  
                  {/* Address */}
                  <div className="col-span-2">
                    <Label htmlFor="editAddress">Address</Label>
                    <Input
                      id="editAddress"
                      value={editFormData.address}
                      onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                      placeholder="Enter address"
                    />
                  </div>
                  
                  {/* Chief Complaint */}
                  <div className="col-span-2">
                    <Label htmlFor="editChiefComplaint">Chief Complaint</Label>
                    <Input
                      id="editChiefComplaint"
                      value={editFormData.chiefComplaint}
                      onChange={(e) => setEditFormData({ ...editFormData, chiefComplaint: e.target.value })}
                      placeholder="Enter chief complaint"
                    />
                  </div>
                  
                  {/* Description */}
                  <div className="col-span-2">
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
                  
                  {/* Registered By */}
                  <div>
                    <Label htmlFor="editRegisteredBy">Registered By</Label>
                    <Input
                      id="editRegisteredBy"
                      value={editFormData.registeredBy}
                      onChange={(e) => setEditFormData({ ...editFormData, registeredBy: e.target.value })}
                      placeholder="Registered by"
                    />
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="col-span-2 flex justify-end gap-2 pt-4 border-t">
                    <Button type="button" variant="outline" onClick={handleCancelEdit} disabled={updatingPatient}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={updatingPatient}>
                      {updatingPatient ? 'Updating...' : 'Update Patient'}
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No patient data available for editing
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

