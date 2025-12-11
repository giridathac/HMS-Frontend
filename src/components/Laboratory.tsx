import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Badge } from './ui/badge';
import { TestTube, Search, FileText, Clock, CheckCircle, AlertCircle, Download } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { apiRequest } from '../api/base';
import { PatientLabTest } from '../api/admissions';
import { patientsApi } from '../api/patients';
import { labTestsApi } from '../api/labTests';
import { doctorsApi } from '../api/doctors';
import { patientAppointmentsApi } from '../api/patientAppointments';
import { admissionsApi } from '../api/admissions';
import { emergencyBedSlotsApi } from '../api/emergencyBedSlots';
import { LabTest as LabTestType, Doctor } from '../types';
import { Textarea } from './ui/textarea';
import { DialogFooter } from './ui/dialog';

interface LabTest {
  id: number;
  testId: string;
  patientName: string;
  patientId: string;
  age: number;
  gender: string;
  testName: string;
  category: 'Blood Test' | 'Urine Test' | 'Imaging' | 'Pathology' | 'Radiology' | 'Other';
  orderedBy: string;
  orderedDate: string;
  orderedTime: string;
  priority: 'Routine' | 'Urgent' | 'Emergency';
  status: 'Pending' | 'Sample Collected' | 'In Progress' | 'Completed' | 'Reported';
  sampleCollectedBy?: string;
  technician?: string;
  result?: string;
  reportedDate?: string;
  reportedTime?: string;
}

