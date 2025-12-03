// Patient Registration Component - Separated UI from logic
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { usePatients } from '../hooks';
import { UserPlus, CheckCircle2, Plus, Eye } from 'lucide-react';
import { Patient } from '../types';

export function PatientRegistration() {
  const { patients, createPatient, loading, error, fetchPatients } = usePatients();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [adhaarError, setAdhaarError] = useState('');
  const [showForm, setShowForm] = useState(false);
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
    fetchPatients();
  }, [fetchPatients]);

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
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Actions</th>
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
                    patients.map((patient) => (
                      <tr key={patient.id} className="border-b border-gray-100 hover:bg-gray-50">
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
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Eye className="size-4" />
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

