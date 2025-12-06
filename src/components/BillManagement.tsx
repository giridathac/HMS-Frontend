import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Badge } from './ui/badge';
import { Receipt, Plus, Edit, Trash2, CheckCircle2, XCircle, Filter, X } from 'lucide-react';
import { billsApi, CreateBillDto, UpdateBillDto } from '../api/bills';
import { Bill } from '../types';

export function BillManagement() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [filterPatientId, setFilterPatientId] = useState<string>('');
  const [filterBillNo, setFilterBillNo] = useState<string>('');
  const [formData, setFormData] = useState({
    billNo: '',
    patientId: '',
    billEntityId: '',
    serviceId: '',
    quantity: '',
    rate: '',
    amount: '',
    billDateTime: new Date().toISOString().slice(0, 16),
    modeOfPayment: 'Cash' as Bill['modeOfPayment'],
    insuranceReferenceNo: '',
    insuranceBillAmount: '',
    schemeReferenceNo: '',
    paidStatus: 'NotPaid' as Bill['paidStatus'],
    status: 'active' as Bill['status'],
    billGeneratedBy: '1',
  });

  const fetchBills = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await billsApi.getAll();
      setBills(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch bills');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBills();
  }, [fetchBills]);

  const handleCreateBill = async (data: CreateBillDto) => {
    try {
      setError(null);
      const newBill = await billsApi.create(data);
      setBills(prev => [...prev, newBill]);
      return newBill;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create bill';
      setError(errorMessage);
      throw err;
    }
  };

  const handleUpdateBill = async (data: UpdateBillDto) => {
    try {
      setError(null);
      const updatedBill = await billsApi.update(data);
      setBills(prev => prev.map(b => b.id === data.id ? updatedBill : b));
      return updatedBill;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update bill';
      setError(errorMessage);
      throw err;
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this bill? This action cannot be undone.')) {
      try {
        await billsApi.delete(id);
        setBills(prev => prev.filter(b => b.id !== id));
      } catch (err) {
        console.error('Failed to delete bill:', err);
      }
    }
  };

  const calculateAmount = (qty: string, rate: string) => {
    const q = parseFloat(qty) || 0;
    const r = parseFloat(rate) || 0;
    return (q * r).toFixed(2);
  };

  const handleQuantityOrRateChange = (field: 'quantity' | 'rate', value: string) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      if (field === 'quantity' || field === 'rate') {
        updated.amount = calculateAmount(updated.quantity, updated.rate);
      }
      return updated;
    });
  };

  const handleAddSubmit = async () => {
    if (!formData.billNo || !formData.serviceId || !formData.quantity || !formData.rate) {
      alert('Please fill in all required fields.');
      return;
    }
    try {
      await handleCreateBill({
        billNo: formData.billNo,
        patientId: formData.patientId || null,
        billEntityId: formData.billEntityId ? parseInt(formData.billEntityId) : null,
        serviceId: formData.serviceId,
        quantity: parseFloat(formData.quantity),
        rate: parseFloat(formData.rate),
        amount: parseFloat(formData.amount),
        billDateTime: new Date(formData.billDateTime).toISOString(),
        modeOfPayment: formData.modeOfPayment,
        insuranceReferenceNo: formData.insuranceReferenceNo || undefined,
        insuranceBillAmount: formData.insuranceBillAmount ? parseFloat(formData.insuranceBillAmount) : undefined,
        schemeReferenceNo: formData.schemeReferenceNo || undefined,
        paidStatus: formData.paidStatus,
        status: formData.status,
        billGeneratedBy: formData.billGeneratedBy,
      });
      setIsAddDialogOpen(false);
      setFormData({
        billNo: '',
        patientId: '',
        billEntityId: '',
        serviceId: '',
        quantity: '',
        rate: '',
        amount: '',
        billDateTime: new Date().toISOString().slice(0, 16),
        modeOfPayment: 'Cash',
        insuranceReferenceNo: '',
        insuranceBillAmount: '',
        schemeReferenceNo: '',
        paidStatus: 'NotPaid',
        status: 'active',
        billGeneratedBy: '1',
      });
    } catch (err) {
      // Error handled in parent
    }
  };

  const handleEditSubmit = async () => {
    if (!selectedBill) return;
    if (!formData.billNo || !formData.serviceId || !formData.quantity || !formData.rate) {
      alert('Please fill in all required fields.');
      return;
    }
    try {
      await handleUpdateBill({
        id: selectedBill.id,
        billNo: formData.billNo,
        patientId: formData.patientId || null,
        billEntityId: formData.billEntityId ? parseInt(formData.billEntityId) : null,
        serviceId: formData.serviceId,
        quantity: parseFloat(formData.quantity),
        rate: parseFloat(formData.rate),
        amount: parseFloat(formData.amount),
        billDateTime: new Date(formData.billDateTime).toISOString(),
        modeOfPayment: formData.modeOfPayment,
        insuranceReferenceNo: formData.insuranceReferenceNo || undefined,
        insuranceBillAmount: formData.insuranceBillAmount ? parseFloat(formData.insuranceBillAmount) : undefined,
        schemeReferenceNo: formData.schemeReferenceNo || undefined,
        paidStatus: formData.paidStatus,
        status: formData.status,
        billGeneratedBy: formData.billGeneratedBy,
      });
      setIsEditDialogOpen(false);
      setSelectedBill(null);
      setFormData({
        billNo: '',
        patientId: '',
        billEntityId: '',
        serviceId: '',
        quantity: '',
        rate: '',
        amount: '',
        billDateTime: new Date().toISOString().slice(0, 16),
        modeOfPayment: 'Cash',
        insuranceReferenceNo: '',
        insuranceBillAmount: '',
        schemeReferenceNo: '',
        paidStatus: 'NotPaid',
        status: 'active',
        billGeneratedBy: '1',
      });
    } catch (err) {
      // Error handled in parent
    }
  };

  const handleEdit = (bill: Bill) => {
    setSelectedBill(bill);
    setFormData({
      billNo: bill.billNo,
      patientId: bill.patientId?.toString() || '',
      billEntityId: bill.billEntityId?.toString() || '',
      serviceId: bill.serviceId,
      quantity: bill.quantity.toString(),
      rate: bill.rate.toString(),
      amount: bill.amount.toString(),
      billDateTime: new Date(bill.billDateTime).toISOString().slice(0, 16),
      modeOfPayment: bill.modeOfPayment,
      insuranceReferenceNo: bill.insuranceReferenceNo || '',
      insuranceBillAmount: bill.insuranceBillAmount?.toString() || '',
      schemeReferenceNo: bill.schemeReferenceNo || '',
      paidStatus: bill.paidStatus,
      status: bill.status,
      billGeneratedBy: bill.billGeneratedBy,
    });
    setIsEditDialogOpen(true);
  };

  const getPaidStatusBadge = (status: Bill['paidStatus']) => {
    switch (status) {
      case 'Paid':
        return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700"><CheckCircle2 className="size-3" />Paid</span>;
      case 'NotPaid':
        return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700"><XCircle className="size-3" />Not Paid</span>;
      default:
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">{status}</span>;
    }
  };

  const getStatusBadge = (status: Bill['status']) => {
    switch (status) {
      case 'active':
        return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700"><CheckCircle2 className="size-3" />Active</span>;
      case 'inactive':
        return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700"><XCircle className="size-3" />Inactive</span>;
      default:
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">{status}</span>;
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center py-12 text-blue-600">Loading bills...</div>
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

  // Get unique values for filters
  const uniquePatientIds = Array.from(new Set(bills.map(b => b.patientId).filter(Boolean))).sort();
  const uniqueBillNos = Array.from(new Set(bills.map(b => b.billNo))).sort();

  // Filter bills based on selected filters
  const filteredBills = bills.filter(bill => {
    if (filterPatientId && bill.patientId !== filterPatientId) return false;
    if (filterBillNo && bill.billNo !== filterBillNo) return false;
    return true;
  });

  const clearFilters = () => {
    setFilterPatientId('');
    setFilterBillNo('');
  };

  const hasActiveFilters = filterPatientId || filterBillNo;

  return (
    <div className="flex-1 bg-blue-100 flex flex-col overflow-hidden min-h-0">
      <div className="px-4 pt-4 pb-0 flex-shrink-0">
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
          <div>
            <h1 className="text-gray-900 mb-0 text-xl">Bill Management</h1>
            <p className="text-gray-500 text-sm">Manage patient bills and billing information</p>
          </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="size-4" />
              Add Bill
            </Button>
          </DialogTrigger>
          <DialogContent className="p-0 gap-0 large-dialog">
            <DialogHeader className="px-6 pt-4 pb-3 flex-shrink-0">
              <DialogTitle>Add New Bill</DialogTitle>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto px-6 pb-1 patient-list-scrollable min-h-0">
              <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="billNo">Bill No *</Label>
                  <Input
                    id="billNo"
                    placeholder="e.g., BILL001"
                    value={formData.billNo}
                    onChange={(e) => setFormData({ ...formData, billNo: e.target.value })}
                  />
                  <p className="text-xs text-gray-500 mt-1">To be displayed on screen</p>
                </div>
                <div>
                  <Label htmlFor="patientId">Patient ID</Label>
                  <Input
                    id="patientId"
                    type="text"
                    placeholder="e.g., PAT-2025-0001 (Leave empty for non-registered patients)"
                    value={formData.patientId}
                    onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                  />
                  <p className="text-xs text-gray-500 mt-1">Enter Patient ID from Patient Registration (e.g., PAT-2025-0001). NULL allowed for non-registered patients.</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="billEntityId">Bill Entity ID</Label>
                  <Input
                    id="billEntityId"
                    type="number"
                    placeholder="Bill Entity ID"
                    value={formData.billEntityId}
                    onChange={(e) => setFormData({ ...formData, billEntityId: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="serviceId">Service ID *</Label>
                  <Input
                    id="serviceId"
                    placeholder="PatientAppointmentId / PatientLabTestsId / RoomAdmissionId / OTAllocationId / ICUAdmissionId / PharmacyId"
                    value={formData.serviceId}
                    onChange={(e) => setFormData({ ...formData, serviceId: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 bg-red-50 p-4 rounded-lg border border-red-200">
                <div>
                  <Label htmlFor="quantity" className="text-red-700">Quantity *</Label>
                  <Input
                    id="quantity"
                    type="number"
                    step="0.01"
                    placeholder="Enter quantity"
                    value={formData.quantity}
                    onChange={(e) => handleQuantityOrRateChange('quantity', e.target.value)}
                    className="border-red-300"
                  />
                </div>
                <div>
                  <Label htmlFor="rate" className="text-red-700">Rate (₹) *</Label>
                  <Input
                    id="rate"
                    type="number"
                    step="0.01"
                    placeholder="Enter rate"
                    value={formData.rate}
                    onChange={(e) => handleQuantityOrRateChange('rate', e.target.value)}
                    className="border-red-300"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="amount">Amount (₹)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="Auto-calculated"
                  value={formData.amount}
                  readOnly
                  className="bg-gray-50"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="billDateTime">Bill Date & Time</Label>
                  <Input
                    id="billDateTime"
                    type="datetime-local"
                    value={formData.billDateTime}
                    onChange={(e) => setFormData({ ...formData, billDateTime: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="modeOfPayment">Mode of Payment</Label>
                  <select
                    id="modeOfPayment"
                    aria-label="Mode of Payment"
                    className="w-full px-3 py-2 border border-gray-200 rounded-md"
                    value={formData.modeOfPayment}
                    onChange={(e) => setFormData({ ...formData, modeOfPayment: e.target.value as Bill['modeOfPayment'] })}
                  >
                    <option value="Cash">Cash</option>
                    <option value="Card">Card</option>
                    <option value="Insurance">Insurance</option>
                    <option value="Scheme">Scheme</option>
                  </select>
                </div>
              </div>
              {(formData.modeOfPayment === 'Insurance' || formData.modeOfPayment === 'Scheme') && (
                <div className="grid grid-cols-2 gap-4 bg-blue-50 p-4 rounded-lg border border-blue-200">
                  {formData.modeOfPayment === 'Insurance' && (
                    <>
                      <div>
                        <Label htmlFor="insuranceReferenceNo">Insurance Reference No</Label>
                        <Input
                          id="insuranceReferenceNo"
                          placeholder="Enter insurance reference number"
                          value={formData.insuranceReferenceNo}
                          onChange={(e) => setFormData({ ...formData, insuranceReferenceNo: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="insuranceBillAmount">Insurance Bill Amount (₹)</Label>
                        <Input
                          id="insuranceBillAmount"
                          type="number"
                          step="0.01"
                          placeholder="Enter insurance bill amount"
                          value={formData.insuranceBillAmount}
                          onChange={(e) => setFormData({ ...formData, insuranceBillAmount: e.target.value })}
                        />
                      </div>
                    </>
                  )}
                  {formData.modeOfPayment === 'Scheme' && (
                    <div>
                      <Label htmlFor="schemeReferenceNo">Scheme Reference No</Label>
                      <Input
                        id="schemeReferenceNo"
                        placeholder="Enter scheme reference number"
                        value={formData.schemeReferenceNo}
                        onChange={(e) => setFormData({ ...formData, schemeReferenceNo: e.target.value })}
                      />
                    </div>
                  )}
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="paidStatus">Paid Status</Label>
                  <select
                    id="paidStatus"
                    aria-label="Paid Status"
                    className="w-full px-3 py-2 border border-gray-200 rounded-md"
                    value={formData.paidStatus}
                    onChange={(e) => setFormData({ ...formData, paidStatus: e.target.value as Bill['paidStatus'] })}
                  >
                    <option value="Paid">Paid</option>
                    <option value="NotPaid">Not Paid</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <select
                    id="status"
                    aria-label="Status"
                    className="w-full px-3 py-2 border border-gray-200 rounded-md"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as Bill['status'] })}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div>
                <Label htmlFor="billGeneratedBy">Bill Generated By (User ID)</Label>
                <Input
                  id="billGeneratedBy"
                  type="text"
                  placeholder="e.g., 1"
                  value={formData.billGeneratedBy}
                  onChange={(e) => setFormData({ ...formData, billGeneratedBy: e.target.value })}
                />
              </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 px-6 py-2 border-t bg-gray-50 flex-shrink-0">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="py-1">Cancel</Button>
              <Button onClick={handleAddSubmit} className="py-1">Add Bill</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="overflow-y-auto overflow-x-hidden px-4 pb-4 billmanagement-scrollable" style={{ maxHeight: 'calc(100vh - 100px)', minHeight: 0 }}>
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="size-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 items-end">
            <div>
              <Label htmlFor="filter-patientId">Filter by Patient ID</Label>
              <select
                id="filter-patientId"
                aria-label="Filter by Patient ID"
                className="w-full px-3 py-2 border border-gray-200 rounded-md"
                value={filterPatientId}
                onChange={(e) => setFilterPatientId(e.target.value)}
              >
                <option value="">All Patient IDs</option>
                {uniquePatientIds.map(patientId => (
                  <option key={patientId} value={patientId}>{patientId}</option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="filter-billNo">Filter by Bill No</Label>
              <select
                id="filter-billNo"
                aria-label="Filter by Bill No"
                className="w-full px-3 py-2 border border-gray-200 rounded-md"
                value={filterBillNo}
                onChange={(e) => setFilterBillNo(e.target.value)}
              >
                <option value="">All Bill Nos</option>
                {uniqueBillNos.map(billNo => (
                  <option key={billNo} value={billNo}>{billNo}</option>
                ))}
              </select>
            </div>
            <div>
              {hasActiveFilters && (
                <Button variant="outline" onClick={clearFilters} className="w-full gap-2">
                  <X className="size-4" />
                  Clear Filters
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bills Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="size-5" />
            Bills List ({filteredBills.length} {hasActiveFilters ? `of ${bills.length}` : ''})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Bill ID</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Bill No</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Patient ID</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Service ID</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Quantity</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Rate (₹)</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Amount (₹)</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Bill Date/Time</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Mode of Payment</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Paid Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Generated By</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBills.length === 0 ? (
                  <tr>
                    <td colSpan={13} className="text-center py-8 text-gray-500">
                      {hasActiveFilters ? 'No bills match the selected filters.' : 'No bills found. Add a new bill to get started.'}
                    </td>
                  </tr>
                ) : (
                  filteredBills.map((bill) => (
                    <tr key={bill.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm text-gray-900 font-mono font-medium whitespace-nowrap">{bill.billId}</td>
                      <td className="py-3 px-4 text-sm text-gray-900 font-medium">{bill.billNo}</td>
                      <td className="py-3 px-4 text-sm text-gray-700 font-mono whitespace-nowrap">{bill.patientId || '-'}</td>
                      <td className="py-3 px-4 text-sm text-gray-700 max-w-xs truncate" title={bill.serviceId}>{bill.serviceId}</td>
                      <td className="py-3 px-4 text-sm text-red-600 font-medium">{bill.quantity}</td>
                      <td className="py-3 px-4 text-sm text-red-600 font-medium">₹{bill.rate.toFixed(2)}</td>
                      <td className="py-3 px-4 text-sm text-gray-900 font-semibold">
                        ₹{bill.amount.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-700">{new Date(bill.billDateTime).toLocaleString()}</td>
                      <td className="py-3 px-4 text-sm text-gray-700">{bill.modeOfPayment}</td>
                      <td className="py-3 px-4 text-sm">{getPaidStatusBadge(bill.paidStatus)}</td>
                      <td className="py-3 px-4 text-sm">{getStatusBadge(bill.status)}</td>
                      <td className="py-3 px-4 text-sm text-gray-700">{bill.billGeneratedBy}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(bill)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(bill.id)}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="p-0 gap-0 large-dialog">
          <DialogHeader className="px-6 pt-4 pb-3 flex-shrink-0">
            <DialogTitle>Edit Bill</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto px-6 pb-1 patient-list-scrollable min-h-0">
            <div className="space-y-4 py-4">
            {selectedBill && (
              <div>
                <Label>Bill ID</Label>
                <Input
                  value={selectedBill.billId}
                  disabled
                  className="bg-gray-50 text-gray-500"
                />
                <p className="text-xs text-gray-500 mt-1">Bill ID is auto-generated and cannot be changed</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-billNo">Bill No *</Label>
                <Input
                  id="edit-billNo"
                  placeholder="e.g., BILL001"
                  value={formData.billNo}
                  onChange={(e) => setFormData({ ...formData, billNo: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-patientId">Patient ID</Label>
                <Input
                  id="edit-patientId"
                  type="text"
                  placeholder="e.g., PAT-2025-0001 (Leave empty for non-registered patients)"
                  value={formData.patientId}
                  onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                />
                <p className="text-xs text-gray-500 mt-1">Enter Patient ID from Patient Registration (e.g., PAT-2025-0001). NULL allowed for non-registered patients.</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-billEntityId">Bill Entity ID</Label>
                <Input
                  id="edit-billEntityId"
                  type="number"
                  placeholder="Bill Entity ID"
                  value={formData.billEntityId}
                  onChange={(e) => setFormData({ ...formData, billEntityId: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-serviceId">Service ID *</Label>
                <Input
                  id="edit-serviceId"
                  placeholder="PatientAppointmentId / PatientLabTestsId / RoomAdmissionId / OTAllocationId / ICUAdmissionId / PharmacyId"
                  value={formData.serviceId}
                  onChange={(e) => setFormData({ ...formData, serviceId: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 bg-red-50 p-4 rounded-lg border border-red-200">
              <div>
                <Label htmlFor="edit-quantity" className="text-red-700">Quantity *</Label>
                <Input
                  id="edit-quantity"
                  type="number"
                  step="0.01"
                  placeholder="Enter quantity"
                  value={formData.quantity}
                  onChange={(e) => handleQuantityOrRateChange('quantity', e.target.value)}
                  className="border-red-300"
                />
              </div>
              <div>
                <Label htmlFor="edit-rate" className="text-red-700">Rate (₹) *</Label>
                <Input
                  id="edit-rate"
                  type="number"
                  step="0.01"
                  placeholder="Enter rate"
                  value={formData.rate}
                  onChange={(e) => handleQuantityOrRateChange('rate', e.target.value)}
                  className="border-red-300"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit-amount">Amount (₹)</Label>
              <Input
                id="edit-amount"
                type="number"
                step="0.01"
                placeholder="Auto-calculated"
                value={formData.amount}
                readOnly
                className="bg-gray-50"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-billDateTime">Bill Date & Time</Label>
                <Input
                  id="edit-billDateTime"
                  type="datetime-local"
                  value={formData.billDateTime}
                  onChange={(e) => setFormData({ ...formData, billDateTime: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-modeOfPayment">Mode of Payment</Label>
                <select
                  id="edit-modeOfPayment"
                  aria-label="Mode of Payment"
                  className="w-full px-3 py-2 border border-gray-200 rounded-md"
                  value={formData.modeOfPayment}
                  onChange={(e) => setFormData({ ...formData, modeOfPayment: e.target.value as Bill['modeOfPayment'] })}
                >
                  <option value="Cash">Cash</option>
                  <option value="Card">Card</option>
                  <option value="Insurance">Insurance</option>
                  <option value="Scheme">Scheme</option>
                </select>
              </div>
            </div>
            {(formData.modeOfPayment === 'Insurance' || formData.modeOfPayment === 'Scheme') && (
              <div className="grid grid-cols-2 gap-4 bg-blue-50 p-4 rounded-lg border border-blue-200">
                {formData.modeOfPayment === 'Insurance' && (
                  <>
                    <div>
                      <Label htmlFor="edit-insuranceReferenceNo">Insurance Reference No</Label>
                      <Input
                        id="edit-insuranceReferenceNo"
                        placeholder="Enter insurance reference number"
                        value={formData.insuranceReferenceNo}
                        onChange={(e) => setFormData({ ...formData, insuranceReferenceNo: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-insuranceBillAmount">Insurance Bill Amount (₹)</Label>
                      <Input
                        id="edit-insuranceBillAmount"
                        type="number"
                        step="0.01"
                        placeholder="Enter insurance bill amount"
                        value={formData.insuranceBillAmount}
                        onChange={(e) => setFormData({ ...formData, insuranceBillAmount: e.target.value })}
                      />
                    </div>
                  </>
                )}
                {formData.modeOfPayment === 'Scheme' && (
                  <div>
                    <Label htmlFor="edit-schemeReferenceNo">Scheme Reference No</Label>
                    <Input
                      id="edit-schemeReferenceNo"
                      placeholder="Enter scheme reference number"
                      value={formData.schemeReferenceNo}
                      onChange={(e) => setFormData({ ...formData, schemeReferenceNo: e.target.value })}
                    />
                  </div>
                )}
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-paidStatus">Paid Status</Label>
                <select
                  id="edit-paidStatus"
                  aria-label="Paid Status"
                  className="w-full px-3 py-2 border border-gray-200 rounded-md"
                  value={formData.paidStatus}
                  onChange={(e) => setFormData({ ...formData, paidStatus: e.target.value as Bill['paidStatus'] })}
                >
                  <option value="Paid">Paid</option>
                  <option value="NotPaid">Not Paid</option>
                </select>
              </div>
              <div>
                <Label htmlFor="edit-status">Status</Label>
                <select
                  id="edit-status"
                  aria-label="Status"
                  className="w-full px-3 py-2 border border-gray-200 rounded-md"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as Bill['status'] })}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div>
              <Label htmlFor="edit-billGeneratedBy">Bill Generated By (User ID)</Label>
              <Input
                id="edit-billGeneratedBy"
                type="text"
                placeholder="e.g., 1"
                value={formData.billGeneratedBy}
                onChange={(e) => setFormData({ ...formData, billGeneratedBy: e.target.value })}
              />
            </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 px-6 py-2 border-t bg-gray-50 flex-shrink-0">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="py-1">Cancel</Button>
            <Button onClick={handleEditSubmit} className="py-1">Update Bill</Button>
          </div>
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
}

