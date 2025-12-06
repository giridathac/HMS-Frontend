// OT Slots API service
import { apiRequest, ENABLE_STUB_DATA } from './base';
import { OTSlot } from '../types';

// API Response types
interface OTSlotResponseItem {
  OTSlotId: number;
  OTId: number;
  OTSlotNo: string;
  SlotStartTime: string;
  SlotEndTime: string;
  Status: string;
  CreatedAt: string | Date;
  OTNo: string | null;
  OTName: string | null;
  OTType: string | null;
}

interface OTSlotAPIResponse {
  success: boolean;
  count: number;
  data: OTSlotResponseItem[];
}

interface OTSlotCreateResponse {
  success: boolean;
  message: string;
  data: OTSlotResponseItem;
}

interface OTSlotGetByIdResponse {
  success: boolean;
  data: OTSlotResponseItem;
}

// Stub data for OT Slots
const stubOTSlots: OTSlotResponseItem[] = [
  // OT-01 slots (General Operating Theatre 1) - 20+ records for scrollbar testing
  { OTSlotId: 1, OTId: 1, OTSlotNo: 'SLOT-001', SlotStartTime: '08:00', SlotEndTime: '08:30', Status: 'Active', CreatedAt: '2025-01-01T10:00:00Z', OTNo: 'OT-001', OTName: 'General Operating Theatre 1', OTType: 'General' },
  { OTSlotId: 2, OTId: 1, OTSlotNo: 'SLOT-002', SlotStartTime: '08:30', SlotEndTime: '09:00', Status: 'Active', CreatedAt: '2025-01-01T10:00:00Z', OTNo: 'OT-001', OTName: 'General Operating Theatre 1', OTType: 'General' },
  { OTSlotId: 3, OTId: 1, OTSlotNo: 'SLOT-003', SlotStartTime: '09:00', SlotEndTime: '09:30', Status: 'Active', CreatedAt: '2025-01-01T10:00:00Z', OTNo: 'OT-001', OTName: 'General Operating Theatre 1', OTType: 'General' },
  { OTSlotId: 4, OTId: 1, OTSlotNo: 'SLOT-004', SlotStartTime: '09:30', SlotEndTime: '10:00', Status: 'Active', CreatedAt: '2025-01-01T10:00:00Z', OTNo: 'OT-001', OTName: 'General Operating Theatre 1', OTType: 'General' },
  { OTSlotId: 5, OTId: 1, OTSlotNo: 'SLOT-005', SlotStartTime: '10:00', SlotEndTime: '10:30', Status: 'Active', CreatedAt: '2025-01-01T10:00:00Z', OTNo: 'OT-001', OTName: 'General Operating Theatre 1', OTType: 'General' },
  { OTSlotId: 6, OTId: 1, OTSlotNo: 'SLOT-006', SlotStartTime: '10:30', SlotEndTime: '11:00', Status: 'Active', CreatedAt: '2025-01-01T10:00:00Z', OTNo: 'OT-001', OTName: 'General Operating Theatre 1', OTType: 'General' },
  { OTSlotId: 7, OTId: 1, OTSlotNo: 'SLOT-007', SlotStartTime: '11:00', SlotEndTime: '11:30', Status: 'Active', CreatedAt: '2025-01-01T10:00:00Z', OTNo: 'OT-001', OTName: 'General Operating Theatre 1', OTType: 'General' },
  { OTSlotId: 8, OTId: 1, OTSlotNo: 'SLOT-008', SlotStartTime: '11:30', SlotEndTime: '12:00', Status: 'Active', CreatedAt: '2025-01-01T10:00:00Z', OTNo: 'OT-001', OTName: 'General Operating Theatre 1', OTType: 'General' },
  { OTSlotId: 9, OTId: 1, OTSlotNo: 'SLOT-009', SlotStartTime: '12:00', SlotEndTime: '12:30', Status: 'Active', CreatedAt: '2025-01-01T10:00:00Z', OTNo: 'OT-001', OTName: 'General Operating Theatre 1', OTType: 'General' },
  { OTSlotId: 10, OTId: 1, OTSlotNo: 'SLOT-010', SlotStartTime: '12:30', SlotEndTime: '13:00', Status: 'Active', CreatedAt: '2025-01-01T10:00:00Z', OTNo: 'OT-001', OTName: 'General Operating Theatre 1', OTType: 'General' },
  { OTSlotId: 11, OTId: 1, OTSlotNo: 'SLOT-011', SlotStartTime: '13:00', SlotEndTime: '13:30', Status: 'Active', CreatedAt: '2025-01-01T10:00:00Z', OTNo: 'OT-001', OTName: 'General Operating Theatre 1', OTType: 'General' },
  { OTSlotId: 12, OTId: 1, OTSlotNo: 'SLOT-012', SlotStartTime: '13:30', SlotEndTime: '14:00', Status: 'Active', CreatedAt: '2025-01-01T10:00:00Z', OTNo: 'OT-001', OTName: 'General Operating Theatre 1', OTType: 'General' },
  { OTSlotId: 13, OTId: 1, OTSlotNo: 'SLOT-013', SlotStartTime: '14:00', SlotEndTime: '14:30', Status: 'Active', CreatedAt: '2025-01-01T10:00:00Z', OTNo: 'OT-001', OTName: 'General Operating Theatre 1', OTType: 'General' },
  { OTSlotId: 14, OTId: 1, OTSlotNo: 'SLOT-014', SlotStartTime: '14:30', SlotEndTime: '15:00', Status: 'Active', CreatedAt: '2025-01-01T10:00:00Z', OTNo: 'OT-001', OTName: 'General Operating Theatre 1', OTType: 'General' },
  { OTSlotId: 15, OTId: 1, OTSlotNo: 'SLOT-015', SlotStartTime: '15:00', SlotEndTime: '15:30', Status: 'Active', CreatedAt: '2025-01-01T10:00:00Z', OTNo: 'OT-001', OTName: 'General Operating Theatre 1', OTType: 'General' },
  { OTSlotId: 16, OTId: 1, OTSlotNo: 'SLOT-016', SlotStartTime: '15:30', SlotEndTime: '16:00', Status: 'Active', CreatedAt: '2025-01-01T10:00:00Z', OTNo: 'OT-001', OTName: 'General Operating Theatre 1', OTType: 'General' },
  { OTSlotId: 17, OTId: 1, OTSlotNo: 'SLOT-017', SlotStartTime: '16:00', SlotEndTime: '16:30', Status: 'Active', CreatedAt: '2025-01-01T10:00:00Z', OTNo: 'OT-001', OTName: 'General Operating Theatre 1', OTType: 'General' },
  { OTSlotId: 18, OTId: 1, OTSlotNo: 'SLOT-018', SlotStartTime: '16:30', SlotEndTime: '17:00', Status: 'Active', CreatedAt: '2025-01-01T10:00:00Z', OTNo: 'OT-001', OTName: 'General Operating Theatre 1', OTType: 'General' },
  { OTSlotId: 19, OTId: 1, OTSlotNo: 'SLOT-019', SlotStartTime: '17:00', SlotEndTime: '17:30', Status: 'Active', CreatedAt: '2025-01-01T10:00:00Z', OTNo: 'OT-001', OTName: 'General Operating Theatre 1', OTType: 'General' },
  { OTSlotId: 20, OTId: 1, OTSlotNo: 'SLOT-020', SlotStartTime: '17:30', SlotEndTime: '18:00', Status: 'Active', CreatedAt: '2025-01-01T10:00:00Z', OTNo: 'OT-001', OTName: 'General Operating Theatre 1', OTType: 'General' },
  { OTSlotId: 21, OTId: 1, OTSlotNo: 'SLOT-021', SlotStartTime: '18:00', SlotEndTime: '18:30', Status: 'Active', CreatedAt: '2025-01-01T10:00:00Z', OTNo: 'OT-001', OTName: 'General Operating Theatre 1', OTType: 'General' },
  { OTSlotId: 22, OTId: 1, OTSlotNo: 'SLOT-022', SlotStartTime: '18:30', SlotEndTime: '19:00', Status: 'Active', CreatedAt: '2025-01-01T10:00:00Z', OTNo: 'OT-001', OTName: 'General Operating Theatre 1', OTType: 'General' },
  { OTSlotId: 23, OTId: 1, OTSlotNo: 'SLOT-023', SlotStartTime: '19:00', SlotEndTime: '19:30', Status: 'Active', CreatedAt: '2025-01-01T10:00:00Z', OTNo: 'OT-001', OTName: 'General Operating Theatre 1', OTType: 'General' },
  { OTSlotId: 24, OTId: 1, OTSlotNo: 'SLOT-024', SlotStartTime: '19:30', SlotEndTime: '20:00', Status: 'Active', CreatedAt: '2025-01-01T10:00:00Z', OTNo: 'OT-001', OTName: 'General Operating Theatre 1', OTType: 'General' },
  
  // OT-02 slots (Cardiac Operating Theatre)
  { OTSlotId: 25, OTId: 2, OTSlotNo: 'SLOT-001', SlotStartTime: '08:00', SlotEndTime: '11:00', Status: 'Active', CreatedAt: '2025-01-01T10:00:00Z', OTNo: 'OT-002', OTName: 'Cardiac Operating Theatre', OTType: 'Cardiac' },
  { OTSlotId: 26, OTId: 2, OTSlotNo: 'SLOT-002', SlotStartTime: '11:00', SlotEndTime: '14:00', Status: 'Active', CreatedAt: '2025-01-01T10:00:00Z', OTNo: 'OT-002', OTName: 'Cardiac Operating Theatre', OTType: 'Cardiac' },
  { OTSlotId: 27, OTId: 2, OTSlotNo: 'SLOT-003', SlotStartTime: '14:00', SlotEndTime: '17:00', Status: 'Active', CreatedAt: '2025-01-01T10:00:00Z', OTNo: 'OT-002', OTName: 'Cardiac Operating Theatre', OTType: 'Cardiac' },
  { OTSlotId: 28, OTId: 2, OTSlotNo: 'SLOT-004', SlotStartTime: '17:00', SlotEndTime: '20:00', Status: 'Active', CreatedAt: '2025-01-01T10:00:00Z', OTNo: 'OT-002', OTName: 'Cardiac Operating Theatre', OTType: 'Cardiac' },
  
  // OT-03 slots (Orthopedic Operating Theatre)
  { OTSlotId: 29, OTId: 3, OTSlotNo: 'SLOT-001', SlotStartTime: '08:00', SlotEndTime: '10:30', Status: 'Active', CreatedAt: '2025-01-01T10:00:00Z', OTNo: 'OT-003', OTName: 'Orthopedic Operating Theatre', OTType: 'Orthopedic' },
  { OTSlotId: 30, OTId: 3, OTSlotNo: 'SLOT-002', SlotStartTime: '10:30', SlotEndTime: '13:00', Status: 'Active', CreatedAt: '2025-01-01T10:00:00Z', OTNo: 'OT-003', OTName: 'Orthopedic Operating Theatre', OTType: 'Orthopedic' },
  { OTSlotId: 31, OTId: 3, OTSlotNo: 'SLOT-003', SlotStartTime: '13:00', SlotEndTime: '15:30', Status: 'Active', CreatedAt: '2025-01-01T10:00:00Z', OTNo: 'OT-003', OTName: 'Orthopedic Operating Theatre', OTType: 'Orthopedic' },
  { OTSlotId: 32, OTId: 3, OTSlotNo: 'SLOT-004', SlotStartTime: '15:30', SlotEndTime: '18:00', Status: 'Active', CreatedAt: '2025-01-01T10:00:00Z', OTNo: 'OT-003', OTName: 'Orthopedic Operating Theatre', OTType: 'Orthopedic' },
  { OTSlotId: 33, OTId: 3, OTSlotNo: 'SLOT-005', SlotStartTime: '18:00', SlotEndTime: '20:00', Status: 'Active', CreatedAt: '2025-01-01T10:00:00Z', OTNo: 'OT-003', OTName: 'Orthopedic Operating Theatre', OTType: 'Orthopedic' },
  
  // OT-04 slots (Neurosurgery Operating Theatre)
  { OTSlotId: 34, OTId: 4, OTSlotNo: 'SLOT-001', SlotStartTime: '08:00', SlotEndTime: '12:00', Status: 'Active', CreatedAt: '2025-01-01T10:00:00Z', OTNo: 'OT-004', OTName: 'Neurosurgery Operating Theatre', OTType: 'Neurosurgery' },
  { OTSlotId: 35, OTId: 4, OTSlotNo: 'SLOT-002', SlotStartTime: '12:00', SlotEndTime: '16:00', Status: 'Active', CreatedAt: '2025-01-01T10:00:00Z', OTNo: 'OT-004', OTName: 'Neurosurgery Operating Theatre', OTType: 'Neurosurgery' },
  { OTSlotId: 36, OTId: 4, OTSlotNo: 'SLOT-003', SlotStartTime: '16:00', SlotEndTime: '20:00', Status: 'Active', CreatedAt: '2025-01-01T10:00:00Z', OTNo: 'OT-004', OTName: 'Neurosurgery Operating Theatre', OTType: 'Neurosurgery' },
  
  // OT-05 slots (General Operating Theatre 2)
  { OTSlotId: 37, OTId: 5, OTSlotNo: 'SLOT-001', SlotStartTime: '08:00', SlotEndTime: '10:00', Status: 'Active', CreatedAt: '2025-01-02T10:00:00Z', OTNo: 'OT-005', OTName: 'General Operating Theatre 2', OTType: 'General' },
  { OTSlotId: 38, OTId: 5, OTSlotNo: 'SLOT-002', SlotStartTime: '10:00', SlotEndTime: '12:00', Status: 'Active', CreatedAt: '2025-01-02T10:00:00Z', OTNo: 'OT-005', OTName: 'General Operating Theatre 2', OTType: 'General' },
  { OTSlotId: 39, OTId: 5, OTSlotNo: 'SLOT-003', SlotStartTime: '12:00', SlotEndTime: '14:00', Status: 'Active', CreatedAt: '2025-01-02T10:00:00Z', OTNo: 'OT-005', OTName: 'General Operating Theatre 2', OTType: 'General' },
  { OTSlotId: 40, OTId: 5, OTSlotNo: 'SLOT-004', SlotStartTime: '14:00', SlotEndTime: '16:00', Status: 'Active', CreatedAt: '2025-01-02T10:00:00Z', OTNo: 'OT-005', OTName: 'General Operating Theatre 2', OTType: 'General' },
  { OTSlotId: 41, OTId: 5, OTSlotNo: 'SLOT-005', SlotStartTime: '16:00', SlotEndTime: '18:00', Status: 'Active', CreatedAt: '2025-01-02T10:00:00Z', OTNo: 'OT-005', OTName: 'General Operating Theatre 2', OTType: 'General' },
  { OTSlotId: 42, OTId: 5, OTSlotNo: 'SLOT-006', SlotStartTime: '18:00', SlotEndTime: '20:00', Status: 'Active', CreatedAt: '2025-01-02T10:00:00Z', OTNo: 'OT-005', OTName: 'General Operating Theatre 2', OTType: 'General' },
  
  // OT-06 slots (Gynecology Operating Theatre)
  { OTSlotId: 43, OTId: 6, OTSlotNo: 'SLOT-001', SlotStartTime: '08:00', SlotEndTime: '10:00', Status: 'Active', CreatedAt: '2025-01-02T10:00:00Z', OTNo: 'OT-006', OTName: 'Gynecology Operating Theatre', OTType: 'Gynecology' },
  { OTSlotId: 44, OTId: 6, OTSlotNo: 'SLOT-002', SlotStartTime: '10:00', SlotEndTime: '12:00', Status: 'Active', CreatedAt: '2025-01-02T10:00:00Z', OTNo: 'OT-006', OTName: 'Gynecology Operating Theatre', OTType: 'Gynecology' },
  { OTSlotId: 45, OTId: 6, OTSlotNo: 'SLOT-003', SlotStartTime: '12:00', SlotEndTime: '14:00', Status: 'Active', CreatedAt: '2025-01-02T10:00:00Z', OTNo: 'OT-006', OTName: 'Gynecology Operating Theatre', OTType: 'Gynecology' },
  { OTSlotId: 46, OTId: 6, OTSlotNo: 'SLOT-004', SlotStartTime: '14:00', SlotEndTime: '16:00', Status: 'Active', CreatedAt: '2025-01-02T10:00:00Z', OTNo: 'OT-006', OTName: 'Gynecology Operating Theatre', OTType: 'Gynecology' },
  { OTSlotId: 47, OTId: 6, OTSlotNo: 'SLOT-005', SlotStartTime: '16:00', SlotEndTime: '18:00', Status: 'Active', CreatedAt: '2025-01-02T10:00:00Z', OTNo: 'OT-006', OTName: 'Gynecology Operating Theatre', OTType: 'Gynecology' },
  
  // OT-07 slots (Urology Operating Theatre)
  { OTSlotId: 48, OTId: 7, OTSlotNo: 'SLOT-001', SlotStartTime: '08:00', SlotEndTime: '10:30', Status: 'Active', CreatedAt: '2025-01-02T10:00:00Z', OTNo: 'OT-007', OTName: 'Urology Operating Theatre', OTType: 'Urology' },
  { OTSlotId: 49, OTId: 7, OTSlotNo: 'SLOT-002', SlotStartTime: '10:30', SlotEndTime: '13:00', Status: 'Active', CreatedAt: '2025-01-02T10:00:00Z', OTNo: 'OT-007', OTName: 'Urology Operating Theatre', OTType: 'Urology' },
  { OTSlotId: 50, OTId: 7, OTSlotNo: 'SLOT-003', SlotStartTime: '13:00', SlotEndTime: '15:30', Status: 'Active', CreatedAt: '2025-01-02T10:00:00Z', OTNo: 'OT-007', OTName: 'Urology Operating Theatre', OTType: 'Urology' },
  { OTSlotId: 51, OTId: 7, OTSlotNo: 'SLOT-004', SlotStartTime: '15:30', SlotEndTime: '18:00', Status: 'Active', CreatedAt: '2025-01-02T10:00:00Z', OTNo: 'OT-007', OTName: 'Urology Operating Theatre', OTType: 'Urology' },
  
  // OT-08 slots (Plastic Surgery Operating Theatre)
  { OTSlotId: 52, OTId: 8, OTSlotNo: 'SLOT-001', SlotStartTime: '08:00', SlotEndTime: '11:00', Status: 'Active', CreatedAt: '2025-01-03T10:00:00Z', OTNo: 'OT-008', OTName: 'Plastic Surgery Operating Theatre', OTType: 'Plastic Surgery' },
  { OTSlotId: 53, OTId: 8, OTSlotNo: 'SLOT-002', SlotStartTime: '11:00', SlotEndTime: '14:00', Status: 'Active', CreatedAt: '2025-01-03T10:00:00Z', OTNo: 'OT-008', OTName: 'Plastic Surgery Operating Theatre', OTType: 'Plastic Surgery' },
  { OTSlotId: 54, OTId: 8, OTSlotNo: 'SLOT-003', SlotStartTime: '14:00', SlotEndTime: '17:00', Status: 'Active', CreatedAt: '2025-01-03T10:00:00Z', OTNo: 'OT-008', OTName: 'Plastic Surgery Operating Theatre', OTType: 'Plastic Surgery' },
  { OTSlotId: 55, OTId: 8, OTSlotNo: 'SLOT-004', SlotStartTime: '17:00', SlotEndTime: '20:00', Status: 'Active', CreatedAt: '2025-01-03T10:00:00Z', OTNo: 'OT-008', OTName: 'Plastic Surgery Operating Theatre', OTType: 'Plastic Surgery' },
  
  // OT-09 slots (Ophthalmology Operating Theatre)
  { OTSlotId: 56, OTId: 9, OTSlotNo: 'SLOT-001', SlotStartTime: '08:00', SlotEndTime: '10:00', Status: 'Active', CreatedAt: '2025-01-03T10:00:00Z', OTNo: 'OT-009', OTName: 'Ophthalmology Operating Theatre', OTType: 'Ophthalmology' },
  { OTSlotId: 57, OTId: 9, OTSlotNo: 'SLOT-002', SlotStartTime: '10:00', SlotEndTime: '12:00', Status: 'Active', CreatedAt: '2025-01-03T10:00:00Z', OTNo: 'OT-009', OTName: 'Ophthalmology Operating Theatre', OTType: 'Ophthalmology' },
  { OTSlotId: 58, OTId: 9, OTSlotNo: 'SLOT-003', SlotStartTime: '12:00', SlotEndTime: '14:00', Status: 'Active', CreatedAt: '2025-01-03T10:00:00Z', OTNo: 'OT-009', OTName: 'Ophthalmology Operating Theatre', OTType: 'Ophthalmology' },
  { OTSlotId: 59, OTId: 9, OTSlotNo: 'SLOT-004', SlotStartTime: '14:00', SlotEndTime: '16:00', Status: 'Active', CreatedAt: '2025-01-03T10:00:00Z', OTNo: 'OT-009', OTName: 'Ophthalmology Operating Theatre', OTType: 'Ophthalmology' },
  { OTSlotId: 60, OTId: 9, OTSlotNo: 'SLOT-005', SlotStartTime: '16:00', SlotEndTime: '18:00', Status: 'Active', CreatedAt: '2025-01-03T10:00:00Z', OTNo: 'OT-009', OTName: 'Ophthalmology Operating Theatre', OTType: 'Ophthalmology' },
  { OTSlotId: 61, OTId: 9, OTSlotNo: 'SLOT-006', SlotStartTime: '18:00', SlotEndTime: '20:00', Status: 'Active', CreatedAt: '2025-01-03T10:00:00Z', OTNo: 'OT-009', OTName: 'Ophthalmology Operating Theatre', OTType: 'Ophthalmology' },
  
  // OT-10 slots (ENT Operating Theatre)
  { OTSlotId: 62, OTId: 10, OTSlotNo: 'SLOT-001', SlotStartTime: '08:00', SlotEndTime: '10:00', Status: 'Active', CreatedAt: '2025-01-03T10:00:00Z', OTNo: 'OT-010', OTName: 'ENT Operating Theatre', OTType: 'ENT' },
  { OTSlotId: 63, OTId: 10, OTSlotNo: 'SLOT-002', SlotStartTime: '10:00', SlotEndTime: '12:00', Status: 'Active', CreatedAt: '2025-01-03T10:00:00Z', OTNo: 'OT-010', OTName: 'ENT Operating Theatre', OTType: 'ENT' },
  { OTSlotId: 64, OTId: 10, OTSlotNo: 'SLOT-003', SlotStartTime: '12:00', SlotEndTime: '14:00', Status: 'Active', CreatedAt: '2025-01-03T10:00:00Z', OTNo: 'OT-010', OTName: 'ENT Operating Theatre', OTType: 'ENT' },
  { OTSlotId: 65, OTId: 10, OTSlotNo: 'SLOT-004', SlotStartTime: '14:00', SlotEndTime: '16:00', Status: 'Active', CreatedAt: '2025-01-03T10:00:00Z', OTNo: 'OT-010', OTName: 'ENT Operating Theatre', OTType: 'ENT' },
  { OTSlotId: 66, OTId: 10, OTSlotNo: 'SLOT-005', SlotStartTime: '16:00', SlotEndTime: '18:00', Status: 'Active', CreatedAt: '2025-01-03T10:00:00Z', OTNo: 'OT-010', OTName: 'ENT Operating Theatre', OTType: 'ENT' },
  { OTSlotId: 67, OTId: 10, OTSlotNo: 'SLOT-006', SlotStartTime: '18:00', SlotEndTime: '20:00', Status: 'Active', CreatedAt: '2025-01-03T10:00:00Z', OTNo: 'OT-010', OTName: 'ENT Operating Theatre', OTType: 'ENT' },
  
  // OT-15 slots (Emergency Operating Theatre) - 24/7 slots
  { OTSlotId: 68, OTId: 15, OTSlotNo: 'SLOT-001', SlotStartTime: '00:00', SlotEndTime: '06:00', Status: 'Active', CreatedAt: '2025-01-05T10:00:00Z', OTNo: 'OT-015', OTName: 'Emergency Operating Theatre', OTType: 'Emergency' },
  { OTSlotId: 69, OTId: 15, OTSlotNo: 'SLOT-002', SlotStartTime: '06:00', SlotEndTime: '12:00', Status: 'Active', CreatedAt: '2025-01-05T10:00:00Z', OTNo: 'OT-015', OTName: 'Emergency Operating Theatre', OTType: 'Emergency' },
  { OTSlotId: 70, OTId: 15, OTSlotNo: 'SLOT-003', SlotStartTime: '12:00', SlotEndTime: '18:00', Status: 'Active', CreatedAt: '2025-01-05T10:00:00Z', OTNo: 'OT-015', OTName: 'Emergency Operating Theatre', OTType: 'Emergency' },
  { OTSlotId: 71, OTId: 15, OTSlotNo: 'SLOT-004', SlotStartTime: '18:00', SlotEndTime: '23:59', Status: 'Active', CreatedAt: '2025-01-05T10:00:00Z', OTNo: 'OT-015', OTName: 'Emergency Operating Theatre', OTType: 'Emergency' },
];

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Map API response to OTSlot type
function mapOTSlotResponseToOTSlot(item: OTSlotResponseItem): OTSlot {
  // Convert OTId number to string format (e.g., 1 -> "OT-01")
  const otIdString = `OT-${item.OTId.toString().padStart(2, '0')}`;
  // Generate otSlotId string from OTSlotId number
  const otSlotIdString = `OT-${item.OTId.toString().padStart(2, '0')}-SLOT${item.OTSlotId.toString().padStart(3, '0')}`;
  
  return {
    id: item.OTSlotId,
    otSlotId: otSlotIdString,
    otId: otIdString,
    otSlotNo: item.OTSlotNo,
    slotStartTime: item.SlotStartTime,
    slotEndTime: item.SlotEndTime,
    status: item.Status?.toLowerCase() === 'active' ? 'Active' : 'Inactive',
  };
}

