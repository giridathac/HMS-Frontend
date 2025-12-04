# Architecture Overview

This React application has been refactored to follow a clean architecture pattern with separated concerns:

## Project Structure

```
src/
├── api/              # Backend API services (stub implementations)
│   ├── base.ts       # Base API configuration and utilities
│   ├── patients.ts   # Patient API service
│   ├── tokens.ts     # Token API service
│   ├── dashboard.ts  # Dashboard API service
│   ├── appointments.ts # Appointments API service
│   └── index.ts      # Centralized exports
├── hooks/            # Custom React hooks for business logic
│   ├── usePatients.ts
│   ├── useTokens.ts
│   ├── useDashboard.ts
│   ├── useAppointments.ts
│   └── index.ts
├── types/            # TypeScript type definitions
│   └── index.ts
├── components/       # UI components (separated from logic)
│   ├── Dashboard.tsx
│   ├── Patients.tsx
│   ├── FrontDesk.tsx
│   ├── Appointments.tsx
│   └── ui/           # Reusable UI components
└── App.tsx          # Main app with lazy loading
```

## Architecture Principles

### 1. **Separation of Concerns**
   - **API Layer** (`src/api/`): Handles all backend communication
   - **Business Logic** (`src/hooks/`): Contains custom hooks with business logic
   - **UI Components** (`src/components/`): Pure presentation components

### 2. **Lazy Loading**
   - All route components are lazy-loaded using React's `lazy()` and `Suspense`
   - Reduces initial bundle size and improves performance
   - Implemented in `App.tsx`

### 3. **Stub APIs**
   - Currently using stub/mock implementations
   - Easy to replace with real API calls
   - Each API service has comments showing where to replace with actual API calls

## How to Replace Stub APIs

When you have the real backend API, update the API service files:

1. **Update `src/api/base.ts`**: Set the correct `API_BASE_URL`
2. **Update individual API files**: Replace the stub implementations with actual `apiRequest()` calls

Example from `src/api/patients.ts`:
```typescript
// Current (stub):
async getAll(): Promise<Patient[]> {
  await delay(300);
  return Promise.resolve([...stubPatients]);
}

// Replace with:
async getAll(): Promise<Patient[]> {
  return apiRequest<Patient[]>('/patients');
}
```

## Component Pattern

Each component follows this pattern:

```typescript
// Main component (with logic)
export function ComponentName() {
  const { data, loading, error, actions } = useCustomHook();
  
  // Handle loading/error states
  if (loading) return <Loading />;
  if (error) return <Error />;
  
  // Pass data to view component
  return <ComponentNameView data={data} actions={actions} />;
}

// View component (pure UI)
function ComponentNameView({ data, actions }) {
  // Pure presentation logic
  return <div>...</div>;
}
```

## Benefits

1. **Maintainability**: Clear separation makes code easier to understand and modify
2. **Testability**: Each layer can be tested independently
3. **Reusability**: Hooks and API services can be reused across components
4. **Performance**: Lazy loading reduces initial load time
5. **Scalability**: Easy to add new features following the same pattern