const mockLabTests: LabTest[] = [
  {
    id: 1,
    testId: 'LAB-2025-001',
    patientName: 'John Smith',
    patientId: 'P-12345',
    age: 45,
    gender: 'Male',
    testName: 'Complete Blood Count (CBC)',
    category: 'Blood Test',
    orderedBy: 'Dr. Sarah Johnson',
    orderedDate: '2025-11-14',
    orderedTime: '09:30 AM',
    priority: 'Routine',
    status: 'Completed',
    sampleCollectedBy: 'Nurse Jane',
    technician: 'Lab Tech Mike',
    result: 'Normal - All parameters within range',
    reportedDate: '2025-11-14',
    reportedTime: '02:30 PM',
  },
  {
    id: 2,
    testId: 'LAB-2025-002',
    patientName: 'Emma Wilson',
    patientId: 'P-12346',
    age: 32,
    gender: 'Female',
    testName: 'ECG',
    category: 'Imaging',
    orderedBy: 'Dr. Sarah Johnson',
    orderedDate: '2025-11-14',
    orderedTime: '10:00 AM',
    priority: 'Urgent',
    status: 'In Progress',
    sampleCollectedBy: 'Nurse Mary',
    technician: 'Cardio Tech Sarah',
  },
  {
    id: 3,
    testId: 'LAB-2025-003',
    patientName: 'Robert Brown',
    patientId: 'P-12347',
    age: 58,
    gender: 'Male',
    testName: 'X-Ray Chest',
    category: 'Radiology',
    orderedBy: 'Dr. Michael Chen',
    orderedDate: '2025-11-14',
    orderedTime: '11:15 AM',
    priority: 'Routine',
    status: 'Sample Collected',
    sampleCollectedBy: 'Radio Tech John',
  },
  {
    id: 4,
    testId: 'LAB-2025-004',
    patientName: 'Lisa Anderson',
    patientId: 'P-12348',
    age: 41,
    gender: 'Female',
    testName: 'Blood Sugar (Fasting)',
    category: 'Blood Test',
    orderedBy: 'Dr. James Miller',
    orderedDate: '2025-11-14',
    orderedTime: '08:00 AM',
    priority: 'Routine',
    status: 'Completed',
    sampleCollectedBy: 'Nurse Jane',
    technician: 'Lab Tech Mike',
    result: '95 mg/dL - Normal',
    reportedDate: '2025-11-14',
    reportedTime: '11:00 AM',
  },
  {
    id: 5,
    testId: 'LAB-2025-005',
    patientName: 'David Martinez',
    patientId: 'P-12349',
    age: 54,
    gender: 'Male',
    testName: 'CT Scan - Chest',
    category: 'Imaging',
    orderedBy: 'Dr. Emily Davis',
    orderedDate: '2025-11-14',
    orderedTime: '01:00 PM',
    priority: 'Emergency',
    status: 'Pending',
  },
  {
    id: 6,
    testId: 'LAB-2025-006',
    patientName: 'Sarah Thompson',
    patientId: 'P-12350',
    age: 38,
    gender: 'Female',
    testName: 'Lipid Profile',
    category: 'Blood Test',
    orderedBy: 'Dr. Sarah Johnson',
    orderedDate: '2025-11-14',
    orderedTime: '09:00 AM',
    priority: 'Routine',
    status: 'Completed',
    sampleCollectedBy: 'Nurse Jane',
    technician: 'Lab Tech Mike',
    result: 'Total Cholesterol: 180 mg/dL - Normal',
    reportedDate: '2025-11-14',
    reportedTime: '12:00 PM',
  },
  {
    id: 7,
    testId: 'LAB-2025-007',
    patientName: 'Michael Chen',
    patientId: 'P-12351',
    age: 62,
    gender: 'Male',
    testName: 'MRI Brain',
    category: 'Imaging',
    orderedBy: 'Dr. Michael Chen',
    orderedDate: '2025-11-14',
    orderedTime: '10:30 AM',
    priority: 'Urgent',
    status: 'In Progress',
    sampleCollectedBy: 'Radio Tech John',
    technician: 'MRI Tech Lisa',
  },
  {
    id: 8,
    testId: 'LAB-2025-008',
    patientName: 'Jennifer Lee',
    patientId: 'P-12352',
    age: 29,
    gender: 'Female',
    testName: 'Urine Culture',
    category: 'Urine Test',
    orderedBy: 'Dr. James Miller',
    orderedDate: '2025-11-14',
    orderedTime: '08:30 AM',
    priority: 'Routine',
    status: 'Sample Collected',
    sampleCollectedBy: 'Nurse Mary',
  },
  {
    id: 9,
    testId: 'LAB-2025-009',
    patientName: 'Christopher White',
    patientId: 'P-12353',
    age: 47,
    gender: 'Male',
    testName: 'Liver Function Test',
    category: 'Blood Test',
    orderedBy: 'Dr. Emily Davis',
    orderedDate: '2025-11-14',
    orderedTime: '11:00 AM',
    priority: 'Routine',
    status: 'Completed',
    sampleCollectedBy: 'Nurse Jane',
    technician: 'Lab Tech Mike',
    result: 'All parameters within normal range',
    reportedDate: '2025-11-14',
    reportedTime: '03:00 PM',
  },
  {
    id: 10,
    testId: 'LAB-2025-010',
    patientName: 'Amanda Garcia',
    patientId: 'P-12354',
    age: 35,
    gender: 'Female',
    testName: 'Ultrasound Abdomen',
    category: 'Imaging',
    orderedBy: 'Dr. Sarah Johnson',
    orderedDate: '2025-11-14',
    orderedTime: '02:00 PM',
    priority: 'Urgent',
    status: 'Pending',
  },
  {
    id: 11,
    testId: 'LAB-2025-011',
    patientName: 'Daniel Kim',
    patientId: 'P-12355',
    age: 56,
    gender: 'Male',
    testName: 'Thyroid Function Test',
    category: 'Blood Test',
    orderedBy: 'Dr. Michael Chen',
    orderedDate: '2025-11-14',
    orderedTime: '09:15 AM',
    priority: 'Routine',
    status: 'Completed',
    sampleCollectedBy: 'Nurse Jane',
    technician: 'Lab Tech Mike',
    result: 'TSH: 2.5 mIU/L - Normal',
    reportedDate: '2025-11-14',
    reportedTime: '01:30 PM',
  },
  {
    id: 12,
    testId: 'LAB-2025-012',
    patientName: 'Maria Rodriguez',
    patientId: 'P-12356',
    age: 43,
    gender: 'Female',
    testName: 'Mammography',
    category: 'Radiology',
    orderedBy: 'Dr. Emily Davis',
    orderedDate: '2025-11-14',
    orderedTime: '10:00 AM',
    priority: 'Routine',
    status: 'Sample Collected',
    sampleCollectedBy: 'Radio Tech John',
  },
  {
    id: 13,
    testId: 'LAB-2025-013',
    patientName: 'James Wilson',
    patientId: 'P-12357',
    age: 51,
    gender: 'Male',
    testName: 'Kidney Function Test',
    category: 'Blood Test',
    orderedBy: 'Dr. James Miller',
    orderedDate: '2025-11-14',
    orderedTime: '08:45 AM',
    priority: 'Routine',
    status: 'In Progress',
    sampleCollectedBy: 'Nurse Mary',
    technician: 'Lab Tech Mike',
  },
  {
    id: 14,
    testId: 'LAB-2025-014',
    patientName: 'Patricia Brown',
    patientId: 'P-12358',
    age: 39,
    gender: 'Female',
    testName: 'Echocardiogram',
    category: 'Imaging',
    orderedBy: 'Dr. Sarah Johnson',
    orderedDate: '2025-11-14',
    orderedTime: '11:30 AM',
    priority: 'Urgent',
    status: 'Completed',
    sampleCollectedBy: 'Cardio Tech Sarah',
    technician: 'Cardio Tech Sarah',
    result: 'Normal cardiac function',
    reportedDate: '2025-11-14',
    reportedTime: '02:00 PM',
  },
  {
    id: 15,
    testId: 'LAB-2025-015',
    patientName: 'Richard Davis',
    patientId: 'P-12359',
    age: 64,
    gender: 'Male',
    testName: 'Prostate Specific Antigen',
    category: 'Blood Test',
    orderedBy: 'Dr. Michael Chen',
    orderedDate: '2025-11-14',
    orderedTime: '09:30 AM',
    priority: 'Routine',
    status: 'Completed',
    sampleCollectedBy: 'Nurse Jane',
    technician: 'Lab Tech Mike',
    result: 'PSA: 2.1 ng/mL - Normal',
    reportedDate: '2025-11-14',
    reportedTime: '12:30 PM',
  },
  {
    id: 16,
    testId: 'LAB-2025-016',
    patientName: 'Linda Martinez',
    patientId: 'P-12360',
    age: 48,
    gender: 'Female',
    testName: 'Pap Smear',
    category: 'Pathology',
    orderedBy: 'Dr. Emily Davis',
    orderedDate: '2025-11-14',
    orderedTime: '10:15 AM',
    priority: 'Routine',
    status: 'Sample Collected',
    sampleCollectedBy: 'Nurse Mary',
  },
  {
    id: 17,
    testId: 'LAB-2025-017',
    patientName: 'Thomas Anderson',
    patientId: 'P-12361',
    age: 55,
    gender: 'Male',
    testName: 'Bone Density Scan',
    category: 'Radiology',
    orderedBy: 'Dr. James Miller',
    orderedDate: '2025-11-14',
    orderedTime: '01:30 PM',
    priority: 'Routine',
    status: 'Pending',
  },
  {
    id: 18,
    testId: 'LAB-2025-018',
    patientName: 'Nancy Taylor',
    patientId: 'P-12362',
    age: 42,
    gender: 'Female',
    testName: 'Hemoglobin A1C',
    category: 'Blood Test',
    orderedBy: 'Dr. Sarah Johnson',
    orderedDate: '2025-11-14',
    orderedTime: '08:00 AM',
    priority: 'Routine',
    status: 'Completed',
    sampleCollectedBy: 'Nurse Jane',
    technician: 'Lab Tech Mike',
    result: 'HbA1c: 5.8% - Normal',
    reportedDate: '2025-11-14',
    reportedTime: '11:00 AM',
  },
  {
    id: 19,
    testId: 'LAB-2025-019',
    patientName: 'William Jackson',
    patientId: 'P-12363',
    age: 60,
    gender: 'Male',
    testName: 'Stress Test',
    category: 'Imaging',
    orderedBy: 'Dr. Michael Chen',
    orderedDate: '2025-11-14',
    orderedTime: '10:45 AM',
    priority: 'Urgent',
    status: 'In Progress',
    sampleCollectedBy: 'Cardio Tech Sarah',
    technician: 'Cardio Tech Sarah',
  },
  {
    id: 20,
    testId: 'LAB-2025-020',
    patientName: 'Susan Harris',
    patientId: 'P-12364',
    age: 36,
    gender: 'Female',
    testName: 'Vitamin D Level',
    category: 'Blood Test',
    orderedBy: 'Dr. Emily Davis',
    orderedDate: '2025-11-14',
    orderedTime: '09:00 AM',
    priority: 'Routine',
    status: 'Completed',
    sampleCollectedBy: 'Nurse Jane',
    technician: 'Lab Tech Mike',
    result: 'Vitamin D: 32 ng/mL - Normal',
    reportedDate: '2025-11-14',
    reportedTime: '01:00 PM',
  },
  {
    id: 21,
    testId: 'LAB-2025-021',
    patientName: 'Charles Moore',
    patientId: 'P-12365',
    age: 59,
    gender: 'Male',
    testName: 'Colonoscopy',
    category: 'Pathology',
    orderedBy: 'Dr. James Miller',
    orderedDate: '2025-11-14',
    orderedTime: '08:30 AM',
    priority: 'Routine',
    status: 'Sample Collected',
    sampleCollectedBy: 'Nurse Mary',
  },
  {
    id: 22,
    testId: 'LAB-2025-022',
    patientName: 'Karen Lewis',
    patientId: 'P-12366',
    age: 44,
    gender: 'Female',
    testName: 'Bone Scan',
    category: 'Radiology',
    orderedBy: 'Dr. Sarah Johnson',
    orderedDate: '2025-11-14',
    orderedTime: '11:00 AM',
    priority: 'Urgent',
    status: 'Pending',
  },
  {
    id: 23,
    testId: 'LAB-2025-023',
    patientName: 'Joseph Walker',
    patientId: 'P-12367',
    age: 52,
    gender: 'Male',
    testName: 'Serum Creatinine',
    category: 'Blood Test',
    orderedBy: 'Dr. Michael Chen',
    orderedDate: '2025-11-14',
    orderedTime: '09:45 AM',
    priority: 'Routine',
    status: 'Completed',
    sampleCollectedBy: 'Nurse Jane',
    technician: 'Lab Tech Mike',
    result: 'Creatinine: 1.0 mg/dL - Normal',
    reportedDate: '2025-11-14',
    reportedTime: '12:00 PM',
  },
  {
    id: 24,
    testId: 'LAB-2025-024',
    patientName: 'Betty Hall',
    patientId: 'P-12368',
    age: 37,
    gender: 'Female',
    testName: 'Pregnancy Test',
    category: 'Urine Test',
    orderedBy: 'Dr. Emily Davis',
    orderedDate: '2025-11-14',
    orderedTime: '10:00 AM',
    priority: 'Routine',
    status: 'Completed',
    sampleCollectedBy: 'Nurse Mary',
    technician: 'Lab Tech Mike',
    result: 'Positive',
    reportedDate: '2025-11-14',
    reportedTime: '11:30 AM',
  },
  {
    id: 25,
    testId: 'LAB-2025-025',
    patientName: 'Robert Allen',
    patientId: 'P-12369',
    age: 61,
    gender: 'Male',
    testName: 'Chest X-Ray',
    category: 'Radiology',
    orderedBy: 'Dr. James Miller',
    orderedDate: '2025-11-14',
    orderedTime: '01:00 PM',
    priority: 'Emergency',
    status: 'In Progress',
    sampleCollectedBy: 'Radio Tech John',
    technician: 'Radio Tech John',
  },
];

