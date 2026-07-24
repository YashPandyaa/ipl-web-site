'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Download, Loader2, Award, Flame, User, Info } from 'lucide-react';
import RadarChart from '@/components/RadarChart';
import HeatmapGrid from '@/components/HeatmapGrid';
import ShareableCard from '@/components/ShareableCard';

interface ProfileDrawerProps {
  playerId: string | null;
  onClose: () => void;
}

const mapIdToName = (id: string): string => {
  const specialNames: Record<string, string> = {
    'ms_dhoni': 'MS Dhoni',
    'kl_rahul': 'KL Rahul',
    'ys_chahal': 'YS Chahal',
    'ab_de_villiers': 'AB de Villiers',
    'sp_narine': 'SP Narine',
    'ad_russell': 'AD Russell',
    'dj_bravo': 'DJ Bravo',
    'rg_sharma': 'RG Sharma',
    'se_marsh': 'SE Marsh',
    'ut_yadav': 'UT Yadav',
    'da_miller': 'DA Miller',
    'sk_warne': 'SK Warne',
    'b_kumar': 'B Kumar',
    'ar_patel': 'AR Patel',
    'pp_chawla': 'PP Chawla',
    'a_mishra': 'A Mishra',
    'jj_bumrah': 'JJ Bumrah',
    'lh_wright': 'LH Wright',
    'jp_duminy': 'JP Duminy',
    'dpmd_jayawardene': 'DPMD Jayawardene',
    'b_lee': 'B Lee',
    'f_du_plessis': 'F du Plessis',
    'q_de_kock': 'Q de Kock',
    'mp_stoinis': 'MP Stoinis',
    'ba_stokes': 'BA Stokes'
  };

  if (specialNames[id]) return specialNames[id];
  return id
    .split('_')
    .map(p => p.charAt(0).toUpperCase() + p.slice(1))
    .join(' ');
};

