// ICU Beds API service
import { apiRequest, ApiError, ENABLE_STUB_DATA } from './base';
import { ICUBed } from '../types';

// Stub data for ICU Bed Management
const stubICUBeds: ICUBed[] = [
  // Medical ICU Beds - Floor 1
  { id: 1, icuBedId: 1, icuId: 1, icuBedNo: 'B01', icuType: 'Medical', icuRoomNameNo: 'R101', icuDescription: 'Medical ICU bed with ventilator support and continuous monitoring', isVentilatorAttached: true, status: 'active', createdAt: '2025-01-01T10:00:00Z', createdDate: '2025-01-01' },
  { id: 2, icuBedId: 2, icuId: 2, icuBedNo: 'B02', icuType: 'Medical', icuRoomNameNo: 'R101', icuDescription: 'Medical ICU bed with standard monitoring equipment', isVentilatorAttached: false, status: 'active', createdAt: '2025-01-01T10:00:00Z', createdDate: '2025-01-01' },
  { id: 3, icuBedId: 3, icuId: 3, icuBedNo: 'B03', icuType: 'Medical', icuRoomNameNo: 'R102', icuDescription: 'Medical ICU bed with advanced life support systems', isVentilatorAttached: true, status: 'active', createdAt: '2025-01-01T10:00:00Z', createdDate: '2025-01-01' },
  { id: 4, icuBedId: 4, icuId: 4, icuBedNo: 'B04', icuType: 'Medical', icuRoomNameNo: 'R102', icuDescription: 'Medical ICU bed with isolation facility', isVentilatorAttached: false, status: 'active', createdAt: '2025-01-01T10:00:00Z', createdDate: '2025-01-01' },
  { id: 5, icuBedId: 5, icuId: 5, icuBedNo: 'B05', icuType: 'Medical', icuRoomNameNo: 'R103', icuDescription: 'Medical ICU bed with hemodialysis capability', isVentilatorAttached: true, status: 'active', createdAt: '2025-01-01T10:00:00Z', createdDate: '2025-01-01' },
  { id: 6, icuBedId: 6, icuId: 6, icuBedNo: 'B06', icuType: 'Medical', icuRoomNameNo: 'R103', icuDescription: 'Medical ICU bed with cardiac monitoring', isVentilatorAttached: false, status: 'active', createdAt: '2025-01-01T10:00:00Z', createdDate: '2025-01-01' },
  { id: 7, icuBedId: 7, icuId: 7, icuBedNo: 'B07', icuType: 'Medical', icuRoomNameNo: 'R104', icuDescription: 'Medical ICU bed with respiratory support', isVentilatorAttached: true, status: 'active', createdAt: '2025-01-01T10:00:00Z', createdDate: '2025-01-01' },
  { id: 8, icuBedId: 8, icuId: 8, icuBedNo: 'B08', icuType: 'Medical', icuRoomNameNo: 'R104', icuDescription: 'Medical ICU bed with standard care facilities', isVentilatorAttached: false, status: 'active', createdAt: '2025-01-01T10:00:00Z', createdDate: '2025-01-01' },
  
  // Surgical ICU Beds - Floor 2
  { id: 9, icuBedId: 9, icuId: 9, icuBedNo: 'B09', icuType: 'Surgical', icuRoomNameNo: 'R201', icuDescription: 'Surgical ICU bed with post-operative monitoring', isVentilatorAttached: true, status: 'active', createdAt: '2025-01-01T10:00:00Z', createdDate: '2025-01-01' },
  { id: 10, icuBedId: 10, icuId: 10, icuBedNo: 'B10', icuType: 'Surgical', icuRoomNameNo: 'R201', icuDescription: 'Surgical ICU bed with advanced surgical support', isVentilatorAttached: false, status: 'active', createdAt: '2025-01-01T10:00:00Z', createdDate: '2025-01-01' },
  { id: 11, icuBedId: 11, icuId: 11, icuBedNo: 'B11', icuType: 'Surgical', icuRoomNameNo: 'R202', icuDescription: 'Surgical ICU bed with trauma care facilities', isVentilatorAttached: true, status: 'active', createdAt: '2025-01-01T10:00:00Z', createdDate: '2025-01-01' },
  { id: 12, icuBedId: 12, icuId: 12, icuBedNo: 'B12', icuType: 'Surgical', icuRoomNameNo: 'R202', icuDescription: 'Surgical ICU bed with intensive monitoring', isVentilatorAttached: false, status: 'active', createdAt: '2025-01-01T10:00:00Z', createdDate: '2025-01-01' },
  { id: 13, icuBedId: 13, icuId: 13, icuBedNo: 'B13', icuType: 'Surgical', icuRoomNameNo: 'R203', icuDescription: 'Surgical ICU bed with ventilator and dialysis', isVentilatorAttached: true, status: 'active', createdAt: '2025-01-01T10:00:00Z', createdDate: '2025-01-01' },
  { id: 14, icuBedId: 14, icuId: 14, icuBedNo: 'B14', icuType: 'Surgical', icuRoomNameNo: 'R203', icuDescription: 'Surgical ICU bed with standard surgical care', isVentilatorAttached: false, status: 'active', createdAt: '2025-01-01T10:00:00Z', createdDate: '2025-01-01' },
  { id: 15, icuBedId: 15, icuId: 15, icuBedNo: 'B15', icuType: 'Surgical', icuRoomNameNo: 'R204', icuDescription: 'Surgical ICU bed with emergency surgical support', isVentilatorAttached: true, status: 'active', createdAt: '2025-01-01T10:00:00Z', createdDate: '2025-01-01' },
  { id: 16, icuBedId: 16, icuId: 16, icuBedNo: 'B16', icuType: 'Surgical', icuRoomNameNo: 'R204', icuDescription: 'Surgical ICU bed with post-surgical monitoring', isVentilatorAttached: false, status: 'active', createdAt: '2025-01-01T10:00:00Z', createdDate: '2025-01-01' },
  
  // Pediatric ICU Beds - Floor 3
  { id: 17, icuBedId: 17, icuId: 17, icuBedNo: 'B17', icuType: 'Pediatric', icuRoomNameNo: 'R301', icuDescription: 'Pediatric ICU bed with specialized equipment for children', isVentilatorAttached: true, status: 'active', createdAt: '2025-01-01T10:00:00Z', createdDate: '2025-01-01' },
  { id: 18, icuBedId: 18, icuId: 18, icuBedNo: 'B18', icuType: 'Pediatric', icuRoomNameNo: 'R301', icuDescription: 'Pediatric ICU bed with neonatal support systems', isVentilatorAttached: false, status: 'active', createdAt: '2025-01-01T10:00:00Z', createdDate: '2025-01-01' },
  { id: 19, icuBedId: 19, icuId: 19, icuBedNo: 'B19', icuType: 'Pediatric', icuRoomNameNo: 'R302', icuDescription: 'Pediatric ICU bed with pediatric ventilator support', isVentilatorAttached: true, status: 'active', createdAt: '2025-01-01T10:00:00Z', createdDate: '2025-01-01' },
  { id: 20, icuBedId: 20, icuId: 20, icuBedNo: 'B20', icuType: 'Pediatric', icuRoomNameNo: 'R302', icuDescription: 'Pediatric ICU bed with child-friendly monitoring', isVentilatorAttached: false, status: 'active', createdAt: '2025-01-01T10:00:00Z', createdDate: '2025-01-01' },
  { id: 21, icuBedId: 21, icuId: 21, icuBedNo: 'B21', icuType: 'Pediatric', icuRoomNameNo: 'R303', icuDescription: 'Pediatric ICU bed with specialized pediatric care', isVentilatorAttached: true, status: 'active', createdAt: '2025-01-01T10:00:00Z', createdDate: '2025-01-01' },
  { id: 22, icuBedId: 22, icuId: 22, icuBedNo: 'B22', icuType: 'Pediatric', icuRoomNameNo: 'R303', icuDescription: 'Pediatric ICU bed with isolation for infectious cases', isVentilatorAttached: false, status: 'active', createdAt: '2025-01-01T10:00:00Z', createdDate: '2025-01-01' },
  
  // Cardiac ICU Beds - Floor 4
  { id: 23, icuBedId: 23, icuId: 23, icuBedNo: 'B23', icuType: 'Cardiac', icuRoomNameNo: 'R401', icuDescription: 'Cardiac ICU bed with advanced cardiac monitoring and support', isVentilatorAttached: true, status: 'active', createdAt: '2025-01-01T10:00:00Z', createdDate: '2025-01-01' },
  { id: 24, icuBedId: 24, icuId: 24, icuBedNo: 'B24', icuType: 'Cardiac', icuRoomNameNo: 'R401', icuDescription: 'Cardiac ICU bed with ECG and cardiac catheterization support', isVentilatorAttached: false, status: 'active', createdAt: '2025-01-01T10:00:00Z', createdDate: '2025-01-01' },
  { id: 25, icuBedId: 25, icuId: 25, icuBedNo: 'B25', icuType: 'Cardiac', icuRoomNameNo: 'R402', icuDescription: 'Cardiac ICU bed with post-cardiac surgery monitoring', isVentilatorAttached: true, status: 'active', createdAt: '2025-01-01T10:00:00Z', createdDate: '2025-01-01' },
  { id: 26, icuBedId: 26, icuId: 26, icuBedNo: 'B26', icuType: 'Cardiac', icuRoomNameNo: 'R402', icuDescription: 'Cardiac ICU bed with pacemaker and defibrillator support', isVentilatorAttached: false, status: 'active', createdAt: '2025-01-01T10:00:00Z', createdDate: '2025-01-01' },
  { id: 27, icuBedId: 27, icuId: 27, icuBedNo: 'B27', icuType: 'Cardiac', icuRoomNameNo: 'R403', icuDescription: 'Cardiac ICU bed with cardiac rehabilitation facilities', isVentilatorAttached: true, status: 'active', createdAt: '2025-01-01T10:00:00Z', createdDate: '2025-01-01' },
  { id: 28, icuBedId: 28, icuId: 28, icuBedNo: 'B28', icuType: 'Cardiac', icuRoomNameNo: 'R403', icuDescription: 'Cardiac ICU bed with intensive cardiac care', isVentilatorAttached: false, status: 'active', createdAt: '2025-01-01T10:00:00Z', createdDate: '2025-01-01' },
  { id: 29, icuBedId: 29, icuId: 29, icuBedNo: 'B29', icuType: 'Cardiac', icuRoomNameNo: 'R404', icuDescription: 'Cardiac ICU bed with advanced hemodynamic monitoring', isVentilatorAttached: true, status: 'active', createdAt: '2025-01-01T10:00:00Z', createdDate: '2025-01-01' },
  { id: 30, icuBedId: 30, icuId: 30, icuBedNo: 'B30', icuType: 'Cardiac', icuRoomNameNo: 'R404', icuDescription: 'Cardiac ICU bed with standard cardiac monitoring', isVentilatorAttached: false, status: 'active', createdAt: '2025-01-01T10:00:00Z', createdDate: '2025-01-01' },
  
  // Neurological ICU Beds - Floor 5
  { id: 31, icuBedId: 31, icuId: 31, icuBedNo: 'B31', icuType: 'Neurological', icuRoomNameNo: 'R501', icuDescription: 'Neurological ICU bed with advanced brain monitoring and EEG support', isVentilatorAttached: true, status: 'active', createdAt: '2025-01-01T10:00:00Z', createdDate: '2025-01-01' },
  { id: 32, icuBedId: 32, icuId: 32, icuBedNo: 'B32', icuType: 'Neurological', icuRoomNameNo: 'R501', icuDescription: 'Neurological ICU bed with intracranial pressure monitoring', isVentilatorAttached: false, status: 'active', createdAt: '2025-01-01T10:00:00Z', createdDate: '2025-01-01' },
  { id: 33, icuBedId: 33, icuId: 33, icuBedNo: 'B33', icuType: 'Neurological', icuRoomNameNo: 'R502', icuDescription: 'Neurological ICU bed with post-neurosurgery care', isVentilatorAttached: true, status: 'active', createdAt: '2025-01-01T10:00:00Z', createdDate: '2025-01-01' },
  { id: 34, icuBedId: 34, icuId: 34, icuBedNo: 'B34', icuType: 'Neurological', icuRoomNameNo: 'R502', icuDescription: 'Neurological ICU bed with stroke care facilities', isVentilatorAttached: false, status: 'active', createdAt: '2025-01-01T10:00:00Z', createdDate: '2025-01-01' },
  { id: 35, icuBedId: 35, icuId: 35, icuBedNo: 'B35', icuType: 'Neurological', icuRoomNameNo: 'R503', icuDescription: 'Neurological ICU bed with seizure monitoring and management', isVentilatorAttached: true, status: 'active', createdAt: '2025-01-01T10:00:00Z', createdDate: '2025-01-01' },
  { id: 36, icuBedId: 36, icuId: 36, icuBedNo: 'B36', icuType: 'Neurological', icuRoomNameNo: 'R503', icuDescription: 'Neurological ICU bed with standard neurological care', isVentilatorAttached: false, status: 'active', createdAt: '2025-01-01T10:00:00Z', createdDate: '2025-01-01' },
  
  // Trauma ICU Beds - Floor 6
  { id: 37, icuBedId: 37, icuId: 37, icuBedNo: 'B37', icuType: 'Trauma', icuRoomNameNo: 'R601', icuDescription: 'Trauma ICU bed with emergency trauma care and rapid response support', isVentilatorAttached: true, status: 'active', createdAt: '2025-01-01T10:00:00Z', createdDate: '2025-01-01' },
  { id: 38, icuBedId: 38, icuId: 38, icuBedNo: 'B38', icuType: 'Trauma', icuRoomNameNo: 'R601', icuDescription: 'Trauma ICU bed with multi-system trauma support', isVentilatorAttached: false, status: 'active', createdAt: '2025-01-01T10:00:00Z', createdDate: '2025-01-01' },
  { id: 39, icuBedId: 39, icuId: 39, icuBedNo: 'B39', icuType: 'Trauma', icuRoomNameNo: 'R602', icuDescription: 'Trauma ICU bed with critical injury management', isVentilatorAttached: true, status: 'active', createdAt: '2025-01-01T10:00:00Z', createdDate: '2025-01-01' },
  { id: 40, icuBedId: 40, icuId: 40, icuBedNo: 'B40', icuType: 'Trauma', icuRoomNameNo: 'R602', icuDescription: 'Trauma ICU bed with emergency surgical support', isVentilatorAttached: false, status: 'active', createdAt: '2025-01-01T10:00:00Z', createdDate: '2025-01-01' },
  { id: 41, icuBedId: 41, icuId: 41, icuBedNo: 'B41', icuType: 'Trauma', icuRoomNameNo: 'R603', icuDescription: 'Trauma ICU bed with intensive trauma monitoring', isVentilatorAttached: true, status: 'active', createdAt: '2025-01-01T10:00:00Z', createdDate: '2025-01-01' },
  { id: 42, icuBedId: 42, icuId: 42, icuBedNo: 'B42', icuType: 'Trauma', icuRoomNameNo: 'R603', icuDescription: 'Trauma ICU bed with standard trauma care facilities', isVentilatorAttached: false, status: 'active', createdAt: '2025-01-01T10:00:00Z', createdDate: '2025-01-01' },
  { id: 43, icuBedId: 43, icuId: 43, icuBedNo: 'B43', icuType: 'Trauma', icuRoomNameNo: 'R604', icuDescription: 'Trauma ICU bed with advanced life support for critical cases', isVentilatorAttached: true, status: 'active', createdAt: '2025-01-01T10:00:00Z', createdDate: '2025-01-01' },
  { id: 44, icuBedId: 44, icuId: 44, icuBedNo: 'B44', icuType: 'Trauma', icuRoomNameNo: 'R604', icuDescription: 'Trauma ICU bed with post-trauma rehabilitation support', isVentilatorAttached: false, status: 'active', createdAt: '2025-01-01T10:00:00Z', createdDate: '2025-01-01' },
  
  // Additional Medical ICU Beds - Floor 1 (Extended)
  { id: 45, icuBedId: 45, icuId: 45, icuBedNo: 'B45', icuType: 'Medical', icuRoomNameNo: 'R105', icuDescription: 'Medical ICU bed with isolation for infectious diseases', isVentilatorAttached: true, status: 'active', createdAt: '2025-01-01T10:00:00Z', createdDate: '2025-01-01' },
  { id: 46, icuBedId: 46, icuId: 46, icuBedNo: 'B46', icuType: 'Medical', icuRoomNameNo: 'R105', icuDescription: 'Medical ICU bed with standard medical care', isVentilatorAttached: false, status: 'active', createdAt: '2025-01-01T10:00:00Z', createdDate: '2025-01-01' },
  { id: 47, icuBedId: 47, icuId: 47, icuBedNo: 'B47', icuType: 'Medical', icuRoomNameNo: 'R106', icuDescription: 'Medical ICU bed with respiratory and cardiac support', isVentilatorAttached: true, status: 'active', createdAt: '2025-01-01T10:00:00Z', createdDate: '2025-01-01' },
  { id: 48, icuBedId: 48, icuId: 48, icuBedNo: 'B48', icuType: 'Medical', icuRoomNameNo: 'R106', icuDescription: 'Medical ICU bed with continuous monitoring systems', isVentilatorAttached: false, status: 'active', createdAt: '2025-01-01T10:00:00Z', createdDate: '2025-01-01' },
  
  // Inactive/Maintenance Beds
  { id: 49, icuBedId: 49, icuId: 49, icuBedNo: 'B49', icuType: 'Medical', icuRoomNameNo: 'R107', icuDescription: 'Medical ICU bed under maintenance - temporarily unavailable', isVentilatorAttached: true, status: 'inactive', createdAt: '2025-01-01T10:00:00Z', createdDate: '2025-01-01' },
  { id: 50, icuBedId: 50, icuId: 50, icuBedNo: 'B50', icuType: 'Surgical', icuRoomNameNo: 'R205', icuDescription: 'Surgical ICU bed under maintenance - equipment upgrade in progress', isVentilatorAttached: false, status: 'inactive', createdAt: '2025-01-01T10:00:00Z', createdDate: '2025-01-01' },
];

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to normalize status to 'Active' or 'Inactive' for backend
function normalizeStatusForBackend(status: any): 'Active' | 'Inactive' {
  if (!status) return 'Active';
  
  const statusStr = String(status).trim();
  const lowerStatus = statusStr.toLowerCase();
  
  // Map various status values to 'Active' or 'Inactive'
  if (lowerStatus === 'active') {
    return 'Active';
  }
  if (lowerStatus === 'inactive' || lowerStatus === 'in active') {
    return 'Inactive';
  }
  
  // If it's already 'Active' or 'Inactive' (case-insensitive), return it properly capitalized
  if (statusStr === 'Active' || statusStr === 'active') return 'Active';
  if (statusStr === 'InActive' || statusStr === 'Inactive' || statusStr === 'inactive') return 'Inactive';
  
  // Default to 'Active' if unknown status
  return 'Active';
}