// Doctor-wise daily report data
const doctorWiseDailyTests = [
  { doctor: 'Dr. Sarah Johnson', total: 15, pending: 3, completed: 12 },
  { doctor: 'Dr. Michael Chen', total: 12, pending: 4, completed: 8 },
  { doctor: 'Dr. James Miller', total: 10, pending: 2, completed: 8 },
  { doctor: 'Dr. Emily Davis', total: 18, pending: 5, completed: 13 },
  { doctor: 'Dr. Robert Lee', total: 8, pending: 1, completed: 7 },
];

// Weekly trend data
const weeklyTestData = [
  { date: 'Nov 08', tests: 45, completed: 42 },
  { date: 'Nov 09', tests: 52, completed: 48 },
  { date: 'Nov 10', tests: 48, completed: 46 },
  { date: 'Nov 11', tests: 55, completed: 51 },
  { date: 'Nov 12', tests: 50, completed: 47 },
  { date: 'Nov 13', tests: 43, completed: 40 },
  { date: 'Nov 14', tests: 63, completed: 45 },
];

interface TestStatusCounts {
  pending?: number;
  inProgress?: number;
  in_progress?: number;
  completed?: number;
  sampleCollected?: number;
  sample_collected?: number;
  reported?: number;
  total?: number;
  [key: string]: number | undefined; // Allow for other status variations
}

