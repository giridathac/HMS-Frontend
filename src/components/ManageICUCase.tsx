import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { FlaskConical, Stethoscope, Heart, ArrowLeft, Activity, FileText } from 'lucide-react';
import { admissionsApi } from '../api/admissions';
import { PatientLabTest, PatientDoctorVisit, PatientNurseVisit } from '../api/admissions';
import { apiRequest } from '../api/base';

interface ICUAdmission {
  id?: number;
  patientICUAdmissionId?: number;
  patientId?: string;
  patientName?: string;
  age?: number;
  gender?: string;
  bedNumber?: string;
  admissionDate?: string;
  admissionTime?: string;
  condition?: string;
  severity?: string;
  attendingDoctor?: string;
  diagnosis?: string;
  treatment?: string;
  ventilatorSupport?: boolean;
  vitals?: {
    heartRate?: number;
    bloodPressure?: string;
    temperature?: number;
    oxygenSaturation?: number;
    respiratoryRate?: number;
  };
}

export function ManageICUCase() {
  const [icuAdmission, setIcuAdmission] = useState<ICUAdmission | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [patientLabTests, setPatientLabTests] = useState<PatientLabTest[]>([]);
  const [labTestsLoading, setLabTestsLoading] = useState(false);
  const [labTestsError, setLabTestsError] = useState<string | null>(null);
  const [patientDoctorVisits, setPatientDoctorVisits] = useState<PatientDoctorVisit[]>([]);
  const [doctorVisitsLoading, setDoctorVisitsLoading] = useState(false);
  const [doctorVisitsError, setDoctorVisitsError] = useState<string | null>(null);
  const [patientNurseVisits, setPatientNurseVisits] = useState<PatientNurseVisit[]>([]);
  const [nurseVisitsLoading, setNurseVisitsLoading] = useState(false);
  const [nurseVisitsError, setNurseVisitsError] = useState<string | null>(null);

  useEffect(() => {
    // Get patientICUAdmissionId from URL hash parameters (should be a UUID string)
    console.log('========================================');
    console.log('ManageICUCase: useEffect triggered');
    console.log('Current window.location.hash:', window.location.hash);
    
    const hash = window.location.hash.slice(1);
    console.log('Hash after slice(1):', hash);
    
    const params = new URLSearchParams(hash.split('?')[1] || '');
    console.log('URL Parameters:', Object.fromEntries(params.entries()));
    
    const patientICUAdmissionId = params.get('patientICUAdmissionId') || params.get('id');
    console.log('Extracted patientICUAdmissionId:', patientICUAdmissionId);
    console.log('========================================');
    
    if (patientICUAdmissionId) {
      // Pass as string (UUID) - don't convert to number
      console.log('Calling fetchICUAdmissionDetails with ID:', patientICUAdmissionId);
      fetchICUAdmissionDetails(patientICUAdmissionId);
    } else {
      console.error('Patient ICU Admission ID is missing from URL');
      setError('Patient ICU Admission ID is missing from URL');
      setLoading(false);
    }
  }, []);

  const fetchICUAdmissionDetails = async (patientICUAdmissionId: string) => {
    try {
      setLoading(true);
      setError(null);
      console.log('========================================');
      console.log('ManageICUCase: fetchICUAdmissionDetails called');
      console.log('Patient ICU Admission ID (UUID):', patientICUAdmissionId);
      console.log('API Endpoint:', `/patient-icu-admissions/icu-management/${patientICUAdmissionId}`);
      console.log('========================================');
      
      let admission: any = null;
      
      // Try to fetch from the specific endpoint first
      try {
        console.log('Making API request to:', `/patient-icu-admissions/icu-management/${patientICUAdmissionId}`);
        const apiUrl = `/patient-icu-admissions/icu-management/${patientICUAdmissionId}`;
        console.log('Full API URL:', apiUrl);
        
        const response = await apiRequest<any>(apiUrl);
        console.log('ICU admission details API response received');
        console.log('Response type:', typeof response);
        console.log('Response (RAW):', JSON.stringify(response, null, 2));
        
        // Handle different response structures: { data: {...} } or direct object
        admission = response?.data || response;
        
        if (!admission) {
          throw new Error('ICU admission not found in response');
        }
      } catch (endpointError: any) {
        console.warn('Error fetching from specific endpoint, trying fallback method:', endpointError);
        
        // Fallback: Fetch all ICU admissions and find the matching one
        try {
          console.log('Fallback: Fetching all ICU admissions from /patient-icu-admissions/icu-management');
          const allAdmissionsResponse = await apiRequest<any>('/patient-icu-admissions/icu-management');
          console.log('Fallback API response:', allAdmissionsResponse);
          const allAdmissions = allAdmissionsResponse?.data || allAdmissionsResponse || [];
          
          if (Array.isArray(allAdmissions)) {
            admission = allAdmissions.find((adm: any) => 
              adm.id === patientICUAdmissionId || 
              adm.patientICUAdmissionId === patientICUAdmissionId ||
              adm.PatientICUAdmissionId === patientICUAdmissionId ||
              String(adm.id) === String(patientICUAdmissionId) ||
              String(adm.patientICUAdmissionId) === String(patientICUAdmissionId)
            );
          }
          
          if (!admission) {
            throw new Error(`ICU admission with ID ${patientICUAdmissionId} not found. The backend API may have an issue (column p.EmailId does not exist).`);
          }
        } catch (fallbackError: any) {
          console.error('Fallback method also failed:', fallbackError);
          throw new Error(
            `Failed to load ICU admission details. ` +
            `Backend error: ${endpointError?.message || endpointError || 'Unknown error'}. ` +
            `Please contact the system administrator.`
          );
        }
      }
      
      if (!admission) {
        throw new Error('ICU admission not found');
      }
      
      console.log('ICU admission data extracted:', admission);

      // Helper function to extract value with multiple field name variations
      const extractField = (data: any, fieldVariations: string[], defaultValue: any = '') => {
        for (const field of fieldVariations) {
          const value = data?.[field];
          if (value !== undefined && value !== null && value !== '') {
            return value;
          }
        }
        return defaultValue;
      };

      const mappedAdmission: ICUAdmission = {
        id: admission.id || admission.Id || patientICUAdmissionId,
        patientICUAdmissionId: extractField(admission, [
          'patientICUAdmissionId', 'PatientICUAdmissionId', 'patient_icu_admission_id', 'Patient_ICU_Admission_Id',
          'id', 'Id', 'admissionId', 'AdmissionId'
        ], patientICUAdmissionId),
        patientId: extractField(admission, ['patientId', 'PatientId', 'patient_id', 'Patient_ID'], ''),
        patientName: extractField(admission, [
          'patientName', 'PatientName', 'patient_name', 'Patient_Name',
          'name', 'Name', 'fullName', 'FullName'
        ], 'Unknown Patient'),
        age: Number(extractField(admission, [
          'age', 'Age', 'patientAge', 'PatientAge', 'patient_age', 'Patient_Age'
        ], 0)) || 0,
        gender: extractField(admission, [
          'gender', 'Gender', 'sex', 'Sex', 'patientGender', 'PatientGender'
        ], 'Unknown'),
        bedNumber: extractField(admission, [
          'bedNumber', 'BedNumber', 'bed_number', 'Bed_Number',
          'bed', 'Bed', 'icuBedNo', 'ICUBedNo', 'icuBedNumber', 'ICUBedNumber'
        ], ''),
        admissionDate: extractField(admission, [
          'admissionDate', 'AdmissionDate', 'admission_date', 'Admission_Date',
          'admitDate', 'AdmitDate', 'admit_date', 'Admit_Date'
        ], ''),
        admissionTime: extractField(admission, [
          'admissionTime', 'AdmissionTime', 'admission_time', 'Admission_Time',
          'admitTime', 'AdmitTime', 'admit_time', 'Admit_Time',
          'time', 'Time'
        ], ''),
        condition: extractField(admission, [
          'condition', 'Condition', 'patientCondition', 'PatientCondition',
          'diagnosis', 'Diagnosis', 'diagnosisDescription', 'DiagnosisDescription'
        ], 'Not Specified'),
        severity: extractField(admission, [
          'severity', 'Severity', 'patientSeverity', 'PatientSeverity',
          'icuPatientStatus', 'ICUPatientStatus', 'icu_patient_status', 'ICU_Patient_Status',
          'status', 'Status', 'patientStatus', 'PatientStatus'
        ], 'Stable'),
        attendingDoctor: extractField(admission, [
          'attendingDoctor', 'AttendingDoctor', 'attending_doctor', 'Attending_Doctor',
          'doctor', 'Doctor', 'doctorName', 'DoctorName', 'admittedBy', 'AdmittedBy'
        ], 'Not Assigned'),
        diagnosis: extractField(admission, [
          'diagnosis', 'Diagnosis', 'diagnosisDescription', 'DiagnosisDescription',
          'diagnosis_desc', 'Diagnosis_Desc'
        ], 'Not Specified'),
        treatment: extractField(admission, [
          'treatment', 'Treatment', 'treatmentPlan', 'TreatmentPlan',
          'treatment_plan', 'Treatment_Plan', 'medications', 'Medications'
        ], 'Not Specified'),
        ventilatorSupport: extractField(admission, [
          'ventilatorSupport', 'VentilatorSupport', 'ventilator_support', 'Ventilator_Support',
          'onVentilator', 'OnVentilator', 'isVentilatorAttached', 'IsVentilatorAttached',
          'ventilator', 'Ventilator'
        ], false),
        vitals: {
          heartRate: Number(extractField(admission, [
            'heartRate', 'HeartRate', 'heart_rate', 'Heart_Rate',
            'vitals.heartRate', 'vitals.HeartRate'
          ], 0)) || 0,
          bloodPressure: extractField(admission, [
            'bloodPressure', 'BloodPressure', 'blood_pressure', 'Blood_Pressure',
            'bp', 'BP', 'vitals.bloodPressure', 'vitals.BloodPressure'
          ], '0/0'),
          temperature: Number(extractField(admission, [
            'temperature', 'Temperature', 'temp', 'Temp',
            'vitals.temperature', 'vitals.Temperature'
          ], 0)) || 0,
          oxygenSaturation: Number(extractField(admission, [
            'oxygenSaturation', 'OxygenSaturation', 'oxygen_saturation', 'Oxygen_Saturation',
            'o2Sat', 'O2Sat', 'spo2', 'SpO2', 'vitals.oxygenSaturation', 'vitals.OxygenSaturation'
          ], 0)) || 0,
          respiratoryRate: Number(extractField(admission, [
            'respiratoryRate', 'RespiratoryRate', 'respiratory_rate', 'Respiratory_Rate',
            'rr', 'RR', 'vitals.respiratoryRate', 'vitals.RespiratoryRate'
          ], 0)) || 0,
        },
      };

      console.log('Fetched ICU admission data:', mappedAdmission);
      setIcuAdmission(mappedAdmission);
      
      // Fetch patient lab tests, doctor visits, and nurse visits after admission is loaded
      // Use patientICUAdmissionId or roomAdmissionId if available
      // Note: These APIs might expect a number, so we'll try to convert if needed
      const roomAdmissionId = mappedAdmission.patientICUAdmissionId || patientICUAdmissionId;
      if (roomAdmissionId) {
        // Try to convert to number if it's a valid number, otherwise use as string
        const numericId = typeof roomAdmissionId === 'string' && !isNaN(Number(roomAdmissionId)) 
          ? Number(roomAdmissionId) 
          : roomAdmissionId;
        // If it's still a string (UUID), we might need to handle it differently
        // For now, try as number if possible
        if (typeof numericId === 'number') {
          fetchPatientLabTests(numericId);
          fetchPatientDoctorVisits(numericId);
          fetchPatientNurseVisits(numericId);
        } else {
          console.warn('Room Admission ID is not numeric, skipping lab tests/visits fetch:', numericId);
        }
      }
    } catch (err) {
      console.error('Error fetching ICU admission details:', err);
      setError(err instanceof Error ? err.message : 'Failed to load ICU admission details');
    } finally {
      setLoading(false);
    }
  };

  const fetchPatientLabTests = async (roomAdmissionId: number) => {
    try {
      setLabTestsLoading(true);
      setLabTestsError(null);
      console.log('Fetching patient lab tests for roomAdmissionId:', roomAdmissionId);
      const labTests = await admissionsApi.getPatientLabTests(roomAdmissionId);
      console.log('Fetched patient lab tests:', labTests);
      setPatientLabTests(labTests);
    } catch (err) {
      console.error('Error fetching patient lab tests:', err);
      setLabTestsError(err instanceof Error ? err.message : 'Failed to load patient lab tests');
      setPatientLabTests([]);
    } finally {
      setLabTestsLoading(false);
    }
  };

  const fetchPatientDoctorVisits = async (roomAdmissionId: number) => {
    try {
      setDoctorVisitsLoading(true);
      setDoctorVisitsError(null);
      console.log('Fetching patient doctor visits for roomAdmissionId:', roomAdmissionId);
      const doctorVisits = await admissionsApi.getPatientDoctorVisits(roomAdmissionId);
      console.log('Fetched patient doctor visits:', doctorVisits);
      setPatientDoctorVisits(doctorVisits);
    } catch (err) {
      console.error('Error fetching patient doctor visits:', err);
      setDoctorVisitsError(err instanceof Error ? err.message : 'Failed to load patient doctor visits');
      setPatientDoctorVisits([]);
    } finally {
      setDoctorVisitsLoading(false);
    }
  };

  const fetchPatientNurseVisits = async (roomAdmissionId: number) => {
    try {
      setNurseVisitsLoading(true);
      setNurseVisitsError(null);
      console.log('Fetching patient nurse visits for roomAdmissionId:', roomAdmissionId);
      const nurseVisits = await admissionsApi.getPatientNurseVisits(roomAdmissionId);
      console.log('Fetched patient nurse visits:', nurseVisits);
      setPatientNurseVisits(nurseVisits);
    } catch (err) {
      console.error('Error fetching patient nurse visits:', err);
      setNurseVisitsError(err instanceof Error ? err.message : 'Failed to load patient nurse visits');
      setPatientNurseVisits([]);
    } finally {
      setNurseVisitsLoading(false);
    }
  };

  const handleBack = () => {
    window.location.hash = 'icu';
  };

  if (loading) {
    return (
      <div className="flex-1 bg-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-blue-600">Loading ICU case details...</p>
        </div>
      </div>
    );
  }

  if (error || !icuAdmission) {
    return (
      <div className="flex-1 bg-blue-100 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-red-600 mb-4">{error || 'ICU admission not found'}</p>
              <Button onClick={handleBack} variant="outline">
                <ArrowLeft className="size-4 mr-2" />
                Back to ICU Management
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-blue-100 flex flex-col overflow-hidden min-h-0">
      <div className="px-4 pt-4 pb-0 flex-shrink-0">
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={handleBack} className="gap-2">
              <ArrowLeft className="size-4" />
              Back
            </Button>
            <div>
              <h1 className="text-gray-900 mb-0 text-xl">Manage ICU Case</h1>
              <p className="text-gray-500 text-sm">Patient ICU Admission ID: {icuAdmission.patientICUAdmissionId || icuAdmission.id}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-y-auto overflow-x-hidden px-4 pb-4" style={{ maxHeight: 'calc(100vh - 100px)', minHeight: 0 }}>
        {/* ICU Details Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>ICU Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <Label className="text-sm text-gray-500">Patient Name</Label>
                <p className="text-gray-900 font-medium mt-1">{icuAdmission.patientName || 'N/A'}</p>
              </div>
              <div>
                <Label className="text-sm text-gray-500">Patient ID</Label>
                <p className="text-gray-900 font-medium mt-1">{icuAdmission.patientId || 'N/A'}</p>
              </div>
              <div>
                <Label className="text-sm text-gray-500">Bed Number</Label>
                <p className="text-gray-900 font-medium mt-1">
                  <Badge variant="outline">{icuAdmission.bedNumber || 'N/A'}</Badge>
                </p>
              </div>
              <div>
                <Label className="text-sm text-gray-500">Age</Label>
                <p className="text-gray-900 font-medium mt-1">{icuAdmission.age && icuAdmission.age > 0 ? `${icuAdmission.age} years` : 'N/A'}</p>
              </div>
              <div>
                <Label className="text-sm text-gray-500">Gender</Label>
                <p className="text-gray-900 font-medium mt-1">{icuAdmission.gender || 'N/A'}</p>
              </div>
              <div>
                <Label className="text-sm text-gray-500">Admission Date</Label>
                <p className="text-gray-900 font-medium mt-1">{icuAdmission.admissionDate || 'N/A'}</p>
              </div>
              <div>
                <Label className="text-sm text-gray-500">Admission Time</Label>
                <p className="text-gray-900 font-medium mt-1">{icuAdmission.admissionTime || 'N/A'}</p>
              </div>
              <div>
                <Label className="text-sm text-gray-500">Attending Doctor</Label>
                <p className="text-gray-900 font-medium mt-1">{icuAdmission.attendingDoctor || 'N/A'}</p>
              </div>
              <div>
                <Label className="text-sm text-gray-500">Condition</Label>
                <p className="text-gray-900 font-medium mt-1">{icuAdmission.condition || 'N/A'}</p>
              </div>
              <div>
                <Label className="text-sm text-gray-500">Severity</Label>
                <p className="mt-1">
                  <Badge variant={
                    icuAdmission.severity === 'Critical' ? 'destructive' :
                    icuAdmission.severity === 'Serious' ? 'default' : 'secondary'
                  }>
                    {icuAdmission.severity || 'Stable'}
                  </Badge>
                </p>
              </div>
              <div>
                <Label className="text-sm text-gray-500">Ventilator Support</Label>
                <p className="mt-1">
                  <Badge variant={icuAdmission.ventilatorSupport ? 'default' : 'outline'}>
                    {icuAdmission.ventilatorSupport ? 'Yes' : 'No'}
                  </Badge>
                </p>
              </div>
              <div>
                <Label className="text-sm text-gray-500">Diagnosis</Label>
                <p className="text-gray-900 font-medium mt-1">{icuAdmission.diagnosis || 'N/A'}</p>
              </div>
              {icuAdmission.vitals && (
                <>
                  <div>
                    <Label className="text-sm text-gray-500">Heart Rate</Label>
                    <p className="text-gray-900 font-medium mt-1">{icuAdmission.vitals.heartRate || 0} bpm</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-500">Blood Pressure</Label>
                    <p className="text-gray-900 font-medium mt-1">{icuAdmission.vitals.bloodPressure || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-500">Temperature</Label>
                    <p className="text-gray-900 font-medium mt-1">{icuAdmission.vitals.temperature || 0}°C</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-500">O₂ Saturation</Label>
                    <p className="text-gray-900 font-medium mt-1">{icuAdmission.vitals.oxygenSaturation || 0}%</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-500">Respiratory Rate</Label>
                    <p className="text-gray-900 font-medium mt-1">{icuAdmission.vitals.respiratoryRate || 0} /min</p>
                  </div>
                </>
              )}
              {icuAdmission.treatment && (
                <div className="col-span-2">
                  <Label className="text-sm text-gray-500">Treatment</Label>
                  <p className="text-gray-900 font-medium mt-1">{icuAdmission.treatment}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Tabs for Diagnosis & Treatment, Lab Tests, Doctor Visits, ICU Nurse Visits */}
        <Tabs defaultValue="diagnosis-treatment" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="diagnosis-treatment" className="gap-2">
              <FileText className="size-4" />
              Diagnosis & Treatment
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
              ICU Nurse Visits
            </TabsTrigger>
          </TabsList>

          <TabsContent value="diagnosis-treatment" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Diagnosis & Treatment Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Diagnosis Section */}
                  <div>
                    <Label className="text-base font-semibold text-gray-700 mb-3 block">Diagnosis</Label>
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-gray-900 whitespace-pre-wrap">
                        {icuAdmission.diagnosis && icuAdmission.diagnosis !== 'Not Specified' 
                          ? icuAdmission.diagnosis 
                          : icuAdmission.condition && icuAdmission.condition !== 'Not Specified'
                          ? icuAdmission.condition
                          : 'No diagnosis information available.'}
                      </p>
                    </div>
                  </div>

                  {/* Treatment Details Section */}
                  <div>
                    <Label className="text-base font-semibold text-gray-700 mb-3 block">Treatment Details</Label>
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-gray-900 whitespace-pre-wrap">
                        {icuAdmission.treatment && icuAdmission.treatment !== 'Not Specified' 
                          ? icuAdmission.treatment 
                          : 'No treatment details available.'}
                      </p>
                    </div>
                  </div>

                  {/* Additional Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {icuAdmission.condition && icuAdmission.condition !== 'Not Specified' && (
                      <div>
                        <Label className="text-sm text-gray-500">Patient Condition</Label>
                        <p className="text-gray-900 font-medium mt-1">{icuAdmission.condition}</p>
                      </div>
                    )}
                    {icuAdmission.severity && (
                      <div>
                        <Label className="text-sm text-gray-500">Severity Status</Label>
                        <p className="mt-1">
                          <Badge variant={
                            icuAdmission.severity === 'Critical' ? 'destructive' :
                            icuAdmission.severity === 'Serious' ? 'default' : 'secondary'
                          }>
                            {icuAdmission.severity}
                          </Badge>
                        </p>
                      </div>
                    )}
                    {icuAdmission.attendingDoctor && icuAdmission.attendingDoctor !== 'Not Assigned' && (
                      <div>
                        <Label className="text-sm text-gray-500">Attending Doctor</Label>
                        <p className="text-gray-900 font-medium mt-1">{icuAdmission.attendingDoctor}</p>
                      </div>
                    )}
                    {icuAdmission.ventilatorSupport !== undefined && (
                      <div>
                        <Label className="text-sm text-gray-500">Ventilator Support</Label>
                        <p className="mt-1">
                          <Badge variant={icuAdmission.ventilatorSupport ? 'default' : 'outline'}>
                            {icuAdmission.ventilatorSupport ? 'Yes' : 'No'}
                          </Badge>
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="lab-tests" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Lab Tests</CardTitle>
              </CardHeader>
              <CardContent>
                {labTestsLoading ? (
                  <div className="text-center py-8 text-gray-500">Loading lab tests...</div>
                ) : labTestsError ? (
                  <div className="text-center py-8 text-red-500">{labTestsError}</div>
                ) : patientLabTests.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">No lab tests found</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 text-gray-700">Test Name</th>
                          <th className="text-left py-3 px-4 text-gray-700">Category</th>
                          <th className="text-left py-3 px-4 text-gray-700">Priority</th>
                          <th className="text-left py-3 px-4 text-gray-700">Ordered Date</th>
                          <th className="text-left py-3 px-4 text-gray-700">Ordered By</th>
                          <th className="text-left py-3 px-4 text-gray-700">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {patientLabTests.map((test) => (
                          <tr key={test.patientLabTestId || test.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 px-4">{test.labTestName || test.testName || 'N/A'}</td>
                            <td className="py-3 px-4">{test.testCategory || 'N/A'}</td>
                            <td className="py-3 px-4">
                              <Badge variant={test.priority === 'High' ? 'destructive' : 'outline'}>
                                {test.priority || 'Normal'}
                              </Badge>
                            </td>
                            <td className="py-3 px-4">{test.orderedDate || 'N/A'}</td>
                            <td className="py-3 px-4">{test.orderedBy || 'N/A'}</td>
                            <td className="py-3 px-4">
                              <Badge variant={test.labTestDone ? 'default' : 'secondary'}>
                                {test.labTestDone ? 'Done' : 'Pending'}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="doctor-visits" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Doctor Visits</CardTitle>
              </CardHeader>
              <CardContent>
                {doctorVisitsLoading ? (
                  <div className="text-center py-8 text-gray-500">Loading doctor visits...</div>
                ) : doctorVisitsError ? (
                  <div className="text-center py-8 text-red-500">{doctorVisitsError}</div>
                ) : patientDoctorVisits.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">No doctor visits found</div>
                ) : (
                  <div className="space-y-4">
                    {patientDoctorVisits.map((visit) => (
                      <Card key={visit.patientDoctorVisitId || visit.id}>
                        <CardContent className="p-4">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                              <Label className="text-sm text-gray-500">Doctor</Label>
                              <p className="text-gray-900 font-medium mt-1">{visit.doctorName || 'N/A'}</p>
                            </div>
                            <div>
                              <Label className="text-sm text-gray-500">Visit Date</Label>
                              <p className="text-gray-900 font-medium mt-1">{visit.visitDate || 'N/A'}</p>
                            </div>
                            <div>
                              <Label className="text-sm text-gray-500">Visit Time</Label>
                              <p className="text-gray-900 font-medium mt-1">{visit.visitTime || 'N/A'}</p>
                            </div>
                            <div>
                              <Label className="text-sm text-gray-500">Visit Type</Label>
                              <p className="text-gray-900 font-medium mt-1">{visit.visitType || 'N/A'}</p>
                            </div>
                            {visit.diagnosis && (
                              <div className="col-span-2">
                                <Label className="text-sm text-gray-500">Diagnosis</Label>
                                <p className="text-gray-900 font-medium mt-1">{visit.diagnosis}</p>
                              </div>
                            )}
                            {visit.notes && (
                              <div className="col-span-2">
                                <Label className="text-sm text-gray-500">Notes</Label>
                                <p className="text-gray-900 font-medium mt-1">{visit.notes}</p>
                              </div>
                            )}
                            {visit.prescribedMedications && (
                              <div className="col-span-2">
                                <Label className="text-sm text-gray-500">Prescribed Medications</Label>
                                <p className="text-gray-900 font-medium mt-1">{visit.prescribedMedications}</p>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="nurse-visits" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>ICU Nurse Visits</CardTitle>
              </CardHeader>
              <CardContent>
                {nurseVisitsLoading ? (
                  <div className="text-center py-8 text-gray-500">Loading nurse visits...</div>
                ) : nurseVisitsError ? (
                  <div className="text-center py-8 text-red-500">{nurseVisitsError}</div>
                ) : patientNurseVisits.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">No nurse visits found</div>
                ) : (
                  <div className="space-y-4">
                    {patientNurseVisits.map((visit) => (
                      <Card key={visit.patientNurseVisitId || visit.id}>
                        <CardContent className="p-4">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                              <Label className="text-sm text-gray-500">Nurse</Label>
                              <p className="text-gray-900 font-medium mt-1">{visit.nurseName || 'N/A'}</p>
                            </div>
                            <div>
                              <Label className="text-sm text-gray-500">Visit Date</Label>
                              <p className="text-gray-900 font-medium mt-1">{visit.visitDate || 'N/A'}</p>
                            </div>
                            <div>
                              <Label className="text-sm text-gray-500">Visit Time</Label>
                              <p className="text-gray-900 font-medium mt-1">{visit.visitTime || 'N/A'}</p>
                            </div>
                            <div>
                              <Label className="text-sm text-gray-500">Visit Type</Label>
                              <p className="text-gray-900 font-medium mt-1">{visit.visitType || 'N/A'}</p>
                            </div>
                            {visit.vitalSigns && (
                              <div className="col-span-2">
                                <Label className="text-sm text-gray-500">Vital Signs</Label>
                                <p className="text-gray-900 font-medium mt-1">{visit.vitalSigns}</p>
                              </div>
                            )}
                            {visit.notes && (
                              <div className="col-span-2">
                                <Label className="text-sm text-gray-500">Notes</Label>
                                <p className="text-gray-900 font-medium mt-1">{visit.notes}</p>
                              </div>
                            )}
                            {visit.medicationsAdministered && (
                              <div className="col-span-2">
                                <Label className="text-sm text-gray-500">Medications Administered</Label>
                                <p className="text-gray-900 font-medium mt-1">{visit.medicationsAdministered}</p>
                              </div>
                            )}
                            {visit.patientStatus && (
                              <div className="col-span-2">
                                <Label className="text-sm text-gray-500">Patient Status</Label>
                                <p className="text-gray-900 font-medium mt-1">{visit.patientStatus}</p>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

