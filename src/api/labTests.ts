// Lab Tests API service
import { apiRequest } from './base';
import { LabTest } from '../types';

// Stub data
const stubLabTests: LabTest[] = [
  { id: 1, displayTestId: 'LAB-2025-001', testName: 'Complete Blood Count', testCategory: 'BloodTest', description: 'Complete blood count test', charges: 500, status: 'active' },
  { id: 2, displayTestId: 'LAB-2025-002', testName: 'ECG', testCategory: 'Imaging', description: 'Electrocardiogram test', charges: 800, status: 'active' },
  { id: 3, displayTestId: 'LAB-2025-003', testName: 'Blood Sugar (Fasting)', testCategory: 'BloodTest', description: 'Fasting blood sugar test', charges: 300, status: 'active' },
  { id: 4, displayTestId: 'LAB-2025-004', testName: 'X-Ray Chest', testCategory: 'Radiology', description: 'Chest X-ray examination', charges: 600, status: 'active' },
  { id: 5, displayTestId: 'LAB-2025-005', testName: 'Urine Analysis', testCategory: 'UrineTest', description: 'Complete urine analysis', charges: 400, status: 'active' },
  { id: 6, displayTestId: 'LAB-2025-006', testName: 'Ultrasound Abdomen', testCategory: 'Ultrasound', description: 'Abdominal ultrasound scan', charges: 1200, status: 'active' },
];

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Generate display test ID in format LAB-YYYY-XXX
function generateDisplayTestId(): string {
  const year = new Date().getFullYear();
  const count = stubLabTests.length + 1;
  return `LAB-${year}-${count.toString().padStart(3, '0')}`;
}

export interface CreateLabTestDto {
  testName: string;
  testCategory: string;
  description?: string;
  charges: number;
  status?: 'active' | 'inactive';
}

export interface UpdateLabTestDto extends Partial<CreateLabTestDto> {
  id: number;
}

export const labTestsApi = {
  async getAll(): Promise<LabTest[]> {
    // Replace with: return apiRequest<LabTest[]>('/labtests');
    await delay(300);
    return Promise.resolve([...stubLabTests]);
  },

  async getById(id: number): Promise<LabTest> {
    // Replace with: return apiRequest<LabTest>(`/labtests/${id}`);
    await delay(200);
    const labTest = stubLabTests.find(t => t.id === id);
    if (!labTest) {
      throw new Error(`LabTest with id ${id} not found`);
    }
    return Promise.resolve(labTest);
  },

  async getByCategory(category: string): Promise<LabTest[]> {
    // Replace with: return apiRequest<LabTest[]>(`/labtests?category=${category}`);
    await delay(200);
    return Promise.resolve(stubLabTests.filter(t => t.testCategory === category));
  },

  async create(data: CreateLabTestDto): Promise<LabTest> {
    // Replace with: return apiRequest<LabTest>('/labtests', { method: 'POST', body: JSON.stringify(data) });
    await delay(400);
    const newLabTest: LabTest = {
      id: stubLabTests.length + 1,
      displayTestId: generateDisplayTestId(),
      status: data.status || 'active',
      ...data,
    };
    stubLabTests.push(newLabTest);
    return Promise.resolve(newLabTest);
  },

  async update(data: UpdateLabTestDto): Promise<LabTest> {
    // Replace with: return apiRequest<LabTest>(`/labtests/${data.id}`, { method: 'PUT', body: JSON.stringify(data) });
    await delay(400);
    const index = stubLabTests.findIndex(t => t.id === data.id);
    if (index === -1) {
      throw new Error(`LabTest with id ${data.id} not found`);
    }
    stubLabTests[index] = { ...stubLabTests[index], ...data };
    return Promise.resolve(stubLabTests[index]);
  },

  async delete(id: number): Promise<void> {
    // Replace with: return apiRequest<void>(`/labtests/${id}`, { method: 'DELETE' });
    await delay(300);
    const index = stubLabTests.findIndex(t => t.id === id);
    if (index === -1) {
      throw new Error(`LabTest with id ${id} not found`);
    }
    stubLabTests.splice(index, 1);
    return Promise.resolve();
  },
};

