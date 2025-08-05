import { useState, useCallback } from 'react';
import { API_URL } from '../constants/api';

export const useApi = () => {
  const [loading, setLoading] = useState(false);

  const fetchJson = useCallback(async (endpoint: string, options?: RequestInit) => {
    setLoading(true);
    
    try {
      const res = await fetch(`${API_URL}/api${endpoint}`, options);
      
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`HTTP error! status: ${res.status}, message: ${errorText}`);
      }
      
      const data = await res.json();
      console.log(`Backend response from ${endpoint}:`, data);
      return data;
    } catch (error) {
      console.error(`Error calling ${endpoint}:`, error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    fetchJson
  };
};
