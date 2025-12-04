// Custom hook for Emergency beds management logic
import { useState, useEffect, useCallback } from 'react';
import { emergencyBedsApi, CreateEmergencyBedDto, UpdateEmergencyBedDto } from '../api/emergencyBeds';
import { EmergencyBed } from '../types';

export function useEmergencyBeds() {
  const [emergencyBeds, setEmergencyBeds] = useState<EmergencyBed[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEmergencyBeds = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await emergencyBedsApi.getAll();
      setEmergencyBeds(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch Emergency beds');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmergencyBeds();
  }, [fetchEmergencyBeds]);

  const createEmergencyBed = useCallback(async (data: CreateEmergencyBedDto) => {
    try {
      setError(null);
      const newEmergencyBed = await emergencyBedsApi.create(data);
      setEmergencyBeds(prev => [...prev, newEmergencyBed]);
      return newEmergencyBed;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create Emergency bed';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const updateEmergencyBed = useCallback(async (data: UpdateEmergencyBedDto) => {
    try {
      setError(null);
      const updatedEmergencyBed = await emergencyBedsApi.update(data);
      setEmergencyBeds(prev => prev.map(b => b.id === data.id ? updatedEmergencyBed : b));
      return updatedEmergencyBed;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update Emergency bed';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const deleteEmergencyBed = useCallback(async (id: number) => {
    try {
      setError(null);
      await emergencyBedsApi.delete(id);
      setEmergencyBeds(prev => prev.filter(b => b.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete Emergency bed';
      setError(errorMessage);
      throw err;
    }
  }, []);

  return {
    emergencyBeds,
    loading,
    error,
    fetchEmergencyBeds,
    createEmergencyBed,
    updateEmergencyBed,
    deleteEmergencyBed,
  };
}

