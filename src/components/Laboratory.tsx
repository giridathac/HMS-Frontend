
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Badge } from './ui/badge';
import { TestTube, Search, FileText, Clock, CheckCircle, AlertCircle, Download, Eye, Edit } from 'lucide-react';
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
  
  // View and Edit PatientLabTest state
  const [viewingPatientLabTest, setViewingPatientLabTest] = useState<any>(null);
  const [isViewPatientLabTestDialogOpen, setIsViewPatientLabTestDialogOpen] = useState(false);
  const [editingPatientLabTest, setEditingPatientLabTest] = useState<any>(null);
  const [isEditPatientLabTestDialogOpen, setIsEditPatientLabTestDialogOpen] = useState(false);
  const [editPatientLabTestFormData, setEditPatientLabTestFormData] = useState<any>(null);
  const [editPatientLabTestSubmitting, setEditPatientLabTestSubmitting] = useState(false);
  const [editPatientLabTestSubmitError, setEditPatientLabTestSubmitError] = useState<string | null>(null);

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
        
        // Helper function to extract field with multiple variations and nested objects
        const extractField = (data: any, fieldVariations: string[], defaultValue: any = '') => {
          if (!data) return defaultValue;
          
          for (const field of fieldVariations) {
            // Handle nested objects (e.g., Patient.PatientName, LabTest.TestName)
            if (field.includes('.')) {
              const parts = field.split('.');
              let value = data;
              for (const part of parts) {
                if (value && typeof value === 'object') {
                  value = value[part];
                } else {
                  value = undefined;
                  break;
                }
              }
              if (value !== undefined && value !== null && value !== '') {
                return value;
              }
            } else {
              // Direct field access
              const value = data[field];
              if (value !== undefined && value !== null && value !== '') {
                return value;
              }
            }
          }
          
          // Try nested object access (e.g., Patient.PatientName)
          for (const field of fieldVariations) {
            if (data.Patient && data.Patient[field]) {
              const value = data.Patient[field];
              if (value !== undefined && value !== null && value !== '') {
                return value;
              }
            }
            if (data.LabTest && data.LabTest[field]) {
              const value = data.LabTest[field];
              if (value !== undefined && value !== null && value !== '') {
                return value;
              }
            }
            if (data.patient && data.patient[field]) {
              const value = data.patient[field];
              if (value !== undefined && value !== null && value !== '') {
                return value;
              }
            }
            if (data.labTest && data.labTest[field]) {
              const value = data.labTest[field];
              if (value !== undefined && value !== null && value !== '') {
                return value;
              }
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
            'patientFullName', 'PatientFullName', 'Patient.PatientName', 'Patient.patientName',
            'Patient.Name', 'Patient.name', 'name', 'Name'
          ], 'Unknown Patient');
          
          const patientId = extractField(labTest, [
            'patientId', 'PatientId', 'patient_id', 'Patient_ID',
            'patientID', 'PatientID', 'Patient.PatientId', 'Patient.patientId',
            'Patient.Id', 'Patient.id'
          ], 'N/A');
          
          const testName = extractField(labTest, [
            'testName', 'TestName', 'test_name', 'Test_Name',
            'labTestName', 'LabTestName', 'lab_test_name', 'Lab_Test_Name',
            'LabTest.TestName', 'LabTest.testName', 'LabTest.Name', 'LabTest.name',
            'name', 'Name'
          ], 'Unknown Test');
          
          const category = extractField(labTest, [
            'testCategory', 'TestCategory', 'test_category', 'Test_Category',
            'category', 'Category', 'labTestCategory', 'LabTestCategory',
            'LabTest.TestCategory', 'LabTest.testCategory', 'LabTest.Category', 'LabTest.category'
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
          
          // Extract all PatientLabTest fields
          const patientType = extractField(labTest, [
            'patientType', 'PatientType', 'patient_type', 'Patient_Type'
          ], undefined);
          
          const labTestId = extractField(labTest, [
            'labTestId', 'LabTestId', 'lab_test_id', 'Lab_Test_Id',
            'LabTest.LabTestId', 'LabTest.labTestId', 'LabTest.Id', 'LabTest.id'
          ], undefined);
          
          const displayTestId = extractField(labTest, [
            'displayTestId', 'DisplayTestId', 'display_test_id', 'Display_Test_Id',
            'LabTest.DisplayTestId', 'LabTest.displayTestId', 'LabTest.DisplayTestID', 'LabTest.displayTestID'
          ], testId);
          
          const testCategory = extractField(labTest, [
            'testCategory', 'TestCategory', 'test_category', 'Test_Category',
            'category', 'Category', 'labTestCategory', 'LabTestCategory',
            'LabTest.TestCategory', 'LabTest.testCategory', 'LabTest.Category', 'LabTest.category'
          ], category);
          
          const roomAdmissionId = extractField(labTest, [
            'roomAdmissionId', 'RoomAdmissionId', 'room_admission_id', 'Room_Admission_Id'
          ], undefined);
          
          const emergencyBedSlotId = extractField(labTest, [
            'emergencyBedSlotId', 'EmergencyBedSlotId', 'emergency_bed_slot_id', 'Emergency_Bed_Slot_Id'
          ], undefined);
          
          const billId = extractField(labTest, [
            'billId', 'BillId', 'bill_id', 'Bill_Id'
          ], undefined);
          
          const labTestDone = extractField(labTest, [
            'labTestDone', 'LabTestDone', 'lab_test_done', 'Lab_Test_Done'
          ], false);
          
          const reportsUrl = extractField(labTest, [
            'reportsUrl', 'ReportsUrl', 'reports_url', 'Reports_Url'
          ], undefined);
          
          const testDoneDateTime = extractField(labTest, [
            'testDoneDateTime', 'TestDoneDateTime', 'test_done_date_time', 'Test_Done_Date_Time'
          ], undefined);
          
          const statusValue = extractField(labTest, [
            'status', 'Status'
          ], status);
          
          const charges = extractField(labTest, [
            'charges', 'Charges', 'testCharges', 'TestCharges'
          ], 0);
          
          const createdBy = extractField(labTest, [
            'createdBy', 'CreatedBy', 'created_by', 'Created_By'
          ], undefined);
          
          const createdDate = extractField(labTest, [
            'createdDate', 'CreatedDate', 'created_date', 'Created_Date'
          ], orderedDate);
          
          return {
            id: Number(patientLabTestsId) || index + 1,
            patientLabTestsId: Number(patientLabTestsId) || index + 1,
            testId: String(testId),
            patientName: String(patientName),
            patientId: String(patientId),
            age: Number(age) || 0,
            gender: String(gender),
            testName: String(testName),
            category: (testCategory as 'Blood Test' | 'Urine Test' | 'Imaging' | 'Pathology' | 'Radiology' | 'Other') || 'Other',
            testCategory: String(testCategory),
            orderedBy: String(orderedBy),
            orderedDate: String(orderedDate),
            orderedTime: String(orderedTime),
            priority: (priority as 'Routine' | 'Urgent' | 'Emergency') || 'Routine',
            status: status,
            sampleCollectedBy: sampleCollectedBy ? String(sampleCollectedBy) : undefined,
            technician: technician ? String(technician) : undefined,
            result: result ? String(result) : undefined,
            reportedDate: reportedDate ? String(reportedDate) : undefined,
            reportedTime: reportedTime ? String(reportedTime) : undefined,
            // Additional PatientLabTest fields
            patientType: patientType ? String(patientType) : undefined,
            labTestId: labTestId ? Number(labTestId) : undefined,
            displayTestId: String(displayTestId),
            roomAdmissionId: roomAdmissionId ? Number(roomAdmissionId) : undefined,
            emergencyBedSlotId: emergencyBedSlotId ? (typeof emergencyBedSlotId === 'number' ? emergencyBedSlotId : String(emergencyBedSlotId)) : undefined,
            billId: billId ? (typeof billId === 'number' ? billId : String(billId)) : undefined,
            labTestDone: labTestDone === true || labTestDone === 'Yes' || labTestDone === 'yes' ? 'Yes' : 'No',
            reportsUrl: reportsUrl ? String(reportsUrl) : undefined,
            testStatus: String(testStatus),
            testDoneDateTime: testDoneDateTime ? String(testDoneDateTime) : undefined,
            statusValue: String(statusValue),
            charges: Number(charges) || 0,
            createdBy: createdBy ? (typeof createdBy === 'number' ? createdBy : String(createdBy)) : undefined,
            createdDate: createdDate ? String(createdDate) : undefined
          } as any;
        });
        
        console.log('Mapped patient lab tests:', mappedTests);
        console.log('First mapped test:', mappedTests.length > 0 ? JSON.stringify(mappedTests[0], null, 2) : 'No mapped tests');
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

  // Handle viewing PatientLabTest
  const handleViewPatientLabTest = (test: any) => {
    setViewingPatientLabTest(test);
    setIsViewPatientLabTestDialogOpen(true);
  };

  // Handle editing PatientLabTest
  const handleEditPatientLabTest = (test: any) => {
    setEditingPatientLabTest(test);
    setEditPatientLabTestFormData({
      patientLabTestsId: test.patientLabTestsId || test.id,
      patientId: test.patientId || '',
      labTestId: test.labTestId || '',
      patientType: test.patientType || 'OPD',
      priority: test.priority || 'Normal',
      testStatus: test.testStatus || test.status || 'Pending',
      labTestDone: test.labTestDone === 'Yes' || test.labTestDone === true ? 'Yes' : 'No',
      reportsUrl: test.reportsUrl || '',
      testDoneDateTime: test.testDoneDateTime || '',
      roomAdmissionId: test.roomAdmissionId || '',
      emergencyBedSlotId: test.emergencyBedSlotId || '',
      billId: test.billId || '',
      status: (test as any).statusValue || test.status || 'Active',
      charges: test.charges || 0
    });
    setIsEditPatientLabTestDialogOpen(true);
  };

  // Handle saving edited PatientLabTest
  const handleSaveEditPatientLabTest = async () => {
    if (!editPatientLabTestFormData || !editingPatientLabTest) {
      return;
    }

    try {
      setEditPatientLabTestSubmitting(true);
      setEditPatientLabTestSubmitError(null);

      const patientLabTestsId = editPatientLabTestFormData.patientLabTestsId;
      if (!patientLabTestsId) {
        throw new Error('Patient Lab Test ID is required');
      }

      const payload: any = {
        PatientLabTestsId: patientLabTestsId,
        PatientId: editPatientLabTestFormData.patientId,
        LabTestId: Number(editPatientLabTestFormData.labTestId),
        PatientType: editPatientLabTestFormData.patientType,
        Priority: editPatientLabTestFormData.priority,
        TestStatus: editPatientLabTestFormData.testStatus,
        LabTestDone: editPatientLabTestFormData.labTestDone,
        Status: editPatientLabTestFormData.status
      };

      if (editPatientLabTestFormData.reportsUrl) {
        payload.ReportsUrl = editPatientLabTestFormData.reportsUrl;
      }
      if (editPatientLabTestFormData.testDoneDateTime) {
        payload.TestDoneDateTime = editPatientLabTestFormData.testDoneDateTime;
      }
      if (editPatientLabTestFormData.roomAdmissionId) {
        payload.RoomAdmissionId = Number(editPatientLabTestFormData.roomAdmissionId);
      }
      if (editPatientLabTestFormData.emergencyBedSlotId) {
        payload.EmergencyBedSlotId = Number(editPatientLabTestFormData.emergencyBedSlotId);
      }
      if (editPatientLabTestFormData.billId) {
        payload.BillId = Number(editPatientLabTestFormData.billId);
      }
      if (editPatientLabTestFormData.charges) {
        payload.Charges = Number(editPatientLabTestFormData.charges);
      }

      console.log('Updating PatientLabTest with payload:', payload);
      await apiRequest<any>(`/patient-lab-tests/${patientLabTestsId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      // Refresh the tests list by re-fetching (reuse existing fetch logic)
      const response = await apiRequest<any>('/patient-lab-tests/with-details');
      const labTestsData = response?.data || response || [];
      
      if (Array.isArray(labTestsData) && labTestsData.length > 0) {
        // Reuse the same mapping logic from useEffect
        const extractField = (data: any, fieldVariations: string[], defaultValue: any = '') => {
          for (const field of fieldVariations) {
            const value = data?.[field];
            if (value !== undefined && value !== null && value !== '') {
              return value;
            }
          }
          return defaultValue;
        };
        
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
          
          const priority = extractField(labTest, [
            'priority', 'Priority', 'testPriority', 'TestPriority'
          ], 'Routine');
          
          const testStatus = extractField(labTest, [
            'testStatus', 'TestStatus', 'test_status', 'Test_Status',
            'status', 'Status'
          ], 'Pending');
          
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
          
          // Extract all other fields (simplified - you can add more if needed)
          const patientType = extractField(labTest, ['patientType', 'PatientType'], undefined);
          const labTestId = extractField(labTest, ['labTestId', 'LabTestId'], undefined);
          const displayTestId = extractField(labTest, ['displayTestId', 'DisplayTestId'], testId);
          const testCategory = extractField(labTest, ['testCategory', 'TestCategory'], category);
          const roomAdmissionId = extractField(labTest, ['roomAdmissionId', 'RoomAdmissionId'], undefined);
          const emergencyBedSlotId = extractField(labTest, ['emergencyBedSlotId', 'EmergencyBedSlotId'], undefined);
          const billId = extractField(labTest, ['billId', 'BillId'], undefined);
          const labTestDone = extractField(labTest, ['labTestDone', 'LabTestDone'], false);
          const reportsUrl = extractField(labTest, ['reportsUrl', 'ReportsUrl'], undefined);
          const testDoneDateTime = extractField(labTest, ['testDoneDateTime', 'TestDoneDateTime'], undefined);
          const statusValue = extractField(labTest, ['status', 'Status'], status);
          const charges = extractField(labTest, ['charges', 'Charges'], 0);
          const createdBy = extractField(labTest, ['createdBy', 'CreatedBy'], undefined);
          const createdDate = extractField(labTest, ['createdDate', 'CreatedDate'], new Date().toISOString().split('T')[0]);
          
          return {
            id: Number(patientLabTestsId) || index + 1,
            patientLabTestsId: Number(patientLabTestsId) || index + 1,
            testId: String(testId),
            patientName: String(patientName),
            patientId: String(patientId),
            age: 0,
            gender: 'N/A',
            testName: String(testName),
            category: (testCategory as 'Blood Test' | 'Urine Test' | 'Imaging' | 'Pathology' | 'Radiology' | 'Other') || 'Other',
            testCategory: String(testCategory),
            orderedBy: 'N/A',
            orderedDate: String(createdDate),
            orderedTime: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
            priority: (priority as 'Routine' | 'Urgent' | 'Emergency') || 'Routine',
            status: status,
            patientType: patientType ? String(patientType) : undefined,
            labTestId: labTestId ? Number(labTestId) : undefined,
            displayTestId: String(displayTestId),
            roomAdmissionId: roomAdmissionId ? Number(roomAdmissionId) : undefined,
            emergencyBedSlotId: emergencyBedSlotId ? (typeof emergencyBedSlotId === 'number' ? emergencyBedSlotId : String(emergencyBedSlotId)) : undefined,
            billId: billId ? (typeof billId === 'number' ? billId : String(billId)) : undefined,
            labTestDone: labTestDone === true || labTestDone === 'Yes' || labTestDone === 'yes' ? 'Yes' : 'No',
            reportsUrl: reportsUrl ? String(reportsUrl) : undefined,
            testStatus: String(testStatus),
            testDoneDateTime: testDoneDateTime ? String(testDoneDateTime) : undefined,
            statusValue: String(statusValue),
            charges: Number(charges) || 0,
            createdBy: createdBy ? (typeof createdBy === 'number' ? createdBy : String(createdBy)) : undefined,
            createdDate: createdDate ? String(createdDate) : undefined
          } as any;
        });
        
        setTests(mappedTests);
      } else {
        setTests([]);
      }

      // Close dialog
      setIsEditPatientLabTestDialogOpen(false);
      setEditingPatientLabTest(null);
      setEditPatientLabTestFormData(null);
    } catch (err) {
      console.error('Error saving PatientLabTest:', err);
      setEditPatientLabTestSubmitError(err instanceof Error ? err.message : 'Failed to save patient lab test');
    } finally {
      setEditPatientLabTestSubmitting(false);
    }
  };

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
                        placeholder="Search lab test by Display Test ID, name, or category..."
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
                                <th className="py-2 px-3 text-left text-xs font-medium text-gray-700">Display Test ID</th>
                                <th className="py-2 px-3 text-left text-xs font-medium text-gray-700">Test Name</th>
                                <th className="py-2 px-3 text-left text-xs font-medium text-gray-700">Category</th>
                              </tr>
                            </thead>
                            <tbody>
                              {availableLabTests.filter((test: any) => {
                                if (!labTestSearchTerm) return true;
                                const searchLower = labTestSearchTerm.toLowerCase();
                                const displayTestId = test.displayTestId || test.DisplayTestId || test.displayTestID || test.DisplayTestID || '';
                                const testName = test.testName || test.TestName || test.labTestName || test.LabTestName || test.name || test.Name || '';
                                const category = test.testCategory || test.TestCategory || test.category || test.Category || '';
                                return displayTestId.toLowerCase().includes(searchLower) ||
                                       testName.toLowerCase().includes(searchLower) ||
                                       category.toLowerCase().includes(searchLower);
                              }).map((test: any) => {
                                const testId = test.labTestId || test.LabTestId || test.id || test.Id || '';
                                const displayTestId = test.displayTestId || test.DisplayTestId || test.displayTestID || test.DisplayTestID || '';
                                const testName = test.testName || test.TestName || test.labTestName || test.LabTestName || test.name || test.Name || '';
                                const category = test.testCategory || test.TestCategory || test.category || test.Category || '';
                                const isSelected = newLabOrderFormData.labTestId === String(testId);
                                const displayText = `${displayTestId}, ${testName} (${category})`;
                                return (
                                  <tr
                                    key={testId}
                                    onClick={() => {
                                      setNewLabOrderFormData({ ...newLabOrderFormData, labTestId: String(testId) });
                                      setLabTestSearchTerm(displayText);
                                      setShowLabTestList(false);
                                    }}
                                    className={`border-b border-gray-100 cursor-pointer hover:bg-blue-50 ${isSelected ? 'bg-blue-100' : ''}`}
                                  >
                                    <td className="py-2 px-3 text-sm text-gray-900 font-mono">{displayTestId || '-'}</td>
                                    <td className="py-2 px-3 text-sm text-gray-900">{testName || '-'}</td>
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
            <TestsList 
              tests={filteredTests} 
              onSelectTest={setSelectedTest}
              onViewTest={(test) => {
                setViewingPatientLabTest(test);
                setIsViewPatientLabTestDialogOpen(true);
              }}
              onEditTest={(test) => {
                setEditingPatientLabTest(test);
                setEditPatientLabTestFormData({
                  patientLabTestsId: test.patientLabTestsId || test.id,
                  patientId: test.patientId || '',
                  labTestId: test.labTestId || '',
                  patientType: test.patientType || 'OPD',
                  priority: test.priority || 'Normal',
                  testStatus: test.testStatus || test.status || 'Pending',
                  labTestDone: test.labTestDone === 'Yes' || test.labTestDone === true ? 'Yes' : 'No',
                  reportsUrl: test.reportsUrl || '',
                  testDoneDateTime: test.testDoneDateTime || '',
                  roomAdmissionId: test.roomAdmissionId || '',
                  emergencyBedSlotId: test.emergencyBedSlotId || '',
                  billId: test.billId || '',
                  status: (test as any).statusValue || test.status || 'Active',
                  charges: test.charges || 0
                });
                setIsEditPatientLabTestDialogOpen(true);
              }}
            />
          </TabsContent>
          <TabsContent value="pending">
            <TestsList 
              tests={getTestsByStatus('Pending')} 
              onSelectTest={setSelectedTest}
              onViewTest={handleViewPatientLabTest}
              onEditTest={handleEditPatientLabTest}
            />
          </TabsContent>
          <TabsContent value="progress">
            <TestsList 
              tests={[...getTestsByStatus('In Progress'), ...getTestsByStatus('Sample Collected')]} 
              onSelectTest={setSelectedTest}
              onViewTest={handleViewPatientLabTest}
              onEditTest={handleEditPatientLabTest}
            />
          </TabsContent>
          <TabsContent value="completed">
            <TestsList 
              tests={[...getTestsByStatus('Completed'), ...getTestsByStatus('Reported')]} 
              onSelectTest={setSelectedTest}
              onViewTest={handleViewPatientLabTest}
              onEditTest={handleEditPatientLabTest}
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

      {/* View PatientLabTest Dialog */}
      <Dialog open={isViewPatientLabTestDialogOpen} onOpenChange={setIsViewPatientLabTestDialogOpen}>
        <DialogContent className="p-0 gap-0 large-dialog max-w-5xl max-h-[90vh]">
          <DialogHeader className="px-6 pt-4 pb-3 flex-shrink-0">
            <DialogTitle className="flex items-center gap-2">
              <FileText className="size-5" />
              Patient Lab Test Details
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto px-6 pb-1 patient-list-scrollable min-h-0">
            {viewingPatientLabTest && (
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-semibold text-gray-700">PatientLabTestsId</Label>
                    <p className="text-gray-900">{viewingPatientLabTest.patientLabTestsId || viewingPatientLabTest.id || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-semibold text-gray-700">PatientId</Label>
                    <p className="text-gray-900">{viewingPatientLabTest.patientId || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-semibold text-gray-700">PatientName</Label>
                    <p className="text-gray-900">{viewingPatientLabTest.patientName || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-semibold text-gray-700">TestName</Label>
                    <p className="text-gray-900">{viewingPatientLabTest.testName || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-semibold text-gray-700">PatientType</Label>
                    <p className="text-gray-900">{viewingPatientLabTest.patientType || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-semibold text-gray-700">LabTestId</Label>
                    <p className="text-gray-900">{viewingPatientLabTest.labTestId || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-semibold text-gray-700">DisplayTestId</Label>
                    <p className="text-gray-900 font-mono">{viewingPatientLabTest.displayTestId || viewingPatientLabTest.testId || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-semibold text-gray-700">TestCategory</Label>
                    <p className="text-gray-900">{viewingPatientLabTest.testCategory || viewingPatientLabTest.category || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-semibold text-gray-700">RoomAdmissionId</Label>
                    <p className="text-gray-900">{viewingPatientLabTest.roomAdmissionId || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-semibold text-gray-700">EmergencyBedSlotId</Label>
                    <p className="text-gray-900">{viewingPatientLabTest.emergencyBedSlotId || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-semibold text-gray-700">BillId</Label>
                    <p className="text-gray-900">{viewingPatientLabTest.billId || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-semibold text-gray-700">Priority</Label>
                    <p className="text-gray-900">{viewingPatientLabTest.priority || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-semibold text-gray-700">LabTestDone</Label>
                    <p className="text-gray-900">{viewingPatientLabTest.labTestDone === 'Yes' || viewingPatientLabTest.labTestDone === true ? 'Yes' : 'No'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-semibold text-gray-700">ReportsUrl</Label>
                    <p className="text-gray-900">
                      {viewingPatientLabTest.reportsUrl ? (
                        <a href={viewingPatientLabTest.reportsUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          {viewingPatientLabTest.reportsUrl}
                        </a>
                      ) : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-semibold text-gray-700">TestStatus</Label>
                    <p className="text-gray-900">{viewingPatientLabTest.testStatus || viewingPatientLabTest.status || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-semibold text-gray-700">TestDoneDateTime</Label>
                    <p className="text-gray-900">
                      {viewingPatientLabTest.testDoneDateTime ? new Date(viewingPatientLabTest.testDoneDateTime).toLocaleString() : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-semibold text-gray-700">Status</Label>
                    <p className="text-gray-900">{(viewingPatientLabTest as any).statusValue || viewingPatientLabTest.status || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-semibold text-gray-700">Charges</Label>
                    <p className="text-gray-900">₹{viewingPatientLabTest.charges || 0}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-semibold text-gray-700">CreatedBy</Label>
                    <p className="text-gray-900">{viewingPatientLabTest.createdBy || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-semibold text-gray-700">CreatedDate</Label>
                    <p className="text-gray-900">
                      {viewingPatientLabTest.createdDate ? new Date(viewingPatientLabTest.createdDate).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
          <DialogFooter className="px-6 pb-4 flex-shrink-0">
            <Button variant="outline" onClick={() => setIsViewPatientLabTestDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit PatientLabTest Dialog */}
      <Dialog open={isEditPatientLabTestDialogOpen} onOpenChange={setIsEditPatientLabTestDialogOpen}>
        <DialogContent className="p-0 gap-0 large-dialog max-w-4xl max-h-[90vh]">
          <DialogHeader className="px-6 pt-4 pb-3 flex-shrink-0">
            <DialogTitle className="flex items-center gap-2">
              <Edit className="size-5" />
              Edit Patient Lab Test
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto px-6 pb-1 patient-list-scrollable min-h-0">
            {editPatientLabTestFormData && (
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="editPatientId">PatientId *</Label>
                    <Input
                      id="editPatientId"
                      value={editPatientLabTestFormData.patientId}
                      onChange={(e) => setEditPatientLabTestFormData({ ...editPatientLabTestFormData, patientId: e.target.value })}
                      disabled
                    />
                  </div>
                  <div>
                    <Label htmlFor="editLabTestId">LabTestId *</Label>
                    <Input
                      id="editLabTestId"
                      value={editPatientLabTestFormData.labTestId}
                      onChange={(e) => setEditPatientLabTestFormData({ ...editPatientLabTestFormData, labTestId: e.target.value })}
                      disabled
                    />
                  </div>
                  <div>
                    <Label htmlFor="editPatientType">PatientType *</Label>
                    <select
                      id="editPatientType"
                      className="w-full px-3 py-2 border border-gray-200 rounded-md"
                      value={editPatientLabTestFormData.patientType}
                      onChange={(e) => setEditPatientLabTestFormData({ ...editPatientLabTestFormData, patientType: e.target.value })}
                    >
                      <option value="OPD">OPD</option>
                      <option value="IPD">IPD</option>
                      <option value="Emergency">Emergency</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="editPriority">Priority *</Label>
                    <select
                      id="editPriority"
                      className="w-full px-3 py-2 border border-gray-200 rounded-md"
                      value={editPatientLabTestFormData.priority}
                      onChange={(e) => setEditPatientLabTestFormData({ ...editPatientLabTestFormData, priority: e.target.value })}
                    >
                      <option value="Normal">Normal</option>
                      <option value="Urgent">Urgent</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="editTestStatus">TestStatus *</Label>
                    <select
                      id="editTestStatus"
                      className="w-full px-3 py-2 border border-gray-200 rounded-md"
                      value={editPatientLabTestFormData.testStatus}
                      onChange={(e) => setEditPatientLabTestFormData({ ...editPatientLabTestFormData, testStatus: e.target.value })}
                    >
                      <option value="Pending">Pending</option>
                      <option value="InProgress">InProgress</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="editLabTestDone">LabTestDone *</Label>
                    <select
                      id="editLabTestDone"
                      className="w-full px-3 py-2 border border-gray-200 rounded-md"
                      value={editPatientLabTestFormData.labTestDone}
                      onChange={(e) => setEditPatientLabTestFormData({ ...editPatientLabTestFormData, labTestDone: e.target.value })}
                    >
                      <option value="No">No</option>
                      <option value="Yes">Yes</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="editReportsUrl">ReportsUrl</Label>
                    <Input
                      id="editReportsUrl"
                      value={editPatientLabTestFormData.reportsUrl}
                      onChange={(e) => setEditPatientLabTestFormData({ ...editPatientLabTestFormData, reportsUrl: e.target.value })}
                      placeholder="Enter report URL"
                    />
                  </div>
                  <div>
                    <Label htmlFor="editTestDoneDateTime">TestDoneDateTime</Label>
                    <Input
                      id="editTestDoneDateTime"
                      type="datetime-local"
                      value={editPatientLabTestFormData.testDoneDateTime ? new Date(editPatientLabTestFormData.testDoneDateTime).toISOString().slice(0, 16) : ''}
                      onChange={(e) => setEditPatientLabTestFormData({ ...editPatientLabTestFormData, testDoneDateTime: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="editRoomAdmissionId">RoomAdmissionId</Label>
                    <Input
                      id="editRoomAdmissionId"
                      type="number"
                      value={editPatientLabTestFormData.roomAdmissionId}
                      onChange={(e) => setEditPatientLabTestFormData({ ...editPatientLabTestFormData, roomAdmissionId: e.target.value })}
                      placeholder="Room Admission ID"
                    />
                  </div>
                  <div>
                    <Label htmlFor="editEmergencyBedSlotId">EmergencyBedSlotId</Label>
                    <Input
                      id="editEmergencyBedSlotId"
                      type="number"
                      value={editPatientLabTestFormData.emergencyBedSlotId}
                      onChange={(e) => setEditPatientLabTestFormData({ ...editPatientLabTestFormData, emergencyBedSlotId: e.target.value })}
                      placeholder="Emergency Bed Slot ID"
                    />
                  </div>
                  <div>
                    <Label htmlFor="editBillId">BillId</Label>
                    <Input
                      id="editBillId"
                      type="number"
                      value={editPatientLabTestFormData.billId}
                      onChange={(e) => setEditPatientLabTestFormData({ ...editPatientLabTestFormData, billId: e.target.value })}
                      placeholder="Bill ID"
                    />
                  </div>
                  <div>
                    <Label htmlFor="editStatus">Status *</Label>
                    <select
                      id="editStatus"
                      className="w-full px-3 py-2 border border-gray-200 rounded-md"
                      value={editPatientLabTestFormData.status}
                      onChange={(e) => setEditPatientLabTestFormData({ ...editPatientLabTestFormData, status: e.target.value })}
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="editCharges">Charges</Label>
                    <Input
                      id="editCharges"
                      type="number"
                      value={editPatientLabTestFormData.charges}
                      onChange={(e) => setEditPatientLabTestFormData({ ...editPatientLabTestFormData, charges: Number(e.target.value) })}
                      placeholder="Enter charges"
                    />
                  </div>
                </div>
                {editPatientLabTestSubmitError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                    {editPatientLabTestSubmitError}
                  </div>
                )}
              </div>
            )}
          </div>
          <DialogFooter className="px-6 pb-4 flex-shrink-0">
            <Button variant="outline" onClick={() => setIsEditPatientLabTestDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEditPatientLabTest} disabled={editPatientLabTestSubmitting}>
              {editPatientLabTestSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function TestsList({ 
  tests, 
  onSelectTest,
  onViewTest,
  onEditTest
}: { 
  tests: LabTest[]; 
  onSelectTest: (test: LabTest) => void;
  onViewTest: (test: any) => void;
  onEditTest: (test: any) => void;
}) {
  return (
    <Card className="mb-4">
      <CardContent className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-700">PatientLabTestsId</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-700">PatientId</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-700">PatientName</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-700">TestName</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-700">PatientType</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-700">LabTestId</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-700">DisplayTestId</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-700">TestCategory</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-700">RoomAdmissionId</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-700">EmergencyBedSlotId</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-700">BillId</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-700">Priority</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-700">LabTestDone</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-700">ReportsUrl</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-700">TestStatus</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-700">TestDoneDateTime</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-700">Status</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-700">Charges</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-700">CreatedBy</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-700">CreatedDate</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tests.map((test: any) => (
                <tr key={test.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm text-gray-600">{test.patientLabTestsId || test.id || 'N/A'}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{test.patientId || 'N/A'}</td>
                  <td className="py-3 px-4 text-sm text-gray-900">{test.patientName || 'N/A'}</td>
                  <td className="py-3 px-4 text-sm text-gray-900">{test.testName || 'N/A'}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    <Badge variant="outline">{test.patientType || 'N/A'}</Badge>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">{test.labTestId || 'N/A'}</td>
                  <td className="py-3 px-4 text-sm text-gray-600 font-mono">{test.displayTestId || test.testId || 'N/A'}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    <Badge variant="outline">{test.testCategory || test.category || 'N/A'}</Badge>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">{test.roomAdmissionId || 'N/A'}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{test.emergencyBedSlotId || 'N/A'}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{test.billId || 'N/A'}</td>
                  <td className="py-3 px-4 text-sm">
                    <Badge variant={
                      test.priority === 'Emergency' || test.priority === 'Urgent' ? 'destructive' :
                      test.priority === 'Urgent' ? 'default' : 'secondary'
                    }>
                      {test.priority || 'N/A'}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    <Badge variant={test.labTestDone === 'Yes' || test.labTestDone === true ? 'default' : 'outline'}>
                      {test.labTestDone === 'Yes' || test.labTestDone === true ? 'Yes' : 'No'}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {test.reportsUrl ? (
                      <a href={test.reportsUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        View Report
                      </a>
                    ) : 'N/A'}
                  </td>
                  <td className="py-3 px-4 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      test.testStatus === 'Completed' || test.testStatus === 'completed' ? 'bg-green-100 text-green-700' :
                      test.testStatus === 'In Progress' || test.testStatus === 'InProgress' || test.testStatus === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                      'bg-orange-100 text-orange-700'
                    }`}>
                      {test.testStatus || test.status || 'N/A'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {test.testDoneDateTime ? new Date(test.testDoneDateTime).toLocaleString() : 'N/A'}
                  </td>
                  <td className="py-3 px-4 text-sm">
                    <Badge variant={(test as any).statusValue === 'Active' || (test as any).statusValue === 'active' ? 'default' : 'outline'}>
                      {(test as any).statusValue || test.status || 'N/A'}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">₹{test.charges || 0}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{test.createdBy || 'N/A'}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {test.createdDate ? new Date(test.createdDate).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewTest(test)}
                        className="h-8 w-8 p-0"
                        title="View Patient Lab Test Details"
                      >
                        <Eye className="h-4 w-4 text-blue-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEditTest(test)}
                        className="h-8 w-8 p-0"
                        title="Edit Patient Lab Test"
                      >
                        <Edit className="h-4 w-4 text-green-600" />
                      </Button>
                    </div>
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