export interface CreateOTSlotDto {
  otId: string;
  otSlotNo: string;
  slotStartTime: string;
  slotEndTime: string;
  status?: 'Active' | 'Inactive';
}

export interface UpdateOTSlotDto extends Partial<CreateOTSlotDto> {
  id: number;
}

export const otSlotsApi = {
  async getAll(status?: string, otId?: number): Promise<OTSlot[]> {
    let apiData: OTSlot[] = [];
    
    try {
      // Build query parameters
      const params = new URLSearchParams();
      if (status) {
        params.append('status', status);
      }
      if (otId !== undefined) {
        params.append('otId', otId.toString());
      }

      const queryString = params.toString();
      const endpoint = queryString ? `/ot-slots?${queryString}` : '/ot-slots';
      
      const response = await apiRequest<OTSlotAPIResponse>(endpoint);
      
      if (response.success && response.data) {
        // Map API response to our format
        apiData = response.data.map(mapOTSlotResponseToOTSlot);
      }
    } catch (error) {
      console.error('Error fetching OT slots:', error);
      // If stub data is disabled and API fails, throw the error
      if (!ENABLE_STUB_DATA) {
        throw error;
      }
    }
    
    // Append stub data if enabled
    if (ENABLE_STUB_DATA) {
      // Filter out stub data that might conflict with API data (by OTSlotId)
      const apiIds = new Set(apiData.map(slot => slot.id));
      let filteredStubData = stubOTSlots.filter(slot => !apiIds.has(slot.OTSlotId));
      
      // Apply filters to stub data if params are provided
      if (otId !== undefined) {
        filteredStubData = filteredStubData.filter(slot => slot.OTId === otId);
      }
      if (status) {
        filteredStubData = filteredStubData.filter(slot => 
          status.toLowerCase() === 'active' ? slot.Status === 'Active' : slot.Status === 'Inactive'
        );
      }
      
      if (filteredStubData.length > 0) {
        console.log(`Appending ${filteredStubData.length} stub OT slots to ${apiData.length} API records`);
      }
      
      // If API returned no data, use stub data as fallback
      if (apiData.length === 0) {
        console.warn('No OT slots data received from API, using stub data');
        await delay(300);
        return filteredStubData.map(mapOTSlotResponseToOTSlot);
      }
      
      // Combine API data with stub data
      return [...apiData, ...filteredStubData.map(mapOTSlotResponseToOTSlot)];
    }
    
    // Return only API data if stub data is disabled
    return apiData;
  },

  async getByOTId(otId: string): Promise<OTSlot[]> {
    try {
      // Extract numeric ID from string format (e.g., "OT-01" -> 1)
      const numericOtId = parseInt(otId.replace('OT-', ''), 10);
      if (isNaN(numericOtId)) {
        throw new Error(`Invalid OT ID format: ${otId}`);
      }
      
      return this.getAll(undefined, numericOtId);
    } catch (error) {
      console.error('Error fetching OT slots by OT ID:', error);
      throw error;
    }
  },

  async getById(id: number): Promise<OTSlot> {
    try {
      const response = await apiRequest<OTSlotGetByIdResponse>(`/ot-slots/${id}`);
      
      if (!response.success) {
        throw new Error('API request failed');
      }

      if (!response.data) {
        throw new Error(`OTSlot with id ${id} not found`);
      }

      // Map API response to our format
      return mapOTSlotResponseToOTSlot(response.data);
    } catch (error) {
      console.error('Error fetching OT slot by ID:', error);
      throw error;
    }
  },

  async create(data: CreateOTSlotDto): Promise<OTSlot> {
    try {
      // Extract numeric ID from string format (e.g., "OT-01" -> 1)
      const numericOtId = parseInt(data.otId.replace('OT-', ''), 10);
      if (isNaN(numericOtId)) {
        throw new Error(`Invalid OT ID format: ${data.otId}`);
      }

      // Map our DTO to API request format
      const requestBody = {
        OTId: numericOtId,
        SlotStartTime: data.slotStartTime,
        SlotEndTime: data.slotEndTime,
        Status: data.status || 'Active',
      };

      const response = await apiRequest<OTSlotCreateResponse>('/ot-slots', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      if (!response.success) {
        throw new Error(response.message || 'Failed to create OT slot');
      }

      // Map API response to our format
      return mapOTSlotResponseToOTSlot(response.data);
    } catch (error) {
      console.error('Error creating OT slot:', error);
      throw error;
    }
  },

  async update(data: UpdateOTSlotDto): Promise<OTSlot> {
    try {
      // Build request body with only provided fields
      const requestBody: Record<string, unknown> = {};
      
      if (data.otId !== undefined) {
        // Extract numeric ID from string format (e.g., "OT-01" -> 1)
        const numericOtId = parseInt(data.otId.replace('OT-', ''), 10);
        if (isNaN(numericOtId)) {
          throw new Error(`Invalid OT ID format: ${data.otId}`);
        }
        requestBody.OTId = numericOtId;
      }
      if (data.slotStartTime !== undefined) {
        requestBody.SlotStartTime = data.slotStartTime;
      }
      if (data.slotEndTime !== undefined) {
        requestBody.SlotEndTime = data.slotEndTime;
      }
      if (data.status !== undefined) {
        requestBody.Status = data.status;
      }

      const response = await apiRequest<OTSlotCreateResponse>(`/ot-slots/${data.id}`, {
        method: 'PUT',
        body: JSON.stringify(requestBody),
      });

      if (!response.success) {
        throw new Error(response.message || 'Failed to update OT slot');
      }

      // Map API response to our format
      return mapOTSlotResponseToOTSlot(response.data);
    } catch (error) {
      console.error('Error updating OT slot:', error);
      throw error;
    }
  },

  async delete(id: number): Promise<void> {
    try {
      const response = await apiRequest<OTSlotCreateResponse>(`/ot-slots/${id}`, {
        method: 'DELETE',
      });

      if (!response.success) {
        throw new Error(response.message || 'Failed to delete OT slot');
      }

      // Delete endpoint returns the deleted item in data, but we don't need to return it
      // The method signature is Promise<void>
    } catch (error) {
      console.error('Error deleting OT slot:', error);
      throw error;
    }
  },
};

