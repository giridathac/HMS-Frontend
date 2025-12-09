import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { HeartPulse, Activity, Thermometer, Wind, Droplet, Brain, Plus, Edit, CheckCircle2, XCircle, Wrench, Clock } from 'lucide-react';
import { admissionsApi } from '../api/admissions';
import { apiRequest } from '../api/base';

interface ICUPatient {
  id: number | string;
  patientICUAdmissionId?: string | number; // UUID for API calls
  bedNumber: string;
  patientName: string;
  age: number;
  gender: string;
  admissionDate: string;
  admissionTime: string;
  condition: string;
  severity: 'Critical' | 'Serious' | 'Stable';
  attendingDoctor: string;
  vitals: {
    heartRate: number;
    bloodPressure: string;
    temperature: number;
    oxygenSaturation: number;
    respiratoryRate: number;
  };
  diagnosis: string;
  treatment: string;
  ventilatorSupport: boolean;
}

const mockICUPatients: ICUPatient[] = [
  ];

export function ICUManagement() {
  const [patients, setPatients] = useState<ICUPatient[]>(mockICUPatients);
  const [selectedBed, setSelectedBed] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [occupancy, setOccupancy] = useState<{ totalPatients: number; occupiedBeds: number; totalBeds: number }>({
    totalPatients: 0,
    occupiedBeds: 0,
    totalBeds: 0,
  });
  const [criticalPatientsCount, setCriticalPatientsCount] = useState<number>(0);
  const [onVentilatorCount, setOnVentilatorCount] = useState<number>(0);
  const [availableBedsCount, setAvailableBedsCount] = useState<number>(0);
  const [icuBedLayout, setIcuBedLayout] = useState<any[]>([]);

  // Load ICU patient admissions from API
  useEffect(() => {
    const loadICUPatients = async () => {
      try {
        setLoading(true);
        console.log('Loading ICU patients from API endpoint: /patient-icu-admissions/icu-management');
        const response = await apiRequest<any>('/patient-icu-admissions/icu-management');
        console.log('ICU patient admissions API response (RAW):', JSON.stringify(response, null, 2));
        
        // Handle different response structures: { data: [...] } or direct array
        const icuAdmissions = response?.data || response || [];
        console.log('ICU patient admissions data extracted:', icuAdmissions);
        
        if (!Array.isArray(icuAdmissions)) {
          console.warn('ICU patient admissions data is not an array:', typeof icuAdmissions);
          setPatients([]);
          return;
        }
        
        // Map API data to ICUPatient interface
        const mappedPatients: ICUPatient[] = icuAdmissions.map((admission: any, index: number) => {
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

          // Extract bed number
          const bedNumber = extractField(admission, [
            'bedNumber', 'BedNumber', 'bed_number', 'Bed_Number',
            'bed', 'Bed', 'icuBedNo', 'ICUBedNo', 'icuBedNumber', 'ICUBedNumber'
          ], `ICU-${(index + 1).toString().padStart(2, '0')}`);

          // Extract patient name
          const patientName = extractField(admission, [
            'patientName', 'PatientName', 'patient_name', 'Patient_Name',
            'name', 'Name', 'fullName', 'FullName'
          ], 'Unknown Patient');

          // Extract age
          const age = Number(extractField(admission, [
            'age', 'Age', 'patientAge', 'PatientAge', 'patient_age', 'Patient_Age'
          ], 0)) || 0;

          // Extract gender
          const gender = extractField(admission, [
            'gender', 'Gender', 'sex', 'Sex', 'patientGender', 'PatientGender'
          ], 'Unknown');

          // Extract admission date
          const admissionDate = extractField(admission, [
            'admissionDate', 'AdmissionDate', 'admission_date', 'Admission_Date',
            'admitDate', 'AdmitDate', 'admit_date', 'Admit_Date'
          ], new Date().toISOString().split('T')[0]);

          // Extract admission time
          const admissionTime = extractField(admission, [
            'admissionTime', 'AdmissionTime', 'admission_time', 'Admission_Time',
            'admitTime', 'AdmitTime', 'admit_time', 'Admit_Time',
            'time', 'Time'
          ], new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }));

          // Extract condition
          const condition = extractField(admission, [
            'condition', 'Condition', 'patientCondition', 'PatientCondition',
            'diagnosis', 'Diagnosis', 'diagnosisDescription', 'DiagnosisDescription'
          ], 'Not Specified');

          // Extract severity (normalize to Critical, Serious, or Stable)
          const severityRaw = extractField(admission, [
            'severity', 'Severity', 'patientSeverity', 'PatientSeverity',
            'status', 'Status', 'patientStatus', 'PatientStatus'
          ], 'Stable');
          const severity = (severityRaw === 'Critical' || severityRaw === 'critical' || severityRaw === 'CRITICAL') ? 'Critical' :
                          (severityRaw === 'Serious' || severityRaw === 'serious' || severityRaw === 'SERIOUS') ? 'Serious' : 'Stable';

          // Extract attending doctor
          const attendingDoctor = extractField(admission, [
            'attendingDoctor', 'AttendingDoctor', 'attending_doctor', 'Attending_Doctor',
            'doctor', 'Doctor', 'doctorName', 'DoctorName', 'admittedBy', 'AdmittedBy'
          ], 'Not Assigned');

          // Extract vitals
          const vitals = {
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
          };

          // Extract diagnosis
          const diagnosis = extractField(admission, [
            'diagnosis', 'Diagnosis', 'diagnosisDescription', 'DiagnosisDescription',
            'diagnosis_desc', 'Diagnosis_Desc'
          ], condition);

          // Extract treatment
          const treatment = extractField(admission, [
            'treatment', 'Treatment', 'treatmentPlan', 'TreatmentPlan',
            'treatment_plan', 'Treatment_Plan', 'medications', 'Medications'
          ], 'Not Specified');

          // Extract ventilator support
          const ventilatorSupportRaw = extractField(admission, [
            'ventilatorSupport', 'VentilatorSupport', 'ventilator_support', 'Ventilator_Support',
            'onVentilator', 'OnVentilator', 'isVentilatorAttached', 'IsVentilatorAttached',
            'ventilator', 'Ventilator'
          ], false);
          const ventilatorSupport = typeof ventilatorSupportRaw === 'boolean' 
            ? ventilatorSupportRaw 
            : (String(ventilatorSupportRaw).toLowerCase() === 'true' || String(ventilatorSupportRaw).toLowerCase() === 'yes');

          // Extract patientICUAdmissionId (UUID) - this is the actual ID we need for API calls
          // Prioritize UUID fields, then fallback to other ID fields
          let patientICUAdmissionId = extractField(admission, [
            'patientICUAdmissionId', 'PatientICUAdmissionId', 'patient_icu_admission_id', 'Patient_ICU_Admission_Id'
          ], null);
          
          // If not found, try other ID fields but validate they look like UUIDs
          if (!patientICUAdmissionId) {
            const candidateId = extractField(admission, [
              'id', 'Id', 'admissionId', 'AdmissionId'
            ], null);
            
            // Only use if it looks like a UUID (string and length > 20)
            if (candidateId && typeof candidateId === 'string' && candidateId.length > 20) {
              patientICUAdmissionId = candidateId;
            }
          }
          
          console.log('Mapped patient ICU Admission ID:', patientICUAdmissionId, 'Type:', typeof patientICUAdmissionId, 'for patient:', extractField(admission, ['patientName', 'PatientName', 'name', 'Name'], 'Unknown'));

          return {
            id: patientICUAdmissionId || admission.id || admission.Id || admission.roomAdmissionId || admission.RoomAdmissionId || (index + 1),
            patientICUAdmissionId: patientICUAdmissionId, // Store the UUID separately
            bedNumber,
            patientName,
            age,
            gender,
            admissionDate,
            admissionTime,
            condition,
            severity,
            attendingDoctor,
            vitals,
            diagnosis,
            treatment,
            ventilatorSupport,
          };
        });

        setPatients(mappedPatients);
        console.log('Mapped ICU patients:', mappedPatients);
      } catch (error) {
        console.error('Error loading ICU patients:', error);
        // Keep mock data on error
      } finally {
        setLoading(false);
      }
    };

    loadICUPatients();
  }, []);

  // Load ICU occupancy data
  useEffect(() => {
    const loadICUOccupancy = async () => {
      try {
        console.log('Fetching ICU occupancy from API endpoint: /patient-icu-admissions/occupancy');
        const response = await apiRequest<any>('/patient-icu-admissions/occupancy');
        console.log('ICU occupancy API response (RAW):', JSON.stringify(response, null, 2));
        
        // Handle different response structures: { data: {...} } or direct object
        const occupancyData = response?.data || response || {};
        console.log('ICU occupancy data extracted:', occupancyData);
        
        // Helper function to extract numeric value with multiple field name variations
        const extractValue = (data: any, fieldVariations: string[], defaultValue: number = 0): number => {
          for (const field of fieldVariations) {
            const value = data?.[field];
            if (value !== undefined && value !== null) {
              const numValue = Number(value);
              if (!isNaN(numValue)) {
                return numValue;
              }
            }
          }
          return defaultValue;
        };
        
        // Extract occupancy field - this represents occupied beds from the API
        const occupancyValue = extractValue(occupancyData, [
          'occupancy', 'Occupancy', 'occupiedAdmissions', 'OccupiedAdmissions'
        ], -1); // Use -1 as sentinel value to check if occupancy field exists
        
        const hasOccupancyField = occupancyValue !== -1;
        
        // Extract total beds - this is the total capacity (e.g., 15)
        const totalBeds = extractValue(occupancyData, [
          'totalBeds', 'TotalBeds', 'total_beds', 'Total_Beds',
          'totalCapacity', 'TotalCapacity', 'total_capacity', 'Total_Capacity',
          'capacity', 'Capacity', 'totalBedCount', 'TotalBedCount',
          'bedCapacity', 'BedCapacity', 'bed_capacity', 'Bed_Capacity',
          'maxBeds', 'MaxBeds', 'max_beds', 'Max_Beds',
          'totalICUBeds', 'TotalICUBeds', 'total_icu_beds', 'Total_ICU_Beds'
        ], 15); // Default to 15 if not provided
        
        // Use occupancy field for occupied beds (this is the primary source)
        // If occupancy field is not available, fallback to other field names
        const occupiedBeds = hasOccupancyField 
          ? occupancyValue 
          : extractValue(occupancyData, [
              'occupiedBeds', 'OccupiedBeds', 'occupied_beds', 'Occupied_Beds',
              'occupied', 'Occupied', 'occupiedCount', 'OccupiedCount',
              'occupied_bed_count', 'Occupied_Bed_Count', 'occupiedBedCount', 'OccupiedBedCount',
              'totalOccupied', 'TotalOccupied', 'total_occupied', 'Total_Occupied',
              'occupiedPatients', 'OccupiedPatients', 'occupied_patients', 'Occupied_Patients'
            ], 0);
        
        // Ensure occupiedBeds doesn't exceed totalBeds
        const finalOccupiedBeds = Math.min(occupiedBeds, totalBeds);
        
        // Extract availableICUBeds field - this represents available beds from the API
        const availableICUBeds = extractValue(occupancyData, [
          'availableICUBeds', 'AvailableICUBeds', 'available_icu_beds', 'Available_ICU_Beds',
          'availableBeds', 'AvailableBeds', 'available_beds', 'Available_Beds',
          'availableBedCount', 'AvailableBedCount', 'available_bed_count', 'Available_Bed_Count',
          'available', 'Available', 'availableCount', 'AvailableCount',
          'freeBeds', 'FreeBeds', 'free_beds', 'Free_Beds',
          'vacantBeds', 'VacantBeds', 'vacant_beds', 'Vacant_Beds',
          'icuAvailableBeds', 'ICUAvailableBeds', 'icu_available_beds', 'ICU_Available_Beds'
        ], Math.max(0, totalBeds - finalOccupiedBeds)); // Calculate as totalBeds - occupiedBeds if not provided
        
        // For Total Patients display, use occupancy field (occupied beds) / total beds
        // The occupancy field represents the number of occupied beds
        const finalTotalPatients = finalOccupiedBeds; // Use occupied beds count for total patients display
        
        console.log('Mapped ICU occupancy:', { 
          occupancy: hasOccupancyField ? occupancyValue : null, // Raw occupancy field from API
          totalPatients: finalTotalPatients, 
          occupiedBeds: finalOccupiedBeds, 
          totalBeds,
          availableICUBeds: availableICUBeds,
          usingOccupancyField: hasOccupancyField
        });
        
        setOccupancy({
          totalPatients: finalTotalPatients,
          occupiedBeds: finalOccupiedBeds, // Use occupancy field value
          totalBeds: totalBeds,
        });
        
        // Set available beds count from availableICUBeds field
        setAvailableBedsCount(availableICUBeds);
        
        console.log('ICU occupancy loaded:', { 
          totalPatients: finalTotalPatients, 
          occupiedBeds: finalOccupiedBeds, 
          totalBeds,
          availableBeds: availableICUBeds
        });
      } catch (error) {
        console.error('Error loading ICU occupancy:', error);
        // Keep default values on error
      }
    };

    loadICUOccupancy();
  }, []);

  // Load ICU critical patients count
  useEffect(() => {
    const loadICUCriticalCount = async () => {
      try {
        const criticalCount = await admissionsApi.getICUCriticalCount();
        setCriticalPatientsCount(criticalCount);
        console.log('ICU critical patients count loaded:', criticalCount);
      } catch (error) {
        console.error('Error loading ICU critical count:', error);
        // Keep default value (0) on error
      }
    };

    loadICUCriticalCount();
  }, []);

  // Load ICU on-ventilator patients count
  useEffect(() => {
    const loadICUOnVentilatorCount = async () => {
      try {
        const ventilatorCount = await admissionsApi.getICUOnVentilatorCount();
        setOnVentilatorCount(ventilatorCount);
        console.log('ICU on-ventilator patients count loaded:', ventilatorCount);
      } catch (error) {
        console.error('Error loading ICU on-ventilator count:', error);
        // Keep default value (0) on error
      }
    };

    loadICUOnVentilatorCount();
  }, []);

  // Load ICU bed layout from API
  useEffect(() => {
    const loadICUBedLayout = async () => {
      try {
        console.log('Fetching ICU bed layout from API endpoint: /patient-icu-admissions/icu-beds-details');
        const response = await apiRequest<any>('/patient-icu-admissions/icu-beds-details');
        console.log('ICU bed layout API response (RAW):', JSON.stringify(response, null, 2));
        
        // Handle different response structures: { data: [...] } or direct array
        const bedLayoutData = response?.data || response || [];
        console.log('ICU bed layout data extracted:', bedLayoutData);
        
        if (Array.isArray(bedLayoutData) && bedLayoutData.length > 0) {
          console.log(`Processing ${bedLayoutData.length} ICU beds from API`);
          setIcuBedLayout(bedLayoutData);
          console.log('ICU bed layout loaded:', bedLayoutData);
        } else if (bedLayoutData && !Array.isArray(bedLayoutData)) {
          console.warn('ICU bed layout data is not an array:', typeof bedLayoutData);
          setIcuBedLayout([]);
        } else {
          console.warn('No ICU bed layout data found in API response');
          setIcuBedLayout([]);
        }
      } catch (error) {
        console.error('Error loading ICU bed layout:', error);
        // Keep empty array on error, will fallback to calculated beds
        setIcuBedLayout([]);
      }
    };

    loadICUBedLayout();
  }, []);

  // Map ICU bed layout from API or calculate from patients
  const icuBeds = icuBedLayout.length > 0 
    ? icuBedLayout.map((bed: any) => {
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

        const bedNumber = extractField(bed, [
          'bedNumber', 'BedNumber', 'bed_number', 'Bed_Number',
          'bed', 'Bed', 'icuBedNo', 'ICUBedNo', 'icuBedNumber', 'ICUBedNumber',
          'bedId', 'BedId', 'bedID', 'BedID'
        ], '');

        const status = extractField(bed, [
          'status', 'Status', 'bedStatus', 'BedStatus', 'bed_status', 'Bed_Status'
        ], 'Available');

        // Extract icuPatientStatus from bed level first, then patient data level
        // This field determines the bed status display (Critical, Serious, Stable)
        let icuPatientStatusRaw = extractField(bed, [
          'icuPatientStatus', 'ICUPatientStatus', 'icu_patient_status', 'ICU_Patient_Status',
          'patientStatus', 'PatientStatus', 'patient_status', 'Patient_Status'
        ], null);

        // Map patient data if available
        let patient: ICUPatient | undefined = undefined;
        const patientData = bed.patient || bed.Patient || bed.patientData || bed.PatientData;
        if (patientData) {
          // If not found at bed level, extract from patient data
          if (!icuPatientStatusRaw) {
            icuPatientStatusRaw = extractField(patientData, [
              'icuPatientStatus', 'ICUPatientStatus', 'icu_patient_status', 'ICU_Patient_Status',
              'patientCondition', 'PatientCondition', 'patient_condition', 'Patient_Condition',
              'condition', 'Condition', 'patientStatus', 'PatientStatus',
              'status', 'Status', 'severity', 'Severity', 'patientSeverity', 'PatientSeverity'
            ], 'Stable');
          }
          
          // Map icuPatientStatus to severity (Critical, Serious, Stable)
          // Normalize the status value to determine severity
          const statusLower = String(icuPatientStatusRaw || 'Stable').toLowerCase().trim();
          let severity: 'Critical' | 'Serious' | 'Stable' = 'Stable';
          
          // Check for Critical status
          if (statusLower.includes('critical') || statusLower.includes('severe') || 
              statusLower.includes('emergency') || statusLower.includes('unstable') ||
              statusLower === 'critical' || statusLower === 'cr' || statusLower === 'c') {
            severity = 'Critical';
          }
          // Check for Serious status
          else if (statusLower.includes('serious') || statusLower.includes('moderate') ||
                   statusLower.includes('acute') || statusLower === 'serious' || 
                   statusLower === 'sr' || statusLower === 's') {
            severity = 'Serious';
          }
          // Default to Stable for other statuses (stable, improving, good, etc.)
          else {
            severity = 'Stable';
          }
          
          console.log('Bed', bedNumber, '- icuPatientStatus:', icuPatientStatusRaw, 'mapped to severity:', severity);

          const ventilatorSupportRaw = extractField(patientData, [
            'ventilatorSupport', 'VentilatorSupport', 'ventilator_support', 'Ventilator_Support',
            'onVentilator', 'OnVentilator', 'isVentilatorAttached', 'IsVentilatorAttached',
            'ventilator', 'Ventilator'
          ], false);
          const ventilatorSupport = typeof ventilatorSupportRaw === 'boolean' 
            ? ventilatorSupportRaw 
            : (String(ventilatorSupportRaw).toLowerCase() === 'true' || String(ventilatorSupportRaw).toLowerCase() === 'yes');

          // Extract patientICUAdmissionId (UUID) - this is the actual ID we need for API calls
          // First check bed level, then patient data level
          let patientICUAdmissionId = extractField(bed, [
            'patientICUAdmissionId', 'PatientICUAdmissionId', 'patient_icu_admission_id', 'Patient_ICU_Admission_Id',
            'icuAdmissionId', 'ICUAdmissionId', 'icu_admission_id', 'ICU_Admission_Id'
          ], null);
          
          // If not found at bed level, check patient data level
          if (!patientICUAdmissionId) {
            patientICUAdmissionId = extractField(patientData, [
              'patientICUAdmissionId', 'PatientICUAdmissionId', 'patient_icu_admission_id', 'Patient_ICU_Admission_Id',
              'id', 'Id', 'admissionId', 'AdmissionId'
            ], null);
          }
          
          // Validate UUID format (basic check - UUIDs are 36 characters with dashes)
          // If it's a number or doesn't look like a UUID, try to find the actual UUID field
          if (patientICUAdmissionId && typeof patientICUAdmissionId === 'number') {
            console.warn('patientICUAdmissionId is a number, not a UUID. Bed:', bedNumber, 'Value:', patientICUAdmissionId);
            // Try to find UUID in other fields
            const uuidCandidate = extractField(bed, [
              'patientICUAdmissionId', 'PatientICUAdmissionId', 'patient_icu_admission_id', 'Patient_ICU_Admission_Id',
              'icuAdmissionId', 'ICUAdmissionId', 'icu_admission_id', 'ICU_Admission_Id'
            ], null) || extractField(patientData, [
              'patientICUAdmissionId', 'PatientICUAdmissionId', 'patient_icu_admission_id', 'Patient_ICU_Admission_Id'
            ], null);
            
            if (uuidCandidate && typeof uuidCandidate === 'string' && uuidCandidate.length > 20) {
              patientICUAdmissionId = uuidCandidate;
            } else {
              // If we can't find a UUID, set to null so we don't try to navigate
              console.warn('No valid UUID found for bed:', bedNumber);
              patientICUAdmissionId = null;
            }
          }
          
          console.log('Extracted patientICUAdmissionId for bed', bedNumber, ':', patientICUAdmissionId, 'Type:', typeof patientICUAdmissionId);

          patient = {
            id: patientICUAdmissionId || extractField(patientData, ['id', 'Id', 'patientId', 'PatientId'], 0),
            patientICUAdmissionId: patientICUAdmissionId, // Store the UUID separately
            bedNumber: bedNumber,
            patientName: extractField(patientData, [
              'patientName', 'PatientName', 'patient_name', 'Patient_Name',
              'name', 'Name', 'fullName', 'FullName'
            ], 'Unknown Patient'),
            age: Number(extractField(patientData, [
              'age', 'Age', 'patientAge', 'PatientAge', 'patient_age', 'Patient_Age'
            ], 0)) || 0,
            gender: extractField(patientData, [
              'gender', 'Gender', 'sex', 'Sex', 'patientGender', 'PatientGender'
            ], 'Unknown'),
            admissionDate: extractField(patientData, [
              'admissionDate', 'AdmissionDate', 'admission_date', 'Admission_Date',
              'admitDate', 'AdmitDate', 'admit_date', 'Admit_Date'
            ], new Date().toISOString().split('T')[0]),
            admissionTime: extractField(patientData, [
              'admissionTime', 'AdmissionTime', 'admission_time', 'Admission_Time',
              'admitTime', 'AdmitTime', 'admit_time', 'Admit_Time',
              'time', 'Time'
            ], new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })),
            condition: extractField(patientData, [
              'condition', 'Condition', 'patientCondition', 'PatientCondition',
              'diagnosis', 'Diagnosis', 'diagnosisDescription', 'DiagnosisDescription'
            ], 'Not Specified'),
            severity: severity,
            attendingDoctor: extractField(patientData, [
              'attendingDoctor', 'AttendingDoctor', 'attending_doctor', 'Attending_Doctor',
              'doctor', 'Doctor', 'doctorName', 'DoctorName', 'admittedBy', 'AdmittedBy'
            ], 'Not Assigned'),
            vitals: {
              heartRate: Number(extractField(patientData, [
                'heartRate', 'HeartRate', 'heart_rate', 'Heart_Rate',
                'vitals.heartRate', 'vitals.HeartRate'
              ], 0)) || 0,
              bloodPressure: extractField(patientData, [
                'bloodPressure', 'BloodPressure', 'blood_pressure', 'Blood_Pressure',
                'bp', 'BP', 'vitals.bloodPressure', 'vitals.BloodPressure'
              ], '0/0'),
              temperature: Number(extractField(patientData, [
                'temperature', 'Temperature', 'temp', 'Temp',
                'vitals.temperature', 'vitals.Temperature'
              ], 0)) || 0,
              oxygenSaturation: Number(extractField(patientData, [
                'oxygenSaturation', 'OxygenSaturation', 'oxygen_saturation', 'Oxygen_Saturation',
                'o2Sat', 'O2Sat', 'spo2', 'SpO2', 'vitals.oxygenSaturation', 'vitals.OxygenSaturation'
              ], 0)) || 0,
              respiratoryRate: Number(extractField(patientData, [
                'respiratoryRate', 'RespiratoryRate', 'respiratory_rate', 'Respiratory_Rate',
                'rr', 'RR', 'vitals.respiratoryRate', 'vitals.RespiratoryRate'
              ], 0)) || 0,
            },
            diagnosis: extractField(patientData, [
              'diagnosis', 'Diagnosis', 'diagnosisDescription', 'DiagnosisDescription',
              'diagnosis_desc', 'Diagnosis_Desc'
            ], 'Not Specified'),
            treatment: extractField(patientData, [
              'treatment', 'Treatment', 'treatmentPlan', 'TreatmentPlan',
              'treatment_plan', 'Treatment_Plan', 'medications', 'Medications'
            ], 'Not Specified'),
            ventilatorSupport: ventilatorSupport,
          };
        }

        return {
          bedNumber,
          status: status === 'Occupied' || patient ? 'Occupied' : 'Available',
          patient,
        };
      })
    : Array.from({ length: 15 }, (_, i) => {
        // Fallback to calculated beds if API data not available
  const bedNumber = `ICU-${(i + 1).toString().padStart(2, '0')}`;
        const patient = patients.find(p => p.bedNumber === bedNumber);
  return {
    bedNumber,
    status: patient ? 'Occupied' : 'Available',
    patient,
  };
});

  const occupiedBeds = icuBeds.filter(bed => bed.status === 'Occupied').length;
  const availableBeds = icuBeds.filter(bed => bed.status === 'Available').length;
  const criticalPatients = patients.filter(p => p.severity === 'Critical').length;
  const onVentilator = patients.filter(p => p.ventilatorSupport).length;

  const selectedPatient = icuBeds.find(bed => bed.bedNumber === selectedBed)?.patient;

  return (
    <div className="px-4 pt-4 pb-4 bg-blue-100 h-screen flex flex-col overflow-hidden">
      <div className="flex-shrink-0">
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
          <div>
            <h1 className="text-gray-900 mb-0 text-xl">ICU Management</h1>
            <p className="text-gray-500 text-sm">Intensive Care Unit monitoring and management</p>
          </div>
        </div>
      </div>
      <div className="overflow-y-auto overflow-x-hidden px-4 pb-4 icu-scrollable" style={{ maxHeight: 'calc(100vh - 60px)', minHeight: 0 }}>
      <Tabs defaultValue="patients" className="space-y-6">
        <TabsList>
          <TabsTrigger value="patients">ICU Patient Management</TabsTrigger>
        </TabsList>

        <TabsContent value="patients" className="space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-blue-600">Total Patients</p>
                  <HeartPulse className="size-5 text-red-600" />
                </div>
                <h3 className="text-blue-900">{occupancy.occupiedBeds}/{occupancy.totalBeds}</h3>
                <p className="text-xs text-blue-600">Occupied beds</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-blue-600">Critical Patients</p>
                  <Badge variant="destructive">{criticalPatientsCount}</Badge>
                </div>
                <h3 className="text-blue-900">{criticalPatientsCount}</h3>
                <p className="text-xs text-blue-600">Require immediate attention</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-blue-600">On Ventilator</p>
                  <Wind className="size-5 text-blue-600" />
                </div>
                <h3 className="text-blue-900">{onVentilatorCount}</h3>
                <p className="text-xs text-blue-600">Ventilator support</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-blue-600">Available Beds</p>
                  <span className="text-green-600">●</span>
                </div>
                <h3 className="text-blue-900">{availableBedsCount}</h3>
                <p className="text-xs text-blue-600">Ready for admission</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
            {/* ICU Bed Layout */}
            <Card>
              <CardHeader>
                <CardTitle>ICU Bed Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-3">
                  {icuBeds.map((bed) => (
                    <button
                      key={bed.bedNumber}
                      onClick={() => {
                        console.log('ICU Bed clicked:', {
                          bedNumber: bed.bedNumber,
                          status: bed.status,
                          patient: bed.patient,
                          patientICUAdmissionId: bed.patient?.patientICUAdmissionId,
                          patientId: bed.patient?.id
                        });
                        
                        // If bed is occupied and has a patient with ICU admission ID, navigate to ManageICUCase
                        if (bed.status === 'Occupied' && bed.patient) {
                          const patientICUAdmissionId = bed.patient.patientICUAdmissionId;
                          console.log('Attempting to navigate to ManageICUCase');
                          console.log('patientICUAdmissionId:', patientICUAdmissionId, 'Type:', typeof patientICUAdmissionId);
                          console.log('bed.patient.id:', bed.patient.id, 'Type:', typeof bed.patient.id);
                          
                          // Only use patientICUAdmissionId if it's a valid UUID (string and looks like UUID)
                          if (patientICUAdmissionId && 
                              (typeof patientICUAdmissionId === 'string' && patientICUAdmissionId.length > 20)) {
                            const url = `manageicucase?patientICUAdmissionId=${String(patientICUAdmissionId)}`;
                            console.log('Navigating to:', url);
                            window.location.hash = url;
                          } else {
                            console.warn('No valid UUID patientICUAdmissionId found for bed:', bed.bedNumber);
                            console.warn('Available patient data:', {
                              patientICUAdmissionId: bed.patient.patientICUAdmissionId,
                              id: bed.patient.id,
                              patient: bed.patient
                            });
                            setSelectedBed(bed.bedNumber);
                          }
                        } else {
                          // For available beds or beds without patient data, just select the bed
                          console.log('Bed is available or has no patient data, selecting bed:', bed.bedNumber);
                          setSelectedBed(bed.bedNumber);
                        }
                      }}
                      className={`p-4 border-2 rounded-lg text-center transition-all cursor-pointer ${
                        selectedBed === bed.bedNumber
                          ? 'border-blue-500 bg-blue-50 scale-105'
                          : bed.status === 'Occupied'
                          ? bed.patient?.severity === 'Critical'
                            ? 'border-red-300 bg-red-50 hover:border-red-400'
                            : bed.patient?.severity === 'Serious'
                            ? 'border-orange-300 bg-orange-50 hover:border-orange-400'
                            : 'border-yellow-300 bg-yellow-50 hover:border-yellow-400'
                          : 'border-green-300 bg-green-50 hover:border-green-400'
                      }`}
                    >
                      <p className="text-gray-900 mb-1">{bed.bedNumber}</p>
                      <div className="flex items-center justify-center gap-1">
                        <span className={`size-2 rounded-full ${
                          bed.status === 'Occupied'
                            ? bed.patient?.severity === 'Critical'
                              ? 'bg-red-500'
                              : bed.patient?.severity === 'Serious'
                              ? 'bg-orange-500'
                              : 'bg-yellow-500'
                            : 'bg-green-500'
                        }`} />
                        <span className="text-xs text-gray-600">
                          {bed.status === 'Occupied' ? bed.patient?.severity : 'Available'}
                        </span>
                      </div>
                      {bed.patient?.ventilatorSupport && (
                        <div className="mt-1">
                          <Badge variant="secondary" className="text-xs">
                            <Wind className="size-3 mr-1" />
                            Ventilator
                          </Badge>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
                <div className="mt-6 flex items-center justify-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="size-3 rounded-full bg-red-500" />
                    <span className="text-gray-600">Critical</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="size-3 rounded-full bg-orange-500" />
                    <span className="text-gray-600">Serious</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="size-3 rounded-full bg-yellow-500" />
                    <span className="text-gray-600">Stable</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="size-3 rounded-full bg-green-500" />
                    <span className="text-gray-600">Available</span>
                  </div>
                </div>
              </CardContent>
            </Card>

           
          </div>

          {/* All ICU Patients List */}
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>All ICU Patients</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-gray-500">Loading ICU patients...</div>
              ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-gray-700">Bed</th>
                      <th className="text-left py-3 px-4 text-gray-700">Patient</th>
                      <th className="text-left py-3 px-4 text-gray-700">Condition</th>
                      <th className="text-left py-3 px-4 text-gray-700">Severity</th>
                      <th className="text-left py-3 px-4 text-gray-700">Doctor</th>
                      <th className="text-left py-3 px-4 text-gray-700">Ventilator</th>
                      <th className="text-left py-3 px-4 text-gray-700">Heart Rate</th>
                      <th className="text-left py-3 px-4 text-gray-700">O₂ Sat</th>
                      <th className="text-left py-3 px-4 text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                      {patients.length === 0 ? (
                        <tr>
                          <td colSpan={9} className="text-center py-8 text-gray-500">
                            No ICU patients found
                          </td>
                        </tr>
                      ) : (
                        patients.map((patient) => (
                      <tr key={patient.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <Badge>{patient.bedNumber}</Badge>
                        </td>
                        <td className="py-3 px-4">
                          <p className="text-gray-900">{patient.patientName}</p>
                          <p className="text-xs text-gray-500">{patient.age}Y / {patient.gender}</p>
                        </td>
                        <td className="py-3 px-4 text-gray-600">{patient.condition}</td>
                        <td className="py-3 px-4">
                          <Badge variant={
                            patient.severity === 'Critical' ? 'destructive' :
                            patient.severity === 'Serious' ? 'default' : 'secondary'
                          }>
                            {patient.severity}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-gray-600">{patient.attendingDoctor}</td>
                        <td className="py-3 px-4">
                          {patient.ventilatorSupport ? (
                            <Badge variant="secondary">
                              <Wind className="size-3 mr-1" />
                              Yes
                            </Badge>
                          ) : (
                            <span className="text-gray-500">No</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-gray-900">{patient.vitals.heartRate} bpm</td>
                        <td className="py-3 px-4">
                          <span className={patient.vitals.oxygenSaturation < 90 ? 'text-red-600' : 'text-gray-900'}>
                            {patient.vitals.oxygenSaturation}%
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              // Navigate to Manage ICU Case page with patient ICU admission ID (UUID)
                              // Prefer patientICUAdmissionId if available, otherwise use id
                              const patientICUAdmissionId = patient.patientICUAdmissionId || patient.id;
                              if (patientICUAdmissionId) {
                                // Ensure it's passed as a string (UUID)
                                window.location.hash = `manageicucase?patientICUAdmissionId=${String(patientICUAdmissionId)}`;
                              } else {
                                console.error('Patient ICU Admission ID not found for navigation');
                              }
                            }}
                          >
                            Manage ICU Case
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
        </TabsContent>
      </Tabs>
      </div>
    </div>
  );
}