export function Laboratory() {
  const [tests, setTests] = useState<LabTest[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedTest, setSelectedTest] = useState<LabTest | null>(null);
  const [showReportsDialog, setShowReportsDialog] = useState(false);
  const [testStatusCounts, setTestStatusCounts] = useState<TestStatusCounts>({});
  const [countsLoading, setCountsLoading] = useState(false);
  const [countsError, setCountsError] = useState<string | null>(null);
  const [testsLoading, setTestsLoading] = useState(true);
  const [testsError, setTestsError] = useState<string | null>(null);

  // New Lab Order Dialog State
  const [newLabOrderFormData, setNewLabOrderFormData] = useState({
    patientId: '',
    labTestId: '',
    patientType: 'OPD' as 'IPD' | 'OPD' | 'Emergency',
    roomAdmissionId: '',
    appointmentId: '',
    emergencyBedSlotId: '',
    priority: 'Normal' as 'Normal' | 'Urgent',
    testStatus: 'Pending' as 'Pending' | 'InProgress' | 'Completed',
    labTestDone: 'No' as 'Yes' | 'No',
    reportsUrl: '',
    orderedByDoctorId: ''
  });
  const [newLabOrderSubmitting, setNewLabOrderSubmitting] = useState(false);
  const [newLabOrderSubmitError, setNewLabOrderSubmitError] = useState<string | null>(null);
  
  // Searchable dropdowns state
  const [availablePatients, setAvailablePatients] = useState<any[]>([]);
  const [availableLabTests, setAvailableLabTests] = useState<LabTestType[]>([]);
  const [availableDoctors, setAvailableDoctors] = useState<Doctor[]>([]);
  const [availableAppointments, setAvailableAppointments] = useState<any[]>([]);
  const [availableAdmissions, setAvailableAdmissions] = useState<any[]>([]);
  const [availableEmergencyBedSlots, setAvailableEmergencyBedSlots] = useState<any[]>([]);
  
  const [patientSearchTerm, setPatientSearchTerm] = useState('');
  const [labTestSearchTerm, setLabTestSearchTerm] = useState('');
  const [doctorSearchTerm, setDoctorSearchTerm] = useState('');
  const [showPatientList, setShowPatientList] = useState(false);
  const [showLabTestList, setShowLabTestList] = useState(false);
  const [showDoctorList, setShowDoctorList] = useState(false);

  // Fetch test status counts from API
  useEffect(() => {
    const fetchTestStatusCounts = async () => {
      try {
        setCountsLoading(true);
        setCountsError(null);
        console.log('Fetching test status counts from /patient-lab-tests/count/test-status');
        const response = await apiRequest<any>('/patient-lab-tests/count/test-status');
        console.log('Test status counts API response:', JSON.stringify(response, null, 2));
        
        // Handle different response structures
        let countsData: any = {};
        
        if (response && typeof response === 'object') {
          // Check if response has a 'counts' object (new API structure)
          if (response.counts && typeof response.counts === 'object') {
            countsData = response.counts;
          }
          // Check if response has a 'data' object
          else if (response.data && typeof response.data === 'object') {
            // Check if data has a 'counts' object
            if (response.data.counts && typeof response.data.counts === 'object') {
              countsData = response.data.counts;
            } else {
              countsData = response.data;
            }
          }
          // Direct object response
          else {
            countsData = response;
          }
        }
        
        // Map the API response fields to normalized counts
        // API response structure: { counts: { TotalActiveCount, PendingCount, InProgressCount, CompletedCount, NullStatusCount } }
        const normalizedCounts: TestStatusCounts = {
          pending: countsData.PendingCount || countsData.pendingCount || countsData.pending || countsData.Pending || 0,
          inProgress: countsData.InProgressCount || countsData.inProgressCount || countsData.inProgress || countsData.InProgress || 
                     countsData.in_progress || countsData.In_Progress || 0,
          sampleCollected: countsData.SampleCollectedCount || countsData.sampleCollectedCount || 
                          countsData.sampleCollected || countsData.SampleCollected || 
                          countsData.sample_collected || countsData.Sample_Collected || 0,
          completed: countsData.CompletedCount || countsData.completedCount || countsData.completed || countsData.Completed || 0,
          reported: countsData.ReportedCount || countsData.reportedCount || countsData.reported || countsData.Reported || 0,
          total: countsData.TotalActiveCount || countsData.totalActiveCount || countsData.total || countsData.Total || 
                countsData.totalCount || countsData.TotalCount || 0
        };
        
        console.log('Normalized test status counts:', normalizedCounts);
        setTestStatusCounts(normalizedCounts);
      } catch (err) {
        console.error('Error fetching test status counts:', err);
        setCountsError(err instanceof Error ? err.message : 'Failed to load test status counts');
        // Fallback to calculated counts from loaded tests
        setTestStatusCounts({
          pending: tests.filter(t => t.status === 'Pending').length,
          inProgress: tests.filter(t => t.status === 'In Progress' || t.status === 'Sample Collected').length,
          completed: tests.filter(t => t.status === 'Completed' || t.status === 'Reported').length,
          total: tests.length
        });
      } finally {
        setCountsLoading(false);
      }
    };

    fetchTestStatusCounts();
  }, [tests]); // Include tests in dependency array to update counts when tests change

  // Fetch patient lab tests from API
  useEffect(() => {
    const fetchPatientLabTests = async () => {
      try {
        setTestsLoading(true);
        setTestsError(null);
        console.log('Fetching patient lab tests from /patient-lab-tests/with-details');
        const response = await apiRequest<any>('/patient-lab-tests/with-details');
        console.log('Patient lab tests API response (RAW):', JSON.stringify(response, null, 2));
        
        // Handle different response structures
        let labTestsData: any[] = [];
        
        if (Array.isArray(response)) {
          labTestsData = response;
        } else if (response?.data) {
          if (Array.isArray(response.data)) {
            labTestsData = response.data;
          } else if (response.data.patientLabTests && Array.isArray(response.data.patientLabTests)) {
            labTestsData = response.data.patientLabTests;
          } else if (response.data.labTests && Array.isArray(response.data.labTests)) {
            labTestsData = response.data.labTests;
          }
        } else if (response?.patientLabTests && Array.isArray(response.patientLabTests)) {
          labTestsData = response.patientLabTests;
        } else if (response?.labTests && Array.isArray(response.labTests)) {
          labTestsData = response.labTests;
        }
        
        if (!Array.isArray(labTestsData) || labTestsData.length === 0) {
          console.warn('Patient lab tests response is not an array or is empty:', response);
          setTests([]);
          return;
        }
        
        // Helper function to extract field with multiple variations
        const extractField = (data: any, fieldVariations: string[], defaultValue: any = '') => {
          for (const field of fieldVariations) {
            const value = data?.[field];
            if (value !== undefined && value !== null && value !== '') {
              return value;
            }
          }
          return defaultValue;
        };
        
        // Map API response to LabTest interface
        const mappedTests: LabTest[] = labTestsData.map((labTest: any, index: number) => {
          const patientLabTestsId = extractField(labTest, [
            'patientLabTestsId', 'PatientLabTestsId', 'patient_lab_tests_id', 'Patient_Lab_Tests_Id',
            'patientLabTestId', 'PatientLabTestId', 'id', 'Id', 'ID'
          ], index + 1);
          
          const testId = extractField(labTest, [
            'displayTestId', 'DisplayTestId', 'display_test_id', 'Display_Test_Id',
            'testId', 'TestId', 'test_id', 'Test_ID',
            'patientLabTestsId', 'PatientLabTestsId', 'id', 'Id', 'ID'
          ], `LAB-${patientLabTestsId}`);
          
          const patientName = extractField(labTest, [
            'patientName', 'PatientName', 'patient_name', 'Patient_Name',
            'patientFullName', 'PatientFullName', 'name', 'Name'
          ], 'Unknown Patient');
          
          const patientId = extractField(labTest, [
            'patientId', 'PatientId', 'patient_id', 'Patient_ID',
            'patientID', 'PatientID'
          ], 'N/A');
          
          const testName = extractField(labTest, [
            'testName', 'TestName', 'test_name', 'Test_Name',
            'labTestName', 'LabTestName', 'lab_test_name', 'Lab_Test_Name',
            'name', 'Name'
          ], 'Unknown Test');
          
          const category = extractField(labTest, [
            'testCategory', 'TestCategory', 'test_category', 'Test_Category',
            'category', 'Category', 'labTestCategory', 'LabTestCategory'
          ], 'Other');
          
          const orderedBy = extractField(labTest, [
            'orderedBy', 'OrderedBy', 'ordered_by', 'Ordered_By',
            'doctorName', 'DoctorName', 'doctor_name', 'Doctor_Name'
          ], 'N/A');
          
          const orderedDate = extractField(labTest, [
            'orderedDate', 'OrderedDate', 'ordered_date', 'Ordered_Date',
            'createdDate', 'CreatedDate', 'created_date', 'Created_Date',
            'date', 'Date'
          ], new Date().toISOString().split('T')[0]);
          
          const orderedTime = extractField(labTest, [
            'orderedTime', 'OrderedTime', 'ordered_time', 'Ordered_Time',
            'createdTime', 'CreatedTime', 'created_time', 'Created_Time',
            'time', 'Time'
          ], new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }));
          
          const priority = extractField(labTest, [
            'priority', 'Priority', 'testPriority', 'TestPriority'
          ], 'Routine');
          
          const testStatus = extractField(labTest, [
            'testStatus', 'TestStatus', 'test_status', 'Test_Status',
            'status', 'Status'
          ], 'Pending');
          
          // Map testStatus to LabTest status format
          let status: 'Pending' | 'Sample Collected' | 'In Progress' | 'Completed' | 'Reported' = 'Pending';
          if (testStatus) {
            const statusLower = String(testStatus).toLowerCase();
            if (statusLower === 'pending') {
              status = 'Pending';
            } else if (statusLower === 'sample collected' || statusLower === 'samplecollected') {
              status = 'Sample Collected';
            } else if (statusLower === 'in progress' || statusLower === 'inprogress' || statusLower === 'in_progress') {
              status = 'In Progress';
            } else if (statusLower === 'completed' || statusLower === 'done') {
              status = 'Completed';
            } else if (statusLower === 'reported') {
              status = 'Reported';
            }
          }
          
          const age = extractField(labTest, [
            'age', 'Age', 'patientAge', 'PatientAge'
          ], 0);
          
          const gender = extractField(labTest, [
            'gender', 'Gender', 'patientGender', 'PatientGender',
            'sex', 'Sex'
          ], 'N/A');
          
          const sampleCollectedBy = extractField(labTest, [
            'sampleCollectedBy', 'SampleCollectedBy', 'sample_collected_by', 'Sample_Collected_By',
            'collectedBy', 'CollectedBy', 'collected_by', 'Collected_By'
          ], undefined);
          
          const technician = extractField(labTest, [
            'technician', 'Technician', 'assignedTechnician', 'AssignedTechnician',
            'tech', 'Tech'
          ], undefined);
          
          const result = extractField(labTest, [
            'result', 'Result', 'testResult', 'TestResult',
            'report', 'Report'
          ], undefined);
          
          const reportedDate = extractField(labTest, [
            'reportedDate', 'ReportedDate', 'reported_date', 'Reported_Date',
            'resultDate', 'ResultDate', 'result_date', 'Result_Date'
          ], undefined);
          
          const reportedTime = extractField(labTest, [
            'reportedTime', 'ReportedTime', 'reported_time', 'Reported_Time',
            'resultTime', 'ResultTime', 'result_time', 'Result_Time'
          ], undefined);
          
          return {
            id: Number(patientLabTestsId) || index + 1,
            testId: String(testId),
            patientName: String(patientName),
            patientId: String(patientId),
            age: Number(age) || 0,
            gender: String(gender),
            testName: String(testName),
            category: (category as 'Blood Test' | 'Urine Test' | 'Imaging' | 'Pathology' | 'Radiology' | 'Other') || 'Other',
            orderedBy: String(orderedBy),
            orderedDate: String(orderedDate),
            orderedTime: String(orderedTime),
            priority: (priority as 'Routine' | 'Urgent' | 'Emergency') || 'Routine',
            status: status,
            sampleCollectedBy: sampleCollectedBy ? String(sampleCollectedBy) : undefined,
            technician: technician ? String(technician) : undefined,
            result: result ? String(result) : undefined,
            reportedDate: reportedDate ? String(reportedDate) : undefined,
            reportedTime: reportedTime ? String(reportedTime) : undefined
          };
        });
        
        console.log('Mapped patient lab tests:', mappedTests);
        setTests(mappedTests);
      } catch (err) {
        console.error('Error fetching patient lab tests:', err);
        setTestsError(err instanceof Error ? err.message : 'Failed to load patient lab tests');
        // Fallback to empty array or mock data
        setTests([]);
      } finally {
        setTestsLoading(false);
      }
    };

    fetchPatientLabTests();
  }, []); // Empty dependency array - fetch once on mount

  const filteredTests = tests.filter(test =>
    test.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    test.testId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    test.testName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTestsByStatus = (status: string) => {
    return filteredTests.filter(t => t.status === status);
  };

  // Use API counts if available, otherwise fallback to calculated counts
  const pendingCount = testStatusCounts.pending !== undefined ? testStatusCounts.pending : tests.filter(t => t.status === 'Pending').length;
  const inProgressCount = testStatusCounts.inProgress !== undefined ? testStatusCounts.inProgress : 
                         (testStatusCounts.sampleCollected !== undefined ? testStatusCounts.sampleCollected : 0) +
                         tests.filter(t => t.status === 'In Progress' || t.status === 'Sample Collected').length;
  const completedCount = testStatusCounts.completed !== undefined ? testStatusCounts.completed : 
                        (testStatusCounts.reported !== undefined ? testStatusCounts.reported : 0) +
                        tests.filter(t => t.status === 'Completed' || t.status === 'Reported').length;
  const totalCount = testStatusCounts.total !== undefined ? testStatusCounts.total : tests.length;

  // Handle opening New Lab Order dialog
  const handleOpenNewLabOrderDialog = async () => {
    try {
      // Fetch all required data
      const [patientsData, labTestsData, doctorsData] = await Promise.all([
        patientsApi.getAll(),
        labTestsApi.getAll(),
        doctorsApi.getAll()
      ]);
      
      setAvailablePatients(patientsData);
      setAvailableLabTests(labTestsData);
      setAvailableDoctors(doctorsData);
      
      // Reset form
      setNewLabOrderFormData({
        patientId: '',
        labTestId: '',
        patientType: 'OPD',
        roomAdmissionId: '',
        appointmentId: '',
        emergencyBedSlotId: '',
        priority: 'Normal',
        testStatus: 'Pending',
        labTestDone: 'No',
        reportsUrl: '',
        orderedByDoctorId: ''
      });
      
      setPatientSearchTerm('');
      setLabTestSearchTerm('');
      setDoctorSearchTerm('');
      setShowPatientList(false);
      setShowLabTestList(false);
      setShowDoctorList(false);
      setNewLabOrderSubmitError(null);
    } catch (err) {
      console.error('Error fetching data for new lab order:', err);
    }
  };

  // Handle PatientType change - fetch conditional data
  const handlePatientTypeChange = async (patientType: 'IPD' | 'OPD' | 'Emergency') => {
    setNewLabOrderFormData({
      ...newLabOrderFormData,
      patientType,
      roomAdmissionId: '',
      appointmentId: '',
      emergencyBedSlotId: ''
    });

    try {
      if (patientType === 'IPD') {
        const admissions = await admissionsApi.getAll();
        setAvailableAdmissions(admissions);
      } else if (patientType === 'OPD') {
        const appointments = await patientAppointmentsApi.getAll({ status: 'Active' });
        setAvailableAppointments(appointments);
      } else if (patientType === 'Emergency') {
        const bedSlots = await emergencyBedSlotsApi.getAll('Active');
        setAvailableEmergencyBedSlots(bedSlots);
      }
    } catch (err) {
      console.error(`Error fetching ${patientType} data:`, err);
    }
  };

  // Handle saving New Lab Order
  const handleSaveNewLabOrder = async () => {
    try {
      setNewLabOrderSubmitting(true);
      setNewLabOrderSubmitError(null);

      // Validate required fields
      if (!newLabOrderFormData.patientId) {
        throw new Error('Patient is required');
      }
      if (!newLabOrderFormData.labTestId) {
        throw new Error('Lab Test is required');
      }
      if (!newLabOrderFormData.orderedByDoctorId) {
        throw new Error('Ordered By Doctor is required');
      }

      // Validate conditional fields based on PatientType
      if (newLabOrderFormData.patientType === 'IPD' && !newLabOrderFormData.roomAdmissionId) {
        throw new Error('Room Admission ID is required for IPD');
      }
      if (newLabOrderFormData.patientType === 'OPD' && !newLabOrderFormData.appointmentId) {
        throw new Error('Appointment ID is required for OPD');
      }
      if (newLabOrderFormData.patientType === 'Emergency' && !newLabOrderFormData.emergencyBedSlotId) {
        throw new Error('Emergency Bed Slot ID is required for Emergency');
      }

      // Construct payload
      const payload: any = {
        PatientId: newLabOrderFormData.patientId,
        LabTestId: Number(newLabOrderFormData.labTestId),
        PatientType: newLabOrderFormData.patientType,
        Priority: newLabOrderFormData.priority,
        TestStatus: newLabOrderFormData.testStatus,
        LabTestDone: newLabOrderFormData.labTestDone,
        OrderedByDoctorId: Number(newLabOrderFormData.orderedByDoctorId),
        OrderedDate: new Date().toISOString().split('T')[0]
      };

      // Add conditional fields
      if (newLabOrderFormData.patientType === 'IPD' && newLabOrderFormData.roomAdmissionId) {
        payload.RoomAdmissionId = Number(newLabOrderFormData.roomAdmissionId);
      }
      if (newLabOrderFormData.patientType === 'OPD' && newLabOrderFormData.appointmentId) {
        payload.AppointmentId = Number(newLabOrderFormData.appointmentId);
      }
      if (newLabOrderFormData.patientType === 'Emergency' && newLabOrderFormData.emergencyBedSlotId) {
        payload.EmergencyBedSlotId = Number(newLabOrderFormData.emergencyBedSlotId);
      }

      // Add optional fields
      if (newLabOrderFormData.reportsUrl) {
        payload.ReportsUrl = newLabOrderFormData.reportsUrl;
      }

      console.log('Saving new lab order with payload:', payload);
      await apiRequest('/patient-lab-tests', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      // Close dialog and reset form
      setIsAddDialogOpen(false);
      setNewLabOrderFormData({
        patientId: '',
        labTestId: '',
        patientType: 'OPD',
        roomAdmissionId: '',
        appointmentId: '',
        emergencyBedSlotId: '',
        priority: 'Normal',
        testStatus: 'Pending',
        labTestDone: 'No',
        reportsUrl: '',
        orderedByDoctorId: ''
      });
      setPatientSearchTerm('');
      setLabTestSearchTerm('');
      setDoctorSearchTerm('');
      setShowPatientList(false);
      setShowLabTestList(false);
      setShowDoctorList(false);
      
      // Refresh the tests list by calling the fetch function
      window.location.reload(); // Simple refresh for now - could be optimized to refetch only
    } catch (err) {
      console.error('Error saving new lab order:', err);
      setNewLabOrderSubmitError(err instanceof Error ? err.message : 'Failed to save lab order');
    } finally {
      setNewLabOrderSubmitting(false);
    }
  };

  return (
    <div className="flex-1 bg-blue-100 flex flex-col overflow-hidden min-h-0">
      <div className="px-4 pt-4 pb-0 flex-shrink-0">
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
          <div>
            <h1 className="text-gray-900 mb-1 text-2xl">Laboratory Management</h1>
            <p className="text-gray-500 text-sm">Manage lab tests, samples, and reports</p>
          </div>
          <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={() => setShowReportsDialog(true)}>
            <FileText className="size-4" />
            View Reports
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
            setIsAddDialogOpen(open);
            if (open) {
              handleOpenNewLabOrderDialog();
            }
          }}>
            <DialogTrigger asChild>
              <Button className="gap-2" onClick={handleOpenNewLabOrderDialog}>
                <TestTube className="size-4" />
                New Lab Order
              </Button>
            </DialogTrigger>
            <DialogContent className="p-0 gap-0 large-dialog max-w-4xl">
              <DialogHeader className="px-6 pt-4 pb-3 flex-shrink-0">
                <DialogTitle>New Lab Order</DialogTitle>
              </DialogHeader>
              <div className="flex-1 overflow-y-auto px-6 pb-1 patient-list-scrollable min-h-0">
                <div className="space-y-4 py-4">
                  {/* Patient Selection - Searchable */}
                  <div>
                    <Label htmlFor="patientId">Patient *</Label>
                    <div className="relative">
                      <Input
                        id="patientId"
                        placeholder="Search patient by name, ID, or phone..."
                        value={patientSearchTerm}
                        onChange={(e) => {
                          setPatientSearchTerm(e.target.value);
                          setShowPatientList(true);
                        }}
                        onFocus={() => setShowPatientList(true)}
                      />
                      {showPatientList && availablePatients.length > 0 && (
                        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                          <table className="w-full text-sm">
                            <thead className="bg-gray-50 sticky top-0">
                              <tr>
                                <th className="py-2 px-3 text-left text-xs font-medium text-gray-700">Patient No</th>
                                <th className="py-2 px-3 text-left text-xs font-medium text-gray-700">Name</th>
                                <th className="py-2 px-3 text-left text-xs font-medium text-gray-700">Phone</th>
                              </tr>
                            </thead>
                            <tbody>
                              {availablePatients.filter((patient: any) => {
                                if (!patientSearchTerm) return true;
                                const searchLower = patientSearchTerm.toLowerCase();
                                const patientId = (patient as any).patientId || (patient as any).PatientId || '';
                                const patientNo = (patient as any).patientNo || (patient as any).PatientNo || '';
                                const patientName = (patient as any).patientName || (patient as any).PatientName || '';
                                const lastName = (patient as any).lastName || (patient as any).LastName || '';
                                const fullName = `${patientName} ${lastName}`.trim();
                                const phoneNo = (patient as any).phoneNo || (patient as any).PhoneNo || (patient as any).phone || '';
                                return (
                                  patientId.toLowerCase().includes(searchLower) ||
                                  patientNo.toLowerCase().includes(searchLower) ||
                                  fullName.toLowerCase().includes(searchLower) ||
                                  phoneNo.includes(patientSearchTerm)
                                );
                              }).map((patient: any) => {
                                const patientId = (patient as any).patientId || (patient as any).PatientId || '';
                                const patientNo = (patient as any).patientNo || (patient as any).PatientNo || patientId.substring(0, 8);
                                const patientName = (patient as any).patientName || (patient as any).PatientName || '';
                                const lastName = (patient as any).lastName || (patient as any).LastName || '';
                                const fullName = `${patientName} ${lastName}`.trim();
                                const phoneNo = (patient as any).phoneNo || (patient as any).PhoneNo || (patient as any).phone || '';
                                const isSelected = newLabOrderFormData.patientId === patientId;
                                return (
                                  <tr
                                    key={patientId}
                                    onClick={() => {
                                      setNewLabOrderFormData({ ...newLabOrderFormData, patientId });
                                      setPatientSearchTerm(`${patientNo ? `${patientNo} - ` : ''}${fullName || 'Unknown'}`);
                                      setShowPatientList(false);
                                    }}
                                    className={`border-b border-gray-100 cursor-pointer hover:bg-blue-50 ${isSelected ? 'bg-blue-100' : ''}`}
                                  >
                                    <td className="py-2 px-3 text-sm text-gray-900 font-mono">{patientNo}</td>
                                    <td className="py-2 px-3 text-sm text-gray-600">{fullName || 'Unknown'}</td>
                                    <td className="py-2 px-3 text-sm text-gray-600">{phoneNo || '-'}</td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Lab Test Selection - Searchable */}
                  <div>
                    <Label htmlFor="labTestId">Lab Test *</Label>
                    <div className="relative">
                      <Input
                        id="labTestId"
                        placeholder="Search lab test by name..."
                        value={labTestSearchTerm}
                        onChange={(e) => {
                          setLabTestSearchTerm(e.target.value);
                          setShowLabTestList(true);
                        }}
                        onFocus={() => setShowLabTestList(true)}
                      />
                      {showLabTestList && availableLabTests.length > 0 && (
                        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                          <table className="w-full text-sm">
                            <thead className="bg-gray-50 sticky top-0">
                              <tr>
                                <th className="py-2 px-3 text-left text-xs font-medium text-gray-700">Test Name</th>
                                <th className="py-2 px-3 text-left text-xs font-medium text-gray-700">Category</th>
                              </tr>
                            </thead>
                            <tbody>
                              {availableLabTests.filter((test: any) => {
                                if (!labTestSearchTerm) return true;
                                const searchLower = labTestSearchTerm.toLowerCase();
                                const testName = test.labTestName || test.LabTestName || test.name || test.Name || '';
                                return testName.toLowerCase().includes(searchLower);
                              }).map((test: any) => {
                                const testId = test.labTestId || test.LabTestId || test.id || test.Id || '';
                                const testName = test.labTestName || test.LabTestName || test.name || test.Name || '';
                                const category = test.testCategory || test.TestCategory || test.category || test.Category || '';
                                const isSelected = newLabOrderFormData.labTestId === String(testId);
                                return (
                                  <tr
                                    key={testId}
                                    onClick={() => {
                                      setNewLabOrderFormData({ ...newLabOrderFormData, labTestId: String(testId) });
                                      setLabTestSearchTerm(testName);
                                      setShowLabTestList(false);
                                    }}
                                    className={`border-b border-gray-100 cursor-pointer hover:bg-blue-50 ${isSelected ? 'bg-blue-100' : ''}`}
                                  >
                                    <td className="py-2 px-3 text-sm text-gray-900">{testName}</td>
                                    <td className="py-2 px-3 text-sm text-gray-600">{category || '-'}</td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Patient Type */}
                  <div>
                    <Label htmlFor="patientType">Patient Type *</Label>
                    <select
                      id="patientType"
                      className="w-full px-3 py-2 border border-gray-200 rounded-md"
                      value={newLabOrderFormData.patientType}
                      onChange={(e) => handlePatientTypeChange(e.target.value as 'IPD' | 'OPD' | 'Emergency')}
                    >
                      <option value="OPD">OPD</option>
                      <option value="IPD">IPD</option>
                      <option value="Emergency">Emergency</option>
                    </select>
                  </div>

                  {/* Conditional Fields based on PatientType */}
                  {newLabOrderFormData.patientType === 'IPD' && (
                    <div>
                      <Label htmlFor="roomAdmissionId">Room Admission ID *</Label>
                      <select
                        id="roomAdmissionId"
                        className="w-full px-3 py-2 border border-gray-200 rounded-md"
                        value={newLabOrderFormData.roomAdmissionId}
                        onChange={(e) => setNewLabOrderFormData({ ...newLabOrderFormData, roomAdmissionId: e.target.value })}
                      >
                        <option value="">Select Room Admission</option>
                        {availableAdmissions.map((admission: any) => {
                          const admissionId = admission.roomAdmissionId || admission.admissionId || admission.id || '';
                          const patientName = admission.patientName || admission.PatientName || '';
                          const bedNumber = admission.bedNumber || admission.BedNumber || '';
                          return (
                            <option key={admissionId} value={String(admissionId)}>
                              {patientName} - Bed {bedNumber}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  )}

                  {newLabOrderFormData.patientType === 'OPD' && (
                    <div>
                      <Label htmlFor="appointmentId">Appointment ID *</Label>
                      <select
                        id="appointmentId"
                        className="w-full px-3 py-2 border border-gray-200 rounded-md"
                        value={newLabOrderFormData.appointmentId}
                        onChange={(e) => setNewLabOrderFormData({ ...newLabOrderFormData, appointmentId: e.target.value })}
                      >
                        <option value="">Select Appointment</option>
                        {availableAppointments.map((appointment: any) => {
                          const appointmentId = appointment.id || appointment.patientAppointmentId || '';
                          const tokenNo = appointment.tokenNo || appointment.TokenNo || '';
                          return (
                            <option key={appointmentId} value={String(appointmentId)}>
                              {tokenNo} - {appointment.patientId?.substring(0, 8) || ''}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  )}

                  {newLabOrderFormData.patientType === 'Emergency' && (
                    <div>
                      <Label htmlFor="emergencyBedSlotId">Emergency Bed Slot ID *</Label>
                      <select
                        id="emergencyBedSlotId"
                        className="w-full px-3 py-2 border border-gray-200 rounded-md"
                        value={newLabOrderFormData.emergencyBedSlotId}
                        onChange={(e) => setNewLabOrderFormData({ ...newLabOrderFormData, emergencyBedSlotId: e.target.value })}
                      >
                        <option value="">Select Emergency Bed Slot</option>
                        {availableEmergencyBedSlots.map((slot: any) => {
                          const slotId = slot.emergencyBedSlotId || slot.id || slot.EmergencyBedSlotId || '';
                          const slotNo = slot.eBedSlotNo || slot.EBedSlotNo || slot.slotNo || '';
                          return (
                            <option key={slotId} value={String(slotId)}>
                              Slot {slotNo}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  )}

                  {/* Priority */}
                  <div>
                    <Label htmlFor="priority">Priority *</Label>
                    <select
                      id="priority"
                      className="w-full px-3 py-2 border border-gray-200 rounded-md"
                      value={newLabOrderFormData.priority}
                      onChange={(e) => setNewLabOrderFormData({ ...newLabOrderFormData, priority: e.target.value as 'Normal' | 'Urgent' })}
                    >
                      <option value="Normal">Normal</option>
                      <option value="Urgent">Urgent</option>
                    </select>
                  </div>

                  {/* Test Status */}
                  <div>
                    <Label htmlFor="testStatus">Test Status *</Label>
                    <select
                      id="testStatus"
                      className="w-full px-3 py-2 border border-gray-200 rounded-md"
                      value={newLabOrderFormData.testStatus}
                      onChange={(e) => setNewLabOrderFormData({ ...newLabOrderFormData, testStatus: e.target.value as 'Pending' | 'InProgress' | 'Completed' })}
                    >
                      <option value="Pending">Pending</option>
                      <option value="InProgress">InProgress</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>

                  {/* Lab Test Done */}
                  <div>
                    <Label htmlFor="labTestDone">Lab Test Done *</Label>
                    <select
                      id="labTestDone"
                      className="w-full px-3 py-2 border border-gray-200 rounded-md"
                      value={newLabOrderFormData.labTestDone}
                      onChange={(e) => setNewLabOrderFormData({ ...newLabOrderFormData, labTestDone: e.target.value as 'Yes' | 'No' })}
                    >
                      <option value="No">No</option>
                      <option value="Yes">Yes</option>
                    </select>
                  </div>

                  {/* Report URL */}
                  <div>
                    <Label htmlFor="reportsUrl">Report URL</Label>
                    <Input
                      id="reportsUrl"
                      placeholder="Enter report URL (optional)"
                      value={newLabOrderFormData.reportsUrl}
                      onChange={(e) => setNewLabOrderFormData({ ...newLabOrderFormData, reportsUrl: e.target.value })}
                    />
                  </div>

                  {/* Ordered By Doctor - Searchable */}
                  <div>
                    <Label htmlFor="orderedByDoctorId">Ordered By Doctor *</Label>
                    <div className="relative">
                      <Input
                        id="orderedByDoctorId"
                        placeholder="Search doctor by name..."
                        value={doctorSearchTerm}
                        onChange={(e) => {
                          setDoctorSearchTerm(e.target.value);
                          setShowDoctorList(true);
                        }}
                        onFocus={() => setShowDoctorList(true)}
                      />
                      {showDoctorList && availableDoctors.length > 0 && (
                        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                          <table className="w-full text-sm">
                            <thead className="bg-gray-50 sticky top-0">
                              <tr>
                                <th className="py-2 px-3 text-left text-xs font-medium text-gray-700">Doctor Name</th>
                                <th className="py-2 px-3 text-left text-xs font-medium text-gray-700">Specialization</th>
                              </tr>
                            </thead>
                            <tbody>
                              {availableDoctors.filter((doctor: any) => {
                                if (!doctorSearchTerm) return true;
                                const searchLower = doctorSearchTerm.toLowerCase();
                                const doctorName = doctor.name || doctor.Name || doctor.doctorName || doctor.DoctorName || '';
                                const specialization = doctor.specialization || doctor.Specialization || doctor.speciality || doctor.Speciality || '';
                                return (
                                  doctorName.toLowerCase().includes(searchLower) ||
                                  specialization.toLowerCase().includes(searchLower)
                                );
                              }).map((doctor: any) => {
                                const doctorId = doctor.id || doctor.Id || doctor.doctorId || doctor.DoctorId || '';
                                const doctorName = doctor.name || doctor.Name || doctor.doctorName || doctor.DoctorName || '';
                                const specialization = doctor.specialization || doctor.Specialization || doctor.speciality || doctor.Speciality || '';
                                const isSelected = newLabOrderFormData.orderedByDoctorId === String(doctorId);
                                return (
                                  <tr
                                    key={doctorId}
                                    onClick={() => {
                                      setNewLabOrderFormData({ ...newLabOrderFormData, orderedByDoctorId: String(doctorId) });
                                      setDoctorSearchTerm(doctorName);
                                      setShowDoctorList(false);
                                    }}
                                    className={`border-b border-gray-100 cursor-pointer hover:bg-blue-50 ${isSelected ? 'bg-blue-100' : ''}`}
                                  >
                                    <td className="py-2 px-3 text-sm text-gray-900">{doctorName}</td>
                                    <td className="py-2 px-3 text-sm text-gray-600">{specialization || '-'}</td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Error Message */}
                  {newLabOrderSubmitError && (
                    <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
                      {newLabOrderSubmitError}
                    </div>
                  )}
                </div>
              </div>
              <DialogFooter className="px-6 py-3 flex-shrink-0 border-t">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveNewLabOrder} disabled={newLabOrderSubmitting}>
                  {newLabOrderSubmitting ? 'Saving...' : 'Save Lab Order'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          </div>
        </div>
      </div>

      <div className="overflow-y-auto overflow-x-hidden px-4 pt-4 pb-4 laboratory-scrollable" style={{ maxHeight: 'calc(100vh - 60px)', minHeight: 0 }}>
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-500">Total Tests Today</p>
              <TestTube className="size-5 text-blue-600" />
            </div>
            {countsLoading ? (
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-16"></div>
              </div>
            ) : (
              <>
                <h3 className="text-gray-900">{totalCount}</h3>
                <p className="text-xs text-gray-500">Active orders</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-500">Pending</p>
              <Clock className="size-5 text-orange-600" />
            </div>
            {countsLoading ? (
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-16"></div>
              </div>
            ) : (
              <>
                <h3 className="text-gray-900">{pendingCount}</h3>
                <p className="text-xs text-gray-500">Awaiting sample</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-500">In Progress</p>
              <AlertCircle className="size-5 text-blue-600" />
            </div>
            {countsLoading ? (
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-16"></div>
              </div>
            ) : (
              <>
                <h3 className="text-gray-900">{inProgressCount}</h3>
                <p className="text-xs text-gray-500">Being processed</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-500">Completed</p>
              <CheckCircle className="size-5 text-green-600" />
            </div>
            {countsLoading ? (
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-16"></div>
              </div>
            ) : (
              <>
                <h3 className="text-gray-900">{completedCount}</h3>
                <p className="text-xs text-gray-500">Reports ready</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
            <Input
              placeholder="Search by patient name, test ID, or test name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tests List */}
      {testsLoading ? (
        <Card className="mb-4">
          <CardContent className="p-6">
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-gray-500">Loading lab tests...</p>
            </div>
          </CardContent>
        </Card>
      ) : testsError ? (
        <Card className="mb-4">
          <CardContent className="p-6">
            <div className="text-center py-12">
              <p className="text-red-600 mb-2">{testsError}</p>
              <Button variant="outline" onClick={() => window.location.reload()}>
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList>
            <TabsTrigger value="all">All Tests ({filteredTests.length})</TabsTrigger>
            <TabsTrigger value="pending">Pending ({getTestsByStatus('Pending').length})</TabsTrigger>
            <TabsTrigger value="progress">In Progress ({getTestsByStatus('In Progress').length + getTestsByStatus('Sample Collected').length})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({getTestsByStatus('Completed').length + getTestsByStatus('Reported').length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <TestsList tests={filteredTests} onSelectTest={setSelectedTest} />
          </TabsContent>
          <TabsContent value="pending">
            <TestsList tests={getTestsByStatus('Pending')} onSelectTest={setSelectedTest} />
          </TabsContent>
          <TabsContent value="progress">
            <TestsList 
              tests={[...getTestsByStatus('In Progress'), ...getTestsByStatus('Sample Collected')]} 
              onSelectTest={setSelectedTest} 
            />
          </TabsContent>
          <TabsContent value="completed">
            <TestsList 
              tests={[...getTestsByStatus('Completed'), ...getTestsByStatus('Reported')]} 
              onSelectTest={setSelectedTest} 
            />
          </TabsContent>
        </Tabs>
      )}
      </div>

      {/* Test Details Dialog */}
      <Dialog open={!!selectedTest} onOpenChange={() => setSelectedTest(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Lab Test Details</DialogTitle>
          </DialogHeader>
          {selectedTest && (
            <div className="space-y-4 py-4">
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div>
                  <h3 className="text-gray-900 mb-1">{selectedTest.testName}</h3>
                  <p className="text-sm text-gray-600">{selectedTest.testId}</p>
                </div>
                <Badge variant={
                  selectedTest.status === 'Completed' || selectedTest.status === 'Reported' ? 'default' :
                  selectedTest.status === 'In Progress' || selectedTest.status === 'Sample Collected' ? 'secondary' :
                  'outline'
                }>
                  {selectedTest.status}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Patient</p>
                  <p className="text-gray-900">{selectedTest.patientName}</p>
                  <p className="text-xs text-gray-500">{selectedTest.patientId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Age / Gender</p>
                  <p className="text-gray-900">{selectedTest.age}Y / {selectedTest.gender}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Category</p>
                  <p className="text-gray-900">{selectedTest.category}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Priority</p>
                  <Badge variant={
                    selectedTest.priority === 'Emergency' ? 'destructive' :
                    selectedTest.priority === 'Urgent' ? 'default' : 'secondary'
                  }>
                    {selectedTest.priority}
                  </Badge>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Ordered By</p>
                    <p className="text-gray-900">{selectedTest.orderedBy}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Ordered Date/Time</p>
                    <p className="text-gray-900">{selectedTest.orderedDate} at {selectedTest.orderedTime}</p>
                  </div>
                </div>
              </div>

              {selectedTest.sampleCollectedBy && (
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-500">Sample Collected By</p>
                  <p className="text-gray-900">{selectedTest.sampleCollectedBy}</p>
                </div>
              )}

              {selectedTest.technician && (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-500">Assigned Technician</p>
                  <p className="text-gray-900">{selectedTest.technician}</p>
                </div>
              )}

              {selectedTest.result && (
                <div className="p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
                  <p className="text-sm text-gray-500 mb-2">Test Result</p>
                  <p className="text-gray-900">{selectedTest.result}</p>
                  {selectedTest.reportedDate && (
                    <p className="text-xs text-gray-500 mt-2">
                      Reported on {selectedTest.reportedDate} at {selectedTest.reportedTime}
                    </p>
                  )}
                </div>
              )}

              <div className="flex justify-end gap-2">
                {selectedTest.status === 'Pending' && (
                  <Button>Collect Sample</Button>
                )}
                {selectedTest.status === 'Sample Collected' && (
                  <Button>Start Processing</Button>
                )}
                {selectedTest.status === 'In Progress' && (
                  <Button>Upload Result</Button>
                )}
                {(selectedTest.status === 'Completed' || selectedTest.status === 'Reported') && (
                  <Button className="gap-2">
                    <Download className="size-4" />
                    Download Report
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reports Dialog */}
      <Dialog open={showReportsDialog} onOpenChange={setShowReportsDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Laboratory Reports</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <Tabs defaultValue="daily">
              <TabsList>
                <TabsTrigger value="daily">Daily Report</TabsTrigger>
                <TabsTrigger value="weekly">Weekly Report</TabsTrigger>
              </TabsList>

              <TabsContent value="daily" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Doctor-wise Lab Tests - Today</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-3 px-4 text-gray-700">Doctor</th>
                            <th className="text-left py-3 px-4 text-gray-700">Total Tests</th>
                            <th className="text-left py-3 px-4 text-gray-700">Pending</th>
                            <th className="text-left py-3 px-4 text-gray-700">Completed</th>
                            <th className="text-left py-3 px-4 text-gray-700">Completion Rate</th>
                          </tr>
                        </thead>
                        <tbody>
                          {doctorWiseDailyTests.map((doc, index) => {
                            const completionRate = Math.round((doc.completed / doc.total) * 100);
                            return (
                              <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                                <td className="py-3 px-4 text-gray-900">{doc.doctor}</td>
                                <td className="py-3 px-4 text-gray-900">{doc.total}</td>
                                <td className="py-3 px-4">
                                  <Badge variant="outline">{doc.pending}</Badge>
                                </td>
                                <td className="py-3 px-4">
                                  <Badge variant="default">{doc.completed}</Badge>
                                </td>
                                <td className="py-3 px-4">
                                  <span className={completionRate >= 80 ? 'text-green-600' : 'text-orange-600'}>
                                    {completionRate}%
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Daily Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-4 gap-4">
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <p className="text-sm text-gray-500 mb-1">Total Tests</p>
                        <p className="text-2xl text-gray-900">
                          {doctorWiseDailyTests.reduce((sum, doc) => sum + doc.total, 0)}
                        </p>
                      </div>
                      <div className="p-4 bg-orange-50 rounded-lg">
                        <p className="text-sm text-gray-500 mb-1">Pending</p>
                        <p className="text-2xl text-gray-900">
                          {doctorWiseDailyTests.reduce((sum, doc) => sum + doc.pending, 0)}
                        </p>
                      </div>
                      <div className="p-4 bg-green-50 rounded-lg">
                        <p className="text-sm text-gray-500 mb-1">Completed</p>
                        <p className="text-2xl text-gray-900">
                          {doctorWiseDailyTests.reduce((sum, doc) => sum + doc.completed, 0)}
                        </p>
                      </div>
                      <div className="p-4 bg-purple-50 rounded-lg">
                        <p className="text-sm text-gray-500 mb-1">Avg. TAT</p>
                        <p className="text-2xl text-gray-900">3.2h</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="weekly" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Weekly Lab Test Trend</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={weeklyTestData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="tests" fill="#3b82f6" name="Total Tests" />
                        <Bar dataKey="completed" fill="#10b981" name="Completed" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Weekly Summary (Nov 08 - Nov 14)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-4 gap-4">
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <p className="text-sm text-gray-500 mb-1">Total Tests</p>
                        <p className="text-2xl text-gray-900">
                          {weeklyTestData.reduce((sum, day) => sum + day.tests, 0)}
                        </p>
                      </div>
                      <div className="p-4 bg-green-50 rounded-lg">
                        <p className="text-sm text-gray-500 mb-1">Completed</p>
                        <p className="text-2xl text-gray-900">
                          {weeklyTestData.reduce((sum, day) => sum + day.completed, 0)}
                        </p>
                      </div>
                      <div className="p-4 bg-purple-50 rounded-lg">
                        <p className="text-sm text-gray-500 mb-1">Daily Average</p>
                        <p className="text-2xl text-gray-900">
                          {Math.round(weeklyTestData.reduce((sum, day) => sum + day.tests, 0) / 7)}
                        </p>
                      </div>
                      <div className="p-4 bg-orange-50 rounded-lg">
                        <p className="text-sm text-gray-500 mb-1">Completion Rate</p>
                        <p className="text-2xl text-gray-900">
                          {Math.round((weeklyTestData.reduce((sum, day) => sum + day.completed, 0) / 
                            weeklyTestData.reduce((sum, day) => sum + day.tests, 0)) * 100)}%
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end">
              <Button className="gap-2">
                <Download className="size-4" />
                Export Report
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function TestsList({ tests, onSelectTest }: { tests: LabTest[]; onSelectTest: (test: LabTest) => void }) {
  return (
    <Card className="mb-4">
      <CardContent className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-gray-700">Test ID</th>
                <th className="text-left py-3 px-4 text-gray-700">Patient</th>
                <th className="text-left py-3 px-4 text-gray-700">Test Name</th>
                <th className="text-left py-3 px-4 text-gray-700">Category</th>
                <th className="text-left py-3 px-4 text-gray-700">Ordered By</th>
                <th className="text-left py-3 px-4 text-gray-700">Priority</th>
                <th className="text-left py-3 px-4 text-gray-700">Status</th>
                <th className="text-left py-3 px-4 text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tests.map((test) => (
                <tr key={test.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <span className="text-sm text-gray-900">{test.testId}</span>
                  </td>
                  <td className="py-3 px-4">
                    <p className="text-gray-900">{test.patientName}</p>
                    <p className="text-xs text-gray-500">{test.patientId}</p>
                  </td>
                  <td className="py-3 px-4 text-gray-900">{test.testName}</td>
                  <td className="py-3 px-4">
                    <Badge variant="outline">{test.category}</Badge>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{test.orderedBy}</td>
                  <td className="py-3 px-4">
                    <Badge variant={
                      test.priority === 'Emergency' ? 'destructive' :
                      test.priority === 'Urgent' ? 'default' : 'secondary'
                    }>
                      {test.priority}
                    </Badge>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-3 py-1 rounded-full text-xs ${
                      test.status === 'Completed' || test.status === 'Reported' ? 'bg-green-100 text-green-700' :
                      test.status === 'In Progress' || test.status === 'Sample Collected' ? 'bg-blue-100 text-blue-700' :
                      'bg-orange-100 text-orange-700'
                    }`}>
                      {test.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <Button variant="outline" size="sm" onClick={() => onSelectTest(test)}>
                      View Details
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {tests.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No lab tests found
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
