// FrontDesk Component - Separated UI from logic
import React, { useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Search, Plus, Printer, Users } from 'lucide-react';
import { useTokens } from '../hooks';
import { Token } from '../types';

interface FrontDeskViewProps {
  tokens: Token[];
  doctors: Array<{ id: number; name: string; specialty: string; type: 'inhouse' | 'consulting' }>;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onCreateToken: (data: { patientName: string; patientPhone: string; doctorId: number; isFollowUp?: boolean; patientId?: number }) => Promise<Token>;
  getTokensByStatus: (status: Token['status']) => Token[];
}

export function FrontDesk() {
  const { tokens, doctors, loading, error, createToken, getTokensByStatus } = useTokens();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTokens = tokens.filter(token =>
    token.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    token.tokenNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateToken = async (data: { patientName: string; patientPhone: string; doctorId: number; isFollowUp?: boolean; patientId?: number }) => {
    try {
      const newToken = await createToken(data);
      
      // If it's a follow-up visit, increment the patient's follow-up count
      if (data.isFollowUp && data.patientId) {
        try {
          const { patientsApi } = await import('../api');
          await patientsApi.incrementFollowUpCount(data.patientId);
        } catch (err) {
          console.error('Failed to increment follow-up count:', err);
        }
      }
      
      const followUpText = newToken.isFollowUp ? '\nType: Follow-up Visit' : '\nType: New Visit';
      alert(`Token Generated!\n\nToken Number: ${newToken.tokenNumber}\nPatient: ${newToken.patientName}\nDoctor: ${newToken.doctorName}\nTime: ${newToken.issueTime}${followUpText}`);
      return newToken;
    } catch (err) {
      console.error('Failed to create token:', err);
      throw err;
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center py-12 text-gray-500">Loading tokens...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="text-center py-12 text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <FrontDeskView
      tokens={filteredTokens}
      doctors={doctors}
      searchTerm={searchTerm}
      onSearchChange={setSearchTerm}
      onCreateToken={handleCreateToken}
      getTokensByStatus={getTokensByStatus}
    />
  );
}

function FrontDeskView({ 
  tokens, 
  doctors, 
  searchTerm, 
  onSearchChange, 
  onCreateToken, 
  getTokensByStatus 
}: FrontDeskViewProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [isFollowUp, setIsFollowUp] = useState(false);
  const [patientId, setPatientId] = useState<number | undefined>(undefined);

  const handleGenerateToken = async () => {
    if (!selectedDoctor || !patientName || !patientPhone) {
      alert('Please fill all fields');
      return;
    }

    try {
      await onCreateToken({
        patientName,
        patientPhone,
        doctorId: parseInt(selectedDoctor),
        isFollowUp,
        patientId,
      });
      setIsDialogOpen(false);
      setPatientName('');
      setPatientPhone('');
      setSelectedDoctor('');
      setIsFollowUp(false);
      setPatientId(undefined);
    } catch (err) {
      // Error handling is done in the parent
    }
  };

  const handlePhoneChange = async (phone: string) => {
    setPatientPhone(phone);
    if (phone.length >= 10) {
      // Check if patient exists
      try {
        const { patientsApi } = await import('../api');
        const patient = await patientsApi.findByPhone(phone);
        if (patient) {
          setPatientName(patient.name);
          setPatientId(patient.id);
          setIsFollowUp(true); // Auto-check if patient exists (likely follow-up)
        } else {
          setPatientId(undefined);
          setIsFollowUp(false);
        }
      } catch (err) {
        // If patient not found, it's a new patient
        setPatientId(undefined);
        setIsFollowUp(false);
      }
    }
  };

  return (
    <div className="p-8 bg-blue-100 min-h-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-blue-900 mb-2">Front Desk - Token Management</h1>
          <p className="text-blue-600">Generate and manage patient tokens for doctor consultation</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="size-4" />
              Generate Token
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Generate Patient Token</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="patientName">Patient Name</Label>
                <Input
                  id="patientName"
                  placeholder="Enter patient name"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="patientPhone">Phone Number</Label>
                <Input
                  id="patientPhone"
                  placeholder="Enter phone number"
                  value={patientPhone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                />
                {patientId && (
                  <p className="text-xs text-blue-600 mt-1">Existing patient found - Follow-up visit</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isFollowUp"
                  aria-label="This is a follow-up visit"
                  checked={isFollowUp}
                  onChange={(e) => setIsFollowUp(e.target.checked)}
                  className="size-4"
                />
                <Label htmlFor="isFollowUp" className="text-sm">
                  This is a follow-up visit
                </Label>
              </div>
              <div>
                <Label htmlFor="doctor">Select Doctor</Label>
                <select
                  id="doctor"
                  aria-label="Select Doctor"
                  className="w-full px-3 py-2 border border-gray-200 rounded-md"
                  value={selectedDoctor}
                  onChange={(e) => setSelectedDoctor(e.target.value)}
                >
                  <option value="">Select a doctor</option>
                  <optgroup label="Inhouse Doctors">
                    {doctors.filter(d => d.type === 'inhouse').map(doc => (
                      <option key={doc.id} value={doc.id}>
                        {doc.name} - {doc.specialty}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Consulting Doctors">
                    {doctors.filter(d => d.type === 'consulting').map(doc => (
                      <option key={doc.id} value={doc.id}>
                        {doc.name} - {doc.specialty}
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleGenerateToken}>Generate & Print</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Tokens</p>
                <h3 className="text-gray-900">{tokens.length}</h3>
              </div>
              <Users className="size-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Waiting</p>
                <h3 className="text-gray-900">{getTokensByStatus('Waiting').length}</h3>
              </div>
              <div className="size-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <span className="text-yellow-700">⏳</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Consulting</p>
                <h3 className="text-gray-900">{getTokensByStatus('Consulting').length}</h3>
              </div>
              <div className="size-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-700">👨‍⚕️</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Completed</p>
                <h3 className="text-gray-900">{getTokensByStatus('Completed').length}</h3>
              </div>
              <div className="size-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-700">✓</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
            <Input
              placeholder="Search by patient name or token number..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tokens by Status */}
      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">All Tokens ({tokens.length})</TabsTrigger>
          <TabsTrigger value="waiting">Waiting ({getTokensByStatus('Waiting').length})</TabsTrigger>
          <TabsTrigger value="consulting">Consulting ({getTokensByStatus('Consulting').length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({getTokensByStatus('Completed').length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <TokenList tokens={tokens} doctors={doctors} />
        </TabsContent>
        <TabsContent value="waiting">
          <TokenList tokens={getTokensByStatus('Waiting')} doctors={doctors} />
        </TabsContent>
        <TabsContent value="consulting">
          <TokenList tokens={getTokensByStatus('Consulting')} doctors={doctors} />
        </TabsContent>
        <TabsContent value="completed">
          <TokenList tokens={getTokensByStatus('Completed')} doctors={doctors} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function TokenList({ tokens, doctors }: { tokens: Token[]; doctors: Array<{ id: number; name: string; specialty: string; type: 'inhouse' | 'consulting' }> }) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-gray-700">Token #</th>
                <th className="text-left py-3 px-4 text-gray-700">Patient Name</th>
                <th className="text-left py-3 px-4 text-gray-700">Phone</th>
                <th className="text-left py-3 px-4 text-gray-700">Doctor</th>
                <th className="text-left py-3 px-4 text-gray-700">Issue Time</th>
                <th className="text-left py-3 px-4 text-gray-700">Status</th>
                <th className="text-left py-3 px-4 text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tokens.map((token) => (
                <tr key={token.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <span className="px-3 py-1 bg-gray-100 text-gray-900 rounded">
                      {token.tokenNumber}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-900">
                    {token.patientName}
                    {token.isFollowUp && (
                      <span className="ml-2 px-2 py-0.5 rounded text-xs bg-green-100 text-green-700">
                        Follow-up
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-gray-600">{token.patientPhone}</td>
                  <td className="py-3 px-4 text-gray-600">
                    {token.doctorName}
                    {(() => {
                      const doctor = doctors.find(d => d.id === token.doctorId);
                      if (doctor) {
                        return (
                          <span className={`ml-2 px-2 py-0.5 rounded text-xs ${
                            doctor.type === 'inhouse' 
                              ? 'bg-blue-100 text-blue-700' 
                              : 'bg-purple-100 text-purple-700'
                          }`}>
                            {doctor.type === 'inhouse' ? 'Inhouse' : 'Consulting'}
                          </span>
                        );
                      }
                      return null;
                    })()}
                  </td>
                  <td className="py-3 px-4 text-gray-600">{token.issueTime}</td>
                  <td className="py-3 px-4">
                    <span className={`px-3 py-1 rounded-full text-xs ${
                      token.status === 'Waiting' ? 'bg-yellow-100 text-yellow-700' :
                      token.status === 'Consulting' ? 'bg-blue-100 text-blue-700' :
                      token.status === 'Completed' ? 'bg-green-100 text-green-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {token.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <Button variant="ghost" size="sm" className="gap-2">
                      <Printer className="size-4" />
                      Reprint
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {tokens.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No tokens found
          </div>
        )}
      </CardContent>
    </Card>
  );
}
