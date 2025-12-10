import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { FlaskConical, Stethoscope, Heart, ArrowLeft, Activity, FileText, Plus, Eye, Edit } from 'lucide-react';
import { admissionsApi } from '../api/admissions';
import { PatientLabTest, PatientDoctorVisit, PatientNurseVisit } from '../api/admissions';
import { apiRequest } from '../api/base';

interface ICUAdmission {
  id?: number | string;
  patientICUAdmissionId?: number | string; // UUID string
  patientId?: string; // UUID string
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
  console.log('========================================');
  console.log('ManageICUCase component rendered/mounted');
  console.log('Current window.location.hash:', window.location.hash);
  console.log('========================================');
  
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
  
  // Add/Edit ICU Doctor Visit Dialog State
  const [isAddDoctorVisitDialogOpen, setIsAddDoctorVisitDialogOpen] = useState(false);
  const [editingDoctorVisitId, setEditingDoctorVisitId] = useState<string | number | null>(null);
  const [doctorVisitFormData, setDoctorVisitFormData] = useState({
    icuDoctorVisitId: '',
    icuAdmissionId: '',
    patientId: '',
    doctorId: '',
    doctorVisitedDateTime: '',
    visitsDetails: '',
    patientCondition: '',
    status: ''
  });
  const [doctorVisitSubmitting, setDoctorVisitSubmitting] = useState(false);
  const [doctorVisitSubmitError, setDoctorVisitSubmitError] = useState<string | null>(null);
  
  // Add ICU Nurse Visit Dialog State
  const [isAddNurseVisitDialogOpen, setIsAddNurseVisitDialogOpen] = useState(false);
  const [nurseVisitFormData, setNurseVisitFormData] = useState({
    icuAdmissionId: '',
    patientId: '',
    nurseId: '',
    nurseVisitedDateTime: '',
    nurseVisitsDetails: '',
    patientCondition: ''
  });
  const [nurseVisitSubmitting, setNurseVisitSubmitting] = useState(false);
  const [nurseVisitSubmitError, setNurseVisitSubmitError] = useState<string | null>(null);

