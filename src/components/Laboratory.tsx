import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Badge } from './ui/badge';
import { TestTube, Search, FileText, Clock, CheckCircle, AlertCircle, Download } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

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

export function Laboratory() {
  const [tests, setTests] = useState<LabTest[]>(mockLabTests);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedTest, setSelectedTest] = useState<LabTest | null>(null);
  const [showReportsDialog, setShowReportsDialog] = useState(false);

  const filteredTests = tests.filter(test =>
    test.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    test.testId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    test.testName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTestsByStatus = (status: string) => {
    return filteredTests.filter(t => t.status === status);
  };

  const pendingCount = tests.filter(t => t.status === 'Pending').length;
  const inProgressCount = tests.filter(t => t.status === 'In Progress' || t.status === 'Sample Collected').length;
  const completedCount = tests.filter(t => t.status === 'Completed' || t.status === 'Reported').length;

  return (
    <div className="p-8 bg-blue-100 min-h-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-gray-900 mb-2">Laboratory Management</h1>
          <p className="text-gray-500">Manage lab tests, samples, and reports</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={() => setShowReportsDialog(true)}>
            <FileText className="size-4" />
            View Reports
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <TestTube className="size-4" />
                New Lab Order
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Lab Test Order</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="patientId">Patient ID</Label>
                    <Input id="patientId" placeholder="Enter patient ID" />
                  </div>
                  <div>
                    <Label htmlFor="patientName">Patient Name</Label>
                    <Input id="patientName" placeholder="Enter patient name" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="testName">Test Name</Label>
                  <Input id="testName" placeholder="Enter test name" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <select id="category" aria-label="Category" className="w-full px-3 py-2 border border-gray-200 rounded-md">
                      <option value="Blood Test">Blood Test</option>
                      <option value="Urine Test">Urine Test</option>
                      <option value="Imaging">Imaging</option>
                      <option value="Pathology">Pathology</option>
                      <option value="Radiology">Radiology</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="priority">Priority</Label>
                    <select id="priority" aria-label="Priority" className="w-full px-3 py-2 border border-gray-200 rounded-md">
                      <option value="Routine">Routine</option>
                      <option value="Urgent">Urgent</option>
                      <option value="Emergency">Emergency</option>
                    </select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="orderedBy">Ordered By (Doctor)</Label>
                  <Input id="orderedBy" placeholder="Doctor name" />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                <Button onClick={() => setIsAddDialogOpen(false)}>Create Order</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-500">Total Tests Today</p>
              <TestTube className="size-5 text-blue-600" />
            </div>
            <h3 className="text-gray-900">{tests.length}</h3>
            <p className="text-xs text-gray-500">Active orders</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-500">Pending</p>
              <Clock className="size-5 text-orange-600" />
            </div>
            <h3 className="text-gray-900">{pendingCount}</h3>
            <p className="text-xs text-gray-500">Awaiting sample</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-500">In Progress</p>
              <AlertCircle className="size-5 text-blue-600" />
            </div>
            <h3 className="text-gray-900">{inProgressCount}</h3>
            <p className="text-xs text-gray-500">Being processed</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-500">Completed</p>
              <CheckCircle className="size-5 text-green-600" />
            </div>
            <h3 className="text-gray-900">{completedCount}</h3>
            <p className="text-xs text-gray-500">Reports ready</p>
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
    <Card>
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
        </div>
        {tests.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No lab tests found
          </div>
        )}
      </CardContent>
    </Card>
  );
}
