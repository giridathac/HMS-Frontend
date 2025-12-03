// Shared types and interfaces

export interface Patient {
  id: number;
  patientId: string;
  patientNo?: string;
  patientName: string;
  patientType?: string;
  lastName?: string;
  adhaarID?: string;
  panCard?: string;
  phoneNo: string;
  gender: string;
  age: number;
  address?: string;
  chiefComplaint?: string;
  description?: string;
  status?: string;
  registeredBy?: string;
  registeredDate?: string;
  // Legacy fields for backward compatibility
  name?: string;
  phone?: string;
  email?: string;
  bloodType?: string;
  lastVisit?: string;
  condition?: string;
  followUpCount?: number;
}

export interface Token {
  id: number;
  tokenNumber: string;
  patientName: string;
  patientPhone: string;
  doctorId: number;
  doctorName: string;
  status: 'Waiting' | 'Consulting' | 'Completed' | 'Cancelled';
  issueTime: string;
  consultTime?: string;
  isFollowUp?: boolean;
  patientId?: number;
}

export interface Appointment {
  id: number;
  patient: string;
  doctor: string;
  date: string;
  time: string;
  department: string;
  status: 'Confirmed' | 'Pending' | 'Cancelled' | 'Completed';
}

export interface PatientAppointment {
  id: number;
  patientAppointmentId: string;
  patientId: string;
  doctorId: string;
  appointmentDate: string;
  appointmentTime: string;
  tokenNo: string;
  appointmentStatus: 'Waiting' | 'Consulting' | 'Completed';
  consultationCharge: number;
  diagnosis?: string;
  followUpDetails?: string;
  prescriptionsUrl?: string;
  toBeAdmitted: boolean;
  referToAnotherDoctor: boolean;
  referredDoctorId?: string;
  transferToIPDOTICU: boolean;
  transferTo?: 'IPD Room Admission' | 'ICU' | 'OT';
  transferDetails?: string;
  billId?: string;
}

export interface Doctor {
  id: number;
  name: string;
  specialty: string;
  type: 'inhouse' | 'consulting';
}

export interface DashboardStats {
  opdPatientsToday: number;
  activeTokens: number;
  ipdAdmissions: number;
  otScheduled: number;
  icuOccupied: string;
  totalPatients: number;
}

export interface ChartData {
  day?: string;
  patients?: number;
  name?: string;
  value?: number;
  color?: string;
}

export interface DoctorQueue {
  doctor: string;
  specialty: string;
  type: 'inhouse' | 'consulting';
  waiting: number;
  consulting: number;
  completed: number;
}

export interface RoomBed {
  id: number;
  bedNo: string;
  roomNo: string;
  roomCategory: string;
  roomType: string;
  numberOfBeds: number;
  chargesPerDay: number;
  status: 'active' | 'inactive' | 'occupied' | 'maintenance';
  createdBy: string;
  createdAt: string;
}

export interface LabTest {
  id: number;
  displayTestId: string;
  testName: string;
  testCategory: string;
  description?: string;
  charges: number;
  status: 'active' | 'inactive';
}

export interface ICUBed {
  id: number;
  icuId: string;
  icuBedNo: string;
  icuType: string;
  icuRoomNameNo: string;
  icuDescription?: string;
  isVentilatorAttached: boolean;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface OTRoom {
  id: number;
  otId: string;
  otNo: string;
  otType: string;
  otName: string;
  otDescription?: string;
  startTimeofDay: string;
  endTimeofDay: string;
  createdBy: string;
  createdAt: string;
  status: 'active' | 'inactive';
}

export interface OTSlot {
  id: number;
  otSlotId: string;
  otId: string;
  otSlotNo: string;
  slotStartTime: string;
  slotEndTime: string;
  status: 'Active' | 'Inactive';
}

export interface Bill {
  id: number;
  billId: string;
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
  status: 'active' | 'inactive';
  billGeneratedBy: string;
  billGeneratedAt: string;
}

export interface EmergencyBed {
  id: number;
  emergencyBedId: string;
  emergencyBedNo: string;
  emergencyRoomDescription?: string;
  chargesPerDay: number;
  createdBy: string;
  createdAt: string;
  status: 'active' | 'inactive';
}

