# Frontend Caching Strategy

This document outlines what can be cached in the frontend and how to implement it.

## 🎯 High-Priority Cache Candidates

### 1. **Static Reference Data** (Rarely Changes)
These should be cached for the entire session or longer:

- ✅ **Doctor List** - Changes infrequently
- ✅ **Department List** - Rarely changes
- ✅ **Medical Specialties** - Static data
- ✅ **Blood Types** - Never changes
- ✅ **Room Types/Categories** - Rarely changes
- ✅ **Test Categories** (Lab) - Static data
- ✅ **User Roles/Permissions** - Changes only on login

**Cache Duration:** Session or 24 hours
**Storage:** localStorage or in-memory with long TTL

### 2. **Frequently Accessed Data** (Changes Periodically)
Cache with shorter TTL and smart invalidation:

- ✅ **Dashboard Stats** - Refresh every 30-60 seconds
- ✅ **Patient List** - Cache with invalidation on create/update/delete
- ✅ **Token Queue** - Real-time updates needed, cache for 10-30 seconds
- ✅ **Appointments by Date** - Cache per date, invalidate on changes
- ✅ **Doctor Queue Status** - Refresh every 15-30 seconds

**Cache Duration:** 30 seconds to 5 minutes
**Storage:** In-memory with React Query or SWR

### 3. **User Session Data**
- ✅ **Current User Info** - Cache until logout
- ✅ **User Preferences** - Theme, language, default filters
- ✅ **Recent Searches** - Last 5-10 searches
- ✅ **Selected Filters** - Remember last filter state

**Cache Duration:** Session
**Storage:** sessionStorage or localStorage

### 4. **Computed/Derived Data**
- ✅ **Filtered Patient Lists** - Memoize filtered results
- ✅ **Statistics Calculations** - Memoize expensive computations
- ✅ **Chart Data Transformations** - Cache transformed data

**Cache Duration:** Until source data changes
**Storage:** React useMemo

## 📦 Implementation Options

### Option 1: React Query (Recommended)
Best for API response caching with automatic refetching and invalidation.

### Option 2: SWR (Alternative)
Similar to React Query, lighter weight.

### Option 3: Custom Caching Hook
Simple in-memory cache with TTL for basic needs.

### Option 4: Browser Storage
localStorage/sessionStorage for persistent data.

## 🚀 Recommended Implementation

I recommend using **React Query** for API caching. Here's why:
- Automatic background refetching
- Request deduplication
- Smart cache invalidation
- Optimistic updates
- Built-in loading/error states