export default function ProfileDrawer({ playerId, onClose }: ProfileDrawerProps) {
  const [bioText, setBioText] = useState('');
  const [bioLoading, setBioLoading] = useState(false);
  const streamAbortControllerRef = useRef<AbortController | null>(null);

  const playerName = playerId ? mapIdToName(playerId) : '';

  // 1. Fetch player summary from Django
  const { data: playerData, isLoading: playerLoading } = useQuery({
    queryKey: ['player-detail', playerName],
    queryFn: async () => {
      if (!playerName) return null;
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/api/players/?search=${encodeURIComponent(playerName)}`);
      if (!res.ok) throw new Error('Failed to fetch player details');
      const data = await res.json();
      return (data.results || []).find((p: any) => p.player.toLowerCase() === playerName.toLowerCase()) || data.results?.[0] || null;
    },
    enabled: !!playerName
  });

  // 2. Stream AI Career Biography
  const handleGenerateBio = useCallback(async () => {
    if (!playerId) return;
    
    // Abort previous stream if any
    if (streamAbortControllerRef.current) {
      streamAbortControllerRef.current.abort();
    }

    setBioLoading(true);
    setBioText('');
    const controller = new AbortController();
    streamAbortControllerRef.current = controller;

    try {
      const response = await fetch(`/api/players/${playerId}/bio`, {
        signal: controller.signal
      });
      if (!response.body) throw new Error('Stream response body missing');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      setBioLoading(false);

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        setBioText((prev) => prev + chunk);
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('[Bio Stream Error]', err);
        setBioText('Failed to stream biography. Please try again.');
      }
      setBioLoading(false);
    } finally {
      streamAbortControllerRef.current = null;
    }
  }, [playerId]);

  // Trigger bio stream automatically when player changes
  useEffect(() => {
    if (playerId) {
      handleGenerateBio();
    }
    return () => {
      if (streamAbortControllerRef.current) {
        streamAbortControllerRef.current.abort();
      }
    };
  }, [playerId, handleGenerateBio]);

  return (
    <AnimatePresence>
      {playerId && (
        <>
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/70 z-40"
          />

          {/* Drawer Body Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="fixed top-0 right-0 h-full w-full max-w-[500px] bg-surface-light dark:bg-surface-dark border-l border-border-light dark:border-border-dark shadow-2xl z-50 overflow-y-auto flex flex-col font-sans text-text-primary-light dark:text-text-primary-dark"
          >
            {/* Drawer Header */}
            <div className="flex justify-between items-center p-5 border-b border-border-light dark:border-border-dark sticky top-0 bg-surface-light/95 dark:bg-surface-dark/95 backdrop-blur-md z-30">
              <div>
                <h3 className="text-base font-extrabold uppercase tracking-widest text-brand font-mono">Player Profile Drawer</h3>
                <p className="text-[10px] text-text-secondary-light dark:text-text-secondary-dark font-mono uppercase mt-0.5">IPL Legendary Series · {playerName}</p>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded bg-surface-2 border border-border-light dark:border-border-dark hover:border-slate-400 text-text-secondary-light dark:text-text-secondary-dark hover:text-text-primary-light dark:hover:text-text-primary-dark transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {playerLoading ? (
              <div className="flex-grow flex flex-col items-center justify-center p-8 text-center text-xs text-text-secondary-light dark:text-text-secondary-dark space-y-3 animate-pulse">
                <Loader2 className="w-6 h-6 animate-spin text-brand" />
                <span>Loading Profile Dimensions...</span>
              </div>
            ) : playerData ? (
              <div className="p-5 space-y-6 flex-grow">
                {/* 1. Skill Rating Distribution Radar */}
                <div className="relative overflow-hidden glass-card p-4 rounded-xl">
                  <h4 className="text-[10px] font-extrabold text-text-primary-light dark:text-text-primary-dark uppercase tracking-widest mb-3 border-b border-border-light dark:border-border-dark pb-2">
                    Skill Rating Distribution
                  </h4>
                  <div className="flex items-center justify-center min-h-[300px]">
                    <RadarChart player1={playerData} player1Name={playerName} />
                  </div>
                </div>

                {/* 2. Consistency Heatmap */}
                <div className="relative overflow-hidden glass-card p-4 rounded-xl">
                  <h4 className="text-[10px] font-extrabold text-text-primary-light dark:text-text-primary-dark uppercase tracking-widest mb-3 border-b border-border-light dark:border-border-dark pb-2">
                    Career Consistency Heatmap
                  </h4>
                  <HeatmapGrid playerName={playerName} />
                </div>

                {/* 3. Streaming AI Career Biography */}
                <div className="relative overflow-hidden glass-card p-5 rounded-xl flex flex-col min-h-[250px]">
                  <div className="flex items-center justify-between border-b border-border-light dark:border-border-dark pb-2 mb-3">
                    <h4 className="text-[10px] font-extrabold text-text-primary-light dark:text-text-primary-dark uppercase tracking-widest flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-brand animate-pulse" />
                      AI biography generator
                    </h4>
                    <button
                      onClick={handleGenerateBio}
                      disabled={bioLoading}
                      className="text-[9px] font-mono text-brand hover:text-white bg-brand/10 hover:bg-brand/20 border border-brand/20 px-2 py-0.5 rounded cursor-pointer transition-colors"
                    >
                      Regenerate
                    </button>
                  </div>
                  
                  {bioLoading ? (
                    <div className="flex-grow flex items-center justify-center py-8">
                      <Loader2 className="w-5 h-5 animate-spin text-brand mr-2" />
                      <span className="text-[10px] text-text-secondary-light dark:text-text-secondary-dark font-mono uppercase">Drafting Biography...</span>
                    </div>
                  ) : (
                    <div className="bg-surface-2 p-4 rounded-lg border border-border-light dark:border-border-dark text-xs text-text-secondary-light dark:text-text-secondary-dark leading-relaxed whitespace-pre-line font-sans flex-grow max-h-60 overflow-y-auto selection:bg-brand/20 selection:text-white">
                      {bioText || 'Click Regenerate to draft biography.'}
                    </div>
                  )}
                </div>

                {/* 4. Export Printable Player Card */}
                <div className="relative overflow-hidden glass-card p-6 rounded-xl flex flex-col items-center justify-center gap-4">
                  <h4 className="text-[10px] font-extrabold text-text-primary-light dark:text-text-primary-dark uppercase tracking-widest border-b border-border-light dark:border-border-dark pb-2 mb-1 w-full text-center">
                    Printable Player Card
                  </h4>
                  <ShareableCard player={playerData} />
                </div>
              </div>
            ) : (
              <div className="flex-grow flex flex-col items-center justify-center p-8 text-center text-xs text-text-secondary-light dark:text-text-secondary-dark space-y-2">
                <Info className="w-6 h-6 text-brand/60" />
                <span>Player statistics data not found in DB records.</span>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
