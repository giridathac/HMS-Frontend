// Dashboard UI Component - Separated from logic
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Users, ClipboardList, BedDouble, Scissors, HeartPulse, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useDashboard } from '../hooks';
import { ChartData, DoctorQueue } from '../types';

interface DashboardProps {
  stats?: {
    opdPatientsToday: number;
    activeTokens: number;
    ipdAdmissions: number;
    otScheduled: number;
    icuOccupied: string;
    totalPatients: number;
  };
  opdData?: ChartData[];
  admissionData?: ChartData[];
  doctorQueue?: DoctorQueue[];
  loading?: boolean;
}

const statConfig = [
  { title: 'OPD Patients Today', key: 'opdPatientsToday' as const, change: '+12', icon: Users, color: 'bg-blue-500' },
  { title: 'Active Tokens', key: 'activeTokens' as const, change: 'Live', icon: ClipboardList, color: 'bg-green-500' },
  { title: 'IPD Admissions', key: 'ipdAdmissions' as const, change: '15 Available', icon: BedDouble, color: 'bg-purple-500' },
  { title: 'OT Scheduled', key: 'otScheduled' as const, change: '3 Ongoing', icon: Scissors, color: 'bg-orange-500' },
  { title: 'ICU Occupied', key: 'icuOccupied' as const, change: '80%', icon: HeartPulse, color: 'bg-red-500' },
  { title: 'Total Patients', key: 'totalPatients' as const, change: 'Today', icon: Activity, color: 'bg-teal-500' },
];

export function Dashboard() {
  const { stats, opdData, admissionData, doctorQueue, loading } = useDashboard();

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center py-12 text-blue-600">Loading dashboard data...</div>
      </div>
    );
  }

  return <DashboardView stats={stats} opdData={opdData} admissionData={admissionData} doctorQueue={doctorQueue} />;
}

export function DashboardView({ stats, opdData, admissionData, doctorQueue }: DashboardProps) {
  return (
    <div className="p-8 bg-blue-100 min-h-full">
      <div className="mb-8">
        <h1 className="text-blue-900 mb-2">Dashboard Overview</h1>
        <p className="text-blue-600">Real-time hospital operations monitoring</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {statConfig.map((config) => {
          const Icon = config.icon;
          const value = stats?.[config.key]?.toString() || '0';
          return (
            <Card key={config.title}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`${config.color} p-3 rounded-lg`}>
                    <Icon className="size-6 text-white" />
                  </div>
                  <span className="text-sm text-blue-600">{config.change}</span>
                </div>
                <h3 className="text-blue-900 mb-1">{value}</h3>
                <p className="text-sm text-blue-600">{config.title}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>OPD Patient Flow - Weekly</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={opdData || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="patients" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>IPD Room Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={admissionData || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {(admissionData || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || '#8884d8'} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Doctor Queue Status */}
      <Card>
        <CardHeader>
          <CardTitle>Doctor Queue Status - Live</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-gray-700">Doctor</th>
                  <th className="text-left py-3 px-4 text-gray-700">Specialty</th>
                  <th className="text-left py-3 px-4 text-gray-700">Type</th>
                  <th className="text-left py-3 px-4 text-gray-700">Waiting</th>
                  <th className="text-left py-3 px-4 text-gray-700">Consulting</th>
                  <th className="text-left py-3 px-4 text-gray-700">Completed Today</th>
                  <th className="text-left py-3 px-4 text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {(doctorQueue || []).map((doc, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-gray-900">{doc.doctor}</td>
                    <td className="py-3 px-4 text-gray-600">{doc.specialty}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs ${
                        doc.type === 'inhouse' 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'bg-purple-100 text-purple-700'
                      }`}>
                        {doc.type === 'inhouse' ? 'Inhouse' : 'Consulting'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm">
                        {doc.waiting}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                        {doc.consulting}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{doc.completed}</td>
                    <td className="py-3 px-4">
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                        Active
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
