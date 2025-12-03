// Bills API service
import { apiRequest } from './base';
import { Bill } from '../types';

// Stub data
const stubBills: Bill[] = [
  { 
    id: 1, 
    billId: 'BILL-001', 
    billNo: 'BILL001', 
    patientId: 'PAT-2025-0001', 
    billEntityId: 1, 
    serviceId: 'PatientAppointmentId-001', 
    quantity: 1, 
    rate: 500, 
    amount: 500, 
    billDateTime: '2025-01-15T10:30:00Z', 
    modeOfPayment: 'Cash', 
    paidStatus: 'Paid', 
    status: 'active', 
    billGeneratedBy: '1', 
    billGeneratedAt: '2025-01-15T10:30:00Z' 
  },
  { 
    id: 2, 
    billId: 'BILL-002', 
    billNo: 'BILL002', 
    patientId: 'PAT-2025-0002', 
    billEntityId: 2, 
    serviceId: 'PatientLabTestsId-002', 
    quantity: 3, 
    rate: 1500, 
    amount: 4500, 
    billDateTime: '2025-01-15T11:00:00Z', 
    modeOfPayment: 'Card', 
    paidStatus: 'Paid', 
    status: 'active', 
    billGeneratedBy: '1', 
    billGeneratedAt: '2025-01-15T11:00:00Z' 
  },
  { 
    id: 3, 
    billId: 'BILL-003', 
    billNo: 'BILL003', 
    patientId: null, 
    billEntityId: 3, 
    serviceId: 'OTAllocationId-003', 
    quantity: 1, 
    rate: 5000, 
    amount: 5000, 
    billDateTime: '2025-01-15T12:00:00Z', 
    modeOfPayment: 'Insurance', 
    insuranceReferenceNo: 'INS-12345', 
    insuranceBillAmount: 5000, 
    paidStatus: 'NotPaid', 
    status: 'active', 
    billGeneratedBy: '1', 
    billGeneratedAt: '2025-01-15T12:00:00Z' 
  },
  { 
    id: 4, 
    billId: 'BILL-004', 
    billNo: 'BILL004', 
    patientId: 'PAT-2025-0003', 
    billEntityId: 4, 
    serviceId: 'RoomAdmissionId-004', 
    quantity: 5, 
    rate: 2000, 
    amount: 10000, 
    billDateTime: '2025-01-15T13:00:00Z', 
    modeOfPayment: 'Scheme', 
    schemeReferenceNo: 'SCH-67890', 
    paidStatus: 'Paid', 
    status: 'active', 
    billGeneratedBy: '1', 
    billGeneratedAt: '2025-01-15T13:00:00Z' 
  },
  { 
    id: 5, 
    billId: 'BILL-005', 
    billNo: 'BILL005', 
    patientId: 'PAT-2025-0004', 
    billEntityId: 5, 
    serviceId: 'ICUAdmissionId-005', 
    quantity: 2, 
    rate: 3000, 
    amount: 6000, 
    billDateTime: '2025-01-15T14:00:00Z', 
    modeOfPayment: 'Cash', 
    paidStatus: 'Paid', 
    status: 'active', 
    billGeneratedBy: '1', 
    billGeneratedAt: '2025-01-15T14:00:00Z' 
  },
];

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Generate Bill ID in format BILL-XXX
function generateBillId(): string {
  const count = stubBills.length + 1;
  return `BILL-${count.toString().padStart(3, '0')}`;
}

// Generate Bill No in format BILLXXX
function generateBillNo(): string {
  const count = stubBills.length + 1;
  return `BILL${count.toString().padStart(3, '0')}`;
}

export interface CreateBillDto {
  billNo: string;
  patientId: string | null;
  billEntityId: number | null;
  serviceId: string;
  quantity: number;
  rate: number;
  amount: number;
  billDateTime: string;
  modeOfPayment: 'Cash' | 'Card' | 'Insurance' | 'Scheme';
  insuranceReferenceNo?: string;
  insuranceBillAmount?: number;
  schemeReferenceNo?: string;
  paidStatus: 'Paid' | 'NotPaid';
  status?: 'active' | 'inactive';
  billGeneratedBy: string;
}

export interface UpdateBillDto extends Partial<CreateBillDto> {
  id: number;
}

export const billsApi = {
  async getAll(): Promise<Bill[]> {
    // Replace with: return apiRequest<Bill[]>('/bills');
    await delay(300);
    return Promise.resolve([...stubBills]);
  },

  async getById(id: number): Promise<Bill> {
    // Replace with: return apiRequest<Bill>(`/bills/${id}`);
    await delay(200);
    const bill = stubBills.find(b => b.id === id);
    if (!bill) {
      throw new Error(`Bill with id ${id} not found`);
    }
    return Promise.resolve(bill);
  },

  async getByPatientId(patientId: string): Promise<Bill[]> {
    // Replace with: return apiRequest<Bill[]>(`/bills?patientId=${patientId}`);
    await delay(200);
    return Promise.resolve(stubBills.filter(b => b.patientId === patientId));
  },

  async create(data: CreateBillDto): Promise<Bill> {
    // Replace with: return apiRequest<Bill>('/bills', { method: 'POST', body: JSON.stringify(data) });
    await delay(400);
    const newBill: Bill = {
      id: stubBills.length + 1,
      billId: generateBillId(),
      billNo: data.billNo || generateBillNo(),
      status: data.status || 'active',
      billGeneratedAt: new Date().toISOString(),
      ...data,
    };
    stubBills.push(newBill);
    return Promise.resolve(newBill);
  },

  async update(data: UpdateBillDto): Promise<Bill> {
    // Replace with: return apiRequest<Bill>(`/bills/${data.id}`, { method: 'PUT', body: JSON.stringify(data) });
    await delay(400);
    const index = stubBills.findIndex(b => b.id === data.id);
    if (index === -1) {
      throw new Error(`Bill with id ${data.id} not found`);
    }
    stubBills[index] = { ...stubBills[index], ...data };
    return Promise.resolve(stubBills[index]);
  },

  async delete(id: number): Promise<void> {
    // Replace with: return apiRequest<void>(`/bills/${id}`, { method: 'DELETE' });
    await delay(300);
    const index = stubBills.findIndex(b => b.id === id);
    if (index === -1) {
      throw new Error(`Bill with id ${id} not found`);
    }
    stubBills.splice(index, 1);
    return Promise.resolve();
  },
};

