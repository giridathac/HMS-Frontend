// Custom hook for room beds management logic
import { useState, useEffect, useCallback } from 'react';
import { roomBedsApi, CreateRoomBedDto, UpdateRoomBedDto } from '../api/roomBeds';
import { RoomBed } from '../types';

export function useRoomBeds() {
  const [roomBeds, setRoomBeds] = useState<RoomBed[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRoomBeds = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await roomBedsApi.getAll();
      setRoomBeds(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch room beds');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRoomBeds();
  }, [fetchRoomBeds]);

  const createRoomBed = useCallback(async (data: CreateRoomBedDto) => {
    try {
      setError(null);
      const newRoomBed = await roomBedsApi.create(data);
      setRoomBeds(prev => [...prev, newRoomBed]);
      return newRoomBed;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create room bed';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const updateRoomBed = useCallback(async (data: UpdateRoomBedDto) => {
    try {
      setError(null);
      const updatedRoomBed = await roomBedsApi.update(data);
      setRoomBeds(prev => prev.map(r => r.id === data.id ? updatedRoomBed : r));
      return updatedRoomBed;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update room bed';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const deleteRoomBed = useCallback(async (id: number) => {
    try {
      setError(null);
      await roomBedsApi.delete(id);
      setRoomBeds(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete room bed';
      setError(errorMessage);
      throw err;
    }
  }, []);

  return {
    roomBeds,
    loading,
    error,
    fetchRoomBeds,
    createRoomBed,
    updateRoomBed,
    deleteRoomBed,
  };
}

