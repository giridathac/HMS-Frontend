# Hospital Management System (HMS) - Current State Documentation

**Last Updated:** January 2025  
**Version:** 0.1.0  
**Project:** Frontend Application

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [Technology Stack](#technology-stack)
4. [Features & Modules](#features--modules)
5. [API Structure](#api-structure)
6. [Data Models](#data-models)
7. [Assumptions](#assumptions)
8. [Configuration](#configuration)
9. [Current State](#current-state)
10. [Known Issues & Limitations](#known-issues--limitations)
11. [Development Guidelines](#development-guidelines)

---

## System Overview

The Hospital Management System (HMS) is a comprehensive frontend application built with React and TypeScript for managing hospital operations. The system provides modules for patient management, appointments, admissions, operations, ICU, emergency services, billing, and administrative functions.

### Key Characteristics

- **Single Page Application (SPA)** with hash-based routing
- **Lazy-loaded components** for performance optimization
- **Resizable sidebar** with standalone mode support
- **Clean architecture** with separation of concerns (API layer, hooks, components)
- **Stub data support** for development and testing
- **Responsive design** using Tailwind CSS and Radix UI components

---

## Architecture

### Project Structure

```
src/
├── api/              # Backend API services
│   ├── base.ts       # Base API configuration and utilities
│   ├── patients.ts   # Patient API service
│   ├── appointments.ts
│   ├── admissions.ts
│   ├── doctors.ts
│   ├── staff.ts
│   ├── roles.ts
│   ├── departments.ts
│   ├── bills.ts
│   ├── tokens.ts
│   ├── dashboard.ts
│   ├── roomBeds.ts
│   ├── labTests.ts
│   ├── icuBeds.ts
│   ├── otRooms.ts
│   ├── otSlots.ts
│   ├── patientOTAllocations.ts
│   ├── emergencyBeds.ts
│   ├── emergencyBedSlots.ts
│   ├── emergencyAdmissions.ts
│   └── index.ts      # Centralized exports
├── hooks/            # Custom React hooks for business logic
│   ├── usePatients.ts
│   ├── useAppointments.ts
│   ├── useAdmissions.ts
│   ├── useDoctors.ts
│   ├── useStaff.ts
│   ├── useRoles.ts
│   ├── useDepartments.ts
│   ├── useDashboard.ts
│   ├── useTokens.ts
│   ├── useRoomBeds.ts
│   ├── useLabTests.ts
│   ├── useICUBeds.ts
│   ├── useOTRooms.ts
│   ├── useOTSlots.ts
│   ├── usePatientOTAllocations.ts
│   ├── useEmergencyBeds.ts
│   ├── useEmergencyBedSlots.ts
│   ├── useEmergencyAdmissions.ts
│   └── index.ts
├── types/            # TypeScript type definitions
│   ├── index.ts      # Core types (Patient, Token, Appointment, etc.)
│   ├── staff.ts
│   ├── roles.ts
│   └── departments.ts
├── components/       # UI components
│   ├── Dashboard.tsx
│   ├── PatientRegistration.tsx
│   ├── FrontDesk.tsx
│   ├── DoctorConsultation.tsx
│   ├── Admissions.tsx
│   ├── ManageIPDAdmission.tsx
│   ├── ICUManagement.tsx
│   ├── ManageICUCase.tsx
│   ├── ICUNurseVisitVitals.tsx
│   ├── Laboratory.tsx
│   ├── Emergency.tsx
│   ├── EmergencyAdmissionManagement.tsx
│   ├── ManageEmergencyAdmission.tsx
│   ├── ManageEmergencyAdmissionVitals.tsx
│   ├── PatientOTAllocationManagement.tsx
│   ├── OTRoomsManagement.tsx
│   ├── EmergencyBedManagement.tsx
│   ├── ICUBedsManagement.tsx
│   ├── Doctors.tsx
│   ├── Staff.tsx
│   ├── Roles.tsx
│   ├── Departments.tsx
│   ├── RoomBeds.tsx
│   ├── LabTests.tsx
│   ├── BillManagement.tsx
│   ├── PatientAppointmentManagement.tsx
│   ├── Reports.tsx
│   ├── ui/           # Reusable UI components (Radix UI based)
│   └── layouts/      # Layout components
├── utils/            # Utility functions
│   └── timeUtils.ts
├── App.tsx           # Main app component with routing
└── main.tsx          # Application entry point
```

### Architecture Principles

1. **Separation of Concerns**
   - **API Layer** (`src/api/`): Handles all backend communication
   - **Business Logic** (`src/hooks/`): Contains custom hooks with business logic
   - **UI Components** (`src/components/`): Pure presentation components

2. **Lazy Loading**
   - All route components are lazy-loaded using React's `lazy()` and `Suspense`
   - Reduces initial bundle size and improves performance

3. **Stub Data Support**
   - Stub/mock implementations available for development
   - Controlled via environment variable `VITE_ENABLE_STUB_DATA`
   - Easy to replace with real API calls

---

## Technology Stack

### Core Technologies

- **React 18.3.1** - UI library
- **TypeScript** - Type safety
- **Vite 6.3.5** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework

### UI Component Libraries

- **Radix UI** - Headless UI components (30+ components)
  - Dialog, Dropdown, Select, Tabs, Accordion, etc.
- **Lucide React** - Icon library
- **Recharts** - Chart library for data visualization
- **React Hook Form** - Form management
- **Sonner** - Toast notifications

### Additional Libraries

- **React Resizable Panels** - Resizable sidebar
- **React Day Picker** - Date picker
- **Class Variance Authority** - Component variants
- **CMDK** - Command palette
- **Vaul** - Drawer component

---

## Features & Modules

### 1. Dashboard
- Real-time statistics (OPD patients, active tokens, IPD admissions, OT scheduled, ICU occupancy)
- Charts and visualizations
- Department management
- Doctor queue status

### 2. Patient Management
- **Patient Registration**: Create, update, delete patient records
- Patient search and filtering
- Patient history tracking

### 3. Front Desk
- Token management for OPD consultations
- Queue management
- Patient check-in/check-out

### 4. Doctor Consultation
- Consultation management
- Prescription handling
- Diagnosis recording
- Follow-up scheduling

### 5. Appointments
- **Patient Appointment Management**: Schedule, reschedule, cancel appointments
- Appointment status tracking (Waiting, Consulting, Completed)
- Token number assignment

### 6. Admissions

#### IPD (Inpatient Department)
- **Admissions Management**: View and manage IPD admissions
- **Manage IPD Admission**: Create, update, discharge IPD cases
- Room and bed allocation
- Visit tracking
- Vitals recording

#### ICU (Intensive Care Unit)
- **ICU Management**: View and manage ICU admissions
- **Manage ICU Case**: Create, update, discharge ICU cases
- **ICU Bed Management**: Manage ICU beds and availability
- **ICU Nurse Visit Vitals**: Record nurse visit vitals

#### Emergency
- **Emergency Admission Management**: View and manage emergency admissions
- **Manage Emergency Admission**: Create and update emergency cases
- **Manage Emergency Admission Vitals**: Record emergency vitals
- **Emergency Bed Management**: Manage emergency beds and slots

### 7. Operation Theater (OT)
- **OT Management**: View and manage OT allocations
- **OT Rooms Management**: Manage OT rooms, types, and schedules
- **Patient OT Allocation Management**: Schedule surgeries, allocate OT slots
- Operation status tracking (Scheduled, InProgress, Completed, Cancelled, Postponed)
- Pre/post operation notes

### 8. Laboratory
- **Laboratory Tests Management**: View and manage lab test orders
- **Laboratory Management**: Manage lab tests catalog (test names, categories, charges)

### 9. Billing
- **Bill Management**: Create, view, and manage bills
- Payment tracking (Cash, Card, Insurance, Scheme)
- Bill status (Paid, NotPaid)

### 10. Administrative

#### Staff Management
- **Staff**: Create, update, manage staff members
- Role-based access
- Doctor-specific fields (qualification, type, charges, capabilities)

#### Roles Management
- **Roles**: Create, update, manage user roles
- Role-based permissions (planned)

#### Departments Management
- **Departments**: Create, update, manage departments
- Department categories (Clinical, Surgical, Diagnostic, Support, Administrative)

#### Room & Bed Management
- **IPD Rooms & Beds Management**: Manage room categories, types, bed numbers, charges

### 11. Reports
- Generate various reports
- Analytics and insights

---

## API Structure

### Base Configuration

- **Base URL**: Configurable via `VITE_API_BASE_URL` environment variable
- **Default**: `http://localhost:4000/api`
- **Error Handling**: Custom `ApiError` class with status codes
- **Response Handling**: Supports multiple response formats:
  - `{ success: true, data: [...] }`
  - `{ data: [...] }`
  - Direct array/object

### API Endpoints

#### Patients
- `GET /patients` - Get all patients
- `GET /patients/:patientId` - Get patient by ID
- `POST /patients` - Create patient
- `PUT /patients/:patientId` - Update patient
- `DELETE /patients/:id` - Delete patient

#### Appointments
- `GET /patient-appointments` - Get all appointments
- `GET /patient-appointments/:id` - Get appointment by ID
- `POST /patient-appointments` - Create appointment
- `PUT /patient-appointments/:id` - Update appointment

#### Admissions
- `GET /admissions` - Get all IPD admissions
- `GET /admissions/:id` - Get admission by ID
- `POST /admissions` - Create admission
- `PUT /admissions/:id` - Update admission

#### Emergency Admissions
- `GET /emergency-admissions` - Get all emergency admissions
- `GET /emergency-admissions/:id` - Get emergency admission by ID
- `POST /emergency-admissions` - Create emergency admission
- `PUT /emergency-admissions/:id` - Update emergency admission

#### OT Allocations
- `GET /patient-ot-allocations` - Get all OT allocations
- `GET /patient-ot-allocations/:id` - Get OT allocation by ID
- `POST /patient-ot-allocations` - Create OT allocation
- `PUT /patient-ot-allocations/:id` - Update OT allocation

#### Other Endpoints
- `/doctors`, `/staff`, `/roles`, `/departments`
- `/room-beds`, `/lab-tests`, `/icu-beds`
- `/ot-rooms`, `/ot-slots`, `/emergency-beds`, `/emergency-bed-slots`
- `/bills`, `/tokens`, `/dashboard`

### API Request/Response Format

**Request Format:**
- Headers: `Content-Type: application/json`
- Body: JSON with PascalCase field names (backend convention)

**Response Format:**
- Success: `{ success: true, data: {...} }` or direct object/array
- Error: `{ message: string, status: number, data?: any }`

---

## Data Models

### Core Entities

#### Patient
```typescript
interface Patient {
  id: number;
  PatientId: string;          // Format: PAT-YYYY-XXXX
  PatientNo?: string;
  PatientName: string;
  LastName?: string;
  AdhaarId?: string;
  PANCard?: string;
  PhoneNo: string;
  Gender: string;
  Age: number;
  Address?: string;
  ChiefComplaint?: string;
  Description?: string;
  Status?: string;
  RegisteredBy?: string;
  RegisteredDate?: string;
  PatientType?: string;        // OPD, IPD, Emergency, Follow-up
}
```

#### Appointment
```typescript
interface PatientAppointment {
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
```

#### OT Allocation
```typescript
interface PatientOTAllocation {
  id: number;
  patientOTAllocationId: number;
  patientId: string;          // UUID
  otId: number;
  leadSurgeonId: number;
  assistantDoctorId?: number;
  anaesthetistId?: number;
  nurseId?: number;
  otAllocationDate: string;
  duration?: string;
  otStartTime?: string;
  otEndTime?: string;
  otActualStartTime?: string;
  otActualEndTime?: string;
  operationDescription?: string;
  operationStatus: 'Scheduled' | 'InProgress' | 'Completed' | 'Cancelled' | 'Postponed';
  preOperationNotes?: string;
  postOperationNotes?: string;
  otDocuments?: string;
  billId?: number;
  status: 'Active' | 'InActive';
  otSlotIds?: number[];
}
```

#### Emergency Admission
```typescript
interface EmergencyAdmission {
  id: number;
  emergencyAdmissionId: number;
  doctorId: number;
  patientId: string;          // UUID
  emergencyBedSlotId?: number;
  emergencyAdmissionDate: string;
  emergencyStatus: 'Admitted' | 'IPD' | 'OT' | 'ICU' | 'Discharged';
  diagnosis?: string;
  treatmentDetails?: string;  // Note: API uses typo "TreatementDetails"
  patientCondition: 'Critical' | 'Stable';
  transferToIPDOTICU: boolean;
  transferTo?: 'IPD Room Admission' | 'ICU' | 'OT';
  transferDetails?: string;
  status: 'Active' | 'Inactive';
}
```

#### Staff
```typescript
interface Staff {
  UserId?: number;
  RoleId: string;             // UUID
  UserName: string;
  Password?: string;          // Not returned in GET
  PhoneNo?: string;
  EmailId?: string;
  DoctorDepartmentId?: string; // UUID, only for doctors
  DoctorQualification?: string;
  DoctorType?: 'INHOUSE' | 'VISITING';
  DoctorOPDCharge?: number;
  DoctorSurgeryCharge?: number;
  OPDConsultation?: 'Yes' | 'No';
  IPDVisit?: 'Yes' | 'No';
  OTHandle?: 'Yes' | 'No';
  ICUVisits?: 'Yes' | 'No';
  Status?: 'Active' | 'InActive';
  CreatedBy?: number;
}
```

#### Role
```typescript
interface Role {
  id: string;                 // UUID (mapped from RoleId)
  name: string;               // Free text field
  description?: string | null;
  permissions?: string[];     // Not in backend response
  createdAt?: string;
  createdBy?: number | null;
}
```

#### Department
```typescript
interface Department {
  id: number;
  name: string;
  category: 'Clinical' | 'Surgical' | 'Diagnostic' | 'Support' | 'Administrative';
  description?: string;
  specialisationDetails?: string;
  noOfDoctors?: number;
  status: 'active' | 'inactive';
}
```

---

## Assumptions

### 1. Backend API Assumptions

#### API Response Format
- **Assumption**: Backend may return data in multiple formats:
  - `{ success: true, data: [...] }`
  - `{ data: [...] }`
  - Direct array/object
- **Handling**: Frontend handles all three formats with fallback logic

#### Field Naming Convention
- **Assumption**: Backend uses **PascalCase** for field names (e.g., `PatientId`, `PatientName`, `PhoneNo`)
- **Frontend**: Uses **camelCase** internally, converts to/from PascalCase for API calls
- **Mapping**: All API services include mapping functions to convert between formats

#### Patient ID Format
- **Assumption**: Patient IDs follow format `PAT-YYYY-XXXX` (e.g., `PAT-2025-0001`)
- **Handling**: Frontend generates IDs in this format for stub data

#### UUID Usage
- **Assumption**: Backend uses UUIDs for:
  - `PatientId` (string UUID)
  - `RoleId` (string UUID)
  - `DoctorDepartmentId` (string UUID)
- **Handling**: Frontend treats these as strings, not numbers

#### User ID
- **Assumption**: `RegisteredBy` and `CreatedBy` fields expect integer user IDs
- **Current State**: Defaults to `1` if not provided (TODO: Replace with actual user ID from auth context)
- **Location**: `src/api/patients.ts:310`

#### API Typo Handling
- **Assumption**: Backend API has typo in field name: `TreatementDetails` (should be `TreatmentDetails`)
- **Handling**: Frontend accepts both variations
- **Location**: `src/api/emergencyAdmissions.ts:17`, `src/types/index.ts:273`

### 2. Authentication & Authorization

#### Current State
- **Assumption**: No authentication system implemented yet
- **User Context**: Hardcoded as "Admin User" / "Administrator"
- **User ID**: Defaults to `1` for `CreatedBy`/`RegisteredBy` fields
- **TODO**: Implement authentication context and user management

### 3. Stub Data

#### Stub Data Configuration
- **Assumption**: Stub data is **disabled by default**
- **Enabling**: Set `VITE_ENABLE_STUB_DATA=true` in `.env` file
- **Behavior**: When enabled, stub data is appended to API data (if API returns data)
- **Fallback**: If API fails and stub data is enabled, stub data is used as fallback

#### Stub Data Format
- **Assumption**: Stub data matches backend API response format (PascalCase)
- **Location**: Each API service file contains stub data arrays

### 4. Routing & Navigation

#### Hash-Based Routing
- **Assumption**: Application uses hash-based routing (`#dashboard`, `#frontdesk`, etc.)
- **Query Parameters**: Supports query parameters in hash (e.g., `#ot?otId=123`)
- **Standalone Mode**: Supports `?standalone=true` URL parameter to hide sidebar

#### View Management
- **Assumption**: Views are managed via URL hash and internal state
- **Sync**: URL hash syncs with current view state
- **Navigation**: Clicking nav items updates both state and URL hash

### 5. Time & Date Handling

#### Timezone Assumptions
- **Assumption**: Simple time strings (HH:MM) are assumed to be in IST or local time
- **Handling**: `src/utils/timeUtils.ts` handles time conversions
- **Note**: Complex timezone handling may be needed for production

### 6. Form Data Handling

#### Field Mapping
- **Assumption**: Forms may submit data in camelCase or PascalCase
- **Handling**: API services accept both formats and convert to PascalCase for backend

#### Empty Field Handling
- **Assumption**: Empty strings, null, and undefined should not be sent to backend
- **Handling**: `addIfValid()` helper function filters out empty values
- **Location**: `src/api/patients.ts:233`

#### Required Fields
- **Assumption**: Patient creation requires: `PatientName`, `PhoneNo`, `Gender`, `Age`
- **Validation**: Frontend validates before API call

### 7. Error Handling

#### API Errors
- **Assumption**: Backend returns errors in format: `{ message: string, status: number, data?: any }`
- **Handling**: Custom `ApiError` class wraps errors with status codes
- **Logging**: All API errors are logged to console in development

#### Network Errors
- **Assumption**: Network failures should be caught and displayed to user
- **Handling**: Try-catch blocks in API services, error state in hooks

### 8. UI/UX Assumptions

#### Dialog Design
- **Assumption**: All dialogs follow standard design scheme
- **Documentation**: `DIALOG_DESIGN_SCHEME.md`
- **Components**: Use `StandardDialog` component or follow standard structure

#### Scrollbar Styling
- **Assumption**: Custom scrollbar styling (8px width, black track, grey thumb)
- **Class**: `dialog-content-scrollable`

#### Responsive Design
- **Assumption**: Application is primarily desktop-focused
- **Mobile**: Some components may not be fully responsive

### 9. Data Caching

#### Current State
- **Assumption**: No caching strategy implemented yet
- **Documentation**: `CACHING_STRATEGY.md` outlines recommended approach
- **Recommendation**: Use React Query for API response caching

### 10. Component State Management

#### State Management Pattern
- **Assumption**: Each component manages its own state via React hooks
- **Shared State**: Custom hooks (`usePatients`, `useDoctors`, etc.) manage shared data
- **No Global State**: No Redux or Context API for global state (yet)

---

## Configuration

### Environment Variables

#### Required
- None (uses defaults)

#### Optional
- `VITE_API_BASE_URL` - Backend API base URL (default: `http://localhost:4000/api`)
- `VITE_ENABLE_STUB_DATA` - Enable stub data (default: `false`, must be `'true'` to enable)

#### Example `.env` file:
```env
VITE_API_BASE_URL=http://localhost:4000/api
VITE_ENABLE_STUB_DATA=false
```

### Build Configuration

- **Build Tool**: Vite 6.3.5
- **Build Output**: `build/` directory
- **Target**: `esnext`
- **Dev Server**: Port 3000, auto-open browser

### Vite Configuration

- **Plugins**: `@vitejs/plugin-react-swc` (React with SWC)
- **Path Aliases**: `@` resolves to `./src`
- **Extensions**: `.js`, `.jsx`, `.ts`, `.tsx`, `.json`

---

## Current State

### Completed Features

✅ **Core Infrastructure**
- React + TypeScript setup
- Vite build configuration
- Clean architecture (API layer, hooks, components)
- Lazy loading for all components
- Hash-based routing
- Resizable sidebar with standalone mode

✅ **Patient Management**
- Patient registration (create, update, delete)
- Patient search and filtering
- Patient list view

✅ **Appointment Management**
- Create, update, view appointments
- Token number assignment
- Appointment status tracking

✅ **Admissions**
- IPD admission management
- ICU admission management
- Emergency admission management
- Room and bed allocation
- Vitals recording

✅ **Operation Theater**
- OT room management
- OT slot management
- Patient OT allocation
- Operation status tracking

✅ **Laboratory**
- Lab test management
- Lab test catalog management

✅ **Billing**
- Bill creation and management
- Payment tracking

✅ **Administrative**
- Staff management
- Role management
- Department management
- Room and bed management

✅ **Dashboard**
- Real-time statistics
- Charts and visualizations
- Department management

### In Progress / Partial

🟡 **Authentication**
- No authentication system implemented
- User context hardcoded

🟡 **Caching**
- No caching strategy implemented
- Documentation available for future implementation

🟡 **Error Handling**
- Basic error handling implemented
- May need enhancement for production

### Not Implemented

❌ **Real-time Updates**
- No WebSocket or polling for real-time data
- Manual refresh required

❌ **Offline Support**
- No service worker or offline capabilities

❌ **Advanced Search/Filtering**
- Basic search implemented
- Advanced filtering may be needed

❌ **Export/Print**
- No export or print functionality

❌ **Notifications**
- No push notifications or alerts

---

## Known Issues & Limitations

### 1. Authentication
- **Issue**: No authentication system
- **Impact**: Cannot track actual user for `CreatedBy`/`RegisteredBy` fields
- **Workaround**: Defaults to user ID `1`
- **Priority**: High

### 2. API Response Format Variations
- **Issue**: Backend may return data in different formats
- **Impact**: Requires multiple fallback checks in API services
- **Status**: Handled with fallback logic

### 3. Field Name Inconsistencies
- **Issue**: Backend uses PascalCase, frontend uses camelCase
- **Impact**: Requires mapping functions in all API services
- **Status**: Handled with mapping functions

### 4. API Typo
- **Issue**: Backend API has typo: `TreatementDetails` instead of `TreatmentDetails`
- **Impact**: Frontend must handle both variations
- **Status**: Handled with fallback logic

### 5. Timezone Handling
- **Issue**: Simple time strings assumed to be in IST/local time
- **Impact**: May cause issues with timezone conversions
- **Priority**: Medium

### 6. Stub Data
- **Issue**: Stub data may conflict with API data
- **Impact**: Duplicate entries possible
- **Status**: Handled with filtering logic

### 7. Error Messages
- **Issue**: Error messages may not be user-friendly
- **Impact**: Poor user experience on errors
- **Priority**: Medium

### 8. Loading States
- **Issue**: Some components may not show loading states
- **Impact**: Poor user experience during data fetching
- **Priority**: Low

### 9. Form Validation
- **Issue**: Basic validation implemented, may need enhancement
- **Impact**: Invalid data may be submitted
- **Priority**: Medium

### 10. Mobile Responsiveness
- **Issue**: Application primarily designed for desktop
- **Impact**: Poor experience on mobile devices
- **Priority**: Low (if desktop-only is acceptable)

---

## Development Guidelines

### Code Style

- **TypeScript**: Strict mode enabled
- **Naming**: camelCase for variables/functions, PascalCase for components/types
- **File Naming**: PascalCase for components, camelCase for utilities/hooks

### Component Structure

```typescript
// Main component (with logic)
export function ComponentName() {
  const { data, loading, error, actions } = useCustomHook();
  
  if (loading) return <Loading />;
  if (error) return <Error />;
  
  return <ComponentNameView data={data} actions={actions} />;
}

// View component (pure UI)
function ComponentNameView({ data, actions }) {
  return <div>...</div>;
}
```

### API Service Pattern

```typescript
export const resourceApi = {
  async getAll(): Promise<Resource[]> {
    try {
      const response = await apiRequest<any>('/resources');
      // Handle response format variations
      const data = response?.data || response;
      return Array.isArray(data) ? data : [];
    } catch (error) {
      if (!ENABLE_STUB_DATA) throw error;
      // Return stub data as fallback
      return stubResources;
    }
  },
  
  async create(data: CreateResourceDto): Promise<Resource> {
    // Convert camelCase to PascalCase
    const backendData = mapToBackendFormat(data);
    const response = await apiRequest<any>('/resources', {
      method: 'POST',
      body: JSON.stringify(backendData),
    });
    return mapFromBackendFormat(response?.data || response);
  },
};
```

### Dialog Design

Follow the standard dialog design scheme (see `DIALOG_DESIGN_SCHEME.md`):

```tsx
<DialogContent className="p-0 gap-0 large-dialog bg-white">
  <DialogHeader className="px-6 pt-4 pb-3 flex-shrink-0 bg-white">
    <DialogTitle className="text-gray-700">Title</DialogTitle>
  </DialogHeader>
  <div className="flex-1 overflow-y-auto px-6 pb-1 dialog-content-scrollable min-h-0 bg-white">
    {/* Content */}
  </div>
  <div className="flex justify-end gap-2 px-6 py-2 border-t bg-white flex-shrink-0">
    {/* Footer */}
  </div>
</DialogContent>
```

### Adding New Features

1. **Create API Service** (`src/api/resource.ts`)
   - Define types/interfaces
   - Implement CRUD operations
   - Handle response format variations
   - Add stub data if needed

2. **Create Custom Hook** (`src/hooks/useResource.ts`)
   - Use API service
   - Manage state (loading, error, data)
   - Provide actions (create, update, delete)

3. **Create Component** (`src/components/Resource.tsx`)
   - Use custom hook
   - Implement UI
   - Handle loading/error states

4. **Add to App.tsx**
   - Lazy load component
   - Add to View type
   - Add to navItems
   - Add route handler

### Testing

- **Current State**: No test suite implemented
- **Recommendation**: Add unit tests for hooks and API services
- **Recommendation**: Add integration tests for components

---

## Future Enhancements

### High Priority
1. **Authentication System**
   - User login/logout
   - JWT token management
   - User context provider
   - Role-based access control

2. **Real-time Updates**
   - WebSocket integration
   - Live queue updates
   - Real-time notifications

3. **Enhanced Error Handling**
   - User-friendly error messages
   - Error logging service
   - Retry mechanisms

### Medium Priority
1. **Caching Strategy**
   - Implement React Query
   - Cache static reference data
   - Smart cache invalidation

2. **Form Validation**
   - Enhanced client-side validation
   - Server-side validation feedback
   - Field-level error messages

3. **Mobile Responsiveness**
   - Responsive layouts
   - Touch-friendly interactions
   - Mobile navigation

### Low Priority
1. **Export/Print**
   - PDF generation
   - Excel export
   - Print-friendly views

2. **Advanced Search**
   - Full-text search
   - Advanced filters
   - Saved searches

3. **Analytics**
   - Usage analytics
   - Performance monitoring
   - Error tracking

---

## Conclusion

This document provides a comprehensive overview of the Hospital Management System frontend application, including its architecture, features, assumptions, and current state. It serves as a reference for developers working on the project and helps maintain consistency across the codebase.

For questions or updates, please refer to the individual component files and API service implementations.

---

**Document Version**: 1.0  
**Last Updated**: January 2025  
**Maintained By**: Development Team