  useEffect(() => {
    // Get patientICUAdmissionId from URL hash parameters (should be a UUID string)
    console.log('========================================');
    console.log('ManageICUCase: useEffect triggered');
    console.log('Component mounted/updated');
    console.log('Current window.location.hash:', window.location.hash);
    console.log('Current window.location.href:', window.location.href);
    
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
      console.error('Hash:', hash);
      console.error('Params:', Object.fromEntries(params.entries()));
      setError('Patient ICU Admission ID is missing from URL');
      setLoading(false);
    }
  }, []);
  
  // Also listen for hash changes in case the component is already mounted
  useEffect(() => {
    const handleHashChange = () => {
      console.log('========================================');
      console.log('ManageICUCase: Hash change detected');
      console.log('New window.location.hash:', window.location.hash);
      
      const hash = window.location.hash.slice(1);
      const params = new URLSearchParams(hash.split('?')[1] || '');
      const patientICUAdmissionId = params.get('patientICUAdmissionId') || params.get('id');
      
      console.log('Extracted patientICUAdmissionId from hash change:', patientICUAdmissionId);
      
      if (patientICUAdmissionId && patientICUAdmissionId !== icuAdmission?.patientICUAdmissionId) {
        console.log('Hash change: Calling fetchICUAdmissionDetails with ID:', patientICUAdmissionId);
        fetchICUAdmissionDetails(patientICUAdmissionId);
      }
      console.log('========================================');
    };
    
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [icuAdmission?.patientICUAdmissionId]);

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
        console.log('========================================');
        console.log('Making API request to:', `/patient-icu-admissions/icu-management/${patientICUAdmissionId}`);
        const apiUrl = `/patient-icu-admissions/icu-management/${patientICUAdmissionId}`;
        console.log('Full API URL:', apiUrl);
        console.log('About to call apiRequest...');
        console.log('This should trigger a network request in the browser DevTools');
        console.log('========================================');
        
        const response = await apiRequest<any>(apiUrl);
        console.log('API request completed');
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
      // Use patientICUAdmissionId (UUID string) for API calls
      const patientICUAdmissionIdForAPI = mappedAdmission.patientICUAdmissionId || patientICUAdmissionId;
      if (patientICUAdmissionIdForAPI) {
        // Use the UUID string directly for doctor visits and nurse visits APIs
        console.log('Fetching doctor visits with patientICUAdmissionId (UUID):', patientICUAdmissionIdForAPI);
        fetchPatientDoctorVisits(String(patientICUAdmissionIdForAPI));
        console.log('Fetching nurse visits with patientICUAdmissionId (UUID):', patientICUAdmissionIdForAPI);
        fetchPatientNurseVisits(String(patientICUAdmissionIdForAPI));
        
        // For lab tests, try to convert to number if it's a valid number, otherwise use as string
        const numericId = typeof patientICUAdmissionIdForAPI === 'string' && !isNaN(Number(patientICUAdmissionIdForAPI)) 
          ? Number(patientICUAdmissionIdForAPI) 
          : patientICUAdmissionIdForAPI;
        if (typeof numericId === 'number') {
          fetchPatientLabTests(numericId);
        } else {
          console.warn('PatientICUAdmissionId is not numeric, skipping lab tests fetch:', numericId);
        }
      }
    } catch (err) {
      console.error('Error fetching ICU admission details:', err);
      setError(err instanceof Error ? err.message : 'Failed to load ICU admission details');
    } finally {
      setLoading(false);
    }
  };

  const fetchPatientLabTests = async (patientICUAdmissionId: number) => {
    try {
      setLabTestsLoading(true);
      setLabTestsError(null);
      console.log('Fetching patient lab tests for patientICUAdmissionId:', patientICUAdmissionId);
      const labTests = await admissionsApi.getPatientLabTests(patientICUAdmissionId);
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

  const fetchPatientDoctorVisits = async (patientICUAdmissionId: string) => {
    try {
      setDoctorVisitsLoading(true);
      setDoctorVisitsError(null);
      console.log('========================================');
      console.log('Fetching ICU doctor visits for patientICUAdmissionId (UUID):', patientICUAdmissionId);
      console.log('API Endpoint:', `/icu-doctor-visits/${patientICUAdmissionId}`);
      console.log('========================================');
      
      // Call the new ICU doctor visits API endpoint
      const response = await apiRequest<any>(`/icu-doctor-visits/icu-admission/${patientICUAdmissionId}`);
      
      console.log('ICU doctor visits API response (RAW):', JSON.stringify(response, null, 2));
      
      // Handle different response structures
      let doctorVisitsData: any[] = [];
      
      if (Array.isArray(response)) {
        doctorVisitsData = response;
      } else if (response?.data) {
        if (Array.isArray(response.data)) {
          doctorVisitsData = response.data;
        } else if (response.data.doctorVisits && Array.isArray(response.data.doctorVisits)) {
          doctorVisitsData = response.data.doctorVisits;
        } else if (response.data.icuDoctorVisits && Array.isArray(response.data.icuDoctorVisits)) {
          doctorVisitsData = response.data.icuDoctorVisits;
        }
      } else if (response?.doctorVisits && Array.isArray(response.doctorVisits)) {
        doctorVisitsData = response.doctorVisits;
      } else if (response?.icuDoctorVisits && Array.isArray(response.icuDoctorVisits)) {
        doctorVisitsData = response.icuDoctorVisits;
      }
      
      if (!Array.isArray(doctorVisitsData) || doctorVisitsData.length === 0) {
        console.warn('ICU doctor visits response is not an array or is empty:', response);
        setPatientDoctorVisits([]);
        return;
      }
      
      // Map the response to PatientDoctorVisit format
      const mappedDoctorVisits: PatientDoctorVisit[] = doctorVisitsData.map((visit: any) => {
        const extractField = (data: any, fieldVariations: string[], defaultValue: any = '') => {
          for (const field of fieldVariations) {
            const value = data?.[field];
            if (value !== undefined && value !== null && value !== '') {
              return value;
            }
          }
          return defaultValue;
        };
        
        return {
          icuDoctorVisitsId: extractField(visit, ['icuDoctorVisitsId', 'ICUDoctorVisitsId', 'iCUDoctorVisitsId', 'ICUDOCTORVISITSID', 'icuDoctorVisitId', 'ICUDoctorVisitId', 'iCUDoctorVisitId', 'patientDoctorVisitId', 'PatientDoctorVisitId', 'id', 'Id'], 0),
          iCUDoctorVisitId: extractField(visit, ['icuDoctorVisitsId', 'ICUDoctorVisitsId', 'iCUDoctorVisitsId', 'ICUDOCTORVISITSID', 'icuDoctorVisitId', 'ICUDoctorVisitId', 'iCUDoctorVisitId', 'patientDoctorVisitId', 'PatientDoctorVisitId', 'id', 'Id'], 0), // Legacy support
          patientDoctorVisitId: extractField(visit, ['patientDoctorVisitId', 'PatientDoctorVisitId', 'id', 'Id'], 0),
          doctorName: extractField(visit, ['doctorName', 'DoctorName', 'doctor_name', 'Doctor_Name', 'doctor', 'Doctor'], ''),
          visitDate: extractField(visit, ['visitDate', 'VisitDate', 'visit_date', 'Visit_Date', 'doctorVisitedDateTime', 'DoctorVisitedDateTime'], ''),
          visitTime: extractField(visit, ['visitTime', 'VisitTime', 'visit_time', 'Visit_Time'], ''),
          visitType: extractField(visit, ['visitType', 'VisitType', 'visit_type', 'Visit_Type'], ''),
          diagnosis: extractField(visit, ['diagnosis', 'Diagnosis'], ''),
          notes: extractField(visit, ['notes', 'Notes'], ''),
          visitsDetails: extractField(visit, ['visitsDetails', 'VisitsDetails', 'visitDetails', 'VisitDetails'], ''),
          patientCondition: extractField(visit, ['patientCondition', 'PatientCondition', 'condition', 'Condition'], ''),
          status: extractField(visit, ['status', 'Status'], 'Active'), // Map Status to Status
          prescribedMedications: extractField(visit, ['prescribedMedications', 'PrescribedMedications', 'medications', 'Medications'], ''),
        };
      });
      
      console.log('Fetched and mapped ICU doctor visits:', mappedDoctorVisits);
      setPatientDoctorVisits(mappedDoctorVisits);
    } catch (err) {
      console.error('Error fetching ICU doctor visits:', err);
      setDoctorVisitsError(err instanceof Error ? err.message : 'Failed to load ICU doctor visits');
      setPatientDoctorVisits([]);
    } finally {
      setDoctorVisitsLoading(false);
    }
  };

  const fetchPatientNurseVisits = async (patientICUAdmissionId: string) => {
    try {
      setNurseVisitsLoading(true);
      setNurseVisitsError(null);
      console.log('========================================');
      console.log('Fetching ICU nurse visits for patientICUAdmissionId (UUID):', patientICUAdmissionId);
      console.log('API Endpoint:', `/icu-nurse-visits/icu-admission/${patientICUAdmissionId}`);
      console.log('========================================');
      
      // Call the new ICU nurse visits API endpoint
      const response = await apiRequest<any>(`/icu-nurse-visits/icu-admission/${patientICUAdmissionId}`);
      console.log('ICU nurse visits API response (RAW):', JSON.stringify(response, null, 2));
      
      // Handle different response structures
      let nurseVisitsData: any[] = [];
      
      if (Array.isArray(response)) {
        nurseVisitsData = response;
      } else if (response?.data) {
        if (Array.isArray(response.data)) {
          nurseVisitsData = response.data;
        } else if (response.data.nurseVisits && Array.isArray(response.data.nurseVisits)) {
          nurseVisitsData = response.data.nurseVisits;
        } else if (response.data.icuNurseVisits && Array.isArray(response.data.icuNurseVisits)) {
          nurseVisitsData = response.data.icuNurseVisits;
        }
      } else if (response?.nurseVisits && Array.isArray(response.nurseVisits)) {
        nurseVisitsData = response.nurseVisits;
      } else if (response?.icuNurseVisits && Array.isArray(response.icuNurseVisits)) {
        nurseVisitsData = response.icuNurseVisits;
      }
      
      if (!Array.isArray(nurseVisitsData) || nurseVisitsData.length === 0) {
        console.warn('ICU nurse visits response is not an array or is empty:', response);
        setPatientNurseVisits([]);
        return;
      }
      
      // Map the response to PatientNurseVisit format
      const mappedNurseVisits: PatientNurseVisit[] = nurseVisitsData.map((visit: any) => {
        const extractField = (data: any, fieldVariations: string[], defaultValue: any = '') => {
          for (const field of fieldVariations) {
            const value = data?.[field];
            if (value !== undefined && value !== null && value !== '') {
              return value;
            }
          }
          return defaultValue;
        };
        
        return {
          patientNurseVisitId: extractField(visit, ['patientNurseVisitId', 'PatientNurseVisitId', 'id', 'Id'], 0),
          icuNurseVisitsId: extractField(visit, [
            'icuNurseVisitsId', 'ICUNurseVisitsId', 'icu_nurse_visits_id', 'ICU_Nurse_Visits_Id',
            'icuNurseVisitId', 'ICUNurseVisitId', 'icu_nurse_visit_id', 'ICU_Nurse_Visit_Id',
            'id', 'Id', 'ID'
          ], null),
          nurseName: extractField(visit, ['nurseName', 'NurseName', 'nurse_name', 'Nurse_Name', 'nurse', 'Nurse'], ''),
          visitDate: extractField(visit, ['visitDate', 'VisitDate', 'visit_date', 'Visit_Date', 'nurseVisitedDateTime', 'NurseVisitedDateTime'], ''),
          visitTime: extractField(visit, ['visitTime', 'VisitTime', 'visit_time', 'Visit_Time'], ''),
          visitType: extractField(visit, ['visitType', 'VisitType', 'visit_type', 'Visit_Type'], ''),
          vitalSigns: extractField(visit, ['vitalSigns', 'VitalSigns', 'vital_signs', 'Vital_Signs'], ''),
          notes: extractField(visit, ['notes', 'Notes'], ''),
          nurseVisitsDetails: extractField(visit, ['nurseVisitsDetails', 'NurseVisitsDetails', 'visitDetails', 'VisitDetails'], ''),
          medicationsAdministered: extractField(visit, ['medicationsAdministered', 'MedicationsAdministered', 'medications', 'Medications'], ''),
          patientStatus: extractField(visit, ['patientStatus', 'PatientStatus', 'patientCondition', 'PatientCondition', 'condition', 'Condition'], ''),
        };
      });
      
      console.log('Fetched and mapped ICU nurse visits:', mappedNurseVisits);
      setPatientNurseVisits(mappedNurseVisits);
    } catch (err) {
      console.error('Error fetching ICU nurse visits:', err);
      setNurseVisitsError(err instanceof Error ? err.message : 'Failed to load ICU nurse visits');
      setPatientNurseVisits([]);
    } finally {
      setNurseVisitsLoading(false);
    }
  };

  const handleBack = () => {
    window.location.hash = 'icu';
  };

  // Handle opening Add ICU Nurse Visit dialog
  const handleOpenAddNurseVisitDialog = () => {
    if (icuAdmission) {
      setNurseVisitFormData({
        icuAdmissionId: String(icuAdmission.patientICUAdmissionId || icuAdmission.id || ''),
        patientId: String(icuAdmission.patientId || ''),
        nurseId: '',
        nurseVisitedDateTime: new Date().toISOString().slice(0, 16), // Current date/time in local format
        nurseVisitsDetails: '',
        patientCondition: icuAdmission.condition || ''
      });
      setNurseVisitSubmitError(null);
      setIsAddNurseVisitDialogOpen(true);
    }
  };

  // Handle saving ICU Nurse Visit
  const handleSaveNurseVisit = async () => {
    try {
      setNurseVisitSubmitting(true);
      setNurseVisitSubmitError(null);

      console.log('Saving ICU Nurse Visit with data:', nurseVisitFormData);

      // Prepare the request payload
      // Ensure all UUID fields are sent as strings
      const payload = {
        ICUAdmissionId: String(nurseVisitFormData.icuAdmissionId), // UUID string
        PatientId: String(nurseVisitFormData.patientId), // UUID string
        NurseId: String(nurseVisitFormData.nurseId),
        NurseVisitedDateTime: nurseVisitFormData.nurseVisitedDateTime,
        NurseVisitsDetails: nurseVisitFormData.nurseVisitsDetails,
        PatientCondition: nurseVisitFormData.patientCondition
      };

      console.log('API Payload:', payload);
      console.log('API Endpoint: /icu-nurse-visits');

      // Call the API to create the ICU nurse visit
      const response = await apiRequest<any>('/icu-nurse-visits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      console.log('ICU nurse visit created successfully:', response);

      // Close dialog and refresh nurse visits list
      setIsAddNurseVisitDialogOpen(false);
      
      // Refresh the nurse visits list
      if (icuAdmission?.patientICUAdmissionId) {
        await fetchPatientNurseVisits(String(icuAdmission.patientICUAdmissionId));
      }

      // Reset form
      setNurseVisitFormData({
        icuAdmissionId: '',
        patientId: '',
        nurseId: '',
        nurseVisitedDateTime: '',
        nurseVisitsDetails: '',
        patientCondition: ''
      });
    } catch (err) {
      console.error('Error saving ICU Nurse Visit:', err);
      setNurseVisitSubmitError(
        err instanceof Error ? err.message : 'Failed to save ICU Nurse Visit'
      );
    } finally {
      setNurseVisitSubmitting(false);
    }
  };

  // Handle opening Add ICU Doctor Visit dialog
  const handleOpenAddDoctorVisitDialog = () => {
    if (icuAdmission) {
      setEditingDoctorVisitId(null);
      setDoctorVisitFormData({
        icuAdmissionId: String(icuAdmission.patientICUAdmissionId || icuAdmission.id || ''),
        patientId: String(icuAdmission.patientId || ''),
        doctorId: '', // Will need to be set from attendingDoctor or fetched
        doctorVisitedDateTime: new Date().toISOString().slice(0, 16), // Current date/time in local format
        visitsDetails: '',
        patientCondition: icuAdmission.condition || '',
        status: 'Active'
      });
      setDoctorVisitSubmitError(null);
      setIsAddDoctorVisitDialogOpen(true);
    }
  };

  // Handle opening Edit ICU Doctor Visit dialog
  const handleOpenEditDoctorVisitDialog = (visit: PatientDoctorVisit) => {
    console.log('========================================');
    console.log('Opening edit dialog for doctor visit');
    console.log('Visit object:', visit);
    console.log('Visit ID (patientDoctorVisitId):', visit.patientDoctorVisitId);
    console.log('Visit ID (id):', visit.id);
    console.log('ICU Admission:', icuAdmission);
    console.log('========================================');
    
    // Extract ICU Doctor Visit ID (primary key for ICU Doctor Visits)
    // Prioritize icuDoctorVisitsId (plural) as the primary key
    const icuDoctorVisitsId = visit.icuDoctorVisitsId || (visit as any).icuDoctorVisitsId || 
                              (visit as any).ICUDoctorVisitsId || (visit as any).iCUDoctorVisitsId || 
                              (visit as any).icuDoctorVisitId || (visit as any).ICUDoctorVisitId || 
                              (visit as any).iCUDoctorVisitId || visit.patientDoctorVisitId || visit.id;
    const visitId = visit.patientDoctorVisitId || visit.id;
    console.log('Extracted icuDoctorVisitsId (primary key):', icuDoctorVisitsId);
    console.log('Extracted visitId (fallback):', visitId);
    
    if (!icuDoctorVisitsId && !visitId) {
      console.error('No visit ID found! Visit object:', visit);
      alert('Error: Cannot edit visit - Visit ID not found');
      return;
    }
    
    if (!icuAdmission) {
      console.error('ICU Admission not loaded!');
      alert('Error: ICU Admission details not loaded. Please wait and try again.');
      return;
    }
    
    const finalVisitId = icuDoctorVisitsId || visitId;
    console.log('Setting editingDoctorVisitId to:', finalVisitId);
    setEditingDoctorVisitId(finalVisitId);
    
    // Format datetime for datetime-local input (YYYY-MM-DDTHH:mm)
    let formattedDateTime = '';
    if (visit.visitDate) {
      try {
        const date = new Date(visit.visitDate);
        if (!isNaN(date.getTime())) {
          // Format to YYYY-MM-DDTHH:mm
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          const hours = String(date.getHours()).padStart(2, '0');
          const minutes = String(date.getMinutes()).padStart(2, '0');
          formattedDateTime = `${year}-${month}-${day}T${hours}:${minutes}`;
          console.log('Formatted datetime:', formattedDateTime);
        }
      } catch (e) {
        console.warn('Error formatting date:', e);
      }
    }
    
    const formData = {
      icuDoctorVisitId: String(icuDoctorVisitsId || visitId || ''),
      icuAdmissionId: String(icuAdmission.patientICUAdmissionId || icuAdmission.id || ''),
      patientId: String(icuAdmission.patientId || ''),
      doctorId: String(visit.doctorId || visit.doctorName || ''),
      doctorVisitedDateTime: formattedDateTime || new Date().toISOString().slice(0, 16),
      visitsDetails: (visit as any).visitsDetails || visit.notes || visit.visitsRemarks || '',
      patientCondition: visit.patientCondition || '',
      status: visit.status || 'Active' // Map Status to Status
    };
    
    console.log('Setting form data:', formData);
    setDoctorVisitFormData(formData);
    setDoctorVisitSubmitError(null);
    
    console.log('Opening dialog...');
    setIsAddDoctorVisitDialogOpen(true);
    console.log('Dialog should now be open. isAddDoctorVisitDialogOpen state will be updated.');
  };

  // Handle saving ICU Doctor Visit (both create and update)
  const handleSaveDoctorVisit = async () => {
    try {
      setDoctorVisitSubmitting(true);
      setDoctorVisitSubmitError(null);

      console.log('Saving ICU Doctor Visit with data:', doctorVisitFormData);
      console.log('Is editing:', editingDoctorVisitId !== null, 'Visit ID:', editingDoctorVisitId);

      // Prepare the request payload
      // Ensure all UUID fields are sent as strings
      const payload: any = {
        ICUAdmissionId: String(doctorVisitFormData.icuAdmissionId), // UUID string
        PatientId: String(doctorVisitFormData.patientId), // UUID string
        DoctorId: String(doctorVisitFormData.doctorId),
        DoctorVisitedDateTime: doctorVisitFormData.doctorVisitedDateTime,
        VisitsDetails: doctorVisitFormData.visitsDetails,
        PatientCondition: doctorVisitFormData.patientCondition, // Keep PatientCondition separate
        Status: doctorVisitFormData.status // Map Status to Status in API payload
      };

      // Include ICUDoctorVisitId when editing
      if (editingDoctorVisitId && doctorVisitFormData.icuDoctorVisitId) {
        payload.ICUDoctorVisitId = String(doctorVisitFormData.icuDoctorVisitId);
        console.log('Including ICUDoctorVisitId in payload:', payload.ICUDoctorVisitId);
      }

      console.log('API Payload:', payload);

      let response;
      if (editingDoctorVisitId) {
        // Update existing visit
        console.log('API Endpoint: PUT /icu-doctor-visits/' + editingDoctorVisitId);
        response = await apiRequest<any>(`/icu-doctor-visits/${editingDoctorVisitId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
        console.log('Doctor visit updated successfully:', response);
      } else {
        // Create new visit
        console.log('API Endpoint: POST /icu-doctor-visits');
        response = await apiRequest<any>('/icu-doctor-visits', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
        console.log('Doctor visit created successfully:', response);
      }

      // Close dialog and refresh doctor visits list
      setIsAddDoctorVisitDialogOpen(false);
      setEditingDoctorVisitId(null);
      
      // Refresh the doctor visits list
      if (icuAdmission?.patientICUAdmissionId) {
        await fetchPatientDoctorVisits(String(icuAdmission.patientICUAdmissionId));
      }

      // Reset form
      setDoctorVisitFormData({
        icuDoctorVisitId: '',
        icuAdmissionId: '',
        patientId: '',
        doctorId: '',
        doctorVisitedDateTime: '',
        visitsDetails: '',
        patientCondition: '',
        status: ''
      });
    } catch (err) {
      console.error('Error saving ICU Doctor Visit:', err);
      setDoctorVisitSubmitError(
        err instanceof Error ? err.message : 'Failed to save ICU Doctor Visit'
      );
    } finally {
      setDoctorVisitSubmitting(false);
    }
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
                <Label className="text-sm text-gray-500">Admission Date and Time</Label>
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
                <div className="flex items-center justify-between">
                  <CardTitle>Doctor Visits</CardTitle>
                  <Button
                    onClick={handleOpenAddDoctorVisitDialog}
                    className="gap-2"
                  >
                    <Plus className="size-4" />
                    Add ICU Doctor Visit
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {doctorVisitsLoading ? (
                  <div className="text-center py-8 text-gray-500">Loading doctor visits...</div>
                ) : doctorVisitsError ? (
                  <div className="text-center py-8 text-red-500">{doctorVisitsError}</div>
                ) : patientDoctorVisits.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">No doctor visits found</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 text-gray-700">Doctor Visit ID</th>
                          <th className="text-left py-3 px-4 text-gray-700">Doctor</th>
                          <th className="text-left py-3 px-4 text-gray-700">Visit Date</th>
                          <th className="text-left py-3 px-4 text-gray-700">Visit Details</th>
                          <th className="text-left py-3 px-4 text-gray-700">Patient Condition</th>
                          <th className="text-left py-3 px-4 text-gray-700">Status</th>
                          <th className="text-left py-3 px-4 text-gray-700">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {patientDoctorVisits.map((visit) => (
                          <tr key={visit.icuDoctorVisitsId || (visit as any).iCUDoctorVisitId || visit.patientDoctorVisitId || visit.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 px-4">{visit.icuDoctorVisitsId || (visit as any).iCUDoctorVisitId || visit.patientDoctorVisitId || visit.id || 'N/A'}</td>
                            <td className="py-3 px-4">{visit.doctorName || 'N/A'}</td>
                            <td className="py-3 px-4">{visit.visitDate || 'N/A'}</td>
                            <td className="py-3 px-4">{(visit as any).visitsDetails || visit.notes || visit.visitsRemarks || 'N/A'}</td>
                            <td className="py-3 px-4">{visit.patientCondition || 'N/A'}</td>
                            <td className="py-3 px-4">
                              <Badge variant={visit.status === 'Active' ? 'default' : visit.status === 'Completed' ? 'secondary' : 'destructive'}>
                                {visit.status || 'N/A'}
                              </Badge>
                            </td>
                            <td className="py-3 px-4">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  console.log('Edit button clicked for visit:', visit);
                                  handleOpenEditDoctorVisitDialog(visit);
                                }}
                                className="gap-2"
                              >
                                <Edit className="size-4" />
                                Edit
                              </Button>
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

          <TabsContent value="nurse-visits" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>ICU Nurse Visits</CardTitle>
                  <Button
                    onClick={handleOpenAddNurseVisitDialog}
                    className="gap-2"
                  >
                    <Plus className="size-4" />
                    Add New ICU Nurse Visit
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {nurseVisitsLoading ? (
                  <div className="text-center py-8 text-gray-500">Loading nurse visits...</div>
                ) : nurseVisitsError ? (
                  <div className="text-center py-8 text-red-500">{nurseVisitsError}</div>
                ) : patientNurseVisits.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">No nurse visits found</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 text-gray-700">ICU Nurse Visit ID</th>
                          <th className="text-left py-3 px-4 text-gray-700">Nurse</th>
                          <th className="text-left py-3 px-4 text-gray-700">Visit Date</th>
                          <th className="text-left py-3 px-4 text-gray-700">Visit Details</th>
                          <th className="text-left py-3 px-4 text-gray-700">Patient Status</th>
                          <th className="text-left py-3 px-4 text-gray-700">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {patientNurseVisits.map((visit) => (
                          <tr key={visit.patientNurseVisitId || visit.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 px-4">{visit.icuNurseVisitsId || visit.patientNurseVisitId || visit.id || 'N/A'}</td>
                            <td className="py-3 px-4">{visit.nurseName || 'N/A'}</td>
                            <td className="py-3 px-4">{visit.visitDate || 'N/A'}</td>
                            <td className="py-3 px-4">{visit.nurseVisitsDetails || 'N/A'}</td>
                            <td className="py-3 px-4">{visit.patientStatus || 'N/A'}</td>
                            <td className="py-3 px-4">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  console.log('========================================');
                                  console.log('View and Add Vitals button clicked');
                                  console.log('Visit data:', visit);
                                  console.log('icuAdmission:', icuAdmission);
                                  
                                  const icuNurseVisitId = visit.icuNurseVisitsId || visit.patientNurseVisitId || visit.id;
                                  console.log('Extracted icuNurseVisitId:', icuNurseVisitId);
                                  
                                  if (icuNurseVisitId) {
                                    // Get patientICUAdmissionId from current ICU admission for back navigation
                                    const patientICUAdmissionId = icuAdmission?.patientICUAdmissionId || icuAdmission?.id;
                                    console.log('patientICUAdmissionId for back navigation:', patientICUAdmissionId);
                                    
                                    const url = `icunursevisitvitals?icuNurseVisitId=${String(icuNurseVisitId)}${patientICUAdmissionId ? `&patientICUAdmissionId=${String(patientICUAdmissionId)}` : ''}`;
                                    console.log('Setting window.location.hash to:', url);
                                    console.log('Current hash before change:', window.location.hash);
                                    
                                    // Set hash (browser automatically adds # prefix)
                                    window.location.hash = url;
                                    
                                    console.log('Hash after change:', window.location.hash);
                                    console.log('This should trigger a hashchange event');
                                    console.log('========================================');
                                  } else {
                                    console.error('ICU Nurse Visit ID not found for navigation');
                                    console.error('Visit object:', visit);
                                    console.error('Available visit fields:', Object.keys(visit));
                                  }
                                }}
                                className="gap-2"
                              >
                                <Eye className="size-4" />
                                View and Add Vitals
                              </Button>
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
        </Tabs>

        {/* Add/Edit ICU Doctor Visit Dialog */}
        <Dialog open={isAddDoctorVisitDialogOpen} onOpenChange={setIsAddDoctorVisitDialogOpen}>
          <DialogContent className="p-0 gap-0 large-dialog max-h-[90vh]">
            <DialogHeader className="px-6 pt-4 pb-3 flex-shrink-0">
              <DialogTitle>{editingDoctorVisitId ? 'Edit ICU Doctor Visit' : 'Add ICU Doctor Visit'}</DialogTitle>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto px-6 pb-1 patient-list-scrollable min-h-0">
              <div className="space-y-4 py-4">
                {doctorVisitSubmitError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                    {doctorVisitSubmitError}
                  </div>
                )}

              <div className="grid grid-cols-2 gap-4">
                {editingDoctorVisitId && (
                  <div>
                    <Label htmlFor="icuDoctorVisitId">ICU Doctor Visit ID</Label>
                    <Input
                      id="icuDoctorVisitId"
                      value={doctorVisitFormData.icuDoctorVisitId}
                      disabled
                      className="bg-gray-100"
                    />
                  </div>
                )}
                <div>
                  <Label htmlFor="icuAdmissionId">ICU Admission ID</Label>
                  <Input
                    id="icuAdmissionId"
                    value={doctorVisitFormData.icuAdmissionId}
                    disabled
                    className="bg-gray-100"
                  />
                </div>
                <div>
                  <Label htmlFor="patientId">Patient ID</Label>
                  <Input
                    id="patientId"
                    value={doctorVisitFormData.patientId}
                    disabled
                    className="bg-gray-100"
                  />
                </div>
                <div>
                  <Label htmlFor="doctorId">Doctor ID *</Label>
                  <Input
                    id="doctorId"
                    value={doctorVisitFormData.doctorId}
                    onChange={(e) => setDoctorVisitFormData({ ...doctorVisitFormData, doctorId: e.target.value })}
                    placeholder="Enter Doctor ID"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="doctorVisitedDateTime">Doctor Visited Date & Time *</Label>
                  <Input
                    id="doctorVisitedDateTime"
                    type="datetime-local"
                    value={doctorVisitFormData.doctorVisitedDateTime}
                    onChange={(e) => setDoctorVisitFormData({ ...doctorVisitFormData, doctorVisitedDateTime: e.target.value })}
                    required
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="visitsDetails">Visit Details *</Label>
                  <Textarea
                    id="visitsDetails"
                    value={doctorVisitFormData.visitsDetails}
                    onChange={(e) => setDoctorVisitFormData({ ...doctorVisitFormData, visitsDetails: e.target.value })}
                    placeholder="Enter visit details..."
                    rows={4}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="patientCondition">Patient Condition *</Label>
                  <Input
                    id="patientCondition"
                    value={doctorVisitFormData.patientCondition}
                    onChange={(e) => setDoctorVisitFormData({ ...doctorVisitFormData, patientCondition: e.target.value })}
                    placeholder="Enter patient condition"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="status">Status *</Label>
                  <select
                    id="status"
                    className="w-full px-3 py-2 border border-gray-200 rounded-md"
                    value={doctorVisitFormData.status}
                    onChange={(e) => setDoctorVisitFormData({ ...doctorVisitFormData, status: e.target.value })}
                    required
                  >
                    <option value="Active">Active</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
              </div>
            </div>
            <DialogFooter className="px-6 pb-4 flex-shrink-0">
              <Button
                variant="outline"
                onClick={() => {
                  setIsAddDoctorVisitDialogOpen(false);
                  setEditingDoctorVisitId(null);
                }}
                disabled={doctorVisitSubmitting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveDoctorVisit}
                disabled={doctorVisitSubmitting}
              >
                {doctorVisitSubmitting ? 'Saving...' : 'Save'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add ICU Nurse Visit Dialog */}
        <Dialog open={isAddNurseVisitDialogOpen} onOpenChange={setIsAddNurseVisitDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add ICU Nurse Visit</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {nurseVisitSubmitError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                  {nurseVisitSubmitError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nurseIcuAdmissionId">ICU Admission ID</Label>
                  <Input
                    id="nurseIcuAdmissionId"
                    value={nurseVisitFormData.icuAdmissionId}
                    disabled
                    className="bg-gray-100"
                  />
                </div>
                <div>
                  <Label htmlFor="nursePatientId">Patient ID</Label>
                  <Input
                    id="nursePatientId"
                    value={nurseVisitFormData.patientId}
                    disabled
                    className="bg-gray-100"
                  />
                </div>
                <div>
                  <Label htmlFor="nurseId">Nurse ID *</Label>
                  <Input
                    id="nurseId"
                    value={nurseVisitFormData.nurseId}
                    onChange={(e) => setNurseVisitFormData({ ...nurseVisitFormData, nurseId: e.target.value })}
                    placeholder="Enter Nurse ID"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="nurseVisitedDateTime">Nurse Visited Date & Time *</Label>
                  <Input
                    id="nurseVisitedDateTime"
                    type="datetime-local"
                    value={nurseVisitFormData.nurseVisitedDateTime}
                    onChange={(e) => setNurseVisitFormData({ ...nurseVisitFormData, nurseVisitedDateTime: e.target.value })}
                    required
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="nurseVisitsDetails">Nurse Visits Details *</Label>
                  <Textarea
                    id="nurseVisitsDetails"
                    value={nurseVisitFormData.nurseVisitsDetails}
                    onChange={(e) => setNurseVisitFormData({ ...nurseVisitFormData, nurseVisitsDetails: e.target.value })}
                    placeholder="Enter nurse visit details..."
                    rows={4}
                    required
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="nursePatientCondition">Patient Condition *</Label>
                  <Input
                    id="nursePatientCondition"
                    value={nurseVisitFormData.patientCondition}
                    onChange={(e) => setNurseVisitFormData({ ...nurseVisitFormData, patientCondition: e.target.value })}
                    placeholder="Enter patient condition"
                    required
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsAddNurseVisitDialogOpen(false)}
                disabled={nurseVisitSubmitting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveNurseVisit}
                disabled={nurseVisitSubmitting}
              >
                {nurseVisitSubmitting ? 'Saving...' : 'Save'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

