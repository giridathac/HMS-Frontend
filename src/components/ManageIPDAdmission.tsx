import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { FileText, FlaskConical, Stethoscope, Heart, ArrowLeft } from 'lucide-react';
import { admissionsApi } from '../api/admissions';
import { Admission, PatientLabTest, PatientDoctorVisit, PatientNurseVisit } from '../api/admissions';

export function ManageIPDAdmission() {
  const [admission, setAdmission] = useState<Admission | null>(null);
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
    // Get roomAdmissionId from URL hash parameters
    const hash = window.location.hash.slice(1);
    const params = new URLSearchParams(hash.split('?')[1] || '');
    const roomAdmissionId = params.get('roomAdmissionId');
    
    if (roomAdmissionId) {
      fetchAdmissionDetails(Number(roomAdmissionId));
    } else {
      setError('Room Admission ID is missing from URL');
      setLoading(false);
    }
  }, []);

  const fetchAdmissionDetails = async (roomAdmissionId: number) => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching admission details for roomAdmissionId:', roomAdmissionId);
      const admissionData = await admissionsApi.getById(roomAdmissionId);
      console.log('Fetched admission data:', {
        age: admissionData.age,
        gender: admissionData.gender,
        admittedBy: admissionData.admittedBy,
        diagnosis: admissionData.diagnosis,
        patientName: admissionData.patientName,
        bedNumber: admissionData.bedNumber,
        roomType: admissionData.roomType,
        full: admissionData
      });
      setAdmission(admissionData);
      
      // Fetch patient lab tests, doctor visits, and nurse visits after admission is loaded
      fetchPatientLabTests(roomAdmissionId);
      fetchPatientDoctorVisits(roomAdmissionId);
      fetchPatientNurseVisits(roomAdmissionId);
    } catch (err) {
      console.error('Error fetching admission details:', err);
      setError(err instanceof Error ? err.message : 'Failed to load admission details');
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
    window.location.hash = 'admissions';
  };

  if (loading) {
    return (
      <div className="flex-1 bg-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-blue-600">Loading admission details...</p>
        </div>
      </div>
    );
  }

  if (error || !admission) {
    return (
      <div className="flex-1 bg-blue-100 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-red-600 mb-4">{error || 'Admission not found'}</p>
              <Button onClick={handleBack} variant="outline">
                <ArrowLeft className="size-4 mr-2" />
                Back to Admissions
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
              <h1 className="text-gray-900 mb-0 text-xl">Manage IPD Case</h1>
              <p className="text-gray-500 text-sm">Room Admission ID: {admission.roomAdmissionId || admission.admissionId}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-y-auto overflow-x-hidden px-4 pb-4" style={{ maxHeight: 'calc(100vh - 100px)', minHeight: 0 }}>
        {/* Room Admission Details */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Room Admission Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <Label className="text-sm text-gray-500">Patient Name</Label>
                <p className="text-gray-900 font-medium mt-1">{admission.patientName}</p>
              </div>
              <div>
                <Label className="text-sm text-gray-500">Patient ID</Label>
                <p className="text-gray-900 font-medium mt-1">{admission.patientId || 'N/A'}</p>
              </div>
              <div>
                <Label className="text-sm text-gray-500">Bed Number</Label>
                <p className="text-gray-900 font-medium mt-1">
                  <Badge variant="outline">{admission.bedNumber}</Badge>
                </p>
              </div>
              <div>
                <Label className="text-sm text-gray-500">Room Type</Label>
                <p className="text-gray-900 font-medium mt-1">{admission.roomType}</p>
              </div>
              <div>
                <Label className="text-sm text-gray-500">Age</Label>
                <p className="text-gray-900 font-medium mt-1">{admission.age > 0 ? `${admission.age} years` : 'N/A'}</p>
              </div>
              <div>
                <Label className="text-sm text-gray-500">Gender</Label>
                <p className="text-gray-900 font-medium mt-1">{admission.gender || 'N/A'}</p>
              </div>
              <div>
                <Label className="text-sm text-gray-500">Admission Date</Label>
                <p className="text-gray-900 font-medium mt-1">{admission.admissionDate || 'N/A'}</p>
              </div>
              <div>
                <Label className="text-sm text-gray-500">Admitted By</Label>
                <p className="text-gray-900 font-medium mt-1">{admission.admittedBy || 'N/A'}</p>
              </div>
              <div className="col-span-2">
                <Label className="text-sm text-gray-500">Diagnosis</Label>
                <p className="text-gray-900 font-medium mt-1">{admission.diagnosis || 'N/A'}</p>
              </div>
              <div>
                <Label className="text-sm text-gray-500">Admission Status</Label>
                <p className="mt-1">
                  <span className={`px-3 py-1 rounded-full text-xs inline-block ${
                    admission.status === 'Active' ? 'bg-green-100 text-green-700' :
                    admission.status === 'Surgery Scheduled' ? 'bg-orange-100 text-orange-700' :
                    admission.status === 'Moved to ICU' ? 'bg-red-100 text-red-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {admission.admissionStatus || admission.status}
                  </span>
                </p>
              </div>
              {admission.scheduleOT && (
                <div>
                  <Label className="text-sm text-gray-500">Schedule OT</Label>
                  <p className="mt-1">
                    <Badge variant={String(admission.scheduleOT).toLowerCase() === 'yes' ? 'default' : 'outline'}>
                      {String(admission.scheduleOT)}
                    </Badge>
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Tabs for Case Details, Lab Tests, Doctor Visits, Nurse Visits */}
        <Tabs defaultValue="case-details" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="case-details" className="gap-2">
              <FileText className="size-4" />
              Case Details
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
              Nurse Visits
            </TabsTrigger>
          </TabsList>

          <TabsContent value="case-details" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Case Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm text-gray-500">Diagnosis</Label>
                    <p className="text-gray-900 font-medium mt-1">{admission.diagnosis || 'N/A'}</p>
                  </div>
                  {admission.caseSheetDetails && (
                    <div>
                      <Label className="text-sm text-gray-500">Case Details</Label>
                      <div className="mt-1 p-3 bg-gray-50 rounded-md border border-gray-200">
                        <p className="text-gray-900 whitespace-pre-wrap">{admission.caseSheetDetails}</p>
                      </div>
                    </div>
                  )}
                  {admission.estimatedStay && (
                    <div>
                      <Label className="text-sm text-gray-500">Estimated Stay</Label>
                      <p className="text-gray-900 font-medium mt-1">{admission.estimatedStay}</p>
                    </div>
                  )}
                  {admission.createdAt && (
                    <div>
                      <Label className="text-sm text-gray-500">Created At</Label>
                      <p className="text-gray-900 font-medium mt-1">{new Date(admission.createdAt).toLocaleString()}</p>
                    </div>
                  )}
                  {!admission.caseSheetDetails && (
                    <div>
                      <Label className="text-sm text-gray-500">Admission Notes</Label>
                      <p className="text-gray-900 mt-1">Case details and notes will be displayed here.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="lab-tests" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Patient's Lab Tests</CardTitle>
              </CardHeader>
              <CardContent>
                {labTestsLoading && (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                    <p className="text-gray-500">Loading lab tests...</p>
                  </div>
                )}
                
                {labTestsError && (
                  <div className="text-center py-8">
                    <p className="text-red-600">{labTestsError}</p>
                  </div>
                )}
                
                {!labTestsLoading && !labTestsError && patientLabTests.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No lab tests found for this admission.
                  </div>
                )}
                
                {!labTestsLoading && !labTestsError && patientLabTests.length > 0 && (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">Lab Test ID</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">Lab Test Name</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">Priority</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">Lab Test Done</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">Reports URL</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">Test Status</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">Test Done DateTime</th>
                        </tr>
                      </thead>
                      <tbody>
                        {patientLabTests.map((labTest, index) => (
                          <tr key={labTest.patientLabTestId || labTest.id || index} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 px-4 text-gray-600">
                              <Badge variant="outline">{labTest.labTestId || 'N/A'}</Badge>
                            </td>
                            <td className="py-3 px-4 text-gray-900">{labTest.labTestName || labTest.testName || 'N/A'}</td>
                            <td className="py-3 px-4">
                              <Badge variant={
                                labTest.priority?.toLowerCase() === 'urgent' || labTest.priority?.toLowerCase() === 'high' ? 'destructive' :
                                labTest.priority?.toLowerCase() === 'normal' || labTest.priority?.toLowerCase() === 'medium' ? 'default' :
                                'outline'
                              }>
                                {labTest.priority || 'N/A'}
                              </Badge>
                            </td>
                            <td className="py-3 px-4">
                              <Badge variant={
                                labTest.labTestDone === true || String(labTest.labTestDone).toLowerCase() === 'true' || String(labTest.labTestDone).toLowerCase() === 'yes' ? 'default' :
                                'outline'
                              }>
                                {labTest.labTestDone === true || String(labTest.labTestDone).toLowerCase() === 'true' || String(labTest.labTestDone).toLowerCase() === 'yes' ? 'Yes' : 
                                 labTest.labTestDone === false || String(labTest.labTestDone).toLowerCase() === 'false' || String(labTest.labTestDone).toLowerCase() === 'no' ? 'No' : 'N/A'}
                              </Badge>
                            </td>
                            <td className="py-3 px-4 text-gray-600">
                              {labTest.reportsUrl ? (
                                <a href={labTest.reportsUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                  View Report
                                </a>
                              ) : 'N/A'}
                            </td>
                            <td className="py-3 px-4">
                              <Badge variant={
                                labTest.testStatus?.toLowerCase() === 'completed' || labTest.testStatus?.toLowerCase() === 'done' ? 'default' :
                                labTest.testStatus?.toLowerCase() === 'pending' || labTest.testStatus?.toLowerCase() === 'in progress' ? 'outline' :
                                'outline'
                              }>
                                {labTest.testStatus || labTest.status || 'N/A'}
                              </Badge>
                            </td>
                            <td className="py-3 px-4 text-gray-600">{labTest.testDoneDateTime || 'N/A'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="doctor-visits" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Patient's Doctor Visits</CardTitle>
              </CardHeader>
              <CardContent>
                {doctorVisitsLoading && (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                    <p className="text-gray-500">Loading doctor visits...</p>
                  </div>
                )}
                
                {doctorVisitsError && (
                  <div className="text-center py-8">
                    <p className="text-red-600">{doctorVisitsError}</p>
                  </div>
                )}
                
                {!doctorVisitsLoading && !doctorVisitsError && patientDoctorVisits.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No doctor visits found for this admission.
                  </div>
                )}
                
                {!doctorVisitsLoading && !doctorVisitsError && patientDoctorVisits.length > 0 && (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">Doctor ID</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">Doctor Visited DateTime</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">Visits Remarks</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">Patient Condition</th>
                        </tr>
                      </thead>
                      <tbody>
                        {patientDoctorVisits.map((visit, index) => (
                          <tr key={visit.patientDoctorVisitId || visit.id || index} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 px-4 text-gray-900">
                              <Badge variant="outline">{visit.doctorId || 'N/A'}</Badge>
                            </td>
                            <td className="py-3 px-4 text-gray-600">{visit.doctorVisitedDateTime || 'N/A'}</td>
                            <td className="py-3 px-4 text-gray-600">{visit.visitsRemarks || 'N/A'}</td>
                            <td className="py-3 px-4">
                              <Badge variant={
                                visit.patientCondition?.toLowerCase() === 'stable' || visit.patientCondition?.toLowerCase() === 'good' ? 'default' :
                                visit.patientCondition?.toLowerCase() === 'critical' || visit.patientCondition?.toLowerCase() === 'serious' ? 'destructive' :
                                'outline'
                              }>
                                {visit.patientCondition || 'N/A'}
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

          <TabsContent value="nurse-visits" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Patient's Nurse Visits</CardTitle>
              </CardHeader>
              <CardContent>
                {nurseVisitsLoading && (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                    <p className="text-gray-500">Loading nurse visits...</p>
                  </div>
                )}
                
                {nurseVisitsError && (
                  <div className="text-center py-8">
                    <p className="text-red-600">{nurseVisitsError}</p>
                  </div>
                )}
                
                {!nurseVisitsLoading && !nurseVisitsError && patientNurseVisits.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No nurse visits found for this admission.
                  </div>
                )}
                
                {!nurseVisitsLoading && !nurseVisitsError && patientNurseVisits.length > 0 && (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">Nurse ID</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">Visit Date</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">Visit Time</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">Patient Status</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">Supervision Details</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">Remarks</th>
                        </tr>
                      </thead>
                      <tbody>
                        {patientNurseVisits.map((visit, index) => (
                          <tr key={visit.patientNurseVisitId || visit.id || index} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 px-4 text-gray-900">
                              <Badge variant="outline">{visit.nurseId || 'N/A'}</Badge>
                            </td>
                            <td className="py-3 px-4 text-gray-600">{visit.visitDate || 'N/A'}</td>
                            <td className="py-3 px-4 text-gray-600">{visit.visitTime || 'N/A'}</td>
                            <td className="py-3 px-4">
                              <Badge variant={
                                visit.patientStatus?.toLowerCase() === 'stable' || visit.patientStatus?.toLowerCase() === 'good' ? 'default' :
                                visit.patientStatus?.toLowerCase() === 'critical' || visit.patientStatus?.toLowerCase() === 'serious' ? 'destructive' :
                                'outline'
                              }>
                                {visit.patientStatus || 'N/A'}
                              </Badge>
                            </td>
                            <td className="py-3 px-4 text-gray-600">{visit.supervisionDetails || 'N/A'}</td>
                            <td className="py-3 px-4 text-gray-600">{visit.remarks || 'N/A'}</td>
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
      </div>
    </div>
  );
}
