import { useState, useEffect, useCallback } from 'react';

const CHECKOUT_API = import.meta.env.VITE_API_URL || 'https://voisbackend-production.up.railway.app';

interface FounderSpotsData {
  remaining: number | null;
  total: number;
  isSoldOut: boolean;
  isLoading: boolean;
  refetch: () => void;
}

export const useFounderSpots = (): FounderSpotsData => {
  const [remaining, setRemaining] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSpots = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${CHECKOUT_API}/api/founders/remaining`);
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setRemaining(data.remaining);
    } catch {
      console.warn('Could not fetch remaining spots');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSpots();
  }, [fetchSpots]);

  return {
    remaining,
    total: 100,
    isSoldOut: remaining === 0,
    isLoading,
    refetch: fetchSpots,
  };
};
