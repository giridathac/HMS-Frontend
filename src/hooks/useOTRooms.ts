// Custom hook for OT rooms management logic
import { useState, useEffect, useCallback } from 'react';
import { otRoomsApi, CreateOTRoomDto, UpdateOTRoomDto } from '../api/otRooms';
import { OTRoom } from '../types';

export function useOTRooms() {
  const [otRooms, setOTRooms] = useState<OTRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOTRooms = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await otRoomsApi.getAll();
      setOTRooms(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch OT rooms');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOTRooms();
  }, [fetchOTRooms]);

  const createOTRoom = useCallback(async (data: CreateOTRoomDto) => {
    try {
      setError(null);
      const newOTRoom = await otRoomsApi.create(data);
      setOTRooms(prev => [...prev, newOTRoom]);
      return newOTRoom;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create OT room';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const updateOTRoom = useCallback(async (data: UpdateOTRoomDto) => {
    try {
      setError(null);
      const updatedOTRoom = await otRoomsApi.update(data);
      setOTRooms(prev => prev.map(r => r.id === data.id ? updatedOTRoom : r));
      return updatedOTRoom;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update OT room';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const deleteOTRoom = useCallback(async (id: number) => {
    try {
      setError(null);
      await otRoomsApi.delete(id);
      setOTRooms(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete OT room';
      setError(errorMessage);
      throw err;
    }
  }, []);

  return {
    otRooms,
    loading,
    error,
    fetchOTRooms,
    createOTRoom,
    updateOTRoom,
    deleteOTRoom,
  };
}

