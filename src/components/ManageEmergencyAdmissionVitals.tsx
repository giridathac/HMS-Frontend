import React, { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { ArrowLeft } from 'lucide-react';
import { emergencyAdmissionVitalsApi, UpdateEmergencyAdmissionVitalsDto } from '../api/emergencyAdmissions';
import { EmergencyAdmissionVitals } from '../types';
import { useStaff } from '../hooks/useStaff';
import { useRoles } from '../hooks/useRoles';
import { formatDateTimeIST } from '../utils/timeUtils';

export function ManageEmergencyAdmissionVitals() {
  const [vitals, setVitals] = useState<EmergencyAdmissionVitals | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const { staff } = useStaff();
  const { roles } = useRoles();
  
  const [formData, setFormData] = useState({
    nurseId: 0,
    recordedDateTime: '',
    heartRate: undefined as number | undefined,
    bloodPressure: '',
    temperature: undefined as number | undefined,
    o2Saturation: undefined as number | undefined,
    respiratoryRate: undefined as number | undefined,
    pulseRate: undefined as number | undefined,
    vitalsStatus: 'Stable' as 'Critical' | 'Stable',
    vitalsRemarks: '',
  });

  useEffect(() => {
    // Get parameters from URL hash
    const hash = window.location.hash.slice(1);
    const params = new URLSearchParams(hash.split('?')[1] || '');
    const emergencyAdmissionId = params.get('emergencyAdmissionId');
    const vitalsId = params.get('vitalsId');
    
    if (emergencyAdmissionId && vitalsId) {
      fetchVitalsDetails(Number(emergencyAdmissionId), Number(vitalsId));
    } else {
      setError('Emergency Admission ID or Vitals ID is missing from URL');
      setLoading(false);
    }
  }, []);

  const fetchVitalsDetails = async (emergencyAdmissionId: number, vitalsId: number) => {
    setLoading(true);
    try {
      const vitalsData = await emergencyAdmissionVitalsApi.getById(emergencyAdmissionId, vitalsId);
      setVitals(vitalsData);
      setFormData({
        nurseId: vitalsData.nurseId,
        recordedDateTime: new Date(vitalsData.recordedDateTime).toISOString().slice(0, 16),
        heartRate: vitalsData.heartRate,
        bloodPressure: vitalsData.bloodPressure || '',
        temperature: vitalsData.temperature,
        o2Saturation: vitalsData.o2Saturation,
        respiratoryRate: vitalsData.respiratoryRate,
        pulseRate: vitalsData.pulseRate,
        vitalsStatus: vitalsData.vitalsStatus,
        vitalsRemarks: vitalsData.vitalsRemarks || '',
      });
    } catch (err) {
      console.error('Error fetching vitals:', err);
      setError('Failed to load vitals record. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!vitals) return;
    
    if (!formData.nurseId || !formData.recordedDateTime) {
      alert('Please fill in all required fields (Nurse, Recorded Date & Time).');
      return;
    }

    try {
      const hash = window.location.hash.slice(1);
      const params = new URLSearchParams(hash.split('?')[1] || '');
      const emergencyAdmissionId = params.get('emergencyAdmissionId');
      
      if (!emergencyAdmissionId) {
        alert('Emergency Admission ID is missing.');
        return;
      }

      const updateData: UpdateEmergencyAdmissionVitalsDto = {
        nurseId: formData.nurseId,
        recordedDateTime: formData.recordedDateTime,
        heartRate: formData.heartRate,
        bloodPressure: formData.bloodPressure || undefined,
        temperature: formData.temperature,
        o2Saturation: formData.o2Saturation,
        respiratoryRate: formData.respiratoryRate,
        pulseRate: formData.pulseRate,
        vitalsStatus: formData.vitalsStatus,
        vitalsRemarks: formData.vitalsRemarks || undefined,
      };

      await emergencyAdmissionVitalsApi.update(Number(emergencyAdmissionId), vitals.emergencyAdmissionVitalsId, updateData);
      
      // Refresh the data
      await fetchVitalsDetails(Number(emergencyAdmissionId), vitals.emergencyAdmissionVitalsId);
      setIsEditMode(false);
      alert('Vitals record updated successfully!');
    } catch (err) {
      console.error('Error updating vitals:', err);
      alert('Failed to update vitals record. Please try again.');
    }
  };

  const handleBack = () => {
    // Navigate back to emergency admission management
    window.location.hash = '#emergencyadmission';
  };

  if (loading) {
    return (
      <div className="flex-1 bg-gray-50 flex flex-col overflow-hidden min-h-0">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-blue-600">Loading vitals record...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 bg-gray-50 flex flex-col overflow-hidden min-h-0">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={handleBack} variant="outline">
              <ArrowLeft className="size-4 mr-2" />
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!vitals) {
    return (
      <div className="flex-1 bg-gray-50 flex flex-col overflow-hidden min-h-0">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <p className="text-gray-600 mb-4">Vitals record not found.</p>
            <Button onClick={handleBack} variant="outline">
              <ArrowLeft className="size-4 mr-2" />
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gray-50 flex flex-col overflow-hidden min-h-0">
      <div className="px-6 pt-6 pb-0 flex-shrink-0">
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={handleBack}>
              <ArrowLeft className="size-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-gray-900 mb-2 text-2xl">Vitals Record</h1>
              <p className="text-gray-500 text-base">View and manage emergency admission vitals</p>
            </div>
          </div>
          {!isEditMode && (
            <Button onClick={() => setIsEditMode(true)}>
              Edit Vitals
            </Button>
          )}
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-6 pt-4 pb-4">
        <Card className="bg-white border border-gray-200 shadow-sm rounded-lg">
          <CardContent className="p-6">
            {isEditMode ? (
              <div className="space-y-4">
                <div>
                  <Label>Vitals ID</Label>
                  <Input value={vitals.emergencyAdmissionVitalsId} disabled className="bg-gray-50 text-gray-700" />
                </div>
                
                <div>
                  <Label htmlFor="edit-nurseId">Nurse *</Label>
                  <select
                    id="edit-nurseId"
                    aria-label="Nurse"
                    className="w-full px-3 py-2 border border-gray-200 rounded-md"
                    value={formData.nurseId}
                    onChange={(e) => setFormData({ ...formData, nurseId: Number(e.target.value) })}
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
                  <Label htmlFor="edit-recordedDateTime">Recorded Date & Time *</Label>
                  <Input
                    id="edit-recordedDateTime"
                    type="datetime-local"
                    value={formData.recordedDateTime}
                    onChange={(e) => setFormData({ ...formData, recordedDateTime: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-heartRate">Heart Rate (bpm)</Label>
                    <Input
                      id="edit-heartRate"
                      type="number"
                      placeholder="e.g., 72"
                      value={formData.heartRate || ''}
                      onChange={(e) => setFormData({ ...formData, heartRate: e.target.value ? Number(e.target.value) : undefined })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-bloodPressure">Blood Pressure</Label>
                    <Input
                      id="edit-bloodPressure"
                      placeholder="e.g., 120/80"
                      value={formData.bloodPressure}
                      onChange={(e) => setFormData({ ...formData, bloodPressure: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-temperature">Temperature (°C)</Label>
                    <Input
                      id="edit-temperature"
                      type="number"
                      step="0.1"
                      placeholder="e.g., 36.5"
                      value={formData.temperature || ''}
                      onChange={(e) => setFormData({ ...formData, temperature: e.target.value ? Number(e.target.value) : undefined })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-o2Saturation">O2 Saturation (%)</Label>
                    <Input
                      id="edit-o2Saturation"
                      type="number"
                      placeholder="e.g., 98"
                      value={formData.o2Saturation || ''}
                      onChange={(e) => setFormData({ ...formData, o2Saturation: e.target.value ? Number(e.target.value) : undefined })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-respiratoryRate">Respiratory Rate</Label>
                    <Input
                      id="edit-respiratoryRate"
                      type="number"
                      placeholder="e.g., 16"
                      value={formData.respiratoryRate || ''}
                      onChange={(e) => setFormData({ ...formData, respiratoryRate: e.target.value ? Number(e.target.value) : undefined })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-pulseRate">Pulse Rate (bpm)</Label>
                    <Input
                      id="edit-pulseRate"
                      type="number"
                      placeholder="e.g., 72"
                      value={formData.pulseRate || ''}
                      onChange={(e) => setFormData({ ...formData, pulseRate: e.target.value ? Number(e.target.value) : undefined })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="edit-vitalsStatus">Vitals Status *</Label>
                  <select
                    id="edit-vitalsStatus"
                    aria-label="Vitals Status"
                    className="w-full px-3 py-2 border border-gray-200 rounded-md"
                    value={formData.vitalsStatus}
                    onChange={(e) => setFormData({ ...formData, vitalsStatus: e.target.value as 'Critical' | 'Stable' })}
                  >
                    <option value="Stable">Stable</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="edit-vitalsRemarks">Remarks</Label>
                  <Textarea
                    id="edit-vitalsRemarks"
                    placeholder="Enter any remarks or notes..."
                    value={formData.vitalsRemarks}
                    onChange={(e) => setFormData({ ...formData, vitalsRemarks: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setIsEditMode(false)}>Cancel</Button>
                  <Button onClick={handleUpdate}>Update Vitals Record</Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <Label>Vitals ID</Label>
                  <Input value={vitals.emergencyAdmissionVitalsId} disabled className="bg-gray-50 text-gray-700" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Nurse</Label>
                    <Input
                      value={vitals.nurseName || `ID: ${vitals.nurseId}`}
                      disabled
                      className="bg-gray-50 text-gray-700"
                    />
                  </div>
                  <div>
                    <Label>Recorded Date & Time</Label>
                    <Input
                      value={formatDateTimeIST(vitals.recordedDateTime)}
                      disabled
                      className="bg-gray-50 text-gray-700"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {vitals.heartRate !== undefined && (
                    <div>
                      <Label>Heart Rate (bpm)</Label>
                      <Input value={vitals.heartRate} disabled className="bg-gray-50 text-gray-700" />
                    </div>
                  )}
                  {vitals.bloodPressure && (
                    <div>
                      <Label>Blood Pressure</Label>
                      <Input value={vitals.bloodPressure} disabled className="bg-gray-50 text-gray-700" />
                    </div>
                  )}
                  {vitals.temperature !== undefined && (
                    <div>
                      <Label>Temperature (°C)</Label>
                      <Input value={vitals.temperature} disabled className="bg-gray-50 text-gray-700" />
                    </div>
                  )}
                  {vitals.o2Saturation !== undefined && (
                    <div>
                      <Label>O2 Saturation (%)</Label>
                      <Input value={vitals.o2Saturation} disabled className="bg-gray-50 text-gray-700" />
                    </div>
                  )}
                  {vitals.respiratoryRate !== undefined && (
                    <div>
                      <Label>Respiratory Rate</Label>
                      <Input value={vitals.respiratoryRate} disabled className="bg-gray-50 text-gray-700" />
                    </div>
                  )}
                  {vitals.pulseRate !== undefined && (
                    <div>
                      <Label>Pulse Rate (bpm)</Label>
                      <Input value={vitals.pulseRate} disabled className="bg-gray-50 text-gray-700" />
                    </div>
                  )}
                </div>

                <div>
                  <Label>Vitals Status</Label>
                  <Input value={vitals.vitalsStatus} disabled className="bg-gray-50 text-gray-700" />
                </div>

                {vitals.vitalsRemarks && (
                  <div>
                    <Label>Remarks</Label>
                    <Textarea
                      value={vitals.vitalsRemarks}
                      disabled
                      className="bg-gray-50 text-gray-700"
                      rows={3}
                    />
                  </div>
                )}

                {vitals.vitalsCreatedAt && (
                  <div>
                    <Label>Created At</Label>
                    <Input
                      value={formatDateTimeIST(vitals.vitalsCreatedAt)}
                      disabled
                      className="bg-gray-50 text-gray-700"
                    />
                  </div>
                )}

                {vitals.createdByName && (
                  <div>
                    <Label>Created By</Label>
                    <Input value={vitals.createdByName} disabled className="bg-gray-50 text-gray-700" />
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
