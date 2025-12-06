// Custom hook for Emergency Bed Slots management logic
import { useState, useEffect, useCallback } from 'react';
import { emergencyBedSlotsApi, CreateEmergencyBedSlotDto, UpdateEmergencyBedSlotDto } from '../api/emergencyBedSlots';
import { EmergencyBedSlot } from '../types';

export function useEmergencyBedSlots(emergencyBedId?: number) {
  const [emergencyBedSlots, setEmergencyBedSlots] = useState<EmergencyBedSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEmergencyBedSlots = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = emergencyBedId !== undefined
        ? await emergencyBedSlotsApi.getByEmergencyBedId(emergencyBedId)
        : await emergencyBedSlotsApi.getAll();
      setEmergencyBedSlots(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch emergency bed slots');
    } finally {
      setLoading(false);
    }
  }, [emergencyBedId]);

  useEffect(() => {
    fetchEmergencyBedSlots();
  }, [fetchEmergencyBedSlots]);

  const createEmergencyBedSlot = useCallback(async (data: CreateEmergencyBedSlotDto) => {
    try {
      setError(null);
      const newSlot = await emergencyBedSlotsApi.create(data);
      setEmergencyBedSlots(prev => [...prev, newSlot]);
      return newSlot;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create emergency bed slot';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const updateEmergencyBedSlot = useCallback(async (data: UpdateEmergencyBedSlotDto) => {
    try {
      setError(null);
      const updatedSlot = await emergencyBedSlotsApi.update(data);
      setEmergencyBedSlots(prev => prev.map(s => s.id === data.id ? updatedSlot : s));
      return updatedSlot;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update emergency bed slot';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const deleteEmergencyBedSlot = useCallback(async (id: number) => {
    try {
      setError(null);
      await emergencyBedSlotsApi.delete(id);
      setEmergencyBedSlots(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete emergency bed slot';
      setError(errorMessage);
      throw err;
    }
  }, []);

  return {
    emergencyBedSlots,
    loading,
    error,
    fetchEmergencyBedSlots,
    createEmergencyBedSlot,
    updateEmergencyBedSlot,
    deleteEmergencyBedSlot,
  };
}