export interface CreateICUBedDto {
  icuBedNo: string;
  icuType: string;
  icuRoomNameNo: string;
  icuDescription?: string;
  isVentilatorAttached: boolean;
  status?: 'active' | 'inactive';
}

export interface UpdateICUBedDto extends Partial<CreateICUBedDto> {
  icuId: number;
}

export const icuBedsApi = {
  async getAll(): Promise<ICUBed[]> {
    let apiData: ICUBed[] = [];
    
    try {
      const response = await apiRequest<any>('/icu');
      // Handle different response structures: { data: [...] } or direct array
      const icuBedsData = response?.data || response || [];
     
      if (Array.isArray(icuBedsData) && icuBedsData.length > 0) {
        console.log('ICU beds fetched from API:', icuBedsData);
        // Map and normalize the data to ensure all fields are present
        apiData = icuBedsData.map((icuBed: any, index: number) => {
          // Prioritize ICUBedId from backend, fallback to id or generate
          const icuBedId = Number(icuBed.icuBedId || icuBed.ICUBedId || icuBed.id || icuBed.Id || (1000000 + index));
          return {
            id: icuBed.id || icuBed.Id || icuBedId || (1000000 + index),
            icuBedId: icuBedId,
            icuId: Number(icuBed.icuId || icuBed.ICUId || icuBed.ICU_ID || 0),
            icuBedNo: icuBed.icuBedNo || icuBed.ICUBedNo || icuBed.ICUBedNo || '',
            icuType: icuBed.icuType || icuBed.ICUType || '',
            icuRoomNameNo: icuBed.icuRoomNameNo || icuBed.ICURoomNameNo || icuBed.ICURoomNameNo || '',
            icuDescription: icuBed.icuDescription || icuBed.ICUDescription || undefined,
            isVentilatorAttached: Boolean(icuBed.isVentilatorAttached !== undefined ? icuBed.isVentilatorAttached : (icuBed.IsVentilatorAttached !== undefined ? icuBed.IsVentilatorAttached : false)),
            status: (icuBed.status || icuBed.Status || 'active').toLowerCase() as 'active' | 'inactive',
            createdAt: icuBed.createdAt || icuBed.CreatedAt || new Date().toISOString(),
            createdDate: icuBed.createdDate || icuBed.CreatedDate || icuBed.createdAt || icuBed.CreatedAt || undefined,
          };
        }) as ICUBed[];
      }
    } catch (error) {
      console.error('Error fetching ICU beds:', error);
      // If stub data is disabled and API fails, throw the error
      if (!ENABLE_STUB_DATA) {
        throw error;
      }
    }
    
    // Append stub data if enabled
    if (ENABLE_STUB_DATA) {
      // Filter out stub data that might conflict with API data (by ID)
      const apiIds = new Set(apiData.map(bed => bed.id));
      const uniqueStubData = stubICUBeds.filter(bed => !apiIds.has(bed.id));
      
      if (uniqueStubData.length > 0) {
        console.log(`Appending ${uniqueStubData.length} stub ICU beds to ${apiData.length} API records`);
      }
      
      // If API returned no data, use stub data as fallback
      if (apiData.length === 0) {
        console.warn('No ICU beds data received from API, using stub data');
        await delay(300);
        return [...stubICUBeds];
      }
      
      // Combine API data with stub data
      return [...apiData, ...uniqueStubData];
    }
    
    // Return only API data if stub data is disabled
    return apiData;
  },

  async getById(icuBedId: number): Promise<ICUBed> {
    try {
      // Validate ID before making API call
      if (!icuBedId || icuBedId <= 0) {
        throw new Error(`Invalid ICU bed ID: ${icuBedId}. Cannot fetch ICU bed data.`);
      }
      
      const response = await apiRequest<any>(`/icu/${icuBedId}`);
      console.log('Get ICU bed by ID response:', response);
      
      // Handle different response structures: { data: {...} } or direct object
      const icuBedData = response?.data || response;
      
      if (!icuBedData) {
        throw new Error(`ICUBed with id ${icuBedId} not found`);
      }
      
      // Normalize the response to match ICUBed interface
      const normalizedICUBed: ICUBed = {
        id: icuBedData.id || icuBedData.Id || icuBedId,
        icuBedId: Number(icuBedData.icuBedId || icuBedData.ICUBedId || icuBedData.id || icuBedData.Id || icuBedId),
        icuId: Number(icuBedData.icuId || icuBedData.ICUId || icuBedData.ICU_ID || 0),
        icuBedNo: icuBedData.icuBedNo || icuBedData.ICUBedNo || icuBedData.ICUBedNo || '',
        icuType: icuBedData.icuType || icuBedData.ICUType || '',
        icuRoomNameNo: icuBedData.icuRoomNameNo || icuBedData.ICURoomNameNo || icuBedData.ICURoomNameNo || '',
        icuDescription: icuBedData.icuDescription || icuBedData.ICUDescription || undefined,
        isVentilatorAttached: Boolean(icuBedData.isVentilatorAttached !== undefined ? icuBedData.isVentilatorAttached : (icuBedData.IsVentilatorAttached !== undefined ? icuBedData.IsVentilatorAttached : false)),
        status: (icuBedData.status || icuBedData.Status || 'active').toLowerCase() as 'active' | 'inactive',
        createdAt: icuBedData.createdAt || icuBedData.CreatedAt || new Date().toISOString(),
        createdDate: icuBedData.createdDate || icuBedData.CreatedDate || icuBedData.createdAt || icuBedData.CreatedAt || undefined,
      };
      
      return normalizedICUBed;
    } catch (error: any) {
      console.error(`Error fetching ICU bed with id ${icuBedId}:`, error);
      
      // Provide more detailed error message
      if (error instanceof ApiError) {
        const errorData = error.data as any;
        const errorMessage = errorData?.message || error.message || `Failed to fetch ICU bed with id ${icuBedId}`;
        throw new Error(errorMessage);
      }
      
      throw error;
    }
  },

  async getByType(type: string): Promise<ICUBed[]> {
    try {
      const response = await apiRequest<any>(`/icu?type=${encodeURIComponent(type)}`);
      const icuBedsData = response?.data || response || [];
      
      if (Array.isArray(icuBedsData)) {
        return icuBedsData.map((icuBed: any, index: number) => {
          const icuBedId = Number(icuBed.icuBedId || icuBed.ICUBedId || icuBed.id || icuBed.Id || (1000000 + index));
          return {
            id: icuBed.id || icuBed.Id || icuBedId || (1000000 + index),
            icuBedId: icuBedId,
            icuId: Number(icuBed.icuId || icuBed.ICUId || icuBed.ICU_ID || 0),
            icuBedNo: icuBed.icuBedNo || icuBed.ICUBedNo || '',
            icuType: icuBed.icuType || icuBed.ICUType || '',
            icuRoomNameNo: icuBed.icuRoomNameNo || icuBed.ICURoomNameNo || '',
            icuDescription: icuBed.icuDescription || icuBed.ICUDescription || undefined,
            isVentilatorAttached: Boolean(icuBed.isVentilatorAttached !== undefined ? icuBed.isVentilatorAttached : (icuBed.IsVentilatorAttached !== undefined ? icuBed.IsVentilatorAttached : false)),
            status: (icuBed.status || icuBed.Status || 'active').toLowerCase() as 'active' | 'inactive',
            createdAt: icuBed.createdAt || icuBed.CreatedAt || new Date().toISOString(),
            createdDate: icuBed.createdDate || icuBed.CreatedDate || icuBed.createdAt || icuBed.CreatedAt || undefined,
          };
        }) as ICUBed[];
      }
      
      return [];
    } catch (error) {
      console.error(`Error fetching ICU beds by type ${type}:`, error);
      return [];
    }
  },

  async create(data: CreateICUBedDto): Promise<ICUBed> {
    try {
      // Validate required fields
      if (!data.icuBedNo || !data.icuType || !data.icuRoomNameNo) {
        throw new Error('ICUBedNo, ICUType, and ICURoomNameNo are required');
      }

      // Convert camelCase to PascalCase for backend API
      // Always include IsVentilatorAttached as it's required by the backend (must be "Yes" or "No")
      const isVentilatorAttached = data.isVentilatorAttached !== undefined ? Boolean(data.isVentilatorAttached) : false;
      const backendData: any = {
        ICUBedNo: data.icuBedNo.trim(),
        ICUType: data.icuType.trim(),
        ICURoomNameNo: data.icuRoomNameNo.trim(),
        IsVentilatorAttached: isVentilatorAttached ? 'Yes' : 'No',
      };
      
      console.log('IsVentilatorAttached being sent to API (CREATE):', backendData.IsVentilatorAttached, 'from:', data.isVentilatorAttached);
      
      // Add optional fields if provided
      if (data.icuDescription !== undefined && data.icuDescription !== null && data.icuDescription.trim() !== '') {
        backendData.ICUDescription = data.icuDescription.trim();
      }
      if (data.status !== undefined && data.status !== null) {
        backendData.Status = normalizeStatusForBackend(data.status);
        console.log('Status being sent to API:', backendData.Status, 'from:', data.status);
      } else {
        // Always include status with default value if not provided
        backendData.Status = 'Active';
        console.log('Status not provided, using default: Active');
      }
      
      console.log('IsVentilatorAttached being sent to API:', backendData.IsVentilatorAttached, 'from:', data.isVentilatorAttached);

      console.log('Creating ICU bed with data:', JSON.stringify(backendData, null, 2));

      // Call the actual API endpoint
      const response = await apiRequest<any>('/icu', {
        method: 'POST',
        body: JSON.stringify(backendData),
      });

      console.log('Create ICU bed API response:', response);

      // Handle different response structures: { data: {...} } or direct object
      const icuBedData = response?.data || response;

      if (!icuBedData) {
        throw new Error('No ICU bed data received from API');
      }

      // Normalize the response to match ICUBed interface
      const normalizedICUBed: ICUBed = {
        id: icuBedData.id || icuBedData.Id || 0,
        icuBedId: Number(icuBedData.icuBedId || icuBedData.ICUBedId || icuBedData.id || icuBedData.Id || 0),
        icuId: Number(icuBedData.icuId || icuBedData.ICUId || icuBedData.ICU_ID || 0),
        icuBedNo: icuBedData.icuBedNo || icuBedData.ICUBedNo || data.icuBedNo,
        icuType: icuBedData.icuType || icuBedData.ICUType || data.icuType,
        icuRoomNameNo: icuBedData.icuRoomNameNo || icuBedData.ICURoomNameNo || data.icuRoomNameNo,
        icuDescription: icuBedData.icuDescription || icuBedData.ICUDescription || data.icuDescription,
        isVentilatorAttached: Boolean(icuBedData.isVentilatorAttached !== undefined ? icuBedData.isVentilatorAttached : (icuBedData.IsVentilatorAttached !== undefined ? icuBedData.IsVentilatorAttached : data.isVentilatorAttached)),
        status: (icuBedData.status || icuBedData.Status || data.status || 'active').toLowerCase() as 'active' | 'inactive',
        createdAt: icuBedData.createdAt || icuBedData.CreatedAt || new Date().toISOString(),
        createdDate: icuBedData.createdDate || icuBedData.CreatedDate || icuBedData.createdAt || icuBedData.CreatedAt || undefined,
      };

      return normalizedICUBed;
    } catch (error: any) {
      console.error('Error creating ICU bed:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.status,
        data: error.data,
        stack: error.stack
      });
      
      // Re-throw API errors with detailed message
      if (error.name === 'ApiError' || error.status) {
        const errorData = error.data as any;
        const errorMessage = errorData?.message || errorData?.error || error.message || 'Failed to create ICU bed';
        const errorDetails = errorData?.errors || errorData?.details;
        
        let fullErrorMessage = errorMessage;
        if (errorDetails) {
          if (Array.isArray(errorDetails)) {
            fullErrorMessage += ': ' + errorDetails.join(', ');
          } else if (typeof errorDetails === 'object') {
            fullErrorMessage += ': ' + JSON.stringify(errorDetails);
          } else {
            fullErrorMessage += ': ' + errorDetails;
          }
        }
        
        throw new Error(fullErrorMessage);
      }
      
      // Re-throw validation errors
      if (error instanceof Error) {
        throw error;
      }
      
      // Fallback error
      throw new Error('Failed to create ICU bed. Please check the console for details.');
    }
  },

  async update(data: UpdateICUBedDto): Promise<ICUBed> {
    try {
      // Validate required fields - use icuId for update
      if (!data.icuId || data.icuId <= 0) {
        console.error('Invalid ICU ID in update request:', data.icuId, 'Full update data:', data);
        throw new Error('Valid ICU ID is required for update');
      }
      
      console.log('Updating ICU bed with ICUId:', data.icuId);

      // Convert frontend camelCase to backend PascalCase
      const backendData: any = {};
      
      // Always include IsVentilatorAttached FIRST as it's required by the backend (must be "Yes" or "No")
      // Explicitly convert boolean to "Yes" or "No" string - always include this field
      const isVentilatorAttached = data.isVentilatorAttached !== undefined ? Boolean(data.isVentilatorAttached) : false;
      backendData.IsVentilatorAttached = isVentilatorAttached ? 'Yes' : 'No';
      console.log('IsVentilatorAttached being sent to API (UPDATE):', backendData.IsVentilatorAttached, 'from:', data.isVentilatorAttached, 'converted boolean:', isVentilatorAttached);
      
      if (data.icuBedNo !== undefined) {
        backendData.ICUBedNo = data.icuBedNo.trim();
      }
      if (data.icuType !== undefined) {
        backendData.ICUType = data.icuType.trim();
      }
      if (data.icuRoomNameNo !== undefined) {
        backendData.ICURoomNameNo = data.icuRoomNameNo.trim();
      }
      if (data.icuDescription !== undefined) {
        if (data.icuDescription === null || data.icuDescription.trim() === '') {
          backendData.ICUDescription = null;
        } else {
          backendData.ICUDescription = data.icuDescription.trim();
        }
      }
      
      if (data.status !== undefined && data.status !== null) {
        backendData.Status = normalizeStatusForBackend(data.status);
        console.log('Status being sent to API:', backendData.Status, 'from:', data.status);
      } else {
        console.log('Status not provided in update data:', data.status);
      }

      // Ensure IsVentilatorAttached is always present in the request
      if (!backendData.hasOwnProperty('IsVentilatorAttached')) {
        console.warn('IsVentilatorAttached missing from backendData, adding default "No"');
        backendData.IsVentilatorAttached = 'No';
      }
      
      console.log('Updating ICU bed with data:', JSON.stringify(backendData, null, 2));
      console.log('IsVentilatorAttached in final payload:', backendData.IsVentilatorAttached);

      // Call the actual API endpoint - use icuId in the URL
      const response = await apiRequest<any>(`/icu/${data.icuId}`, {
        method: 'PUT',
        body: JSON.stringify(backendData),
      });

      console.log('Update ICU bed API response:', response);

      // Handle different response structures: { data: {...} } or direct object
      const icuBedData = response?.data || response;

      if (!icuBedData) {
        throw new Error('No ICU bed data received from API');
      }

      // Normalize the response to match ICUBed interface
      const normalizedICUBed: ICUBed = {
        id: icuBedData.id || icuBedData.Id || 0,
        icuBedId: Number(icuBedData.icuBedId || icuBedData.ICUBedId || icuBedData.id || icuBedData.Id || 0),
        icuId: Number(icuBedData.icuId || icuBedData.ICUId || icuBedData.ICU_ID || 0),
        icuBedNo: icuBedData.icuBedNo || icuBedData.ICUBedNo || data.icuBedNo || '',
        icuType: icuBedData.icuType || icuBedData.ICUType || data.icuType || '',
        icuRoomNameNo: icuBedData.icuRoomNameNo || icuBedData.ICURoomNameNo || data.icuRoomNameNo || '',
        icuDescription: icuBedData.icuDescription || icuBedData.ICUDescription || data.icuDescription,
        isVentilatorAttached: Boolean(icuBedData.isVentilatorAttached !== undefined ? icuBedData.isVentilatorAttached : (icuBedData.IsVentilatorAttached !== undefined ? icuBedData.IsVentilatorAttached : (data.isVentilatorAttached !== undefined ? data.isVentilatorAttached : false))),
        status: (icuBedData.status || icuBedData.Status || data.status || 'active').toLowerCase() as 'active' | 'inactive',
        createdAt: icuBedData.createdAt || icuBedData.CreatedAt || new Date().toISOString(),
        createdDate: icuBedData.createdDate || icuBedData.CreatedDate || icuBedData.createdAt || icuBedData.CreatedAt || undefined,
      };

      return normalizedICUBed;
    } catch (error: any) {
      console.error('Error updating ICU bed:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.status,
        data: error.data,
        stack: error.stack
      });
      
      // Re-throw API errors with detailed message
      if (error instanceof ApiError) {
        const errorData = error.data as any;
        const errorMessage = errorData?.message || errorData?.error || error.message || 'Failed to update ICU bed';
        const errorDetails = errorData?.errors || errorData?.details;
        
        let fullErrorMessage = errorMessage;
        if (errorDetails) {
          if (Array.isArray(errorDetails)) {
            fullErrorMessage += ': ' + errorDetails.join(', ');
          } else if (typeof errorDetails === 'object') {
            fullErrorMessage += ': ' + JSON.stringify(errorDetails);
          } else {
            fullErrorMessage += ': ' + errorDetails;
          }
        }
        
        throw new Error(fullErrorMessage);
      }
      
      // Re-throw validation errors
      if (error instanceof Error) {
        throw error;
      }
      
      // Fallback error
      throw new Error('Failed to update ICU bed. Please check the console for details.');
    }
  },

  async delete(icuBedId: number): Promise<void> {
    try {
      // Validate ID before making API call
      if (!icuBedId || icuBedId <= 0) {
        throw new Error(`Invalid ICU bed ID: ${icuBedId}. Cannot delete ICU bed.`);
      }
      
      console.log(`Deleting ICU bed with ICUBedId: ${icuBedId}`);
      
      // Call the actual API endpoint
      const response = await apiRequest<any>(`/icu/${icuBedId}`, { 
        method: 'DELETE',
      });
      
      console.log('Delete ICU bed API response:', response);
    } catch (error: any) {
      console.error(`Error deleting ICU bed with id ${icuBedId}:`, error);
      console.error('Error details:', {
        message: error.message,
        status: error.status,
        data: error.data,
        stack: error.stack
      });
      
      // Re-throw API errors with detailed message
      if (error instanceof ApiError) {
        const errorData = error.data as any;
        const errorMessage = errorData?.message || errorData?.error || error.message || `Failed to delete ICU bed with id ${icuBedId}`;
        const errorDetails = errorData?.errors || errorData?.details;
        
        let fullErrorMessage = errorMessage;
        if (errorDetails) {
          if (Array.isArray(errorDetails)) {
            fullErrorMessage += ': ' + errorDetails.join(', ');
          } else if (typeof errorDetails === 'object') {
            fullErrorMessage += ': ' + JSON.stringify(errorDetails);
          } else {
            fullErrorMessage += ': ' + errorDetails;
          }
        }
        
        throw new Error(fullErrorMessage);
      }
      
      throw error;
    }
  },
};

