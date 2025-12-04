// Custom hook for patient management logic
import { useState, useEffect, useCallback } from 'react';
import { patientsApi, CreatePatientDto, UpdatePatientDto } from '../api';
import { Patient } from '../types';

export function usePatients() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPatients = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await patientsApi.getAll();
      setPatients(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch patients');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  const createPatient = useCallback(async (data: CreatePatientDto) => {
    try {
      setError(null);
      const newPatient = await patientsApi.create(data);
      setPatients(prev => [...prev, newPatient]);
      return newPatient;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create patient';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const updatePatient = useCallback(async (data: UpdatePatientDto) => {
    try {
      setError(null);
      const updatedPatient = await patientsApi.update(data);
      setPatients(prev => prev.map(p => p.id === data.id ? updatedPatient : p));
      return updatedPatient;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update patient';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const deletePatient = useCallback(async (id: number) => {
    try {
      setError(null);
      await patientsApi.delete(id);
      setPatients(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete patient';
      setError(errorMessage);
      throw err;
    }
  }, []);

  return {
    patients,
    loading,
    error,
    fetchPatients,
    createPatient,
    updatePatient,
    deletePatient,
  };
}

