import { useEffect, useState, useRef, useCallback } from 'react';
import { LiveScorecard, OrangeCapStat, PurpleCapStat, StadiumStat } from '../lib/types';

export function useLiveUpdates() {
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'polling' | 'disconnected'>('disconnected');
  const [matchScorecard, setMatchScorecard] = useState<LiveScorecard | null>(null);
  const [liveOrangeCap, setLiveOrangeCap] = useState<OrangeCapStat | null>(null);
  const [livePurpleCap, setLivePurpleCap] = useState<PurpleCapStat | null>(null);
  const [stadiumUpdates, setStadiumUpdates] = useState<Record<string, Partial<StadiumStat>>>({});
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  
  const wsRef = useRef<WebSocket | null>(null);
  const retryCountRef = useRef(0);
  const maxRetries = 5;
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchFallbackData = useCallback(async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://ipl-backend-aw1x.onrender.com'}/api/live/current-match/`);

      if (res.ok) {
        const data = await res.json();
        if (data) {
          setMatchScorecard(data);
          setLastUpdated(new Date());
        }
      }
    } catch (e) {
      console.error('[LiveUpdates] Fallback polling failed:', e);
    }
  }, []);

  const startPolling = useCallback(() => {
    if (pollIntervalRef.current) return;
    console.log('[LiveUpdates] WebSocket offline. Launching fallback HTTP polling every 15s.');
    setConnectionStatus('polling');
    fetchFallbackData();
    pollIntervalRef.current = setInterval(fetchFallbackData, 15000);
  }, [fetchFallbackData]);

  const stopPolling = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  }, []);

  const connectWS = useCallback(() => {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080/ws/live-updates';
    console.log(`[LiveUpdates] Attempting connection to ${wsUrl}`);
    
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('[LiveUpdates] WebSocket connected successfully.');
      setConnectionStatus('connected');
      retryCountRef.current = 0;
      stopPolling();
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        const { type, payload } = msg;
        setLastUpdated(new Date());

        switch (type) {
          case 'INIT_STATE':
            if (payload.currentMatch) setMatchScorecard(payload.currentMatch);
            if (payload.orangeCap) setLiveOrangeCap(payload.orangeCap);
            if (payload.purpleCap) setLivePurpleCap(payload.purpleCap);
            if (payload.stadiumUpdates) setStadiumUpdates(payload.stadiumUpdates);
            break;
          case 'LIVE_SCORE':
            setMatchScorecard(payload);
            break;
          case 'ORANGE_CAP_UPDATE':
            setLiveOrangeCap(payload);
            break;
          case 'PURPLE_CAP_UPDATE':
            setLivePurpleCap(payload);
            break;
          case 'STADIUM_UPDATE':
            setStadiumUpdates(prev => ({
              ...prev,
              [payload.venue]: {
                avgFirstInningsScore: payload.avgFirstInningsScore,
                matchesHosted: payload.matchesHosted
              }
            }));
            break;
          default:
            break;
        }
      } catch (err) {
        console.error('[LiveUpdates] Message parsing failed:', err);
      }
    };

    ws.onerror = (err) => {
      console.error('[LiveUpdates] WebSocket error:', err);
    };

    ws.onclose = () => {
      console.log('[LiveUpdates] WebSocket connection closed.');
      wsRef.current = null;
      
      if (retryCountRef.current < maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, retryCountRef.current), 15000);
        console.log(`[LiveUpdates] Retrying connection in ${delay / 1000}s (Attempt ${retryCountRef.current + 1}/${maxRetries})`);
        retryCountRef.current += 1;
        setTimeout(connectWS, delay);
      } else {
        console.log('[LiveUpdates] Max retries reached. Switching to polling fallback.');
        startPolling();
      }
    };

  }, [stopPolling, startPolling]);

  useEffect(() => {
    connectWS();
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      stopPolling();
    };
  }, [connectWS, stopPolling]);

  const isLive = !!(matchScorecard && matchScorecard.isLive);

  return {
    connectionStatus,
    matchScorecard,
    liveOrangeCap,
    livePurpleCap,
    stadiumUpdates,
    lastUpdated,
    isLive
  };
}
