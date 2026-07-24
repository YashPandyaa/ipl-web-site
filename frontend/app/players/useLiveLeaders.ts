'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getWebSocketClient } from '@/lib/ws-client';

export function useLiveLeaders(category: 'batting' | 'bowling' | 'all-rounders', metric: string) {
  const [players, setPlayers] = useState<any[]>([]);

  // Fetch initial data using TanStack Query
  const { data: initialData, isLoading, isError, refetch } = useQuery({
    queryKey: ['leaders', category, metric],
    queryFn: async () => {
      const res = await fetch(`/api/leaders/${category}?metric=${metric}`);
      if (!res.ok) {
        throw new Error('Failed to fetch leaders');
      }
      return res.json();
    }
  });

  // Sync state when new query results arrive
  useEffect(() => {
    if (initialData) {
      setPlayers(initialData);
    }
  }, [initialData]);

  // Subscribe to live WebSocket updates and merge/resort
  useEffect(() => {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080/ws/live-updates';
    const client = getWebSocketClient(wsUrl);
    client.connect();

    const unsubscribe = client.subscribe('STAT_UPDATE', (payload: any) => {
      if (payload.panel === category) {
        setPlayers((prev) => {
          const index = prev.findIndex((p) => p.id === payload.playerId || p.player === payload.playerName);
          if (index === -1) return prev; // Ignore players outside the leaderboard panel

          const updatedList = [...prev];
          
          // Merge stats update payload
          updatedList[index] = {
            ...updatedList[index],
            ...payload.delta,
            isLive: payload.isLiveMatch ?? true
          };

          // Re-sort list based on updated field
          const sortField = metric === 'runs' ? 'runs' : (metric === 'wickets' ? 'wickets' : (metric === 'rating' ? 'score' : metric));
          const isAscending = metric === 'economy' || metric === 'econ';

          updatedList.sort((a, b) => {
            const valA = a[sortField] ?? 0;
            const valB = b[sortField] ?? 0;
            return isAscending ? valA - valB : valB - valA;
          });

          return updatedList;
        });
      }
    });

    return () => {
      unsubscribe();
    };
  }, [category, metric]);

  return {
    players,
    isLoading,
    isError,
    refetch
  };
}
